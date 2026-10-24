// Ögonblicksbild av kalkylarket 2026-10-18 (bara mat och inställningar, ingen ekonomi). Används av gas.js.
const insp=require('../../inspiration.json');
const I=id=>insp.find(x=>x.id===id);
const ing=r=>(r.groups||[]).map(g=>(g.title?'# '+g.title+'\n':'')+(g.items||[]).map(i=>(i.q==null?'':String(i.q).replace('.',','))+' | '+(i.u||'')+' | '+i.n).join('\n')).join('\n');
const st=r=>(r.steps||[]).map(x=>(x.timer?'['+x.timer+'] ':'')+x.t).join('\n');
const fromInsp=(id,por)=>{const r=I(id);return [r.id,r.group,r.who,'Bytt i appen',r.title,por||r.portions,r.min,r.kr,r.protein||'',r.freezes?'ja':'',r.course||'',r.why||'',ing(r),st(r),r.tips||'']};
const recipes=[
['storkok-kyckling','Storkok','Henrik','Sön 18/10','Storkok: kycklinggryta med champinjoner, purjolök och matvete',5,50,30,'55 g/port','ja','','Kycklinglårfilé och kvarg.','1,25 | kg | kycklinglårfilé\n250 | g | champinjoner\n2 | st | purjolökar\n1 | st | gul lök\n3 | st | morötter\n500 | g | kvarg naturell\n500 | g | fryst broccoli\n350 | g | matvete','[12] Koka matvetet.\n[5] Bryn kycklingen.\n[15] Puttra.\nFördela i 5 lådor.','Håller 3–4 dagar.'],
['storkok-dal','Storkok','Vegetariskt','Sön 18/10','Storkok: dal på röda linser och kikärtor med spenat',5,45,15,'22 g/port','ja','','Linser och kikärtor.','350 | g | röda linser\n1 | burk | kikärtor (380 g)\n2 | st | gula lökar\n2 | burkar | krossade tomater\n300 | g | fryst bladspenat\n350 | g | matvete','[12] Koka matvetet.\n[20] Koka dal.\nFördela i 5 lådor.',''],
['flask-ugn','Vardag','Henrik','Tis 13/10 + ons','Fläskytterfilé med rostade morötter, broccoli och kvargsås',2,35,32,'50 g/port','','','','400 | g | fläskytterfilé\n4 | st | morötter\n300 | g | fryst broccoli\n250 | g | kvarg naturell','[25] Rosta.\nServera.',''],
['shakshuka','Vardag','Vegetariskt','Tis 13/10','Shakshuka med kikärtor, spenat och fetaost',2,30,22,'24 g/port','','','','1 | st | gul lök\n1 | burk | krossade tomater\n1 | burk | kikärtor (380 g)\n4 | st | ägg\n75 | g | fetaost','[5] Fräs.\n[7] Ägg.',''],
['linssoppa','Vardag','Vegetariskt','Ons 14/10','Röd linssoppa med morötter och rågbröd',2,30,12,'18 g/port','','','','150 | g | röda linser\n2 | st | morötter\n1 | burk | krossade tomater','[15] Koka.',''],
['kyckling-purjo','Vardag','Henrik','Tor 15/10','Kycklinglårfilé med purjolök och matvete',1,25,28,'55 g/port','','','','250 | g | kycklinglårfilé\n1 | st | purjolök\n70 | g | matvete','[8] Stek.',''],
['blomkal','Vardag','Vegetariskt','Tor 15/10','Rostad blomkål och kikärtor med citronyoghurt och fetaost',2,35,22,'22 g/port','','','','1 | st | blomkål\n1 | burk | kikärtor (380 g)\n2 | dl | naturell yoghurt','[25] Rosta.',''],
['grekisk','Helg','Gemensam','Fre 16/10','Grekisk fredag: rostad aubergine, bulgursallad och tzatziki',2,45,38,'Henrik ca 50 g','','','','# Gemensamt\n2 | st | auberginer\n1,5 | dl | fullkornsbulgur\n# Henriks souvlaki\n200 | g | fläskytterfilé','[30] Rosta.',''],
['blabar','Helg','Gemensam','Fre 16/10','Varma blåbär med kvarg och rostade valnötter',2,10,12,'','','efterrätt','','250 | g | frysta blåbär\n250 | g | kvarg naturell\n50 | g | valnötter','[3] Rosta valnötterna.',''],
['purjosoppa','Helg','Gemensam','Sön 18/10','Purjolöks- och vitbönssoppa med pumpafrön',2,30,16,'Henrik ca 45 g','','','En enkel söndagsmiddag.','# Gemensamt\n2 | st | purjolökar\n2 | burkar | vita bönor\n# Henriks proteintillägg\n250 | g | fläskytterfilé','[6] Fräs.\n[10] Koka.',''],
fromInsp('insp-sk-artsoppa',6),fromInsp('insp-sk-marockansk-kikarta'),fromInsp('insp-edamamewok-jordnot'),fromInsp('insp-halloumi-rotfrukter'),
fromInsp('insp-thaicurry'),fromInsp('insp-pastagratang-spenat',3),fromInsp('insp-kikartsgryta-storkok'),fromInsp('insp-sk-svart-bongryta'),
fromInsp('insp-notfarsbiffar-rodbetor'),fromInsp('insp-rotfruktsgratang-linser',3),fromInsp('insp-bonpaella')];
const bank=[I('insp-barsmulpaj'),I('insp-ugnsappen'),I('insp-hallonpaj-cheesecake')].map(r=>Object.assign({},r,{savedAt:'2026-10-17',fav:true}));
bank.unshift({id:'shakshuka',group:'Vardag',who:'Vegetariskt',title:'Shakshuka med kikärtor, spenat och fetaost',portions:2,min:30,kr:22,protein:'24 g/port',freezes:false,course:'',why:'',groups:[{title:'',items:[{q:1,u:'st',n:'gul lök'},{q:4,u:'st',n:'ägg'}]}],steps:[{t:'Fräs.'}],tips:'',savedAt:'2026-10-14'},
 {id:'flask-ugn',group:'Vardag',who:'Henrik',title:'Fläskytterfilé med rostade morötter, broccoli och kvargsås',portions:2,min:35,kr:32,protein:'50 g/port',freezes:false,course:'',why:'',groups:[{title:'',items:[{q:400,u:'g',n:'fläskytterfilé'}]}],steps:[{t:'Rosta.'}],tips:'',savedAt:'2026-10-14'});
const settings=[
['vecka_rubrik','Vecka 43 · mån 19 – sön 25 oktober'],['vecka_start','2026-10-19'],['vecka_slut','2026-10-25'],['uppdaterad','2026-10-18'],
['storkok','insp-sk-artsoppa, insp-sk-marockansk-kikarta'],['storkok_not','Lagas i helgen. Räcker till lunch måndag–fredag veckan efter.'],
['erbjudanden_not','Erbjudandena gäller till och med söndag 18/10.'],['personer','Henrik:h207s4, Cornelia:h132s1'],['stadtid_vardag','20'],['stadtid_helg','40'],['stadtid_idag','2026-10-17|20'],
['matbudget','800'],['pref_henrik','Äter kött.'],['pref_veg','Lakto-ovo-vegetarian.'],['pref_ekonomi','Billigt per portion.'],['notis_stad','07:30'],['notis_uppgifter','08:00'],['notis_veckoplan_skickad','2026-10-18'],
['betyg',JSON.stringify({blomkal:{p:{},t:'Rostad blomkål och kikärtor med citronyoghurt och fetaost',sm:[['2026-10-15',1,'Henrik','2026-10-16']]},'kyckling-purjo':{p:{},t:'Kycklinglårfilé med purjolök och matvete',sm:[['2026-10-15',-1,'Henrik','2026-10-16']]},grekisk:{p:{},t:'Grekisk fredag: rostad aubergine, bulgursallad och tzatziki',sm:[['2026-10-16','x','Cornelia','2026-10-16']]}})],
['onskelista',JSON.stringify([{efter:1,v:'2026-10-19',id:'insp-hallonpaj-cheesecake'},{las:1,v:'2026-10-19',ids:['insp-sk-artsoppa','insp-rotfruktsgratang-linser','insp-notfarsbiffar-rodbetor','insp-sk-marockansk-kikarta']}])],
['receptbank_1',JSON.stringify(bank)],['receptbank_2','[]'],['receptbank_3','[]'],['receptbank_4','[]'],['receptbank_5','[]'],['receptbank_6','[]'],['receptbank_7','[]'],
['ekonomi','{}'],['ekonomi_inkomst','{}'],['pref_ovrigt',''],
['frekvens',JSON.stringify({'kyckling-purjo':{n:1,l:'2026-10-15',t:'Kycklinglårfilé med purjolök och matvete'},blomkal:{n:1,l:'2026-10-15',t:'Rostad blomkål och kikärtor med citronyoghurt och fetaost'}})],
['receptlogg',JSON.stringify({'flask-ugn':'2026-10-13',shakshuka:'2026-10-13',linssoppa:'2026-10-14','kyckling-purjo':'2026-10-15',blomkal:'2026-10-15',grekisk:'2026-10-16',blabar:'2026-10-16',purjosoppa:'2026-10-18','storkok-kyckling':'2026-10-18','storkok-dal':'2026-10-18'})],
['fodelsedagar','[]'],['kcal',JSON.stringify({'storkok-kyckling':760,'storkok-dal':720,'flask-ugn':550,shakshuka:600,linssoppa:500,'kyckling-purjo':740,blomkal:620,grekisk:730,blabar:300,purjosoppa:500})],
// Willyspriser i formatet före fp (urval från arket 2026-10-24)
['priser',JSON.stringify(require('./fixtures/priser.json'))],
['lager',JSON.stringify({'gula ärtor':413,'fläsk':413,'gul lök':640,'krossade tomater':263,bulgur:280,'gröna linser':470,ris:855,pasta:37,spenat:102,'riven ost':163,'kycklingfilé':537,morot:760,palsternacka:200,'rödlök':300,'fryst spenat':235,'frysta grönsaker':200,nudlar:50,'räkor':200})]];
const menu=[
['2026-10-17','Borta','Middag hos Matilda','','','Ingen matlagning hemma.'],
['2026-10-18','Gemensam','Purjolöks- och vitbönssoppa med pumpafrön','purjosoppa','stekt fläskytterfilé','Enkel middag eftersom storkoken lagas samma dag.'],
['2026-10-18','Henrik','Storkok: kycklinggryta med champinjoner och purjolök','storkok-kyckling','',''],
['2026-10-18','Vegetariskt','Storkok: dal på röda linser och kikärtor','storkok-dal','',''],
['2026-10-25','Henrik','Storkok: ärtsoppa med fläsk','insp-sk-artsoppa','','Lagas i helgen, lunch nästa vecka (5 portioner)'],
['2026-10-21','Gemensam','Nötfärsbiffar med lök, rödbetor och ugnspotatis','insp-notfarsbiffar-rodbetor','','Lagas 5 portioner'],
['2026-10-19','Gemensam','Rotfruktsgratäng med linser','insp-rotfruktsgratang-linser','',''],
['2026-10-23','Gemensam','Paella med bönor och grönsaker','insp-bonpaella','','Lagas 4 portioner'],
['2026-10-25','Vegetariskt','Storkok: marockansk kikärtsgryta med morot och kanel','insp-sk-marockansk-kikarta','','Lagas i helgen, lunch nästa vecka']];
const shop=[[false,'Frysta edamamebönor','500 g','Frys','Vardag',20,'','','plan20261019-0','veckoplan','',800]];
module.exports={
 'Inköp':[['Klar','Vara','Mängd','Kategori','Till rätt','Pris (kr)','Erbjudande','Butik','Id','Källa','Tillagd av','Ordning'],...shop],
 'Uppgifter':[['Klar','Uppgift','Datum','Vem','Not','Id','Källa','Upprepa']],
 'Städ':[['id','room','title','freq','min','lastDone','prevDone','doneBy','who','tip','plannedFor','snoozeUntil','order']],
 'Matsedel':[['Datum','Vem','Rätt','Recept','Henriks tillägg','Not'],...menu],
 'Händelser':[['Datum','Tid','Titel','Vem','Källa','Id','Flaggor']],
 'Recept':[['Id','Grupp','Vem','När','Rätt','Portioner','Minuter','Kr per portion','Protein','Går att frysa','Typ','Motivering','Ingredienser','Steg','Tips'],...recipes],
 'Erbjudanden':[['Vara','Pris','Butik','Not']],
 'Inställningar':[['Nyckel','Värde'],...settings]};
