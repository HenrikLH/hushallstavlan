// Väggen går tillbaka till Översikt efter ht.vaggTill minuter utan beröring (förval 2, 0 = aldrig). Låtsas att senaste tryck var länge sedan.
// LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/vagg-tillbaka.js
module.exports=async(pg,h)=>{await h.idle(1800);
 for(const v of['kalender','hemmet','fod']){await pg.locator('#nav [data-act="nav"][data-id="'+v+'"]').first().click();await h.idle(800);
  await pg.evaluate(()=>window.__d('(A.touch=1,1)'));await h.idle(21000);const n=await pg.evaluate(()=>window.__d('S.view'));console.log(v,'->',n);if(n!=='oversikt')throw new Error(v+' gick inte tillbaka')}
 await pg.evaluate(()=>{localStorage.setItem('ht.vaggTill','0')});await pg.locator('#nav [data-act="nav"][data-id="kalender"]').first().click();await h.idle(800);
 await pg.evaluate(()=>window.__d('(A.touch=1,1)'));await h.idle(21000);if(await pg.evaluate(()=>window.__d('S.view'))!=='kalender')throw new Error('Aldrig gick ändå tillbaka');
 await h.pref('[data-act="vaggTill"]');await h.shot('vagg-tillbaka-val')
};
