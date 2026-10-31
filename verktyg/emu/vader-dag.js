// Tryck på en dag i W4 (dagsprognosen) öppnar Dagens väder (B24): temperatur, nederbörd och vind i samma graf, byt dag i raden överst.
// WXYR=1 WXMIX=1 ger Yr-liknande data (timvärden 60 h, sedan var sjätte timme) med växlande väder.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(800);
 const rows=pg.locator('button.day-row[data-act="wxDay"]');assert((await rows.count())>=7);
 await rows.nth(0).scrollIntoViewIfNeeded();await rows.nth(0).click();await h.idle(1500);
 assert.equal(await pg.evaluate(()=>window.__d('S.sheet')),'wxDay');
 assert(await pg.locator('.wd-dot').count(),'nu-pricken saknas idag');assert(await pg.locator('.wd-mk.h').count());
 assert.match(await pg.locator('.wd-sum').textContent(),/^Idag blir det .+ mellan/);
 await h.shot('dag-idag');
 await pg.click('.wd-days button:nth-of-type(2)');await h.idle(1500);
 assert.match(await pg.locator('.wd-sum').textContent(),/^I morgon/);assert.equal(await pg.locator('.wd-body.an.from-r').count(),1);assert.equal(await pg.locator('.wd-dot').count(),0);
 await h.shot('dag-imorgon');
 assert(await pg.locator('.wd-ar').count(),'vindpilar saknas');assert(await pg.locator('.wd-bar').count(),'staplar saknas');
 // omritning utan dagbyte ska inte spela animationerna igen
 await pg.evaluate(()=>window.__d('overlayKeepScroll()'));assert.equal(await pg.locator('.wd-body.an').count(),0);
 // Midnatt från omgivande prognospunkter, även vid sommar-/vintertidsbyte. Ingen påhittad slutpunkt om prognosen tar slut.
 const points=await pg.evaluate(()=>window.__d(`(()=>{const out=[];for(const date of ['2026-10-22','2026-10-25','2026-03-29']){const t=parse(date).getTime(),all=[];for(let h=-6;h<=36;h+=6)all.push({d:new Date(t+h*36e5),T:h,w:4,wd:h<0?350:10,pr:null,pr6:6});const H=wxDayPts({all},date);out.push({first:H[0].X,last:H.at(-1).X,total:H.reduce((s,x)=>s+x.amt,0),hours:(parse(addDays(date,1))-t)/36e5,finite:H.every(x=>Number.isFinite(x.T)&&x.X>=0&&x.endX<=240)});}const t=parse('2026-10-22'),H=wxDayPts({all:[{d:t,T:5,pr:0},{d:new Date(+t+18*36e5),T:8,pr:0}]},'2026-10-22');return{out,partial:H.at(-1).X}})()`));
 for(const x of points.out){assert.equal(x.first,0);assert.equal(x.last,240);assert.equal(x.total,x.hours);assert(x.finite)}assert.equal(points.partial,180);
 const full=await pg.evaluate(()=>window.__d('(()=>{const W=wxModel();return W.days.slice(2,-1).map(d=>{const H=wxDayPts(W,d.date);return[H[0].X,H.at(-1).X]})})()'));
 full.forEach(x=>assert.deepEqual(x,[0,240]));assert.equal(await pg.locator('.wd-x').textContent(),'0006121824');
 const selected=()=>pg.locator('.wd-days button[aria-pressed="true"]').getAttribute('data-id');
 const swipe=async(dx,dy=0,cancel=false)=>{const b=await pg.locator('.wd-chart').boundingBox(),x=b.x+b.width/2,y=b.y+80;
  if(cancel){await pg.locator('.wd-chart').dispatchEvent('pointerdown',{pointerId:41,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});await pg.locator('.wd-chart').dispatchEvent('pointermove',{pointerId:41,pointerType:'touch',isPrimary:true,clientX:x+dx,clientY:y+dy});await pg.locator('.wd-chart').dispatchEvent('pointercancel',{pointerId:41,pointerType:'touch',isPrimary:true});}
  else{const c=await pg.context().newCDPSession(pg);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach()}
  await h.idle(400)};
 const before=await selected();await swipe(-120);const next=await selected();assert.notEqual(next,before,'svep vänster byter dag');assert.equal(await pg.locator('.wd-body.from-r').count(),1);
 await swipe(120);assert.equal(await selected(),before,'svep höger går tillbaka');
 await swipe(-18);assert.equal(await selected(),before,'kort drag byter inte dag');
 await swipe(-120,0,true);assert.equal(await selected(),before,'avbrutet drag byter inte dag');
 await swipe(5,-90);assert.equal(await selected(),before,'lodrät scroll byter inte dag');
 await pg.click('.wd-days button:nth-of-type(1)');await h.idle(200);const first=await selected();await swipe(120);assert.equal(await selected(),first,'första dagen går inte runt till sista');
 const n=await pg.locator('.wd-days [data-act="wxDay"]').count();await pg.click('.wd-days button:nth-of-type('+n+')');await h.idle(500);
 assert((await pg.locator('.wd-icons span').count())>=1);const last=await selected();await swipe(-120);assert.equal(await selected(),last,'sista dagen går inte runt');await h.shot('dag-sista');
 // överlever omritningen var 30:e sekund och stängs med Klar
 await pg.evaluate(()=>window.__d('overlayKeepScroll()'));assert.equal(await pg.locator('.wd-chart').count(),1);
 await pg.click('.sheet-head [data-act="sheetClose"]');await h.idle(500);assert.equal(await pg.evaluate(()=>window.__d('S.sheet')),null);
 console.log('PASS: B24 öppnas/stängs, midnatt och DST täcks utan påhittad data, riktiga pekgester byter dag, kort/lodrätt/avbrutet drag och ändlägen bevaras.');
};
