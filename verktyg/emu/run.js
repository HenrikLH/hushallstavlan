// node run.js scenario.js  -> runs app against in-process Kod.gs emulator
// scenario module exports async (pg, h) => {}
const {chromium}=(()=>{for(const m of ['playwright','/opt/node-tools/node_modules/playwright']){try{return require(m)}catch(e){}}throw new Error('Playwright saknas: npm i -D playwright')})();
const fs=require('fs'),path=require('path'),http=require('http');
const APP=process.env.APP||path.join(__dirname,'../..');
const OUT=process.env.OUT||path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const gas=require('./gas.js');
function wx(){const ts=[];const t0=Date.UTC(2026,9,18,0);for(let h=0;h<216;h++){const t=new Date(t0+h*3600e3);const hr=(h+2)%24;
 ts.push({time:t.toISOString().replace('.000',''),data:{instant:{details:{air_temperature:7,wind_speed:3.4,wind_from_direction:230,relative_humidity:78,air_pressure_at_sea_level:1012}},next_1_hours:{summary:{symbol_code:'cloudy'},details:{precipitation_amount:0}},next_6_hours:{summary:{symbol_code:'cloudy'},details:{precipitation_amount:0}}}})}
 return JSON.stringify({properties:{timeseries:ts}})}
const WX=wx();
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(APP,p);
 fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}if(p==='/app.js')b=Buffer.from(String(b).replace(/\}\)\(\);\s*$/,'window.__d=s=>eval(s);})();'));const ext=path.extname(f);r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/json'}[ext]||'application/octet-stream'});r.end(b)})});
const PORT=8700+Math.floor(Math.random()*200);
(async()=>{await new Promise(r=>srv.listen(PORT,r));
 const scen=require(path.resolve(process.argv[2]));
 const exe=process.env.CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined);
 const b=await chromium.launch(exe?{executablePath:exe}:{});
 const theme=process.env.THEME||'light';
 const ctx=await b.newContext({viewport:(([w,hh])=>({width:+w,height:+hh}))((process.env.VP||'390x844').split('x')),deviceScaleFactor:process.env.VP?1:2,timezoneId:'Europe/Stockholm',locale:'sv-SE',colorScheme:theme,reducedMotion:process.env.REDUCED==='1'?'reduce':'no-preference',hasTouch:true,isMobile:!process.env.VP});
 const NOW=process.env.NOW||'2026-10-18T16:50:00+02:00';
 await ctx.addInitScript(([NOW,ls])=>{const now=new Date(NOW).getTime(),D0=Date,off=now-D0.now();
   class FD extends D0{constructor(...a){super(...(a.length?a:[D0.now()+off]))}static now(){return D0.now()+off}};window.Date=FD;
   if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');const s=(k,v)=>localStorage.setItem('ht.'+k,v);s('key','x');s('me','Henrik');s('view','mat');s('matTab','vecka');s('wall','0');for(const k in ls)s(k,ls[k])}
   navigator.serviceWorker&&(navigator.serviceWorker.register=()=>Promise.reject());
   window.__toasts=[];new MutationObserver(()=>{const t=document.getElementById('toast');if(t&&!t.hidden&&t.textContent&&window.__toasts[window.__toasts.length-1]!==t.textContent){window.__toasts.push(t.textContent);console.log('TOAST: '+t.textContent)}}).observe(document,{subtree:true,childList:true,attributes:true,characterData:true});
 },[NOW,JSON.parse(process.env.LS||'{}')]);
 const pg=await ctx.newPage();
 const log=[];
 pg.on('pageerror',e=>{log.push('PAGEERROR '+e.message);console.log('PAGEERROR',e.message,e.stack&&e.stack.split('\n')[1])});
 pg.on('console',m=>{const t=m.text();if(/TOAST|error|Error/.test(t)){console.log('console:',t)}});
 await pg.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('script.google.com')){const m=r.request().method();const body=r.request().postData()||'';const q=Object.fromEntries(new URL(u).searchParams);
   if(process.env.SLOW)await new Promise(x=>setTimeout(x,+process.env.SLOW));
   const out=gas.handle(m,body,q);if(m==='POST'){const j=JSON.parse(body),o=JSON.parse(out);console.log('  POST',j.action,(j.id||j.k||''),o.ok?'ok':'ERR '+o.error)}
   return r.fulfill({contentType:'application/json',body:out})}
  if(u.includes('api.met.no'))return r.fulfill({contentType:'application/json',body:WX});
  if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 const h={
  OUT,gas,
  async shot(n,full){await pg.waitForTimeout(350);await pg.screenshot({path:path.join(OUT,n+'.png'),fullPage:!!full,animations:process.env.REDUCED==='1'?'disabled':'allow'});console.log('shot',n)},
  async act(sel){const el=await pg.$(sel);if(!el){console.log('MISSING',sel);return false}await el.click();await pg.waitForTimeout(400);return true},
  async idle(ms){await pg.waitForTimeout(ms||1200)},
  async outbox(){return pg.evaluate(()=>localStorage.getItem('ht.outbox'))},
  sheet:(k)=>gas.book.sheets[k].rows,
  async hold(sel){const el=await pg.$(sel);if(!el){console.log('MISSING',sel);return}const bb=await el.boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(1400);await pg.mouse.up();await pg.waitForTimeout(500)},
  async waitFlush(){for(let i=0;i<60;i++){const o=await pg.evaluate(()=>localStorage.getItem('ht.outbox'));if(!o)return;await pg.waitForTimeout(500)}console.log('outbox still not empty')},
 };
 await pg.goto('http://localhost:'+PORT+'/');await pg.waitForTimeout(2000);
 try{await scen(pg,h)}catch(e){console.log('SCENARIO FAIL',e.message);process.exitCode=1}
 if(log.length)process.exitCode=1;
 console.log('TOASTS',JSON.stringify(await pg.evaluate(()=>window.__toasts)));
 await b.close();srv.close()})();
