/**
 * Hushållstavlan – koppling mellan appen och kalkylarket.
 *
 * Kör funktionen `setup` en gång efter att du klistrat in koden (och efter varje uppdatering).
 * Den skapar hushållskoden, notisämnet och tidsstyrningen för notiserna och kalendersynken.
 * Hushållskoden och notisämnet behålls om de redan finns.
 * Publicera sedan som webbapp: Distribuera → Ny distribution → Webbapp,
 * "Kör som: Jag", "Vem har åtkomst: Alla".
 *
 * Efter en uppdatering: kör `godkannDrive` en gång (för matbilderna), och
 * publicera sedan en ny version under Distribuera → Hantera distributioner.
 */

const TZ = 'Europe/Stockholm';
// Appens adress på GitHub Pages. Notiser och widgeten öppnar den när man trycker på dem.
const APP_URL = 'https://henriklh.github.io/hushallstavlan/';
// Mapp på Drive där matbilder från receptbanken sparas
const PHOTO_FOLDER = 'Hushållstavlan – matbilder';

const TABS = {
  shop: 'Inköp', tasks: 'Uppgifter', clean: 'Städ', menu: 'Matsedel',
  events: 'Händelser', recipes: 'Recept', offers: 'Erbjudanden', settings: 'Inställningar'
};
const COLS = {
  shop: ['done', 'name', 'qty', 'cat', 'meals', 'price', 'offer', 'store', 'id', 'source', 'addedBy', 'order'],
  tasks: ['done', 'title', 'due', 'who', 'note', 'id', 'source', 'repeat'],
  clean: ['id', 'room', 'title', 'freq', 'min', 'lastDone', 'prevDone', 'doneBy', 'who', 'tip', 'plannedFor', 'snoozeUntil', 'order'],
  menu: ['date', 'who', 'title', 'recipe', 'addon', 'note'],
  events: ['date', 'time', 'title', 'who', 'source', 'id', 'flags'],
  recipes: ['id', 'group', 'who', 'when', 'title', 'portions', 'min', 'kr', 'protein', 'freezes', 'course', 'why', 'ingredients', 'steps', 'tips'],
  offers: ['item', 'price', 'store', 'note']
};
const BOOL = { done: true };
const NUM = { price: true, order: true, freq: true, min: true, portions: true, kr: true };
const SETTING_KEYS_WRITABLE = ['personer', 'stadtid_vardag', 'stadtid_helg', 'stadtid_idag', 'matbudget',
  'ekonomi', 'ekonomi_inkomst', 'betyg', 'onskelista', 'pref_henrik', 'pref_veg', 'pref_ekonomi', 'pref_ovrigt', 'frekvens'];
// receptbank_1, receptbank_2 … får också skrivas från appen
function settingWritable_(k) { return SETTING_KEYS_WRITABLE.indexOf(k) >= 0 || /^receptbank_\d{1,2}$/.test(String(k)); }

/* ---------------- helpers ---------------- */
function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function nowHM_() { return Utilities.formatDate(new Date(), TZ, 'HH:mm'); }
function addDays_(s, n) { const p = s.split('-').map(Number); const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)); return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd'); }
function dow_(s) { const p = s.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
function props_() { return PropertiesService.getScriptProperties(); }
function sheet_(key) { return SpreadsheetApp.getActive().getSheetByName(TABS[key]); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function readTab_(key) {
  const sh = sheet_(key);
  const rng = sh.getDataRange();
  const raw = rng.getValues(), disp = rng.getDisplayValues();
  const cols = COLS[key], out = [];
  for (let r = 1; r < raw.length; r++) {
    if (disp[r].every(function (c) { return c === ''; })) continue;
    const o = { _row: r + 1 };
    cols.forEach(function (c, i) {
      if (BOOL[c]) o[c] = raw[r][i] === true;
      else if (NUM[c]) o[c] = raw[r][i] === '' ? null : Number(raw[r][i]);
      else o[c] = String(disp[r][i] || '');
    });
    if (key === 'shop') o.meals = o.meals ? o.meals.split(',').map(function (s) { return s.trim(); }).filter(String) : [];
    out.push(o);
  }
  return out;
}
function readSettings_() {
  const v = sheet_('settings').getDataRange().getDisplayValues(), s = {};
  for (let r = 1; r < v.length; r++) if (v[r][0]) s[v[r][0]] = v[r][1];
  return s;
}
function writeSetting_(k, val) {
  const sh = sheet_('settings'), v = sh.getDataRange().getDisplayValues();
  for (let r = 1; r < v.length; r++) if (v[r][0] === k) { sh.getRange(r + 1, 2).setValue(String(val)); return; }
  sh.appendRow([k, String(val), '']);
}
function findRow_(key, id) {
  const sh = sheet_(key), idCol = COLS[key].indexOf('id') + 1;
  const ids = sh.getRange(1, idCol, sh.getLastRow(), 1).getDisplayValues();
  for (let r = 1; r < ids.length; r++) if (ids[r][0] === id) return r + 1;
  throw new Error('Hittade inte raden ' + id);
}
function setCells_(key, row, fields) {
  const sh = sheet_(key);
  Object.keys(fields).forEach(function (f) {
    const c = COLS[key].indexOf(f);
    if (c < 0) throw new Error('Okänt fält ' + f);
    sh.getRange(row, c + 1).setValue(fields[f] === null ? '' : fields[f]);
  });
}
function newId_(prefix) { return prefix + Utilities.getUuid().slice(0, 8); }

function parseRecipe_(r) {
  const groups = [];
  let cur = { title: '', items: [] };
  String(r.ingredients || '').split('\n').forEach(function (line) {
    line = line.trim();
    if (!line) return;
    if (line.charAt(0) === '#') { if (cur.items.length || cur.title) groups.push(cur); cur = { title: line.replace(/^#+\s*/, ''), items: [] }; return; }
    const p = line.split('|').map(function (s) { return s.trim(); });
    if (p.length >= 3) {
      const q = p[0] === '' ? null : Number(p[0].replace(',', '.'));
      cur.items.push({ q: isNaN(q) ? null : q, u: p[1], n: p.slice(2).join(' | ') });
    } else cur.items.push({ q: null, u: '', n: line });
  });
  if (cur.items.length || cur.title) groups.push(cur);
  const steps = String(r.steps || '').split('\n').map(function (s) { return s.trim(); }).filter(String).map(function (s) {
    const m = s.match(/^\[(\d+)\]\s*(.*)$/);
    return m ? { t: m[2], timer: Number(m[1]) } : { t: s };
  });
  return {
    id: r.id, group: r.group, who: r.who, when: r.when, title: r.title, portions: r.portions || 1, min: r.min || 0, kr: r.kr,
    protein: r.protein, freezes: /^(ja|true|x)$/i.test(r.freezes), course: r.course, why: r.why, groups: groups, steps: steps, tips: r.tips
  };
}

function strip_(rows) { return rows.map(function (o) { const c = Object.assign({}, o); delete c._row; return c; }); }

function allData_() {
  return {
    today: today_(),
    serverTime: new Date().toISOString(),
    settings: readSettings_(),
    shop: strip_(readTab_('shop')),
    tasks: strip_(readTab_('tasks')),
    clean: strip_(readTab_('clean')),
    menu: strip_(readTab_('menu')),
    events: strip_(readTab_('events')),
    offers: strip_(readTab_('offers')),
    recipes: readTab_('recipes').map(parseRecipe_),
    ntfyTopic: props_().getProperty('NTFY_TOPIC') || ''
  };
}

/* ---------------- matbilder ---------------- */
// Sparar en bild (base64 från appen) i Drive-mappen och returnerar en adress som går att visa i appen.
function savePhoto_(b) {
  const m = String(b.data || '').match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
  if (!m) throw new Error('Bilden kunde inte läsas.');
  const bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > 4 * 1024 * 1024) throw new Error('Bilden är för stor.');
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  const name = String(b.id || 'recept').replace(/[^\w-]/g, '') + '-' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd-HHmmss') + '.' + (m[2] === 'jpeg' ? 'jpg' : m[2]);
  const file = folder.createFile(Utilities.newBlob(bytes, m[1], name));
  file.setDescription(String(b.title || '').slice(0, 200));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200';
}

/* ---------------- cleaning plan (same logic as the app) ---------------- */
function cleanPlan_(clean, settings, td) {
  const daysSince = function (s) { if (!s) return 999; return Math.round((Date.parse(td) - Date.parse(s)) / 864e5); };
  const ratio = function (t) { return daysSince(t.lastDone) / (t.freq || 7); };
  const doneToday = function (t) { return t.lastDone === td; };
  const snoozed = function (t) { return t.snoozeUntil && t.snoozeUntil > td; };
  const planned = function (t) { return t.plannedFor && t.plannedFor <= td; };
  let B;
  const bi = String(settings.stadtid_idag || '').split('|');
  if (bi[0] === td && bi[1]) B = Number(bi[1]);
  else { const wd = dow_(td); B = (wd === 0 || wd === 6) ? Number(settings.stadtid_helg || 40) : Number(settings.stadtid_vardag || 20); }
  const routines = clean.filter(function (t) { return t.freq <= 1; });
  const rot = clean.filter(function (t) { return t.freq > 1; });
  const doneRot = rot.filter(doneToday);
  const plan = rot.filter(function (t) { return planned(t) && !doneToday(t); });
  const cand = rot.filter(function (t) { return !doneToday(t) && !snoozed(t) && !planned(t) && t.freq < 30 && ratio(t) >= 1; })
    .sort(function (a, b) { return ratio(b) - ratio(a) || a.min - b.min; });
  let used = doneRot.concat(plan).reduce(function (s, t) { return s + t.min; }, 0);
  const picks = [];
  cand.forEach(function (c) { if (used + c.min <= B || (used === 0 && !picks.length && c.min <= B * 1.5)) { picks.push(c); used += c.min; } });
  const todo = plan.concat(picks);
  const rLeft = routines.filter(function (t) { return !doneToday(t); });
  return {
    budget: B, routines: routines, routinesLeft: rLeft, todo: todo, doneRot: doneRot,
    done: routines.length - rLeft.length + doneRot.length,
    total: routines.length + doneRot.length + todo.length,
    minLeft: todo.concat(rLeft).reduce(function (s, t) { return s + t.min; }, 0)
  };
}

/* ---------------- widget summary ---------------- */
function startTime_(t) { const m = String(t || '').match(/^(\d{1,2})[.:](\d{2})/); return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : ''; }
function widgetData_() {
  const td = today_(), now = nowHM_();
  const settings = readSettings_();
  const menu = readTab_('menu'), events = readTab_('events'), shop = readTab_('shop'), clean = readTab_('clean'), tasks = readTab_('tasks');
  let mealDay = td, meals = menu.filter(function (m) { return m.date === td; });
  if (!meals.length) {
    const next = menu.filter(function (m) { return m.date > td; }).map(function (m) { return m.date; }).sort()[0];
    if (next) { mealDay = next; meals = menu.filter(function (m) { return m.date === next; }); }
  }
  const left = shop.filter(function (i) { return !i.done; });
  const cp = cleanPlan_(clean, settings, td);
  // nästa händelse: idag efter nu, annars första kommande dag
  const upcoming = events.filter(function (e) { return e.date > td || (e.date === td && startTime_(e.time) && startTime_(e.time) >= now); })
    .sort(function (a, b) { return (a.date + startTime_(a.time)).localeCompare(b.date + startTime_(b.time)); });
  const dueTask = tasks.filter(function (t) { return !t.done && t.due && t.due >= td; }).sort(function (a, b) { return a.due.localeCompare(b.due); })[0];
  let next = upcoming[0] ? { date: upcoming[0].date, time: startTime_(upcoming[0].time), title: upcoming[0].title } : null;
  if (dueTask && (!next || dueTask.due < next.date)) next = { date: dueTask.due, time: '', title: dueTask.title };
  return {
    today: td, mealDay: mealDay,
    meals: meals.map(function (m) { return { who: m.who, title: m.title, addon: m.addon }; }),
    shopLeft: left.length, shopCost: Math.round(left.reduce(function (s, i) { return s + (i.price || 0); }, 0)),
    clean: { done: cp.done, total: cp.total, minLeft: cp.minLeft, next: cp.routinesLeft.concat(cp.todo).slice(0, 3).map(function (t) { return t.title; }) },
    next: next,
    appUrl: APP_URL
  };
}

/* ---------------- web endpoints ---------------- */
function checkKey_(k) {
  const key = props_().getProperty('HOUSEHOLD_KEY');
  if (!key) throw new Error('Kör funktionen setup först.');
  if (String(k || '').trim().toLowerCase() !== key) throw new Error('Fel hushållskod.');
}

function doGet(e) {
  try {
    checkKey_(e.parameter.key);
    if (e.parameter.action === 'widget') return json_({ ok: true, data: widgetData_() });
    return json_({ ok: true, data: allData_() });
  } catch (err) { return json_({ ok: false, error: String(err.message || err) }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const b = JSON.parse(e.postData.contents || '{}');
    checkKey_(b.key);
    // Bilduppladdning behöver inget lås och svarar med bildens adress
    if (b.action === 'photoUpload') return json_({ ok: true, url: savePhoto_(b) });
    lock.waitLock(20000);
    const by = String(b.by || '');
    switch (b.action) {
      case 'shopToggle': setCells_('shop', findRow_('shop', b.id), { done: !!b.done }); break;
      case 'shopAdd': {
        const price = b.price === '' || b.price == null ? '' : Number(b.price);
        sheet_('shop').appendRow([false, String(b.name || '').slice(0, 120), String(b.qty || ''), String(b.cat || 'Övrigt'), '', price, '', '', newId_('m'), 'egen', by, 1000]);
        break;
      }
      case 'shopClearDone': deleteDone_('shop'); break;
      case 'shopDelete': { let r = 0; try { r = findRow_('shop', String(b.id || '')); } catch (err) {} if (r) sheet_('shop').deleteRow(r); break; }
      case 'taskToggle': {
        const row = findRow_('tasks', b.id);
        const t = readTab_('tasks').filter(function (x) { return x.id === b.id; })[0];
        // En återkommande uppgift blir aldrig klar, den flyttas till nästa gång
        if (b.done && t && REPEATS_[t.repeat]) setCells_('tasks', row, { due: nextDue_(t.due, t.repeat, today_()), done: false });
        else setCells_('tasks', row, { done: !!b.done });
        break;
      }
      case 'taskAdd': {
        const sh = sheet_('tasks'), rep = REPEATS_[b.repeat] ? b.repeat : '';
        const due = String(b.due || '') || (rep ? today_() : '');
        sh.appendRow([false, String(b.title || '').slice(0, 200), due, String(b.who || ''), '', newId_('m'), 'egen', rep]);
        break;
      }
      case 'taskClearDone': deleteDone_('tasks'); break;
      case 'taskEdit': {
        const f = b.fields || {}, out = {};
        if (f.title != null) out.title = String(f.title).slice(0, 200);
        if (f.due != null) out.due = /^\d{4}-\d{2}-\d{2}$/.test(String(f.due)) ? String(f.due) : '';
        if (f.who != null) out.who = String(f.who).slice(0, 40);
        if (f.repeat != null) out.repeat = REPEATS_[f.repeat] ? f.repeat : '';
        if (out.repeat && !out.due) out.due = today_();
        setCells_('tasks', findRow_('tasks', b.id), out);
        break;
      }
      case 'taskDelete': sheet_('tasks').deleteRow(findRow_('tasks', b.id)); break;
      case 'eventEdit': eventEdit_(b, false); break;
      case 'eventDelete': eventEdit_(b, true); break;
      case 'cleanDone': {
        const row = findRow_('clean', b.id);
        const t = readTab_('clean').filter(function (x) { return x.id === b.id; })[0];
        setCells_('clean', row, { prevDone: t.lastDone, lastDone: today_(), doneBy: by, plannedFor: '', snoozeUntil: '' });
        break;
      }
      case 'cleanUndo': {
        const row = findRow_('clean', b.id);
        const t = readTab_('clean').filter(function (x) { return x.id === b.id; })[0];
        setCells_('clean', row, { lastDone: t.prevDone, prevDone: '', doneBy: '' });
        break;
      }
      case 'cleanSet': {
        const allowed = ['freq', 'who', 'plannedFor', 'snoozeUntil'], f = {};
        Object.keys(b.fields || {}).forEach(function (k) { if (allowed.indexOf(k) >= 0) f[k] = b.fields[k]; });
        setCells_('clean', findRow_('clean', b.id), f);
        break;
      }
      case 'menuSwap': menuSwap_(b, by); break;
      case 'planSend': planSend_(b, by); break;
      case 'setting':
        if (!settingWritable_(b.k)) throw new Error('Inställningen kan inte ändras från appen.');
        if (String(b.v).length > 49000) throw new Error('Värdet är för långt för en cell.');
        writeSetting_(b.k, b.v);
        break;
      default: throw new Error('Okänd åtgärd.');
    }
    SpreadsheetApp.flush();
    return json_({ ok: true, data: allData_() });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) { }
  }
}

/* ---------------- återkommande uppgifter ----------------
   Kolumn H (Upprepa) i Uppgifter: dag, vecka, 2veckor, 4veckor, manad eller ar. När en sådan uppgift bockas av
   flyttas datumet fram till nästa gång efter i dag, och uppgiften ligger kvar som ej klar.
   Samma uträkning finns i app.js (nextDue). */
const REPEATS_ = { dag: 1, vecka: 7, '2veckor': 14, '4veckor': 28, manad: 'm', ar: 'y' };
function nextDue_(due, rep, td) {
  let d = /^\d{4}-\d{2}-\d{2}$/.test(String(due)) ? String(due) : td;
  const step = REPEATS_[rep], anchor = Number(d.slice(8, 10));
  // minst ett steg fram, och sedan tills datumet ligger efter i dag
  for (let i = 0; i < 1000 && (i === 0 || d <= td); i++) {
    if (typeof step === 'number') d = addDays_(d, step);
    else {
      const p = d.split('-').map(Number);
      const y = step === 'y' ? p[0] + 1 : p[0] + (p[1] === 12 ? 1 : 0), m = step === 'y' ? p[1] : (p[1] % 12) + 1;
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      d = y + '-' + ('0' + m).slice(-2) + '-' + ('0' + Math.min(anchor, last)).slice(-2);
    }
  }
  return d;
}

function deleteDone_(key) {
  const sh = sheet_(key), rows = readTab_(key).filter(function (o) { return o.done; }).map(function (o) { return o._row; });
  rows.sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
}

/* ---------------- byta rätt på veckans matsedel ---------------- */
const DAYS3_ = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
// Samma etiketter som veckoplaneringen skriver i Inköp, kolumnen Till rätt
function mealLabel_(m, group) {
  const veg = m.who === 'Vegetariskt';
  if (group === 'Storkok' || /^storkok/i.test(m.title)) return 'Storkok ' + (veg ? 'veg' : 'kött');
  const d = DAYS3_[dow_(m.date)];
  // Gemensam mat måndag–torsdag är vardagsmiddag, fredag–söndag helgmat
  if (m.who === 'Gemensam') { const w = dow_(m.date); return w >= 1 && w <= 4 ? d + ' middag' : 'Helg (' + d.toLowerCase() + ')'; }
  return d + ' ' + (veg ? 'veg' : 'kött');
}
function catOf_(n) {
  n = String(n).toLowerCase();
  if (/kyckling|fläsk|nöt|färs|korv|bacon|lax|torsk|sej|fisk|räk|kalkon|lamm|skinka/.test(n)) return 'Kött & fisk';
  if (/mjölk|grädde|kvarg|yoghurt|ost|smör|ägg|keso|crème|fraiche|feta|halloumi/.test(n)) return 'Mejeri & ägg';
  if (/fryst|frysta/.test(n)) return 'Frys';
  if (/bröd|tortilla|pita|bulle/.test(n)) return 'Bröd';
  if (/lök|vitlök|morot|potatis|tomat|gurka|paprika|sallad|spenat|kål|broccoli|zucchini|aubergine|svamp|champinjon|citron|lime|äpple|banan|bär|ingefära|persilja|koriander|dill|basilika|purjo|selleri|rödbet|squash|avokado|pumpa|majs/.test(n)) return 'Frukt & grönt';
  if (/pasta|ris|bulgur|matvete|linser|bönor|kikärt|mjöl|havre|nötter|frön|olja|buljong|krossade|konserv|socker|kryddor|spiskummin|gurkmeja|paprikapulver|curry|soja|vinäger|honung|quinoa|couscous/.test(n)) return 'Torrvaror';
  return 'Övrigt';
}
function recipeRow_(r) {
  const S = function (v, n) { return String(v == null ? '' : v).slice(0, n || 200); };
  const ing = (r.groups || []).map(function (g) {
    return (g.title ? '# ' + S(g.title) + '\n' : '') + (g.items || []).map(function (i) {
      return (i.q == null ? '' : String(i.q).replace('.', ',')) + ' | ' + S(i.u, 30) + ' | ' + S(i.n);
    }).join('\n');
  }).join('\n');
  const steps = (r.steps || []).map(function (x) { return (x.timer ? '[' + Number(x.timer) + '] ' : '') + S(x.t, 1000); }).join('\n');
  return [r.id, S(r.group, 30), S(r.who, 30), 'Bytt i appen', S(r.title), Number(r.portions) || '', Number(r.min) || '', Number(r.kr) || '',
    S(r.protein, 60), r.freezes ? 'ja' : '', S(r.course, 30), S(r.why, 1000), ing.slice(0, 30000), steps.slice(0, 30000), S(r.tips, 2000)];
}
/** Byter (eller tar bort) en rätt på matsedeln och uppdaterar inköpslistan.
 *  b: { date, who, title, recipe (gamla receptets id eller ''), rec (nya receptet, eller null för att bara ta bort) } */
function menuSwap_(b, by) {
  const menu = readTab_('menu'), recipes = readTab_('recipes');
  const groupOf = function (id) { const r = recipes.filter(function (x) { return x.id === id; })[0]; return r ? r.group : ''; };
  const targets = menu.filter(function (m) {
    return b.recipe ? m.recipe === b.recipe : (m.date === b.date && m.who === b.who && m.title === b.title);
  });
  if (!targets.length) throw new Error('Hittade inte rätten på matsedeln. Uppdatera appen och försök igen.');
  const labels = [];
  targets.forEach(function (m) { const l = mealLabel_(m, groupOf(m.recipe)); if (labels.indexOf(l) < 0) labels.push(l); });
  const rec = b.rec;
  if (rec) {
    if (!/^[a-z0-9-]{1,60}$/.test(String(rec.id || ''))) throw new Error('Receptet har ett ogiltigt id.');
    if (!recipes.some(function (x) { return x.id === rec.id; })) sheet_('recipes').appendRow(recipeRow_(rec));
  }
  targets.forEach(function (m) {
    setCells_('menu', m._row, rec ? { title: String(rec.title).slice(0, 200), recipe: rec.id, addon: '', note: 'Bytt i appen av ' + (by || 'någon') }
      : { title: 'Fritt val', recipe: '', addon: '', note: 'Borttagen i appen av ' + (by || 'någon') });
  });
  // Inköp: ta bort det som bara behövdes till den gamla rätten
  const sh = sheet_('shop'), del = [];
  readTab_('shop').forEach(function (i) {
    if (i.done || (i.source !== 'veckoplan' && i.source !== 'byte')) return;
    const keep = i.meals.filter(function (x) { return labels.indexOf(x) < 0; });
    if (keep.length === i.meals.length) return;
    if (keep.length) setCells_('shop', i._row, { meals: keep.join(', ') }); else del.push(i._row);
  });
  del.sort(function (a, c) { return c - a; }).forEach(function (r) { sh.deleteRow(r); });
  if (rec) (rec.groups || []).forEach(function (g) {
    (g.items || []).forEach(function (i) {
      if (i.q == null || !i.n) return;
      sh.appendRow([false, String(i.n).slice(0, 120), (String(i.q).replace('.', ',') + ' ' + (i.u || '')).trim(), catOf_(i.n), labels[0], '', '', '', newId_('b'), 'byte', by, 900]);
    });
  });
}

/** Veckoplaneringen i appen: lägger veckans rätter på Matsedel och varorna i Inköp.
 *  b: { start, end, menu: [{date, who, title, recipe, addon, note}], shop: [{name, qty, price, meals: []}],
 *       recipes: [recept som saknas i Recept], lager: {vara: mängd}, settings: {vecka_start, vecka_slut, vecka_rubrik, storkok, storkok_not} }
 *  Skickas veckan igen ersätts det som skickades förra gången. */
function planSend_(b, by) {
  const isD = function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(String(x)); };
  const S = function (v, n) { return String(v == null ? '' : v).slice(0, n || 200); };
  if (!isD(b.start) || !isD(b.end) || b.end < b.start || b.end > addDays_(b.start, 13)) throw new Error('Veckan har ogiltiga datum.');
  const menu = (b.menu || []).slice(0, 30), shop = (b.shop || []).slice(0, 120), recs = (b.recipes || []).slice(0, 12);
  if (!menu.length) throw new Error('Veckan har inga rätter.');
  menu.forEach(function (m) { if (!isD(m.date) || m.date < b.start || m.date > b.end) throw new Error('En rätt ligger utanför veckan.'); });
  // Recept som kommer från inspirationen eller receptbanken och saknas i fliken Recept
  const have = readTab_('recipes').map(function (r) { return r.id; });
  recs.forEach(function (r) {
    if (!/^[a-z0-9-]{1,60}$/.test(String(r.id || ''))) throw new Error('Ett recept har ett ogiltigt id.');
    if (have.indexOf(r.id) < 0) { sheet_('recipes').appendRow(recipeRow_(r)); have.push(r.id); }
  });
  // Matsedel: ta bort gamla rader (före i går) och det som redan ligger i den nya veckan, lägg sedan till veckan
  const msh = sheet_('menu'), y = addDays_(today_(), -1);
  readTab_('menu').filter(function (m) { return !isD(m.date) || m.date < y || (m.date >= b.start && m.date <= b.end); })
    .map(function (m) { return m._row; }).sort(function (a, c) { return c - a; }).forEach(function (r) { msh.deleteRow(r); });
  menu.forEach(function (m) {
    msh.appendRow([m.date, S(m.who, 30), S(m.title), S(m.recipe, 60), S(m.addon), S(m.note)]);
  });
  // Inköp: töm listan på allt utom det ni själva har lagt till och inte köpt än, lägg sedan till veckans varor
  const tag = 'plan' + b.start.replace(/-/g, ''), ssh = sheet_('shop');
  readTab_('shop').filter(function (i) { return i.done || i.source !== 'egen'; })
    .map(function (i) { return i._row; }).sort(function (a, c) { return c - a; }).forEach(function (r) { ssh.deleteRow(r); });
  shop.forEach(function (i, n) {
    if (!i.name) return;
    const price = Number(i.price);
    ssh.appendRow([false, S(i.name, 120), S(i.qty, 60), catOf_(i.name), (i.meals || []).map(function (x) { return S(x, 40); }).join(', '),
      isFinite(price) && price > 0 ? Math.round(price) : '', '', '', tag + '-' + n, 'veckoplan', by, 800 + n]);
  });
  const st = b.settings || {};
  ['vecka_start', 'vecka_slut', 'vecka_rubrik', 'storkok', 'storkok_not'].forEach(function (k) { if (st[k] != null) writeSetting_(k, S(st[k], 500)); });
  writeSetting_('uppdaterad', today_());
  // Det som blir över av förpackningarna (finns hemma nästa vecka)
  const lager = {};
  Object.keys(b.lager || {}).slice(0, 200).forEach(function (k) { const v = Number(b.lager[k]); if (isFinite(v) && v > 0) lager[S(k, 60)] = Math.round(v); });
  writeSetting_('lager', JSON.stringify(lager));
}

/* ---------------- notifications (ntfy) ---------------- */
function ntfy_(title, message, tags) {
  const topic = props_().getProperty('NTFY_TOPIC');
  if (!topic) return;
  const body = { topic: topic, title: title, message: message, tags: tags || [] };
  if (APP_URL) body.click = APP_URL;
  UrlFetchApp.fetch('https://ntfy.sh/', { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
}

function notifyTick() {
  const td = today_(), now = nowHM_(), p = props_();
  const settings = readSettings_();

  // Dagens städpass
  if (now >= (settings.notis_stad || '07:30') && p.getProperty('SENT_STAD') !== td) {
    const cp = cleanPlan_(readTab_('clean'), settings, td);
    const lines = [];
    if (cp.routinesLeft.length) lines.push('Dagliga rutiner: ' + cp.routinesLeft.length + ' st');
    cp.todo.forEach(function (t) { lines.push('• ' + t.title + ' (' + t.min + ' min)'); });
    if (lines.length) ntfy_('Dagens städ, ca ' + cp.minLeft + ' min', lines.join('\n'), ['broom']);
    p.setProperty('SENT_STAD', td);
  }

  // Dagens uppgifter och födelsedagar
  if (now >= (settings.notis_uppgifter || '08:00') && p.getProperty('SENT_TASKS') !== td) {
    const tasks = readTab_('tasks').filter(function (t) { return !t.done && t.due; });
    const dueToday = tasks.filter(function (t) { return t.due === td; });
    const late = tasks.filter(function (t) { return t.due < td; });
    const tomorrow = addDays_(td, 1);
    const ev = readTab_('events');
    const bdToday = ev.filter(function (e) { return e.date === td && /fyller/i.test(e.title); });
    const bdTomorrow = ev.filter(function (e) { return e.date === tomorrow && /fyller/i.test(e.title); });
    const lines = [];
    bdToday.forEach(function (e) { lines.push('🎂 Idag: ' + e.title); });
    dueToday.forEach(function (t) { lines.push('• ' + t.title + (t.who ? ' (' + t.who + ')' : '')); });
    if (late.length) lines.push(late.length + ' försenade uppgifter');
    bdTomorrow.forEach(function (e) { lines.push('I morgon: ' + e.title); });
    if (lines.length) ntfy_('Att göra idag', lines.join('\n'), ['white_check_mark']);
    p.setProperty('SENT_TASKS', td);
  }

  // Ny veckoplan (rutinen skriver "uppdaterad" i Inställningar)
  if (settings.uppdaterad && settings.uppdaterad !== (settings.notis_veckoplan_skickad || '')) {
    const shop = readTab_('shop').filter(function (i) { return !i.done; });
    const cost = Math.round(shop.reduce(function (s, i) { return s + (i.price || 0); }, 0));
    ntfy_('Veckoplanen är klar', (settings.vecka_rubrik || '') + '\nInköpslistan: ' + shop.length + ' varor, ca ' + cost + ' kr', ['calendar']);
    writeSetting_('notis_veckoplan_skickad', settings.uppdaterad);
  }
}

/* ---------------- kalendersynk ----------------
   Läser Google Kalender direkt (ingen AI) var 15:e minut och skriver fliken Händelser.
   Rader med annan Källa än "kalender" (t.ex. veckoplan eller inskrivna för hand) behålls.
   En gång om dagen byggs också födelsedagslistan (raden fodelsedagar i Inställningar). */
const CALENDARS = [
  { id: 'henrik.lund.hellstrand.2@gmail.com', who: 'Henrik' },
  { id: 'family15823199462493017779@group.calendar.google.com', who: '' },
  { id: 'sv.swedish#holiday@group.v.calendar.google.com', who: 'Båda' }
];
const CAL_DAYS = 31;
// Vem en händelse i en gemensam kalender gäller, efter vem som skapade den
const CREATORS = { 'henrik.lund.hellstrand.2@gmail.com': 'Henrik', 'cornelia.bomsjo@gmail.com': 'Cornelia' };

function day_(s) { return Utilities.parseDate(s, TZ, 'yyyy-MM-dd'); }
function cal_(id) { try { return CalendarApp.getCalendarById(id); } catch (e) { return null; } }
function calTitle_(t, ev, date) {
  t = String(t || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  if (/^arbetstid$/i.test(t)) return 'Henrik jobbar';
  let m = t.match(/^(.+?),\s*född\s+(\d{4})$/i);
  if (m) return m[1] + ' fyller ' + (Number(date.slice(0, 4)) - Number(m[2])) + ' år';
  m = t.match(/^Födelsedag för (.+)$/i);
  if (m) return m[1] + ' fyller år';
  // klockslag i titeln: "kl.11", "kl. 13:00", "9-12" sist i titeln
  t = t.replace(/\s*\bkl\.?\s*\d{1,2}([.:]\d{2})?(\s*[-–]\s*\d{1,2}([.:]\d{2})?)?/gi, '')
    .replace(/\s+\d{1,2}([.:]\d{2})?\s*[-–]\s*\d{1,2}([.:]\d{2})?$/, '').trim();
  return t;
}
// "kl. 13:00" i en heldagshändelse blir tiden
function timeInTitle_(t) {
  const m = String(t || '').match(/\bkl\.?\s*(\d{1,2})(?:[.:](\d{2}))?/i);
  return m ? ('0' + m[1]).slice(-2) + '.' + (m[2] || '00') : '';
}
function calRows_() {
  const td = today_(), from = day_(td), to = day_(addDays_(td, CAL_DAYS));
  const fmt = function (d, f) { return Utilities.formatDate(d, TZ, f); };
  const rows = [], seen = {};
  let found = 0;
  CALENDARS.forEach(function (c, ci) {
    const cal = cal_(c.id);
    if (!cal) return;
    found++;
    // Helgdagar och födelsedagar från kontakterna går inte att ändra från appen (de får inget id)
    const ro = c.id.indexOf('#holiday@') >= 0;
    cal.getEvents(from, to).forEach(function (ev) {
      let ty = '';
      try { if (ev.getMyStatus() === CalendarApp.GuestStatus.NO) return; } catch (e) { }
      try { ty = String(ev.getEventType()); if (ty === 'WORKING_LOCATION') return; } catch (e) { }
      const id = ro || ty === 'BIRTHDAY' ? '' : ci + '|' + ev.getId();
      let rec = false;
      try { rec = ev.isRecurringEvent(); } catch (e) { }
      const flags = (ev.isAllDayEvent() ? 'a' : '') + (rec ? 'r' : '');
      let who = c.who;
      if (!who) { try { who = CREATORS[String(ev.getCreators()[0] || '').toLowerCase()] || ''; } catch (e) { } }
      const add = function (date, time) {
        if (date < td || date >= fmt(to, 'yyyy-MM-dd')) return;
        const title = calTitle_(ev.getTitle(), ev, date);
        if (!title) return;
        const k = date + '|' + time + '|' + title.toLowerCase();
        if (seen[k]) return;
        seen[k] = true;
        rows.push([date, time, title, who, 'kalender', id, flags]);
      };
      if (ev.isAllDayEvent()) {
        const s = fmt(ev.getAllDayStartDate(), 'yyyy-MM-dd'), e = fmt(ev.getAllDayEndDate(), 'yyyy-MM-dd');
        for (let d = s, i = 0; d < e && i < 60; d = addDays_(d, 1), i++) add(d, timeInTitle_(ev.getTitle()));
      } else {
        const s = ev.getStartTime(), e = ev.getEndTime(), sd = fmt(s, 'yyyy-MM-dd');
        add(sd, fmt(s, 'HH.mm') + (fmt(e, 'yyyy-MM-dd') === sd && e > s ? '–' + fmt(e, 'HH.mm') : ''));
      }
    });
  });
  // Kommer skriptet inte åt någon kalender ska fliken inte tömmas; felet syns under Körningar i Apps Script
  if (!found) throw new Error('Kommer inte åt kalendrarna som ' + Session.getEffectiveUser().getEmail() + '. Kör kalenderTest.');
  return rows;
}
/** Kör för hand i Apps Script: visar vilket konto skriptet kör som och vad det hittar i varje kalender. */
function kalenderTest() {
  Logger.log('Skriptet kör som: ' + Session.getEffectiveUser().getEmail());
  const td = today_(), from = day_(td), to = day_(addDays_(td, CAL_DAYS));
  CALENDARS.forEach(function (c) {
    const cal = cal_(c.id);
    Logger.log(c.id + ': ' + (cal ? cal.getEvents(from, to).length + ' händelser' : 'kommer inte åt kalendern'));
  });
  Logger.log('Rader till fliken Händelser: ' + calRows_().length);
}
function sortEvents_(rows) {
  return rows.sort(function (a, b) { return a[0].localeCompare(b[0]) || String(a[1]).localeCompare(String(b[1])) || String(a[2]).localeCompare(String(b[2])); });
}

/** Körs var 15:e minut av tidsstyrningen som setup skapar. Går också att köra för hand. */
function kalenderSynk() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    kalenderSynk_();
    const td = today_();
    if (props_().getProperty('BDAY_SYNC') !== td) { fodelsedagarSynk_(); props_().setProperty('BDAY_SYNC', td); }
  } finally { lock.releaseLock(); }
}
// Skriver om fliken Händelser från kalendrarna. Rader som inte kommer från kalendern behålls.
function kalenderSynk_() {
  const td = today_(), sh = sheet_('events'), W = COLS.events.length;
  if (!sh.getRange(1, 6).getDisplayValue()) sh.getRange(1, 6, 1, 2).setValues([['Id', 'Flaggor']]);
  const cur = sh.getDataRange().getDisplayValues().slice(1).filter(function (r) { return r.some(String); })
    .map(function (r) { r = r.slice(0, W); while (r.length < W) r.push(''); return r; });
  const keep = cur.filter(function (r) { return r[4] !== 'kalender' && r[0] >= td; });
  const rows = sortEvents_(keep.concat(calRows_()));
  const same = rows.length === cur.length && rows.every(function (r, i) { return r.join('|') === cur[i].join('|'); });
  if (!same) {
    const n = Math.max(cur.length, 1);
    sh.getRange(2, 1, n, W).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, W).setNumberFormat('@').setValues(rows);
  }
}

/* ---------------- ändra och ta bort händelser från appen ----------------
   Händelser från Google Kalender har ett id (kalenderns nummer i CALENDARS + "|" + händelsens id) och ändras
   direkt i kalendern. Händelser som bara finns i fliken Händelser (utan id) ändras i fliken.
   b.date/b.time/b.title är händelsen som den ser ut i appen, b.fields de nya värdena,
   b.all = true tar bort hela serien för en återkommande händelse. */
function hm_(s) { const m = String(s || '').match(/^(\d{1,2})[.:](\d{2})$/); return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : ''; }
function eventEdit_(b, del) {
  const f = b.fields || {};
  if (!b.id) {
    const sh = sheet_('events'), rows = readTab_('events').filter(function (e) {
      return !e.id && e.date === b.date && e.time === String(b.time || '') && e.title === b.title;
    });
    if (!rows.length) throw new Error('Hittade inte händelsen.');
    if (del) { sh.deleteRow(rows[0]._row); return; }
    const out = {};
    if (f.title != null) out.title = String(f.title).slice(0, 200);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(f.date || ''))) out.date = f.date;
    if (f.allDay) out.time = '';
    else if (hm_(f.start)) out.time = hm_(f.start).replace(':', '.') + (hm_(f.end) ? '–' + hm_(f.end).replace(':', '.') : '');
    setCells_('events', rows[0]._row, out);
    return;
  }
  const i = String(b.id).indexOf('|'), c = CALENDARS[Number(String(b.id).slice(0, i))], eid = String(b.id).slice(i + 1);
  const cal = c && cal_(c.id);
  if (!cal) throw new Error('Hittade inte kalendern.');
  let ev = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(b.date || ''))) ev = cal.getEventsForDay(day_(b.date)).filter(function (e) { return e.getId() === eid; })[0] || null;
  if (!ev) ev = cal.getEventById(eid);
  if (!ev) throw new Error('Händelsen finns inte längre i kalendern.');
  if (del) {
    if (b.all && ev.isRecurringEvent()) ev.getEventSeries().deleteEventSeries();
    else ev.deleteEvent();
  } else {
    if (f.title != null && String(f.title).trim() && String(f.title).trim() !== b.title) ev.setTitle(String(f.title).trim().slice(0, 200));
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(f.date || '')) ? f.date : b.date;
    if (f.allDay) {
      if (!ev.isAllDayEvent() || date !== b.date) ev.setAllDayDate(day_(date));
    } else if (hm_(f.start)) {
      const at = function (t) { return Utilities.parseDate(date + ' ' + t, TZ, 'yyyy-MM-dd HH:mm'); };
      const start = at(hm_(f.start));
      const len = ev.isAllDayEvent() ? 3600000 : Math.max(0, ev.getEndTime().getTime() - ev.getStartTime().getTime());
      let end = hm_(f.end) ? at(hm_(f.end)) : new Date(start.getTime() + len);
      if (end < start) end = new Date(end.getTime() + 864e5);
      if (ev.isAllDayEvent() || start.getTime() !== ev.getStartTime().getTime() || end.getTime() !== ev.getEndTime().getTime()) ev.setTime(start, end);
    }
  }
  kalenderSynk_();
}

// Födelsedagar ett år framåt: "Namn, född ÅÅÅÅ" och Googles födelsedagshändelser ("Födelsedag för Namn").
// Finns redan någon med samma datum men annat namn i listan (t.ex. Henke som slagits ihop till Henrik) behålls namnet i listan.
function fodelsedagarSynk_() {
  const td = today_(), from = day_(td), to = day_(addDays_(td, 366));
  const found = [];
  CALENDARS.slice(0, 2).forEach(function (c) {
    const cal = cal_(c.id);
    if (!cal) return;
    cal.getEvents(from, to).forEach(function (ev) {
      if (!ev.isAllDayEvent()) return;
      const t = String(ev.getTitle() || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim();
      let m = t.match(/^(.+?),\s*född\s+(\d{4})$/i), namn = '', ar = null;
      if (m) { namn = m[1].trim(); ar = Number(m[2]); }
      else if ((m = t.match(/^Födelsedag för (.+)$/i))) namn = m[1].trim();
      if (!namn) return;
      found.push({ namn: namn, datum: Utilities.formatDate(ev.getAllDayStartDate(), TZ, 'MM-dd'), ar: ar });
    });
  });
  if (!found.length) return; // läste inget, låt listan vara
  let old = [];
  try { old = JSON.parse(readSettings_().fodelsedagar || '[]'); } catch (e) { }
  const out = [];
  const put = function (namn, datum, ar) {
    const x = out.filter(function (o) { return o.datum === datum && o.namn === namn; })[0];
    if (x) { if (ar && !x.ar) x.ar = ar; return; }
    const o = { namn: namn, datum: datum }; if (ar) o.ar = ar; out.push(o);
  };
  found.forEach(function (f) {
    const sameDate = old.filter(function (o) { return o.datum === f.datum; });
    const exact = sameDate.filter(function (o) { return o.namn === f.namn; })[0];
    const named = found.some(function (g) { return g.datum === f.datum && sameDate.some(function (o) { return o.namn === g.namn; }); });
    // annat namn samma dag, och ingen i kalendern har det gamla namnet: samma person under nytt namn
    const alias = !exact && sameDate.length === 1 && !named ? sameDate[0] : null;
    const base = exact || alias;
    put(base ? base.namn : f.namn, f.datum, f.ar || (base && base.ar) || null);
  });
  out.sort(function (a, b) { return a.datum.localeCompare(b.datum) || a.namn.localeCompare(b.namn); });
  const v = JSON.stringify(out);
  if (v !== JSON.stringify(old)) writeSetting_('fodelsedagar', v);
}

/* ---------------- one-time setup ---------------- */
function setup() {
  const p = props_();
  const words = ['lingon', 'tass', 'matvete', 'kvarg', 'purjo', 'hylla', 'kompis', 'skogen', 'bulle', 'linser', 'koppel', 'soffa', 'blabar', 'havre', 'mossa', 'stuga'];
  const pick = function () { return words[Math.floor(Math.random() * words.length)]; };
  if (!p.getProperty('HOUSEHOLD_KEY')) p.setProperty('HOUSEHOLD_KEY', pick() + '-' + pick() + '-' + (10 + Math.floor(Math.random() * 90)));
  if (!p.getProperty('NTFY_TOPIC')) p.setProperty('NTFY_TOPIC', 'hushall-' + Utilities.getUuid().replace(/-/g, '').slice(0, 16));
  // Skicka inte notis om den veckoplan som redan finns
  const s = readSettings_();
  if (s.uppdaterad && !s.notis_veckoplan_skickad) writeSetting_('notis_veckoplan_skickad', s.uppdaterad);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'notifyTick') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('notifyTick').timeBased().everyMinutes(15).create();
  // Kalendern läses direkt var 15:e minut
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'kalenderSynk') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('kalenderSynk').timeBased().everyMinutes(15).create();
  // Rubrik för återkommande uppgifter
  const th = sheet_('tasks').getRange(1, 8);
  if (!th.getDisplayValue()) th.setValue('Upprepa');
  kalenderSynk();
  Logger.log('Hushållskod: ' + p.getProperty('HOUSEHOLD_KEY'));
  Logger.log('Notisämne i ntfy: ' + p.getProperty('NTFY_TOPIC'));
}

/** Kör en gång efter uppdateringen så att skriptet får spara matbilder på Drive. */
function godkannDrive() {
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  Logger.log('Matbilder sparas i mappen: ' + folder.getName());
}

/** Skicka en testnotis. */
function testNotis() { ntfy_('Hushållstavlan', 'Notiserna fungerar!', ['tada']); }
