// Ljusvanor i lampkortet: kelvin under reglaget, knappraden (Ton, Auto, Brukar, Ändra), håll in Auto = inställningar,
// håll in Brukar = förklaring, undersidan med dygnsremsor och paus.
//   LS='{"haDemo":"1"}' NOW=2026-11-10T21:00 node verktyg/emu/run.js verktyg/emu/ljusvanor.js
//   Tjänstens del testas med python3 verktyg/ljusvanor-test.py
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 const F='form[data-form="haLampa"]',oppna=async id=>{await pg.locator('section.ha .ha-t[data-id="'+id+'"] .ha-n').click();await h.idle(1100)};
 await oppna('light.vardagsrum');
 assert.equal(await pg.locator(F+' .ha-rad').count(),0,'Inga rader på huvudsidan');
 assert.match(await pg.locator(F+' .ha-tk').innerText(),/1\s850 K/,'Kelvin under reglaget');
 assert.match(await pg.locator(F+' .ha-kns').innerText(),/Ton\s+Auto\s+2\s000 K\s+Ändra/,'Knappraden');
 assert.equal(await pg.locator(F+' .ha-vau.on').count(),1,'Auto på');
 await h.shot('ljusvanor-1-forslag');
 await h.hold(F+' .ha-vfo button');await h.idle(700);
 assert.match(await pg.locator(F+' .ha-tips').innerText(),/Er vanliga ton/,'Håll in Brukar = förklaring');
 await h.shot('ljusvanor-4-tips-forslag');
 await pg.locator(F+' .ha-tk').click();await h.idle(400);
 assert.equal(await pg.locator(F+' .ha-tips').count(),0,'Tryck stänger förklaringen');
 await pg.locator(F+' .ha-vfo button').click();await h.idle(700);
 assert.equal(await pg.locator(F+' .ha-vfo').count(),0,'Förslaget försvinner när det används');
 await h.hold(F+' .ha-vau button');await h.idle(900);
 assert.equal(await pg.locator(F+' .ha-vk').count(),2,'Håll in Auto öppnar inställningarna: vardag och helg');
 assert.equal(await pg.locator(F+' .ha-vr i').count(),1,'Strecket för nu');
 await h.shot('ljusvanor-2-undersida');
 await pg.locator(F+' [data-act="haVanaPaus"][data-id="3"]').click();await h.idle(400);
 assert.equal(await pg.locator(F+' [data-act="haVanaPaus"].on').getAttribute('data-id'),'3','Pausval');
 await pg.locator(F+' input[data-act="haVanaAuto"]').click();await h.idle(400);
 assert.equal(await pg.locator(F+' input[data-act="haVanaAuto"]').isChecked(),false,'Brytaren av');
 await pg.locator(F+' [data-act="haSub"][data-id=""]').click();await h.idle(700);
 assert.equal(await pg.locator(F+' .ha-vau.on').count(),0,'Auto av på huvudsidan');
 await pg.locator(F+' .ha-vau button').click();await h.idle(400);
 assert.equal(await pg.locator(F+' .ha-vau.on').count(),1,'Tryck på Auto slår på igen');
 await pg.locator(F+' .ha-x').click();await h.idle(900);
 await oppna('light.kok');
 assert.equal(await pg.locator(F+' .ha-vfo').count(),0,'Inget förslag när den styr själv');
 await pg.locator(F+' .ha-x').click();await h.idle(900);
};
