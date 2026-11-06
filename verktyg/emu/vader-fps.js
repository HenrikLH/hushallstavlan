// Mäter hur mycket huvudtråden arbetar med väderbildens ändlösa animationer (gemensam skärm eller telefon).
// Kör: LS='{"wall":"1","me":""}' VP=1368x912 WXSYM=rain node verktyg/emu/run.js verktyg/emu/vader-fps.js
// MS = mättid i ms (standard 8000). VY=vader öppnar vädervyn i stället för översikten. Med "gpu":"0" i LS jämförs utan gpuLager().
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(700);
 if(process.env.VY==='vader')await pg.locator('[data-act="nav"][data-id="vader"]').first().click();
 await h.idle(2500);
 await pg.evaluate(()=>window.__d('A.touch=0'));
 // AV='css-väljare': stänger av animationerna där, för att se vad de kostar
 if(process.env.AV)await pg.addStyleTag({content:process.env.AV+'{animation:none!important}'});
 const st=await pg.evaluate(()=>{const L=document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations===Infinity);
  const svg=L.filter(a=>{const t=a.effect.target;return t&&t instanceof SVGElement&&!(t instanceof SVGSVGElement&&!(t.parentNode instanceof SVGElement))});
  const ht=L.filter(a=>!svg.includes(a));return{alla:L.length,svgBarn:svg.length,html:ht.length,svgNamn:[...new Set(svg.map(a=>a.animationName))].join(' '),htmlNamn:[...new Set(ht.map(a=>a.animationName+':'+(a.effect.target.getAttribute('class')||a.effect.target.tagName)))].join(' ')}});
 console.log('ANIM',JSON.stringify(st));
 const c=await pg.context().newCDPSession(pg);await c.send('Performance.enable');
 const m=async()=>Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
 const ms=+(process.env.MS||8000),a=await m();await pg.waitForTimeout(ms);const b=await m();
 const d=k=>((b[k]-a[k])/(ms/1000)*100).toFixed(1)+'%';
 console.log('HUVUDTRÅD',JSON.stringify({upptagen:d('TaskDuration'),skript:d('ScriptDuration'),stil:d('RecalcStyleDuration'),layout:d('LayoutDuration'),stilräkningar:Math.round((b.RecalcStyleCount-a.RecalcStyleCount)/(ms/1000))+'/s',layouter:Math.round((b.LayoutCount-a.LayoutCount)/(ms/1000))+'/s'}));
 await h.shot(process.env.NAMN||'fps',0);
};
