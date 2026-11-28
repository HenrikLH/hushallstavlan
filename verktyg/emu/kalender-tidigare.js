// Kalender → Vecka (telefon): passerade dagar i veckan fälls ihop bakom en rad ovanför idag.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.click('#nav [data-act="nav"][data-id="kalender"]');await h.idle(700);
 await pg.click('[data-act="calVy"][data-id="vecka"]');await h.idle(700);
 const t=await pg.evaluate(()=>window.__d('today()'));
 const rad=await pg.$('.cv-tidig');assert.ok(rad,'raden Tidigare i veckan saknas');
 const forsta=await pg.$eval('.cv-th',e=>e.textContent);assert.ok(/Idag/.test(forsta),'första dagen ska vara idag: '+forsta);
 console.log('Rad:',await rad.textContent());await h.shot('kalender-tidigare-ihop');
 await rad.click();await h.idle(500);
 const n=await pg.$$eval('.cv-tr.past',a=>a.length);assert.ok(n>0,'tidigare dagar visas inte efter tryck');
 await h.shot('kalender-tidigare-utfalld');
 await pg.click('.cv-tidig');await h.idle(400);assert.equal(await pg.$$eval('.cv-tr.past',a=>a.length),0);
 console.log('PASS KALENDER TIDIGARE',t,n,'dagar');
};
