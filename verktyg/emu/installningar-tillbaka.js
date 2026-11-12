// UI 5.0: en öppen del i Inställningar har tillbakaknapp i bladets rubrik och delens namn som titel.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const f='form[data-form="settings"]',bk=f+' .pref-bk';
 await pg.locator('[data-act="settings"]').first().click();await h.idle(600);
 assert.equal(await pg.locator(bk).isVisible(),false);assert.equal(await pg.locator(f+' .sheet-head h2').textContent(),'Inställningar');
 for(const k of ['enhet','mat']){
  await pg.locator('[data-k="pref-'+k+'"]>summary').click();await h.idle(700);
  assert.equal(await pg.locator(bk).isVisible(),true);assert.equal(await pg.locator(f+' .pref-avb').isVisible(),false);
  const namn=await pg.locator('[data-k="pref-'+k+'"]>summary span').textContent();
  assert.equal(await pg.locator(f+' .sheet-head h2').textContent(),namn);
  if(k==='enhet')await h.shot('tillbaka-enhet');
  await pg.locator(bk).click();await h.idle(600);
  assert.equal(await pg.locator(f+' .pref-section[open]').count(),0);assert.equal(await pg.locator(f+' .sheet-head h2').textContent(),'Inställningar');assert.equal(await pg.locator(f+' .pref-avb').isVisible(),true);
 }
 console.log('PASS installningar-tillbaka: tillbakaknapp och titel i rubriken, tillbaka till listan');
};
