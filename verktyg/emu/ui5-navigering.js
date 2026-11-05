// UI 5.0: undersida glider in, svep från vänsterkanten går tillbaka, dra ned överst uppdaterar. Kör med LS='{"ui":"5"}'
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);let cdp;
 const touch=async(pts)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pts[0]]});
  for(const p of pts.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p]});await pg.waitForTimeout(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await h.idle(700)};
 const steg=(x0,y0,x1,y1,n=14)=>Array.from({length:n+1},(_,i)=>({x:x0+(x1-x0)*i/n,y:y0+(y1-y0)*i/n}));
 assert(await read('U5'),'UI 5.0 ska vara på');cdp=await pg.context().newCDPSession(pg);
 // Väder öppnas som undersida och glider in
 await pg.click('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(600);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(80);
 const anim=await pg.evaluate(()=>document.getElementById('main').getAnimations().map(a=>JSON.stringify(a.effect.getKeyframes()[0].transform)).join());
 assert.match(anim,/translateX\(100%\)/,'undersidan ska glida in från höger');await h.idle(600);
 assert.equal(await read('S.view'),'vader');
 // svep från vänsterkanten: tillbaka
 await touch(steg(6,400,330,410));
 assert.equal(await read('S.view'),'oversikt','svep från kanten ska gå tillbaka');
 // kort svep: stannar kvar
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(700);
 await touch(steg(6,400,60,402,5));assert.equal(await read('S.view'),'vader','kort svep ska inte gå tillbaka');
 await pg.locator('#main .back').first().click();await h.idle(600);
 // dra ned överst: uppdatera
 let gets=0;pg.on('request',r=>{if(r.url().includes('script.google.com')&&r.method()==='GET')gets++});
 await pg.evaluate(()=>scrollTo(0,0));await touch(steg(195,200,195,420,16));await h.idle(800);
 assert(gets>0,'dra ned ska hämta på nytt');
 await h.shot('ui5-navigering');console.log('PASS UI5 NAVIGERING');
};
