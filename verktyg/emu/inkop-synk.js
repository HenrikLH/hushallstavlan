// Två enheter (Henrik och Cornelia) mot samma låtsaskalkylark: ändringar i Inköp ska synas på båda
module.exports=async(pg,h)=>{
 const ctxA=pg.context(),b=ctxA.browser();
 const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Stockholm',locale:'sv-SE'});
 await ctx.addInitScript(()=>{const now=new Date('2026-10-18T16:50:00+02:00').getTime(),D0=Date,off=now-D0.now();
  class FD extends D0{constructor(...a){super(...(a.length?a:[D0.now()+off]))}static now(){return D0.now()+off}};window.Date=FD;
  if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');const s=(k,v)=>localStorage.setItem('ht.'+k,v);s('key','x');s('me','Cornelia');s('view','mat');s('matTab','inkop');s('wall','0')}
  navigator.serviceWorker&&(navigator.serviceWorker.register=()=>Promise.reject())});
 await ctx.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('script.google.com')){const m=r.request().method(),body=r.request().postData()||'',q=Object.fromEntries(new URL(u).searchParams);const out=h.gas.handle(m,body,q);if(m==='POST'){const j=JSON.parse(body),o=JSON.parse(out);console.log('  B POST',j.action,j.id||'',o.ok?'ok':'ERR '+o.error)}return r.fulfill({contentType:'application/json',body:out})}
  if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 const pb=await ctx.newPage();pb.on('pageerror',e=>console.log('PAGEERROR B',e.message));
 await pb.goto(pg.url());await pb.waitForTimeout(2500);
 const names=async p=>JSON.parse(await p.evaluate(()=>window.__d('JSON.stringify(D().shop.map(x=>x.name+(x.done?" ✓":"")))')));
 const refresh=async p=>{await p.evaluate(()=>window.__d('refresh(true)'));await p.waitForTimeout(800)};
 const wait=async p=>{for(let i=0;i<40;i++){if(!await p.evaluate(()=>localStorage.getItem('ht.outbox')))return;await p.waitForTimeout(300)}console.log('utkorgen töms inte')};
 const add=async(p,n)=>{await p.click('[data-act=shopAdd]');await p.waitForTimeout(300);await p.fill('#shop-name',n);await p.press('#shop-name','Enter');await p.waitForTimeout(400);await p.evaluate(()=>window.__d('closeSheets();render()'));await wait(p)};
 const ok=(c,m)=>{console.log((c?'OK   ':'FEL  ')+m);if(!c)h.fail=(h.fail||0)+1};
 await pg.evaluate(()=>window.__d('ACT.nav("mat");S.matTab="inkop";render()'));await pg.waitForTimeout(600);
 // 1. A lägger till en vara
 await add(pg,'Testvara A');
 await refresh(pb);ok((await names(pb)).includes('Testvara A'),'B ser varan som A lade till');
 // 2. B bockar av den
 await pb.evaluate(()=>window.__d('ACT.shopToggle(D().shop.find(x=>x.name==="Testvara A").id)'));await pb.waitForTimeout(900);await wait(pb);
 await refresh(pg);ok((await names(pg)).includes('Testvara A ✓'),'A ser bocken som B satte: '+await names(pg));
 // 3. B bockar av en vara som A precis lagt till (A:s tillfälliga id)
 await add(pg,'Testvara B');await refresh(pb);
 await pb.evaluate(()=>window.__d('ACT.shopToggle(D().shop.find(x=>x.name==="Testvara B").id)'));await pb.waitForTimeout(900);await wait(pb);
 await refresh(pg);ok((await names(pg)).includes('Testvara B ✓'),'A ser bock 2');
 // 4. A hämtar veckans varor, båda ser samma lista
 await pg.evaluate(()=>window.__d('shopImport(true)'));await pg.waitForTimeout(600);await wait(pg);await refresh(pb);
 ok(JSON.stringify(await names(pg))===JSON.stringify(await names(pb)),'samma lista efter Uppdatera varor');
 // 5. B bockar av Potatis och lägger till och bockar av Kaffe. A har inte hämtat om och ändrar veckan (låser upp ärtsoppan)
 await pb.evaluate(()=>window.__d('ACT.shopToggle(D().shop.find(x=>x.name==="Potatis").id)'));await pb.waitForTimeout(900);await wait(pb);
 await add(pb,'Kaffe');await refresh(pb);await pb.evaluate(()=>window.__d('ACT.shopToggle(D().shop.find(x=>x.name==="Kaffe").id)'));await pb.waitForTimeout(900);await wait(pb);
 await pg.evaluate(()=>window.__d('updJSON("onskelista",[],a=>a.map(o=>o&&o.las?Object.assign({},o,{ids:o.ids.filter(i=>i!=="insp-sk-artsoppa")}):o));shopImport(true)'));await pg.waitForTimeout(800);await wait(pg);
 await refresh(pg);await refresh(pb);let na=await names(pg);
 ok(na.includes('Potatis ✓'),'Potatis är fortfarande avbockad efter att A ändrat veckan');
 ok(na.includes('Kaffe ✓'),'Kaffe (egen, avbockad) finns kvar efter att A ändrat veckan');
 // 6. A ändrar veckan igen (låser upp linsgratängen) medan B har den gamla listan; B bockar av Bulgur med sitt gamla id (platsen i listan har ändrats)
 await pg.evaluate(()=>window.__d('updJSON("onskelista",[],a=>a.map(o=>o&&o.las?Object.assign({},o,{ids:o.ids.filter(i=>i!=="insp-rotfruktsgratang-linser")}):o));shopImport(true)'));await pg.waitForTimeout(800);await wait(pg);
 await pb.evaluate(()=>window.__d('ACT.shopToggle(D().shop.find(x=>x.name==="Bulgur").id)'));await pb.waitForTimeout(900);await wait(pb);
 await refresh(pg);await refresh(pb);na=await names(pg);
 ok(na.includes('Bulgur ✓'),'Bulgur avbockad hos A: '+na.join(', '));
 ok(na.filter(x=>/✓$/.test(x)&&!/^(Testvara|Potatis|Kaffe|Bulgur)/.test(x)).length===0,'ingen annan vara blev avbockad: '+na.filter(x=>/✓$/.test(x)).join(', '));
 ok(JSON.stringify(na)===JSON.stringify(await names(pb)),'A och B ser samma lista');
 console.log('A',await names(pg));console.log('B',await names(pb));
 if(h.fail)throw new Error(h.fail+' fel');
 await ctx.close()};
