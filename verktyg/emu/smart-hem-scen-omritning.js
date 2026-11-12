// En scen tänder lamporna en i taget och väggdatorn läser av Home Assistant en gång i sekunden, så scenen kommer i flera svar.
// Smart hem-rutan ska ändå bara rita om en gång: från "allt släckt" direkt till "4 tända", utan 1, 2, 3 däremellan.
// Gäller Home Assistant-scen, egen scen och Släck allt.
// Kör: LS='{"haUrl":"http://ha.test"}' node verktyg/emu/run.js verktyg/emu/smart-hem-scen-omritning.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const ID=['light.kok','light.sov','light.golv','light.hall'],on={};ID.forEach(i=>on[i]=false);let v=1,vant=[];
 const bump=()=>{v++;vant.splice(0).forEach(f=>f())};
 const svar=()=>({v,fel:null,lampor:ID.map(id=>({id,n:id.slice(6),t:'light',on:on[id],b:on[id]?60:null,lagen:['brightness']})),scener:[{id:'scene.kvall',n:'Kväll'}],givare:[],apparater:[],media:[]});
 // som Home Assistant: varje lampa rapporterar för sig, drygt en sekund isär
 const serie=(ids,val)=>ids.forEach((id,i)=>setTimeout(()=>{on[id]=val;bump()},700+i*1100));
 await pg.route('http://ha.test/**',async r=>{const q=r.request();const ok=b=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(b)});
  if(q.method()==='POST'){const b=JSON.parse(q.postData()||'{}');if(b.scen||b.id==null&&!b.alla)serie(ID,true);else if(b.alla==='av')serie(ID,false);else if(b.id)serie([b.id],b.gor!=='av');await new Promise(x=>setTimeout(x,200));return ok({ok:true,v})}
  const m=/[?&]v=(\d+)/.exec(q.url());if(m&&+m[1]===v)await new Promise(x=>{vant.push(x);setTimeout(x,25000)});return ok(svar())});
 await pg.evaluate(()=>__d('HA.retry=0,HA.fel=null,HA.nf=0'));
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(2500);
 const status=()=>pg.locator('section.ha .wk-mo').first().innerText();
 assert.equal(await status(),'allt släckt','Start: allt släckt');
 const folj=async(ms)=>{const sett=[];const t=Date.now();while(Date.now()-t<ms){const s=await status();if(sett[sett.length-1]!==s)sett.push(s);await pg.waitForTimeout(40)}return sett};
 // 1. Home Assistant-scen från appen
 await pg.evaluate(()=>__d("ACT.haScen('scene.kvall')"));
 let s=await folj(7500);console.log('HA-scen:',s.join(' → '));assert.deepEqual(s,['allt släckt','4 tända'],'HA-scen ritas om en gång');
 // 2. Släck allt
 await pg.evaluate(()=>__d("ACT.haScen('av')"));
 s=await folj(7500);console.log('Släck allt:',s.join(' → '));assert.deepEqual(s,['allt släckt'],'Släck allt: direkt släckt, tänds inte tillbaka');
 // 3. egen scen (ögonblicksbild av lamporna)
 await pg.evaluate(ids=>__d("habKor(0,{l:"+JSON.stringify(Object.fromEntries(ids.map(i=>[i,{on:true,b:60}])))+"})"),ID);
 const lyss=[];for(const id of ID)lyss.push(id);
 s=await folj(7500);console.log('Egen scen:',s.join(' → '));assert.deepEqual(s,['4 tända'],'Egen scen: direkt 4 tända, inget mellanläge');
 // 4. en enstaka ändring utifrån syns ändå inom ett par sekunder
 const t0=Date.now();on['light.kok']=false;bump();await pg.waitForFunction(()=>/3 tända/.test(document.querySelector('section.ha .wk-mo').innerText),null,{timeout:4000});
 console.log('Enstaka ändring utifrån syns efter',Date.now()-t0,'ms');
};
