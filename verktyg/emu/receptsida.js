const assert=require('node:assert/strict'),fs=require('fs');
// Receptsidan i UI 5.0 (M29/M28): ⋯-menyn, betyg under titeln, Börja laga + veckan, Tidigast igen med −/+.
// FOTO=sökväg till en jpg ersätter rättens nätbild (molnet når inte bildsajterna). RID=annan rätt.
module.exports=async(pg,h)=>{
 if(process.env.FOTO){const b=fs.readFileSync(process.env.FOTO);await pg.route(/images\.arla\.com/,r=>r.fulfill({contentType:'image/jpeg',body:b}))}
 const ev=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('[data-act="nav"][data-id="mat"]').first().click();await h.idle(700);
 await ev('ACT.recipe("'+(process.env.RID||'insp-kikartsbiffar')+'")');await h.idle(1200);
 assert.equal(await pg.locator('.rcp-top').count(),1,'receptsidan öppnad');
 await h.shot('topp');
 if(!await pg.locator('.rcp5').count())return; // UI 2.0: bara bilden
 assert.equal(await pg.locator('.rcp5 [data-rc="edit"]').count(),1,'Redigera finns i menyn');
 assert.equal(await pg.locator('.rcp5 .block [data-rc="edit"]').count(),0,'ingen egen Redigera-knapp');
 await pg.locator('.rcp-meny summary').click();await h.idle(500);await h.shot('meny');
 await pg.locator('.rcp-meny summary').click();await h.idle(400);
 const steg=pg.locator('[data-ref="M28"] .stepper span');
 await steg.evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);
 const fore=await steg.textContent();
 await pg.locator('[data-act="tidSteg"][data-d="1"]').click();await h.idle(700);
 const efter=await pg.locator('[data-ref="M28"] .stepper span').textContent();
 console.log('Tidigast igen',fore,'→',efter);assert.notEqual(fore,efter,'+ ändrar Tidigast igen');
 await pg.locator('[data-ref="M28"]').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-330));await h.idle(400);await h.shot('planering');
 for(let i=0;i<12;i++){if(await pg.locator('[data-act="tidSteg"][data-d="1"]:disabled').count())break;await pg.locator('[data-act="tidSteg"][data-d="1"]').click();await h.idle(250)}
 assert.equal(await pg.locator('[data-ref="M28"] .stepper span').textContent(),'Aldrig','sista steget är Aldrig');
 await pg.locator('[data-act="tidSteg"][data-d="-1"]').click();await h.idle(400);
 assert.equal(await pg.locator('[data-ref="M28"] .stepper span').textContent(),'26 veckor','tillbaka från Aldrig');
 await pg.locator('[data-k="tidigast"]').click();await h.idle(800);await h.shot('tidigast');
};
