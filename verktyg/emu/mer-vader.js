// Mer väder och smarta förslag. Med låtsasdata: WXPLUS=1 node verktyg/emu/run.js verktyg/emu/mer-vader.js
// Utan WXPLUS nås inga av de nya källorna: då ska sidan fungera och bara Vädra/Ute visas.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const k=async s=>{await pg.locator(s).first().click();await h.idle(700)},P=!!process.env.WXPLUS,txt=s=>pg.evaluate(s=>[...document.querySelectorAll(s)].map(e=>e.textContent.trim()),s);
 await h.idle(1500);await k('#nav [data-act="nav"][data-id="oversikt"]');
 const larm=await txt('.wx-larm');console.log('larm',larm);if(P&&process.env.WXPLUS!=='2')assert.match(larm[0]||'',/Gul varning: halka/);else if(!P)assert.equal(larm.length,0);
 const fs=await txt('.fs-k b');console.log('förslag',fs);await h.shot('mv-oversikt');
 if(fs.length){const n=fs.length;await k('.fs-k [data-act="fsSen"]');assert.equal((await txt('.fs-k b')).length,n-1,'Inte nu döljer förslaget');
  await pg.reload();await h.idle(1300);await k('#nav [data-act="nav"][data-id="oversikt"]');assert.equal((await txt('.fs-k b')).length,n-1,'döljs även efter omstart')}
 await k('#nav [data-act="nav"][data-id="oversikt"]');await k('[data-act="nav"][data-id="vader"]');
 const caps=await txt('.wx-tile .wx-cap');console.log('rutor',caps.join(' | '));
 assert(caps.some(c=>/^Vädra/.test(c))&&caps.some(c=>/^Ute/.test(c)),'Vädra och Ute');
 if(P){assert(caps.includes('UV-index')&&caps.includes('Pollen')&&caps.includes('Norrsken'),'UV, pollen, norrsken');if(process.env.WXPLUS!=='2')assert.match((await txt('.wx-varn b'))[0]||'',/Halka i Jönköpings län/)}
 else assert(!caps.includes('UV-index'));
 console.log((await txt('.wx-tile')).slice(0,5).join('\n'));
 await h.shot('mv-vader');if(await pg.locator('.wx-tiles').count()){await pg.evaluate(()=>scrollTo(0,document.querySelector('.wx-tiles').getBoundingClientRect().top+scrollY-120));await h.idle(300);await h.shot('mv-vader-rutor')}
 console.log('PASS mer-vader')};
