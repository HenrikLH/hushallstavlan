// Tolv månader med riktiga väderkort; endast klocka och väderdata emuleras.
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(200);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(350);
 if(process.env.WX_EMOJI_CSS){await pg.addStyleTag({path:process.env.WX_EMOJI_CSS});await pg.evaluate(()=>document.fonts.ready)}
 await read('window.__yearSaved={Date:window.Date,model:wxModel,W:wxModel(),art:WXART,snow:lsGet("snow"),variant:S.wxVar}');
 const scenes=[
 ['Januari','2026-01-15T12:00:00+01:00','heavysnow',-7,3,95,15,'Kraftigt snöfall'],
 ['Februari','2026-02-15T22:00:00+01:00','clearsky',-10,0,0,7,'Klar vinternatt'],
 ['Mars','2026-03-15T12:00:00+01:00','sleet',1,1,85,1,'Snöblandat regn'],
 ['April','2026-04-15T12:00:00+02:00','lightrain',8,.4,80,0,'Vårregn'],
 ['Maj','2026-05-15T12:00:00+02:00','fair',17,0,18,0,'Lätt molnighet'],
 ['Juni','2026-06-15T13:00:00+02:00','clearsky',25,0,0,0,'Sol och sommarvärme'],
 ['Juli','2026-07-15T15:00:00+02:00','heavyrainandthunder',21,5,100,0,'Åska och skyfall'],
 ['Augusti','2026-08-15T19:00:00+02:00','rain',18,1.5,90,0,'Sommarregn'],
 ['September','2026-09-15T08:00:00+02:00','fog',10,0,100,0,'Morgondimma'],
 ['Oktober','2026-10-15T12:00:00+02:00','cloudy',8,0,100,0,'Mulet och blåsigt'],
 ['November','2026-11-15T12:00:00+01:00','partlycloudy',-2,0,50,0,'Frost och halvklart'],
 ['December','2026-12-15T21:00:00+01:00','lightsnow',-4,.4,70,9,'Snöig decembernatt']];
 try{for(let i=0;i<scenes.length;i++){
  const [month,date,sym,T,pr,cf,cm,label]=scenes[i];
  await read(`(()=>{const saved=window.__yearSaved,now=new saved.Date('${date}').getTime();window.Date=class extends saved.Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};const W=saved.W,n={...W.now,s:'${sym}',T:${T},pr:${pr},cf:${cf},w:${month==='Oktober'?12:pr?6:2},wd:230};wxModel=()=>({...W,now:n,hours:W.hours.map(x=>({...x,...n})),days:W.days.map(x=>({...x,min:${T},max:${T}}))});WXART='geo';S.wxVar=null;lsSet('snow',JSON.stringify({at:now,cm:${cm}}));render()})()`);
  await h.idle(180);
  await pg.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.wx2 image')].map(e=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=e.getAttribute('href')})));document.getAnimations().forEach(a=>{a.pause();a.currentTime=43750})});
  assert.equal(await pg.locator('.wx2 .geo-tree').count(),1);
  assert.equal(await pg.locator('.wx2 .geo-sprite').count(),2);
  assert.equal(await pg.locator('.wx2').evaluate(e=>/NaN|undefined/.test(e.innerHTML)),false);
  await pg.locator('.wx2').screenshot({path:path.join(h.OUT,String(i+1).padStart(2,'0')+'.png')});
  console.log('PASS',month,label);
 }
 require('node:fs').writeFileSync(path.join(h.OUT,'manader.json'),JSON.stringify(scenes.map((s,i)=>({file:String(i+1).padStart(2,'0')+'.png',month:s[0],label:s[7]}))));
 }finally{await read('(()=>{const s=window.__yearSaved;window.Date=s.Date;wxModel=s.model;WXART=s.art;S.wxVar=s.variant;lsSet("snow",s.snow);delete window.__yearSaved;render()})()')}
};
