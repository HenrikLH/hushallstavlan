// UI 4.0: val/omstart, oförändrade UI2-preferenser och riktiga maträtts-/timerhandlingar.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{const el=pg.locator(s).first();if(!await el.isVisible()){const section=pg.locator('.pref-section').filter({has:el});if(await section.count())await section.locator('summary').click()}await el.click();await h.idle(500)};
 assert.equal(await read('U4'),true);assert.equal(await read('U3'),false);
 await require('./alla-flikar')(pg,h);
 assert.equal(await pg.locator('[data-act="uiVersion"][data-id="3"]').count(),0,'UI3 är fortfarande ett utvecklarval');
 const keys=['accent','segstil','flikrad','ovLayoutNy','wallLayoutNy'];
 const before=await pg.evaluate(keys=>keys.map(k=>localStorage.getItem('ht.'+k)),keys);
 const original=String(await read('settings().matbudget')||'');
 await click('.pref-section[data-k="pref-vardag"]>summary');await pg.locator('[name="budget"]').fill('1234');
 await click('[data-act="uiVersion"][data-id="2"]');assert.equal(await read('U4'),false);
 assert.equal(await pg.locator('[name="budget"]').inputValue(),'1234');
 await click('[data-act="uiVersion"][data-id="4"]');assert.equal(await read('U4'),true);
 assert.equal(await pg.locator('[name="budget"]').inputValue(),'1234');
 assert.deepEqual(await pg.evaluate(keys=>keys.map(k=>localStorage.getItem('ht.'+k)),keys),before);
 await click('[data-act="dev"]');assert.equal(await read('U4'),true);
 await click('[data-act="dev"]');assert.equal(await read('U4'),true,'UI4 kvar när utvecklarläget stängs');
 await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1700);
 assert.equal(await read('U4'),true);assert.equal(await read('DEV'),false);assert.equal(await read('S.data.settings.matbudget'),original);
 // Riktiga färgval gäller UI4 utan att skriva över UI2:s accent.
 await click('[data-act="settings"]');await click('[data-act="farg"]');
 await click('[data-act="accMin"]');assert.equal(await read('accentPref()'),'min');
 assert.equal(await pg.evaluate(()=>localStorage.getItem('ht.accent')),before[0]);
 await click('[data-act="sheetClose"]');
 for(const v of ['oversikt','mat','uppgifter','stad','ekonomi']){
  await click('#nav [data-id="'+v+'"]');
  assert.equal(await read('S.view'),v);assert.equal(await pg.locator('.banner').filter({hasText:'Något gick fel'}).count(),0);
  const overflow=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,v+' har horisontell överströmning: '+overflow);
 }
 await click('#nav [data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 const more=pg.locator('.u4-more').first();assert.ok(await more.count());const size=await more.boundingBox();assert.ok(size.width>=44&&size.height>=44,'Menyn har en riktig tryckyta');
 await click('.u4-more');assert.equal(await read('S.sheet'),'dish');
 assert.ok(await pg.locator('.sheet [data-act="portStep"]').count());
 assert.ok(await pg.locator('.sheet [data-a="swLock"]').count());await h.shot('ui4-rattens-meny');
 await click('.sheet [data-act="sheetClose"]');
 await click('.bt .bq[data-act="recipe"]');await click('[data-act="cook"]');
 await click('.cook .tp-r:nth-child(2) .tp-t');assert.ok(await read('S.timers.length>0'),'Timern startar');
 await click('.cook .tp-r:nth-child(2) .tp-t');assert.ok(await read('S.timers.some(t=>t.p!=null)'),'Timern pausar');
 await click('[data-act="cookClose"]');
 await click('#nav [data-id="oversikt"]');await h.shot('ui4-oversikt');
 assert.equal(await pg.locator('html').evaluate(x=>x.classList.contains('u4-dark')),await read('isDark()'));
 console.log('PASS UI4: alla vyer, UI-byte, omstart utan utvecklarläge, bevarade preferenser/utkast, accent, synlig rättmeny och fungerande timers');
};
