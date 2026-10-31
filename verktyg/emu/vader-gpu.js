// gpuLager(): väderbilden ska se exakt likadan ut när de rörliga SVG-delarna ligger i egna lager.
// Ritar bilden utan lager, fryser alla animationer vid samma tidpunkter, lägger lagren och jämför bildpunkterna.
// Kör med LS som innehåller "gpu":"0", t.ex. LS='{"wall":"1","me":"","gpu":"0"}' VP=1368x912 WXSYM=rain node verktyg/emu/run.js verktyg/emu/vader-gpu.js
// VY=vader öppnar vädervyn. Skillnadsbilder hamnar i shots/ som gpu-<T>-fore/efter.png.
const fs=require('node:fs'),path=require('node:path'),{PNG}=require('pngjs');
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(700);
 if(process.env.VY==='vader'){await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(900)}
 await h.idle(1500);
 const frys=T=>pg.evaluate(T=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=T}),T);
 const svgAnim=()=>pg.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.target instanceof SVGElement&&a.effect.getTiming().iterations===Infinity&&a.playState!=='idle').length);
 const TT=[1234,4321,7777];
 for(const T of TT){await frys(T);await pg.waitForTimeout(150);await pg.screenshot({path:path.join(h.OUT,'gpu-'+T+'-fore.png')})}
 const fore=await svgAnim();
 await pg.evaluate(()=>{localStorage.setItem('ht.gpu','1');document.getAnimations().forEach(a=>a.play());window.__d('gpuLager()')});
 const efter=await svgAnim(),lager=await pg.evaluate(()=>document.querySelectorAll('.gl-a').length+document.querySelectorAll('.gl[style*="animation-name"]').length);
 console.log('SVG-animationer före',fore,'efter',efter,'lager',lager);
 let fel=0;
 for(const T of TT){await frys(T);await pg.waitForTimeout(150);const b=path.join(h.OUT,'gpu-'+T+'-efter.png');await pg.screenshot({path:b});
  const before=PNG.sync.read(fs.readFileSync(b.replace('efter','fore'))),after=PNG.sync.read(fs.readFileSync(b));
  if(before.width!==after.width||before.height!==after.height)throw new Error('Bilden bytte storlek');
  let diff=0;for(let j=0;j<before.data.length;j+=4){const d=[0,1,2].map(k=>Math.abs(before.data[j+k]-after.data[j+k]));if(d[0]*.299+d[1]*.587+d[2]*.114>40)diff++}
  console.log('T',T,'olika bildpunkter (>40):',diff);if(diff>(+process.env.TOL||150))fel++}
 if(efter)throw new Error(efter+' SVG-animationer kvar på processorn');
 if(fel)throw new Error('bilden ändrades av lagren');
};
