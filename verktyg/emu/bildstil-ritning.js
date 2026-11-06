// Mäter vad det kostar att rita om väderbilden (60 hela omritningar, rastrering i ms). Jämför bildstilar:
// LS='{"wxart":"geo","gpu":"0"}' node verktyg/emu/run.js verktyg/emu/bildstil-ritning.js   (CSS='...' lägger till regler, t.ex. för att stänga av filter)
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(3000);await pg.evaluate(()=>window.__d('A.touch=0'));
 if(process.env.CSS)await pg.addStyleTag({content:process.env.CSS});if(process.env.STILL)await pg.addStyleTag({content:'*{animation-play-state:paused!important}'});
 const c=await pg.context().newCDPSession(pg);const ev=[];c.on('Tracing.dataCollected',d=>ev.push(...d.value));const done=new Promise(r=>c.once('Tracing.tracingComplete',r));
 await c.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,cc,blink',transferMode:'ReportEvents'});
 const n=await pg.evaluate(()=>new Promise(r=>{const S=[...document.querySelectorAll('.hero svg, .gs svg')].filter(s=>!(s.parentNode instanceof SVGElement));let k=0;const f=()=>{S.forEach(s=>s.style.color=k%2?'#000':'#010101');if(++k<60)requestAnimationFrame(f);else r(S.length)};requestAnimationFrame(f)}));
 await pg.waitForTimeout(500);await c.send('Tracing.end');await done;
 const s={};for(const e of ev){if(e.ph!=='X'||!e.dur)continue;s[e.name]=(s[e.name]||0)+e.dur/1000}
 const g=k=>(s[k]||0).toFixed(0);
 console.log('PAINT svgs='+n,'60 bildrutor: Paint',g('Paint'),'RasterTask',g('RasterTask'),'DisplayItemList::Raster',g('DisplayItemList::Raster'),'ImageDecodeTask',g('ImageDecodeTask'),'PaintImage',g('PaintImage'));
};
