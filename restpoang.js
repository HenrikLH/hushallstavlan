/* Restpoäng: poäng för en rätt mot det som redan ligger i veckan, så att rester av dyra och känsliga varor tas till vara.
   Ren modul utan sidoeffekter, samma idé som matpoang.js. Simuleringen ligger i projektmappen matdel/restpoang.

   Grundpoäng G (0–100): smak, dags igen, pris per portion, favorit, nyhet, tid, säsong, erbjudande.
   Justerad poäng J = G + prisjustering + restbonus + variationsbonus − samma-råvara-avdrag.
   prisjustering = prisdelen räknad på det som måste köpas till i stället för rättens eget pris (billig komplettering lyfter)
   restbonus = vikt × aktivering × kvot
     aktivering = hur mycket känsligt som blir över i veckan (0 när inget, 1 vid 20 kr eller mer)
     kvot       = räddat / (räddat + komplettering), alltså hur stor del av rätten som redan är betald och annars hade slängts
     komplettering = värdet av det rätten äter som inte redan finns över + de nya rester den lämnar
   Är inget känsligt över blir J = G (plus variation), precis som Henrik beskrev. */
(function (root) {
  const MV = root.MatVaror || require('./matvaror.js');
  const MP = root.MatPoang || require('./matpoang.js');

  // Dagar en vara håller efter att förpackningen öppnats eller köpts (kylskåp). Burkar räknas som öppnade.
  const DAGAR = {
    'färska örter': 4, 'sallad': 4, 'spenat': 4, 'avokado': 3, 'banan': 5, 'champinjoner': 5, 'körsbärstomater': 6, 'tomat': 7,
    'gurka': 7, 'aubergine': 7, 'broccoli': 6, 'blomkål': 7, 'grönkål': 5, 'zucchini': 10, 'paprika': 10, 'salladslök': 7, 'purjolök': 14,
    'matlagningsgrädde': 4, 'crème fraiche och gräddfil': 7, 'mjölk': 7, 'yoghurt': 10, 'kvarg': 7, 'keso': 5, 'fetaost': 7, 'halloumi': 5,
    'tofu': 3, 'pesto och hummus': 7, 'kokosmjölk': 3, 'krossade tomater': 3, 'kikärtor': 3, 'bönor på burk': 3,
    'sötpotatis': 21, 'potatis': 30, 'citron': 21, 'lime': 21, 'äpple': 21, 'riven ost': 21, 'tortillas och bröd': 7, 'bröd': 5,
    'oliver': 14, 'rödbetor': 14, 'vitkål': 21, 'morot': 21, 'rotselleri': 21, 'palsternacka': 21
  };
  const CFG = {
    vikt: { smak: 32, pris: 25, dags: 14, favorit: 8, nyhet: 7, tid: 5, sasong: 5, erbjudande: 4 }, // ingen återanvändning här: den ligger i restbonusen
    rest: 35,         // full restbonus: en rätt som bara är rester som annars slängts får +35, till hälften +17
    aktivFull: 20,    // så många kr känsligt som blir över ger full aktivering
    variation: 6,     // ny huvudråvara i veckan, om den inte kostar mer
    varTolerans: 10,  // kr: variationen får kosta högst så här mycket mer än mittenrätten innan bonusen är borta
    sammaAvdrag: 8,   // samma huvudråvara finns redan i veckan
    vardagsvara: 0.3, // hur stor del av en frukost- eller mackvara som antas slängas om den blir över
    svinnStraff: 0.3, // poäng per krona nytt hotat svinn som rätten lämnar efter sig, utöver det som räknas i kvoten
    mal: 850 * 0.97 / 24  // kr per portion som en vanlig vecka har råd med (budget 850)
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  // Varor som oftast äts upp ändå (frukost, mellanmål, macka). Deras rester räknas bara till en del som hotade
  const VARDAGSVAROR = new Set(['yoghurt', 'kvarg', 'keso', 'mjölk', 'bröd', 'tortillas och bröd', 'gurka', 'tomat', 'körsbärstomater', 'äpple', 'banan', 'paprika']);
  const dagar = (k, hall) => DAGAR[k] != null ? DAGAR[k] : hall ? 999 : 7;
  // Risken att en rest slängs: 1 för det som håller 4 dagar eller mindre, 0 för det som håller två veckor
  const risk = (k, hall) => clamp((14 - dagar(k, hall)) / 10, 0, 1) * (VARDAGSVAROR.has(k) ? CFG.vardagsvara : 1);

  // Det som blir över i en korg, med värde och risk. Även halva burkar, som korg() lägger i lagret.
  function rester(korg) {
    return korg.rad.filter(x => x.over > 1e-6).map(x => {
      const perG = x.kr / Math.max(x.n, 1) / x.pkt, r = risk(x.k, x.hall);
      return { k: x.k, m: x.over, perG, kr: x.over * perG, risk: r, hotat: x.over * perG * r };
    });
  }
  const hotat = L => L.reduce((a, x) => a + x.hotat, 0);

  // Grundpoäng: som MatPoang.poang men utan återanvändning och med pris per portion mot veckans mål
  function grund(r, d, l, ctx) {
    const V = CFG.vikt, del = {};
    del.smak = V.smak * (l.s - 1) / 4;
    const kvot = l.sedan == null ? null : l.sedan / (7 * Math.max(l.w, 1));
    del.dags = V.dags * (kvot == null ? 0.5 : clamp((kvot - 1) / 2, 0, 1));
    del.favorit = d.fav ? V.favorit : 0;
    del.nyhet = V.nyhet * (l.n === 0 ? 1 : l.n === 1 ? 0.5 : 0);
    del.pris = V.pris * clamp(1.5 - ctx.perPort / CFG.mal, 0, 1);
    del.tid = V.tid * 0.5;
    del.sasong = V.sasong * MP.sasong(r, ctx.manad);
    del.erbjudande = V.erbjudande * 0.5;
    return Object.values(del).reduce((a, b) => a + b, 0);
  }

  /* En kandidat mot veckan som redan ligger: vad den kostar att handla till, vad den räddar och vad den lämnar.
     vecka = [behov, ...], b = kandidatens behov, lager = det som finns hemma. fore = före(vecka, lager) om den redan är uträknad. */
  const fore_ = (vecka, lager) => { const k = MV.korg(vecka, lager); return { k, R: rester(k) } };
  function komplettera(vecka, b, lager, pre) {
    pre = pre || fore_(vecka, lager);
    const fore = pre.k, efter = MV.korg(vecka.concat([b]), lager), ensam = MV.korg([b], lager);
    const Rf = pre.R, Re = rester(efter);
    let raddat = 0, anv = 0; const anvander = [];
    Rf.forEach(x => { const need = b[x.k] ? b[x.k].m : 0; if (!need) return; const m = Math.min(need, x.m); anv += m * x.perG; if (x.risk) { raddat += m * x.perG * x.risk; anvander.push(x.k) } });
    const kop = efter.kr - fore.kr, hf = hotat(Rf), he = hotat(Re), nytt = Math.max(0, he - (hf - raddat));
    // Komplettering: värdet av det rätten äter som inte redan finns över, plus det nya den lämnar efter sig.
    // Förpackningar som håller (kyckling i frysen, ris) räknas inte som kostnad bara för att de köps hela
    const kompl = Math.max(0, ensam.forbrukat - anv) + nytt;
    return { kop, kompl, raddat, nytt, hotatFore: hf, hotatEfter: he, anvander, ensamKostnad: ensam.forbrukat + RP_hotat(ensam), efter };
  }
  const RP_hotat = k => hotat(rester(k));

  /* Rangordna kandidater för en plats. kand = [{r, d, l, b}] där b = behov för platsens portioner.
     Returnerar listan sorterad, bäst först, med G och J och förklaring. */
  function rangordna(kand, vecka, lager, opt) {
    opt = opt || {};
    const fams = new Set((opt.veckaRatter || []).map(MP.huvudravara)), pre = fore_(vecka, lager);
    const rows = kand.map(x => {
      const c = komplettera(vecka, x.b, lager, pre);
      const ensam = c.ensamKostnad, port = x.port || opt.port || 2;
      // Grundpoängens pris: vad rätten kostar att äta (det som går åt plus det som riskerar att slängas), per portion
      const G = grund(x.r, x.d, x.l, { perPort: ensam / port, manad: opt.manad });
      // I den justerade poängen räknas priset på kompletteringen i stället: det som inte redan finns över
      const P = kr => CFG.vikt.pris * clamp(1.5 - kr / port / CFG.mal, 0, 1);
      return Object.assign({ x, G, ensam, prisJust: P(c.kompl) - P(ensam) }, c);
    });
    const kops = rows.map(y => y.kompl).sort((a, b) => a - b), median = kops[Math.floor(kops.length / 2)] || 0;
    rows.forEach(y => {
      const a = clamp(y.hotatFore / CFG.aktivFull, 0, 1);
      const q = y.raddat > 0 ? y.raddat / (y.raddat + y.kompl) : 0;
      y.restbonus = CFG.rest * a * q;
      const fam = MP.huvudravara(y.x.r);
      y.variation = fams.has(fam) ? -CFG.sammaAvdrag : fams.size ? CFG.variation * clamp((median + CFG.varTolerans - y.kompl) / CFG.varTolerans, 0, 1) : 0;
      y.netto = y.nytt - y.raddat;
      y.J = y.G + y.prisJust + y.restbonus + y.variation - CFG.svinnStraff * Math.max(0, y.nytt) + (y.x.extra || 0);
    });
    return rows.sort((a, b) => b.J - a.J);
  }

  // Det som blir över i veckan just nu, mest hotat först
  const veckansRester = (vecka, lager) => fore_(vecka, lager).R.filter(x => x.hotat >= 0.5).sort((a, b) => b.hotat - a.hotat);
  root.RestPoang = { CFG, DAGAR, VARDAGSVAROR, risk, rester, hotat, grund, komplettera, rangordna, veckansRester };
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module !== 'undefined') module.exports = globalThis.RestPoang;
