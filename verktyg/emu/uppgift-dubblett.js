// Svaret på ett tillägg kommer aldrig fram (appen stängs, nätet faller) fast arket sparade det. Uppgiften och varan ska inte bli dubbletter.
// Kör även med NOCACHE=1 (Kod.gs utan rid-skydd, som innan Henrik klistrat in den nya): då ska appens kontroll räcka
module.exports=async(pg,h)=>{
 let tappa=0;
 await pg.route('**/*',async r=>{const u=r.request().url();
  if(!u.includes('script.google.com'))return r.fallback();
  const m=r.request().method(),body=r.request().postData()||'',q=Object.fromEntries(new URL(u).searchParams);
  const out=h.gas.handle(m,body,q);if(m==='POST'){const j=JSON.parse(body);console.log('  POST',j.action,j.rid||'',tappa?'(svaret tappas)':'')
   if(tappa&&/Add$/.test(j.action)){tappa--;return r.abort()}}
  return r.fulfill({contentType:'application/json',body:out})});
 const ok=(c,m)=>{console.log((c?'OK   ':'FEL  ')+m);if(!c)throw new Error(m)};
 const wait=async()=>{for(let i=0;i<120;i++){if(!await pg.evaluate(()=>localStorage.getItem('ht.outbox')))return;await pg.waitForTimeout(500)}throw new Error('utkorgen töms inte')};
 const antal=async(lista,k,v)=>{await pg.evaluate(()=>window.__d('refresh(true)'));await pg.waitForTimeout(800);return pg.evaluate(([l,k,v])=>window.__d('D().'+l+'.filter(x=>x.'+k+'==='+JSON.stringify(v)+').length'),[lista,k,v])};
 // Uppgift: tre tappade svar i rad ska ändå ge en enda rad
 tappa=3;await pg.evaluate(()=>window.__d('D().tasks.push({id:"tmp1",done:false,title:"Be om behörighet",due:"",who:"",note:"",source:"egen",repeat:""});apiPost({action:"taskAdd",title:"Be om behörighet",due:"",who:"",repeat:""})'));
 for(let i=0;i<3;i++){await pg.waitForTimeout(500);await pg.evaluate(()=>window.__d('flush()'))}
 await wait();ok(await antal('tasks','title','Be om behörighet')===1,'uppgiften finns en gång');
 // Samma namn igen med flit ska bli två
 tappa=1;await pg.evaluate(()=>window.__d('D().tasks.push({id:"tmp2",done:false,title:"Be om behörighet",due:"",who:"",note:"",source:"egen",repeat:""});apiPost({action:"taskAdd",title:"Be om behörighet",due:"",who:"",repeat:""})'));
 await pg.waitForTimeout(500);await pg.evaluate(()=>window.__d('flush()'));await wait();
 ok(await antal('tasks','title','Be om behörighet')===2,'en andra med samma namn läggs till');
 // Vara i Inköp
 tappa=2;await pg.evaluate(()=>window.__d('apiPost({action:"shopAdd",name:"Testvara",qty:"",cat:"Övrigt",price:""})'));
 for(let i=0;i<2;i++){await pg.waitForTimeout(500);await pg.evaluate(()=>window.__d('flush()'))}
 await wait();ok(await antal('shop','name','Testvara')===1,'varan finns en gång');
};
