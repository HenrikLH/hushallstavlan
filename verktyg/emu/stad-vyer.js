// Städvyn i lägena Rutnät och Ring (Inställningar → Att göra → Städvyn). VY=rutnat|ring. Kör med NOW=dagens datum: emulerade servern sätter lastDone med riktigt datum
require('./stad-data');const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const click=async s=>{await pg.locator(s).first().click();await h.idle(500)},read=s=>pg.evaluate(s=>window.__d(s),s);
 await click('#nav [data-act="nav"][data-id="uppgifter"]');await click('[data-act="taskTab"][data-id="stad"]');
 for(const vy of (process.env.VY||'rutnat,ring').split(',')){
  await click('[data-act="settings"]');if(!await pg.locator('[data-k="pref-attgora"]').evaluate(x=>x.open))await click('[data-k="pref-attgora"]>summary');
  await click('[data-act="stadVy"][data-id="'+vy+'"]');await click('[data-act="sheetClose"]',await pg.evaluate(()=>window.__d('ACT.prefBack()')));
  await pg.reload();await h.idle(1300);assert.equal(await read('stadVy()'),vy);
  assert(await pg.locator(vy==='rutnat'?'.sx-grid':'.sx-hero').count());
  const W=await pg.evaluate(()=>innerWidth),Hh=await pg.evaluate(()=>document.documentElement.scrollHeight);await pg.setViewportSize({width:W,height:Math.max(844,Hh)});await h.idle(300);
  await h.shot('stad-vy-'+vy+(process.env.THEME||''));
  // bocka av en syssla och ångra
  const id=await read('stadIdag(cleanPlan()).left[0].id');
  await click((vy==='rutnat'?'.sx-t':'.cell input.check')+'[data-id="'+id+'"]');await h.idle(500);
  assert.equal(await read('doneToday(D().clean.find(x=>x.id==="'+id+'"))'),true);
  await click((vy==='rutnat'?'.sx-t':'.cell input.check')+'[data-id="'+id+'"]');await h.idle(500);
  assert.equal(await read('doneToday(D().clean.find(x=>x.id==="'+id+'"))'),false);
  await click('[data-k="sxBig"]>summary');assert(await pg.locator('[data-k="sxBig"] [data-act="planSat"]').first().isVisible());
  await pg.setViewportSize({width:W,height:844});
 }
 console.log('PASS STÄDVYER');
};
