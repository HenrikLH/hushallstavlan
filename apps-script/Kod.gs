/**
 * Hushållstavlan – koppling mellan appen och kalkylarket.
 *
 * Kör funktionen `setup` en gång efter att du klistrat in koden.
 * Den skapar hushållskoden, notisämnet och tidsstyrningen för notiserna.
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
  tasks: ['done', 'title', 'due', 'who', 'note', 'id', 'source'],
  clean: ['id', 'room', 'title', 'freq', 'min', 'lastDone', 'prevDone', 'doneBy', 'who', 'tip', 'plannedFor', 'snoozeUntil', 'order'],
  menu: ['date', 'who', 'title', 'recipe', 'addon', 'note'],
  events: ['date', 'time', 'title', 'who', 'source'],
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
      case 'taskToggle': setCells_('tasks', findRow_('tasks', b.id), { done: !!b.done }); break;
      case 'taskAdd': {
        const sh = sheet_('tasks');
        sh.appendRow([false, String(b.title || '').slice(0, 200), String(b.due || ''), String(b.who || ''), '', newId_('m'), 'egen']);
        break;
      }
      case 'taskClearDone': deleteDone_('tasks'); break;
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
  if (m.who === 'Gemensam') return 'Helg (' + d.toLowerCase() + ')';
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
