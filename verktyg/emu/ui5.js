// UI 5.0 (Apple): välj i Inställningar → Utseende → Design genom att klicka, starta om och kontrollera att valet sitter kvar
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 await click('[data-act="settings"]');if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');
 await click('[data-act="uiVersion"][data-id="5"]');
 assert.equal(await pg.evaluate(()=>[...document.querySelectorAll('.pref-section')].filter(x=>x.offsetHeight).length),1,'en öppen del visas som egen sida');
 await click('.pref-bk');assert.equal(await pg.evaluate(()=>[...document.querySelectorAll('.pref-section')].filter(x=>x.offsetHeight).length),6,'tillbaka visar hela listan');
 await click('[data-k="pref-personer"]>summary');assert(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open),'bara en del öppen åt gången');
 assert(await pg.evaluate(()=>document.documentElement.classList.contains('ui5')));
 assert(await pg.evaluate(()=>document.documentElement.classList.contains('nav-glas')));
 assert(!await pg.locator('[data-act="segstil"]').count(),'Form på knappar ska inte visas i UI 5.0');
 await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1300);
 assert(await pg.evaluate(()=>document.documentElement.classList.contains('ui5')));
 await click('[data-act="settings"]');assert.match(await pg.locator('.foot.ver').textContent(),/UI 5\.0/);
 if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');
 await click('[data-act="uiVersion"][data-id="2"]');
 assert(!await pg.evaluate(()=>document.documentElement.classList.contains('ui5')));
 console.log('PASS UI5');
};
