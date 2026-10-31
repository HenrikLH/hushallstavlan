// Bildstilar delar vädermodellen. Kontrollera kombinationer, SVG-resurser, riktiga menyval och omstart.
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(180)};
 const settings=async()=>{await click('[data-act="settings"]');const sec=pg.locator('[data-k="pref-oversikt"]');if(!await sec.evaluate(e=>e.open))await sec.locator('summary').click()};
 const close=()=>click('.sheet [data-act="sheetClose"]');
 const nav=async()=>{await click('#nav [data-id="oversikt"]');await click('[data-act="nav"][data-id="vader"]')};
 const boot=process.env.ART||'geo';
 await settings();assert.equal(await pg.locator('[data-act="wxart"]').count(),3);await click('[data-act="wxvy"][data-id="bild"]');await click('[data-act="hundar"][data-id="bada"]');await close();
 for(const art of ['original','soft','geo']){
  await settings();await click('[data-act="wxart"][data-id="'+art+'"]');assert.equal(await read('WXART'),art);await close();await nav();
  assert.equal(await pg.locator('.wx2').count(),1);assert.equal(await pg.locator('.wx2.art-'+art).count(),art==='original'?0:1);
  const resources=await pg.locator('.wx2').evaluate(el=>{const ids=[...el.querySelectorAll('[id]')].map(e=>e.id);return{duplicate:ids.filter((id,i)=>ids.indexOf(id)!==i),invalid:/NaN|undefined/.test(el.innerHTML),outside:el.getBoundingClientRect().right>innerWidth+1}});
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
    const baseSky=skyFx(W),baseArc=arcHtml(W,'w');const dom=h=>new DOMParser().parseFromString(h,'text/html'),skyCount=(h,s)=>dom(h).querySelectorAll(s).length;
    for(const art of ['original','soft','geo']){WXART=art;check(JSON.stringify(wxScene(W))===sig,'Bildstilen ändrar vädermodellen');const bd=backdropSvg(sc),fig=figSvg(sc,{bare:1,patch:1,nocl:1}),sky=skyFx(W),arc=arcHtml(W,'w');count++;
     check(!/NaN|undefined/.test(bd+fig+sky+arc),'Ogiltigt tal i '+art+'/'+sym);check(bd.includes('data-season="'+grassSeason(today())+'"'),'Årstid saknas');check(bd.includes('data-snow="'+snowLevel(sc)+'"'),'Snödjup saknas');
     for(const selector of ['.cl','.st','.cst','.sk'])check(skyCount(sky,selector)===skyCount(baseSky,selector),'Himmellager skiljer sig '+selector);
     check(dom(arc).querySelector('.sky-b').getAttribute('style')===dom(baseArc).querySelector('.sky-b').getAttribute('style'),'Sol/månbana skiljer sig');
     check(fig.includes('fx-rain')===/drizzle|rain|sleet/.test(sc.type),'Regnlager '+sym);check(fig.includes('fx-snow')===/snow|sleet/.test(sc.type),'Snölager '+sym);check(fig.includes('fx-bolt')===sc.thunder,'Åsklager '+sym);
     check((fig.includes('dog lie'))===sc.sleep,'Sovläge '+sym);check((skyCount(sky,'.st')>0)===(sc.dark&&sc.sky!=='fog'),'Stjärnor/dimma '+sym);
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
 await settings();await click('[data-act="wxart"][data-id="'+boot+'"]');await close();await click('#nav [data-id="oversikt"]');await pg.reload();await h.idle(1700);assert.equal(await read('WXART'),boot);assert(await pg.locator('.hero.art-'+boot).count());
 await nav();await h.shot('bildstil-slut-'+boot);
};
