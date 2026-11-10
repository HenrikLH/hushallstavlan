// Ljusvanor i lampkortet: kelvin under reglaget, Auto (tryck = på/av, håll in = inställningarna), undersidan med dygnsremsor och paus.
// Utseendet prövas i tre varianter (ht.haKortV A/B/C, A förvalt):
//   LS='{"haDemo":"1","haKortV":"B"}' NOW=2026-11-10T21:00 node verktyg/emu/run.js verktyg/emu/ljusvanor.js
//   Tjänstens del testas med python3 verktyg/ljusvanor-test.py
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const V=(JSON.parse(process.env.LS||'{}').haKortV)||'A';
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 const F='form[data-form="haLampa"]',oppna=async id=>{await pg.locator('section.ha .ha-t[data-id="'+id+'"] .ha-n').click();await h.idle(1100)};
 const AU=F+' button[data-act="haVanaAuto"]',stang=async()=>{await pg.locator(F+' .ha-x').click();await h.idle(900)};
 await oppna('light.vardagsrum');
 assert.equal(await pg.locator(F+' .ha-rad').count(),0,'Inga rader på huvudsidan');
 assert.match(await pg.locator(F+' .ha-tk').first().innerText(),/1\s850 K/,'Kelvin under reglaget');
 assert.equal(await pg.locator(F+' [data-act="haVanaAnv"]').count(),0,'Inget förslag (borttaget)');
 assert.equal(await pg.locator(F+' [data-act="haSub"][data-id="ton"]').count(),1,'Väg till Ton och färg');
 assert.equal(await pg.locator(F+' [data-act="haEdit"]').count(),1,'Väg till Ändra');
 assert.equal(await pg.locator(AU).count(),1,'Auto-knappen');assert.ok(await pg.locator(AU).evaluate(e=>e.classList.contains('on')||e.closest('.on')!=null),'Auto på');
 await h.shot('ljusvanor-'+V);
 await pg.locator(AU).click();await h.idle(500);
 assert.equal(await pg.locator(AU).getAttribute('aria-pressed'),'false','Tryck slår av');
 await pg.locator(AU).click();await h.idle(500);
 await h.hold(AU);await h.idle(900);
 assert.equal(await pg.locator(F+' .ha-vk').count(),2,'Håll in Auto öppnar inställningarna');
 await h.shot('ljusvanor-installningar');
 await pg.locator(F+' [data-act="haVanaPaus"][data-id="3"]').click();await h.idle(400);
 assert.equal(await pg.locator(F+' [data-act="haVanaPaus"].on').getAttribute('data-id'),'3','Pausval');
 await pg.locator(F+' [data-act="haSub"][data-id=""]').click();await h.idle(700);
 await pg.locator(F+' [data-act="haSub"][data-id="ton"]').click();await h.idle(700);
 assert.equal(await pg.locator(F+' [data-act="haFavNy"]').count(),1,'Spara som favorit finns under Ton');
 await stang();
};
