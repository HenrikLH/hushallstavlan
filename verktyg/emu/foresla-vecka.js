const assert=require('node:assert/strict');
// Föreslå en ny vecka direkt på veckosedeln: samma vecka, låsta rätter ligger kvar, Ångra återställer, Spara skickar
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(700)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 const vs=await read('weekTarget().vs'),rader=()=>read('weekRows(weekTarget()).map(m=>m.title).sort().join("|")'),fore=await rader();
 const las=await read('[...weekLocks(weekTarget().vs)].filter(id=>!/^macka:/.test(id))');console.log('låsta',las);
 await h.shot('fv-0-fore');
 await click('[data-act="wkNy"]');
 assert.equal(await pg.locator('.wk-draft').count(),1,'förslagsraden syns');
 assert.equal(await read('S.wkDraft.vs'),vs,'samma vecka som veckosedeln');
 const ids=await read('weekRows(weekTarget()).map(m=>m.recipe).filter(Boolean)');las.forEach(id=>assert(ids.includes(id),'låst rätt kvar: '+id));
 const ny=await pg.locator('.bt-ny').count();console.log('nya brickor',ny,await pg.locator('.wd-t').textContent());assert(ny>0);
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('fv-1-forslag');
 await pg.evaluate(()=>scrollTo(0,700));await h.shot('fv-2-forslag-ned');
 await click('[data-act="wkNytt"]');assert.equal(await pg.locator('.wk-draft').count(),1);
 await click('[data-act="wkAngra"]');assert.equal(await pg.locator('.wk-draft').count(),0);assert.equal(await rader(),fore,'Ångra återställer');
 await click('[data-act="wkNy"]');const nya=await rader();const n0=h.posts?h.posts.length:0;
 await click('[data-act="wkSpara"]');assert.equal(await pg.locator('.wk-draft').count(),0);
 await h.waitFlush();await pg.reload();await h.idle(2000);
 assert.equal(await read('weekTarget().vs'),vs);assert.equal(await rader(),nya,'sparad vecka finns kvar efter omladdning');
 console.log('PASS: förslaget på veckosedeln, Ångra och Spara');
};
