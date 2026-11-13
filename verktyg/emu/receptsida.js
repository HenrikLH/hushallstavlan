const assert=require('node:assert/strict'),fs=require('fs');
// Receptsidan i UI 5.0 (M29): ⋯-menyn, betyg under titeln, Börja laga + veckan, Tidigast igen med −/+.
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
 assert.equal(await pg.locator('.rcp-facts .fn',{hasText:'Senast lagad'}).count(),0,'Senast lagad inte i faktarutan');
 assert.match(await pg.locator('.rcp-facts').innerText(),/~\d+ kr/,'~ före priset');
 await pg.locator('.rcp-meny summary').click();await h.idle(400);
 await pg.locator('.rcp-meny [data-k="tidigast"]').click();await h.idle(800);
 const big=()=>pg.locator('.ti-step .ti-big').textContent();
 const fore=await big();await pg.locator('.ti-step [data-d="1"]').click();await h.idle(600);const efter=await big();
 console.log('Tidigast igen',fore,'→',efter);assert.notEqual(fore,efter,'+ ändrar Tidigast igen');
 assert.equal(await pg.locator('.ti-row',{hasText:'Senast lagad'}).count(),1,'Senast lagad i bladet');
 await h.shot('tidigast');
 for(let i=0;i<12;i++){if(await pg.locator('.ti-step [data-d="1"]:disabled').count())break;await pg.locator('.ti-step [data-d="1"]').click();await h.idle(250)}
 assert.equal(await big(),'Aldrig','sista steget är Aldrig');
 await pg.locator('.ti-step [data-d="-1"]').click();await h.idle(400);assert.equal(await big(),'26 veckor','tillbaka från Aldrig');
};
