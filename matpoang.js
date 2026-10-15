/* Matpoäng: räknar ut en rätts stjärnor, hur tidigast den får komma tillbaka och hur väl den passar att föreslås.
   Samma fil används av appen och av simuleringen, så det som visas i simuleringen är det appen gör.
   Allt är rena funktioner utan sidoeffekter: in kommer rättens data, ut kommer siffror. */
(function (root) {
  const CFG = {
    // Stjärnor: smileys flyttar stjärnorna en bit mot 5 (glad) eller 1 (ledsen). Neutral rör dem inte.
    steg: 0.12,            // hur stor del av avståndet upp till 5 en glad smiley flyttar
    stegLedsen: 0.2,       // en ledsen smiley flyttar lite mer, eftersom en misslyckad middag kostar mer än en lyckad ger
    prior: 3,              // stjärnor för en rätt som ingen har betygsatt
    // Tidigast igen: baslinjen (veckor) ändras med stjärnorna
    halvering: 1.5,        // 1,5 stjärna över 3,5 halverar intervallet, 1,5 under fördubblar det
    favFaktor: 0.8,        // favoriter får komma tillbaka lite tidigare
    minVeckor: 1, maxVeckor: 26,
    pausLedsna: 3,         // så många ledsna i rad pausar rätten
    pausStjarnor: 1.75,    // under detta pausas rätten
    // Poäng (summan av vikterna är 100)
    vikt: { smak: 28, dags: 15, pris: 18, ateranvandning: 12, favorit: 7, nyhet: 7, tid: 5, sasong: 4, erbjudande: 4 },
    marginal: 0.97,       // planera mot 97 % av budgeten så att avrundningar inte tar veckan över
    // Veckan: storkok och helg är fasta, vardagsrätterna 1–2 och resten av vardagskvällarna blir macka
    vardagskvallar: 4, maxVardag: 2, minVardag: 1, mackaKr: 30,   // macka för två en kväll
    bortvaldAvdrag: 3, bortvaldMax: 12,   // per gång rätten föreslagits men inte valts sedan den lagades
    variationAvdrag: 15,                  // samma huvudråvara som en rätt som redan är vald i veckan
    temperatur: 8,                        // slump i förslagen: 8 poängs skillnad gör en rätt ungefär 2,7 gånger så trolig
    // Grundintervall när rätten lagas första gången, efter sort
    bas: { fisk: 3, kyckling: 2, kott: 2, veg: 2, gemensam: 3, storkok: 3, efterratt: 3 }
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const DAY = 864e5;
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

  // Rättens sort, för grundintervall och variation
  function sort(r) {
    const t = ((r.title || '') + ' ' + (r.group || '')).toLowerCase();
    if (r.course === 'efterrätt') return 'efterratt';
    if (/storkok/.test(t)) return 'storkok';
    if (/lax|torsk|sej|fisk|räk|tonfisk/.test(t)) return 'fisk';
    if (r.who === 'Gemensam') return 'gemensam';
    if (r.who === 'Vegetariskt') return 'veg';
    if (/kyckling|kalkon/.test(t)) return 'kyckling';
    return 'kott';
  }
  // Huvudråvara, för att undvika två liknande rätter samma vecka
  function huvudravara(r) {
    const t = (r.title || '').toLowerCase();
    const L = [['lax', 'fisk'], ['torsk', 'fisk'], ['sej', 'fisk'], ['fisk', 'fisk'], ['räk', 'skaldjur'], ['kyckling', 'kyckling'], ['kalkon', 'kalkon'],
      ['fläsk', 'fläsk'], ['nötfärs', 'nötfärs'], ['köttfärs', 'nötfärs'], ['lins', 'linser'], ['dal', 'linser'], ['kikärt', 'kikärtor'], ['falafel', 'kikärtor'],
      ['bön', 'bönor'], ['halloumi', 'halloumi'], ['tofu', 'tofu'], ['feta', 'fetaost'], ['pasta', 'pasta']];
    const hit = L.find(([k]) => t.includes(k));
    return hit ? hit[1] : sort(r);
  }
  const grundintervall = r => CFG.bas[sort(r)] || 2;

  /* Stjärnor. s0 = stjärnorna som sattes för hand (snittet av allas), smileys = [[datum, +1|0|-1], ...] i tidsordning.
     Bara smileys efter senaste manuella ändringen räknas. */
  function stjarnor(s0, smileys, sedan) {
    let s = s0 == null ? CFG.prior : s0;
    (smileys || []).forEach(([d, v]) => {
      if (sedan && d < sedan) return;
      if (v > 0) s += CFG.steg * (5 - s);
      else if (v < 0) s -= CFG.stegLedsen * (s - 1);
    });
    return Math.round(s * 100) / 100;
  }
  // Så många ledsna i rad på slutet
  const ledsnaIRad = sm => { let n = 0; for (let i = (sm || []).length - 1; i >= 0 && sm[i][1] < 0; i--) n++; return n };

  /* Tidigast igen i veckor. bas = baslinjen som sattes första gången rätten lagades. */
  function tidigast(bas, s, fav) {
    if (bas === 0) return 0;
    const w = (bas || 2) * Math.pow(2, (3.5 - s) / CFG.halvering) * (fav ? CFG.favFaktor : 1);
    return clamp(Math.round(w * 2) / 2, CFG.minVeckor, CFG.maxVeckor);
  }

  /* Allt om en rätt på ett ställe. d = {s0, smileys, sedan, bas, fav, aldrig, lagad:{n, d}} */
  function lage(d, idag) {
    const s = stjarnor(d.s0, d.smileys, d.sedan);
    const w = tidigast(d.bas, s, d.fav);
    const n = (d.lagad && d.lagad.n) || 0, senast = d.lagad && d.lagad.d;
    const sedan = senast ? days(senast, idag) : null;
    const tidigastDatum = senast && w ? new Date(Date.parse(senast) + w * 7 * DAY).toISOString().slice(0, 10) : null;
    let paus = '';
    if (d.aldrig || d.bas === 0) paus = 'Aldrig';
    else if (s < CFG.pausStjarnor) paus = 'För lågt betyg';
    else if (ledsnaIRad(d.smileys) >= CFG.pausLedsna) paus = CFG.pausLedsna + ' ledsna i rad';
    const redo = !paus && (sedan == null || sedan >= w * 7);
    return { s, w, n, senast, sedan, tidigastDatum, paus, redo };
  }

  /* Poäng 0–100 för en rätt som är redo. ctx = {upptagen, manad, erbjudande(r), bortvald, valda:[huvudråvaror]} */
  function poang(r, d, l, ctx) {
    ctx = ctx || {};
    const V = CFG.vikt, del = {};
    del.smak = V.smak * (l.s - 1) / 4;
    const kvot = l.sedan == null ? null : l.sedan / (7 * Math.max(l.w, 1));
    del.dags = V.dags * (kvot == null ? 0.5 : clamp((kvot - 1) / 2, 0, 1));
    del.favorit = d.fav ? V.favorit : 0;
    del.nyhet = V.nyhet * (l.n === 0 ? 1 : l.n === 1 ? 0.5 : 0);   // bara rätter som är nya eller lagade en gång
    // Pris mot budgeten: kvot = vad rätten kostar extra delat med vad platsen får kosta. 0,5 eller lägre ger full, 1,5 eller högre noll.
    del.pris = V.pris * (ctx.prisKvot != null ? clamp(1.5 - ctx.prisKvot, 0, 1) : r.kr ? clamp((45 - r.kr) / 30, 0, 1) : 0.5);
    // Återanvändning: hur stor del av rättens varor som redan finns över från veckans andra rätter
    del.ateranvandning = V.ateranvandning * (ctx.ateranvandning || 0);
    del.tid = V.tid * (ctx.upptagen == null ? 0.5 : ctx.upptagen ? (r.min <= 30 ? 1 : r.min > 45 ? 0 : 0.5) : 0.5);
    del.sasong = V.sasong * sasong(r, ctx.manad);
    del.erbjudande = V.erbjudande * (ctx.erbjudande ? (ctx.erbjudande(r) ? 1 : 0) : 0.5);
    const bort = Math.min(CFG.bortvaldMax, CFG.bortvaldAvdrag * (ctx.bortvald || 0));
    const variation = ctx.valda && ctx.valda.includes(huvudravara(r)) ? CFG.variationAvdrag : 0;
    const summa = Object.values(del).reduce((a, b) => a + b, 0) - bort - variation;
    return { summa: Math.round(clamp(summa, 0, 100) * 10) / 10, del, bort, variation };
  }
  // Säsong: 1 i säsong, 0 utanför, 0,5 för rätter utan tydlig säsong
  const SAS = [[/pumpa|rotselleri|palsternack|grönkål|rödbet|vitkål/, [9, 10, 11, 12, 1, 2, 3]], [/rabarber|jordgubb|sparris/, [5, 6, 7]], [/zucchini|tomat|gurka|paprika/, [6, 7, 8, 9]]];
  function sasong(r, manad) {
    if (!manad) return 0.5;
    const t = (r.title || '').toLowerCase(), hit = SAS.find(([re]) => re.test(t));
    return hit ? (hit[1].includes(manad) ? 1 : 0) : 0.5;
  }

  /* Förslag till en plats: 3 rätter lottade med poängen som vikt, plus en bonusrätt.
     Bonusrätten är den redo rätt som inte föreslagits på längst tid, så att alla rätter får chansen igen. */
  function foreslag(lista, rng, antal) {
    rng = rng || Math.random; antal = antal || 3;
    const kvar = lista.filter(x => x.l.redo).slice(), val = [];
    while (val.length < antal && kvar.length) {
      const vikt = kvar.map(x => Math.exp(x.p.summa / CFG.temperatur)), tot = vikt.reduce((a, b) => a + b, 0);
      let r = rng() * tot, i = 0;
      while (i < kvar.length - 1 && (r -= vikt[i]) > 0) i++;
      val.push(kvar.splice(i, 1)[0]);
    }
    const bonus = kvar.sort((a, b) => String(a.senastForeslagen || '').localeCompare(String(b.senastForeslagen || '')) || a.p.summa - b.p.summa)[0] || null;
    return { val, bonus };
  }

  /* Planera en vecka. platser = [{id, typ, port}] i den ordning de ska fyllas (dyrast först).
     kand(plats) = rätter som passar platsen: [{r, d, l, behov(f)}] där behov(f) ger varorna för f gånger receptet.
     V = MatVaror, budget = kr för veckans middagar och storkok, valj(forslag) = vilken rätt som väljs (i appen: användaren).
     Varje plats får förslag med pris mot det som är kvar av budgeten och återanvändning av veckans rester.
     Rätter som skulle göra det omöjligt att hålla budgeten visas inte.
     Budgeten gäller det ni betalar i kassan (det som redan finns hemma är gratis), eller med opt.budgetPa = 'kostnad' det veckan äter upp. */
  function planeraVecka(platser, kand, V, budget, valj, opt) {
    opt = opt || {};
    const valda = [], behovValda = [], huvud = [];
    const lager = opt.lager || {}, K = opt.budgetPa === 'kostnad' ? 'kostnad' : 'kr', M_ = opt.budgetPa === 'kostnad' ? 'marginal' : 'kassa';
    const kostnad = (x, p) => V.korg([x.behov(p.port / (x.r.portions || 2))], lager)[K];
    const kost = p => kand(p).filter(x => x.l.redo).map(x => kostnad(x, p)).sort((a, b) => a - b);
    // Vardagskvällar utan lagad rätt blir macka. Valfria platser (vardagsrätt nummer 2) fylls bara om budgeten räcker.
    const vardag = platser.filter(p => p.typ === 'vardag').length;
    let macka = Math.max(0, CFG.vardagskvallar - vardag) * CFG.mackaKr;
    // Billigaste möjliga resten av veckan, utan rätter som redan valts. Valfria platser räknas som macka.
    const minKvar = i => platser.slice(i + 1).reduce((a, q) => a + (q.valfri ? CFG.mackaKr : Math.min(...kand(q).filter(x => x.l.redo && !valda.some(v => v.r.id === x.r.id)).map(x => kostnad(x, q)), 1e4)), 0);
    budget = budget * CFG.marginal;
    platser.forEach((p, i) => {
      const spent = V.korg(behovValda, lager)[K] + macka, kvar = budget - spent;
      if (p.valfri && !opt.utanBudget) {
        const k = kost(p), mellan = k[Math.floor(k.length / 2)] || 0;
        if (kvar - minKvar(i) < mellan) { macka += CFG.mackaKr; return }
      }
      const portKvar = platser.slice(i).reduce((a, q) => a + q.port, 0), mal = kvar * p.port / portKvar;
      let lista = kand(p).filter(x => x.l.redo && !valda.some(v => v.r.id === x.r.id)).map(x => {
        const b = x.behov(p.port / (x.r.portions || 2)), t = V.tillagg(behovValda, b, opt.utanAteranvandning ? {} : lager);
        const ctx = Object.assign({}, opt.ctx, { prisKvot: opt.utanBudget ? null : t[M_] / Math.max(mal, 1), ateranvandning: opt.utanAteranvandning ? 0 : t.ateranvandning, valda: huvud });
        return { x, b, t, l: x.l, p: poang(x.r, x.d, x.l, ctx), senastForeslagen: x.senastForeslagen };
      });
      if (!opt.utanBudget) { const mk = minKvar(i), ok = lista.filter(y => y.t[M_] + mk <= kvar); lista = ok.length ? ok : lista.sort((a, b) => a.t[M_] - b.t[M_]).slice(0, 1) }
      const f = foreslag(lista, opt.rng, 3), y = valj(f, p);
      if (!y) return;
      valda.push({ plats: p, r: y.x.r, t: y.t, p: y.p, f }); behovValda.push(y.b); huvud.push(huvudravara(y.x.r));
    });
    const korg = V.korg(behovValda, opt.utanAteranvandning ? {} : lager);
    return { valda, korg, macka, kostnad: korg.kostnad + macka, kassa: korg.kr + macka };
  }
  // Hur många vardagsrätter budgeten räcker till: 2 om resten av budgeten räcker till två rätter i mellanpris, annars 1
  function antalVardag(kvar, mellanpris) {
    const kv = CFG.vardagskvallar;
    for (let n = CFG.maxVardag; n > CFG.minVardag; n--) if (n * mellanpris + (kv - n) * CFG.mackaKr <= kvar) return n;
    return CFG.minVardag;
  }

  root.MatPoang = { CFG, sort, huvudravara, grundintervall, stjarnor, ledsnaIRad, tidigast, lage, poang, sasong, foreslag, planeraVecka, antalVardag };
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module !== 'undefined') module.exports = globalThis.MatPoang;
