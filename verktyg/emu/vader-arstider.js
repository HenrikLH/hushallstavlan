// Geometriska väderbilden genom året och i olika väder: en bild per scen (shots/ar-NN.png) och ar.json med etiketter.
// Kör: LS='{"wxart":"geo","wxvy":"bild","hundar":"bada"}' SCENER=scener.json node verktyg/emu/run.js verktyg/emu/vader-arstider.js
// SCENER: JSON-lista [etikett, datum, symbol, temp, mm/h, molnprocent, snö-cm]; utan den används en lista över årets steg.
const fs=require('node:fs'),path=require('node:path');
const STD=[['15 mars','2026-03-15T12:00:00+01:00','cloudy',4,0,80,0],['5 april','2026-04-05T12:00:00+02:00','fair',9,0,30,0],['20 april','2026-04-20T12:00:00+02:00','partlycloudy',12,0,50,0],
 ['1 maj','2026-05-01T12:00:00+02:00','clearsky',15,0,0,0],['15 maj','2026-05-15T12:00:00+02:00','fair',17,0,20,0],['15 juni','2026-06-15T12:00:00+02:00','clearsky',23,0,0,0],
 ['20 aug','2026-08-20T12:00:00+02:00','fair',20,0,20,0],['15 sep','2026-09-15T12:00:00+02:00','partlycloudy',14,0,50,0],['30 sep','2026-09-30T12:00:00+02:00','cloudy',11,0,90,0],
 ['12 okt','2026-10-12T12:00:00+02:00','fair',9,0,30,0],['25 okt','2026-10-25T12:00:00+01:00','cloudy',7,0,90,0],['5 nov','2026-11-05T12:00:00+01:00','rain',6,1.5,100,0],
 ['15 nov','2026-11-15T12:00:00+01:00','partlycloudy',-2,0,50,0],['10 dec','2026-12-10T12:00:00+01:00','lightsnow',-1,.3,90,1],['15 jan','2026-01-15T12:00:00+01:00','cloudy',-4,0,90,6],['1 feb','2026-02-01T12:00:00+01:00','heavysnow',-6,2,100,25]];
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),scenes=process.env.SCENER?JSON.parse(fs.readFileSync(process.env.SCENER,'utf8')):STD;
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(200);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(350);
 await read('window.__yearSaved={Date:window.Date,model:wxModel,W:wxModel(),art:WXART,snow:lsGet("snow"),variant:S.wxVar}');
 try{for(let i=0;i<scenes.length;i++){const [label,date,sym,T,pr,cf,cm]=scenes[i];
  await read(`(()=>{const saved=window.__yearSaved,now=new saved.Date('${date}').getTime();window.Date=class extends saved.Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};const W=saved.W,n={...W.now,s:'${sym}',T:${T},pr:${pr},cf:${cf},w:${pr?6:2},wd:230};wxModel=()=>({...W,now:n,hours:W.hours.map(x=>({...x,...n})),days:W.days.map(x=>({...x,min:${T},max:${T}}))});S.wxVar=null;lsSet('snow',JSON.stringify({at:now,cm:${cm}}));render()})()`);
  await h.idle(180);
  await pg.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.wx2 image')].map(e=>new Promise((ok,no)=>{const im=new Image();im.onload=ok;im.onerror=no;im.src=e.getAttribute('href')})));document.getAnimations().forEach(a=>{a.pause();a.currentTime=43750})});
  if(await pg.locator('.wx2').evaluate(e=>/NaN|undefined/.test(e.innerHTML)))throw new Error('NaN i bilden: '+label);
  await pg.locator('.wx2').screenshot({path:path.join(h.OUT,'ar-'+String(i+1).padStart(2,'0')+'.png')});console.log('SCEN',label);
 }
 fs.writeFileSync(path.join(h.OUT,'ar.json'),JSON.stringify(scenes.map((s,i)=>({file:'ar-'+String(i+1).padStart(2,'0')+'.png',label:s[0]+', '+s[2]+', '+s[3]+'°'+(s[6]?', '+s[6]+' cm snö':'')}))));
 }finally{await read('(()=>{const s=window.__yearSaved;window.Date=s.Date;wxModel=s.model;WXART=s.art;S.wxVar=s.variant;lsSet("snow",s.snow);delete window.__yearSaved;render()})()')}
};
