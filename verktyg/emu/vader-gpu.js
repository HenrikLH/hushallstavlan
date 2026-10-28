// gpuLager(): väderbilden ska se exakt likadan ut när de rörliga SVG-delarna ligger i egna lager.
// Ritar bilden utan lager, fryser alla animationer vid samma tidpunkter, lägger lagren och jämför bildpunkterna.
// Kör med LS som innehåller "gpu":"0", t.ex. LS='{"wall":"1","me":"","gpu":"0"}' VP=1368x912 WXSYM=rain node verktyg/emu/run.js verktyg/emu/vader-gpu.js
// VY=vader öppnar vädervyn. Skillnadsbilder hamnar i shots/ som gpu-<T>-fore/efter.png.
const {execFileSync}=require('child_process'),path=require('path');
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
  const r=execFileSync('python3',['-c',`import sys
from PIL import Image,ImageChops
a=Image.open(sys.argv[1]).convert('RGB');b=Image.open(sys.argv[2]).convert('RGB');d=ImageChops.difference(a,b).convert('L')
n=sum(1 for v in d.getdata() if v>40);bb=d.point(lambda v:255 if v>40 else 0).getbbox();print(n,bb)`,b.replace('efter','fore'),b]).toString().trim();
  console.log('T',T,'olika bildpunkter (>40) och område:',r);if(+r.split(' ')[0]>(+process.env.TOL||150))fel++}
 if(efter)throw new Error(efter+' SVG-animationer kvar på processorn');
 if(fel)throw new Error('bilden ändrades av lagren');
};
