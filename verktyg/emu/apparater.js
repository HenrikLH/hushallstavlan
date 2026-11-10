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
 const [r1,r2]=R.rum.map(r=>r.id),r3=R.rum[demo?3:2].id;
 // r1 är ett stort rum (demons Vardagsrum; mot tjänsten markeras det i rumslistan)
 if(!demo){await pg.locator('#overlay [data-act="haAppSida"][data-id="inst"]').last().click();await h.idle(500);await pg.locator('#overlay [data-act="haAppDel"][data-id="rum"]').click();await h.idle(400);await pg.locator('#overlay [data-act="haRumNamn"][data-id="'+r1+'"]').click();await h.idle(300);
  await pg.locator('#overlay [data-act="haRumStor"][data-id="'+r1+'"]').click();await h.idle(1200);assert.ok(ut.some(u=>/\/val .*"stor":true/.test(u)),'Stort rum sparat');
  await pg.locator('#overlay [data-act="haAppSida"][data-id=""]').click();await h.idle(500);}
 // rum väljs i kartan per lager (roboten får inte städa då)
 if(await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').count()){await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').click();await h.idle(1500)}
 await tryck(r1);await tryck(r2);await tryck(r3);
 assert.match(await pg.locator('#overlay .ha-valt').innerText(),/3 rum valda/,'Tre rum valda genom tryck i kartan');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/undefined/,'Inget odefinierat i kortet');
 // små rum i ett svep, sedan det stora rummet, tömning emellan, sist moppning (roboten får inte städa när rummen väljs)
 await pg.locator('#overlay [data-act="haLager"][data-id="m"]').click();await h.idle(300);await tryck(r2);
 assert.equal(await pg.locator('#overlay .ha-lag .mopp b').innerText(),'1','Ett rum i mopplagret');
 assert.deepEqual(await pg.locator('#overlay .ha-rutt > span').evaluateAll(E=>E.map(e=>e.className.replace('ha-rn ','').replace('ha-rd','dock'))),['damm','damm','dock','damm','dock','mopp'],'Rutten: små rum, tömning, stort rum, tömning, mopp');
 assert.match(await pg.locator('#overlay .ha-rutt .ha-rn').nth(2).innerText(),/^3/,'Stora rummet sist, nummer 3');
 assert.equal(await pg.locator('#overlay .ha-kn').count(),3,'Märken i kartan för valda rum');assert.equal(await pg.locator('#overlay .ha-kn > i').count(),1,'Droppe på rummet som också moppas');
 await h.shot('apparater-robot');
 await pg.locator('#overlay [data-act="haRob"][data-id="start"]').click();await h.idle(1200);
 const HAU='http://127.0.0.1:18123',logg=async()=>(await(await fetch(HAU+'/logg',{headers:{Authorization:'Bearer test'}})).json()),
  vanta=async f=>{for(let i=0;i<120;i++){if(f(await logg()))return true;await h.idle(500)}return false},seg=L=>x=>x[2].command==='app_segment_clean'&&JSON.stringify(x[2].params[0].segments)===JSON.stringify(L),
  hemma=async()=>{await h.idle(7000);await fetch(HAU+'/yttre/hemma',{method:'POST'})};
 if(!demo){assert.ok(ut.some(u=>u.includes('"damm":['+r1+','+r2+','+r3+'],"mopp":['+r2+']')),'Dammsugning och moppning skickade');
  assert.ok(await vanta(L=>L.some(seg([r2,r3]))),'Små rummen dammsugs först');
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fs.nu.damm'),null,{timeout:15000});
  await h.idle(6000);await fetch(HAU+'/yttre/rum/'+r2,{method:'POST'});await h.idle(6000);await fetch(HAU+'/yttre/rum/'+r3,{method:'POST'});
  await pg.waitForFunction(()=>document.querySelectorAll('#overlay .ha-fs.damm .ha-fo li.klar').length===1&&document.querySelector('#overlay .ha-fs.damm .ha-fo li.nu'),null,{timeout:20000});
  await h.shot('apparater-plan');
  await hemma();assert.ok(await vanta(L=>L.some(x=>x[2].command==='app_start_collect_dust')&&L.some(seg([r1]))),'Tömning och sedan stora rummet');
  let L=await logg();assert.ok(L.findIndex(x=>x[2].command==='app_start_collect_dust')<L.findIndex(seg([r1])),'Tömning före stora rummet');
  await hemma();assert.ok(await vanta(L=>L.some(x=>x[2].option==='mop')&&L.some(seg([r2]))),'Moppningen startad efter dammsugningen');
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fs.nu.mopp'),null,{timeout:20000});
  await hemma();
  await pg.waitForFunction(()=>document.querySelector('#overlay .ha-fslut.klar'),null,{timeout:60000});await h.shot('apparater-plan-klar');
  L=await logg();assert.equal(L.filter(x=>x[2].option).pop()[2].option,'vacuum','Läget tillbaka till dammsugning')}
 else{assert.ok(await pg.locator('#overlay .ha-fs.nu.damm').count(),'Planen syns');
  await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.plan.klara[0]=[a.plan.steg[0].rum[0]];a.plan.nu=a.plan.steg[0].rum[1];a.pct=55;render()})()'));await h.idle(400);await h.shot('apparater-plan');
  await pg.locator('#overlay .ha-karta').scrollIntoViewIfNeeded();await h.idle(300);await pg.locator('#overlay .sheet').first().screenshot({path:require('path').join(h.OUT,'apparater-plan-hel.png')});
  assert.match(await pg.locator('#overlay .ha-fs.damm .ha-fo').first().innerText(),/Städar nu/,'Rummet som städas syns i tidslinjen');assert.equal(await pg.locator('#overlay .ha-kn').count(),3,'Ordningen syns i kartan');
  await pg.locator('#overlay [data-act="haPlanStopp"]').click();await h.idle(400);assert.equal(await pg.locator('#overlay .ha-fs.mopp').count(),0,'Resten hoppas över')}
 await pg.locator('#overlay [data-act="haAppSida"][data-id="inst"]').last().click();await h.idle(500);
 await pg.locator('#overlay [data-act="haAppDel"][data-id="sug"]').click();await h.idle(400);
 await h.shot('apparater-robot-nedre');
 assert.match(await pg.locator('#overlay').innerText(),/Empty bin[\s\S]*Wash mop/,'Dockans knappar finns');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/Vacuum &amp; Mop<\/span>/,'Vacuum & Mop går inte att välja');
 await pg.locator('#overlay [data-act="haDock"][data-id="tom"]').click();await h.idle(500);
 if(!demo)assert.ok(ut.some(u=>/"gor":"tom"/.test(u)),'Tömning skickad');
 await pg.locator('#overlay [data-act="haAppSida"][data-id=""]').click();await h.idle(500);
 // zonstädning: rita en rektangel i kartan (pausa först om roboten städar)
 if(await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').count()){await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').click();await h.idle(1500)}
 await pg.locator('#overlay [data-act="haZon"]').first().click();await h.idle(500);
 await pg.locator('#overlay .ha-karta img').scrollIntoViewIfNeeded();await h.idle(200);
 {const b=await pg.locator('#overlay .ha-kw').boundingBox();await pg.mouse.move(b.x+b.width*.3,b.y+b.height*.35);await pg.mouse.down();for(let i=1;i<=6;i++)await pg.mouse.move(b.x+b.width*(.3+.05*i),b.y+b.height*(.35+.04*i));await pg.mouse.up();await h.idle(500)}
 assert.equal(await pg.locator('#overlay [data-act="haZonStada"]').isDisabled(),false,'Städa zon går att trycka efter ritad zon');
 await h.shot('apparater-zon');
 await pg.locator('#overlay [data-act="haZonStada"]').click();await h.idle(700);
 if(!demo)assert.ok(ut.some(u=>/"zon":\[/.test(u)),'Zonen skickad');
 if(await pg.locator('#overlay [data-act="haRot"]').count()){await pg.locator('#overlay [data-act="haRot"]').click();await h.idle(900);if(!demo)assert.ok(ut.some(u=>/"rot":"90"/.test(u)),'Rotation skickad')}
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 await pg.locator('main .ha-ap[data-id="'+(demo?'diskmaskin':'diskmaskin')+'"]').click();await h.idle(900);
 assert.match(await pg.locator('#overlay').innerText(),/Eco 50°/,'Diskkortet visar programmet');
 await h.shot('apparater-disk');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 if(demo)assert.equal(ut.length,0,'Inget skickat i testläget');
};
