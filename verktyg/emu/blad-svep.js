// Öppna blad: sidan bakom scrollar inte, och svep nedåt i bladet stänger det om svepet är snabbt eller långt (annars tillbaka).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);const cdp=await pg.context().newCDPSession(pg);
 const T=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[p]:[]});
 const drag=async(pts,{slapp=true,vila=0}={})=>{await T('touchStart',{x:pts[0][0],y:pts[0][1]});for(const[x,y,ms]of pts.slice(1)){await T('touchMove',{x,y});await pg.waitForTimeout(ms??16)}
  if(vila)await pg.waitForTimeout(vila);if(slapp){await T('touchEnd');await h.idle(900)}};
 const linje=(y0,y1,x,n,ms=16)=>Array.from({length:n+1},(_,i)=>[x+i*.2,y0+(y1-y0)*i/n,ms]);
 const oppna=async()=>{await pg.locator('[data-act="settings"]').first().click();await h.idle(700);assert.equal(await read('S.sheet'),'settings','inställningarna ska vara öppna')};
 const head=async()=>{const b=await pg.locator('#overlay .sheet-head').boundingBox();return[b.x+b.width/2,b.y+b.height/2+6]};
 const body=()=>pg.evaluate(()=>document.querySelector('#overlay .sheet-body').scrollTop);
 await pg.click('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(600);await oppna();const y0=await pg.evaluate(()=>scrollY);
 // Chromium scrollar inte sidan bakom ett fast lager som Safari gör: kontrollera att svepet stoppas (defaultPrevented) och att html är låst
 await pg.evaluate(()=>{window.__stopp=[];addEventListener('touchmove',e=>__stopp.push(e.defaultPrevented),{passive:false})});
 const stopp=()=>pg.evaluate(()=>{const r=__stopp;__stopp=[];return r.length>0&&r.every(Boolean)});
 assert.equal(await pg.evaluate(()=>getComputedStyle(document.documentElement).overflowY),'hidden','sidan bakom ska vara låst');
 // en kortare panel med lång lista, så att både hinnan och listan går att svepa på
 await pg.evaluate(()=>{const p=document.querySelector('#overlay .sheet-panel');p.style.maxHeight=p.style.height='70dvh';p.parentElement.style.alignItems='flex-end';p.parentElement.style.paddingTop='0';p.querySelector('.sheet-body').insertAdjacentHTML('beforeend','<div style="height:1400px"></div>')});await h.idle(200);
 const[x,hy]=await head(),pt=(await pg.locator('#overlay .sheet-panel').boundingBox()).y;
 // 1. hinnan och huvudet: stoppas alltid
 await drag(linje(pt-40,pt-180,x,6));assert(await stopp(),'svep på hinnan ska stoppas');
 await drag(linje(hy,hy-120,x,8));assert(await stopp(),'svep uppåt i huvudet ska stoppas');assert.equal(await read('S.sheet'),'settings');
 // 2. listan scrollar som vanligt, och nedåt i en scrollad lista stänger inte
 await drag(linje(hy+400,hy+100,x,10));assert.equal(await stopp(),false,'listan ska få scrolla');assert(await body()>20,'listan i bladet ska scrollas');
 await drag(linje(hy+80,hy+200,x,8));assert.equal(await read('S.sheet'),'settings','scrollad lista ska scrolla, inte stänga');
 assert.equal(await pg.evaluate(()=>scrollY),y0,'sidan bakom ska stå still');
 // 3. gummiband uppåt, och kort lugnt svep nedåt fjädrar tillbaka
 await drag(linje(hy,hy-150,x,8),{slapp:false});const ty=await pg.evaluate(()=>new DOMMatrix(getComputedStyle(document.querySelector('#overlay .sheet-panel')).transform).m42);
 assert(ty<0&&ty>-60,'uppåt ska ge gummiband, fick '+ty);await T('touchEnd');await h.idle(900);
 await pg.evaluate(()=>document.querySelector('#overlay .sheet-body').scrollTop=0);
 await drag(linje(hy+100,hy+180,x,10,30),{slapp:false});await h.shot('blad-svep-mitt');await pg.waitForTimeout(150);await T('touchEnd');await h.idle(900);
 assert.equal(await read('S.sheet'),'settings','kort lugnt svep ska inte stänga');
 assert.equal(await pg.evaluate(()=>document.querySelector('#overlay .sheet-panel').style.transform),'','bladet ska vara tillbaka');
 // 4. kort snabbt svep (CDP ger ≈65 ms mellan händelserna, så stora steg = fart): stänger
 await drag(linje(hy,hy+110,x,2,0));assert.equal(await read('S.sheet'),null,'snabbt svep ska stänga');
 assert.equal(await pg.evaluate(()=>getComputedStyle(document.documentElement).overflowY),'visible','sidan ska kunna scrollas igen');
 // 5. långt lugnt svep i listan (överst): stänger
 await oppna();const[,hz]=await head();await drag(linje(hz+120,hz+460,x,16,30),{vila:120});assert.equal(await read('S.sheet'),null,'långt svep ska stänga');
 console.log('PASS BLAD SVEP')};
