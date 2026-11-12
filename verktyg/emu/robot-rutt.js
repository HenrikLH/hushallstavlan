// Dammsugaren: "Välj dem" väljer rummen i en effektiv ordning från dockan och tömmer bara efter stora omgångar.
// Mot väggdatorns tjänst (falsk HA med samma rumsstorlekar som hemma): PORT=8099 HA=1 LS='{"haUrl":"http://127.0.0.1:8777"}' node verktyg/emu/run.js verktyg/emu/robot-rutt.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1500);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.locator('main [data-act="haRobDags"]').click();await h.idle(700);
 const dp=await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().dockPx)'));assert.ok(dp&&dp!=='undefined','Dockans plats finns');
 const st=await pg.locator('main .ha-fl.fh .ha-fs').evaluateAll(E=>E.map(e=>e.classList.contains('ha-fslut')?'slut':e.classList.contains('ha-fd')?'töm':e.classList.contains('mopp')?'mopp':'damm'));
 console.log('steg',st.join(' '));
 assert.equal(st.filter(x=>x==='töm').length,st.filter(x=>x==='damm').length,'En tömning efter varje dammsugningsomgång, inga extra');
 await pg.locator('main .ha-fl.fh').scrollIntoViewIfNeeded();await pg.evaluate(()=>scrollBy(0,-120));await h.idle(300);await h.shot('robot-rutt');
};
