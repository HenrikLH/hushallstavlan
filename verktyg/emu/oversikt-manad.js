const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.emulateMedia({reducedMotion:'no-preference'});
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(550)};
 await click('#nav [data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');assert.equal(await pg.locator('.wm-ch').count(),0,'Dubbelpilen är borta');
 const counts=await read('(()=>{const G=grpBehov(weekDishes());return{goal:Object.values(G).reduce((a,g)=>a+Math.max(0,g.beh),0),n:Object.values(G).reduce((a,g)=>a+Math.min(Math.max(0,g.n),Math.max(0,g.beh)),0)}})()');assert.equal(await pg.locator('.ws-card .wm-port').textContent(),counts.n+'/'+counts.goal);assert.equal(await pg.locator('.ws-card .wm-port i').count(),0,'Ingen portionsstapel');assert.equal(await pg.locator('.ws-card .wsum-s').count(),0,'Räcker-texten är ersatt');
 const grip=pg.locator('[data-motion-grip="budget"]');if(await grip.count())assert.equal(await grip.evaluate(e=>getComputedStyle(e).minHeight),'24px');
 await click('#nav [data-id="oversikt"]');if(await read('wallBoardOn()')){assert.equal(await pg.locator('.ovcal').count(),0);return}
 const handle=pg.locator('[data-motion-grip="calendar"]');assert.equal(await handle.count(),1);
 const drag=async(p,cancel=false)=>{await handle.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await h.idle(400);const b=await handle.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;await pg.mouse.move(x,y);await pg.mouse.down();const st=await read('({height:motionDrag.height,max:motionDrag.max,scale:motionDrag.scale,id:motionDrag.id,open:motionDrag.open})');const dy=(st.max*p-st.height)*st.scale;await pg.mouse.move(x,y+dy,{steps:12});assert.equal(await pg.evaluate(()=>document.body.style.position),'fixed');assert(Math.abs((await handle.boundingBox()).y-b.y-dy)<3,'Handtaget följer fingret');assert(Math.abs((await read('motionDrag.wx.p'))-p)<.03);if(cancel)await handle.dispatchEvent('pointercancel',{pointerId:st.id});await pg.mouse.up();await h.idle(650);assert.notEqual(await pg.evaluate(()=>document.body.style.position),'fixed');return cancel?st.open:p>=.5};
 await drag(.7,true);assert.equal(await read('!!S.ovCalOpen'),false);
 await drag(.7);assert.equal(await read('S.ovCalOpen'),true);assert(await pg.locator('.ovcal-month').evaluate(e=>!e.inert));
 assert.equal(await pg.locator('.ovcal-grid button').count()%7,0);
 const old=await pg.locator('.ovcal-toolbar b').textContent();await click('[data-act="ovMonth"][data-id="1"]');assert.notEqual(await pg.locator('.ovcal-toolbar b').textContent(),old);
 const date=pg.locator('.ovcal-grid button:not(.outside)').nth(4),key=await date.getAttribute('data-id');await date.click();await h.idle(600);assert.equal(await read('S.ovDay'),key);assert.equal(await pg.locator('#cal-rows').getAttribute('data-d'),key);assert.equal(await read('S.ovCalOpen'),true);
 await h.shot('oversikt-manad-oppen');await drag(.2);assert.equal(await read('S.ovCalOpen'),false);assert.equal(await pg.locator('.ovcal-week [aria-pressed="true"]').getAttribute('data-id'),key);
 await handle.press('ArrowDown');await h.idle(500);assert.equal(await read('S.ovCalOpen'),true);await handle.press('ArrowUp');await h.idle(500);assert.equal(await read('S.ovCalOpen'),false);
 await pg.emulateMedia({reducedMotion:'reduce'});await handle.click();await h.idle(100);assert.equal(await read('S.ovCalOpen'),true);assert.equal(await pg.locator('.ovcal-frame').evaluate(e=>e.getAnimations().length),0);
 console.log('PASS Ö2 månad: direkt drag, närmaste läge, scroll-lås, avbrott, datum, månad, tangentbord och reducerad rörelse');
};
