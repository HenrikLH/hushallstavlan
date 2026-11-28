// Översikt-knappen längst ner (navx=hem) får inte täcka knappar. Kör: LS='{"haDemo":"1","ovny":"h","navx":"hem"}' node verktyg/emu/run.js verktyg/emu/navx-overlapp.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const r=s=>pg.evaluate(s=>window.__d(s),s),k=async s=>{await pg.locator(s).first().click();await h.idle(900)};
 const krock=()=>pg.evaluate(()=>{const p=document.querySelector('#navx .nx-dhem');if(!p||getComputedStyle(p).display==='none'||getComputedStyle(p).opacity==='0')return[];const a=p.getBoundingClientRect(),ut=[];
  for(const e of document.querySelectorAll('main button,main [data-act]')){if(p.contains(e)||!e.offsetParent)continue;const b=e.getBoundingClientRect();if(b.width<2||b.bottom<=a.top||b.top>=a.bottom||b.right<=a.left||b.left>=a.right)continue;
   let n=e,fast=false;while(n&&n!==document.body){const s=getComputedStyle(n);if(s.position==='fixed'||s.position==='sticky'){fast=true;break}n=n.parentElement}if(fast)ut.push((e.className||e.tagName)+' '+(e.textContent||'').trim().slice(0,20))}return ut});
 if(process.env.SAB)await pg.addStyleTag({content:':root{--sab:'+process.env.SAB+'px!important}'});
 const rulla=async()=>{for(let i=0;i<6;i++)await pg.mouse.wheel(0,300),await pg.waitForTimeout(120);await h.idle(900)};
 if(await r('S.view')!=='oversikt')await k('#navx .nx-dhem');
 await k('.nx-tiles [data-id="hemmet"]');await k('main .ha-ap[data-id="vacuum.dammsugare"]');
 await pg.evaluate(()=>window.__d('(()=>{const x=haAppX();x.st="cleaning";render()})()'));await h.idle(600);
 await pg.evaluate(()=>scrollTo(0,0));await h.idle(500);for(let i=0;i<3;i++)await pg.mouse.wheel(0,200),await pg.waitForTimeout(150);await h.idle(900);await h.shot('navx-robot');if(await r(`localStorage.getItem('ht.navxbar')`)!=='b'){assert(await r(`!!document.querySelector('.rob-vy .ha-bar .nx-irad')`),'Översikt i knappraden');await k('.rob-vy .ha-bar .nx-irad');assert.equal(await r('S.view'),'oversikt');await k('.nx-tiles [data-id="hemmet"]');await k('main .ha-ap[data-id="vacuum.dammsugare"]')}console.log('mini',await r(`document.getElementById('nav').className+' | '+document.documentElement.className+' | '+getComputedStyle(document.querySelector('.rob-vy .ha-bar')).transform`));const k1=await krock();assert.deepEqual(k1,[],'dammsugarvyn: '+k1.join(', '));
 const hem=async()=>{await pg.mouse.wheel(0,-150);await pg.waitForTimeout(200);await pg.mouse.wheel(0,-150);await h.idle(700);await k(await r(`!!document.querySelector('.rob-vy .nx-irad')`)?'.rob-vy .nx-irad':'#navx .nx-dhem')};
 for(const v of ['mat','kalender','uppgifter']){await hem();await k('.nx-tiles [data-id="'+v+'"]');await rulla();const kk=await krock();assert.deepEqual(kk,[],v+': '+kk.join(', '))}
 console.log('navx-overlapp ok');
};
