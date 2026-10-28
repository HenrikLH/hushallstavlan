// Timerkorten i matlagningsläget (M27): tryck på stapeln startar, kortet visar tiden, paus på knappen, håll in ger fler val och fler kort sveps fram
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 const hold=async k=>{await pg.evaluate(k=>document.querySelector('.cook .td-c[data-id="'+k+'"]').scrollIntoView({inline:'nearest',block:'nearest'}),k);await h.idle(400);await h.hold('.cook .td-c[data-id="'+k+'"] .td-t');await h.idle(600)};
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');await c('[data-act="cookStep"][data-d="1"]');
 ok(!await pg.locator('.cook .td').count(),'inga kort utan timrar');
 await c('.cook .tp-r:nth-child(2) .tp-t');
 ok(await pg.locator('.cook .td-c').count()===1,'ett kort efter tryck på stapeln');
 ok(!await pg.locator('.cook .tp-b.run em').count(),'stapeln har ingen text');
 const t0=await pg.locator('.cook .td-c b').textContent();ok(/^\d+:\d\d$/.test(t0),'tiden syns i kortet: '+t0);
 ok(!await pg.locator('#timers .timer').count(),'ingen timer i hörnet i kokläget');
 await c('.cook .td-c .td-rb');ok(await pg.locator('.cook .td-c.pau').count()===1,'pausad med knappen');
 await c('.cook .td-c .td-rb');ok(!await pg.locator('.cook .td-c.pau').count(),'fortsätter med knappen');
 // Tre timrar till: korten går utanför bild och kan svepas fram
 await d(`const r=S.cook.id,n=Date.now();S.timers.push({k:'b',label:'Steg 3',end:n+100000,ring:false,rid:r,si:2,dur:180000},{k:'c',label:'Egen timer',end:n+600000,ring:false,rid:r,si:-1,egen:1,dur:600000},{k:'e',label:'Steg 1',end:n-1000,ring:true,rid:r,si:0,dur:60000});render()`);await h.idle(600);
 ok(await pg.locator('.cook .td.fler .td-c').count()===4,'fyra kort');
 ok((await pg.locator('.cook .td-c').first().getAttribute('class')).includes('klar'),'färdig timer först');
 const sw=await pg.evaluate(()=>{const t=document.querySelector('.cook .td');return t.scrollWidth>t.clientWidth+20});ok(sw,'korten går utanför bild');
 ok(await pg.evaluate(()=>[...document.querySelectorAll('.cook .td-c')].every(c=>{const b=c.querySelector('b').getBoundingClientRect(),r=c.getBoundingClientRect(),k=c.querySelector('.td-rb').getBoundingClientRect();return b.right<=r.right-4&&b.top>=k.bottom-6})),'tiden får plats och krockar inte med knappen');
 await h.shot('kort');
 await pg.evaluate(()=>document.querySelector('.cook .td').scrollBy({left:400}));await h.idle(500);
 ok(await pg.evaluate(()=>document.querySelector('.cook .td').scrollLeft>0),'svep i sidled');await h.shot('kort-svept');
 // Håll in: menyn i kokläget, +1 min och starta om
 await pg.evaluate(()=>document.querySelector('.cook .td').scrollTo({left:0}));await h.idle(300);
 await hold('b');
 ok(await d(`S.sheet==='tmrMenu'`)&&await pg.locator('#overlay [data-act="tmrDo"][data-a="r"]').count()===1,'håll in öppnar menyn');await h.shot('meny');
 const k0=await d(`tmKvar(S.timers.find(t=>t.k==='b'))`);await c('[data-act="tmrDo"][data-a="m"]');
 const k1=await d(`tmKvar(S.timers.find(t=>t.k==='b'))`);ok(k1-k0>55000,'en minut till');
 await hold('b');await c('[data-act="tmrDo"][data-a="r"]');
 ok(await d(`(t=>t.dur===180000&&tmKvar(t)>175000)(S.timers.find(t=>t.k==='b'))`),'starta om från början');
 await hold('e');await c('[data-act="tmrDo"][data-a="x"]');
 ok(await pg.locator('.cook .td-c').count()===3,'stäng tar bort kortet');
 await c('[data-act="cookClose"]');ok(await pg.locator('.td-c').count()>=3,'korten under tidsplanen i receptet');await h.shot('recept')};
