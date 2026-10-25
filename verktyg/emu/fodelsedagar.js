// Födelsedagar: lägg till med plus, ta bort med svep och Ångra, och att kalendersynken inte skriver över ändringarna.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const st=()=>h.sheet('Inställningar'),row=k=>st().find(x=>x[0]===k);
 const setRow=(k,v)=>{const r=row(k);if(r)r[1]=v;else st().push([k,v])};
 setRow('fodelsedagar',JSON.stringify([{namn:'Leah',datum:'10-25',ar:2014},{namn:'Morfar',datum:'03-02'}]));
 await pg.reload();await h.idle(1800);
 const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const main=()=>pg.locator('main').innerText();
 await click('#nav [data-act="nav"][data-id="oversikt"]');
 await click('[data-act="nav"][data-id="fod"]');
 assert.ok((await main()).includes('Leah'));
 await click('[data-act="fodMode"][data-id="lista"]');
 // Lägg till
 await click('[data-act="fodAdd"]');
 assert.equal(await pg.locator('form[data-form="fodAdd"]').count(),1,'Bladet Ny födelsedag ska öppnas');
 await h.shot('fod-1-ny');
 await pg.fill('#fod-name','Testkusin');
 await pg.selectOption('select[name="dag"]','30');await pg.selectOption('select[name="man"]','2');
 await click('form[data-form="fodAdd"] .tb.strong');
 assert.equal(await pg.locator('form[data-form="fodAdd"]').count(),1,'30 februari ska inte gå');
 await pg.selectOption('select[name="dag"]','14');await pg.selectOption('select[name="ar"]','1990');
 await click('form[data-form="fodAdd"] .tb.strong');await h.waitFlush();
 assert.equal(await pg.locator('form[data-form="fodAdd"]').count(),0);
 assert.ok((await main()).includes('Testkusin'),'Ny person ska synas');
 await h.shot('fod-2-tillagd');
 // Svep vänster på Morfar (från kalendern)
 const cdp=await pg.context().newCDPSession(pg);
 const swipe=async name=>{const r=pg.locator('.dr-slide.bd').filter({hasText:name}).first();await r.evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);const b=await r.boundingBox();const y=b.y+b.height/2;
  const tp=x=>[{x,y}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(b.x+b.width-20)});
  for(let x=b.x+b.width-40;x>b.x-40;x-=30){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(x)});await pg.waitForTimeout(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await h.idle(600)};
 await swipe('Morfar');
 assert.ok(!(await main()).includes('Morfar'),'Morfar ska försvinna');
 assert.ok(await pg.locator('#undo').isVisible(),'Ångra ska synas');
 await h.shot('fod-3-angra');
 await click('#undo .ud-b');
 assert.ok((await main()).includes('Morfar'),'Ångra ska ta tillbaka');
 await swipe('Morfar');await swipe('Testkusin');await h.idle(5600);await h.waitFlush();
 let egna=JSON.parse(row('onskelista')[1]).find(x=>x.fod);
 assert.deepEqual(egna.del,['Morfar|03-02']);assert.equal(egna.add.length,0,'Egen person ska försvinna helt');
 // Lägg till igen och låt kalendersynken skriva om raden
 await click('[data-act="fodAdd"]');await pg.fill('#fod-name','Testkusin');await pg.selectOption('select[name="dag"]','14');await pg.selectOption('select[name="man"]','2');
 await click('form[data-form="fodAdd"] .tb.strong');await h.waitFlush();
 setRow('fodelsedagar',JSON.stringify([{namn:'Leah',datum:'10-25',ar:2014},{namn:'Morfar',datum:'03-02'},{namn:'Ny från kalendern',datum:'06-01'}]));
 await pg.reload();await h.idle(1800);
 await click('#nav [data-act="nav"][data-id="oversikt"]');
 await click('[data-act="nav"][data-id="fod"]');
 const t=await main();
 assert.ok(t.includes('Testkusin')&&t.includes('Ny från kalendern')&&!t.includes('Morfar'),'Synken får inte skriva över');
 // Veckosedelns önskemål ska inte se födelsedagsposten
 assert.equal(await pg.evaluate(()=>window.__d('wishes().length')),0);
 await h.shot('fod-4-efter-synk');
 // Färg och ändring: tryck på Leah (från kalendern), välj färg och ändra födelseår
 // Barn utan egen färg är orange; ett vanligt tryck öppnar inget, håll in visar strecket och öppnar bladet
 assert.ok((await pg.locator('.cell.bd:has-text("Leah")').getAttribute('style')||'').includes('--bd:'),'Barn ska få färg');
 await click('.cell.bd[data-lock-act="fodEdit"]:has-text("Leah")');assert.equal(await pg.locator('form[data-form="fodAdd"]').count(),0,'Tryck ska inte öppna');
 {const r=pg.locator('.cell.bd[data-lock-act="fodEdit"]:has-text("Leah")').first(),b=await r.boundingBox();await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await pg.waitForTimeout(700);await h.shot('fod-4b-hall-in');await pg.waitForTimeout(800);await pg.mouse.up();await h.idle(500)}
 assert.equal(await pg.locator('form[data-form="fodAdd"] h2').innerText(),'Ändra födelsedag');
 await pg.locator('form[data-form="fodAdd"] input[name="col"][value="teal"]').evaluate(x=>x.closest('label').scrollIntoView({inline:'center'}));
 await pg.locator('form[data-form="fodAdd"] input[name="col"][value="teal"] + span').click();
 await pg.selectOption('select[name="ar"]','2015');await h.shot('fod-5-andra');
 await click('form[data-form="fodAdd"] .tb.strong');await h.waitFlush();
 egna=JSON.parse(row('onskelista')[1]).find(x=>x.fod);
 assert.equal(egna.col['Leah|10-25'],'teal');
 assert.equal(await pg.locator('.cell.bd:has-text("Leah")').count(),1,'Leah ska bara finnas en gång');
 assert.ok((await pg.locator('.cell.bd:has-text("Leah")').innerText()).includes('född 2015'));
 assert.ok(await pg.locator('.cell.bd[style]:has-text("Leah")').count(),'Färgen ska synas');
 // Bara färg på Testkusin, sedan årshjulet
 await pg.locator('.cell.bd:has-text("Testkusin")').evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);await h.hold('.cell.bd[data-lock-act="fodEdit"]:has-text("Testkusin")');
 await pg.locator('form[data-form="fodAdd"] input[name="col"][value="orange"]').evaluate(x=>x.closest('label').scrollIntoView({inline:'center'}));
 await pg.locator('form[data-form="fodAdd"] input[name="col"][value="orange"] + span').click();
 await click('form[data-form="fodAdd"] .tb.strong');await h.waitFlush();
 await h.shot('fod-6-farger');
 await click('[data-act="fodMode"][data-id="hjul"]');await h.shot('fod-7-hjul');
 await click('[data-act="fodMode"][data-id="manad"]');await h.shot('fod-8-manader');
 // Ta bort från bladet
 await click('[data-act="fodMode"][data-id="lista"]');await pg.locator('.cell.bd:has-text("Testkusin")').evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);await h.hold('.cell.bd[data-lock-act="fodEdit"]:has-text("Testkusin")');await click('[data-act="fodDelSheet"]');
 assert.ok(!(await main()).includes('Testkusin'));await click('#undo .ud-b');assert.ok((await main()).includes('Testkusin'));
 await click('#nav [data-act="nav"][data-id="oversikt"]');await h.shot('fod-9-oversikt');
};
