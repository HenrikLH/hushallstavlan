// Minimal Apps Script emulator for Kod.gs: node gas.js serves POST/GET like the web app
const fs=require('fs'),vm=require('vm'),http=require('http');
const PORT=+process.env.GAS_PORT||8766;
const LOG=[];
function makeBook(init){
 const sheets={};
 for(const [name,rows] of Object.entries(init)){
  const s={name,rows:rows.map(r=>r.slice()),maxRows:Math.max(rows.length+5,50),frozen:1};
  sheets[name]=s}
 const disp=v=>v===true?'TRUE':v===false?'FALSE':v==null?'':String(v);
 const lastRow=s=>{let n=s.rows.length;while(n>0&&s.rows[n-1].every(c=>c===''||c==null))n--;return n};
 const width=s=>Math.max(...s.rows.map(r=>r.length),1);
 function cell(s,r,c){const row=s.rows[r-1];return row&&row[c-1]!=null?row[c-1]:''}
 function setCell(s,r,c,v){while(s.rows.length<r)s.rows.push([]);const row=s.rows[r-1];while(row.length<c)row.push('');row[c-1]=v;if(r>s.maxRows)s.maxRows=r}
 function range(s,r,c,nr=1,nc=1){return{
  getValues:()=>Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>cell(s,r+i,c+j))),
  getDisplayValues:()=>Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>disp(cell(s,r+i,c+j)))),
  getDisplayValue:()=>disp(cell(s,r,c)),
  setValue:v=>{setCell(s,r,c,v);return this},
  setValues:vs=>{vs.forEach((row,i)=>row.forEach((v,j)=>setCell(s,r+i,c+j,v)))},
  setNumberFormat(){return this},
  clearContent:()=>{for(let i=0;i<nr;i++)for(let j=0;j<nc;j++)setCell(s,r+i,c+j,'')}}}
 const api=s=>({
  getName:()=>s.name,
  getDataRange:()=>range(s,1,1,Math.max(lastRow(s),1),width(s)),
  getRange:(r,c,nr,nc)=>{const R=range(s,r,c,nr||1,nc||1);R.setNumberFormat=()=>R;return R},
  getLastRow:()=>lastRow(s),getMaxRows:()=>s.maxRows,getFrozenRows:()=>s.frozen,
  appendRow:a=>{const n=lastRow(s);s.rows.length=n;s.rows.push(a.slice());if(s.rows.length>s.maxRows)s.maxRows=s.rows.length},
  deleteRow:r=>{if(s.maxRows-1<=s.frozen)throw new Error('Det går inte att ta bort alla rader som inte är frysta.');s.rows.splice(r-1,1);s.maxRows--},
  insertRowsAfter:(a,n)=>{s.maxRows+=n}});
 return {sheets,getSheetByName:n=>sheets[n]?api(sheets[n]):null,insertSheet:n=>{if(sheets[n])throw new Error('Fliken finns redan');sheets[n]={name:n,rows:[],maxRows:50,frozen:1};return api(sheets[n])}}}
// T3DEMO=1 (med NOW): exempelhändelser och uppgifter som i Henriks bild för Tavla 3-bilder
const t3demo=d=>{if(!process.env.T3DEMO)return d;d=JSON.parse(JSON.stringify(d));const t0=new Date((process.env.NOW||new Date().toISOString()).slice(0,10)+'T12:00:00Z'),a=n=>new Date(t0.getTime()+n*864e5).toISOString().slice(0,10);
 [[0,'09:00','Handla'],[0,'11:30','Fotbollsträning'],[0,'14:30','Besök av morfar'],[1,'10:00','Planera veckan'],[1,'13:00','Träning'],[1,'17:30','Middag hos Anna'],[2,'07:00','Arbete'],[2,'15:30','Utvecklingssamtal'],[2,'19:00','Tvättstugan']].forEach(([n,t,x],i)=>d['Händelser'].push([a(n),t,x,'','','t3d'+i,'']));
 ['Dammsug köket','Byt sängkläder','Rensa återvinningen'].forEach((x,i)=>d['Uppgifter'].push(['',x,a(0),'','','t3t'+i,'','']));return d};
const book=makeBook(t3demo(require('./data.js')));
const props={HUSHALLSKOD:'x',NTFY_TOPIC:''};
let lockHeld=false;const cache={};
const pad=n=>String(n).padStart(2,'0');
// Stockholms förskjutning den dagen (sommartid +02:00, annars +01:00)
const stTz=s=>{const d=new Date(s.slice(0,10)+'T12:00:00Z'),h=+new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',hour:'2-digit',hour12:false}).format(d);return h===14?'+02:00':'+01:00'};
// Låtsaskalendrar: createEvent/createAllDayEvent/getEvents räcker för kalenderSynk_, eventAdd_ och eventEdit_
function mockCal(){const cals={};let n=0;
 const ev=(o)=>({_o:o,getId:()=>o.id,getTitle:()=>o.title,setTitle:t=>{o.title=t},isAllDayEvent:()=>!!o.allDay,getStartTime:()=>o.start,getEndTime:()=>o.end,
  getAllDayStartDate:()=>o.start,getAllDayEndDate:()=>new Date(o.start.getTime()+864e5),getMyStatus:()=>'YES',getEventType:()=>'DEFAULT',isRecurringEvent:()=>false,
  getCreators:()=>['henrik.lund.hellstrand.2@gmail.com'],getDescription:()=>o.desc||'',setTime:(a,b)=>{o.start=a;o.end=b;o.allDay=false},setAllDayDate:d=>{o.start=d;o.allDay=true},deleteEvent:()=>{o.gone=true}});
 const cal=id=>cals[id]||(cals[id]={id,list:[],
  createEvent(title,start,end,opt){const o={id:'e'+(++n),title,start,end,desc:(opt||{}).description};this.list.push(o);return ev(o)},
  createAllDayEvent(title,d,opt){const o={id:'e'+(++n),title,start:d,end:new Date(d.getTime()+864e5),allDay:true,desc:(opt||{}).description};this.list.push(o);return ev(o)},
  getEvents(a,b){return this.list.filter(o=>!o.gone&&o.start<b&&o.end>a).map(ev)},
  getEventsForDay(d){return this.getEvents(d,new Date(d.getTime()+864e5))},
  getEventById(id){const o=this.list.find(o=>o.id===id&&!o.gone);return o?ev(o):null}});
 return{_cals:cals,getCalendarById:cal,GuestStatus:{NO:'NO'}}}
const ctx={
 console,JSON,Math,Date,String,Number,Object,Array,Error,RegExp,isFinite,isNaN,parseInt,parseFloat,
 SpreadsheetApp:{getActive:()=>book,flush(){}},
 LockService:{getScriptLock:()=>({waitLock(){if(process.env.LOCKFAIL&&Math.random()<+process.env.LOCKFAIL)throw new Error('Lock timeout: another process was holding the lock for too long.');lockHeld=true},releaseLock(){lockHeld=false}})},
 CacheService:{getScriptCache:()=>({get:k=>cache[k]||null,put:(k,v)=>{if(!process.env.NOCACHE)cache[k]=String(v)}})},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this}})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>{props[k]=v}})},
 Utilities:{getUuid:()=>require('crypto').randomUUID(),formatDate:(d,tz,f)=>{
   const p=new Intl.DateTimeFormat('sv-SE',{timeZone:tz==='UTC'?'UTC':'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).reduce((o,x)=>(o[x.type]=x.value,o),{});
   return f.replace('yyyy',p.year).replace('MM',p.month).replace('dd',p.day).replace('HH',p.hour).replace('mm',p.minute).replace('ss',p.second)},
  parseDate:(s)=>/ \d{2}:\d{2}$/.test(s)?new Date(s.replace(' ','T')+':00'+stTz(s)):new Date(s+'T00:00:00'+stTz(s))},
 DriveApp:{},CalendarApp:mockCal(),UrlFetchApp:{fetch(){}},ScriptApp:{},Session:{getEffectiveUser:()=>({getEmail:()=>'emu'})}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.env.KOD||require('path').join(__dirname,'../../apps-script/Kod.gs'),'utf8'),ctx);
// checkKey_ accepts anything
vm.runInContext('checkKey_=function(){}',ctx);
function handle(method,body,query){
 if(method==='GET')return ctx.doGet({parameter:query}).t;
 return ctx.doPost({postData:{contents:body}}).t}
module.exports={handle,book,LOG,ctx};
if(require.main===module){
 http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{const u=new URL(q.url,'http://x');
  const out=handle(q.method,b,Object.fromEntries(u.searchParams));
  if(q.method==='POST'){const j=JSON.parse(b);const o=JSON.parse(out);console.log('POST',j.action,o.ok?'ok':'ERR '+o.error)}
  r.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});r.end(out)})}).listen(PORT,()=>console.log('gas on',PORT))}
