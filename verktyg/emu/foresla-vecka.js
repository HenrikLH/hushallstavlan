const assert=require('node:assert/strict');
// Föreslå en ny vecka (Experimentellt): fyra förslag i ett blad, Blanda ger fyra nya, Välj sparar veckan
// Kräver experimentet: LS='{"dev":"1","expVecka":"1"}' (sätts i scenariot om det saknas)
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(700)};
 if(!(await read('expVecka()'))){await pg.evaluate(()=>{localStorage.setItem('ht.dev','1');localStorage.setItem('ht.expVecka','1')});await pg.reload();await h.idle(1800)}
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 const vs=await read('weekTarget().vs'),rader=()=>read('weekRows(weekTarget()).map(m=>m.title).sort().join("|")');
 // Lås en rätt så att den ska finnas i alla förslag
 const lk=await pg.locator('.bq-lk:not(.on)').first().getAttribute('data-id');await click('.bq-lk[data-id="'+lk+'"]');
 const t0=Date.now();await click('[data-act="wkNy"]');await pg.locator('.sheet .wa-k').first().waitFor();console.log('fyra förslag på',Date.now()-t0,'ms');
 assert.equal(await pg.locator('.sheet .wa-k').count(),4,'fyra förslag');
 assert.equal(await read('S.wkAlts.vs'),vs,'samma vecka som veckosedeln');
 assert.equal(await read('S.wkAlts.list.every(a=>a.rows.some(m=>m.recipe==='+JSON.stringify(lk)+'))'),true,'låst rätt i alla förslag');
 const ids=()=>read('S.wkAlts.list.map(a=>a.ids.join(",")).join("/")'),f1=await ids();
 assert.equal(new Set(f1.split('/')).size,4,'fyra olika förslag');
 await h.shot('fv-1-fyra');
 await click('.sheet [data-act="wkBlanda"]');assert.equal(await pg.locator('.sheet .wa-k').count(),4);assert.notEqual(await ids(),f1,'Blanda ger nya');
 const val=await read('S.wkAlts.list[1].rows.map(m=>m.title).sort().join("|")');
 await click('.sheet [data-act="wkVal"][data-id="1"]');assert.equal(await pg.locator('.sheet .wa-k').count(),0);assert.equal(await rader(),val,'valt förslag på veckosedeln');
 await h.waitFlush();await pg.reload();await h.idle(2000);
 assert.equal(await read('weekTarget().vs'),vs);assert.equal(await rader(),val,'sparad vecka finns kvar efter omladdning');
 await h.shot('fv-2-vald');
 console.log('PASS: fyra förslag, Blanda och Välj');
};
