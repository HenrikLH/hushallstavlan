const assert=require('node:assert/strict');
// Tryck på en tom plats i veckan: förslag som kort att svepa mellan (bara platsens del av veckan, bäst först) och alla rätter i poängordning
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
 for(const g of ['Vardag','Helg','Storkok']){
  await pg.locator('.bq.e[data-act="slotPick"][data-id="'+g+'"]').first().evaluate(el=>el.scrollIntoView({block:'center'}));
  await click('.bq.e[data-act="slotPick"][data-id="'+g+'"]');assert.equal(await read('S.sheet'),'slot');
  const kort=await pg.locator('#overlay .car-s:not([aria-hidden]) .car-v').evaluateAll(b=>b.map(x=>x.dataset.id));
  const rader=await pg.locator('#overlay .sw-row[data-id]:not([data-id="macka"])').evaluateAll(b=>b.map(x=>x.dataset.id));
  assert(kort.length>=1&&kort.length<=5,g+': '+kort.length+' kort');
  assert.deepEqual(kort,rader.slice(0,kort.length),g+': korten är de bästa i listan, i samma ordning');
  const fel=await read('['+rader.map(id=>JSON.stringify(id)).join(',')+'].map(recipeById).filter(r=>'+(g==='Storkok'?'!isStorkok(r)':'isStorkok(r)||r.group&&r.group!=='+JSON.stringify(g))+').map(r=>r.title)');
  assert.deepEqual(fel,[],g+': bara rätter för platsen');
  console.log(g+': '+kort.length+' kort, '+rader.length+' i listan');
  await h.shot('tom-'+g.toLowerCase());
  if(g==='Vardag'){await pg.evaluate(()=>{const b=document.querySelector('#overlay .sheet-body'),s=[...b.querySelectorAll('.sh')].pop();b.scrollTop=s.offsetTop-b.offsetTop-8});await h.idle(300);await h.shot('tom-vardag-lista');await pg.evaluate(()=>document.querySelector('#overlay .sheet-body').scrollTop=0);await h.idle(300)}
  if(g==='Vardag'){
   // Svep till nästa kort
   const car=pg.locator('#overlay .car.loop'),b=await car.boundingBox();
   await pg.mouse.move(b.x+b.width*.8,b.y+80);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(b.x+b.width*(.8-.08*i),b.y+80);await pg.mouse.up();await h.idle(600);
   assert.equal(await car.getAttribute('data-i'),'2');await h.shot('tom-vardag-svep');
   // Sök döljer korten
   if(await pg.locator('#sw-q').count()){await pg.fill('#sw-q','zzz');assert.equal(await pg.locator('#overlay .pk-car').isHidden(),true);await pg.fill('#sw-q','');}
   // Välj på kortet lägger till rätten
   const id=await pg.locator('#overlay .car-s:not([aria-hidden]) .car-v').nth(1).getAttribute('data-id');
   await click('#overlay .car-s:not([aria-hidden]) .car-v[data-id="'+id+'"]');
   assert.equal(await read('S.sheet'),null);assert.equal(await read('D().menu.some(x=>x.recipe==='+JSON.stringify(id)+')'),true);
  }else await click('.sheet [data-act="sheetClose"]');
 }
 console.log('PASS: tom plats visar kort (bäst först, bara platsens typ) och hela listan i poängordning; svep och Välj fungerar.');
};
