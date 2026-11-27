// Menyraden på telefonen (förslag B, ht-v420). Kör: LS='{"ovny":"h"}' node verktyg/emu/run.js verktyg/emu/navigering.js
// LS='{"navx":"gammal"}' ger gamla raden; väggen (LS wall=1, VP=1368x912) ska inte få #navx.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const r=s=>pg.evaluate(s=>window.__d(s),s),k=async s=>{await pg.locator(s).first().click();await h.idle(800)};
 const wall=await r('S.wall'),gammal=await r(`localStorage.getItem('ht.navx')==='gammal'`);
 if(wall||gammal){assert(!await r(`!!document.querySelector('#navx')`),'ingen ny rad');console.log('navigering: gamla raden ok');return}
 assert(await r(`!!document.querySelector('#navx')`),'#navx finns');assert(await r(`getComputedStyle(document.getElementById('nav')).display==='none'`),'gamla menyn dold');
 await k('#navx .nx-b [data-id="kalender"]');assert.equal(await r('S.view'),'kalender');assert(await r(`!!document.querySelector('#navx .nx-plus')`),'plus i kalendern');
 await k('#navx .nx-b [data-id="mat"]');await k('#navx .nx-b [data-id="mat"]');assert(await r(`!!document.querySelector('#navx .nx-pop')`),'undersidor');await h.shot('b-meny');
 await k('#navx .nx-pop [data-id="mat:vecka"]');assert.equal(await r('S.matTab'),'vecka');
 for(let i=0;i<4;i++)await pg.mouse.wheel(0,220),await pg.waitForTimeout(150);await h.idle(700);
 assert(await r(`document.getElementById('navx').classList.contains('mini')`),'krymper');
 const seg=await r(`(()=>{const g=document.querySelector('#main>.segc').getBoundingClientRect();return g.top>=0&&g.top<80})()`);assert(seg,'undermenyn ligger kvar överst');await h.shot('b-scroll');
 await k('#navx .nx-bmini');assert(!await r(`document.getElementById('navx').classList.contains('mini')`),'växer ut');
 await k('#main>.segc [data-id="inkop"]');assert.equal(await r('S.matTab'),'inkop');
 await k('#navx .nx-b [data-id="uppgifter"]');for(let i=0;i<3;i++)await pg.mouse.wheel(0,200),await pg.waitForTimeout(150);await h.idle(600);await h.shot('b-att-scroll');
 await k('#navx .nx-b [data-id="uppgifter"]');assert(await r(`!!document.querySelector('#navx .nx-plus')`),'plus i Att göra');assert(await r(`getComputedStyle(document.querySelector('#main .head .create-control')).display==='none'`),'ingen dubbel plus');
 await k('#navx .nx-plus');await h.shot('b-plus');
 console.log('navigering B ok');
};
