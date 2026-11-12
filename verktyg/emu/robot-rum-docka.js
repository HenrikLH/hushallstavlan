// Dammsugaren: håll in ett rum (Städ-brickan) → bladet med intervall, och dockans kort. LS={"haDemo":"1"} NOW=2026-10-18T12:00:00
require('./stad-data');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="uppgifter"]').first().click();await h.idle(700);await pg.locator('main [data-act="taskTab"][data-id="stad"]').click();await h.idle(900);
 const t=pg.locator('main .sr-rum').first();const b=await t.boundingBox();await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await pg.waitForTimeout(1400);await pg.mouse.up();await h.idle(1200);
 if(!await pg.locator('#overlay .rr-iv').count())throw new Error('bladet öppnades inte från Städ');await h.shot('stad-rum');
 await pg.locator('#overlay [data-act="sheetClose"]').click();await h.idle(700);
 await pg.evaluate(()=>window.__d("(S.haAppId='vacuum.dammsugare',Object.assign(haRobot(),{st:'charging',dockTork:true,dockTorkH:1.5}),ACT.nav('robot'),1)"));await h.idle(1800);
 await pg.locator('main .ha-kortr').evaluate(e=>e.scrollTo({left:e.clientWidth+12}));await h.idle(600);await h.shot('dock');
 const dt=await pg.locator('main .ha-dkk').innerText();if(!/Torkar moppen · 1,5 h kvar/.test(dt)||!/Rengör silen/.test(dt))throw new Error('Dockans torkning/sil saknas: '+dt)};
