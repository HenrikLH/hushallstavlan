// Diskmaskinen: VarioSpeed i diskkortet (Henrik 19/11). Testläge med låtsasdata.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/disk-vario.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 await pg.evaluate(()=>window.__d(`const d=haData().apparater.find(a=>a.typ==='disk');d.st='ready';d.pct=null;d.slut=null;render()`));await h.idle(500);
 await pg.locator('main .ha-ap[data-id="diskmaskin"]').click();await h.idle(900);
 const sw=pg.locator('#overlay [data-act="haDiskVario"]');
 assert.equal(await sw.count(),1,'VarioSpeed-brytaren syns före start');
 assert.equal(await sw.isChecked(),false,'VarioSpeed av från början');
 await sw.click();await h.idle(500);
 assert.equal(await pg.locator('#overlay [data-act="haDiskVario"]').isChecked(),true,'VarioSpeed på efter tryck');
 await h.shot('disk-vario');
 await pg.locator('#overlay [data-act="haDisk"]').click();await h.idle(700);
 assert.equal(await pg.locator('#overlay [data-act="haDiskVario"]').count(),0,'Brytaren låst medan programmet går');
 assert.match(await pg.locator('#overlay').innerText(),/VarioSpeed\s*På/,'Visar På medan programmet går');
 await h.shot('disk-vario-kor');
};
