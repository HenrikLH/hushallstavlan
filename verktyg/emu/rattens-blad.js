const assert=require('node:assert/strict');
// Granskning C3: rättens blad med Börja laga och receptlistan med prisnoten en gång (UI 5.0)
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(700)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 await pg.locator('[data-act="dishMenu"]').first().click();await h.idle(900);
 assert(await pg.locator('.dm-laga').count()<=1,'högst en Börja laga');
 assert.equal(await pg.locator('.dm-g').count(),0,'inga rutor i UI 5.0');
 assert(await pg.locator('[data-hold="dishDelHold"]').count()===1,'Ta bort som håll in');
 await h.shot('blad');
 await click('[data-act="sheetClose"]');
 await click('[data-act="matTab"][data-id="recept"]');await h.idle(1500);
 assert.equal(await pg.locator('.rc-prisnot').count(),1,'prisnoten en gång');
 assert.equal(await pg.locator('.bank .rc-price').filter({hasText:'Uppskattade baspriser'}).count(),0,'ingen reservation på korten');
 await pg.evaluate(()=>{const e=document.querySelector('.rc-prisnot');if(e)scrollTo(0,e.getBoundingClientRect().top+scrollY-120)});await h.idle(400);
 await h.shot('recept');
};
