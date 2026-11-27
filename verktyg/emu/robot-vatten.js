// Byt vattnet i dockan var 14:e dag: uppgift i Att göra (översikten + Uppgifter) och rad + knapp i dockans kort; bockad = påfylld nu.
// LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-vatten.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const gammal=()=>pg.evaluate(()=>window.__d("haData().apparater.find(a=>a.typ==='robot').tank.fylld=Date.now()/1e3-16*86400;render()"));
 await pg.locator('#nav [data-id="oversikt"]').click();await gammal();await h.idle(1200);
 const ov=pg.locator('main .ot-gora .ot-ti',{hasText:'Byt robotens vatten'});
 if(!process.env.LS.includes('"wall"')){await pg.locator('main .ot-flik [data-id="gora"]').click().catch(()=>{});await h.idle(600)}
 assert.equal(await ov.count(),1,'Uppgiften syns i Att göra på översikten');
 assert.match(await ov.innerText(),/16 d sedan/);
 await h.shot('oversikt');
 await pg.locator('#nav [data-id="uppgifter"]').click();await h.idle(1200);
 assert.equal(await pg.locator('main .cell',{hasText:'Byt robotens vatten'}).count(),1,'Uppgiften syns i Uppgifter');
 await h.shot('uppgifter');
 await pg.locator('#nav [data-id="hemmet"]').click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const seg=pg.locator('main .ha-kseg button');if(await seg.count())await seg.nth(1).click(),await h.idle(1200);
 assert.match(await pg.locator('main .dkx-gor').innerText(),/Byt vattnet, 16 dagar/);
 const k=pg.locator('main .ha-pill',{hasText:'Vattnet bytt'});assert.equal(await k.count(),1,'Knappen Vattnet bytt');
 await h.shot('dockan');
 await k.click();await h.idle(1000);
 assert.equal(await pg.locator('main .ha-pill',{hasText:'Vattnet bytt'}).count(),0,'Knappen borta efter bytet');
 assert.equal(await pg.locator('main .dkx-gor',{hasText:'Byt vattnet'}).count(),0,'Raden borta');
 // bocka från översikten nollställer också
 await gammal();await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(1200);
 if(!process.env.LS.includes('"wall"')){await pg.locator('main .ot-flik [data-id="gora"]').click().catch(()=>{});await h.idle(600)}
 await ov.locator('input').click({force:true});await h.idle(1200);
 assert.equal(await ov.count(),0,'Borta efter bock');
};
