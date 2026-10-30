// Riktiga klick i inköpslistan; bara emulatorns exempeldata.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(550)};
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 await click('#nav [data-id="mat"]');await click('[data-act="matTab"][data-id="inkop"]');
 for(const name of ['Kollapstest äpple','Kollapstest mjölk']){const input=pg.locator('[data-form="shopQuick"] [name="name"]');if(await input.count()){await input.fill(name);await input.press('Enter')}else{await click('[data-act="shopAdd"]');await pg.locator('[data-form="shop"] [name="name"]').fill(name);await pg.locator('[data-form="shop"] button.tb.strong').click()}await h.idle(800);await h.waitFlush();if(await pg.locator('[data-form="shop"]').count())await click('[data-act="sheetClose"]')}
 assert.equal(await pg.locator('[data-act="shopFilter"]').count(),0,'Filtermenyn är ersatt');
 const buttons=pg.locator('[data-act="shopFold"]'),n=await buttons.count();assert(n>=2);
 assert.equal(await pg.locator('.g-one input[data-act="shopToggle"]').count(),await read('D().shop.length'),'Alla varor finns i M10');
 const first=buttons.first(),key=await first.getAttribute('data-id'),firstSel='[data-act="shopFold"][data-id="'+key+'"]',panel='#'+await first.getAttribute('aria-controls'),total=await first.textContent();
 await first.click();await h.idle(550);assert.equal(await first.getAttribute('aria-expanded'),'false');assert(await pg.locator(panel).evaluate(e=>e.hidden&&e.inert));
 assert.equal(await first.textContent(),total,'Antal och summa finns kvar i rubriken');
 assert.equal(await buttons.nth(1).getAttribute('aria-expanded'),'true','Övriga avdelningar påverkas inte');
 const checkbox=pg.locator('.motion-panel:not([hidden]) input[data-act="shopToggle"]').first(),id=await checkbox.getAttribute('data-id'),was=await checkbox.isChecked();
 await checkbox.click();await h.idle(1000);await h.waitFlush();assert.equal(await read('D().shop.find(x=>x.id==='+JSON.stringify(id)+').done'),!was,'Avbockning fungerar');
 assert.equal(await pg.locator(firstSel).getAttribute('aria-expanded'),'false','Hopfällning överlever omritning');
 await click('[data-act="matTab"][data-id="vecka"]');await click('[data-act="matTab"][data-id="inkop"]');assert.equal(await pg.locator(firstSel).getAttribute('aria-expanded'),'false','Hopfällning finns kvar vid återkomst');
 await pg.locator(firstSel).press('Enter');await h.idle(550);assert.equal(await pg.locator(firstSel).getAttribute('aria-expanded'),'true');assert(await pg.locator(panel).evaluate(e=>!e.hidden&&!e.inert));
 await pg.locator(firstSel).press('Space');await h.idle(550);assert.equal(await pg.locator(firstSel).getAttribute('aria-expanded'),'false');await h.shot('inkop-kollapsad');
 await pg.reload();await h.idle(1800);assert.equal(await pg.locator('[data-act="shopFold"][aria-expanded="false"]').count(),0,'Ny session börjar med synliga avdelningar');
 await h.shot('inkop-alla-avdelningar');
 await click('[data-act="settings"]');const advanced=pg.locator('[data-k="pref-avancerat"]');if(!await advanced.evaluate(e=>e.open))await advanced.locator('summary').click();await h.idle(550);
 if(await read('MOTION'))await click('[data-act="motion"]');await click('[data-act="sheetClose"]');
 await pg.locator('[data-act="shopFold"]').first().click();assert(await pg.locator('[data-act="shopFold"]').first().evaluate(e=>e.nextElementSibling.hidden),'Fungerar med animationer av');
 assert(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('PASS inkop-kollaps: kategori, antal/summa, tangentbord, avbockning, omritning, navigering, omstart och animationer av');
};
