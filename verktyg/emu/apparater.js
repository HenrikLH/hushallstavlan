// Smart hem: dammsugare och diskmaskin (apparater) i testläge med låtsasdata.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/apparater.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const ut=[];pg.on('request',r=>{if(/127\.0\.0\.1:8777/.test(r.url())&&r.method()==='POST')ut.push(r.url())});
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(900);
 assert.match(await pg.locator('main').innerText(),/Apparater[\s\S]*Dammsugaren[\s\S]*Diskmaskinen/,'Apparaterna syns');
 await pg.locator('main .ha-rh',{hasText:'Apparater'}).scrollIntoViewIfNeeded();await h.idle(300);
 await h.shot('apparater-vy');
 await pg.locator('main .ha-ap[data-id="vacuum.roborock"]').click();await h.idle(900);
 await pg.locator('#overlay [data-act="haRobRum"][data-id="17"]').click();await h.idle(400);
 await pg.locator('#overlay [data-act="haRobRum"][data-id="19"]').click();await h.idle(400);
 assert.match(await pg.locator('#overlay').innerText(),/Pausa/,'Robotkortet visar Pausa när den städar');
 await h.shot('apparater-robot');
 await pg.locator('#overlay [data-act="haRob"][data-id="paus"]').click();await h.idle(500);
 assert.match(await pg.locator('#overlay').innerText(),/Städa 2 rum/,'Valda rum styr knappen');
 await h.shot('apparater-robot-paus');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 await pg.locator('main .ha-ap[data-id="sensor.diskmaskin"]').click();await h.idle(900);
 assert.match(await pg.locator('#overlay').innerText(),/42 min[\s\S]*Eco 50°/,'Diskkortet visar tid och program');
 await h.shot('apparater-disk');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(900);
 assert.equal(ut.length,0,'Inget skickat till Home Assistant');
};
