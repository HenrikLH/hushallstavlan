// Dammsugarsidan i Skog: förval Max/Custom, moppläge per rum. LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-skog.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1500);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.slice(0,3).map(r=>r.id))')));
 await pg.evaluate(R=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=null;S.haRobRum=['+R+'];S.haRobV={'+R[0]+':"vm",'+R[1]+':"vm",'+R[2]+':"v"};S.haLager="v";render()})()'),R);await h.idle(500);
 await h.shot('robot-skog-1');
 await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-fl.fh').getBoundingClientRect().top-120));await h.idle(400);await h.shot('robot-skog-2');
 if(process.env.MOPP){await pg.locator('main .ha-lag [data-id="m"]').click();await h.idle(500);await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-lag').getBoundingClientRect().top-120));await h.idle(400);await h.shot('robot-skog-3');await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-fl.fh .ha-fs.mopp').getBoundingClientRect().top-200));await h.idle(400);await h.shot('robot-skog-4');
  const r=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.slice(0,1).map(r=>r.id))')))[0];await pg.locator('main .ha-rs [data-id="'+r+':deep"]').click();await h.idle(400);
  assert.deepEqual(await pg.locator('main .ha-fl.fh .ha-fs.mopp .ha-ft > b').allInnerTexts(),['Mop · Deep','Mop'],'Deep får en egen omgång');await h.shot('robot-skog-5')}
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
