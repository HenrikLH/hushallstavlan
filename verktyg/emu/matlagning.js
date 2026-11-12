// Matlagningsläget (M27): öppnas via Börja laga, bläddra steg, timer i steget, skärmbilder. SHOT=prefix för bildnamnen
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(500)};const P=process.env.SHOT||'cook';
 const ok=(v,t)=>{if(!v)throw new Error(t);console.log('OK',t)};const d=x=>pg.evaluate(x=>window.__d(x),x);
 await c('[data-act="nav"][data-id="mat"]');await c('[data-act="matTab"][data-id="vecka"]');await c('.bt .bq[data-act="recipe"]');await c('[data-act="cook"]');
 ok(await pg.locator('.cook').count()===1,'matlagningsläget öppet');
 await h.shot(P+'-1');
 await c('[data-act="cookStep"][data-d="1"]');await h.idle(400);ok(await d('S.cook.step')===1,'nästa steg');
 if(await pg.locator('.ck5-tm').count()){await c('.ck5-tm');ok(await d('S.timers.some(t=>t.si===1)'),'timerknappen startar timern');await h.idle(1500)}
 await h.shot(P+'-2');
 await pg.evaluate(()=>{const b=document.querySelector('.cook-body');if(b)b.scrollTop=9999});await h.idle(300);await h.shot(P+'-2-ner');
 if(await pg.locator('[data-act="cookTp"]').count()){await c('[data-act="cookTp"]');ok(await pg.locator('.cook .tp').count()===1,'tidsplanen fälls ut')}
 for(let k=0;k<6&&await pg.locator('[data-act="cookStep"][data-d="1"]').count();k++)await c('.cook [data-act="cookStep"][data-d="1"]');
 ok(await pg.locator('[data-act="cookDone"]').count()===1,'sista steget har Klart');await h.shot(P+'-sist');
 await c('[data-act="cookClose"]');ok(!await pg.locator('.cook').count(),'stängt')};
