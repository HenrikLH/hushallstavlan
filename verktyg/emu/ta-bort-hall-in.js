const assert=require('node:assert/strict');
// Rättens meny i Mat → Vecka: Ta bort kräver håll in (vanlig, låst och efterrätt); ett vanligt tryck tar inte bort
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 const n0=await read('D().menu.length'),i=await read('D().menu.findIndex(m=>m.recipe)');assert(i>=0,'ingen rätt i veckan');
 const tit=await read('D().menu['+i+'].title');
 await pg.evaluate(i=>window.__d('ACT.dishMenu('+JSON.stringify(String(i))+')'),i);await h.idle(500);
 assert.equal(await read('S.sheet'),'dish');
 assert.equal(await pg.locator('#overlay .sheet-head .dm-lk svg').count(),1,'cirkeln uppe till vänster saknar lås');
 const del=pg.locator('#overlay .dm-t.red');assert.equal(await del.getAttribute('data-hold'),'dishDelHold');
 await del.evaluate(e=>e.scrollIntoView({block:'center'}));await h.shot('ta-bort-meny');
 await del.click();await h.idle(500);
 assert.equal(await read('D().menu.filter(m=>m.title==='+JSON.stringify(tit)+').length')>0,true,'tryck tog bort rätten');
 const b=await del.boundingBox();await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await h.idle(1300);await pg.mouse.up();await h.idle(800);
 assert.equal(await read('D().menu.filter(m=>m.title==='+JSON.stringify(tit)+').length'),0,'håll in tog inte bort rätten');
 assert.equal(await read('S.sheet'),null);
 console.log('PASS: '+tit+' togs bort först efter håll in (menyrader '+n0+').');
};
