// Väderbildens delar (svg.bd, .fig-box, .skyfx) behålls när sidan ritas om likadant, och byts när scenen ändras. Kör: LS='{"wxart":"geo","wxvy":"bild"}' node verktyg/emu/run.js verktyg/emu/vader-behall.js (även väggläge)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(400);
 const views=(await read('S.wall'))?['oversikt']:['oversikt','vader'];
 for(const view of views){
  if(view==='vader'){await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(400)}
  const n=await read(`document.querySelectorAll('svg.bd,.fig-box').length`);
  await read(`document.querySelectorAll('svg.bd,.fig-box,.skyfx').forEach(e=>e.__mark=1);render()`);await h.idle(600);
  const kept=await read(`[...document.querySelectorAll('svg.bd,.fig-box,.skyfx')].map(e=>!!e.__mark)`);
  const gl=await read(`document.querySelectorAll('.gl').length`);
  console.log(view,'gs',n,'kept',JSON.stringify(kept),'gl',gl);
  assert(kept.length&&kept.every(Boolean),'bilden behålls');
  await read(`S.wxVar=S.wxVar==='b'?'a':'b';render()`);await h.idle(600);
  const k2=await read(`[...document.querySelectorAll('.fig-box')].map(e=>!!e.__mark)`);console.log('efter byte',JSON.stringify(k2));
  assert(k2.some(x=>!x),'ny scen ritas');
  await read(`S.wxVar=null;render()`);await h.idle(400);
 }
 const gl2=await read(`document.querySelectorAll('.gl').length`);console.log('gl slut',gl2);
};
