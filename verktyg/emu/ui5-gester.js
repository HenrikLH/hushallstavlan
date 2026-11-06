// UI 5.0: tillbaka-svepet som i iOS. Fart avgör, svep var som helst på undersidan, ändrad riktning avbryter, scrollen återställs.
// Kör med LS='{"ui":"5"}'
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);const cdp=await pg.context().newCDPSession(pg);
 const T=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[p]:[]});
 // punkter [x,y,ms] där ms är väntan före nästa
 const drag=async(pts,{slapp=true,vila=0}={})=>{await T('touchStart',{x:pts[0][0],y:pts[0][1]});for(const[x,y,ms]of pts.slice(1)){await T('touchMove',{x,y});await pg.waitForTimeout(ms??16)}
  if(vila)await pg.waitForTimeout(vila);if(slapp){await T('touchEnd');await h.idle(900)}};
 const linje=(x0,x1,y,n,ms=16)=>Array.from({length:n+1},(_,i)=>[x0+(x1-x0)*i/n,y+i*.3,ms]);
 const vader=async()=>{await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(800);assert.equal(await read('S.view'),'vader')};
 assert(await read('U5'),'UI 5.0 ska vara på');
 await pg.click('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(600);
 // scrolla lite så att vi ser att översikten kommer tillbaka på samma ställe
 const knapp=pg.locator('[data-act="nav"][data-id="vader"]').first();await knapp.scrollIntoViewIfNeeded();await pg.evaluate(()=>scrollBy(0,40));await h.idle(300);
 const y0=await pg.evaluate(()=>scrollY);await vader();
 // 1. mitt i svepet: översikten syns under, förskjuten
 await drag(linje(150,260,420,12),{slapp:false});await pg.waitForTimeout(50);
 assert(await pg.locator('.u5-lager .widget,.u5-lager .card').count(),'sidan under ska synas medan man sveper');await h.shot('ui5-gest-mitt');
 // långsamt släpp (fingret stilla) en bit in: stannar kvar
 await pg.waitForTimeout(150);await T('touchEnd');await h.idle(900);
 assert.equal(await read('S.view'),'vader','långsamt kort svep ska inte gå tillbaka');assert.equal(await pg.locator('.u5-lager').count(),0,'lagret ska tas bort');
 // 2. snabbt kort svep mitt på sidan: tillbaka tack vare farten
 await drag(linje(110,290,450,3,0)); // CDP ger ≈65 ms mellan händelserna, så stora steg ger fart som en riktig snärt
 assert.equal(await read('S.view'),'oversikt','snabbt svep ska gå tillbaka');
 assert(Math.abs(await pg.evaluate(()=>scrollY)-y0)<4,'översikten ska komma tillbaka där man var ('+y0+')');
 // 3. långt svep men åt vänster igen innan släpp: avbryts
 await vader();await drag([...linje(60,300,420,12),...linje(300,240,424,4,12).slice(1)]);
 assert.equal(await read('S.view'),'vader','ändrad riktning ska avbryta');
 // 4. lugnt svep över halva skärmen: tillbaka
 await drag(linje(40,290,420,16,30),{vila:120});assert.equal(await read('S.view'),'oversikt','över halva skärmen ska gå tillbaka');
 // 5. vertikal scroll på undersidan ska inte flytta sidan i sidled
 await vader();await drag(Array.from({length:11},(_,i)=>[200+i*2,600-i*30,16]));
 assert.equal(await read('S.view'),'vader');assert.equal(await pg.evaluate(()=>document.getElementById('main').style.transform),'','ingen förskjutning vid scroll');
 // 6. Tillbaka-knappen: undersidan glider ut ovanpå översikten
 await pg.evaluate(()=>scrollTo(0,0));await pg.locator('#main .back,#navbar .back').first().click();await pg.waitForTimeout(140);
 if(!await read('calm()')){assert(await pg.locator('.u5-lager.topp').count(),'undersidan ska glida ut');await h.shot('ui5-gest-tillbaka')}
 await h.idle(900);assert.equal(await read('S.view'),'oversikt');assert.equal(await pg.locator('.u5-lager,.u5-dim').count(),0,'inga lager kvar');
 assert(Math.abs(await pg.evaluate(()=>scrollY)-y0)<4,'knappen ska också komma tillbaka där man var');
 console.log('PASS UI5 GESTER')};
