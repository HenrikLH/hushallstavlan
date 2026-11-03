// Mäter hur mjukt översiktens väderbild rör sig: CPU strypt som en telefon (CPU=6), bilder/s via rAF och tid för målning/rastrering ur spårningen.
// Kör: LS='{"wxart":"geo"}' node verktyg/emu/run.js verktyg/emu/lagg.js   AV='css-väljare' stänger av animationerna där. VY=vader för vädervyn.
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(700);
 if(process.env.VY==='vader')await pg.locator('[data-act="nav"][data-id="vader"]').first().click();
 await h.idle(2500);await pg.evaluate(()=>window.__d('A.touch=0'));
 if(process.env.AV)await pg.addStyleTag({content:process.env.AV+'{animation:none!important}'});
 const c=await pg.context().newCDPSession(pg);await c.send('Emulation.setCPUThrottlingRate',{rate:+(process.env.CPU||6)});
 await pg.waitForTimeout(1000);
 const ev=[];c.on('Tracing.dataCollected',d=>ev.push(...d.value));const done=new Promise(ok=>c.once('Tracing.tracingComplete',ok));
 await c.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,cc,viz,gpu',transferMode:'ReportEvents'});
 const ms=+(process.env.MS||5000);const fs=require('node:fs');const cpu=()=>fs.readdirSync('/proc').filter(x=>/^\d+$/.test(x)).reduce((a,x)=>{try{const c=fs.readFileSync('/proc/'+x+'/cmdline','utf8');if(!/chrom/i.test(c))return a;const f=fs.readFileSync('/proc/'+x+'/stat','utf8').split(') ')[1].split(' ');return a+ +f[11]+ +f[12]}catch(e){return a}},0);const c0=cpu();
 const fr=await pg.evaluate(ms=>new Promise(ok=>{const t=[];const f=n=>{t.push(n);if(n-t[0]<ms)requestAnimationFrame(f);else ok(t)};requestAnimationFrame(f)}),ms);
 const c1=cpu();await c.send('Tracing.end');await done;
 const d=fr.slice(1).map((x,i)=>x-fr[i]),fps=(d.length/((fr[fr.length-1]-fr[0])/1000)).toFixed(1),lang=d.filter(x=>x>34).length;
 const sum={};ev.filter(e=>e.ph==='X'&&e.dur).forEach(e=>{if(/^(Paint|PaintImage|RasterTask|Layerize|UpdateLayer|PrePaint|Layout|UpdateLayoutTree|RecalculateStyles|Commit|CompositeLayers|ImageDecodeTask|Decode Image|TileManager::FlushAndIssueSignals|RasterizerTaskImpl::RunOnWorkerThread)$/.test(e.name))sum[e.name]=(sum[e.name]||0)+e.dur/1000});
 const per=Object.fromEntries(Object.entries(sum).map(([k,v])=>[k,(v/(ms/1000)).toFixed(0)+'ms/s']));
 console.log('LAGG',JSON.stringify({kärnor:((c1-c0)/100/(ms/1000)).toFixed(2),fps,langaRutor:lang,max:Math.max(...d).toFixed(0),...per}));
};
