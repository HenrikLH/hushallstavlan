const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 assert.equal(await pg.locator('.dr-done,.cell.dr.past').count(),0);
 const id=await pg.locator('.cell.dr [data-hold-lock]').first().getAttribute('data-hold-lock'),row=()=>pg.locator('.cell.dr:has([data-hold-lock="'+id+'"])'),lockSel=()=>'.cell.dr [data-hold-lock="'+id+'"]',locked=()=>read('weekLocks(weekTarget().vs).has('+JSON.stringify(id)+')');
 const client=await pg.context().newCDPSession(pg),swipe=async dx=>{await row().evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(350);const b=await row().boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=10;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await h.idle(700)};
 const original=await locked();await swipe(100);assert.equal(await locked(),!original);await h.waitFlush();await pg.reload();await h.idle(1800);assert.equal(await locked(),!original);
 for(const style of ['bild','rad']){
  await click('[data-act="settings"]');const section=pg.locator('[data-act="lasstil"][data-id="'+style+'"]').locator('xpath=ancestor::details[1]');if(await section.count()&&!await section.evaluate(x=>x.open))await section.locator('summary').click();await click('[data-act="lasstil"][data-id="'+style+'"]');await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1800);assert.equal(await read('LASSTIL'),style);
  assert.equal(await row().locator('.lk-tw').count(),style==='bild'?1:0);assert.equal(await row().evaluate(x=>x.classList.contains('lk-rad')),style==='rad');
  const before=await locked();await row().evaluate(el=>el.scrollIntoView({block:'center'}));await h.hold(lockSel());assert.equal(await locked(),!before);assert.equal(await read('S.sheet'),null);await swipe(100);assert.equal(await locked(),before);
  // Håll in raden (inte bilden) öppnar bladet för rätten.
  await h.hold('.cell.dr:has([data-hold-lock="'+id+'"]) .dr-main .title');assert.equal(await read('S.sheet'),'dish');assert(await pg.locator('.sheet .dm-g').count());await click('.sheet [data-act="sheetClose"]');assert.equal(await read('S.sheet'),null);
 }
 await swipe(100);assert.equal(await locked(),original);
 // Behåll en låst vardagsrätt i översiktsbilden. Datumet i fredags-/lördagstestet ligger efter gruppens slut.
 if(!await locked())await swipe(100);await h.idle(3500);await pg.evaluate(()=>scrollTo(0,0));await h.shot('veckosedel');
 await swipe(-100);assert(await row().evaluate(x=>x.classList.contains('open')));await h.shot('svep-ta-bort');
 await click('.dr-wrap:has([data-hold-lock="'+id+'"])>.dr-act');assert.equal(await read('S.sheet'),'delLas');
 await click('[data-act="sheetClose"]');assert.equal(await row().count(),1);
 await swipe(100);assert.equal(await locked(),false);
 await swipe(-100);await click('.dr-wrap:has([data-hold-lock="'+id+'"])>.dr-act');await h.waitFlush();assert.equal(await read('D().menu.some(x=>x.recipe==='+JSON.stringify(id)+')'),false);
 await pg.reload();await h.idle(1800);assert.equal(await read('D().menu.some(x=>x.recipe==='+JSON.stringify(id)+')'),false);
 console.log('PASS: inga automatiska Ätit/past; högersvep och håll in bilden låser/låser upp, håll in raden öppnar bladet, lås sparas efter omladdning; vänstersvep visar Ta bort, låst rätt kräver bekräftelse, Avbryt bevarar, olåst borttagning sparas efter omladdning.');
};
