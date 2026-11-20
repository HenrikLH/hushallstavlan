// Navigeringsprovet i telefonen (Utvecklarläge → Navigering i telefonen, ht.navx a–d). Kör: LS='{"dev":"1","navx":"b","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/navigering.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const r=s=>pg.evaluate(s=>window.__d(s),s),x=await r(`localStorage.getItem('ht.navx')`),k=async s=>{await pg.locator(s).first().click();await h.idle(800)};
 assert(await r(`!!document.querySelector('#navx')`),'#navx finns');assert(await r(`getComputedStyle(document.getElementById('nav')).display==='none'`),'gamla menyn dold');
 if(x==='a'){await k('#navx .nx-tabs [data-id="mat"]');await h.shot('a-mat');await k('#navx .nx-sub [data-id="mat:inkop"]');assert.equal(await r('S.matTab'),'inkop');await k('#navx .nx-tabs [data-id="uppgifter"]');await k('#navx .nx-sub [data-id="uppgifter:stad"]');assert.equal(await r('S.view'),'stad');await h.shot('a-stad')}
 if(x==='b'){await k('#navx .nx-b [data-id="kalender"]');await k('#navx .nx-b [data-id="mat"]');await k('#navx .nx-b [data-id="mat"]');assert(await r(`!!document.querySelector('#navx .nx-pop')`),'undersidor');await h.shot('b-meny');await k('#navx .nx-pop [data-id="mat:inkop"]');assert.equal(await r('S.matTab'),'inkop');
  await k('#navx .nx-b [data-id="kalender"]');assert.equal(await r('S.view'),'kalender');await k('#navx .nx-b [data-id="mat"]');await k('#navx .nx-b [data-id="mat"]');await k('#navx .nx-pop [data-id="mat:vecka"]');
  for(const y of [150,300,500,700])await pg.mouse.wheel(0,200),await pg.waitForTimeout(150);await h.idle(600);assert(await r(`document.getElementById('navx').classList.contains('mini')`),'krymper');await h.shot('b-mini');
  await k('#navx .nx-bmini');assert(!await r(`document.getElementById('navx').classList.contains('mini')`),'växer ut')}
 if(x==='c'){await k('#navx .nx-cti');assert(await r(`!!document.querySelector('#navx .nx-c.ut')`),'lådan öppen');await h.shot('c-ut');await k('#navx .nx-grid [data-id="mat:inkop"]');assert.equal(await r('S.view+S.matTab'),'matinkop');await h.shot('c-stangd');
  await k('#navx .nx-cti');await k('#navx .nx-grid [data-id="vader"]');assert.equal(await r('S.view'),'vader');await k('#navx .nx-cti');await k('#navx .nx-grid [data-id="settings"]');assert.equal(await r('S.sheet'),'settings')}
 if(x==='d'){await r(`ACT.nav('oversikt')`);await h.idle(900);assert(await r(`!!document.querySelector('.nx-tiles')`),'genvägar');await h.shot('d-oversikt');await k('.nx-tiles [data-id="mat"]');assert.equal(await r('S.view'),'mat');assert(await r(`!!document.querySelector('header.head .nx-back')`),'tillbaka');await h.shot('d-mat');await k('#navx .nx-dhem');assert.equal(await r('S.view'),'oversikt')}
 console.log('navigering',x,'ok');
};
