// Timerringen runt stegsiffran i tidsplanen (M21/M27): bågen krymper med tiden, paus och klart syns i ringen. TRING=A/B/C väljer förslag
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 const V=process.env.TRING||'A';await d(`lsSet('tring','${V}')`);
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');
 await c('.cook .tp-r:nth-child(2) .tp-t');
 ok(await pg.locator('.cook .tp-r:nth-child(2) .no .trg').count()===1,'ring runt steg 2');
 const o0=await pg.locator('.cook .tp-r:nth-child(2) .trg-f').getAttribute('stroke-dashoffset');await h.idle(2200);
 const o1=await pg.locator('.cook .tp-r:nth-child(2) .trg-f').getAttribute('stroke-dashoffset');ok(Number(o1)>Number(o0),'bågen krymper '+o0+' → '+o1);
 await d(`const r=S.cook.id,n=Date.now(),a=S.timers.find(t=>t.si===1);a.end=n+455000;a.dur=720000;S.timers.push({k:'b',label:'Steg 3',end:n+200000,p:200000,ring:false,rid:r,si:2,dur:720000},{k:'e',label:'Steg 1',end:n-1000,ring:true,rid:r,si:0,dur:300000});render()`);await h.idle(1200);
 ok(await pg.locator('.cook .trg.pau').count()>=1&&await pg.locator('.cook .trg.klar').count()>=1,'paus och klart i ringen');
 await pg.evaluate(()=>document.querySelector('.cook .tp').scrollIntoView({block:'start'}));await h.idle(400);await h.shot('ring-'+V)};
