// Smart hem (förslag): rutan med lampor och scener syns i Översikt/väggtavlan med ht.haDemo=1, tryck tänder/släcker, scen ändrar flera.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 const box=pg.locator('section.ha');assert.equal(await box.count(),1,'Smart hem-rutan ska finnas');
 await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(400);
 await h.shot('smart-hem-1');
 await pg.locator('[data-act="haTog"][data-id="light.hall"]').click();await h.idle(300);
 assert.match(await pg.locator('[data-act="haTog"][data-id="light.hall"]').innerText(),/60 %/,'Hallen tänd');
 await pg.locator('[data-act="haScen"][data-id="av"]').click();await h.idle(300);
 assert.equal(await pg.locator('.ha-t.on').count(),0,'Släck allt');
 assert.match(await box.innerText(),/Allt släckt/);
 await pg.locator('[data-act="haScen"][data-id="kvall"]').click();await h.idle(300);
 assert.equal(await pg.locator('.ha-t.on').count(),3,'Kväll tänder tre');
};
