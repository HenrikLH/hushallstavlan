// Förlopp och tidsestimat (Henrik 27/11): procenten räknas på tid (stora rum väger mer), tider lärs per rum × läge × gånger.
// LS='{"haDemo":"1","ovny":"h"}' node verktyg/emu/run.js verktyg/emu/robot-tid.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1500);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const R=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.map(r=>({id:r.id,n:r.n,m2:r.m2})))')));
 const id=n=>R.find(r=>r.n===n).id,V=id('Vardagsrum'),K=id('Kök'),H=id('Hall'),B=id('Badrum');
 // inlärda tider: vardagsrum 1x 9 min, 2x 17 min, hallen deep mop 6 min; badrum och kök gissas
 const T={[V+'|v|1']:[540,4],[V+'|v|2']:[1020,2],[H+'|v|1']:[240,3],[H+'|m|1|deep']:[360,2],'resa|v':[70,3],'dock|v':[45,3]};
 // förhandsvisning: tid per rum och omgång, totalen under Starta
 await pg.evaluate(a=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=null;x.tider='+JSON.stringify(a.T)+';S.haRobRum=['+a.V+','+a.H+','+a.B+'];S.haRobV={'+a.V+':"v",'+a.H+':"vm",'+a.B+':"v"};S.haRobX={'+a.V+':2};localStorage.setItem("ht.haRumRutt",JSON.stringify({'+a.H+':"deep"}));S.haLager="v";render()})()'),{T,V,H,B});await h.idle(600);
 const fh=await pg.locator('main .ha-fl.fh').innerText();
 assert.match(fh,/Vardagsrum[\s\S]*?17 min/,'Vardagsrum ×2 använder den inlärda tiden');
 assert.match(fh,/Hall[\s\S]*?\b4 min/,'Hallen dammsugs på 4 min');
 assert.match(fh,/ca \d+ min/,'Gissade tider har "ca"');
 const sub=await pg.locator('main .ha-bar .ha-bk small').innerText();assert.match(sub,/ca \d+ min/,'Totalen under Starta: '+sub);
 await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-fl.fh').getBoundingClientRect().top-140));await h.idle(400);await h.shot('robot-tid-1-forhand');
 // körning: köket (litet) klart och badrummet pågår halvvägs; vardagsrummet (stort) väntar. Förut: 1 av 3 rum = 33 %
 const nu=JSON.parse(await pg.evaluate(()=>window.__d('Date.now()/1e3'))),bs=JSON.parse(await pg.evaluate(a=>window.__d('haRumSek(haAppX(),'+a+',"damm",1).s'),B));
 await pg.evaluate(a=>window.__d('(()=>{const x=haAppX();x.st="segment_cleaning";x.pct=40;S.haRobRum=[];S.haRobV={};S.haRobX={};x.plan={steg:[{typ:"damm",rum:['+a.K+','+a.B+','+a.V+']}],i:0,klara:[['+a.K+']],nu:'+a.B+',nuT:'+(a.nu-a.bs/2)+',tid:'+(a.nu-600)+',start:'+(a.nu-600)+',hemma:false,klar:false,avbr:false};render()})()'),{K,B,V,nu,bs});await h.idle(600);
 const E=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(Object.assign(haRobEst(haAppX(),haAppX().plan),{pct:haRobPct(haAppX())}))')));
 const r=E.steg[0].rum,vant=Math.round(((r[K]+r[B]/2)/(r[K]+r[B]+r[V]))*100);
 assert.ok(Math.abs(E.pct-vant)<=2,'Procent efter tid: '+E.pct+' väntat ≈'+vant);
 assert.ok(E.pct<45,'Stora vardagsrummet väger mer: inte 1,5 av 3 rum = 50 % ('+E.pct+' %)');
 const st=await pg.locator('main .rob-hd p').innerText();assert.match(st,/Städar · \d+ % · \d+ min kvar/,'Rubriken: '+st);
 const fl=await pg.locator('main .ha-fl').innerText();assert.match(fl,/Rum 2 av 3 · \d+ min kvar/,'Omgången visar tid kvar');
 await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-fl').getBoundingClientRect().top-140));await h.idle(400);await h.shot('robot-tid-2-kor');
 // klar: hur lång tid det tog
 await pg.evaluate(a=>window.__d('(()=>{const x=haAppX();x.st="charging";x.plan=Object.assign(x.plan,{i:1,klar:true,klara:[['+a.K+','+a.B+','+a.V+']],klarT:'+a.nu+',start:'+(a.nu-1980)+'});S.haFlUt=false;render()})()'),{K,B,V,nu});await h.idle(500);
 assert.match(await pg.locator('main .ha-fk .ha-fkh').innerText(),/3 rum · 33 min/,'Sammanfattningen visar tiden');
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
};
