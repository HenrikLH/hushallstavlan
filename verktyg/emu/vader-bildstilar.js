// Bildstilar delar vädermodellen. Kontrollera kombinationer, SVG-resurser, riktiga menyval och omstart.
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(180)};
 const settings=async()=>{if(await read('S.view')==='vader')await click('main [data-act="nav"][data-id="oversikt"]');await click('[data-act="settings"]');const sec=pg.locator('[data-k="pref-oversikt"]');if(!await sec.evaluate(e=>e.open))await sec.locator('summary').click()};
 const close=()=>click('.sheet [data-act="sheetClose"]');
 const nav=async()=>{if(await read('S.view')==='vader')return;await click('#nav [data-id="oversikt"]');await click('[data-act="nav"][data-id="vader"]')};
 const boot=process.env.ART||'geo';
 await settings();assert.equal(await pg.locator('[data-act="wxart"]').count(),3);await click('[data-act="wxvy"][data-id="bild"]');await click('[data-act="hundar"][data-id="bada"]');await close();
 for(const art of ['original','soft','geo']){
  await settings();await click('[data-act="wxart"][data-id="'+art+'"]');assert.equal(await read('WXART'),art);await close();await nav();
  assert.equal(await pg.locator('.wx2').count(),1);assert.equal(await pg.locator('.wx2.art-'+art).count(),art==='original'?0:1);
  if(art==='geo'){const scene=await pg.locator('.wx2').evaluate(e=>{const card=e.getBoundingClientRect(),world=e.querySelector('.geo-world').getBoundingClientRect(),dogs=e.querySelector('.fig-box').getBoundingClientRect();return{worldWidth:world.width,cardWidth:card.width,dogsWidth:dogs.width,worldHeight:world.height}});assert(Math.abs(scene.worldWidth-scene.cardWidth)<3,'Landskapet fyller kortets bredd');assert(scene.worldHeight>=200,'Utsikten får egen höjd');assert(scene.dogsWidth<scene.cardWidth*.48,'Maskotarna lämnar plats för vädret')}
  const resources=await pg.locator('.wx2').evaluate(el=>{const ids=[...el.querySelectorAll('[id]')].filter(e=>!e.closest('.gl')).map(e=>e.id);return{duplicate:ids.filter((id,i)=>ids.indexOf(id)!==i),invalid:/NaN|undefined/.test(el.innerHTML),outside:el.getBoundingClientRect().right>innerWidth+1}});
  assert.deepEqual(resources.duplicate,[]);assert.equal(resources.invalid,false);assert.equal(resources.outside,false);
  await pg.screenshot({path:path.join(h.OUT,'bildstil-'+art+'.png'),fullPage:false});
  await pg.reload();await h.idle(1700);assert.equal(await read('WXART'),art);assert.equal(await read('WXVY'),'bild');
  await nav();assert.equal(await pg.locator('.wx2 .fig-box').count(),1);
  await click('.wx2 [data-act="wxVar"]');assert(await read('S.wxVar'),'Hundbyte fungerar också i nya stilar');
 }
 // Samtliga MET-symbolfamiljer, alla årstidsstadier, dag/natt, nederbördsstyrkor,
 // kyla/värme, molntäcke, vindriktningar och snöminne. Ändra endast emulatorns klocka/data.
 const report=await read(`(()=>{const D0=window.Date,old=WXART,oldSnow=lsGet('snow'),oldDogs=HUNDAR,oldVar=S.wxVar,oldYr=EXT.yr;let count=0;const seasons=new Set(),phases=new Set(),types=new Set(),fits=new Set(),levels=new Set();
 const symbols=['clearsky','fair','partlycloudy','cloudy','fog'];for(const p of ['rain','sleet','snow'])for(const strength of ['light','','heavy'])for(const end of ['','showers','andthunder','showersandthunder'])symbols.push(strength+p+end);
 const dates=['2026-01-15','2026-03-15','2026-04-03','2026-05-15','2026-07-15','2026-09-20','2026-10-20','2026-11-15'];
 const check=(v,m)=>{if(!v)throw Error(m)};
 const xml=h=>{const doc=new DOMParser().parseFromString(h,'image/svg+xml');check(!doc.querySelector('parsererror'),'Ogiltig SVG');const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);check(new Set(ids).size===ids.length,'Dubbla SVG-id');for(const e of doc.querySelectorAll('*'))for(const a of e.attributes){for(const m of a.value.matchAll(/url\\(#([^)]+)\\)/g))check(ids.includes(m[1]),'Saknad SVG-resurs '+m[1])}};
 try{EXT.yr=null;HUNDAR='bada';S.wxVar=null;
  dates.forEach((date,di)=>{for(const hour of [1,12]){const now=new D0(date+'T'+String(hour).padStart(2,'0')+':00:00+01:00').getTime();window.Date=class extends D0{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};
   symbols.forEach((sym,i)=>{const n={s:sym+(hour===1?'_night':'_day'),T:[-8,-1,2,9,18,28][i%6],pr:/rain|snow|sleet/.test(sym)?[.1,.8,5][i%3]:0,w:[0,5,10,18][i%4],wd:[0,90,180,270][i%4],cf:[0,18,50,89,100][i%5]},W={now:n,hours:[n,n]};lsSet('snow',JSON.stringify({at:now,cm:[0,1,6,15][di%4]}));
    WXART='original';const sc=wxScene(W),sig=JSON.stringify(sc);seasons.add(grassSeason(today()));phases.add(sc.phase);types.add(sc.type);fits.add(sc.fit.coat);levels.add(snowLevel(sc));
    const baseSky=skyFx(W),baseArc=arcHtml(W,'w');const skyCount=(h,s)=>(h.match({'.cl':/<div class="cl /g,'.st':/<i class="st[ "]/g,'.cst':/<div class="cst"/g,'.sk':/<i class="sk[ "]/g}[s])||[]).length,arcPos=h=>h.match(/<div class="sky-b [^"]*" style="([^"]*)"/)[1];
    for(const art of ['original','soft','geo']){WXART=art;check(JSON.stringify(wxScene(W))===sig,'Bildstilen ändrar vädermodellen');const bd=backdropSvg(sc),fig=figSvg(sc,{bare:1,patch:1,nocl:1}),sky=skyFx(W),arc=arcHtml(W,'w');count++;
     check(!/NaN|undefined/.test(bd+fig+sky+arc),'Ogiltigt tal i '+art+'/'+sym);check(bd.includes('data-season="'+grassSeason(today())+'"'),'Årstid saknas');check(bd.includes('data-snow="'+snowLevel(sc)+'"'),'Snödjup saknas');
     for(const selector of ['.cl','.st','.cst','.sk'])check(skyCount(sky,selector)===skyCount(baseSky,selector),'Himmellager skiljer sig '+selector);
     check(arcPos(arc)===arcPos(baseArc),'Sol/månbana skiljer sig');
     check(fig.includes('fx-rain')===/drizzle|rain|sleet/.test(sc.type),'Regnlager '+sym);check(fig.includes('fx-snow')===/snow|sleet/.test(sc.type),'Snölager '+sym);check(fig.includes('fx-bolt')===sc.thunder,'Åsklager '+sym);
     check((fig.includes('dog lie'))===sc.sleep,'Sovläge '+sym);check((skyCount(sky,'.st')>0)===(sc.dark&&sc.sky!=='fog'),'Stjärnor/dimma '+sym);
     if(art==='geo'){const frame=geoDogFrame(sc.fit,sc.sky,sc.sleep),eyes=(fig.match(/class="geo-eye"/g)||[]).length;check(eyes===(frame%2===0&&frame!==2?4:0),'Bruna iris/svarta pupiller i rätt pose '+frame);check(!eyes||fig.includes('fill="#A76B37"')&&fig.includes('fill="#10121B"'),'Ögonfärg')}
     if(i%9===0){xml(bd);xml(fig)}
    }
   })
  }});
  // Soluppgång, gyllene timmen och skymning (förutom dag/natt ovan).
  const date='2026-07-15',P=WX_POS(),st=sunTimes(date,P.lat,P.lon);for(const now of [st[0].getTime()-20*60000,st[0].getTime()+20*60000,st[1].getTime()-30*60000,st[1].getTime()+20*60000]){window.Date=class extends D0{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};const n={s:'fair',T:18,w:0,pr:0},sc=wxScene({now:n,hours:[n]});phases.add(sc.phase);for(const art of ['soft','geo']){WXART=art;xml(backdropSvg(sc));xml(figSvg(sc,{patch:1,bare:1,nocl:1}))}}
  // En hund och alla poser/kläder; snöminnet lever vidare även när det slutat snöa.
  const n={s:'clearsky',T:3,w:0,pr:0},sc=wxScene({now:n,hours:[n]});for(const art of ['soft','geo']){WXART=art;for(const variant of ['a','b','ab','A','B','AB','aB','Ab'])xml(figSvg(sc,{patch:1,bare:1,nocl:1,variant}))}
  return{count,symbols:symbols.length,seasons:[...seasons],phases:[...phases],types:[...types],fits:[...fits],levels:[...levels]};
 }finally{window.Date=D0;WXART=old;HUNDAR=oldDogs;S.wxVar=oldVar;EXT.yr=oldYr;lsSet('snow',oldSnow)}})()`);
 assert.equal(report.seasons.length,8);assert.equal(report.phases.length,5);assert.equal(report.types.length,5);assert.equal(report.levels.length,4);console.log('PASS bildstilar',JSON.stringify(report));
 // Bildfilerna ska gå att avkoda, inte bara finnas som tomma SVG-element.
 const decoded=await pg.evaluate(async()=>{const names=['autumn','spring','summer','winter','snow'].flatMap(s=>[s+'-day',s+'-night']).concat('mascots-v2','clouds-v1');return Promise.all(names.map(async name=>{const img=new Image();img.src='bilder/vader/'+name+'.webp?v=1';await img.decode();return{name,w:img.naturalWidth,h:img.naturalHeight}}))});assert.equal(decoded.length,12);for(const im of decoded)assert(im.w>=1200&&im.h>=1000,'Bildlagret är avkodat: '+im.name);
 // Granska riktiga kort i representativa väder och årstider; endast emulatorns modell/klocka ersätts.
 await read('window.__artSaved={Date:window.Date,model:wxModel,W:wxModel(),art:WXART,snow:lsGet("snow"),variant:S.wxVar}');
 try{
  const scenes=[['ogon','2026-07-15T12:00:00+02:00','partlycloudy',18,0,50,0],['hostnatt','2026-10-31T19:49:00+01:00','cloudy',6,0,100,0],['sommar','2026-07-15T12:00:00+02:00','clearsky',26,0,0,0],['regn','2026-05-15T12:00:00+02:00','heavyrainandthunder',9,5,100,0],['sno','2026-01-15T12:00:00+01:00','heavysnow',-5,4,95,15],['dimma','2026-11-15T09:00:00+01:00','fog',2,0,100,0],['stjarnor','2026-08-15T23:00:00+02:00','clearsky',14,0,0,0]];
  for(const art of ['geo','soft'])for(const [name,date,sym,T,pr,cf,cm] of scenes){
   await read(`(()=>{const saved=window.__artSaved,now=new saved.Date('${date}').getTime();window.Date=class extends saved.Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}};const W=saved.W,n={...W.now,s:'${sym}',T:${T},pr:${pr},cf:${cf},w:${name==='hostnatt'?0:pr?10:2},wd:${name==='hostnatt'?315:230}};wxModel=()=>({...W,now:n,hours:W.hours.map(x=>({...x,...n})),days:W.days.map(x=>({...x,min:${T},max:${T}}))});WXART='${art}';S.wxVar=null;lsSet('snow',JSON.stringify({at:now,cm:${cm}}));render()})()`);
   await h.idle(120);await pg.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=42000}));await pg.locator('.wx2').screenshot({path:path.join(h.OUT,'bildstil-'+art+'-'+name+'.png')});
  }
 }finally{await read('(()=>{const s=window.__artSaved;window.Date=s.Date;wxModel=s.model;WXART=s.art;S.wxVar=s.variant;lsSet("snow",s.snow);delete window.__artSaved;render()})()')}
 await settings();await click('[data-act="wxart"][data-id="'+boot+'"]');await close();await click('#nav [data-id="oversikt"]');await pg.reload();await h.idle(1700);assert.equal(await read('WXART'),boot);assert(await pg.locator('.hero.art-'+boot).count());
 await nav();await h.shot('bildstil-slut-'+boot);
};
