// Förloppscirklar (Henrik 28/11): hela städningen överst i tidslinjen, omgången runt stegets ikon, rummet som städas runt sitt nummer.
// LS='{"haDemo":"1","ovny":"h"}' THEME=dark node verktyg/emu/run.js verktyg/emu/robot-ringar.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=await pg.evaluate(()=>window.__d('wallBoardOn()'))==='true';
 if(!vagg){await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1500)}
 await pg.locator('.ha-ap[data-id="vacuum.dammsugare"]').first().click();await h.idle(1500);
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.map(r=>({id:r.id,n:r.n})))')));
 const id=n=>R.find(r=>r.n===n).id,V=id('Vardagsrum'),K=id('Kök'),B=id('Badrum');
 const T={[V+'|v|1']:[540,4],[K+'|v|1']:[300,3],[B+'|v|1']:[240,3],'resa|v':[70,3],'dock|v':[45,3]};
 const nu=JSON.parse(await pg.evaluate(()=>window.__d('Date.now()/1e3')));
 // köket klart, vardagsrummet pågår sedan 4 av 9 min, badrummet väntar; sedan moppning av köket
 await pg.evaluate(a=>window.__d('(()=>{const x=haAppX();x.st="segment_cleaning";x.tider='+JSON.stringify(a.T)+';S.haRobRum=[];x.plan={steg:[{typ:"damm",rum:['+a.K+','+a.V+','+a.B+']},{typ:"mopp",rum:['+a.K+']}],i:0,klara:[['+a.K+']],nu:'+a.V+',nuT:'+(a.nu-240)+',tid:'+(a.nu-600)+',start:'+(a.nu-600)+',hemma:false,klar:false,avbr:false};render()})()'),{T,V,K,B,nu});await h.idle(700);
 const fl=pg.locator('.ha-fl').first();
 const tot=await fl.locator('.ha-ftot').innerText();assert.match(tot,/\d+\s*%[\s\S]*Hela städningen[\s\S]*min kvar/,'Hela städningen: '+tot);
 const rp=await fl.locator('.ha-fo li.nu').getAttribute('style');assert.match(rp||'',/--rp:4[0-9]%/,'Vardagsrummet ≈ 44 %: '+rp);
 const sp=await fl.locator('.ha-fs.nu').getAttribute('style');assert.match(sp||'',/--p:\d+%/,'Omgångens ring');
 const ring=await fl.locator('.ha-fs.nu .ha-fi').evaluate(e=>getComputedStyle(e,'::after').backgroundImage);assert.match(ring,/conic-gradient/,'Ringen ritas');
 assert.doesNotMatch(await fl.innerHTML(),/undefined|NaN/,'Inget odefinierat');
 await pg.evaluate(()=>{const e=document.querySelector('.ha-fl');const s=e.closest('.rob-vy,main')||document.scrollingElement;e.scrollIntoView({block:'center'})});await h.idle(500);await h.shot('robot-ringar');
 // klar: ingen rad för hela städningen
 await pg.evaluate(()=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=Object.assign(x.plan,{i:2,klar:true,klarT:Date.now()/1e3});S.haFlUt=true;render()})()'));await h.idle(500);
 assert.equal(await pg.locator('.ha-ftot').count(),0,'Ingen totalrad när städningen är klar');
};
