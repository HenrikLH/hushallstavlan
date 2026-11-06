const assert=require('node:assert/strict');
// Rättens blad: cirkeln uppe till vänster visar låset och låser/låser upp rätten
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('[data-act="nav"][data-id="mat"]').first().click();await h.idle(500);await pg.locator('[data-act="matTab"][data-id="vecka"]').first().click();await h.idle(500);
 const i=await read('D().menu.findIndex(m=>m.recipe&&weekLocks(weekTarget().vs).has(m.recipe))');assert(i>=0,'ingen låst rätt');const rid=await read('D().menu['+i+'].recipe'),L='weekLocks(weekTarget().vs).has('+JSON.stringify(rid)+')';
 await read('ACT.dishMenu("'+i+'")');await h.idle(700);const c=pg.locator('#overlay .dm-lk');
 assert.equal(await c.getAttribute('aria-pressed'),'true');await h.shot('cirkel-last');
 await c.click();await h.idle(600);assert.equal(await read(L),false);assert.equal(await c.getAttribute('aria-pressed'),'false');assert.equal(await read('S.sheet'),'dish');await h.shot('cirkel-olast');
 await c.click();await h.idle(600);assert.equal(await read(L),true);assert.equal(await c.getAttribute('aria-pressed'),'true');
 console.log('PASS: cirkeln låser och låser upp rätten');};
