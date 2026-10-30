// Verkliga gester och kontroller med emulatorns exempeldata. Ingen hushållsdata ändras.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.emulateMedia({reducedMotion:'no-preference'});
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(320)};
 const nav=async v=>{await click('#nav [data-id="'+v+'"]');await h.idle(550)};
 const developer=async()=>{await click('[data-act="settings"]');const section=pg.locator('[data-k="pref-avancerat"]');if(!await section.evaluate(e=>e.open))await section.locator('summary').click();await h.idle(300)};
 if(!await read('DEV')){assert.equal(await pg.locator('[data-motion-grip]').count(),0,'Normalläget saknar nya handtag');await developer();assert.equal(await pg.locator('[data-act="motion"]').count(),0);await click('[data-act="dev"]');await click('[data-act="sheetClose"]')}
 assert.equal(await read('motionOn()'),true);await pg.reload();await h.idle(1600);assert.equal(await read('motionOn()'),true,'Utvecklarläget fungerar från uppstart');
 // Kontrollera mellantillståndet medan fingret fortfarande hålls nere, inte bara slutläget.
 const drag=async(sel,fraction,cancel=false)=>{
  console.log('DRAG',sel,fraction,cancel);const el=pg.locator(sel).first();await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await h.idle(520);const b=await el.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
  const before=await pg.evaluate(()=>({y:scrollY,top:document.getElementById('main').getBoundingClientRect().top}));
  assert(await pg.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('[data-motion-grip]'),{x,y}),'Handtaget är synligt ovanför navigationen');await pg.mouse.move(x,y);await pg.mouse.down();const state=await read('({height:motionDrag.height,max:motionDrag.max,scale:motionDrag.scale,id:motionDrag.id,open:motionDrag.open})');
  const dy=(fraction*state.max-state.height)*state.scale;await pg.mouse.move(x,y+dy,{steps:10});
  assert.equal(await pg.evaluate(()=>document.body.style.position),'fixed','Sidan låst under drag');assert(await read('Date.now()-A.touch<2000'));
  const during=await el.boundingBox();assert(Math.abs(during.y-b.y-dy)<2.5,'Handtaget följer ytans rörliga kant och fingret');
  const actual=await read('motionDrag.wx?motionDrag.wx.p:parseFloat(motionDrag.panel.style.height)/motionDrag.max');assert(Math.abs(actual-fraction)<.025,'Ytan visar dragets faktiska progress före släpp');
  assert(Math.abs((await pg.locator('#main').evaluate(e=>e.getBoundingClientRect().top))-before.top)<1,'Sidan står still');
  if(sel.includes('weather')&&fraction===.25&&!cancel)await h.shot('animationer-vader-under-drag');
  if(cancel)await el.dispatchEvent('pointercancel',{pointerId:state.id});await pg.mouse.up();await h.idle(950);
  assert.notEqual(await pg.evaluate(()=>document.body.style.position),'fixed');assert(Math.abs((await pg.evaluate(()=>scrollY))-before.y)<2,'Scroll återställd');
  return cancel?state.open:fraction>=.5;
 };
 // Alla blad delar handtag: följ fingret, avbryt, återgå och stäng.
 await click('[data-act="settings"]');await h.idle(550);
 const sh=pg.locator('[data-sheet-grip]'),sp=pg.locator('.sheet-panel');
 const sb=await sh.boundingBox(),origin=await sp.boundingBox(),sx=sb.x+sb.width/2,sy=sb.y+sb.height/2;
 await pg.mouse.move(sx,sy);await pg.mouse.down();await pg.mouse.move(sx,sy+60,{steps:8});
 assert(Math.abs((await sp.boundingBox()).y-origin.y-60)<2,'Bladet följer handtaget under drag');
 await pg.mouse.up();await h.idle(500);assert(Math.abs((await sp.boundingBox()).y-origin.y)<2,'Kort drag återgår');
 await pg.mouse.move(sx,sy);await pg.mouse.down();await pg.mouse.move(sx,sy+80,{steps:8});await sh.dispatchEvent('pointercancel',{pointerId:await read('sheetDrag.id')});await pg.mouse.up();await h.idle(500);assert(await sp.isVisible(),'Avbrutet drag behåller bladet');
 await pg.mouse.move(sx,sy);await pg.mouse.down();const distance=await read('sheetDrag.range*sheetDrag.scale*.6');await pg.mouse.move(sx,sy+distance,{steps:10});await pg.mouse.up();await h.idle(550);assert.equal(await sp.count(),0,'Långt drag stänger bladet');
 await nav('mat');await click('[data-act="matTab"][data-id="vecka"]');
 const menuY=await pg.locator('.segc[aria-label="Visa"]').evaluate(e=>e.getBoundingClientRect().top);for(const tab of ['inkop','recept','vecka']){await click('[data-act="matTab"][data-id="'+tab+'"]');assert(Math.abs((await pg.locator('.segc[aria-label="Visa"]').evaluate(e=>e.getBoundingClientRect().top))-menuY)<1,'Matmenyn står still '+tab)}
 assert.equal(await pg.locator('[data-motion-grip="budget"]').count(),1);
 await drag('[data-motion-grip="budget"]',.75);assert.equal(await read('S.wsumOpen'),true);
 await drag('[data-motion-grip="budget"]',.25);assert.equal(await read('S.wsumOpen'),false);
 assert(await pg.locator('#week-budget-details').evaluate(e=>e.hidden&&e.inert));
 await pg.locator('[data-motion-grip="budget"]').press('ArrowDown');await h.idle(550);assert.equal(await read('S.wsumOpen'),true);
 await click('.ws-card .wm-top');assert.equal(await read('S.wsumOpen'),false);
 await drag('[data-motion-grip="budget"]',.75,true);assert.equal(await read('S.wsumOpen'),false);
 // Pekgest: webbläsaren får inte ta över för sidskroll (touch-action måste finnas före touchstart).
 const touch=await pg.context().newCDPSession(pg),handle=pg.locator('[data-motion-grip="budget"]');await handle.scrollIntoViewIfNeeded();const hb=await handle.boundingBox(),tx=hb.x+hb.width/2,ty=hb.y+hb.height/2;
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx,y:ty+160}]});
 assert.equal(await pg.evaluate(()=>document.body.style.position),'fixed','Pekdrag låser sidan');
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await h.idle(600);assert.equal(await read('S.wsumOpen'),true,'Pekdrag öppnar');
 await touch.detach();await click('.ws-card .wm-top');
 await drag('[data-motion-grip="budget"]',.25);assert.equal(await read('S.wsumOpen'),false,'Under mitten återgår till stängt');
 await h.shot('animationer-veckokostnad');
 await nav('oversikt');
 if(await pg.locator('[data-motion-grip="weather"]').count()){
  if(await read('OVWX')==='graf')await click('[data-motion-grip="weather"]');
  await pg.evaluate(()=>scrollTo(0,80));await drag('[data-motion-grip="weather"]',.25);assert.equal(await read('OVWX'),'tim','Kort drag återgår till stängt');await drag('[data-motion-grip="weather"]',.75);
  assert.equal(await read('OVWX'),'graf');assert.equal(await pg.locator('.ovx.hl-on').count(),0,'Inget håll-in-zoom');
  assert.equal(await pg.locator('.ovx').getAttribute('data-hold-lift'),null);
  await drag('[data-motion-grip="weather"]',.65);assert.equal(await read('OVWX'),'graf','Närmare öppet återgår till öppet');
  await h.shot('animationer-vader-oppet');
  await pg.reload();await h.idle(1800);assert.equal(await read('OVWX'),'graf');
  await drag('[data-motion-grip="weather"]',.25);assert.equal(await read('OVWX'),'tim');
  await pg.locator('[data-motion-grip="weather"]').press('Enter');await h.idle(1100);assert.equal(await read('OVWX'),'graf');
  await pg.locator('[data-motion-grip="weather"]').press('ArrowUp');await h.idle(1000);
  const strip=pg.locator('.ovx .bwx-h');await strip.evaluate(e=>e.scrollLeft=120);assert(await strip.evaluate(e=>e.scrollLeft)>0,'Timremsans sidscroll kvar');
 }
 await pg.locator('#nav [data-id="mat"]').click();await pg.waitForTimeout(80);
 const pageMotion=await read('({count:motionPageAnim.animations.length,duration:motionPageAnim.animations[0].effect.getTiming().duration,frames:motionPageAnim.animations[0].effect.getKeyframes(),moving:motionPageAnim.animations.some(a=>getComputedStyle(a.effect.target).transform!=="none"),menuMoves:motionPageAnim.animations.some(a=>a.effect.target.matches(".head,.segc,.subseg"))})');
 assert(pageMotion.count>0&&pageMotion.moving,'Sidbytet syns i det renderade innehållet');assert.equal(pageMotion.duration,620);assert(/80px/.test(pageMotion.frames[0].transform));assert.equal(pageMotion.menuMoves,false);
 await h.idle(650);await pg.locator('[data-act="matTab"][data-id="inkop"]').click();await pg.waitForTimeout(200);
 const thumb=pg.locator('.segc[aria-label="Visa"] .seg-thumb');const mid=await thumb.evaluate(e=>({x:new DOMMatrix(getComputedStyle(e).transform).m41,width:e.getBoundingClientRect().width,opacity:getComputedStyle(e).opacity}));assert(mid.x>2&&mid.x<mid.width-2&&Number(mid.opacity)>0,'Valmarkeringen syns mellan sina ändlägen');assert(await thumb.evaluate(e=>e.getAnimations().some(a=>a.playState==='running'&&a.effect.getTiming().duration===440)),'Menyvalets förflyttning pågår och går att se');await h.idle(500);
 await nav('uppgifter');await click('[data-act="taskTab"][data-id="kalender"]');await h.idle(500);
 const date=await read('S.calDay||today()');
 for(const mode of ['dag','vecka','manad','dag']){const label=pg.locator('.motion-date-label'),before=await label.boundingBox(),text=await label.textContent();await pg.locator('[data-act="calVy"][data-id="'+mode+'"]').click();await pg.waitForTimeout(80);const after=await label.boundingBox();assert(Math.abs(before.y-after.y)<1&&Math.abs(before.x-after.x)<1,'Datumets referens står kvar '+JSON.stringify({before,after,mode}));assert.equal(await label.textContent(),text);assert(await pg.locator('.motion-calendar').evaluate(e=>getComputedStyle(e).transform!=='none'),'Kalenderinnehållets övergång syns');await h.idle(500);assert.equal(await read('S.calDay||today()'),date);assert.equal(await read('S.calVy'),mode)}
 await nav('stad');const detail=pg.locator('details[data-k]').first();
 if(await detail.count()){
  const key=await detail.getAttribute('data-k');await detail.locator('summary').click();await h.idle(550);const open=await detail.evaluate(e=>e.open);
  await pg.reload();await h.idle(1600); // samma funktion fungerar även efter omstart
  const d=pg.locator('details[data-k="'+key+'"]'),initial=await d.evaluate(e=>e.open);await d.locator('summary').click();await d.locator('summary').click({force:true});await h.idle(550);assert.equal(await d.evaluate(e=>e.open),initial,'Snabb omvändning avbryter expansion');
 }
 await nav('ekonomi');
 if(await pg.locator('[data-act="pin"]').count())for(const n of ['1','9','1','2'])await click('[data-act="pin"][data-id="'+n+'"]');
 const fold=pg.locator('[data-act="ekoFold"]').first();assert(await fold.count());const total=await fold.textContent();
 await fold.click();await h.idle(550);assert.equal(await fold.getAttribute('aria-expanded'),'false');assert(await fold.evaluate(e=>e.nextElementSibling.hidden&&e.nextElementSibling.inert));
 await fold.click();await h.idle(550);assert.equal(await fold.getAttribute('aria-expanded'),'true');assert.equal(await fold.textContent(),total);assert(await pg.locator('[data-act="ekoCost"]').count()>0);
 await fold.click();const curve=await fold.evaluate(e=>{const b=e.nextElementSibling,a=b.getAnimations()[0],timing=a.effect.getTiming();a.pause();const heights=[0,48,240,432,480].map(t=>{a.currentTime=t;return b.getBoundingClientRect().height});a.play();return{timing,heights}});const H=curve.heights;
 assert.equal(curve.timing.duration,480);assert.equal(curve.timing.easing.replace(/\s/g,''),'cubic-bezier(0.65,0,0.35,1)');assert(H[0]-H[1]<H[0]*.05&&H[2]>H[0]*.4&&H[2]<H[0]*.6&&H[3]<H[0]*.05,'Den verkliga expansionen accelererar och bromsar');await h.idle(550);await fold.click();await h.idle(550);
 await click('[data-act="settings"]');const pref=pg.locator('[data-k="pref-avancerat"]');if(!await pref.evaluate(e=>e.open))await pref.locator('summary').click();await h.idle(550);
 const panel=pg.locator('[data-form="settings"]'),panelTop=await panel.evaluate(e=>e.getBoundingClientRect().top);
 for(const k of ['personer','utseende','vardag']){const d=pg.locator('[data-k="pref-'+k+'"]');if(await d.evaluate(e=>e.open))continue;await d.locator('summary').scrollIntoViewIfNeeded();const y=await d.evaluate(e=>e.getBoundingClientRect().top);await d.locator('summary').click();await pg.waitForTimeout(120);assert(Math.abs((await panel.evaluate(e=>e.getBoundingClientRect().top))-panelTop)<1,'Inställningsbladets överkant är förankrad');assert(Math.abs((await d.evaluate(e=>e.getBoundingClientRect().top))-y)<1,'Sektionen expanderar nedåt');await h.idle(500)}
 await click('[data-act="motion"]');assert.equal(await read('MOTION'),false);
 await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1800);assert.equal(await read('MOTION'),false);assert.equal(await pg.locator('[data-motion-grip]').count(),0);
 await nav('mat');await click('[data-act="matTab"][data-id="vecka"]');await h.idle(500);assert.equal(await pg.locator('#main').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length),0);
 await click('[data-act="settings"]');const pref2=pg.locator('[data-k="pref-avancerat"]');if(!await pref2.evaluate(e=>e.open))await pref2.locator('summary').click();await h.idle(550);await click('[data-act="motion"]');await click('[data-act="sheetClose"]');assert.equal(await read('MOTION'),true);
 await pg.emulateMedia({reducedMotion:'reduce'});await click('[data-motion-grip="budget"]');assert.equal(await read('S.wsumOpen'),true);
 assert.equal(await pg.locator('#week-budget-details').evaluate(e=>e.getAnimations().length),0);
 assert(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Ingen horisontell sidscroll');
 await developer();await click('[data-act="dev"]');await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1600);assert.equal(await read('motionOn()'),false);assert.equal(await pg.locator('[data-motion-grip]').count(),0);await nav('oversikt');if(await pg.locator('.ovx').count())assert.equal(await pg.locator('.ovx').getAttribute('data-hold-lift'),'ovGx');
 console.log('PASS animationer: handtag, scroll-lås/avbrott, vädergraf utan lyft, minne, kalenderdatum, disclosures, ekonomi, reducerad rörelse');
};
