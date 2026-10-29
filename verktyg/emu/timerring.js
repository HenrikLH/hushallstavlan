// Timerringen vid stegsiffran (M21/M27): bågen krymper med tiden, färdig = grå med bock. Håll in ringen: pillret fjädrar ut med tiden, staplarna skjuts åt höger, ringen igen efter 5 s
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 const no=n=>'.cook .tp-r:nth-child('+n+') .no';
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');
 ok(!await pg.locator('.td,.td-c').count(),'inga timerkort');
 await c('.cook .tp-r:nth-child(2) .tp-t');
 ok(await pg.locator(no(2)+' .trg').count()===1,'ring runt steg 2');
 const off=()=>pg.locator(no(2)+' .trg-f').getAttribute('stroke-dashoffset');const o0=await off();await h.idle(2200);ok(Number(await off())>Number(o0),'bågen krymper');
 await d(`const r=S.cook.id,n=Date.now(),a=S.timers.find(t=>t.si===1);a.end=n+455000;a.dur=720000;S.timers.push({k:'b',label:'Steg 3',end:n+200000,p:200000,ring:false,rid:r,si:2,dur:720000},{k:'e',label:'Steg 1',end:n-1000,ring:true,rid:r,si:0,dur:300000});render()`);await h.idle(1200);
 ok(await pg.locator(no(1)+' .trg.klar').count()===1&&await pg.locator(no(3)+' .trg.pau').count()===1,'klar och paus i ringen');
 const bg=await pg.evaluate(s=>getComputedStyle(document.querySelector(s)).backgroundColor,no(1));ok(!/52, 199, 89|34C759/i.test(bg),'färdig är inte grön: '+bg);
 await pg.evaluate(()=>document.querySelector('.cook .tp').scrollIntoView({block:'start'}));await h.idle(300);
 const st=await d(`S.cook.step`);const bx=await pg.locator(no(2)).boundingBox(),x=bx.x+bx.height/2,y=bx.y+bx.height/2;
 // Släpp för tidigt: dras tillbaka in i cirkeln och byter inte steg
 await pg.mouse.move(x,y);await pg.mouse.down();await pg.waitForTimeout(380);await pg.mouse.up();await h.idle(900);ok(!await pg.locator(no(2)+'[data-open]').count()&&Math.abs(await pg.locator(no(2)).evaluate(e=>e.offsetWidth)-bx.width)<1,'tillbaka till cirkeln');
 // Kort tryck byter steg som förut
 await pg.mouse.click(x,y);await h.idle(500);ok(await d(`S.timers.find(t=>t.si===1).p!=null`)&&await d(`S.cook.step`)===0,'kort tryck på ringen pausar, byter inte steg');
 await pg.mouse.click(x,y);await h.idle(500);ok(await d(`S.timers.find(t=>t.si===1).p==null`),'kort tryck igen fortsätter');
 await c('.cook .tp-r:nth-child(4) .no');ok(await d(`S.timers.some(t=>t.si===3)`),'tryck på stegcirkeln startar timern');await d(`S.timers=S.timers.filter(t=>t.si!==3);render()`);await h.idle(400);await pg.evaluate(()=>document.querySelector('.cook .tp').scrollIntoView({block:'start'}));await h.idle(300);
 const tx0=await pg.evaluate(()=>document.querySelector('.cook .tp-r:nth-child(2) .tp-t').getBoundingClientRect().left);
 await pg.mouse.move(x,y);await pg.mouse.down();await pg.waitForTimeout(330);const ws=await pg.locator(no(2)).evaluate(e=>e.offsetWidth);ok((await d(`trGlow()`)?await pg.locator(no(2)+'.hold').count()===1:ws>bx.width+4)&&!await pg.locator(no(2)+'[data-open]').count(),'pillret töjer sig under håll: '+bx.width+' → '+ws);
 await h.idle(300);ok(await pg.locator(no(2)+'[data-open]').count()===1,'pillret öppnas');await pg.mouse.up();await h.idle(700);
 ok(await d(`S.cook.step`)===0,'hållet byter inte steg');ok(await d(`S.timers.find(t=>t.si===1).p==null`),'hållet pausar inte');
 const w=await pg.locator(no(2)).evaluate(e=>[e.offsetWidth,e.querySelector('.tpl').scrollWidth,e.querySelector('.tpl').clientWidth]);ok(w[0]>60&&w[1]<=w[2]+1,'hela tiden får plats: '+w);
 const txt=await pg.locator(no(2)+' .tpl b').textContent();ok(/^\d+:\d\d$/.test(txt),'tiden i pillret: '+txt);
 const tx1=await pg.evaluate(()=>document.querySelector('.cook .tp-r:nth-child(2) .tp-t').getBoundingClientRect().left);ok(tx1>tx0+30,'staplarna skjuts åt höger '+tx0+' → '+tx1);
 await h.shot('ring-piller');
 // Tryck på pillret pausar
 await pg.mouse.click(x,y);await h.idle(500);ok(await d(`S.timers.find(t=>t.si===1).p!=null`),'tryck på pillret pausar');ok(await pg.locator(no(2)+'[data-open]').count()===1,'pillret står kvar efter omritning');
 await pg.mouse.click(x,y);await h.idle(500);ok(await d(`S.timers.find(t=>t.si===1).p==null`),'tryck igen fortsätter');
 await h.idle(10600);console.log(await d('JSON.stringify(PILL)+(Date.now())'));ok(!await pg.locator(no(2)+'[data-open]').count(),'ring igen efter 10 s');
 const tx2=await pg.evaluate(()=>document.querySelector('.cook .tp-r:nth-child(2) .tp-t').getBoundingClientRect().left);ok(Math.abs(tx2-tx0)<2,'staplarna tillbaka');
 // Håll in ett öppet piller: menyn
 await pg.mouse.move(x,y);await pg.mouse.down();await h.idle(800);await pg.mouse.up();await h.idle(300);await pg.mouse.move(x,y);await pg.mouse.down();await h.idle(800);await pg.mouse.up();await h.idle(500);
 ok(await d(`S.sheet==='tmrMenu'`),'håll in pillret ger menyn');await c('[data-act="tmrDo"][data-a="x"]');
 // Receptvyn: samma ring
 await c('[data-act="cookClose"]');ok(await pg.locator('#main .tp-r.tr .no .trg').count()>=1,'ringen i receptets tidsplan')};
