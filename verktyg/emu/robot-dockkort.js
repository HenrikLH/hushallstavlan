// Dammsugaren: kartan och dockan som svepbara kort, dockans kommandon, färdig städning hopfälld. Demo: LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/robot-dockkort.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.evaluate(()=>window.__d('(()=>{const a=haAppX();a.st="charging";a.plan={steg:[{typ:"damm",rum:[a.rum[0].id]},{typ:"damm",rum:[a.rum[1].id]},{typ:"mopp",rum:[a.rum[0].id]}],i:3,klara:[[a.rum[0].id],[a.rum[1].id],[a.rum[0].id]],nu:null,klar:Date.now()/1e3-420};render()})()'));await h.idle(600);
 assert.equal(await pg.locator('main .ha-kortk').count(),2,'Två svepbara kort');
 assert.equal(await pg.locator('main .ha-dock').count(),0,'Gamla dockkortet borta');
 assert.equal(await pg.locator('main .ha-kortd i.on').count(),1,'En sidprick markerad');
 await h.shot('robot-kort-karta');
 // svep till dockan
 await pg.locator('main .ha-kortr').evaluate(e=>e.scrollTo({left:e.clientWidth+12}));await h.idle(800);
 assert.equal(await pg.locator('main .ha-kortd i').nth(1).getAttribute('class'),'on','Andra pricken markerad efter svep');
 assert.match(await pg.locator('main .ha-dkk').innerText(),/Rent vatten\s*≈ 42 %[\s\S]*Smutsvatten\s*≈ 58 %/,'Uppskattade vattennivåer');
 assert.equal(await pg.locator('main .dkk-b').count(),3,'Töm, Tvätta, Torka');
 await pg.evaluate(()=>window.__d('render()'));await h.idle(400);
 assert.equal(await pg.locator('main .ha-kortr').evaluate(e=>Math.round(e.scrollLeft/(e.clientWidth+12))),1,'Kortet ligger kvar efter omritning');
 await pg.evaluate(()=>scrollTo(0,0));await h.idle(300);await h.shot('robot-kort-docka');
 // färdig städning: hopfälld, fälls ut
 const fk=pg.locator('main .ha-fk');assert.equal(await fk.count(),1,'Färdig städning som hopfälld rad');
 assert.match(await fk.locator('.ha-fkh').innerText(),/Städningen är klar/,'Rubrik');
 assert.equal(await fk.locator('.ha-fkb').evaluate(e=>e.getBoundingClientRect().height),0,'Tidslinjen dold');
 await fk.locator('.ha-fkh').click();await h.idle(60);
 const mitt=await pg.locator('main .ha-fk .ha-fkb').evaluate(e=>e.getBoundingClientRect().height);await h.idle(900);
 assert.ok(mitt<200,'Rutan fälls ut gradvis ('+mitt+' px efter 60 ms)');
 assert.ok(await pg.locator('main .ha-fk .ha-fkb').evaluate(e=>e.getBoundingClientRect().height)>200,'Tidslinjen utfälld');
 await pg.locator('main .ha-fk').scrollIntoViewIfNeeded();await pg.evaluate(()=>scrollBy(0,120));await h.idle(300);await h.shot('robot-kort-tidslinje');
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
