// Smart hem: dammsugare och diskmaskin (apparater) i testläge med låtsasdata.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/apparater.js
// Mot väggdatorns tjänst: falsk-ha.py + ljussensor.py (se smart-hem.js) och PORT=8099 HA=1 … apparater.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const ut=[];pg.on('request',r=>{if(/127\.0\.0\.1:8777/.test(r.url())&&r.method()==='POST')ut.push(r.url()+' '+r.postData())});
 const demo=!process.env.HA;
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 assert.match(await pg.locator('main').innerText(),/Apparater[\s\S]*Dammsugaren[\s\S]*Diskmaskinen/,'Apparaterna syns');
 await pg.locator('main .ha-rh',{hasText:'Apparater'}).scrollIntoViewIfNeeded();await h.idle(300);
 await h.shot('apparater-vy');
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.locator('#overlay .ha-karta img').waitFor({timeout:8000});
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify({crop:HA.km.crop,rum:HA.km.rum.map(r=>({id:r.id,cx:r.cx,cy:r.cy,f:r.f}))})')));
 console.log('karta',JSON.stringify(R));
 assert.ok(R.rum.every(r=>r.f),'Varje rum har fått en färg ur bilden');
 const tryck=async id=>{const r=R.rum.find(q=>q.id===id),b=await pg.locator('#overlay .ha-karta img').boundingBox();await pg.mouse.click(b.x+(r.cx-R.crop[0])/R.crop[2]*b.width,b.y+(r.cy-R.crop[1])/R.crop[3]*b.height);await h.idle(500)};
 const [r1,r2]=R.rum.map(r=>r.id);
 await tryck(r1);await tryck(r2);
 assert.match(await pg.locator('#overlay .ha-valt').innerText(),/2 rum valda/,'Två rum valda genom tryck i kartan');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/undefined/,'Inget odefinierat i kortet');
 // dammsug båda rummen, moppa det andra efteråt (roboten får inte städa när rummen väljs)
 if(await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').count()){await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').click();await h.idle(1500)}
 assert.equal(await pg.locator('#overlay .ha-rv .ha-gr').count(),2,'En rad per valt rum');
 await pg.locator('#overlay [data-act="haRobV"][data-id="'+r2+':m"]').click();await h.idle(400);
 assert.equal(await pg.locator('#overlay .ha-fl .ha-fs').count(),3,'Flödet visar Vacuum, dockan och Mop');
 assert.match(await pg.locator('#overlay .ha-fl').innerText(),/Vacuum[\s\S]*Dockan[\s\S]*Mop/,'Dammsugning före moppning');
 assert.match(await pg.locator('#overlay .ha-fs.damm .ha-fo').innerText(),/^1\s*\S[\s\S]*\n2\s*\S/,'Rummen numrerade i ordning');
 await h.shot('apparater-robot');
 await pg.locator('#overlay [data-act="haRob"][data-id="start"]').click();await h.idle(1200);
 const HAU='http://127.0.0.1:18123',logg=async()=>(await(await fetch(HAU+'/logg',{headers:{Authorization:'Bearer test'}})).json()),
  vanta=async f=>{for(let i=0;i<40;i++){if(f(await logg()))return true;await h.idle(500)}return false},seg=L=>x=>x[2].command==='app_segment_clean'&&JSON.stringify(x[2].params[0].segments)===JSON.stringify(L);
 if(!demo){assert.ok(ut.some(u=>u.includes('"damm":['+r1+','+r2+'],"mopp":['+r2+']')),'Dammsugning och moppning skickade');
  let L=await logg();
  assert.ok(await vanta(L=>L.some(seg([r1,r2]))),'Dammsugning startad');L=await logg();assert.ok(L.findIndex(x=>x[2].option==='vacuum')<L.findIndex(seg([r1,r2])),'Läget satt till dammsugning först');
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fs.nu.damm'),null,{timeout:15000});
  await h.idle(6000);await fetch(HAU+'/yttre/rum/'+r1,{method:'POST'});await h.idle(6000);await fetch(HAU+'/yttre/rum/'+r2,{method:'POST'});
  await pg.waitForFunction(()=>document.querySelectorAll('#overlay .ha-fs.damm .ha-fo li.klar').length===1&&document.querySelector('#overlay .ha-fs.damm .ha-fo li.nu'),null,{timeout:20000});
  await h.shot('apparater-plan');
  await h.idle(7000);await fetch(HAU+'/yttre/hemma',{method:'POST'});
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fs.nu.mopp'),null,{timeout:60000});
  L=await logg();assert.ok(L.some(x=>x[2].option==='mop')&&L.some(x=>x[2].command==='app_segment_clean'&&JSON.stringify(x[2].params[0].segments)===JSON.stringify([r2])),'Moppningen startad efter dammsugningen');
  await h.idle(7000);await fetch(HAU+'/yttre/hemma',{method:'POST'});
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fslut.klar'),null,{timeout:60000});await h.shot('apparater-plan-klar');
  L=await logg();assert.equal(L.filter(x=>x[2].option).pop()[2].option,'vacuum','Läget tillbaka till dammsugning')}
 else{assert.ok(await pg.locator('#overlay .ha-fs.nu.damm').count(),'Planen syns');
  await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.plan.klara[0]=[a.plan.steg[0].rum[0]];a.plan.nu=a.plan.steg[0].rum[1];a.pct=55;render()})()'));await h.idle(400);await h.shot('apparater-plan');
  assert.match(await pg.locator('#overlay .ha-fs.damm .ha-fo').innerText(),/Städar nu/,'Rummet som städas syns i tidslinjen');assert.equal(await pg.locator('#overlay .ha-kn').count(),2,'Ordningen syns i kartan');
  await pg.locator('#overlay [data-act="haPlanStopp"]').click();await h.idle(400);assert.equal(await pg.locator('#overlay .ha-fs.mopp').count(),0,'Moppningen hoppas över')}
 await pg.locator('#overlay [data-act="haAppDel"][data-id="sug"]').click();await h.idle(400);
 await pg.locator('#overlay .ha-ap-in').evaluate(e=>e.closest('.sheet-body').scrollTop=9999);await h.idle(300);
 await h.shot('apparater-robot-nedre');
 // zonstädning: rita en rektangel i kartan (pausa först om roboten städar)
 if(await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').count()){await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').click();await h.idle(1500)}
 await pg.locator('#overlay [data-act="haZon"]').first().click();await h.idle(500);
 await pg.locator('#overlay .ha-karta img').scrollIntoViewIfNeeded();await h.idle(200);
 {const b=await pg.locator('#overlay .ha-kw').boundingBox();await pg.mouse.move(b.x+b.width*.3,b.y+b.height*.35);await pg.mouse.down();for(let i=1;i<=6;i++)await pg.mouse.move(b.x+b.width*(.3+.05*i),b.y+b.height*(.35+.04*i));await pg.mouse.up();await h.idle(500)}
 assert.equal(await pg.locator('#overlay [data-act="haZonStada"]').isDisabled(),false,'Städa zon går att trycka efter ritad zon');
 await h.shot('apparater-zon');
 await pg.locator('#overlay [data-act="haZonStada"]').click();await h.idle(700);
 if(!demo)assert.ok(ut.some(u=>/"zon":\[/.test(u)),'Zonen skickad');
 assert.match(await pg.locator('#overlay').innerText(),/Empty bin[\s\S]*Wash mop/,'Dockans knappar finns');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/Vacuum &amp; Mop<\/span>/,'Vacuum & Mop går inte att välja');
 if(await pg.locator('#overlay [data-act="haRot"]').count()){await pg.locator('#overlay [data-act="haRot"]').click();await h.idle(900);if(!demo)assert.ok(ut.some(u=>/"rot":"90"/.test(u)),'Rotation skickad')}
 await pg.locator('#overlay [data-act="haDock"][data-id="tom"]').click();await h.idle(500);
 if(!demo)assert.ok(ut.some(u=>/"gor":"tom"/.test(u)),'Tömning skickad');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 await pg.locator('main .ha-ap[data-id="'+(demo?'diskmaskin':'diskmaskin')+'"]').click();await h.idle(900);
 assert.match(await pg.locator('#overlay').innerText(),/Eco 50°/,'Diskkortet visar programmet');
 await h.shot('apparater-disk');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 if(demo)assert.equal(ut.length,0,'Inget skickat i testläget');
};
