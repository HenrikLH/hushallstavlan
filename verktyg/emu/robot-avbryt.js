// Dammsugaren stoppas mitt i en omgång (t.ex. i Roborock-appen): tidslinjen ska visa vilka rum som hanns med, inte "Klart".
// Bara mot väggdatorns tjänst (se apparater.js): PORT=8099 HA=1 node verktyg/emu/run.js verktyg/emu/robot-avbryt.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const HAU='http://127.0.0.1:18123',post=p=>fetch(HAU+p,{method:'POST'}),logg=async()=>(await(await fetch(HAU+'/logg',{headers:{Authorization:'Bearer test'}})).json());
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.locator('main .ha-karta img').waitFor({timeout:8000});
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify({crop:HA.km.crop,rum:HA.km.rum.map(r=>({id:r.id,cx:r.cx,cy:r.cy}))})')));
 const tryck=async id=>{const r=R.rum.find(q=>q.id===id),b=await pg.locator('main .ha-karta img').boundingBox();await pg.mouse.click(b.x+(r.cx-R.crop[0])/R.crop[2]*b.width,b.y+(r.cy-R.crop[1])/R.crop[3]*b.height);await h.idle(500)};
 const [,r2,r3,r4]=R.rum.map(r=>r.id);
 const omgang=async(stoppa)=>{
  await tryck(r2);await tryck(r3);await tryck(r4);
  await pg.locator('main [data-act="haLager"][data-id="m"]').click();await h.idle(300);await tryck(r2);await pg.locator('main [data-act="haLager"][data-id="v"]').click();await h.idle(300);
  const n0=(await logg()).length;
  await pg.locator('main [data-act="haRob"][data-id="start"]').click();
  await pg.waitForFunction(()=>document.querySelector('main .ha-fs.nu.damm'),null,{timeout:15000});
  await h.idle(6000);await post('/yttre/rum/'+r2);await h.idle(6000);await post('/yttre/rum/'+r3);await h.idle(6000);
  if(stoppa){await post('/yttre/rum/'+r4);await h.idle(6000)}
  if(stoppa){await post('/yttre/stopp');await h.idle(6000)}
  await post('/yttre/hemma');
  await pg.waitForFunction(()=>document.querySelector('main .ha-fslut.avbr'),null,{timeout:30000});
  const t=await pg.locator('main .ha-fl').innerText();
  assert.match(t,stoppa?/Avbruten · 2 av 3 rum klara/:/Avbruten · 1 av 3 rum klara/,'Bara rummen som roboten lämnade räknas som klara');
  assert.equal(await pg.locator('main .ha-fo li.ej').count(),stoppa?2:3,'Ej städade rum markeras (även moppningen)');
  assert.doesNotMatch(t,/Läget går tillbaka|^Klart$/m,'Inget "Klart"');
  await h.idle(7000);const L=(await logg()).slice(n0);
  assert.ok(!L.some(x=>x[2].option==='mop'),'Moppningen startar inte efter en avbruten dammsugning');
  return t};
 // 1: roboten skickas hem utan paus (rum 3 aldrig besökt)
 await omgang(false);await h.shot('robot-avbruten');
 // 2: stoppad i appen (paus/idle) i sista rummet, sedan hem
 await pg.locator('main [data-act="haAppSida"][data-id=""]').count();
 await omgang(true);
};
