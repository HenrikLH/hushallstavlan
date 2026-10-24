/* Matvaror: gör om receptens ingredienser till basvaror som går att köpa i förpackningar.
   Används för att räkna vad en vecka kostar i butiken och vad som blir över, så att rester kan användas i nästa rätt.
   Två ingredienser räknas som samma vara bara om de går att byta mot varandra i butiken:
   klyftpotatis och kokt potatis är potatis, men potatis blir aldrig ris.
   Priserna är ungefärliga butikspriser och går att justera. */
(function (root) {
  // [namn, mönster, förpackning (g eller st), pris kr, g per dl, g per st (för styckvaror: vad en väger), håller länge (skafferi eller frys)]
  const V = [
    ['potatis', /^(?!.*söt)(?:.*potatis)/, 2000, 30, 70, 120, 0],
    ['sötpotatis', /sötpotatis/, 1000, 35, 70, 350, 0],
    ['gul lök', /gul(a)? lök/, 1000, 20, 60, 120, 1],
    ['rödlök', /rödlök/, 500, 20, 60, 100, 1],
    ['purjolök', /purjo/, 1, 15, 0, 300, 0],
    ['salladslök', /salladslök/, 1, 15, 0, 100, 0],
    ['morot', /morot|morötter|rotfrukter/, 1000, 15, 60, 80, 1],
    ['palsternacka', /palsternack/, 500, 25, 60, 150, 1],
    ['rotselleri', /rotselleri/, 1, 25, 0, 800, 1],
    ['paprika', /^(?!.*(pulver|rökt|chipotle|rostad|grillad))(?:.*paprik)/, 1, 15, 0, 180, 0],
    ['zucchini', /zucchini/, 1, 15, 0, 350, 0],
    ['aubergine', /aubergine/, 1, 18, 0, 300, 0],
    ['gurka', /gurka/, 1, 15, 0, 350, 0],
    ['tomat', /^(?!.*(krossade|puré|körsbär))(?:.*tomat)/, 500, 30, 0, 100, 0],
    ['körsbärstomater', /körsbärstomat/, 250, 25, 0, 15, 0],
    ['broccoli', /^(?!.*fryst)(?:.*broccoli)/, 1, 25, 0, 400, 0],
    ['blomkål', /blomkål/, 1, 30, 0, 800, 0],
    ['vitkål', /vitkål|rödkål/, 1, 25, 0, 1500, 1],
    ['grönkål', /grönkål/, 200, 25, 0, 1, 0],
    ['champinjoner', /champinjon|shiitake/, 250, 25, 0, 20, 0],
    ['avokado', /avokado/, 1, 12, 0, 200, 0],
    ['sallad', /sallad(?!slök)|ruccola|isberg/, 1, 20, 0, 300, 0],
    ['fryst spenat', /fryst.*spenat|spenat.*fryst/, 450, 20, 30, 0, 1],
    ['spenat', /spenat|pak choi/, 65, 20, 30, 0, 0],
    ['citron', /citron/, 1, 6, 0, 120, 1],
    ['lime', /^lime/, 1, 5, 0, 70, 1],
    ['äpple', /äpple(?!cider)|äpplen|päron/, 1, 5, 0, 180, 1],
    ['banan', /banan/, 1, 4, 0, 180, 0],
    ['färska örter', /^(persilja|koriander|dill|basilika|mynta)/, 1, 20, 0, 30, 0],
    ['krossade tomater', /krossade tomater/, 400, 12, 100, 0, 1],
    ['kikärtor', /kikärt/, 380, 12, 70, 0, 1],
    ['bönor på burk', /^(?!.*edamame).*(bönor|kidney)/, 380, 12, 70, 0, 1],
    ['röda linser', /röda linser|gula linser/, 500, 25, 85, 0, 1],
    ['gröna linser', /gröna linser|belugalinser/, 500, 30, 85, 0, 1],
    ['gula ärtor', /gula ärtor/, 500, 20, 85, 0, 1],
    ['ris', /ris(?!vin)|råris/, 1000, 35, 85, 0, 1],
    ['bulgur', /bulgur/, 1000, 30, 85, 0, 1],
    ['matvete och matkorn', /matvete|matkorn/, 800, 30, 85, 0, 1],
    ['quinoa', /quinoa/, 500, 40, 85, 0, 1],
    ['pasta', /pasta|spaghetti|penne|makaroner|lasagne/, 500, 20, 50, 0, 1],
    ['nudlar', /nudlar/, 250, 20, 50, 0, 1],
    ['tortillas och bröd', /tortilla|pitabröd|hamburgerbröd/, 8, 25, 0, 1, 1],
    ['bröd', /rågbröd|fullkornsbröd/, 10, 30, 0, 1, 1],
    ['havregryn', /havregryn/, 1500, 25, 40, 0, 1],
    ['yoghurt', /yoghurt/, 1000, 35, 100, 0, 0],
    ['kvarg', /kvarg/, 500, 25, 100, 0, 0],
    ['keso', /kesella|keso|ricotta/, 500, 30, 100, 0, 0],
    ['färskost', /färskost|philadelphia|mascarpone/, 200, 22, 100, 0, 0],
    ['mjölk', /^(?!.*kokos).*mjölk/, 1000, 15, 100, 0, 0],
    ['crème fraiche och gräddfil', /crème|gräddfil/, 200, 15, 100, 0, 0],
    ['matlagningsgrädde', /grädde/, 250, 15, 100, 0, 0],
    ['riven ost', /riven (lagrad )?ost|parmesan|mozzarella/, 300, 40, 40, 0, 1],
    ['fetaost', /feta/, 150, 25, 50, 0, 0],
    ['halloumi', /halloumi|paneer/, 200, 35, 0, 0, 0],
    ['ägg', /^ägg(?!.*nudl)/, 12, 45, 0, 1, 1],
    ['kycklingfilé', /kyckling(?!.*(färs|buljong))/, 1000, 110, 0, 130, 1],
    ['kalkon', /kalkon(?!.*färs)/, 500, 70, 0, 0, 1],
    ['färs', /färs/, 500, 60, 0, 0, 1],
    // Rimmat sidfläsk och fläsklägg (till ärtsoppa) är en annan vara än fläskfilé och kotletter
    ['rimmat fläsk', /sidfläsk|rimmat|fläsklägg|bacon/, 500, 45, 0, 0, 1],
    ['fläsk', /fläsk|kassler/, 500, 65, 0, 150, 1],
    ['lax', /lax/, 500, 100, 0, 125, 1],
    ['vit fisk', /torsk|sej/, 400, 45, 0, 125, 1],
    ['räkor', /räkor/, 500, 80, 0, 0, 1],
    ['tonfisk', /tonfisk/, 1, 15, 0, 120, 1],
    ['tofu', /tofu/, 400, 30, 0, 0, 0],
    ['frysta grönsaker', /^(?!.*(bär|hallon|jordgubb|banan|mango)).*(fryst|edamame)/, 500, 20, 60, 0, 1],
    ['bär', /bär|hallon|jordgubb/, 500, 35, 60, 0, 1],
    ['kokosmjölk', /kokosmjölk/, 400, 15, 100, 0, 1],
    ['pesto och hummus', /pesto|hummus/, 200, 28, 100, 0, 0],
    ['nötter och frön', /valnöt|cashew|mandl|hasselnöt|pumpafrö|chiafrö/, 200, 35, 60, 0, 1],
    ['oliver', /oliver/, 200, 25, 0, 4, 1],
    ['rödbetor', /rödbet/, 500, 20, 0, 0, 1],
  ];
  // Skafferi: köps sällan och räknas inte i veckans kostnad
  /* Skafferivaror räknas inte i veckans kostnad, men får ett pris när de ändå står på inköpslistan (till exempel till en efterrätt).
     [namn, mönster, förpackning (g eller st), pris kr, g per dl, g per st] */
  const SK = [
    ['jordnötssmör', /jordnötssmör/, 350, 35, 100, 0],
    ['smör', /smör(?!gås)|margarin/, 500, 55, 95, 0],
    ['vaniljsocker', /vaniljsocker|vaniljpulver/, 100, 22, 50, 0],
    ['socker', /socker|farin/, 1000, 16, 85, 0],
    ['majsstärkelse', /majsstärkelse|maizena|potatismjöl/, 400, 25, 60, 0],
    ['mandelmjöl', /mandelmjöl/, 200, 45, 40, 0],
    ['vetemjöl', /mjöl(?!k)/, 2000, 22, 60, 0],
    ['bakpulver', /bakpulver|bikarbonat/, 100, 15, 90, 0],
    ['jäst', /jäst/, 1, 4, 0, 1],
    ['olja', /olja/, 1000, 45, 90, 0],
    ['vinäger', /vinäger|ättika/, 500, 25, 100, 0],
    ['soja', /soja|sriracha/, 250, 25, 100, 0],
    ['buljong', /buljong|fond/, 12, 25, 0, 1],
    ['tomatpuré', /tomatpuré/, 200, 15, 100, 0],
    ['vitt vin', /vitt vin|rött vin/, 750, 75, 100, 0],
    ['senap', /senap/, 500, 25, 100, 0],
    ['honung', /honung|sirap/, 500, 45, 140, 0],
    ['vitlök', /vitlök/, 1, 8, 0, 1],
    ['ingefära', /ingefära/, 100, 8, 0, 0],
    ['kakao', /kakao/, 250, 40, 40, 0],
    ['sesam', /sesam|tahini/, 200, 30, 60, 0],
    ['majonnäs', /majonnäs/, 400, 30, 100, 0],
    ['dadlar', /dadlar/, 250, 30, 0, 8],
    ['kokos', /kokos(flingor|olja)/, 200, 30, 40, 0],
    ['lingon', /lingon/, 400, 35, 100, 0],
    ['miso', /miso/, 300, 45, 100, 0],
    ['jalapeño', /jalapeño/, 200, 25, 0, 10],
    ['kryddor', /./, 50, 25, 40, 0],
  ];
  const SKAFFERI = /salt|peppar|olja|smör|vinäger|soja|buljong|tomatpuré|vatten|vitt vin|mjöl(?!k)|jäst|senap|kryddor|krydda|spiskummin|kummin|oregano|kanel|timjan|paprikapulver|rökt paprika|chipotle|gurkmeja|garam|curry|chili|mejram|ingefära|vitlök|honung|sesam|kakao|vanilj|miso|sriracha|tahini|majsstärkelse|jalapeño|saffran|kardemumma|muskot|nejlika|lagerblad|kryddpeppar|lingon|kokos(flingor|olja)|dadlar|jordnötssmör|majonnäs|socker|sirap/;

  const norm = n => String(n || '').toLowerCase().trim();
  // Namnet utan tillägg: "kikärtor (380 g)" och "färskost, rumstempererad" blir kikärtor och färskost
  const rent = n => norm(n).replace(/\(.*?\)/g, '').replace(/,.*$/, '').replace(/^(kallt|kall|kalla|smält|mjukt|rumsvarmt|lite|ca)\s+/, '').replace(/\s+/g, ' ').trim();
  /* Priser som Kod.gs (prisSynk) hämtar från willys.se varje morgon och sparar i kalkylarkets inställning "priser":
     {"gul lök": {"kr": 22, "pkt": 1000}, "ricotta": {"kr": 32, "pkt": 250}}. Nyckeln är en basvara eller ett ingrediensnamn.
     De går före priserna ovan, och ger pris åt ingredienser som annars saknar pris. */
  let P = {};
  function setPriser(p) { P = {}; if (p && typeof p === 'object') Object.keys(p).forEach(k => { const x = p[k]; if (x && Number(x.kr) > 0) P[norm(k)] = x; }); }
  /* Förpackningen som köps i butiken. Nya priser från Kod.gs har fp: 1 och anger förpackningen direkt.
     Äldre priser är omräknade till matvarornas standardmängd (mal); då läses förpackningen ur produktnamnet ("Ris, 5kg", "Ägg 24p").
     Lösvikt och vikt som varierar per bit (ca: 100g) behåller standardmängden. */
  function forpack(x, mal, st) {
    let kr = Number(x.kr), pkt = Number(x.pkt) || mal;
    if (x.fp) return { kr, pkt, st: x.st != null ? !!x.st : st, los: !!x.los };
    const vol = String(x.vara || '').split(/,\s+/).pop().trim().toLowerCase().replace(',', '.'), per = kr / pkt;
    if (!vol || /\//.test(vol)) return { kr, pkt, st };
    if (st) {
      const m = /(\d+)\s*(?:-?\s*pack|st\b|p\b)/.exec(vol) || /(\d+)\s*(?:-?\s*pack|p\b)/.exec(String(x.vara || '').toLowerCase());
      return m && Number(m[1]) > 1 ? { kr: per * Number(m[1]), pkt: Number(m[1]), st } : { kr, pkt, st };
    }
    const g = (m => m ? Number(m[1] || 1) * Number(m[2]) * ({ kg: 1000, g: 1, hg: 100, l: 1000, dl: 100, cl: 10, ml: 1 })[m[3]] : 0)(/^(?:(\d+)\s*x\s*)?(\d+(?:\.\d+)?)\s*(kg|g|hg|l|dl|cl|ml)\b/.exec(vol.replace(/^ca:?\s*/, '')));
    if (!g) return { kr, pkt, st };
    // "ca: 100g" är vikten för en bit lösvikt (morot), "ca: 1kg" en förpackning som väger olika (färs)
    if (/^ca/.test(vol) && g < 300) return { kr, pkt, st, los: true };
    return { kr: per * g, pkt: g, st };
  }
  function vara(n) {
    n = rent(n);
    if (!n || SKAFFERI.test(n)) return null;
    const v = V.find(([, re]) => re.test(n));
    if (!v) {
      const x = P[n];
      if (x) { const f = forpack(x, Number(x.pkt) || 1, Number(x.pkt) <= 12); return { k: n, pkt: f.pkt, kr: f.kr, st: f.st, los: f.los, mal: f.pkt, gdl: Number(x.gdl) || 100, gst: Number(x.gst) || 1, hall: !!x.hall }; }
      // Okänd vara: 20 kr används bara när veckan räknas, inköpslistan visar "prisuppgift saknas"
      return { k: n, pkt: 1, kr: 20, st: true, mal: 1, gdl: 100, gst: 1, hall: 0, okand: true };
    }
    const [k, , pkt, kr, gdl, gst, hall] = v, x = P[k], st = pkt <= 12;
    if (!x) return { k, pkt, kr, st, mal: pkt, gdl, gst, hall: !!hall };
    const f = forpack(x, pkt, st);
    return { k, pkt: f.pkt, kr: f.kr, st: f.st, los: f.los, mal: pkt, gdl, gst, hall: !!hall };
  }
  // Skafferivara med pris, för när den ändå ska köpas. Kod.gs hämtar Willyspris för dem också (nyckel = namnet i SK)
  function skafferi(n) {
    n = rent(n);
    // Vatten och is kostar inget
    if (!n || !SKAFFERI.test(n) || /vatten|^is(bitar)?$/.test(n)) return null;
    const s = SK.find(([, re]) => re.test(n)), k = s[0] === 'kryddor' ? n : s[0], x = P[k], st = s[2] <= 12;
    const f = x ? forpack(x, s[2], st) : { kr: s[3], pkt: s[2], st };
    return { k, pkt: f.pkt, kr: f.kr, st: f.st, los: f.los, mal: s[2], gdl: s[4] || 100, gst: s[5] || 1, hall: true, skafferi: true };
  }
  // Mängd i varans egen enhet: gram, eller styck när förpackningen räknas i styck (pkt i små tal)
  function mangd(it, v) {
    const q = Number(it.q) || 0, u = norm(it.u), styck = v.st != null ? v.st : v.pkt <= 12, mal = v.mal || v.pkt;
    if (!q) return styck ? 1 : mal * 0.25;
    if (styck) {
      if (u === 'st' || u === '' || u === 'kruka' || u === 'knippe' || u === 'påse') return q;
      if (u === 'g' || u === 'kg' || u === 'hg') return q * ({ g: 1, kg: 1000, hg: 100 })[u] / (v.gst > 1 ? v.gst : 150);
      // Vitlöksklyftor: ett huvud har ungefär tio. Annat (msk, dl) räknas som en fjärdedel per enhet; hela förpackningar räknas i korgen
      if (/^klyft/.test(u)) return q / 10;
      return q / 4;
    }
    switch (u) {
      case 'g': return q;
      case 'kg': return q * 1000;
      case 'hg': return q * 100;
      case 'dl': return q * (v.gdl || 100);
      case 'l': return q * 10 * (v.gdl || 100);
      case 'msk': return q * 15;
      case 'tsk': return q * 5;
      case 'burk': case 'burkar': case 'påse': case 'paket': case 'förp': return q * mal;
      case 'st': case 'skivor': case 'stjälkar': return q * (v.gst || mal / 4);
      case 'näve': return q * 30;
      default: return q * (v.gst || 100);
    }
  }
  /* Behov för en rätt: {basvara: {m, v}} där m är mängden. f = portionsfaktor. */
  function behov(r, f) {
    f = f || 1;
    const out = {};
    (r.groups || []).forEach(g => (g.items || []).forEach(it => {
      const v = vara(it.n); if (!v) return;
      // Nya recept får inte få en påhittad mängd för "efter smak" eller en oklar import.
      if (r._root && it.q == null) return;
      const m = mangd(it, v) * f, x = (out[v.k] ||= { m: 0, v, namn: [] });
      x.m += m; const n = norm(it.n); if (!x.namn.includes(n)) x.namn.push(n);
    }));
    return out;
  }
  /* En korg med varor: vad som måste köpas för rätterna, vad det kostar och vad som blir över.
     lager = {basvara: mängd} som redan finns hemma (skafferi och frys) och används först.
     kr = det ni betalar i kassan. kostnad = det veckan gör av med: det som äts plus det som slängs.
     Det som blir över av varor som håller läggs i lagret till nästa vecka. */
  function korg(behovLista, lager) {
    lager = lager || {};
    const sum = {};
    behovLista.forEach(b => Object.entries(b).forEach(([k, x]) => { const y = (sum[k] ||= { m: 0, v: x.v, namn: [] }); y.m += x.m; (x.namn || []).forEach(n => { if (!y.namn.includes(n)) y.namn.push(n) }) }));
    let kr = 0, forbrukat = 0, svinn = 0; const rad = [], rest = Object.assign({}, lager);
    Object.entries(sum).forEach(([k, x]) => {
      const fran = Math.min(x.m, lager[k] || 0), kop = x.m - fran;
      const n = Math.ceil(kop / x.v.pkt - 1e-9), over = n * x.v.pkt - kop, perG = x.v.kr / x.v.pkt;
      kr += n * x.v.kr; forbrukat += x.m * perG;
      rest[k] = (lager[k] || 0) - fran + (x.v.hall ? over : 0);
      if (!rest[k]) delete rest[k];
      if (!x.v.hall) svinn += over * perG;
      rad.push({ k, n, kr: n * x.v.kr, okand: !!x.v.okand, fran, over, overKr: over * perG, hall: x.v.hall, namn: x.namn, m: x.m, pkt: x.v.pkt, st: x.v.st, los: x.v.los });
    });
    return { kr, kostnad: forbrukat + svinn, forbrukat, svinn, rad, rest, antal: rad.filter(x => x.n).length };
  }
  /* Vad en rätt kostar extra om den läggs till de rätter som redan valts, och hur mycket av den som redan finns hemma eller blir över. */
  function tillagg(valdaBehov, kandBehov, lager) {
    const fore = korg(valdaBehov, lager), efter = korg(valdaBehov.concat([kandBehov]), lager), ensam = korg([kandBehov]);
    const marginal = efter.kostnad - fore.kostnad, kassa = efter.kr - fore.kr;
    // Återanvändning: andelen av rätten som inte behöver köpas, eller hur mycket svinn den räddar (40 kr räddat ger full)
    const andel = ensam.kr > 0 ? 1 - kassa / ensam.kr : 0, raddat = (fore.svinn - efter.svinn + ensam.svinn) / 40;
    const ateranvandning = Math.max(0, Math.min(1, Math.max(andel, raddat)));
    // Vilka varor rätten delar: där den behöver färre nya förpackningar än om den lagades ensam, för att det blir över av en vara som redan köps (eller finns hemma)
    const n = (k, x) => { const y = x.rad.find(r => r.k === k); return y ? y.n : 0 };
    const delar = ensam.rad.filter(r => n(r.k, efter) - n(r.k, fore) < r.n).map(r => r.namn && r.namn.length ? r.namn[0] : r.k);
    return { marginal, kassa, ensam: ensam.kostnad, ensamKr: ensam.kr, ateranvandning, delar, svinnFore: fore.svinn, svinnEfter: efter.svinn };
  }
  // Hur mycket som ska köpas, i ord: "2 st", "1 kg", "2 × 400 g", "1 förp (24 st)"
  function forp(x) {
    if (x.st != null ? x.st : x.pkt <= 12) return x.pkt === 1 ? x.n + ' st' : x.n + ' förp (' + x.pkt + ' st)';
    // Drycker och annat flytande säljs i liter och deciliter
    const p = Math.round(x.pkt), fl = /^(mjölk|matlagningsgrädde|kokosmjölk|olja|vinäger|soja|vitt vin)$/.test(x.k || '');
    const g = p >= 1000 ? String(Math.round(p / 100) / 10).replace('.', ',') + (fl ? ' l' : ' kg') : fl && p % 10 === 0 ? String(p / 100).replace('.', ',') + ' dl' : p + (fl ? ' ml' : ' g');
    return x.n === 1 ? g : x.n + ' × ' + g;
  }
  // Det en rätt gör av med i kronor: använd mängd × pris per gram eller styck. Varor utan pris räknas inte (saknas = antal)
  function anvant(b) {
    let kr = 0, saknas = 0;
    Object.values(b).forEach(x => { if (x.v.okand) saknas++; else kr += x.m * x.v.kr / x.v.pkt; });
    return { kr, saknas };
  }
  root.MatVaror = { V, SK, setPriser, vara, skafferi, mangd, behov, korg, tillagg, forp, anvant, rent };
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module !== 'undefined') module.exports = globalThis.MatVaror;
