const assert=require('node:assert/strict');
// Macka på veckosedeln: portionerna syns på brickan efter ändring, och mackan går att låsa som en rätt (sparas efter omladdning)
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 // Lägg en macka på en tom vardagsplats via bladet
 await click('.bq.e[data-act="slotPick"][data-id="Vardag"]');await click('.sheet [data-act="pickSel"][data-id="macka"]');await click('.sheet [data-act="pickGo"]');
 const tile='.bt:has(.bn:text-is("Macka"))';assert(await pg.locator(tile).count()>=1,'mackan syns');
 const mi=Number(await pg.locator(tile).first().getAttribute('data-id')),key=await read('lasId(D().menu['+mi+'])');assert.match(key,/^macka:\d{4}-\d\d-\d\d$/);
 const T='.bt[data-id="'+mi+'"]',port=async()=>Number((await pg.locator(T+' .bq-p').textContent()).match(/\d+/)[0]);
 assert.equal(await port(),2);
 await click(T+' .bq-p');assert.equal(await read('S.sheet'),'dish');
 await click('.sheet [data-act="portStep"][data-d="1"]');await click('.sheet [data-act="portStep"][data-d="1"]');
 assert.equal(await pg.locator('.sheet .pl-step .num').textContent(),'4');await click('.sheet [data-act="sheetClose"]');
 assert.equal(await port(),4,'brickan visar 4 port');
 // Lås med låsknappen på brickan
 assert.equal(await pg.locator(T+' .bq-lk').count(),1,'låsknapp på mackan');
 await click(T+' .bq-lk');const locked=()=>read('weekLocks(weekTarget().vs).has('+JSON.stringify(key)+')');assert.equal(await locked(),true);
 assert.equal(await pg.locator(T+' .bq-lk.on').count(),1);
 await h.waitFlush();await pg.reload();await h.idle(1800);
 assert.equal(await locked(),true,'låset sparas');const T2='.bt:has(.bq-lk[data-id="'+key+'"])';assert.equal(await pg.locator(T2+' .bq-lk.on').count(),1);
 assert.equal(Number((await pg.locator(T2+' .bq-p').textContent()).match(/\d+/)[0]),4,'portionerna sparas');
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('macka-last');
 // Bladet: låst macka visar Lås upp och Ta bort kräver håll in
 await click(T2+' .bq-p');assert.equal(await pg.locator('.sheet .dm-t[data-a="swLock"]').count(),1);assert.equal(await pg.locator('.sheet .dm-t.hold').count(),1);await h.shot('macka-blad');
 await click('.sheet .dm-t[data-a="swLock"]');assert.equal(await locked(),false);await click('.sheet [data-act="sheetClose"]');
 // Föreslå en ny vecka behåller den låsta mackans kväll
 await click(T2+' .bq-lk');assert.equal(await locked(),true);
 const d=await read('dagNr(weekTarget(),D().menu.find(m=>lasId(m)==='+JSON.stringify(key)+').date)');
 const lock=await read('(()=>{const P=planState();P.vecka=settings().vecka_start;autoFranVecka(P);return P.lock})()');assert.equal(lock&&lock['d'+d],1,'låst mackkväll i förslaget');
 console.log('PASS: macka får portioner på brickan, låses med låset och via bladet, och lås + portioner sparas efter omladdning.');
};
