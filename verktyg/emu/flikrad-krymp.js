// Menyraden krymper till en rund knapp när man scrollar nedåt och växer ut igen uppåt (telefon, UI 5.0 och UI 2.0 Svävande); på väggen ligger den kvar.
// Kör: node verktyg/emu/run.js verktyg/emu/flikrad-krymp.js  |  LS='{"ui":"2","flikrad":"glas"}' …  |  LS='{"wall":"1","me":""}' VP=1368x912 …
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);const wall=await read('S.wall');
 await pg.locator('#nav [data-id="mat"]').first().click();await h.idle(800);
 for(const y of [100,200,300,420,560])await pg.mouse.wheel(0,y-await read('scrollY')),await pg.waitForTimeout(120);
 await pg.waitForTimeout(600);const mini=await read(`document.getElementById('nav').classList.contains('mini')`);
 console.log('nedåt: mini',mini);await h.shot('krymp-ned');
 if(wall){assert.equal(mini,false,'väggen: menyn ligger kvar');return}
 assert.equal(mini,true,'menyn krymper vid scroll nedåt');
 assert(await read(`document.querySelector('.nav-mini').classList.contains('on')`),'runda knappen syns');
 await pg.mouse.wheel(0,-150);await pg.waitForTimeout(150);await pg.mouse.wheel(0,-150);await pg.waitForTimeout(700);
 const ut=await read(`document.getElementById('nav').classList.contains('mini')`);console.log('uppåt: mini',ut);assert.equal(ut,false,'växer ut vid scroll uppåt');
 await h.shot('krymp-upp');
};
