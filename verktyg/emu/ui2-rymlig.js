// Ett enhetsval: standarden bevaras, formval och byte/omstart får inte tappa funktioner eller utkast.
const assert=require('node:assert/strict');
require('./gas').book.sheets['Uppgifter'].rows.push([false,'Prova rymliga kontroller','2026-10-18','Henrik','','rymlig-test','App','']);
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(200)};
 const section=async k=>{const s=pg.locator('[data-k="pref-'+k+'"]');if(!await s.evaluate(e=>e.open))await s.locator('summary').click()};
 const settings=async()=>{await click('[data-act="settings"]');await section('utseende')};
 const dimensions=()=>pg.locator('.segc').first().evaluate(e=>{const s=getComputedStyle(e);return[s.height,s.padding,s.borderRadius]});
 assert.equal(await read('RYMLIG'),false);await click('#nav [data-id="uppgifter"]');const original=await dimensions();
 await settings();await section('vardag');await pg.locator('[name="budget"]').fill('1234');await section('utseende');await click('[data-act="rymlig"]');assert.equal(await pg.locator('[name="budget"]').inputValue(),'1234');
 await click('[data-act="sheetClose"]');assert.equal(await read('RYMLIG'),true);
 const radii=[];
 for(const form of ['standard','kapsel','klassisk']){
  await settings();await click('[data-act="segstil"][data-id="'+form+'"]');await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1400);
  assert.equal(await read('RYMLIG'),true);assert.equal(await read('SEGSTIL'),form);assert(await pg.locator('html').evaluate(e=>e.classList.contains('rymlig')));
  const d=await dimensions();assert.equal(d[0],'48px');assert.equal(d[1],'5px');radii.push(d[2]);
  await click('[data-act="taskTab"][data-id="kalender"]');await click('[data-act="calVy"][data-id="manad"]');
  await h.shot('ui2-rymlig-'+form);
 }
 assert.equal(new Set(radii).size,3,'Formvalen ska vara olika även efter omstart');
 await require('./alla-flikar')(pg,h);
 await section('utseende');await click('[data-act="uiVersion"][data-id="4"]');assert.equal(await pg.locator('[data-act="rymlig"]').count(),0);assert.equal(await pg.locator('html').evaluate(e=>e.classList.contains('rymlig')),false);
 await click('[data-act="uiVersion"][data-id="2"]');assert.equal(await pg.locator('html').evaluate(e=>e.classList.contains('rymlig')),true);
 await click('[data-act="segstil"][data-id="standard"]');await click('[data-act="rymlig"]');await click('[data-act="sheetClose"]');
 await click('#nav [data-id="uppgifter"]');assert.deepEqual(await dimensions(),original,'Av ska återge det ursprungliga UI2');
 await pg.reload();await h.idle(1400);assert.equal(await read('RYMLIG'),false);assert.equal(await pg.locator('html').evaluate(e=>e.classList.contains('rymlig')),false);
 console.log('PASS UI2 rymlig: av som standard, utkast bevarat, tre former/omstart, alla flikar, UI4 isolerad, av återställer originalet');
};
