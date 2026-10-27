// Rutnummer: slår på Visa rutnummer via Inställningar, kontrollerar märken i varje flik och att tryck på märket kopierar.
// Kör: node verktyg/emu/run.js verktyg/emu/rutnummer.js   (LS='{"dev":"1","refs":"1"}' testar uppstart med brytaren redan på)
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const klick=async(sel)=>{const el=await pg.$(sel);if(!el)return fel('saknas: '+sel);await el.scrollIntoViewIfNeeded().catch(()=>{});await el.click();await h.idle(700)};
 const refs=()=>pg.evaluate(()=>[...document.querySelectorAll('[data-ref]')].filter(e=>e.offsetParent||getComputedStyle(e).position==='fixed').map(e=>e.dataset.ref+(e.querySelector(':scope>.refb')?'':'(utan märke)')));
 const pa=await pg.evaluate(()=>document.documentElement.classList.contains('refs'));
 if(!pa){await klick('[data-act="settings"]');
  if(!await pg.$('[data-act="refs"]')){await pg.evaluate(()=>{const d=document.querySelector('details[data-k="pref-avancerat"]');if(d)d.open=true});await h.idle(300);await klick('[data-act="dev"]');await pg.evaluate(()=>{const d=document.querySelector('details[data-k="pref-avancerat"]');if(d)d.open=true});await h.idle(300)}
  await klick('[data-act="refs"]');await h.shot('rutnr-installningar');await klick('[data-act="sheetClose"]')}
 const vyer=[['[data-act="nav"][data-id="oversikt"]','oversikt'],['[data-act="nav"][data-id="mat"]','mat'],['[data-act="matTab"][data-id="vecka"]','mat-vecka'],['[data-act="matTab"][data-id="inkop"]','mat-inkop'],['[data-act="matTab"][data-id="recept"]','mat-recept'],
  ['[data-act="nav"][data-id="uppgifter"]','uppgifter'],['[data-act="taskTab"][data-id="kalender"]','kalender'],['[data-act="nav"][data-id="stad"]','stad'],['[data-act="nav"][data-id="ekonomi"]','ekonomi'],['[data-act="nav"][data-id="oversikt"]','oversikt2'],['[data-act="nav"][data-id="vader"]','vader']];
 for(const [sel,n] of vyer){if(!await pg.$(sel)){console.log('hoppar över '+n);continue}await klick(sel);const r=await refs();console.log(n+': '+r.join(' '));
  if(!r.length)fel('inga rutnummer i '+n);if(r.some(x=>/utan/.test(x)))fel('märke saknas i '+n);await h.shot('rutnr-'+n)}
 await klick('[data-act="nav"][data-id="mat"]');await klick('[data-act="matTab"][data-id="vecka"]');
 await pg.evaluate(()=>{window.__kop='';try{navigator.clipboard.writeText=t=>{window.__kop=t;return Promise.resolve()}}catch(e){}});
 await pg.click('[data-ref="M2"]>.refb');await h.idle(400);const k=await pg.evaluate(()=>window.__kop);console.log('kopierat: '+k);if(!/^M2 Vardagar/.test(k))fel('kopieringen gav '+k);
 const vy=await pg.evaluate(()=>document.body.dataset.view+'/'+!!document.getElementById('overlay').children.length);if(vy!=='mat/false')fel('tryck på märket öppnade något: '+vy);
};
