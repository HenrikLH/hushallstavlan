const assert=require('node:assert/strict');
// Ny veckosedel med bilder: A rutnät, B stora kort, C större rader. Skärmbild per läge, plus utfällt ⇄ med bildkarusell
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(700)};
 await click('[data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');await click('[data-act="genVecka"]');
 assert.equal(await read('S.plan'),'port');
 const lagen=(process.env.MBLAGE||'a,b,c').split(',');
 for(const m of lagen){await read("(MATBILD='"+m+"',S.planOpen=null,render(),1)");await h.idle(800);
  const y=await pg.evaluate(()=>{const e=[...document.querySelectorAll('.sh')].find(x=>/Lunchlådor/.test(x.textContent));return e?e.getBoundingClientRect().top+scrollY-110:0});
  await pg.evaluate(y=>scrollTo(0,y),y);await h.idle(400);await h.shot('mb-'+m);
  if(m!=='c')assert(await pg.locator('.g5-k').count()>=7,'kort i läge '+m);
  if(m==='a'||m==='b'){await read("(S.planOpen='d4',render(),1)");await h.idle(600);
   const y2=await pg.evaluate(()=>{const e=document.querySelector('.g5-k.open');return e?e.getBoundingClientRect().top+scrollY-110:0});await pg.evaluate(y=>scrollTo(0,y),y2);await h.idle(400);await h.shot('mb-'+m+'-byt');
   assert(await pg.locator('.g5-ka').count()>0,'andra förslag som bilder');
   const f=await read('planState().val.d4');await click('.g5-ka[data-k="d4"]');assert.notEqual(await read('planState().val.d4'),f,'Välj byter rätten')}
 }
 const bilder=await pg.evaluate(()=>[...document.querySelectorAll('.g5-ki img,.g5-th img')].map(i=>i.complete&&i.naturalWidth>0).filter(Boolean).length);
 console.log('laddade foton:',bilder);
 console.log('PASS: Matbilder');
};
