// Inställningar: varje del öppnas och mellanrummen mellan rutor mäts. Larmar när två rutor går ihop (mindre än 8 px).
// SHOT=1 sparar en bild per del. HJ=1 fäller ut alla förklaringar först.
module.exports=async(pg,h)=>{
 const open=async()=>{if(!await pg.locator('form[data-form="settings"]').isVisible()){await pg.locator('[data-act="settings"]').first().click();await h.idle(600)}};
 await open();
 const mat=()=>pg.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const box=e=>{const s=getComputedStyle(e);return(s.backgroundColor!=='rgba(0, 0, 0, 0)'&&s.backgroundColor!=='transparent')||parseFloat(s.borderTopWidth)>0||s.boxShadow!=='none'};
  const nm=e=>e.tagName.toLowerCase()+'.'+[...e.classList].join('.')+(e.dataset.k?'['+e.dataset.k+']':'')+' "'+(e.textContent||'').trim().slice(0,28)+'"';
  const out=[];const body=document.querySelector('#overlay .sheet-body');
  const scan=p=>{const k=[...p.children].filter(vis);for(let i=1;i<k.length;i++){const a=k[i-1],b=k[i];if(!(box(a)&&box(b)))continue;const g=Math.round(b.getBoundingClientRect().top-a.getBoundingClientRect().bottom);if(g<8)out.push(g+'px  '+nm(a)+'  →  '+nm(b))}};
  body.querySelectorAll('.pref-body,form,.sheet-body,.sheet-body>*').forEach(scan);body.querySelectorAll('.pref-section[open] .segc button').forEach(b=>{if(b.scrollWidth>b.clientWidth+1)out.push('klipps: '+b.textContent)});return out});
 const all=[];const hj=async()=>{if(!process.env.HJ)return;const q=pg.locator('#overlay .pref-section[open] .sh-hj:not(.open)');for(let i=0;i<12&&await q.count();i++){await q.first().click();await h.idle(150)}};
 all.push(['lista',await mat()]);if(process.env.SHOT)await h.shot('inst-lista');
 for(const k of await pg.locator('.pref-section').evaluateAll(a=>a.map(x=>x.dataset.k.slice(5)))){
  await pg.locator('[data-k="pref-'+k+'"]>summary').click();await h.idle(500);await hj();
  all.push([k,await mat()]);
  if(process.env.SHOT){const hgt=await pg.evaluate(()=>{const b=document.querySelector('#overlay .sheet-body');return b.scrollHeight});await h.shot('inst-'+k);
   if(process.env.LONG){await pg.evaluate(()=>{const b=document.querySelector('#overlay .sheet-body');b.scrollTop=b.scrollHeight});await h.idle(200);await h.shot('inst-'+k+'-ned')}}
  if(await pg.locator('.pref-bk').isVisible())await pg.locator('.pref-bk').click();else await pg.locator('[data-k="pref-'+k+'"]>summary').click();await h.idle(400)}
 let n=0;for(const[k,l]of all){if(l.length){n+=l.length;console.log('== '+k);l.forEach(x=>console.log('  '+x))}}
 console.log(n?'HOPSATT '+n:'PASS installningar-luft: inga rutor går ihop');
};
