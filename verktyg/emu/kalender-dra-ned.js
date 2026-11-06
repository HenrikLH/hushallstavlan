// Schema i Översikt: dra ned (iPhone: touch-action pan-x, drag uppåt scrollar sidan) i veckoraden fäller ut månaden, sidled bläddrar veckor, kort drag gör inget. Mäter luften runt handtaget.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s),cdp=await pg.context().newCDPSession(pg);
 const touch=async pts=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pts[0]]});
  for(const p of pts.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p]});await pg.waitForTimeout(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await h.idle(700)};
 const drag=(x,y,dx,dy,n=12)=>touch(Array.from({length:n+1},(_,i)=>({x:x+dx*i/n,y:y+dy*i/n})));
 await pg.click('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(1500);await pg.locator('.ovcal').scrollIntoViewIfNeeded();await h.idle(400);
 const luft=await pg.evaluate(()=>{const r=e=>e.getBoundingClientRect(),g=r(document.querySelector('.ovcal .motion-grip i'));return[g.top-r(document.querySelector('.ovcal-week .wk-d')).bottom,r(document.querySelector('.ovcal .wk-day')).top-g.bottom].map(Math.round)});
 console.log('luft datumruta→handtag, handtag→linje',luft);assert.ok(luft[0]>=10&&luft[1]>=10,'Handtaget ska ha luft på båda sidor');
 const b=await pg.locator('.ovcal-week').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
 await drag(x,y,0,8,3);assert.equal(await read('!!S.ovCalOpen'),false,'Ett litet drag ska inte fälla ut');
 await drag(x,y,-160,6);assert.equal(await read('!!S.ovCalOpen'),false,'Svep i sidled ska inte fälla ut');
 const y0=await read('scrollY');await drag(x,y,0,-120);assert.ok(await read('scrollY')>y0+60,'Drag uppåt i veckoraden ska scrolla sidan');assert.equal(await read('!!S.ovCalOpen'),false);
 await pg.locator('.ovcal').scrollIntoViewIfNeeded();await h.idle(300);const b2=await pg.locator('.ovcal-week').boundingBox();
 assert.equal(await pg.locator('.ovcal-week .wk-sw').evaluate(e=>getComputedStyle(e).touchAction),'pan-x','Veckoraden ska bara låta webbläsaren scrolla i sidled');
 await drag(b2.x+b2.width/2,b2.y+b2.height/2,0,180);assert.equal(await read('!!S.ovCalOpen'),true,'Dra ned i veckoraden ska visa månaden');
 assert.ok(await pg.locator('.ovcal.expanded').count(),'Månaden ska vara utfälld');await h.shot('kalender-dra-ned');
 await pg.click('.ovcal .motion-grip');await h.idle(700);assert.equal(await read('!!S.ovCalOpen'),false,'Handtaget ska fälla ihop igen');
 const d=pg.locator('.ovcal-week .wk-d').nth(2);await d.click();await h.idle(500);
 assert.equal(await read('!!S.ovCalOpen'),false,'Tryck på en dag ska inte fälla ut')};
