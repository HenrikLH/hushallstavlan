const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 const strip=pg.locator('.bwx-h').first();assert(await strip.count());
 const nd=strip.locator('.nd').first();assert(await nd.count());assert.match(await nd.locator('.fn').textContent(),/\S+ 00$/);
 assert.equal(await nd.evaluate(x=>getComputedStyle(x).backgroundColor),'rgba(0, 0, 0, 0)');assert(Math.abs(await nd.evaluate(x=>parseFloat(getComputedStyle(x,'::before').width))-1)<.1);
 await strip.evaluate(x=>x.scrollLeft=x.querySelector('.nd').offsetLeft-x.offsetLeft-130);assert(await strip.evaluate(x=>x.scrollLeft>0));await h.shot('dygnsskifte');
 await nd.click();await h.idle(600);assert.equal(await pg.evaluate(()=>window.__d('S.view')),'vader');
 // Samma renderer ska märka midnatt även när den är remsans allra första timme.
 const first=await pg.evaluate(()=>window.__d(`(()=>{const original=wxModel,base=original();try{const hours=Array.from({length:25},(_,i)=>Object.assign({},base.hours[0],{d:new Date(2026,9,24,23+i)}));wxModel=()=>Object.assign({},base,{hours});const el=document.createElement('div');el.innerHTML=wallWx();return el.querySelector('.bwx-h>div').className+'|'+el.querySelector('.bwx-h .fn').textContent}finally{wxModel=original}})()`));assert.match(first,/^nd\|Sön 00$/);
 console.log('PASS: dygnslinje och dag + 00 utan vald bakgrund; scroll och väderlänk; midnatt som första timme.');
};
