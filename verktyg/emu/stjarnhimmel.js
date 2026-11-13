// Översiktens nattpöl i ljust läge /  stjärnhimmel på natten (telefon): skärmbild av hjälten, sh-<THEME>.png. Kör: NOW=2026-11-12T22:30:00+01:00 WXSYM=clearsky_night WXCF=0 THEME=light node verktyg/emu/run.js verktyg/emu/stjarnhimmel.js
const path=require('node:path');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(600);
 await pg.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=2000}));
 const np=await pg.evaluate(()=>{const h=document.querySelector('.hero.natt');if(h&&!h.classList.contains('nh-pol'))return h.className;return h?getComputedStyle(h.querySelector('.npol')).display+' '+!!h.style.getPropertyValue('--np'):'ingen natt'});console.log('NPOL',np);
 const n=await pg.locator('.hero .skyfx .st').count();if(!n)throw new Error('inga stjärnor');
 const b=await pg.locator('.hero').boundingBox();
 await pg.screenshot({path:path.join(h.OUT,'sh-'+(process.env.SHN||process.env.THEME||'light')+'.png'),clip:{x:0,y:0,width:390,height:Math.min(844,b.y+b.height+8)}});
};
// INST=1: öppna Inställningar → Översikt och välj Nattkort via reglaget (sh-inst.png)
module.exports=(f=>async(pg,h)=>{await f(pg,h);if(!process.env.INST)return;await h.pref('[data-seg="natthimmel"]');const s=pg.locator('[data-seg="natthimmel"]');await s.scrollIntoViewIfNeeded();await h.idle(300);
 await pg.screenshot({path:require('node:path').join(h.OUT,'sh-inst.png')});await s.locator('[data-id="kort"]').click();await h.idle(300);
 if(await pg.evaluate(()=>localStorage.getItem('ht.natthimmel'))!=='kort')throw new Error('valet sparades inte')})(module.exports);
