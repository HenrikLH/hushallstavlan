// Hemmet i 3D (utvecklarläge) ur dammsugarens låtsaskarta. LS='{"haDemo":"1","dev":"1"}' node verktyg/emu/run.js verktyg/emu/hem3d.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await h.idle(1500);for(let i=0;i<3&&await pg.evaluate(()=>document.body.dataset.view)!=='hemmet';i++){await h.act('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900)}
 await h.act('main [data-act="nav"][data-id="hem3d"]');await h.idle(1500);
 const c=pg.locator('main .h3d canvas');assert.equal(await c.count(),1,'Canvas finns');
 assert.ok(await pg.locator('main .h3d-p').count()>=5,'Enheter utplacerade');
 assert.ok(await pg.evaluate(()=>window.__d('H3.m.namn.length'))>=4,'Rumsnamn på golvet');
 const fylld=await c.evaluate(e=>{const d=e.getContext('2d').getImageData(0,0,e.width,e.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i])n++;return n});
 assert.ok(fylld>2000,'Modellen är ritad ('+fylld+')');
 await h.shot('hem3d-1');
 // vrid
 const b=await c.boundingBox();await pg.mouse.move(b.x+b.width*.3,b.y+b.height*.3);await pg.mouse.down();await pg.mouse.move(b.x+b.width*.55,b.y+b.height*.25,{steps:8});await pg.mouse.up();await h.idle(300);
 await h.shot('hem3d-vriden');
 await pg.locator('main [data-act="h3dTopp"]').click();await h.idle(900);
 assert.equal(await pg.locator('main [data-act="h3dTopp"]').getAttribute('aria-pressed'),'true','Ovanifrån på');
 await h.shot('hem3d-ovanifran');
 // flytta en enhet
 await pg.locator('main [data-act="h3dFlytta"]').click();await h.idle(400);
 const p=pg.locator('main .h3d-p').first(),id=await p.getAttribute('data-id'),pb=await p.boundingBox();
 await pg.mouse.move(pb.x+pb.width/2,pb.y+10);await pg.mouse.down();await pg.mouse.move(pb.x+pb.width/2+60,pb.y+50,{steps:6});await pg.mouse.up();await h.idle(600);
 const sp=await pg.evaluate(i=>window.__d('JSON.stringify((h3dGet().p||{})["'+i+'"]||null)'),id);
 assert.notEqual(sp,'null','Platsen sparad');
 await pg.locator('main [data-act="h3dFlytta"]').click();await h.idle(400);
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
