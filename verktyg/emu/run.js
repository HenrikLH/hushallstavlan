// node run.js scenario.js  -> runs app against in-process Kod.gs emulator
// scenario module exports async (pg, h) => {}
const {chromium}=(()=>{for(const m of ['playwright','/opt/node-tools/node_modules/playwright']){try{return require(m)}catch(e){}}throw new Error('Playwright saknas: npm i -D playwright')})();
const fs=require('fs'),path=require('path'),http=require('http');
const APP=process.env.APP||path.join(__dirname,'../..');
const OUT=process.env.OUT||path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const gas=require('./gas.js');
// WXMIX=1: växlande väder (klart, mest klart, halvklart, mulet, regn) i tretimmarssteg och temperatur efter tid på dygnet
const MIX=['clearsky','fair','partlycloudy','cloudy','lightrain','partlycloudy','fair','clearsky'];
const mix=(h,hr)=>{if(!process.env.WXMIX)return'';const b=MIX[Math.floor(h/3)%MIX.length];return/rain$|cloudy$/.test(b)&&b!=='partlycloudy'?b:b+(hr>=7&&hr<17?'_day':'_night')};
const mixPr=h=>process.env.WXMIX?(MIX[Math.floor(h/3)%MIX.length]==='lightrain'?0.4:0):null;
function wx(){const ts=[];const t0=Date.UTC(2026,9,18,0);for(let h=0;h<216;h++){const t=new Date(t0+h*3600e3);const hr=(h+2)%24;
 ts.push({time:t.toISOString().replace('.000',''),data:{instant:{details:{air_temperature:process.env.WXMIX?Math.round(7+4*Math.sin((hr-9)/24*2*Math.PI)):+(process.env.WXT||7),wind_speed:3.4,wind_from_direction:230,relative_humidity:78,air_pressure_at_sea_level:1012,...(process.env.WXCF?{cloud_area_fraction:+process.env.WXCF}:{})}},next_1_hours:{summary:{symbol_code:mix(h,hr)||process.env.WXSYM||'cloudy'},details:{precipitation_amount:mixPr(h)??+(process.env.WXPR||0)}},next_6_hours:{summary:{symbol_code:process.env.WXSYM||'cloudy'},details:{precipitation_amount:0}}}})}
 // WXYR=1: som riktiga Yr, timme för timme de första 60 timmarna och sedan var sjätte timme (bara next_6_hours)
 if(process.env.WXYR){const T=ts.filter((x,h)=>h<60||h%6===0).map((x,i)=>i<60?x:{time:x.time,data:{instant:x.data.instant,next_6_hours:{summary:x.data.next_1_hours.summary,details:{precipitation_amount:x.data.next_1_hours.details.precipitation_amount*6}}}});return JSON.stringify({properties:{timeseries:T}})}
 return JSON.stringify({properties:{timeseries:ts}})}
const WX=wx();
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(APP,p);
 fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}if(p==='/app.js')b=Buffer.from(String(b).replace(/\}\)\(\);\s*$/,'window.__d=s=>eval(s);})();'));const ext=path.extname(f);r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/json'}[ext]||'application/octet-stream'});r.end(b)})});
let PORT;
(async()=>{await new Promise(r=>srv.listen(+process.env.PORT||0,()=>{PORT=srv.address().port;r()}));
 const scen=require(path.resolve(process.argv[2]));
 const exe=process.env.CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined);
 const b=await chromium.launch(exe?{executablePath:exe}:{});
 const theme=process.env.THEME||'light';
 const ctx=await b.newContext({viewport:(([w,hh])=>({width:+w,height:+hh}))((process.env.VP||'390x844').split('x')),deviceScaleFactor:process.env.VP?1:2,timezoneId:'Europe/Stockholm',locale:'sv-SE',colorScheme:theme,reducedMotion:process.env.REDUCED==='1'?'reduce':'no-preference',hasTouch:true,isMobile:!process.env.VP,...(process.env.VIDEO?{recordVideo:{dir:process.env.VIDEO,size:{width:780,height:1688}}}:{})});
 const NOW=process.env.NOW||'2026-10-18T16:50:00+02:00';
 await ctx.addInitScript(([NOW,ls])=>{const now=new Date(NOW).getTime(),D0=Date,off=now-D0.now();
   class FD extends D0{constructor(...a){super(...(a.length?a:[D0.now()+off]))}static now(){return D0.now()+off}};window.Date=FD;
   if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');const s=(k,v)=>localStorage.setItem('ht.'+k,v);s('key','x');s('me','Henrik');s('view','mat');s('matTab','vecka');s('wall','0');for(const k in ls)s(k,ls[k])}
   navigator.serviceWorker&&(navigator.serviceWorker.register=()=>Promise.reject());
   window.__toasts=[];new MutationObserver(()=>{const t=document.getElementById('toast');if(t&&!t.hidden&&t.textContent&&window.__toasts[window.__toasts.length-1]!==t.textContent){window.__toasts.push(t.textContent);console.log('TOAST: '+t.textContent)}}).observe(document,{subtree:true,childList:true,attributes:true,characterData:true});
 },[NOW,JSON.parse(process.env.LS||'{}')]);
 const pg=await ctx.newPage();pg.setDefaultTimeout(10000);
 const log=[];
 pg.on('pageerror',e=>{log.push('PAGEERROR '+e.message);console.log('PAGEERROR',e.message,e.stack&&e.stack.split('\n')[1])});
 pg.on('console',m=>{const t=m.text();if(/TOAST|error|Error/.test(t)){console.log('console:',t)}});
 await pg.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('script.google.com')){const m=r.request().method();const body=r.request().postData()||'';const q=Object.fromEntries(new URL(u).searchParams);
   if(process.env.SLOW)await new Promise(x=>setTimeout(x,+process.env.SLOW));
   const out=gas.handle(m,body,q);if(m==='POST'){const j=JSON.parse(body),o=JSON.parse(out);console.log('  POST',j.action,(j.id||j.k||''),o.ok?'ok':'ERR '+o.error)}
   return r.fulfill({contentType:'application/json',body:out})}
  if(u.includes('api.met.no'))return r.fulfill({contentType:'application/json',body:WX});
  // WXPLUS=1: låtsasdata för mer väder (gul SMHI-varning för halka över Värnamo, UV 1, pollen enligt WXPOLL, Kp enligt WXKP)
  if(process.env.WXPLUS){const n0=Date.parse(NOW),d0=new Date(n0);d0.setUTCHours(0,0,0,0);const H=[...Array(48)].map((_,i)=>new Date(d0.getTime()+i*36e5).toISOString().slice(0,16));
   if(u.includes('air-quality-api.open-meteo.com'))return r.fulfill({contentType:'application/json',body:JSON.stringify({hourly:{time:H,uv_index:H.map((_,i)=>i%24>8&&i%24<14?1.2:0),alder_pollen:H.map(()=>0),birch_pollen:H.map(()=>+(process.env.WXPOLL||0)),grass_pollen:H.map(()=>0),mugwort_pollen:H.map(()=>null)}})});
   if(u.includes('services.swpc.noaa.gov'))return r.fulfill({contentType:'application/json',body:JSON.stringify([...Array(24)].map((_,i)=>({time_tag:new Date(d0.getTime()+i*3*36e5).toISOString().slice(0,19),kp:i%8>=6?+(process.env.WXKP||4.67):2.33,observed:'predicted'})))});
   if(u.includes('opendata-download-warnings.smhi.se'))return r.fulfill({contentType:'application/json',body:JSON.stringify(process.env.WXPLUS==='2'?[]:[{id:1,event:{sv:'Halka',code:'SLIPPERINESS'},warningAreas:[{id:2,approximateStart:new Date(n0+2*36e5).toISOString(),approximateEnd:new Date(n0+18*36e5).toISOString(),areaName:{sv:'Jönköpings län'},warningLevel:{sv:'Gul',code:'YELLOW'},eventDescription:{sv:'Halka'},descriptions:[{title:{sv:'Vad händer'},text:{sv:'Underkylt regn kan ge isbark på vägar och trottoarer.'}}],area:{type:'Feature',geometry:{type:'Polygon',coordinates:[[[13,56.5],[15.5,56.5],[15.5,58.2],[13,58.2],[13,56.5]]]}}}]},{id:3,event:{sv:'Vattenbrist'},warningAreas:[{warningLevel:{code:'MESSAGE'},area:{geometry:{type:'Polygon',coordinates:[[[13,56.5],[15.5,56.5],[15.5,58.2],[13,58.2],[13,56.5]]]}}}]}])})}
  if(process.env.BILDER&&r.request().resourceType()==='image')return r.continue(); // BILDER=1: riktiga matfoton från nätet (bara där nätet når dem, t.ex. CI)
  if(u.startsWith('http://localhost')||(process.env.HA&&u.startsWith('http://127.0.0.1:8777/ha')))return r.continue();return r.abort()});
 const h={
  OUT,gas,
  async shot(n,full){await pg.waitForTimeout(350);await pg.screenshot({path:path.join(OUT,n+'.png'),fullPage:!!full,animations:process.env.REDUCED==='1'?'disabled':'allow'});console.log('shot',n)},
  async act(sel){const el=await pg.$(sel);if(!el){console.log('MISSING',sel);return false}await el.click();await pg.waitForTimeout(400);return true},
  async idle(ms){await pg.waitForTimeout(ms||1200)},
  // Öppnar Inställningar och den del (.pref-section) som innehåller sel, var den än ligger just nu.
  async pref(sel){if(!await pg.locator('form[data-form="settings"]').isVisible()){await pg.locator('[data-act="settings"]').first().click();await pg.waitForTimeout(600)}
   const k=await pg.evaluate(s=>{const e=document.querySelector('form[data-form="settings"] '+s);const d=e&&e.closest('.pref-section');return d?d.dataset.k:''},sel);if(!k)throw new Error('Hittar inte '+sel+' i Inställningar');
   if(!await pg.locator('[data-k="'+k+'"]').evaluate(d=>d.open)){const su=pg.locator('[data-k="'+k+'"]>summary');await su.evaluate(e=>e.scrollIntoView({block:'center'}));await su.click();await pg.waitForTimeout(600)}
   await pg.locator(sel).first().evaluate(e=>e.scrollIntoView({block:'center'}));await pg.waitForTimeout(200)},
  async outbox(){return pg.evaluate(()=>localStorage.getItem('ht.outbox'))},
  sheet:(k)=>gas.book.sheets[k].rows,
  async hold(sel){const el=await pg.$(sel);if(!el){console.log('MISSING',sel);return}const bb=await el.boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(1400);await pg.mouse.up();await pg.waitForTimeout(500)},
  async waitFlush(){for(let i=0;i<60;i++){const o=await pg.evaluate(()=>localStorage.getItem('ht.outbox'));if(!o)return;await pg.waitForTimeout(500)}console.log('outbox still not empty')},
 };
 await pg.goto('http://localhost:'+PORT+'/');await pg.waitForTimeout(2000);
 try{await scen(pg,h)}catch(e){console.log('SCENARIO FAIL',e.message);await h.shot('fel');console.log('STATE',await pg.evaluate(()=>window.__d?window.__d('JSON.stringify({view:S.view,taskTab:S.taskTab,sheet:S.sheet,focus:document.activeElement&&document.activeElement.outerHTML})'):''));process.exitCode=1}
 if(log.length)process.exitCode=1;
 console.log('TOASTS',JSON.stringify(await pg.evaluate(()=>window.__toasts)));
 await ctx.close();await b.close();srv.close()})();
