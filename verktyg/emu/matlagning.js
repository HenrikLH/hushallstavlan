// Matlagningsläget (M27): delad vy, timer via tidsplanens stegknapp, timerchip i rubriken, bocka ingrediens, hoppa till steg. SHOT=prefix, LS cookv=b för B
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};const P=process.env.SHOT||'cook';
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');
 ok(await pg.locator('.cook').count()===1,'matlagningsläget öppet');const B=!!await pg.locator('.ck5-b').count();
 await h.shot(P+'-1');
 await c('.cook [data-act="cookStep"][data-d="1"]');ok(await d('S.cook.step')===1,'nästa steg');
 if(!B){await c('[data-act="cookVy"][data-id="plan"]');ok(await pg.locator('.ck5-plan .tp').count()===1,'tidsplanen i full bredd')}
 await c('.cook .tp-r:nth-child(2) .no');ok(await d('S.timers.some(t=>t.si===1)'),'stegknappen startar timern');await h.idle(1500);
 if(!B){await h.shot(P+'-plan');await c('[data-act="cookVy"][data-id="steg"]')}
 ok(await pg.locator('.ck5-chip .ck5-tl').count()===1,'timern syns i rubriken');
 await c('.ck5-i');ok(await pg.locator('.ck5-i.on').count()===1,'ingrediensen bockas av');
 await h.shot(P+'-2');
 if(!B){await c('.ck5-st:nth-child(4) .ck5-sb');ok(await d('S.cook.step')===3,'tryck på ett steg hoppar dit');await h.shot(P+'-4')}
 for(let k=0;k<6&&await pg.locator('.cook [data-act="cookStep"][data-d="1"]').count();k++)await c('.cook [data-act="cookStep"][data-d="1"]');
 ok(await pg.locator('[data-act="cookDone"]').count()===1,'sista steget har Klart');
 await c('[data-act="cookClose"]');ok(!await pg.locator('.cook').count(),'stängt')};
