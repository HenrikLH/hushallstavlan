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
};
