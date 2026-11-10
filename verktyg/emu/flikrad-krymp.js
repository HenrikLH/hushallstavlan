// Menyraden krymper till en rund knapp när man scrollar nedåt och växer ut igen uppåt (telefon, UI 5.0 och UI 2.0 Svävande); på väggen ligger den kvar.
// UI 5.0 med LS='{"krymp5":"piller"}' krymper till piller, '{"krymp5":"av"}' ligger kvar.
// Kör: node verktyg/emu/run.js verktyg/emu/flikrad-krymp.js  |  LS='{"ui":"2","flikrad":"glas"}' …  |  LS='{"wall":"1","me":""}' VP=1368x912 …
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);const wall=await read('S.wall');
 await pg.locator('#nav [data-id="mat"]').first().click();await h.idle(800);
 for(const y of [100,200,300,420,560])await pg.mouse.wheel(0,y-await read('scrollY')),await pg.waitForTimeout(120);
 await pg.waitForTimeout(600);const mini=await read(`document.getElementById('nav').classList.contains('mini')`);
 console.log('nedåt: mini',mini);await h.shot('krymp-ned');
 const k5=await read(`localStorage.getItem('ht.krymp5')`),u5=await read('U5');
 if(wall||u5&&k5==='av'){assert.equal(mini,false,'menyn ligger kvar');return}
 if(u5&&k5==='piller')assert(await read(`document.documentElement.classList.contains('nav-piller')`),'piller valt');
 assert.equal(mini,true,'menyn krymper vid scroll nedåt');
 if(!(u5&&k5==='piller'))assert(await read(`document.querySelector('.nav-mini').classList.contains('on')`),'runda knappen syns');
 await pg.mouse.wheel(0,-150);await pg.waitForTimeout(150);await pg.mouse.wheel(0,-150);await pg.waitForTimeout(700);
 const ut=await read(`document.getElementById('nav').classList.contains('mini')`);console.log('uppåt: mini',ut);assert.equal(ut,false,'växer ut vid scroll uppåt');
 await h.shot('krymp-upp');
};
