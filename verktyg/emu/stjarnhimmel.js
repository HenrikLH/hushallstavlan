// Översiktens stjärnhimmel på natten (telefon): skärmbild av hjälten, sh-<THEME>.png. Kör: NOW=2026-11-12T22:30:00+01:00 WXSYM=clearsky_night WXCF=0 THEME=light node verktyg/emu/run.js verktyg/emu/stjarnhimmel.js
const path=require('node:path');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(600);
 if(process.env.CSSF)await pg.evaluate(([c,process_svg])=>{const s=document.createElement('style');s.textContent=c;document.head.append(s);const fix=()=>document.querySelectorAll('.hero.has-sky').forEach(e=>{e.classList.add('natt');if(process_svg&&!e.querySelector(':scope>.npol')){e.insertAdjacentHTML('afterbegin',process_svg);const u='url("data:image/svg+xml,'+encodeURIComponent(process_svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))+'")',k=e.querySelector(':scope>.skyfx');if(k){k.style.webkitMaskImage=k.style.maskImage=u;k.style.webkitMaskSize=k.style.maskSize='100% 230px';k.style.webkitMaskPosition=k.style.maskPosition='0 6px';k.style.webkitMaskRepeat=k.style.maskRepeat='no-repeat';k.style.maskComposite='add'}}});fix();new MutationObserver(fix).observe(document.body,{childList:1,subtree:1})},[require('node:fs').readFileSync(process.env.CSSF,'utf8'),process.env.SVGF?require('node:fs').readFileSync(process.env.SVGF,'utf8'):'']);await h.idle(300);
 await pg.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=2000}));
 const n=await pg.locator('.hero .skyfx .st').count();if(!n)throw new Error('inga stjärnor');
 const b=await pg.locator('.hero').boundingBox();
 await pg.screenshot({path:path.join(h.OUT,'sh-'+(process.env.SHN||process.env.THEME||'light')+'.png'),clip:{x:0,y:0,width:390,height:Math.min(844,b.y+b.height+8)}});
};
