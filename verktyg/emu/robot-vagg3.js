// Väggens dammsugarvy i tre delar: kartan överst och dockan underst till vänster, val och Starta till höger. Telefonen behåller Karta | Dockan.
// LS='{"haDemo":"1","ovny":"h","wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/robot-vagg3.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const wall=process.env.LS.includes('"wall"');
 await pg.locator('#nav [data-id="hemmet"]').click();await h.idle(1200);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 await pg.evaluate(()=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=null;render()})()'));await h.idle(800);
 if(!wall){assert.equal(await pg.locator('main .ha-kseg').count(),1,'Telefonen har Karta | Dockan');return}
 assert.equal(await pg.locator('main .ha-kseg').count(),0,'Inget val på väggen');
 const r=await pg.evaluate(()=>{const b=s=>{const e=document.querySelector('main '+s);if(!e)return null;const q=e.getBoundingClientRect();return{x:q.x,y:q.y,w:q.width,h:q.height}};return{m:b('.rob-km'),d:b('.rob-kd'),r:b('.rob-r'),kw:b('.rob-km .ha-kw'),vw:innerWidth}});
 console.log(JSON.stringify(r));
 assert.ok(r.m&&r.d&&r.d.y>r.m.y+r.m.h-2,'Dockan under kartan');
 assert.ok(r.r.x>r.vw/2-20,'Valen i högra halvan');
 assert.ok(r.kw.h>150&&r.kw.y>=r.m.y,'Kartan syns i sin del');
 await h.shot('vagg3');
};
