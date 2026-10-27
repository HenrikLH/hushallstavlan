const assert=require('node:assert/strict');
// Veckan som brickor (UI 2.0): tryck på låset låser, tryck på bilden öppnar receptet, håll in rätten eller tryck på portionerna öppnar bladet
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const tillVecka=async()=>{await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]')};
 await tillVecka();
 assert.equal(await pg.locator('.dr-done,.cell.dr.past').count(),0);
 assert.equal(await pg.locator('.bt-sec').count()>=4,true);
 for(const g of ['Vardag','Helg','Storkok'])assert(await pg.locator('.bq.e[data-act="slotPick"][data-id="'+g+'"]').count()>=1,'tom plats i '+g);
 assert.equal(await pg.locator('.wm-bar').count(),1);
 const id=await pg.locator('.bt-g .bq-lk').first().getAttribute('data-id'),lk='.bq-lk[data-id="'+id+'"]',tile='.bt:has('+lk+')',sq=tile+' .bq',locked=()=>read('weekLocks(weekTarget().vs).has('+JSON.stringify(id)+')');
 const hold=async s=>{await pg.locator(s).first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.hold(s)};
 const original=await locked();
 await click(lk);assert.equal(await locked(),!original);assert.equal(await read('S.sheet'),null);assert.equal(await read('S.recipe'),null);
 assert.equal(await pg.locator(lk).evaluate(x=>x.classList.contains('on')),!original);
 await h.waitFlush();await pg.reload();await h.idle(1800);assert.equal(await locked(),!original);
 await click(lk);assert.equal(await locked(),original);
 // Tryck på bilden öppnar receptet
 await click(sq);assert.equal(await read('S.recipe'),id);await pg.evaluate(()=>window.__d('S.recipe=null;render()'));await h.idle(400);
 // Håll in namnet öppnar bladet; tryck på portionerna också
 await hold(sq);assert.equal(await read('S.sheet'),'dish');assert.equal(await read('S.recipe'),null);await click('.sheet [data-act="sheetClose"]');
 await hold(tile+' .bn');assert.equal(await read('S.sheet'),'dish');assert(await pg.locator('.sheet .dm-g').count());await click('.sheet [data-act="sheetClose"]');assert.equal(await read('S.sheet'),null);
 const p0=Number((await pg.locator(tile+' .bq-p').textContent()).match(/\d+/)[0]);
 await click(tile+' .bq-p');assert.equal(await read('S.sheet'),'dish');await click('.sheet [data-act="portStep"][data-d="1"]');await click('.sheet [data-act="sheetClose"]');
 assert.equal(Number((await pg.locator(tile+' .bq-p').textContent()).match(/\d+/)[0]),p0+1);
 await click(tile+' .bq-p');await click('.sheet [data-act="portStep"][data-d="-1"]');await click('.sheet [data-act="sheetClose"]');
 // En låst rätt tas bort genom att hålla in Ta bort i bladet
 // Lås upp via bladet och lås igen
 const fore=await locked();await click(tile+' .bq-p');await click('.sheet .dm-t[data-a="swLock"]');assert.equal(await locked(),!fore);await click('.sheet [data-act="sheetClose"]');
 if(!await locked())await click(lk);assert.equal(await locked(),true);await h.idle(3000);await pg.evaluate(()=>scrollTo(0,0));await h.shot('veckosedel');
 await click(tile+' .bq-p');assert.equal(await pg.locator('.sheet .dm-t.hold').count(),1);await h.shot('blad-last');
 await h.hold('.sheet .dm-t.hold');await h.waitFlush();await h.idle(600);
 assert.equal(await read('D().menu.some(x=>x.recipe==='+JSON.stringify(id)+')'),false);
 await pg.reload();await h.idle(1800);assert.equal(await read('D().menu.some(x=>x.recipe==='+JSON.stringify(id)+')'),false);
 console.log('PASS: brickor med tom plats per grupp och budgetstapel; tryck på låset låser/låser upp och sparas efter omladdning; tryck på bilden öppnar receptet; håll in bilden eller namnet och tryck på portionerna öppnar bladet; låset går också via bladet; portioner ändras; låst rätt tas bort med håll in och borttagningen sparas.');
};
