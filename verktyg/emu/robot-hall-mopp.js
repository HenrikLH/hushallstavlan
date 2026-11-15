// Moppning utan dammsugning före kräver håll in; Smart hem-rutan visar förlopp för dammsugaren och diskmaskinen.
// LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-hall-mopp.js   (väggen: + "wall":"1","me":"" och VP=1368x912)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(1500);
 const hus=pg.locator('main .ot-hus');
 assert.ok(await hus.locator('.ot-ntp').count()>=2,'Förloppsstaplar i Smart hem');
 assert.match(await hus.innerText(),/Diskmaskinen: diskar/,'Diskmaskinen som kör syns i Smart hem');
 assert.equal(await pg.locator('main .ot-nu .ot-ntp').count(),0,'Inget förlopp i Just nu');
 await hus.scrollIntoViewIfNeeded();await h.shot('smart-hem');
 if(process.env.LS.includes('"wall"'))return;
 await pg.evaluate(()=>scrollTo(0,0));await h.idle(600);await pg.locator('#nav [data-id="hemmet"]').click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.slice(0,2).map(r=>r.id))')));
 // bara moppning: håll in krävs
 await pg.evaluate(R=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=null;x.rum.forEach(r=>r.sv=null);S.haRobRum=['+R+'];S.haRobV={'+R[0]+':"m",'+R[1]+':"m"};S.haLager="m";render()})()'),R);await h.idle(500);
 const k=pg.locator('main .ha-bar .ha-hold');
 assert.equal(await k.count(),1,'Håll in-knappen visas när rummen inte dammsugs före');
 await h.shot('hall-in-mopp');
 await k.click();await h.idle(500);
 assert.equal(await pg.evaluate(()=>window.__d('haAppX().st')),'charging','Ett tryck startar inte');
 // dammsugning före i samma körning: vanlig Starta
 await pg.evaluate(R=>window.__d('(()=>{S.haRobV={'+R[0]+':"vm",'+R[1]+':"vm"};render()})()'),R);await h.idle(400);
 assert.equal(await pg.locator('main .ha-bar .ha-hold').count(),0,'Ingen håll in när rummen dammsugs först');
 // nyss dammsuget (inom två timmar): vanlig Starta
 await pg.evaluate(R=>window.__d('(()=>{const x=haAppX();x.rum.forEach(r=>r.sv=Date.now()/1e3-600);S.haRobV={'+R[0]+':"m",'+R[1]+':"m"};render()})()'),R);await h.idle(400);
 assert.equal(await pg.locator('main .ha-bar .ha-hold').count(),0,'Ingen håll in när rummen nyss dammsugits');
 // håll in startar
 await pg.evaluate(()=>window.__d('(()=>{haAppX().rum.forEach(r=>r.sv=null);render()})()'));await h.idle(400);
 const b=await pg.locator('main .ha-bar .ha-hold').boundingBox();await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await h.idle(1400);await pg.mouse.up();await h.idle(500);
 assert.equal(await pg.evaluate(()=>window.__d('haAppX().st')),'segment_cleaning','Håll in startar moppningen');
};
