// Ljusvanor i lampkortet: raden Automatisk ton, förslaget "Ni brukar ha … nu", undersidan med dygnsremsor och paus.
//   LS='{"haDemo":"1"}' NOW=2026-11-10T21:00 node verktyg/emu/run.js verktyg/emu/ljusvanor.js
//   Tjänstens del testas med python3 verktyg/ljusvanor-test.py
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 const F='form[data-form="haLampa"]',oppna=async id=>{await pg.locator('section.ha .ha-t[data-id="'+id+'"] .ha-n').click();await h.idle(1100)};
 // Golvlampan: lär sig (3 dagar), förslag 2 000 K
 await oppna('light.vardagsrum');
 const rad=pg.locator(F+' [data-act="haSub"][data-id="vanor"]');
 assert.equal(await rad.count(),1,'Raden Automatisk ton');assert.match(await rad.innerText(),/Lär sig, 3 dagar/);
 assert.match(await pg.locator(F+' .ha-vfo').innerText(),/2\s000 K\s+Använd/,'Förslaget med kelvin under');
 assert.match(await pg.locator(F+' .ha-vau').innerText(),/Auto\s+Lär sig/,'Auto-knappen');
 await h.shot('ljusvanor-1-forslag');
 await pg.locator(F+' [data-act="haVanaAnv"]').first().click();await h.idle(700);
 assert.equal(await pg.locator(F+' [data-act="haVanaAnv"]').count(),0,'Förslaget försvinner när det används');
 await rad.click();await h.idle(800);
 assert.equal(await pg.locator(F+' .ha-vk').count(),2,'Vardag och helg');
 assert.ok(await pg.locator(F+' .ha-vr i').count()===1,'Strecket för nu');
 await h.shot('ljusvanor-2-undersida');
 await pg.locator(F+' [data-act="haVanaPaus"][data-id="3"]').click();await h.idle(400);
 assert.equal(await pg.locator(F+' [data-act="haVanaPaus"].on').getAttribute('data-id'),'3','Pausval');
 await pg.locator(F+' [data-act="haVanaAuto"]').click();await h.idle(400);
 assert.equal(await pg.locator(F+' [data-act="haVanaAuto"]').isChecked(),false,'Brytaren av');
 await pg.locator(F+' [data-act="haSub"][data-id=""]').click();await h.idle(700);
 assert.match(await rad.innerText(),/Av/,'Status Av på huvudsidan');
 await pg.locator(F+' .ha-vau').click();await h.idle(400);
 assert.equal(await pg.locator(F+' .ha-vau.on').count(),1,'Auto-knappen slår på igen');
 await pg.locator(F+' .ha-x').click();await h.idle(900);
 // Köket: säker vana, inget förslag
 await oppna('light.kok');
 assert.match(await rad.innerText(),/Följer era vanor/);assert.equal(await pg.locator(F+' [data-act="haVanaAnv"]').count(),0,'Inget förslag när den styr själv');
 // brytare utan ton: ingen rad
 await pg.locator(F+' .ha-x').click();await h.idle(900);
};
