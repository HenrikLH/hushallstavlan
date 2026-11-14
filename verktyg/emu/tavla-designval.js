// Tavla 2 och 3 väljs under Inställningar → Utseende → Design utan utvecklarläge; Klassisk och Ateljé finns inte och sparat val flyttas till Apple. LS='{"ui":"4"}'
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const click=async s=>{await pg.locator(s).first().click();await h.idle(600)};const read=s=>pg.evaluate(s=>window.__d(s),s);const cl=()=>pg.evaluate(()=>document.documentElement.className);
 assert.match(await cl(),/\bui5\b/);assert.doesNotMatch(await cl(),/\bui4\b/);assert.equal(await pg.evaluate(()=>localStorage.getItem('ht.ui')),null);
 const opp=async()=>{await click('[data-act="settings"]');if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary')};
 const stang=async()=>{await click('.pref-bk');await click('[data-act="sheetClose"]')};
 await opp();for(const id of ['2','4'])assert.equal(await pg.locator('[data-act="uiVersion"][data-id="'+id+'"]').count(),0);
 const val=(await pg.locator('[data-act="uiVersion"]').allTextContents()).map(s=>s.trim());console.log('Design:',val.join(' / '));
 for(const [id,sel] of [['g','.og'],['h','.ot']]){
  await click('[data-act="uiVersion"][data-id="'+id+'"]');if(process.env.SHOT)await h.shot('design-'+id,true);
  assert.equal(await read('ovNy()'),id);await stang();
  await pg.reload();await h.idle(1500);await click('#nav [data-act="nav"][data-id="oversikt"]');
  if(!await read('wallBoardOn()')||id==='h')assert.ok(await pg.locator(sel).count()||id==='g'&&await pg.locator('.onx').count(),'ingen '+sel);
  await h.shot('tavla-'+id,!await read('wallBoardOn()'));await opp();assert.equal(await pg.locator('[data-act="uiVersion"][data-id="'+id+'"]').getAttribute('aria-pressed'),'true');
 }
 await click('[data-act="uiVersion"][data-id="5"]');assert.equal(await read('ovNy()'),'');assert.equal(await pg.evaluate(()=>localStorage.getItem('ht.ovny')),null);
 console.log('PASS tavla-designval');
};
