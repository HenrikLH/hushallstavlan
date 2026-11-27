// Navigering på telefonen (förslag D, Översikt är hemmet, ht-v420). Kör: LS='{"ovny":"h"}' node verktyg/emu/run.js verktyg/emu/navigering.js
// LS='{"navx":"gammal"}' ger gamla menyraden; väggen (LS wall=1, VP=1368x912) ska inte få #navx.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const r=s=>pg.evaluate(s=>window.__d(s),s),k=async s=>{await pg.locator(s).first().click();await h.idle(800)};
 const wall=await r('S.wall'),gammal=await r(`localStorage.getItem('ht.navx')==='gammal'`);
 if(wall||gammal){assert(!await r(`!!document.querySelector('#navx')`),'ingen ny navigering');assert(await r(`getComputedStyle(document.getElementById('nav')).display!=='none'`),'menyraden syns');console.log('navigering: gamla raden ok');return}
 assert(await r(`getComputedStyle(document.getElementById('nav')).display==='none'`),'menyraden dold');
 if(await r('S.view')!=='oversikt')await k('#navx .nx-dhem');
 assert.equal(await r('S.view'),'oversikt');assert(await r(`!!document.querySelector('.nx-tiles')`),'genvägar');assert(!await r(`!!document.querySelector('#navx .nx-dhem')`),'ingen Översikt-knapp på Översikt');await h.shot('d-oversikt');
 for(const v of ['mat','hemmet','kalender','uppgifter']){await k('.nx-tiles [data-id="'+v+'"]');assert.equal(await r('S.view'),v);assert(await r(`!!document.querySelector('header.head .nx-back')`),'tillbaka i '+v);if(v==='mat')await h.shot('d-mat');await k(v==='kalender'?'header.head .nx-back':'#navx .nx-dhem');assert.equal(await r('S.view'),'oversikt')}
 await k('.nx-tiles [data-id="mat"]');for(let i=0;i<4;i++)await pg.mouse.wheel(0,220),await pg.waitForTimeout(150);await h.idle(700);
 assert(await r(`(()=>{const g=document.querySelector('#main>.segc').getBoundingClientRect();return g.top>=0&&g.top<80})()`),'undermenyn ligger kvar överst');await h.shot('d-scroll');
 await k('#main>.segc [data-id="inkop"]');assert.equal(await r('S.matTab'),'inkop');
 console.log('navigering D ok');
};
