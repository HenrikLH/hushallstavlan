// Dammsugaren: en färdig körning visas under Historik, inte på huvudsidan. Demo: LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/robot-historik.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.st="charging";a.plan={steg:[{typ:"damm",rum:[a.rum[0].id]},{typ:"damm",rum:[a.rum[1].id]}],i:2,klara:[[a.rum[0].id],[a.rum[1].id]],nu:null,klar:Date.now()/1e3-420};render()})()'));await h.idle(500);
 assert.equal(await pg.locator('main .ha-fl').count(),0,'Färdig körning syns inte på huvudsidan');
 const hb=pg.locator('main [data-act="haAppSida"][data-id="hist"]');assert.match(await hb.innerText(),/Historik\s*Klar \d\d:\d\d/,'Historik-raden visar senaste körningen');
 await pg.evaluate(()=>scrollTo(0,document.body.scrollHeight));await h.idle(300);await h.shot('robot-historik-rad');
 await hb.click();await h.idle(600);
 assert.ok(await pg.locator('main .ha-fl .ha-fslut.klar').count(),'Tidslinjen finns under Historik');
 assert.match(await pg.locator('main').innerText(),/Rummen[\s\S]*Dammsugat/,'Rummen med senaste städning');
 await h.shot('robot-historik');
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
