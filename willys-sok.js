/* Willys-sökningar för den dagliga prisuppdateringen i Apps Script (prisSynk i Kod.gs).
   Appen läser inte den här filen. Kod.gs hämtar den från GitHub Pages varje gång, så sökningarna
   kan rättas här utan att Kod.gs behöver klistras in igen.
   Per vara: [sökord på willys.se, produktnamnet måste matcha, produktnamnet får inte matcha].
   Billigaste träffen (per kg, liter eller styck) används, så mönstren ska bara släppa igenom själva råvaran:
   de flesta kräver att produktnamnet börjar med varan ("Broccoli Klass 1", inte "Ost & Broccoli soppa").
   Varor som inte finns här (ingredienser utan basvara) söks på sitt namn och produktnamnet måste börja med det. */
(function (root) {
  // Aldrig råvaror: djurmat, barnmat, färdigrätter, godis, drycker och liknande
  const ALLTID = /katt|hund|torrfoder|våtfoder|barnmat|månader|gröt|soppa|pulver|chips|godis|dryck|drink|juice|smoothie|muffins|skorpor|paj|gryta|kaka|glass|snacks|pålägg|färdigrätt|wok med|sallad med|rulle/i;
  const S = {
    'potatis': ['potatis', /^potatis/i, /söt|gratäng|mos|klyft|pommes|sallad|fryst|rösti|bakad/i],
    'sötpotatis': ['sötpotatis', /^sötpotatis/i, /fryst|pommes/i],
    'gul lök': ['gul lök', /^lök gul|^gul lök/i, /fryst|stekt|hackad|rostad|eko/i],
    'rödlök': ['rödlök', /^lök röd|^rödlök/i, /fryst|picklad|syltad|inlagd/i],
    'purjolök': ['purjolök', /^purjo/i, /fryst/i],
    'salladslök': ['salladslök', /^salladslök/i, /fryst|torkad/i],
    'morot': ['morötter', /^morot|^morötter/i, /fryst|riven|baby|stav/i],
    'palsternacka': ['palsternacka', /^palsternack/i, /fryst/i],
    'rotselleri': ['rotselleri', /^rotselleri/i, /fryst/i],
    'paprika': ['paprika', /^paprika (röd|gul|grön|orange|mix)/i, /pulver|krydd|grillad|fryst|sivri|snack|mini|spets|chili/i],
    'zucchini': ['zucchini', /^zucchini|^squash/i, /fryst|spiral|nudl/i],
    'aubergine': ['aubergine', /^aubergine/i, /fryst|grillad|kräm/i],
    'gurka': ['gurka', /^gurka/i, /syltad|inlagd|smörgås|salt|ättik|pickl/i],
    'tomat': ['tomater', /^tomat(er)? (runda|klass|kvist|eko)|^kvisttomat|^plommontomat/i, /krossad|puré|passerad|soltork|körsbär|cocktail|burk|ketchup|sås/i],
    'körsbärstomater': ['körsbärstomater', /^(körsbärs|cocktail|mini|snack)\s*-?\s*tomat|^tomat(er)? (körsbär|cocktail|mini)/i, /burk|krossad|soltork|sås|juice|i tomat|mutti|cirio|eldorado|konserv|passata/i],
    'broccoli': ['broccoli', /^broccoli/i, /fryst/i],
    'blomkål': ['blomkål', /^blomkål/i, /fryst|ris|gratäng/i],
    'vitkål': ['vitkål', /^vitkål/i, /strimlad|riven|inlagd|sallad/i],
    'grönkål': ['grönkål', /^grönkål/i, /fryst/i],
    'champinjoner': ['champinjoner', /^champinjon.*klass/i, /burk|konserv|fryst|sås|skivade,? eldorado/i],
    'avokado': ['avokado', /^avokado/i, /guacamole|kräm|fryst|olja/i],
    'sallad': ['isbergssallad', /^isberg|^sallad (isberg|roman|huvud)|^romansallad/i, /fryst/i],
    'fryst spenat': ['spenat fryst', /(?=.*spenat)(?=.*fryst)/i, /stuvad|krämig/i],
    'spenat': ['babyspenat', /^(baby)?spenat/i, /fryst|stuvad/i],
    'citron': ['citron', /^citron(er)?( klass| eko| i nät| \d|$)/i, /curd|pepp|krydd/i],
    'lime': ['lime', /^lime( klass| eko| i nät| \d|$)/i, /blad|saft/i],
    'äpple': ['äpple', /^äpple|^äpplen/i, /must|mos|cider|ringar|torkad/i],
    'banan': ['banan', /^banan(er)?( klass| eko| \d|$)/i, /torkad/i],
    'färska örter': ['persilja', /^(persilja|koriander|dill|basilika|mynta)/i, /torkad|fryst|burk|krydd/i],
    'krossade tomater': ['krossade tomater', /^tomater krossade|^krossade tomater/i, /örter|vitlök|chili|basilika|lök/i],
    'kikärtor': ['kikärtor', /^kikärt/i, /torkad|hummus|rostad|mjöl/i],
    'bönor på burk': ['kidneybönor', /^(kidneybönor|svarta bönor|vita bönor|bönor)/i, /torkad|sås|chili|bakade|fryst|grön/i],
    'röda linser': ['röda linser', /^röda linser|^linser röda/i, /kokta/i],
    'gröna linser': ['gröna linser', /^gröna linser|^linser gröna|^beluga/i, /kokta/i],
    'gula ärtor': ['gula ärtor', /gula ärt|ärt\w* gula/i, /kokta/i],
    'ris': ['jasminris', /^(jasminris|basmatiris|långkornigt ris|ris jasmin|ris basmati|parboiled)/i, /kokt|färdig|fryst|1 min|express|påse.*kok/i],
    'bulgur': ['bulgur', /^bulgur/i, /färdig|kokt/i],
    'matvete och matkorn': ['matvete', /^(matvete|matkorn)/i, /färdig|kokt/i],
    'quinoa': ['quinoa', /^quinoa/i, /färdig|kokt|crisp/i],
    'pasta': ['pasta', /^(pasta|spaghetti|penne|makaroner|fusilli|farfalle|tagliatelle|snabbmakaroner)/i, /sås|färsk|fylld|tortellini|ravioli|färdig|fryst|gratäng/i],
    'nudlar': ['äggnudlar', /^(ägg|ris|vete|udon|glas)nudlar|^nudlar (ägg|ris|vete)/i, /kopp|cup|smak|ramen|kimchi|korean|biff|kyckling|räk/i],
    'tortillas och bröd': ['tortilla', /^tortilla/i, /krydd|sås|kit|bowl|tubs/i],
    'bröd': ['rågbröd', /^(rågbröd|fullkornsbröd|grovt bröd|limpa|levain)/i, /knäck|ströbröd|fryst|orientalisk/i],
    'havregryn': ['havregryn', /^havregryn/i, /bar|müsli|granola/i],
    'yoghurt': ['yoghurt naturell', /yoghurt/i, /fryst|bär|vanilj|jordgubb|hallon|blåbär|persika|mango|choklad|müsli|kvarg|päron|äpple|citron/i],
    'kvarg': ['kvarg naturell', /kvarg/i, /vanilj|bär|jordgubb|hallon|blåbär|mango|choklad|citron|päron|äpple/i],
    'keso': ['keso', /^(keso|kesella|cottage)/i, /ananas|bär|smaksatt/i],
    'mjölk': ['mellanmjölk', /^(mellan|standard|lätt)mjölk/i, /choklad|laktosfri|pulver/i],
    'crème fraiche och gräddfil': ['crème fraiche', /^(crème|creme|gräddfil)/i, /chili|örter|vitlök|paprika|lök|tomat|ost|smaksatt/i],
    'matlagningsgrädde': ['matlagningsgrädde', /^(matlagningsgrädde|matgrädde)/i, /vego|havre|soja/i],
    'riven ost': ['riven ost', /riven/i, /pizza|vego|vegansk/i],
    'fetaost': ['fetaost', /^(fetaost|feta |salladsost)/i, /oliver|krydd|röra|soltork|fryst/i],
    'halloumi': ['halloumi', /^(halloumi|grillost)/i, /fries|panerad|krydd|fryst/i],
    'kycklingfilé': ['kycklingfilé', /^(kycklingfilé|kycklingbröst|kyckling bröstfilé)/i, /panerad|marinerad|tikka|grillad|skivad|kokt|rökt|krydd|teriyaki|bbq/i],
    'kalkon': ['kalkon', /^kalkon(filé|bröst| filé| bröst)?/i, /skivad|färs|korv|rökt|kokt|bacon/i],
    'färs': ['nötfärs', /^(nötfärs|blandfärs|fläskfärs)/i, /vego|vegansk|soja/i],
    'rimmat fläsk': ['bacon', /^(bacon|sidfläsk|rimmat|fläsklägg)/i, /vego|krydd|ost/i],
    'fläsk': ['fläskfilé', /^(fläskfilé|fläskytterfilé|fläskkotlett|kotlett|kassler|fläskkarré)/i, /panerad|grillad|skivad|kokt/i],
    'lax': ['laxfilé', /^lax/i, /rökt|gravad|kall|sås|burk|röra|krydd|panerad|biff|bullar/i],
    'vit fisk': ['torskfilé', /^(torsk|sej|alaska)/i, /panerad|sås|burk|rom|lever|griljerad|bullar|gratäng|pinnar/i],
    'räkor': ['räkor', /^räkor/i, /röra|smörgås|lake|sås|ost/i],
    'tonfisk': ['tonfisk', /^tonfisk/i, /sallad|röra|krydd|chili|tomat/i],
    'tofu': ['tofu', /tofu/i, /krydd|marinerad|rökt|grillad|sås/i],
    'frysta grönsaker': ['frysta grönsaker', /(?=.*(grönsak|wok|ärtor|haricot|majs|blandning|bönor))(?=.*fryst)/i, /sås|pommes|potatis|mos|gratäng/i],
    'bär': ['frysta bär', /(?=.*(bär|hallon|jordgubb|blåbär|lingon))(?=.*fryst)/i, /sylt|yoghurt|müsli|choklad|torkade/i],
    'kokosmjölk': ['kokosmjölk', /^kokosmjölk/i, /light|pulver/i],
    'pesto och hummus': ['hummus', /^(pesto|hummus)/i, /krydd/i],
    'nötter och frön': ['cashewnötter', /^(cashew|valnöt|mandl|hasselnöt|pumpakärnor|pumpafrö|chiafrö|naturella cashew)/i, /choklad|salt|rost|smör|mjöl|mix|honung|krydd/i],
    'oliver': ['oliver', /oliver/i, /olja|tapenade|röra|pizza/i],
    'rödbetor': ['rödbetor', /^rödbet/i, /sallad/i],
    'ägg': ['ägg', /^ägg/i, /choklad|påsk|kokta|nudlar|pasta|vita|krydd|röra|kaka|sallad/i],
    // Ingredienser utan egen basvara
    'digestivekex': ['digestivekex', /^digestive/i, /choklad/i],
    'selleri': ['selleri', /selleri/i, /rot|salt|fryst|frö/i],
    'butternutpumpa': ['butternut', /butternut/i, /fryst/i],
    'rabarber': ['rabarber', /^rabarber/i, /fryst|sylt|kompott|saft|glas/i]
  };
  const ord = k => new RegExp('^' + k.split(/\s+/)[0].slice(0, 5).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const lagg = (k, s) => [s[0], s[1] || ord(k), s[2] ? new RegExp('(?:' + s[2].source + ')|(?:' + ALLTID.source + ')', 'i') : ALLTID];
  const ut = {};
  Object.keys(S).forEach(k => { ut[k] = lagg(k, S[k]); });
  // Varor som saknas ovan får standardsökningen (namnet, produktnamnet börjar med det) och samma undantag
  root.WillysSok = typeof Proxy === 'function'
    ? new Proxy(ut, { get: (o, k) => typeof k !== 'string' ? o[k] : (o[k] || lagg(k, [k])) })
    : ut;
})(typeof window !== 'undefined' ? window : globalThis);
