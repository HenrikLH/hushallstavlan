// Aura väljs i Inställningar → Utseende → Design, sitter kvar efter omstart och Noir kan väljas för mörkt läge
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};const cl=()=>pg.evaluate(()=>document.documentElement.className);
 await click('[data-act="settings"]');if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');
 await click('[data-act="uiVersion"][data-id="6"]');assert.match(await cl(),/\bui5\b.*\baura\b/);
 await click('[data-act="auraMork"][data-id="noir"]');assert.match(await cl(),/aura-noir/);await h.shot('aura-val');
 await click('.pref-bk');await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1300);assert.match(await cl(),/\baura\b.*aura-noir/);
 await click('[data-act="settings"]');assert.match(await pg.locator('.foot.ver').textContent(),/Aura/);
 if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');
 await click('[data-act="uiVersion"][data-id="5"]');assert.doesNotMatch(await cl(),/aura/);
 console.log('PASS aura-val');
};
