// Matlagningsläget (M27): delad vy, timer via tidsplanens stegknapp, timern syns först när högst 5 min är kvar, bocka ingrediens, hoppa till steg.
// SHOT=prefix för bilderna
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};const P=process.env.SHOT||'cook';
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');
 ok(await pg.locator('.cook').count()===1,'matlagningsläget öppet');const T='.ck5-chip';
 await h.shot(P+'-1');
 await c('.cook [data-act="cookStep"][data-d="1"]');ok(await d('S.cook.step')===1,'nästa steg');
 await c('[data-act="cookVy"][data-id="plan"]');ok(await pg.locator('.ck5-plan .tp').count()===1,'tidsplanen i full bredd');
 await c('.cook .tp-r:nth-child(2) .no');await c('.cook .tp-r:nth-child(4) .no');ok(await d('S.timers.filter(t=>t.rid===S.cook.id).length')===2,'stegknapparna startar två timrar');
 await c('[data-act="cookVy"][data-id="steg"]');ok(!await pg.locator(T).count(),'timrar med mer än 5 min syns inte');
 await d(`const n=Date.now();S.timers.find(t=>t.si===1).end=n+272000;S.timers.find(t=>t.si===3).end=n+48000;1`);await h.idle(1600);
 ok(await pg.locator(T).count()===2,'båda syns när högst 5 min är kvar');ok(await pg.locator(T+'.sist').count()===1,'sista minuten är markerad');
 await c('.ck5-i');ok(await pg.locator('.ck5-i.on').count()===1,'ingrediensen bockas av');
 await c('.ck5-st:nth-child(3) .ck5-sb');ok(await d('S.cook.step')===2,'tryck på ett steg hoppar dit');await h.idle(400);
 await h.shot(P+'-2');
 await d(`S.timers.find(t=>t.si===3).end=Date.now()-1000;1`);await h.idle(1600);ok(await pg.locator(T+'.klar').count()===1,'klar timer fylld');await h.shot(P+'-klar');
 for(let k=0;k<6&&await pg.locator('.cook [data-act="cookStep"][data-d="1"]').count();k++)await c('.cook [data-act="cookStep"][data-d="1"]');
 ok(await pg.locator('[data-act="cookDone"]').count()===1,'sista steget har Klart');
 await d(`S.timers=[];1`);await c('[data-act="cookClose"]');ok(!await pg.locator('.cook').count(),'stängt')};
