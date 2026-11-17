// Förslag 17/11: väggens Översikt i Skog A/B (LS vaggOv) och sidomenyn med fler mål (LS sidoNy=1). Inget spelar, maskiner av.
// LS='{"wall":"1","me":"","ovny":"h","haDemo":"1","vaggmeny":"vanster","sidoNy":"1","vaggOv":"A"}' T3DEMO=1 NOW=2026-10-18T12:10:00+02:00 VP=1368x912 node verktyg/emu/run.js verktyg/emu/vagg-forslag.js
module.exports=async(pg,h)=>{await h.idle(1800);const N=process.env.NAMN||'forslag';
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1500);
 await pg.evaluate(()=>window.__d('(haMedia().forEach(m=>m.st="off"),haData().apparater.forEach(a=>{a.st=a.typ==="robot"?"charging":"off";a.pct=null}),render(),1)'));await h.idle(800);
 const v=await pg.evaluate(()=>localStorage.getItem('ht.vaggOv'));
 if(v==='A'&&!await pg.locator('.ot-hk .ot-fk .ot-fr').count())throw new Error('ingen födelsedagsruta');
 if(v==='B'&&!await pg.locator('.ot-hus .ot-lgs .ot-lg').count())throw new Error('inget läge i Smart hem');
 const m=await pg.evaluate(()=>{const n=document.getElementById('nav'),b=n.getBoundingClientRect(),q=[...n.querySelectorAll('button,.nav-me')].map(e=>{const r=e.getBoundingClientRect();return(e.dataset.id||e.className)+':'+Math.round(r.top)+'-'+Math.round(r.bottom)});return{h:innerHeight,nav:q.join(' ')}});console.log('MENY',JSON.stringify(m));
 await h.shot(N);
 if(await pg.locator('#nav .nav-x').count()){await h.act('#nav [data-act="nav"][data-id="fod"]');await h.idle(1200);
  if(await pg.locator('#nav [data-id="fod"][aria-current="page"]').count()!==1)throw new Error('Födelsedagar markeras inte');await h.shot(N+'-fod');
  await h.act('#nav .nav-tog');await h.idle(800);await h.shot(N+'-ut')}
};
