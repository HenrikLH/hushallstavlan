// Smart hem-rutan när väggdatorns tjänst tappar svaret: ett enstaka avbrott visar inget fel, två i rad visar en orange prick (inte ett streck) efter "N tända".
// Kör: LS='{"haUrl":"http://ha.test"}' node verktyg/emu/run.js verktyg/emu/smart-hem-fel.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 let n=0,lage='ok';const data=v=>JSON.stringify({v,fel:null,lampor:[{id:'light.kok',n:'Köket',t:'light',on:true,b:80},{id:'light.sov',n:'Sovrummet',t:'light',on:true,b:40},{id:'switch.kaffe',n:'Kaffe',t:'switch',on:false}],scener:[],givare:[],apparater:[],media:[]});
 await pg.route('http://ha.test/**',async r=>{n++;if(lage==='bryt')return r.abort('failed');if(n>1)await new Promise(x=>setTimeout(x,1500));return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:data(n)})});
 await pg.evaluate(()=>__d('HA.retry=0,HA.fel=null,HA.nf=0'));
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();
 await h.idle(4000);console.log('N',n,await pg.evaluate(()=>__d('JSON.stringify([!!HA.d,HA.fel,haUrl()])')));await h.idle(500);
 const fel=()=>pg.locator('section.ha .ha-live').count();
 assert.equal(await fel(),0,'Inget fel när tjänsten svarar');
 lage='bryt';await pg.waitForFunction(()=>__d('HA.nf')>=1,null,{timeout:15000});await h.idle(300);
 assert.equal(await fel(),0,'Ett enstaka avbrott visar inget fel');
 await pg.waitForFunction(()=>__d('HA.nf')>=2,null,{timeout:15000});await h.idle(300);
 assert.equal(await fel(),1,'Två avbrott i rad visar felpricken');
 const box=pg.locator('section.ha');await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(300);await h.shot('smart-hem-fel');
 const bb=await pg.locator('section.ha .ha-live').boundingBox();console.log('PRICK',bb.width,bb.height);
 assert.ok(Math.abs(bb.width-7)<1&&Math.abs(bb.height-7)<1,'Pricken är en rund prick, 7×7');
 lage='ok';await pg.evaluate(()=>__d('HA.retry=0'));await pg.waitForFunction(()=>!document.querySelector('section.ha .ha-live'),null,{timeout:20000});
 console.log('Felpricken försvinner när tjänsten svarar igen');
};
