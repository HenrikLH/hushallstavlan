const assert=require('node:assert/strict');
// Generera veckosedel: knappen öppnar portionsplaneringen ifylld (storkok + varje kväll har mat), låsta rätter ligger kvar,
// Generera igen ger nya rätter, Skicka lägger veckan på veckosedeln
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(700)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 const vs=await read('weekTarget().vs');
 assert.equal(await pg.locator('[data-act="genVecka"]').first().textContent(),'Generera veckosedel');
 const lk=await pg.locator('.bq-lk.on').first().getAttribute('data-id').catch(()=>null)||await (async()=>{const id=await pg.locator('.bq-lk:not(.on)').first().getAttribute('data-id');await click('.bq-lk[data-id="'+id+'"]');return id})();
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('gv-0-knapp');
 const t0=Date.now();await click('[data-act="genVecka"]');console.log('genererad på',Date.now()-t0,'ms');
 assert.equal(await read('S.plan'),'port');assert.equal(await read('planState().vecka'),vs,'veckan som visas');
 const C=()=>read('(()=>{const C=portCalc();return{klar:C.klar,kassa:Math.round(C.kassa),B:C.B,dag:C.dag.map(x=>x.t).join(","),val:JSON.stringify(planState().val)}})()');
 const c1=await C();console.log(c1);assert(c1.klar,'veckan är klar att skicka');assert(c1.kassa<=c1.B,'inom budget');
 if(!/^macka:/.test(lk))assert(Object.values(JSON.parse(c1.val)).includes(lk),'låst rätt ligger kvar');
 await h.shot('gv-1-genererad');await pg.evaluate(()=>scrollTo(0,1400));await h.shot('gv-2-ned');
 // UI 5.0: ⇄ fäller ut raden, Välj byter rätten
 if(await read('U5')){const f=await read('planState().val.d4');await click('.g5-byt[data-id="d4"]');assert.equal(await pg.locator('.g5-r.open,.g5-k.open').count(),1);await click('.g5-alt[data-k="d4"],.g5-ka[data-k="d4"]');assert.notEqual(await read('planState().val.d4'),f,'Välj byter fredagens rätt')}
 await click('[data-act="genIgen"]');const c2=await C();console.log(c2);assert(c2.klar);assert.notEqual(c2.val,c1.val,'Generera igen ger annat');
 await pg.evaluate(()=>scrollTo(0,document.body.scrollHeight));await click('[data-act="portSend"]');
 assert.equal(await read('S.plan'),false);await h.waitFlush();await pg.reload();await h.idle(2000);
 const ids=await read('weekRows(weekTarget()).map(m=>m.recipe).filter(Boolean)');Object.values(JSON.parse(c2.val)).forEach(id=>assert(ids.includes(id),'skickad: '+id));
 assert.equal(await read('weekTarget().vs'),vs);
 console.log('PASS: Generera veckosedel');
};
