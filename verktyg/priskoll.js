#!/usr/bin/env node
/* Priskoll: kontrollerar att priserna i appen går att lita på. Körs utan webbläsare:
     node verktyg/priskoll.js            kontrollera (avslutas med kod 1 vid fel)
     node verktyg/priskoll.js --skriv    skriv om verktyg/priskopplingar.json efter granskning av ändringarna
   1. Varje ingrediens i alla recept (inspiration.json, receptarket och emulatorns data) ska stå i priskopplingar.json
      med den vara den räknas som. Ny ingrediens eller ändrad koppling = fel, tills den granskats och skrivits in.
      Värdet är basvarans namn, "skafferi:<vara>", "gratis" (vatten) eller "okänd" (saknar pris, visas som "minst X kr").
   2. Willyspriserna i fixtures/priser.json (och PRISER=<fil> med arkets priser) ska vara rimliga: pris per gram eller styck
      mellan en fjärdedel och tre gånger standardpriset i matvaror.js. Annars används standardpriset (MV.rimligFor).
   3. Pris per portion för arkets recept ska ligga mellan 3 och 90 kr och bygga på kända priser till minst 90 %. */
const fs = require('fs'), path = require('path');
const MV = require('../matvaror.js');
const rot = path.join(__dirname, '..'), fil = path.join(__dirname, 'priskopplingar.json');
const num = s => { s = String(s == null ? '' : s).trim().replace(',', '.'); return s === '' ? null : Number(s); };
const tolka = t => String(t || '').split('\n').filter(l => !/^#/.test(l)).map(l => l.split('|').map(x => x.trim())).filter(p => p.length >= 3 && p[2]).map(p => ({ q: num(p[0]), u: p[1], n: p[2] }));
// Recepten
const recept = [];
require(path.join(rot, 'inspiration.json')).forEach(r => recept.push({ titel: r.title, port: r.portions, items: (r.groups || []).flatMap(g => g.items || []), kalla: 'inspiration' }));
require('./emu/fixtures/recept-ark.json').forEach(r => recept.push({ titel: r.title, port: r.portions, items: tolka(r.ing), kalla: 'ark' }));
const data = require('./emu/data.js');
(data['Recept'] || []).slice(1).forEach(r => recept.push({ titel: r[4], port: r[5], items: tolka(r[12]), kalla: 'emu' }));
// Vad en ingrediens räknas som
const koppling = n => { const v = MV.vara(n); if (v) return v.okand ? 'okänd' : v.k; const s = MV.skafferi(n); return s ? 'skafferi:' + s.k : 'gratis'; };
const namn = {};
recept.forEach(r => r.items.forEach(it => { const k = MV.rent(it.n); if (k) namn[k] = koppling(it.n); }));
const fel = [], varn = [];
if (process.argv.includes('--skriv')) {
  const ut = {}; Object.keys(namn).sort((a, b) => a.localeCompare(b, 'sv')).forEach(k => { ut[k] = namn[k]; });
  fs.writeFileSync(fil, JSON.stringify(ut, null, 1) + '\n');
  console.log('Skrev ' + Object.keys(ut).length + ' kopplingar till ' + path.relative(rot, fil));
}
const fast = fs.existsSync(fil) ? JSON.parse(fs.readFileSync(fil, 'utf8')) : {};
Object.keys(namn).forEach(k => {
  if (!(k in fast)) fel.push('Ny ingrediens utan granskad koppling: "' + k + '" (räknas som ' + namn[k] + ')');
  else if (fast[k] !== namn[k]) fel.push('Ändrad koppling: "' + k + '" räknas som ' + namn[k] + ', granskat: ' + fast[k]);
});
const okanda = Object.keys(namn).filter(k => namn[k] === 'okänd');
if (okanda.length) varn.push(okanda.length + ' ingredienser saknar basvara och prissätts bara om Willys hittar dem: ' + okanda.join(', '));
// Rimliga Willyspriser
const prisfiler = [path.join(__dirname, 'emu/fixtures/priser.json')].concat(process.env.PRISER ? [path.resolve(process.env.PRISER)] : []);
prisfiler.forEach(f => {
  const P = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.keys(P).forEach(k => { if (!MV.rimligFor(k, P[k])) varn.push('Orimligt pris ignoreras (' + path.basename(f) + '): ' + k + ' = ' + P[k].kr + ' kr för ' + P[k].vara); });
});
// Pris per portion för arkets recept, med priserna i fixtures (och PRISER)
prisfiler.forEach(f => {
  MV.setPriser(JSON.parse(fs.readFileSync(f, 'utf8')));
  recept.filter(r => r.kalla === 'ark').forEach(r => {
    let kr = 0, sakn = 0;
    r.items.forEach(it => { const v = MV.vara(it.n) || MV.skafferi(it.n); if (!v) return; if (v.okand) { sakn++; return; } if (it.q == null && v.skafferi) return; kr += MV.mangd(it, v) * v.kr / v.pkt; });
    const pp = kr / (Number(r.port) || 2), tack = kr / (kr + 20 * sakn || 1);
    if (pp < 3 || pp > 90) fel.push('Orimligt pris per portion ' + Math.round(pp) + ' kr: ' + r.titel + ' (' + path.basename(f) + ')');
    if (tack < 0.9) varn.push('Visas som "minst ' + Math.round(pp) + ' kr": ' + r.titel + ' (' + sakn + ' varor utan pris)');
  });
});
varn.forEach(x => console.log('OBS: ' + x));
fel.forEach(x => console.log('FEL: ' + x));
console.log(recept.length + ' recept, ' + Object.keys(namn).length + ' ingredienser, ' + fel.length + ' fel, ' + varn.length + ' att granska');
process.exit(fel.length ? 1 : 0);
