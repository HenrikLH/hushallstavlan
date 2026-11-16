// Fördröjd start av dammsugaren: klockknappen öppnar timervredet med 3/5/10 min, nedräkning med Avbryt i bladet och i Smart hem-rutan.
// LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-fordrojd.js   (väggen: + "wall":"1","me":"" och VP=1368x912)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const wall=process.env.LS.includes('"wall"');
 await pg.locator('#nav [data-id="hemmet"]').click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.slice(0,2).map(r=>r.id))')));
 await pg.evaluate(R=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=null;x.vantar=0;S.haRobRum=['+R+'];S.haRobV={'+R[0]+':"vm",'+R[1]+':"v"};render()})()'),R);await h.idle(600);
 const k=pg.locator('main .ha-bar .ha-om');assert.equal(await k.count(),1,'Klockknappen syns bredvid Starta');
 await k.click();await h.idle(900);
 assert.equal(await pg.locator('.tm-sv button').count(),3,'Tre snabbval');
 await pg.locator('.tm-sv button[data-d="10"]').click();await h.idle(300);
 assert.match(await pg.locator('.tm-go b').innerText(),/10/,'Snabbvalet ställer vredet');
 await pg.locator('.tm-sv button[data-d="5"]').click();await h.idle(300);
 await h.shot(wall?'vred-vagg':'vred');
 await pg.locator('.tm-go').click();await h.idle(1200);
 assert.equal(await pg.evaluate(()=>window.__d('haAppX().st')),'charging','Startar inte direkt');
 const v=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(Object.assign({kvar:haAppX().vantar.t-Date.now()/1e3},haAppX().vantar))')));
 assert.ok(v.kvar>240&&v.kvar<=300&&v.n===300,'Väntar fem minuter');
 assert.match(await pg.locator('main .ha-omn').innerText(),/Startar om 4:5\d|Startar om 5:00/,'Nedräkningen syns i bladet');
 await h.shot(wall?'nedrakning-vagg':'nedrakning');
 if(!wall){await pg.evaluate(()=>scrollTo(0,0));await h.idle(400)}
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(1500);
 const hus=pg.locator('main .ot-hus');assert.match(await hus.innerText(),/Dammsugaren om \d:\d\d/,'Nedräkningen syns i Smart hem');
 await hus.scrollIntoViewIfNeeded();await h.shot(wall?'smart-hem-vagg':'smart-hem');
 await hus.locator('.ot-ntk[data-act="haRobOmStopp"]').click();await h.idle(800);
 assert.equal(await pg.evaluate(()=>window.__d('haApps().find(a=>a.typ==="robot").vantar')),0,'Avbryt tar bort väntan');
};
