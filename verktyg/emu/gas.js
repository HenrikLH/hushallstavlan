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
 return {sheets,getSheetByName:n=>sheets[n]?api(sheets[n]):null}}
const book=makeBook(require('./data.js'));
const props={HUSHALLSKOD:'x',NTFY_TOPIC:''};
let lockHeld=false;
const pad=n=>String(n).padStart(2,'0');
const ctx={
 console,JSON,Math,Date,String,Number,Object,Array,Error,RegExp,isFinite,isNaN,parseInt,parseFloat,
 SpreadsheetApp:{getActive:()=>book,flush(){}},
 LockService:{getScriptLock:()=>({waitLock(){if(process.env.LOCKFAIL&&Math.random()<+process.env.LOCKFAIL)throw new Error('Lock timeout: another process was holding the lock for too long.');lockHeld=true},releaseLock(){lockHeld=false}})},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this}})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>{props[k]=v}})},
 Utilities:{getUuid:()=>require('crypto').randomUUID(),formatDate:(d,tz,f)=>{
   const p=new Intl.DateTimeFormat('sv-SE',{timeZone:tz==='UTC'?'UTC':'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).reduce((o,x)=>(o[x.type]=x.value,o),{});
   return f.replace('yyyy',p.year).replace('MM',p.month).replace('dd',p.day).replace('HH',p.hour).replace('mm',p.minute).replace('ss',p.second)},
  parseDate:(s)=>new Date(s+'T00:00:00+02:00')},
 DriveApp:{},CalendarApp:{},UrlFetchApp:{fetch(){}},ScriptApp:{},Session:{}};
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
