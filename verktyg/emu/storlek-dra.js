// Ändra storlek genom att dra i hörnknappen med finger (vanliga rutor och widgets). EXP=1 slår på widgets.
// Kör: node verktyg/emu/run.js verktyg/emu/storlek-dra.js   (väggen: LS='{"wall":"1","me":""}' VP=1368x912)
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const cdp=await pg.context().newCDPSession(pg);
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 const wall=await pg.evaluate(()=>localStorage.getItem('ht.wall')==='1'),exp=await pg.evaluate(()=>localStorage.getItem('ht.exp')==='1');
 await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(800);
 const storlek=id=>pg.evaluate(id=>{const b=document.querySelector('[data-box="'+id+'"]');if(!b)return'';const r=b.getBoundingClientRect();return (b.className.match(/xw-[sml]/)||[''])[0]+' '+Math.round(r.width)+'x'+Math.round(r.height)},id);
 // gå in i ändra-läget genom att hålla in första rutan
 const f=await (await pg.$('[data-box]')).boundingBox();await touch('touchStart',f.x+f.width/2,f.y+20);await pg.waitForTimeout(800);await touch('touchEnd');await h.idle(500);
 if(!await pg.$('.arranging'))return fel('kom inte in i ändra-läget');
 const ids=await pg.$$eval('.arr-s',a=>a.map(e=>e.closest('[data-box]').dataset.box));console.log('med hörnknapp: '+ids.join(','));if(!ids.length)return fel('ingen hörnknapp');
 const id=ids.includes('mat')?'mat':ids[0];
 const dra=async(dx,dy)=>{const s=await pg.$('[data-box="'+id+'"] .arr-s');await s.evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(200);const r=await s.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
  await touch('touchStart',x,y);for(let i=1;i<=12;i++){await touch('touchMove',x+dx*i/12,y+dy*i/12);await pg.waitForTimeout(40)}
  await h.shot((wall?'vagg':'tel')+(exp?'-exp':'')+'-drar-hornet');await touch('touchEnd');await h.idle(500)};
 const a=await storlek(id);console.log(id+' före: '+a);
 const W=(await (await pg.$('[data-box="'+id+'"]')).boundingBox()).width;
 await dra(-W*.6,0);const b=await storlek(id);console.log(id+' dragen inåt: '+b);if(a===b)fel('storleken ändrades inte inåt');
 const menu=await pg.$('.xsz');if(menu)fel('menyn öppnades efter dragning');
 await dra(W*.9,exp&&!wall?W*1.2:0);const c=await storlek(id);console.log(id+' dragen utåt: '+c);if(c===b)fel('storleken ändrades inte utåt');
 if(!await pg.$('.arranging'))fel('ändra-läget stängdes');
 console.log('status: '+await pg.evaluate(()=>(document.querySelector('.arr-st')||{}).textContent));
 // kort tryck fungerar som förut
 await (await pg.$('[data-box="'+id+'"] .arr-s')).evaluate(e=>e.click());await h.idle(400);console.log(id+' efter tryck: '+await storlek(id)+(await pg.$('.xsz')?' (menyn öppen)':''));
};
