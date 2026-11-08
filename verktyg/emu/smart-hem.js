// Smart hem: rutan med lampor och scener.
//   Förhandsvisning: LS='{"haDemo":"1"}' (telefon och vägg, låtsasdata i appen)
//   På riktigt via väggdatorns tjänst: starta verktyg/emu/falsk-ha.py och kiosk/ljussensor.py (HT_TILLATNA=http://localhost:8099),
//   kör sedan PORT=8099 HA=1 LS='{"wall":"1","me":""}' VP=1368x912. Testet tänder/släcker, kör scen, och ändrar en lampa "utifrån".
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(process.env.HA?2500:500);
 const box=pg.locator('section.ha');assert.equal(await box.count(),1,'Smart hem-rutan ska finnas');
 await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(400);
 await h.shot('smart-hem-1');
 const tile=id=>pg.locator('[data-act="haTog"][data-id="'+id+'"]');
 await tile('light.hall').click();await h.idle(800);
 assert.match(await tile('light.hall').innerText(),/På|%/,'Hallen tänd');
 await pg.locator('[data-act="haScen"][data-id="av"]').click();await h.idle(800);
 assert.equal(await pg.locator('.ha-t.on').count(),0,'Släck allt');
 assert.match(await box.innerText(),/Allt släckt/);
 await pg.locator('[data-act="haScen"][data-id="scene.kvall"]').click();await h.idle(1200);
 assert.equal(await pg.locator('.ha-t.on').count(),3,'Kväll tänder tre');
 if(process.env.HA){
  await fetch('http://127.0.0.1:18123/yttre/light.sovrum',{method:'POST'});await h.idle(2500);
  assert.match(await tile('light.sovrum').innerText(),/På|%/,'Sovrum tänt utifrån syns direkt');
  assert.equal(await tile('light.bad').isDisabled(),true,'Badrum svarar inte');
  assert.equal(await pg.locator('[data-act="haTog"][data-id="lock.ytterdorr"]').count(),0,'Låset syns inte');
  await h.shot('smart-hem-2-live');
 }
};
