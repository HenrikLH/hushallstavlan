// Dammsugaren: rumsstatus (när varje rum senast dammsögs/moppades mot valt intervall) och uppskattat vatten i tanken.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/robot-status.js   (vägg: LS='{"haDemo":"1","wall":"1","me":""}' VP=1368x912)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.st="charging";a.plan=null;render()})()'));await h.idle(500);
 const st=pg.locator('main .ha-rst');await st.waitFor({timeout:5000});
 assert.match(await st.innerText(),/att dammsuga/,'Sammanfattning av rum som är dags');
 assert.ok(await st.locator('.ha-rst-r b.dags').count()>0,'Rum som är försenade markeras');
 assert.match(await pg.locator('main .ha-tank').innerText(),/Rent vatten ≈ 42 %[\s\S]*moppning/,'Tanken visas');
 await st.scrollIntoViewIfNeeded();await pg.evaluate(()=>scrollBy(0,140));await h.idle(300);await h.shot('robot-status');
 await pg.evaluate(()=>scrollTo(0,document.body.scrollHeight));await h.idle(300);await h.shot('robot-tank');
 await pg.locator('main [data-act="haRobDags"]').click();await h.idle(500);
 assert.match(await pg.locator('main .ha-valt').innerText(),/rum valda/,'Välj dem markerar rummen i kartan');
 assert.ok(await pg.locator('main .ha-fl.fh').count(),'Tidslinjen för de valda rummen visas');
 await pg.locator('main [data-act="haRobRum"][data-id=""]').click();await h.idle(400);
 assert.equal(await pg.locator('main [data-act="haTankFylld"]').count(),0,'Ingen Påfylld-knapp när dockan själv vet om tanken är tom');
 await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.tank.brist=null;render()})()'));await h.idle(300);
 await pg.locator('main [data-act="haTankFylld"]').click();await h.idle(400);
 assert.match(await pg.locator('main .ha-tank').innerText(),/100 %/,'Påfylld nollställer tanken');
 await pg.locator('main [data-act="haAppSida"][data-id="inst"]').last().click();await h.idle(500);
 await pg.locator('main [data-act="haAppDel"][data-id="rum"]').click();await h.idle(400);
 const id=await pg.locator('main [data-act="haRumNamn"]').first().getAttribute('data-id');
 await pg.locator('main [data-act="haRumNamn"][data-id="'+id+'"]').click();await h.idle(400);
 const iv=pg.locator('main .ha-iv').first(),fore=await iv.locator('b').innerText();
 await iv.locator('[data-act="haRumIv"]').last().click();await h.idle(300);
 assert.equal(parseInt(await iv.locator('b').innerText()),parseInt(fore)+1,'Intervallet ökar med +');
 await iv.scrollIntoViewIfNeeded();await h.shot('robot-intervall');
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
