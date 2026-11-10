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
 assert.match(await pg.locator('#overlay .ha-valt').innerText(),/,/,'Två rum valda genom tryck i kartan');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/undefined/,'Inget odefinierat i kortet');
 await h.shot('apparater-robot');
 await pg.locator('#overlay [data-act="haRob"][data-id="paus"],#overlay [data-act="haRob"][data-id="start"]').first().click();await h.idle(800);
 if(!demo)assert.ok(ut.some(u=>/"gor":"(start|paus)"/.test(u)),'Skickat till tjänsten');
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
 assert.match(await pg.locator('#overlay').innerText(),/Töm dammbehållaren[\s\S]*Tvätta moppen/,'Dockans knappar finns');
 assert.doesNotMatch(await pg.locator('#overlay').innerHTML(),/Sug och mopp<\/span>/,'Sug och mopp går inte att välja');
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
