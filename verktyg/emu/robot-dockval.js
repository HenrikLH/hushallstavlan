// Dammsugarvyn: Karta | Dockan ovanför kortet; tryck på Dockan visar dockan.
// LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-dockval.js   (väggen visar karta och docka samtidigt, se robot-vagg3.js)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="hemmet"]').click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 if(process.env.LS.includes('"wall"')){assert.equal(await pg.locator('main .ha-kseg').count(),0,'Väggen har inget val');return}
 const seg=pg.locator('main .ha-kseg button');assert.equal(await seg.count(),2,'Karta och Dockan');
 assert.equal(await pg.locator('main .ha-kortd').count(),0,'Inga prickar');
 await h.shot('karta');
 await seg.nth(1).click();await h.idle(1200);
 assert.equal(await seg.nth(1).getAttribute('aria-selected'),'true','Dockan vald');
 const x=await pg.locator('main .ha-kortr').evaluate(e=>e.scrollLeft);assert.ok(x>50,'Kortet har bläddrat till dockan');
 await h.shot('dockan');
 await seg.nth(0).click();await h.idle(1200);
 assert.equal(await pg.locator('main .ha-kortr').evaluate(e=>e.scrollLeft),0,'Tillbaka till kartan');
};
