// Tryck på en dag i W4 (dagsprognosen) öppnar Dagens väder (B24): temperatur, nederbörd och vind i samma graf, byt dag i raden överst.
// WXYR=1 WXMIX=1 ger Yr-liknande data (timvärden 60 h, sedan var sjätte timme) med växlande väder.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(800);
 const rows=pg.locator('button.day-row[data-act="wxDay"]');assert((await rows.count())>=7);
 await rows.nth(0).scrollIntoViewIfNeeded();await rows.nth(0).click();await h.idle(1500);
 assert.equal(await pg.evaluate(()=>window.__d('S.sheet')),'wxDay');
 assert(await pg.locator('.wd-dot').count(),'nu-pricken saknas idag');assert(await pg.locator('.wd-mk.h').count());
 assert.match(await pg.locator('.wd-sum').textContent(),/^Idag blir det .+ mellan/);
 await h.shot('dag-idag');
 await pg.click('.wd-days button:nth-of-type(2)');await h.idle(1500);
 assert.match(await pg.locator('.wd-sum').textContent(),/^I morgon/);assert.equal(await pg.locator('.wd-body.an.from-r').count(),1);assert.equal(await pg.locator('.wd-dot').count(),0);
 await h.shot('dag-imorgon');
 assert(await pg.locator('.wd-ar').count(),'vindpilar saknas');assert(await pg.locator('.wd-bar').count(),'staplar saknas');
 // omritning utan dagbyte ska inte spela animationerna igen
 await pg.evaluate(()=>window.__d('overlayKeepScroll()'));assert.equal(await pg.locator('.wd-body.an').count(),0);
 const n=await pg.locator('.wd-days [data-act="wxDay"]').count();await pg.click('.wd-days button:nth-of-type('+n+')');await h.idle(500);
 assert((await pg.locator('.wd-icons span').count())>=1);await h.shot('dag-sista');
 // överlever omritningen var 30:e sekund och stängs med Klar
 await pg.evaluate(()=>window.__d('overlayKeepScroll()'));assert.equal(await pg.locator('.wd-chart').count(),1);
 await pg.click('.sheet-head [data-act="sheetClose"]');await h.idle(500);assert.equal(await pg.evaluate(()=>window.__d('S.sheet')),null);
 console.log('PASS: dagsbladet öppnas från W4, byter dag och graf, stängs med Klar.');
};
