// Verkliga gester och kontroller med emulatorns exempeldata. Ingen hushållsdata ändras.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.emulateMedia({reducedMotion:'no-preference'});
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(320)};
 const nav=async v=>{await click('#nav [data-id="'+v+'"]');await h.idle(350)};
 const drag=async(sel,dy,cancel=false)=>{
  const el=pg.locator(sel).first();await el.scrollIntoViewIfNeeded();await h.idle(100);const b=await el.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
  const before=await pg.evaluate(()=>({y:scrollY,top:document.getElementById('main').getBoundingClientRect().top}));
  await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x,y+dy,{steps:10});
  assert.equal(await pg.evaluate(()=>document.body.style.position),'fixed','Sidan ska vara låst under drag');
  const top=await pg.locator('#main').evaluate(e=>e.getBoundingClientRect().top);assert(Math.abs(top-before.top)<1,'Sidans position står still');
  if(cancel)await el.dispatchEvent('pointercancel',{pointerId:1});else await pg.mouse.up();
  if(cancel)await pg.mouse.up();await h.idle(1000);
  assert.notEqual(await pg.evaluate(()=>document.body.style.position),'fixed','Inget kvarlämnat scroll-lås');
  assert(Math.abs((await pg.evaluate(()=>scrollY))-before.y)<2,'Scrollposition bevarad');
 };
 await nav('mat');await click('[data-act="matTab"][data-id="vecka"]');
 assert.equal(await pg.locator('[data-motion-grip="budget"]').count(),1);
 await drag('[data-motion-grip="budget"]',90);assert.equal(await read('S.wsumOpen'),true);
 await drag('[data-motion-grip="budget"]',-90);assert.equal(await read('S.wsumOpen'),false);
 assert(await pg.locator('#week-budget-details').evaluate(e=>e.hidden&&e.inert));
 await pg.locator('[data-motion-grip="budget"]').press('ArrowDown');await h.idle(350);assert.equal(await read('S.wsumOpen'),true);
 await click('.ws-card .wm-top');assert.equal(await read('S.wsumOpen'),false);
 await drag('[data-motion-grip="budget"]',65,true);assert.equal(await read('S.wsumOpen'),false);
 await h.shot('animationer-veckokostnad');
 await nav('oversikt');
 if(await pg.locator('[data-motion-grip="weather"]').count()){
  if(await read('OVWX')==='graf')await click('[data-motion-grip="weather"]');
  await pg.evaluate(()=>scrollTo(0,80));await drag('[data-motion-grip="weather"]',45);
  assert.equal(await read('OVWX'),'graf');assert.equal(await pg.locator('.ovx.hl-on').count(),0,'Inget håll-in-zoom');
  assert.equal(await pg.locator('.ovx').getAttribute('data-hold-lift'),null);
  await h.shot('animationer-vader-oppet');
  await pg.reload();await h.idle(1800);assert.equal(await read('OVWX'),'graf');
  await drag('[data-motion-grip="weather"]',-45);assert.equal(await read('OVWX'),'tim');
  await pg.locator('[data-motion-grip="weather"]').press('Enter');await h.idle(1100);assert.equal(await read('OVWX'),'graf');
  await pg.locator('[data-motion-grip="weather"]').press('ArrowUp');await h.idle(1000);
  const strip=pg.locator('.ovx .bwx-h');await strip.evaluate(e=>e.scrollLeft=120);assert(await strip.evaluate(e=>e.scrollLeft)>0,'Timremsans sidscroll kvar');
 }
 await nav('uppgifter');await click('[data-act="taskTab"][data-id="kalender"]');
 const date=await read('S.calDay||today()');
 for(const mode of ['dag','vecka','manad','dag']){await click('[data-act="calVy"][data-id="'+mode+'"]');assert.equal(await read('S.calDay||today()'),date,'Valt datum kvar');assert.equal(await read('S.calVy'),mode)}
 await nav('stad');const detail=pg.locator('details[data-k]').first();
 if(await detail.count()){
  const key=await detail.getAttribute('data-k');await detail.locator('summary').click();await h.idle(350);const open=await detail.evaluate(e=>e.open);
  await pg.reload();await h.idle(1600); // samma funktion fungerar även efter omstart
  const d=pg.locator('details[data-k="'+key+'"]'),initial=await d.evaluate(e=>e.open);await d.locator('summary').click();await d.locator('summary').click({force:true});await h.idle(350);assert.equal(await d.evaluate(e=>e.open),initial,'Snabb omvändning avbryter expansion');
 }
 await nav('ekonomi');
 if(await pg.locator('[data-act="pin"]').count())for(const n of ['1','9','1','2'])await click('[data-act="pin"][data-id="'+n+'"]');
 const fold=pg.locator('[data-act="ekoFold"]').first();assert(await fold.count());const total=await fold.textContent();
 await fold.click();await h.idle(350);assert.equal(await fold.getAttribute('aria-expanded'),'false');assert(await fold.evaluate(e=>e.nextElementSibling.hidden&&e.nextElementSibling.inert));
 await fold.click();await h.idle(350);assert.equal(await fold.getAttribute('aria-expanded'),'true');assert.equal(await fold.textContent(),total);assert(await pg.locator('[data-act="ekoCost"]').count()>0);
 await click('[data-act="settings"]');const pref=pg.locator('[data-k="pref-utseende"]');if(!await pref.evaluate(e=>e.open))await pref.locator('summary').click();await h.idle(350);
 await click('[data-act="motion"]');assert.equal(await read('MOTION'),false);
 await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1800);assert.equal(await read('MOTION'),false);
 await nav('mat');assert.equal(await pg.locator('#main').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length),0);
 await click('[data-act="settings"]');const pref2=pg.locator('[data-k="pref-utseende"]');if(!await pref2.evaluate(e=>e.open))await pref2.locator('summary').click();await h.idle(350);await click('[data-act="motion"]');await click('[data-act="sheetClose"]');assert.equal(await read('MOTION'),true);
 await pg.emulateMedia({reducedMotion:'reduce'});await click('[data-motion-grip="budget"]');assert.equal(await read('S.wsumOpen'),true);
 assert.equal(await pg.locator('#week-budget-details').evaluate(e=>e.getAnimations().length),0);
 assert(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Ingen horisontell sidscroll');
 console.log('PASS animationer: handtag, scroll-lås/avbrott, vädergraf utan lyft, minne, kalenderdatum, disclosures, ekonomi, reducerad rörelse');
};
