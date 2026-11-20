// Lampor: ljusstyrkan får inte hoppa tillbaka (även om appen ritar om mitt i draget), och ordningen får inte ändras när man tänder en lampa.
// Kör: LS='{"haUrl":"http://ha.test"}' node verktyg/emu/run.js verktyg/emu/lampa-slider.js (telefon). POSTMS=1500 ger långsam lampa.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 let v=1;const L={'light.golv':{n:'Golvlampa',on:true,b:30},'light.tak':{n:'Taklampa',on:false,b:50},'light.hall':{n:'Hallen',on:false,b:60}},vant=[];
 const lamp=id=>Object.assign({id,t:'light',rum:'Vardagsrum',lagen:['brightness'],lage:'brightness'},L[id]);
 const bump=()=>{v++;vant.splice(0).forEach(f=>f())};
 await pg.route('http://ha.test/**',async r=>{const q=r.request();const ok=b=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(b)});
  if(q.method()==='POST'){const b=JSON.parse(q.postData()||'{}'),x=L[b.id];const PD=+(process.env.POSTMS||300);setTimeout(bump,50);await new Promise(z=>setTimeout(z,PD));
   // som en IKEA-lampa: övergången rapporteras i steg under en sekund
   if(x&&b.gor==='pa'&&b.b!=null){const b0=x.on?x.b:0;x.on=true;[[150,.3],[500,.7],[1000,1]].forEach(([t,f])=>setTimeout(()=>{x.b=Math.round(b0+(b.b-b0)*f);bump()},t))}
   else if(x&&b.gor==='vaxla'){setTimeout(()=>{x.on=!x.on;bump()},400)}
   else if(x&&b.gor==='av'){setTimeout(()=>{x.on=false;bump()},400)}
   return ok({ok:true,v})}
  const qv=+(new URL(q.url()).searchParams.get('v')||0);if(qv===v)await new Promise(z=>{vant.push(z);setTimeout(z,3000)});
  return ok({v,fel:null,lampor:Object.keys(L).map(lamp),scener:[],givare:[],apparater:[],media:[]})});
 await pg.evaluate(()=>__d('HA.retry=0,HA.fel=null,HA.nf=0'));
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(2500);
 await pg.locator('section.ha .wh').click();await h.idle(1200);
 const ord=()=>pg.locator('main .ha-t[data-id]').evaluateAll(a=>[...new Set(a.map(e=>e.dataset.id))]);
 const o0=await ord();console.log('Ordning:',o0.join(', '));
 // tänd lamporna en i taget: ordningen står still
 for(const id of ['light.hall','light.tak']){await pg.locator('main .ha-t[data-id="'+id+'"] .ha-i').first().click();await h.idle(1500);assert.deepEqual(await ord(),o0,'Ordningen står still när '+id+' tänds')}
 const prov=async(sel,drag,namn)=>{
  await pg.evaluate(sel=>{window.__s=[];window.__go=()=>{const t0=performance.now();const f=()=>{const e=document.querySelector(sel);window.__s.push([Math.round(performance.now()-t0),e?(e.classList.contains('ha-vs')?Math.round(e.querySelector('i').getBoundingClientRect().height/e.getBoundingClientRect().height*100):Math.round(parseFloat(getComputedStyle(e,'::before').width)/e.getBoundingClientRect().width*100)):null]);if(performance.now()-t0<4000)requestAnimationFrame(f)};f()}},sel);
  await pg.evaluate(()=>__go());const mal=await drag();await pg.waitForTimeout(3000);
  const s=(await pg.evaluate(()=>window.__s)).filter(x=>x[1]!=null),ut=s.filter((x,i)=>i&&x[1]<s[i-1][1]-2),sist=s[s.length-1][1];
  console.log(namn+': mål '+mal+' %, slut '+sist+' %, hopp bakåt',ut.length?JSON.stringify(ut.slice(0,8)):'inga');
  assert.equal(ut.length,0,namn+' hoppar inte tillbaka: '+JSON.stringify(s.filter((x,i)=>i%3==0).slice(0,40)));assert.ok(Math.abs(sist-mal)<=2,namn+' står kvar på '+mal+' (är '+sist+')')};
 // sidledsdrag på brickan
 const T='main .ha-t[data-id="light.golv"]';
 await prov(T,async()=>{const tb=await pg.locator(T).first().boundingBox(),y=tb.y+tb.height/2,x0=tb.x+tb.width*.3;await pg.mouse.move(x0,y);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(x0+i*tb.width*.05,y);await h.idle(16);if(i===5)await pg.evaluate(()=>__d('render()'))}
  const m=await pg.locator(T).first().evaluate(e=>Math.round(parseFloat(e.style.getPropertyValue('--p'))));await pg.mouse.up();return m},'Brickan');
 assert.deepEqual(await ord(),o0,'Ordningen står still efter ljusstyrka');
 await h.idle(1500);
 // lodräta reglaget i lampkortet
 await pg.locator(T+' .ha-n').first().click();await h.idle(1200);
 const V='form[data-form="haLampa"] .ha-vs';
 await prov(V,async()=>{const b=await pg.locator(V).boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height*.7;await pg.mouse.move(cx,cy);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(cx,cy-i*b.height*.02);await h.idle(16);if(i===5)await pg.evaluate(()=>__d('render()'))}
  const m=await pg.locator(V).evaluate(e=>Math.round(parseFloat(e.style.getPropertyValue('--p'))));await pg.mouse.up();return m},'Reglaget');
 await h.shot('lampa-slider');
};
