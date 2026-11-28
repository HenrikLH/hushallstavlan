// Navigering på telefonen (Inställningar → Utseende → Navigering, ls ht.navx): '' menyrad, hem (rutor), kort (kort och knappar), o (levande knapp).
// Kör: T3DEMO=1 NOW=2026-11-28T12:10:00+01:00 LS='{"ovny":"h","haDemo":"1","navx":"kort"}' node verktyg/emu/run.js verktyg/emu/navigering.js
// Väggen (LS wall=1, VP=1368x912) ska inte få #navx.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const r=s=>pg.evaluate(s=>window.__d(s),s),k=async s=>{await pg.locator(s).first().click();await h.idle(800)};
 const wall=await r('S.wall'),x=await r(`localStorage.getItem('ht.navx')||''`),hem=async()=>{if(await r('S.view')!=='oversikt'){await k(x==='o'?'#navx .nx-otop':'#navx .nx-dhem');if(x==='o')await k('#navx .nx-og [data-id="oversikt"]')}assert.equal(await r('S.view'),'oversikt')};
 if(wall||!x){assert(!await r(`!!document.querySelector('#navx')`),'ingen ny navigering');assert(await r(`getComputedStyle(document.getElementById('nav')).display!=='none'`),'menyraden syns');console.log('navigering: menyraden ok');return}
 assert(await r(`getComputedStyle(document.getElementById('nav')).display==='none'`),'menyraden dold');
 await hem();
 if(x==='hem'){assert(await r(`!!document.querySelector('.nx-tiles')`),'genvägar');await h.shot('hem-oversikt');
  for(const v of ['mat','hemmet','kalender','uppgifter']){await k('.nx-tiles [data-id="'+v+'"]');assert.equal(await r('S.view'),v);assert(await r(`!!document.querySelector('header.head .nx-back')`),'tillbaka i '+v);await k(v==='kalender'?'header.head .nx-back':'#navx .nx-dhem');assert.equal(await r('S.view'),'oversikt')}}
 if(x==='kort'){assert(await r(`document.querySelectorAll('.nx-chips button').length===6`),'sex knappar');const skog=await r(`!!document.querySelector('.ot-gora')`);if(skog)assert(await r(`!!document.querySelector('.nx-matk')`),'Mat-kortet');await h.shot('kort-oversikt');await h.shot('kort-hela',true);
  await k('.nx-chips [data-id="mat:inkop"]');assert.equal(await r('S.view+S.matTab'),'matinkop');await k('#navx .nx-dhem');
  if(skog){await k('.nx-matk .nx-mr');assert.equal(await r('S.view'),'mat');await k('header.head .nx-back')}
  if(await r(`!!document.querySelector('.ot-gora .nx-ft')`)){await k('.ot-gora .nx-ft');assert(['uppgifter','stad'].includes(await r('S.view')),'Att göra öppnas');await h.shot('kort-attgora');await k('#navx .nx-dhem')}
  await k('.nx-chips [data-id="stad"]');assert.equal(await r('S.view'),'stad');await k('#navx .nx-dhem')}
 if(x==='o'){assert(await r(`!!document.querySelector('#navx .nx-otop')`),'levande knapp');await h.shot('o-oversikt');
  await k('#navx .nx-otop');assert(await r(`document.querySelectorAll('#navx .nx-og button').length===7`),'alla delar');await h.shot('o-ut');
  await k('#navx .nx-og [data-id="mat"]');assert.equal(await r('S.view'),'mat');assert(!await r(`!!document.querySelector('#navx .nx-og')`),'stängd efter val');await h.shot('o-mat');
  await k('#navx .nx-otop');await k('#navx .nx-dim');assert(!await r(`!!document.querySelector('#navx .nx-og')`),'stängs med tryck utanför');
  await k('#navx .nx-otop');await k('#navx .nx-og [data-id="uppgifter"]');assert.equal(await r('S.view'),'uppgifter')}
 // undermenyn ligger kvar vid scroll (alla lägen utan menyrad)
 await r(`ACT.nav('mat')`);await h.idle(900);await r(`ACT.matTab('vecka')`);await h.idle(700);for(let i=0;i<4;i++)await pg.mouse.wheel(0,220),await pg.waitForTimeout(150);await h.idle(700);
 assert(await r(`(()=>{const g=document.querySelector('#main>.segc').getBoundingClientRect();return g.top>=0&&g.top<80})()`),'undermenyn ligger kvar överst');
 console.log('navigering '+x+' ok');
};
