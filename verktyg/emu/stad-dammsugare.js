// Städ: genvägen till dammsugaren (S12) med låtsasdata.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/stad-dammsugare.js
require('./stad-data');const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const wall=await pg.evaluate(()=>window.__d('wallBoardOn()'));
 await pg.locator('#nav [data-id="uppgifter"], #nav [data-id="stad"]').first().click();await h.idle(800);
 if(await pg.locator('main [data-act="taskTab"][data-id="stad"]').count())await pg.locator('main [data-act="taskTab"][data-id="stad"]').first().click();
 await h.idle(900);
 const g=pg.locator('main .stad-rob-g');await g.waitFor({timeout:5000});
 assert.match(await g.innerText(),/Dammsugaren/,'Genvägen syns i Städ');
 await h.shot('stad-genvag');
 // i dockan: status och antal rum som står på tur
 await pg.evaluate(()=>window.__d("(haRobot().st='charging',haRobot().rum.forEach(r=>{if(r.n==='Hall'||r.n==='Kök')r.sm=Date.now()/1e3}),render(),1)"));await h.idle(600);
 console.log('vilar:',(await g.innerText()).replace(/\n/g,' | '));
 await h.shot('stad-genvag-vilar');
 await pg.evaluate(()=>window.__d("(haRobot().st='segment_cleaning',render(),1)"));
 await h.idle(600);await h.shot('stad-genvag-stadar');
 await g.click();await h.idle(1500);
 assert.match(await pg.locator('main .rcp-top .back').innerText(),/Att göra/,'Tillbaka leder till Att göra');
 await h.shot('stad-robotsida');
 await pg.locator('main .rcp-top .back').click();await h.idle(1200);
 await pg.locator('main .stad-rob-g').waitFor({timeout:5000});
 if(!wall){await pg.evaluate(()=>scrollTo(0,0));await h.idle(600);await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(800);await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1000);
  await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1200);
  assert.match(await pg.locator('main .rcp-top .back').innerText(),/Hemmet/,'Från Hemmet leder tillbaka dit');}
};
