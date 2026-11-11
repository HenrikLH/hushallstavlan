// Smart hem: rutan i Översikt och vyn Smart hem.
//   Förhandsvisning: LS='{"haDemo":"1"}' (låtsasdata i appen; vägg: LS='{"haDemo":"1","wall":"1","me":""}' VP=1368x912)
//   På riktigt via väggdatorns tjänst: starta verktyg/emu/falsk-ha.py och kiosk/ljussensor.py (HT_TILLATNA=http://localhost:8099,
//   HOME med .config/hushallstavlan-ha.json mot http://127.0.0.1:18123, token "test"), kör sedan PORT=8099 HA=1 LS='{"wall":"1","me":""}' VP=1368x912.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=!!process.env.HA||/"wall":"1"/.test(process.env.LS||'');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(process.env.HA?2500:500);
 const box=pg.locator('section.ha');assert.equal(await box.count(),1,'Smart hem-rutan ska finnas');
 // demodatan spelar musik: då visar rutan volymkortet i stället för de släckta favoriterna (ht-v345). Stoppa först så att alla syns.
 if(await box.locator('.hab-med').count()){await box.locator('.hab-med .ha-tx[data-act="habMedOpen"]').click();await h.idle(700);
  await pg.locator('form[data-form="haMedia"] [data-act="haMedStopp"]').click();await h.idle(800);assert.equal(await box.locator('.hab-med').count(),0,'Musiken stoppad')}
 await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(400);
 await h.shot('smart-hem-1');
 const tile=id=>pg.locator('section.ha .ha-t[data-id="'+id+'"]');
 // ikonen tänder och släcker direkt, resten av brickan öppnar reglagen
 await tile('light.hall').locator('.ha-i').click();await h.idle(800);
 assert.match(await tile('light.hall').innerText(),/På|%/,'Hallen tänd med ikonen');
 assert.equal(await pg.locator('#overlay form').count(),0,'Ikonen öppnar inget blad');
 await tile('light.hall').locator('.ha-n').click();await h.idle(1200);
 assert.equal(await pg.locator('form[data-form="haLampa"]').count(),1,'Tryck på brickan öppnar reglagen');
 await pg.locator('form[data-form="haLampa"] .ha-x').click();await h.idle(900);
 assert.equal(await pg.locator('form[data-form="haLampa"]').count(),0,'Krysset stänger');
 await pg.locator('section.ha [data-act="habScen"][data-id="3"]').click();await h.idle(800);
 assert.equal(await pg.locator('section.ha .ha-t.on:not(.ha-ap)').count(),0,'Släck allt');
 await pg.locator('section.ha [data-act="habScen"][data-id="1"]').click();await h.idle(1200);
 assert.equal(await pg.locator('section.ha .ha-t.on:not(.ha-ap)').count(),3,'Kväll tänder tre');
 // håll in: styrningen med det lodräta reglaget
 await h.hold('section.ha .ha-t[data-id="light.vardagsrum"] .ha-n');await h.idle(600);
 const F='form[data-form="haLampa"]',vs=pg.locator(F+' .ha-vs[data-havs="b"]');
 assert.equal(await vs.count(),1,'Lodrätt reglage i bladet');assert.equal(await pg.locator('.arr-foot').count(),0,'Inte ändra-läget');
 assert.equal(await pg.locator(F+' [data-act="haSub"][data-id="ton"]').count(),1,'Rad till Ton och färg');
 const r=await vs.boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height/2;
 await pg.mouse.move(cx,cy);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(cx,cy-i*r.height*.025);await h.idle(16)}await pg.mouse.up();await h.idle(800);
 assert.match(await pg.locator(F+' [data-hav="s"]').innerText(),/70 %/,'Dra uppåt: 45 → 70 %');
 await pg.locator(F+' [data-act="haFavV"]:has-text("Stearin")').click();await h.idle(900);
 assert.match(await pg.locator(F+' .ha-tk').innerText(),/Stearin/,'Stearin valt');
 await h.shot('smart-hem-3b-stearin');
 await pg.locator(F+' [data-act="haFavV"]:has-text("Vitt")').click();await h.idle(900);
 assert.match(await pg.locator(F+' .ha-tk').innerText(),/Vitt/,'Vitt valt');
 await pg.locator(F+' [data-act="haSub"][data-id="ton"]').click();await h.idle(700);
 assert.equal(await pg.locator(F+' [data-hat]').count(),1,'Tonreglage på undersidan');assert.equal(await pg.locator(F+' .ha-f').count(),8,'Färger på undersidan');
  await pg.locator(F+' .ha-f[aria-label="Blå"]').click();await h.idle(1200);
 assert.equal(await pg.locator(F+' .ha-f.vald').count(),1,'Blå vald, undersidan står kvar');
 await h.shot('smart-hem-3-lampa');
 await pg.locator(F+' .ha-tbk').click();await h.idle(700);
 assert.match(await tile('light.vardagsrum').innerText(),/70 %/,'Ljusstyrkan ändrad');
 await pg.mouse.click(cx,cy);await h.idle(800);
 assert.match(await tile('light.vardagsrum').innerText(),/Av/,'Tryck på reglaget släcker');
 await pg.mouse.click(cx,cy);await h.idle(800);
 // vidare till Ändra
 await pg.locator(F+' [data-act="haEdit"]').click();await h.idle(500);
 const E='form[data-form="haEdit"]';
 assert.equal(await pg.locator(E).count(),1,'Namn, rum och ta bort');
 await pg.locator(E+' [data-act="haNamn"][data-id="Golvlampa"]').click();await h.idle(900);
 await pg.locator(E+' [data-act="haRum"][data-id="Vardagsrum"]').click();await h.idle(900);
 await h.shot('smart-hem-4-andra');
 await pg.locator(E+' [data-act="sheetClose"]').click();await h.idle(500);
 assert.match(await tile('light.vardagsrum').innerText(),/Golvlampa/,'Nytt namn');
 if(process.env.HA){
  await fetch('http://127.0.0.1:18123/yttre/light.sovrum',{method:'POST'});await h.idle(2500);
  assert.match(await tile('light.sovrum').innerText(),/På|%/,'Sovrum tänt utifrån syns direkt');
  assert.match(await tile('light.bad').innerText(),/Svarar inte/,'Badrum svarar inte');
  assert.equal(await pg.locator('[data-id="lock.ytterdorr"]').count(),0,'Låset syns inte');
 }
 // vyn Smart hem: rubriken i rutan
 await box.locator('.wh').click();await h.idle(800);
 assert.match(await pg.locator('main').innerText(),/Smart hem[\s\S]*Ljus[\s\S]*Scener[\s\S]*Kök/,'Vyn med status, scener och rum');
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
 await pg.locator('form[data-form="haLampa"] [data-act="haEdit"]').click();await h.idle(500);
 await h.hold('[data-hold="haDelHold"]');await h.idle(1500);
 assert.equal(await pg.locator('main .ha-t[data-id="light.tak_kok"]').count(),0,'Borttagen');
};
