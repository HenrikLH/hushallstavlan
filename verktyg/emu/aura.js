// Aura (ht.ui=6): bilder av de viktigaste vyerna. Kör: LS='{"ui":"6"}' node verktyg/emu/run.js verktyg/emu/aura.js
module.exports=async(pg,h)=>{const k=async(s,n)=>{await pg.locator(s).first().click();await h.idle(800);if(n)await h.shot(n)};
 await h.idle(1200);if(await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').count())await k('#nav [data-act="nav"][data-id="oversikt"]');await h.shot('aura-oversikt');
 if(!await pg.evaluate(()=>document.body.classList.contains('wall'))){
  await pg.evaluate(()=>scrollTo(0,700));await h.idle(400);await h.shot('aura-oversikt-2');await pg.evaluate(()=>scrollTo(0,0));
  await k('#nav [data-act="nav"][data-id="mat"]','aura-mat');
  await k('[data-act="matTab"][data-id="inkop"]','aura-inkop');
  await k('#nav [data-act="nav"][data-id="uppgifter"]','aura-attgora');
  await k('#nav [data-act="nav"][data-id="ekonomi"]','aura-ekonomi');
  await k('#nav [data-act="nav"][data-id="oversikt"]');await k('[data-act="settings"]','aura-installningar');}
 console.log('PASS aura '+await pg.evaluate(()=>document.documentElement.className));
};
