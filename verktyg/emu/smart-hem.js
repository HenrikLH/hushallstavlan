// Smart hem: rutan i Översikt och vyn Smart hem.
//   Förhandsvisning: LS='{"haDemo":"1"}' (låtsasdata i appen; vägg: LS='{"haDemo":"1","wall":"1","me":""}' VP=1368x912)
//   På riktigt via väggdatorns tjänst: starta verktyg/emu/falsk-ha.py och kiosk/ljussensor.py (HT_TILLATNA=http://localhost:8099,
//   HOME med .config/hushallstavlan-ha.json mot http://127.0.0.1:18123, token "test"), kör sedan PORT=8099 HA=1 LS='{"wall":"1","me":""}' VP=1368x912.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=!!process.env.HA||/"wall":"1"/.test(process.env.LS||'');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(process.env.HA?2500:500);
 const box=pg.locator('section.ha');assert.equal(await box.count(),1,'Smart hem-rutan ska finnas');
 await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(400);
 await h.shot('smart-hem-1');
 const tile=id=>pg.locator('section.ha .ha-t[data-id="'+id+'"]'),ikon=id=>tile(id).locator('.ha-i');
 // ikonen tänder och släcker direkt
 await ikon('light.hall').click();await h.idle(800);
 assert.match(await tile('light.hall').innerText(),/På|%/,'Hallen tänd via ikonen');
 assert.equal(await pg.locator('#overlay form').count(),0,'Ikonen öppnar inget blad');
 await pg.locator('[data-act="haScen"][data-id="av"]').click();await h.idle(800);
 assert.equal(await pg.locator('section.ha .ha-t.on').count(),0,'Släck allt');
 await pg.locator('[data-act="haScen"][data-id="scene.kvall"]').click();await h.idle(1200);
 assert.equal(await pg.locator('section.ha .ha-t.on').count(),3,'Kväll tänder tre');
 // tryck på enheten: styrningen
 await tile('light.vardagsrum').locator('.ha-n').click();await h.idle(600);
 const F='form[data-form="haLampa"]';
 assert.equal(await pg.locator(F+' [data-hainput="b"]').count(),1,'Ljusstyrka i bladet');
 assert.equal(await pg.locator(F+' .ha-f').count(),8,'Färger i bladet');
 await pg.locator(F+' [data-hainput="b"]').evaluate(e=>{e.value=70;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))});await h.idle(800);
 await pg.locator('.ha-f[aria-label="Blå"]').click();await h.idle(1200);
 await h.shot('smart-hem-3-lampa');
 assert.match(await tile('light.vardagsrum').innerText(),/70 %/,'Ljusstyrkan ändrad');
 await pg.locator(F+' [data-act="sheetClose"]').click();await h.idle(500);
 // håll in: lyft och ändra, inte ändra-läget för rutorna
 await h.hold('section.ha .ha-t[data-id="light.hall"] .ha-n');await h.idle(500);
 const E='form[data-form="haEdit"]';
 assert.equal(await pg.locator(E).count(),1,'Håll in öppnar Ändra');assert.equal(await pg.locator('.arr-foot').count(),0,'Inte ändra-läget');
 await pg.locator(E+' [data-act="haNamn"][data-id="Taklampa"]').click();await h.idle(900);
 await pg.locator(E+' [data-act="haRum"][data-id="Kök"]').click();await h.idle(900);
 await h.shot('smart-hem-4-andra');
 await pg.locator(E+' [data-act="sheetClose"]').click();await h.idle(500);
 assert.match(await tile('light.hall').innerText(),/Taklampa/,'Nytt namn');
 if(process.env.HA){
  await fetch('http://127.0.0.1:18123/yttre/light.sovrum',{method:'POST'});await h.idle(2500);
  assert.match(await tile('light.sovrum').innerText(),/På|%/,'Sovrum tänt utifrån syns direkt');
  assert.equal(await ikon('light.bad').isDisabled(),true,'Badrum svarar inte');
  assert.equal(await pg.locator('[data-id="lock.ytterdorr"]').count(),0,'Låset syns inte');
 }
 // vyn Smart hem: rubriken i rutan
 await box.locator('.wh').click();await h.idle(800);
 assert.match(await pg.locator('main').innerText(),/Smart hem[\s\S]*Kök/,'Vyn med rum');
 await h.shot('smart-hem-5-vy');
 await pg.locator('[data-act="haAddOpen"]').first().click();await h.idle(1500);
 const Ad='form[data-form="haAdd"]';
 assert.equal(await pg.locator(Ad).count(),1,'Lägg till-bladet');
 assert.ok(!/Ytterdörr/.test(await pg.locator(Ad).innerText()),'Låset går inte att lägga till');
 await h.shot('smart-hem-6-lagg-till');
 await pg.locator(Ad+' [data-act="haAdd"][data-id="light.tak_kok"]').click();await h.idle(1500);
 await pg.locator(Ad+' [data-act="sheetClose"]').click();await h.idle(800);
 assert.equal(await pg.locator('main .ha-t[data-id="light.tak_kok"]').count(),1,'Tillagd i vyn');
 // ta bort med håll in
 await pg.locator('main .ha-t[data-id="light.tak_kok"]').evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);
 await h.hold('main .ha-t[data-id="light.tak_kok"] .ha-n');await h.idle(500);
 await h.hold('[data-hold="haDelHold"]');await h.idle(1500);
 assert.equal(await pg.locator('main .ha-t[data-id="light.tak_kok"]').count(),0,'Borttagen');
};
