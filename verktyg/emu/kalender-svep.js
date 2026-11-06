// Kalender-fliken: svep åt vänster = nästa månad/vecka/dag, åt höger = föregående (telefonens pekgest).
// Svep åt höger testas bara i UI 5.0: i UI 2.0 tar Chromiums egen bakåtgest över i emulatorn (inte på iPhone, där bara kanten gör det).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);const cdp=await pg.context().newCDPSession(pg);
 const T=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[p]:[]});
 const svep=async(x0,x1,y)=>{await T('touchStart',{x:x0,y});for(let i=1;i<=12;i++){await T('touchMove',{x:x0+(x1-x0)*i/12,y:y+i*.3});await pg.waitForTimeout(16)}await T('touchEnd');await h.idle(900)};
 const U5=await read('U5'),man=()=>read('S.calMonth||ymKey(S.calDay||today())');
 await pg.click('#nav [data-act="nav"][data-id="kalender"]');await h.idle(700);
 const vy=async v=>{await pg.click('[data-act="calVy"][data-id="'+v+'"]');await h.idle(600)};
 await vy('manad');const m0=await man();
 await svep(320,60,560);const m1=await man();assert.equal(m1,await read('ymKey(addDays("'+m0+'-15",31))'),'nästa månad');
 if(U5){await svep(60,320,560);assert.equal(await man(),m0,'tillbaka till samma månad')}
 await vy('vecka');const d0=await read('S.calDay||today()');await svep(320,60,560);assert.equal(await read('S.calDay'),await read('addDays("'+d0+'",7)'),'nästa vecka');
 await vy('dag');const d1=await read('S.calDay');await svep(320,60,560);assert.equal(await read('S.calDay'),await read('addDays("'+d1+'",1)'),'nästa dag');
 if(U5){await svep(60,320,560);assert.equal(await read('S.calDay'),d1,'föregående dag')}
 assert.equal(await read('S.view'),'kalender');console.log('PASS KALENDERSVEP',m0,'→',m1);
};
