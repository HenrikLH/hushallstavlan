// Smart hem-rutan i Översikt: fyra scener överst och favoriter under (ht-v338). Kör med LS='{"haDemo":"1"}' (vägg: lägg till "wall":"1","me":"" och VP=1368x912).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=/"wall":"1"/.test(process.env.LS||'');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 const box=pg.locator('section.ha');assert.equal(await box.count(),1,'Rutan finns');
 assert.equal(await box.locator('.hab-sc .ha-st').count(),4,'Fyra scenplatser');
 const fv=()=>box.locator('.hab-g > .ha-t');
 const plats=async()=>(await fv().evaluateAll(L=>L.map(e=>e.classList.contains('ha-ap')?2:1))).reduce((a,b)=>a+b,0);
 assert.ok(await plats()<=8,'Högst åtta platser');
 if(vagg){const b=await box.boundingBox(),u=await pg.locator('section[data-box="upg"]').boundingBox(),nav=await pg.locator('#nav').boundingBox();
  console.log('RUTA',Math.round(b.height),'UPG-topp',Math.round(u.y),'NAV',Math.round(nav.y));assert.ok(u.y+60<nav.y,'Uppgifter syns ovanför menyn')}
 else await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));
 await h.idle(400);await h.shot('ruta-1');
 // egen scen: Släck allt, sedan en ny egen scen som tänder köket
 await box.locator('[data-act="habScen"][data-id="3"]').click();await h.idle(600);
 assert.equal(await box.locator('.ha-t.on:not(.ha-ap)').count(),0,'Släck allt');
 await box.locator('.hab-mer').click();await h.idle(400);await h.shot('ruta-meny');
 assert.equal(await box.locator('.hab-menu[open] [data-act="habOpen"]').count(),1,'Menyn har Redigera rutan');
 await box.locator('.hab-menu [data-act="habOpen"]').click();await h.idle(700);
 const F='form[data-form="habRuta"]';assert.equal(await pg.locator(F).count(),1,'Anpassa-bladet');
 // ta bort en favorit, lägg till en annan, flytta med greppet
 const ids=async()=>pg.locator(F+' .hab-lista .hab-r').evaluateAll(L=>L.map(e=>e.dataset.id));
 const fore=await ids();await pg.locator(F+' .hab-minus').first().click();await h.idle(300);
 assert.equal((await ids()).length,fore.length-1,'Borttagen');
 await pg.locator(F+' .hab-plus').first().click();await h.idle(300);
 const g=pg.locator(F+' .hab-lista .hab-grip').nth(0),gb=await g.boundingBox(),f0=await ids(),rh=(await pg.locator(F+' .hab-lista .hab-r').first().boundingBox()).height;
 await pg.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2);await pg.mouse.down();
 for(let i=1;i<=10;i++){await pg.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2+i*rh/10);await h.idle(16)}
 await pg.mouse.up();await h.idle(300);const f1=await ids();
 assert.equal(f1[1],f0[0],'Första raden flyttad ett steg ned');
 await h.shot('ruta-2-anpassa');
 // scen 1: ändra till egen scen med köket på
 await pg.locator(F+' [data-act="habScRed"][data-id="0"]').click();await h.idle(500);
 const SC='form[data-form="habSc"]';assert.equal(await pg.locator(SC).count(),1,'Scenbladet');
 await pg.locator(SC+' [data-act="habScTyp"][data-id="egen"]').click();await h.idle(300);
 assert.equal(await pg.locator(SC+' [data-act="habScNamn"]').count(),0,'Inga namnförslag');
 if(!vagg)await pg.locator(SC+' input[name="habn"]').fill('Middag');
 await pg.locator(SC+' [data-act="habScF"][data-id="#FF375F"]').click();await h.idle(300);
 assert.match(await pg.locator(SC+' .hab-hero').getAttribute('style'),/#FF375F/,'Vald färg i bladet');
 assert.equal(await pg.locator(SC+' .hab-iks:not(.hab-fgr) [style*="#FF375F"]').count(),await pg.locator(SC+' [data-act="habScIk"]').count(),'Symbolerna i vald färg');
 await h.shot('ruta-3-scen');
 await pg.locator(SC+' button[type="submit"]').click();await h.idle(500);
 assert.equal(await pg.locator(F).count(),1,'Tillbaka till Anpassa');
 await pg.locator(F+' [data-act="habKlar"]').click();await h.idle(700);
 assert.deepEqual(await fv().evaluateAll(L=>L.map(e=>e.dataset.id)),f1.slice(0,(await fv().count())),'Rutan följer ordningen');
 if(!vagg)assert.match(await box.locator('.hab-sc .ha-st').first().innerText(),/Middag/,'Scenen heter Middag');
 {const st=await box.locator('.hab-sc .ha-st').first().getAttribute('style');assert.match(st,/#FF375F/i,'Färgen sparad')}
 assert.doesNotMatch(await box.locator('.hab-h').innerText(),/°/,'Ingen temperatur');
 // köret: scenen sparades när allt var släckt; tänd köket, kör scenen = köket släcks igen
 await box.locator('[data-act="habScen"][data-id="0"]').click();await h.idle(400);
 assert.ok(await box.locator('.hab-sc .ha-st').first().evaluate(e=>e.classList.contains('on')),'Scenen är aktiv');
 // håll in en scen öppnar bladet direkt
 await h.hold('section.ha [data-act="habScen"][data-id="1"]');await h.idle(700);
 assert.equal(await pg.locator(SC).count(),1,'Håll in öppnar scenen');
 await pg.locator(SC+' [data-act="habScTill"]').click();await h.idle(500);
 await h.shot('ruta-4-efter');
};
