(function(){
"use strict";
/* ---------- helpers ---------- */
const DAYS=['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];
const MON=['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
const CATS=['Frukt & grönt','Kött & fisk','Mejeri & ägg','Bröd','Torrvaror','Frys','Övrigt'];
const ROOMS=['Kök','Vardagsrum','Sovrum','Hall','Toalett','Hundar','Alla rum'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const today=()=>ymd(new Date());
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const kr=n=>(n==null||isNaN(n))?'–':Math.round(n).toLocaleString('sv-SE')+' kr';
const fmtQ=q=>{if(q==null)return'';const d=q<10?2:q<100?1:0;return Number(q.toFixed(d)).toLocaleString('sv-SE',{maximumFractionDigits:d})};
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'');
const dayName=s=>DAYS[parse(s).getDay()];
const dateLong=s=>{const d=parse(s);return cap(DAYS[d.getDay()])+' '+d.getDate()+' '+MON[d.getMonth()]};
const dateShort=s=>{if(!isDate(s))return s||'';const d=parse(s);return DAYS[d.getDay()].slice(0,3)+' '+d.getDate()+'/'+(d.getMonth()+1)};
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7)}
const lsGet=k=>{try{return localStorage.getItem('ht.'+k)}catch(e){return null}};
const lsSet=(k,v)=>{try{v==null?localStorage.removeItem('ht.'+k):localStorage.setItem('ht.'+k,v)}catch(e){}};

const SV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const I={
 home:SV+'<path d="M3.5 11.2L12 4l8.5 7.2"/><path d="M5.8 9.5V20h4.4v-5.5h3.6V20h4.4V9.5"/></svg>',
 fork:SV+'<path d="M6 3v5a3 3 0 0 0 6 0V3"/><path d="M9 3v18"/><path d="M18 21V3c-2.2 1.4-3.3 4-3.3 7.6V13H18"/></svg>',
 basket:SV+'<path d="M3 9.5h18l-1.7 9a2 2 0 0 1-2 1.6H6.7a2 2 0 0 1-2-1.6z"/><path d="M8 9.5l3.2-5.5M16 9.5l-3.2-5.5"/><path d="M9.2 13.5v3M12 13.5v3M14.8 13.5v3"/></svg>',
 list:SV+'<path d="M3.5 6.2l1.6 1.6L8 4.9M3.5 12.2l1.6 1.6L8 10.9M3.5 18.2l1.6 1.6L8 16.9"/><path d="M11 6.5h9.5M11 12.5h9.5M11 18.5h9.5"/></svg>',
 sparkles:SV+'<path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7z"/><path d="M17.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
 cal:SV+'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
 gear:SV+'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15"/></svg>',
 chev:'<svg viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5 5-5 5"/></svg>',
 back:'<svg viewBox="0 0 13 21" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 2L2.5 10.5l8 8.5"/></svg>',
 tick:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7.5-8"/></svg>',
 x:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
 clock:SV+'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>'
};
// Översikt ligger i mitten av flikraden
const I_EKO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h1.5"/></svg>';
// Inköp ligger under Mat; Ekonomi har fått dess plats i flikraden
const VIEWS=[['mat','Mat',I.fork],['ekonomi','Ekonomi',I_EKO],['oversikt','Översikt',I.home],['uppgifter','Uppgifter',I.list],['stad','Städ',I.sparkles]];
const VIEW_IDS=VIEWS.map(v=>v[0]).concat(['vader']);
const OLD_VIEWS={matsedel:'vecka',recept:'recept',inkop:'inkop'};

/* ---------- state ---------- */
const CFG=window.HT_CONFIG||{};
const S={theme:['light','dark'].includes(lsGet('theme'))?lsGet('theme'):'system',key:lsGet('key')||'',me:lsGet('me')||'',view:lsGet('view')||'oversikt',wall:lsGet('wall')==='1',
 data:null,sync:'idle',lastSync:null,error:'',recipe:null,scale:{},cook:null,shopFilter:'alla',shopAdd:false,taskAdd:false,
 sheet:null,confirm:null,timers:[],pending:0,step:{},matTab:['recept','bank','inkop'].includes(lsGet('matTab'))?lsGet('matTab'):'vecka',bankFilter:'alla',rate:null,open:{}};
try{const c=lsGet('cache');if(c)S.data=JSON.parse(c)}catch(e){}
// Gamla vyer (Matsedel, Recept) ligger nu i fliken Mat
function normView(id){if(OLD_VIEWS[id]){S.matTab=OLD_VIEWS[id];lsSet('matTab',S.matTab);return'mat'}return id}
S.view=normView(S.view);
const h0=location.hash.slice(1);if(VIEW_IDS.includes(h0)||OLD_VIEWS[h0])S.view=normView(h0);
if(!VIEW_IDS.includes(S.view))S.view='oversikt';

const D=()=>S.data||{settings:{},shop:[],tasks:[],clean:[],menu:[],events:[],offers:[],recipes:[]};
const settings=()=>D().settings||{};
const people=()=>{const p=String(settings().personer||'').split(',').map(s=>s.trim()).filter(Boolean);return p.length?p:['Henrik','Cornelia']};
const recipeById=id=>D().recipes.find(r=>r.id===id)||bankList().find(r=>r.id===id);
/* ---------- betyg, önskelista och receptbank ----------
   Sparas som JSON i fliken Inställningar (raderna betyg, onskelista och receptbank_1…7)
   via appens vanliga inställningsanrop, så Apps Script-skriptet behöver inte ändras. */
const parseJ=(s,d)=>{try{const v=JSON.parse(s);return v==null?d:v}catch(e){return d}};
const BANK_ROWS=()=>Object.keys(settings()).filter(k=>/^receptbank_\d+$/.test(k)).sort((a,b)=>Number(a.split('_')[1])-Number(b.split('_')[1]));
function bankList(){const seen=new Set(),out=[];BANK_ROWS().forEach(k=>parseJ(settings()[k],[]).forEach(x=>{if(x&&x.id&&!seen.has(x.id)){seen.add(x.id);out.push(x)}}));return out}
const inBank=id=>bankList().some(x=>x.id===id);
const ratings=()=>parseJ(settings().betyg,{});
const wishes=()=>parseJ(settings().onskelista,[]);
function ratingOf(id){const x=ratings()[id];if(!x||!x.p)return null;const ps=Object.entries(x.p).filter(([,e])=>e&&e.s);if(!ps.length)return null;
 return{avg:ps.reduce((a,[,e])=>a+Number(e.s),0)/ps.length,people:ps,never:ps.some(([,e])=>e.v==='aldrig')}}
const VERD={igen:'Laga igen',okej:'Okej',aldrig:'Aldrig mer'};
const starsTxt=n=>'★★★★★'.slice(0,Math.round(n))+'☆☆☆☆☆'.slice(0,5-Math.round(n));
// Läs färskt värde från kalkylarket, ändra och skriv tillbaka, så att två telefoner inte skriver över varandra
async function updJSON(k,def,fn){const st=settings();st[k]=JSON.stringify(fn(parseJ(st[k],def)));render();
 let v=st[k];try{const fresh=await apiGet();if(fresh.settings&&k in fresh.settings){v=JSON.stringify(fn(parseJ(fresh.settings[k],def)));S.data.settings[k]=v}}catch(e){}
 return apiPost({action:'setting',k,v})}
function bankSnap(r){const x=JSON.parse(JSON.stringify(r));x.savedAt=today();delete x.when;return x}
function addToBank(r,quiet){if(!r||inBank(r.id))return false;const snap=bankSnap(r),len=JSON.stringify(snap).length;
 const row=BANK_ROWS().find(k=>String(settings()[k]||'[]').length+len<45000);
 if(!row){if(!quiet)toast('Receptbanken är full. Lägg till fler rader receptbank_N i Inställningar.');return false}
 updJSON(row,[],a=>a.some(x=>x.id===snap.id)?a:a.concat([snap]));if(!quiet)toast('Sparat i receptbanken');return true}

/* ---------- flikrad ---------- */
// Knapparna byggs en gång så att markeringen kan glida mellan flikarna i stället för att ritas om.
function renderNav(nav){
 if(!nav.querySelector('.nav-pill'))nav.innerHTML='<div class="brand" aria-hidden="true">Hemma</div><div class="nav-pill" aria-hidden="true"></div>'+VIEWS.map(([id,l,ic])=>'<button data-act="nav" data-id="'+id+'">'+ic+'<span>'+l+'</span></button>').join('')+'';
 const i=VIEW_IDS.indexOf(S.view);
 nav.querySelectorAll('button').forEach((b,j)=>j===i?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
 // Ekonomi ligger inte i flikraden på telefon; då visas ingen markering där
 nav.classList.toggle('none',i<0||i>=VIEWS.length);nav.style.setProperty('--i',Math.max(0,Math.min(i,VIEWS.length-1)))}
// Dra fingret längs flikraden för att flytta markeringen, släpp för att byta flik.
(function(){const nav=document.getElementById('nav');let st=null,skip=false;
 const at=x=>{const r=nav.getBoundingClientRect(),w=(r.width-8)/VIEWS.length,dx=Math.min(Math.max(x-r.left-4-w/2,0),w*(VIEWS.length-1));return{dx,j:Math.round(dx/w)}};
 nav.addEventListener('pointerdown',e=>{if(matchMedia('(min-width:900px)').matches||e.button>0)return;st={x0:e.clientX,id:e.pointerId,moved:false}});
 nav.addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;
  if(!st.moved){if(Math.abs(e.clientX-st.x0)<8)return;st.moved=true;nav.classList.add('drag');try{nav.setPointerCapture(e.pointerId)}catch(_){}}
  const p=at(e.clientX);nav.style.setProperty('--dx',p.dx+'px');nav.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('over',k===p.j))});
 const end=(e,go)=>{if(!st||e.pointerId!==st.id)return;const moved=st.moved;st=null;if(!moved)return;
  const p=at(e.clientX);nav.classList.remove('drag');nav.querySelectorAll('.over').forEach(b=>b.classList.remove('over'));
  skip=true;setTimeout(()=>skip=false,60);
  if(go&&VIEWS[p.j][0]!==S.view)ACT.nav(VIEWS[p.j][0])};
 nav.addEventListener('pointerup',e=>end(e,true));nav.addEventListener('pointercancel',e=>end(e,false));
 nav.addEventListener('click',e=>{if(skip){e.stopPropagation();e.preventDefault()}},true)})();

/* ---------- api ---------- */
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)}
function setData(d){S.data=d;S.lastSync=new Date();S.error='';try{lsSet('cache',JSON.stringify(d))}catch(e){}}
async function apiGet(){
 const r=await fetch(CFG.api+'?key='+encodeURIComponent(S.key)+'&t='+Date.now(),{cache:'no-store'});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'Okänt fel');return j.data}
let queue=Promise.resolve();
function apiPost(body){
 S.pending++;S.sync='busy';renderStatus();
 queue=queue.then(async()=>{
  try{
   const r=await fetch(CFG.api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({},body,{key:S.key,by:S.me}))});
   const j=await r.json();if(!j.ok)throw new Error(j.error||'Okänt fel');
   S.pending--;if(!S.pending){setData(j.data);S.sync='idle'}
  }catch(e){S.pending--;S.sync='err';S.error=e.message;toast('Ändringen sparades inte: '+e.message);refresh(true)}
  render();
 });
 return queue}
async function refresh(silent){
 if(!S.key||!CFG.api)return;
 if(S.pending)return;
 if(!silent){S.sync='busy';renderStatus()}
 try{const d=await apiGet();if(!S.pending){setData(d);S.sync='idle'}}
 catch(e){S.sync='err';S.error=e.message;if(/hushållskod/i.test(e.message)){S.key='';lsSet('key',null)}}
 render()}

/* ---------- cleaning logic ---------- */
const daysSince=s=>isDate(s)?Math.round((parse(today())-parse(s))/864e5):999;
const ratio=t=>daysSince(t.lastDone)/(t.freq||7);
const doneToday=t=>t.lastDone===today();
const snoozed=t=>t.snoozeUntil&&t.snoozeUntil>today();
const planned=t=>t.plannedFor&&t.plannedFor<=today();
function budget(){const st=settings();const bi=String(st.stadtid_idag||'').split('|');if(bi[0]===today()&&bi[1])return Number(bi[1]);
 const wd=new Date().getDay();return(wd===0||wd===6)?Number(st.stadtid_helg||40):Number(st.stadtid_vardag||20)}
function cleanPlan(){
 const B=budget(),all=D().clean;
 const routines=all.filter(t=>t.freq<=1).sort((a,b)=>(a.order||0)-(b.order||0));
 const rot=all.filter(t=>t.freq>1);
 const doneRot=rot.filter(doneToday);
 const plan=rot.filter(t=>planned(t)&&!doneToday(t));
 const cand=rot.filter(t=>!doneToday(t)&&!snoozed(t)&&!planned(t)&&t.freq<30&&ratio(t)>=1).sort((a,b)=>ratio(b)-ratio(a)||a.min-b.min);
 let used=doneRot.reduce((s,t)=>s+t.min,0)+plan.reduce((s,t)=>s+t.min,0);
 const picks=[];
 for(const c of cand){if(used+c.min<=B||(used===0&&!picks.length&&c.min<=B*1.5)){picks.push(c);used+=c.min}}
 const later=cand.filter(c=>!picks.includes(c)).slice(0,4);
 const soon=rot.filter(t=>!doneToday(t)&&!planned(t)&&t.freq<30&&ratio(t)<1).sort((a,b)=>ratio(b)-ratio(a)).slice(0,3);
 const big=rot.filter(t=>t.freq>=30&&!doneToday(t)&&!planned(t)).sort((a,b)=>ratio(b)-ratio(a));
 const todo=[...plan,...picks];
 const minLeft=todo.reduce((s,t)=>s+t.min,0)+routines.filter(t=>!doneToday(t)).reduce((s,t)=>s+t.min,0);
 return{B,routines,doneRot,todo,later,soon,big,minLeft}}
function roomHealth(){
 return ROOMS.map(r=>{const ts=D().clean.filter(t=>t.room===r&&t.freq>1);if(!ts.length)return null;
  const sc=ts.reduce((s,t)=>{const q=ratio(t);return s+(q<=1?1:Math.max(0,2-q))},0)/ts.length;return{room:r,score:sc}}).filter(Boolean)}
const healthWord=s=>s>=.85?'Fint':s>=.6?'Okej':'Dags snart';
const healthCls=s=>s>=.85?'':s>=.6?'warn':'bad';
function nextSaturday(){let d=addDays(today(),1);while(parse(d).getDay()!==6)d=addDays(d,1);return d}
const freqText=f=>f<=1?'varje dag':f===7?'varje vecka':f===14?'varannan vecka':f===30?'varje månad':f===90?'var tredje månad':'var '+f+':e dag';

/* ---------- plan helpers ---------- */
function planDays(){
 const st=settings(),d=D();let dates=[];
 if(isDate(st.vecka_start)&&isDate(st.vecka_slut)){let x=st.vecka_start;for(let i=0;i<14&&x<=st.vecka_slut;i++){dates.push(x);x=addDays(x,1)}}
 else dates=[...new Set(d.menu.map(m=>m.date).concat(d.events.map(e=>e.date)))].filter(isDate).sort();
 return dates.map(date=>({date,events:d.events.filter(e=>e.date===date),meals:d.menu.filter(m=>m.date===date)}))}
const dayOf=date=>{const d=D();const ev=d.events.filter(e=>e.date===date),ms=d.menu.filter(m=>m.date===date);return(ev.length||ms.length)?{date,events:ev,meals:ms}:null};
function whoChip(w){const k=w==='Henrik'?'k':w==='Vegetariskt'?'v':w==='Gemensam'?'g':'';return'<span class="chip '+k+'">'+esc(w==='Henrik'?'Kött':w)+'</span>'}
// Vem en kalenderhändelse gäller (kolumnen Vem i Händelser). Ingen chip när namnet redan står i titeln.
function evWho(e){const w=String(e.who||e.vem||'').trim();if(!w||String(e.title||'').toLowerCase().split(/[^a-zåäöé-]+/).includes(w.toLowerCase()))return'';return' <span class="chip'+(w==='Henrik'?' h':'')+'">'+esc(w)+'</span>'}
const shopCost=items=>items.reduce((s,i)=>s+(Number(i.price)||0),0);
const isBase=i=>(i.meals||[]).length>0&&(i.meals||[]).every(m=>m==='Bas');
function planPortions(){const ids=new Set();D().menu.forEach(m=>{if(m.recipe)ids.add(m.recipe)});
 String(settings().storkok||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(id=>ids.add(id));
 let n=0;ids.forEach(id=>{const r=recipeById(id);if(r&&r.course!=='efterrätt')n+=r.portions||0});return n}

/* ---------- render ---------- */
/* ---------- render ---------- */
let rq=0,pendingRender=false;
function render(){if(rq)return;rq=setTimeout(()=>{rq=0;doRender()},0)}
function busyTyping(){const a=document.activeElement;return a&&a.closest&&a.closest('#main,#overlay')&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.type!=='checkbox'}
function renderStatus(){const el=document.getElementById('sync');if(el)el.outerHTML=statusHtml()}
function statusHtml(){const t=S.lastSync?pad(S.lastSync.getHours())+':'+pad(S.lastSync.getMinutes()):'';
 const cls=S.sync==='busy'?'busy':S.sync==='err'?'err':'';const txt=S.sync==='busy'?'Sparar…':S.sync==='err'?'Ingen kontakt':(t?'Uppdaterad '+t:'Inte uppdaterad än');
 return'<button type="button" class="cell link sync '+cls+'" id="sync" data-act="refresh"><i></i><span class="grow">'+txt+'</span><span class="val">Uppdatera</span></button>'}
/* Kompakt rubrikrad: NB fylls av vyn som ritas, observatören kopplas om efter varje rendering */
let NB={title:'',back:false},io=null;
function watchTitle(){
 const bar=document.getElementById('navbar');if(!bar)return;
 if(io){io.disconnect();io=null}
 document.getElementById('nb-title').textContent=NB.title||'';
 document.getElementById('nb-left').innerHTML=NB.back?'<button class="back" data-act="recipeBack">'+I.back+'Mat</button>':'';
 const lt=document.getElementById('lt');
 const show=on=>{bar.classList.toggle('on',on);bar.setAttribute('aria-hidden',String(!on));bar.inert=!on};
 if(!lt||!('IntersectionObserver' in window)){show(false);return}
 io=new IntersectionObserver(es=>{const e=es[es.length-1];show(!e.isIntersecting&&e.boundingClientRect.top<bar.offsetHeight)},{rootMargin:'-'+(bar.offsetHeight||44)+'px 0px 0px 0px',threshold:0});
 io.observe(lt)}
function doRender(){
 document.body.classList.toggle('wall',S.wall);
 document.body.classList.toggle('cook-open',!!S.cook);
 const nav=document.getElementById('nav'),m=document.getElementById('main');
 NB={title:'',back:false};
 if(!CFG.api||/DIN-/.test(CFG.api)){nav.hidden=true;m.innerHTML='<div class="setup"><h1 class="lt">Hemma</h1><div class="banner">Appen är inte kopplad till kalkylarket än. Lägg in adressen till Apps Script-webbappen i filen <b>config.js</b>.</div></div>';watchTitle();return}
 if(!S.key){nav.hidden=true;renderOverlay();if(busyTyping())return;m.innerHTML=setupHtml();watchTitle();return}
 nav.hidden=false;
 renderNav(nav);
 renderOverlay();
 if(busyTyping()){pendingRender=true;return}
 pendingRender=false;
 if(!S.data){m.innerHTML='<div class="setup"><h1 class="lt">Hemma</h1><p>Hämtar hushållets data…</p>'+(S.sync==='err'?'<div class="banner">'+esc(S.error)+'</div><div class="block"><button class="btn-tint" style="width:100%" data-act="refresh">Försök igen</button></div>':'')+'</div>';watchTitle();return}
 const banner=S.sync==='err'?'<div class="banner">Ingen kontakt med kalkylarket just nu. Du ser senast hämtade data. '+esc(S.error)+'</div>':'';
 A.before(m);
 m.innerHTML=banner+(V[S.view]||V.oversikt)();
 watchTitle();
 A.after(m);
}
document.addEventListener('focusout',()=>setTimeout(()=>{if(pendingRender&&!busyTyping())render()},50));
function setupHtml(){return'<form class="setup" data-form="setup"><h1 class="lt">Hemma</h1><p>Skriv hushållets kod för att öppna tavlan. Du behöver bara göra det en gång på den här enheten.</p>'+
 '<div class="sh">Hushållskod</div><div class="group"><div class="cell"><input id="setup-key" name="key" class="field" placeholder="t.ex. lingon-tass-42" autocomplete="off" autocapitalize="none" spellcheck="false" required></div></div>'+
 '<div class="block"><button class="btn-fill" style="width:100%">Öppna tavlan</button></div>'+(S.error?'<div class="banner">'+esc(S.error)+'</div>':'')+'</form>'}

/* Byggstenar */
const gearBtn='<button class="ib" data-act="settings" aria-label="Inställningar">'+I.gear+'</button>';
function head(title,o){o=o||{};NB.title=title;
 return'<header class="head">'+(o.eyebrow?'<div class="eyebrow">'+o.eyebrow+'</div>':'')+'<div class="head-row"><h1 class="lt" id="lt">'+esc(title)+'</h1><div class="tools">'+(o.tools||'')+gearBtn+'</div></div>'+(o.sub?'<div class="sub">'+o.sub+'</div>':'')+'</header>'}
const sh=(l,r,cls)=>'<div class="sh'+(cls?' '+cls:'')+'"><span>'+l+'</span>'+(r!=null&&r!==''?'<span class="r">'+r+'</span>':'')+'</div>';
const group=inner=>'<div class="group">'+inner+'</div>';
// Segmentreglage; markeringen är ett eget element så att den kan glida mellan valen
function segc(label,act,opts,cur){const i=Math.max(0,opts.findIndex(o=>o[0]===cur));
 return'<div class="segc" role="group" aria-label="'+esc(label)+'" data-seg="'+esc(act)+'" style="--n:'+opts.length+';--i:'+i+'"><i class="seg-thumb" aria-hidden="true"></i>'+opts.map(([k,l])=>'<button type="button" data-act="'+act+'" data-id="'+k+'" aria-pressed="'+(cur===k)+'">'+l+'</button>').join('')+'</div>'}
const emptyCell=t=>'<div class="cell empty">'+t+'</div>';
const chevron='<span class="chev">'+I.chev+'</span>';
function weekSub(){const st=settings();return esc(st.vecka_rubrik||'')+(isDate(st.uppdaterad)?' · uppdaterad '+esc(dateShort(st.uppdaterad)):'')}
const dayHead=s=>{const d=parse(s);return DAYS[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]};

const V={};
function widget(id,cls,icon,label,right,body){return'<section class="widget'+(cls?' '+cls:'')+'" data-act="nav" data-id="'+id+'"><button class="wh" data-act="nav" data-id="'+id+'" style="width:100%">'+icon+'<span>'+label+'</span>'+(right?'<span class="r">'+right+'</span>':'')+'</button>'+body+'</section>'}
V.oversikt=function(){
 const t=today(),now=new Date(),days=planDays();
 const td=dayOf(t),tm=dayOf(addDays(t,1));
 const nextDay=(td&&td.meals.length)?td:days.find(d=>d.date>t&&d.meals.length);
 const cp=cleanPlan(),d=D();
 const left=d.shop.filter(i=>!i.done);
 const tasksNow=d.tasks.filter(x=>!x.done&&isDate(x.due)&&x.due<=t).sort((a,b)=>a.due.localeCompare(b.due));
 const tasksSoon=d.tasks.filter(x=>!x.done&&!(isDate(x.due)&&x.due<=t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,4);
 let h=head('Översikt');
 h+=heroHtml();
 h+='<div class="widgets">';
 const isT=nextDay&&nextDay.date===t;
 h+=widget('mat','w2',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',
  nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel inlagd än. Den fylls i när veckoplaneringen körs på onsdag.</div>');
 const doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 h+=widget('stad','',I.sparkles,'Städ','','<div class="wbig">'+nv('w-clean',doneN)+'<small>/'+totN+'</small></div><div class="sub">'+nv('w-min',cp.minLeft)+' min kvar</div><div class="thin"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>');
 h+=widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+nv('w-shop',left.length)+'</div><div class="sub">kvar · ca '+nv('w-shopkr',shopCost(left),'kr')+'</div>');
 const tl=tasksNow.concat(tasksSoon).slice(0,5);
 h+=widget('uppgifter','w2',I.list,'Uppgifter',tasksNow.length?tasksNow.length+' idag':'',tl.length?'<div class="wl">'+tl.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra just nu.</div>');
 const rh=roomHealth();
 h+=widget('stad','w2',I.home,'Hemmet','',rh.length?'<div class="wl">'+rh.map(healthRow).join('')+'</div>':'<div class="wempty">Städschemat är tomt.</div>');
 if(tm)h+=widget('mat','w2',I.cal,'Imorgon',esc(dateShort(tm.date)),(eventsHtml(tm)||'<div class="wempty">Inga händelser.</div>')+(tm.meals.length?wMeals(tm):''));
 return h+'</div>'};
function wMeals(d){return(d.meals||[]).map(m=>{const r=m.recipe&&recipeById(m.recipe);const tag=r?'button':'div';
 return'<'+tag+' class="wmeal"'+(r?' data-act="recipe" data-id="'+esc(m.recipe)+'"':'')+'><div class="top">'+whoChip(m.who)+(r&&r.kr?'<span class="val">'+kr(r.kr)+'/port</span>':'')+'</div><div class="hl title">'+esc(m.title)+'</div>'+(m.addon?'<div class="sub">+ Kött: '+esc(m.addon)+'</div>':'')+'</'+tag+'>'}).join('')}
const healthRow=r=>'<div class="cell room"><div class="grow"><div>'+esc(r.room)+'</div><div class="cap '+healthCls(r.score)+'"><i style="width:'+Math.round(r.score*100)+'%"></i></div></div><span class="hw '+healthCls(r.score)+'">'+healthWord(r.score)+'</span></div>';
function eventsHtml(d){if(!d||!d.events.length)return'';return'<div class="evs">'+d.events.map(e=>'<div class="ev"><span class="t">'+esc(e.time||'Heldag')+'</span><span>'+esc(e.title)+evWho(e)+'</span></div>').join('')+'</div>'}

/* Mat: Vecka | Recept */
V.mat=function(){
 if(S.recipe){const r=recipeById(S.recipe);if(r)return recipeDetail(r);S.recipe=null}
 const ink=S.matTab==='inkop'?inkopParts():null;
 let h=head('Mat',ink?{sub:ink.sub,tools:ink.tools}:{sub:weekSub()});
 h+=segc('Visa','matTab',[['vecka','Vecka'],['inkop','Inköp'],['recept','Recept'],['bank','Receptbank']],S.matTab);
 return h+(ink?ink.body:S.matTab==='recept'?matRecipes():S.matTab==='bank'?matBank():matWeek())};
/* Receptbanken: stora kort att bläddra i när man inte vet vad man vill äta */
const FOOD=[[/soppa/i,'🍲'],[/dal|curry/i,'🍛'],[/gryta/i,'🥘'],[/kyckling/i,'🍗'],[/lax|fisk|torsk|sej/i,'🐟'],[/pasta|lasagne|spagetti/i,'🍝'],[/sallad|bulgur/i,'🥗'],[/shakshuka|ägg|omelett/i,'🍳'],[/blåbär|bär|efterrätt|kaka/i,'🫐'],[/pizza/i,'🍕'],[/taco|tortilla/i,'🌮'],[/burgare/i,'🍔'],[/fläsk|kött|biff/i,'🥩'],[/blomkål|grönsak|aubergine/i,'🥦']];
const foodIcon=t=>(FOOD.find(([re])=>re.test(t||''))||[0,'🍽️'])[1];
const kind=r=>r.who==='Henrik'?'k':r.who==='Vegetariskt'?'v':r.who==='Gemensam'?'g':'';
function matBank(){
 const f=S.bankFilter||'alla',w=new Set(wishes().map(x=>x.id));
 const all=bankList().map(r=>({r,g:ratingOf(r.id)})).sort((a,b)=>((b.g?b.g.avg:0)-(a.g?a.g.avg:0))||String(b.r.savedAt||'').localeCompare(String(a.r.savedAt||'')));
 const fs=[['alla','Alla'],['k','Kött'],['v','Vegetariskt'],['g','Gemensam'],['snabbt','Snabbt'],['storkok','Storkok'],['onskat','Önskade']];
 const ok=({r})=>f==='alla'||(f==='snabbt'?r.min&&r.min<=30:f==='storkok'?/storkok/i.test((r.group||'')+r.title):f==='onskat'?w.has(r.id):kind(r)===f);
 let h='<div class="fchips" role="group" aria-label="Filter">'+fs.map(([k,l])=>'<button data-act="bankFilter" data-id="'+k+'" aria-pressed="'+(f===k)+'">'+l+'</button>').join('')+'</div>';
 const list=all.filter(ok);
 if(!all.length)return h+'<div style="height:16px"></div>'+group(emptyCell('Receptbanken är tom än. Recept som får 4–5 stjärnor eller Laga igen sparas här automatiskt, och du kan spara vilket recept som helst från receptsidan.'));
 if(!list.length)return h+'<div style="height:16px"></div>'+group(emptyCell('Inga recept matchar filtret.'));
 return h+'<div class="bank">'+list.map(({r,g})=>{const wished=w.has(r.id);
  return'<article class="bcard '+kind(r)+'"><button class="bimg" data-act="recipe" data-id="'+esc(r.id)+'" aria-label="Öppna '+esc(r.title)+'">'+(r.img?'<img src="'+esc(r.img)+'" alt="" loading="lazy">':'<span aria-hidden="true">'+foodIcon(r.title)+'</span>')+'</button>'+
  '<div class="bbody"><div class="chips-row">'+whoChip(r.who)+(r.min?'<span class="chip num">'+r.min+' min</span>':'')+(r.kr?'<span class="chip num">'+kr(r.kr)+'/port</span>':'')+'</div>'+
  '<button class="btitle" data-act="recipe" data-id="'+esc(r.id)+'">'+esc(r.title)+'</button>'+
  (g?'<div class="bstars"><span class="st" aria-label="'+g.avg.toFixed(1)+' av 5">'+starsTxt(g.avg)+'</span>'+g.people.map(([p,e])=>'<span class="fn">'+esc(p)+': '+esc(VERD[e.v]||'')+'</span>').join('')+'</div>':'<div class="fn">Inget betyg än</div>')+
  '<button class="pill'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'">'+(wished?I.tick+'Önskad nästa vecka':'Vill ha nästa vecka')+'</button></div></article>'}).join('')+'</div>'}
function mealCell(m){const r=m.recipe&&recipeById(m.recipe);
 const inner='<div class="grow"><div class="chips-row">'+whoChip(m.who)+'</div><div class="title" style="margin-top:3px">'+esc(m.title)+'</div>'+(m.addon?'<div class="meta">+ Kött: '+esc(m.addon)+'</div>':'')+(m.note?'<div class="meta">'+esc(m.note)+'</div>':'')+(m.recipe&&ratingOf(m.recipe)?'<div class="meta"><span class="st">'+starsTxt(ratingOf(m.recipe).avg)+'</span></div>':'')+'</div>'+(r&&r.kr?'<span class="val">'+kr(r.kr)+'/port</span>':'');
 return r?'<button class="cell link meal-cell" data-act="recipe" data-id="'+esc(m.recipe)+'">'+inner+chevron+'</button>':'<div class="cell meal-cell">'+inner+'</div>'}
function recipeCell(r,meta){return'<button class="cell link" data-act="recipe" data-id="'+esc(r.id)+'"><div class="grow"><div class="title">'+esc(r.title)+'</div><div class="meta">'+meta+'</div></div>'+whoChip(r.who)+chevron+'</button>'}
function matWeek(){
 const t=today(),d=D(),st=settings(),days=planDays();let h='';
 if(!days.length)return'<div style="height:22px"></div>'+group(emptyCell('Matsedeln fylls i när veckoplaneringen körs på onsdag.'));
 const total=shopCost(d.shop.filter(i=>!isBase(i))),port=planPortions();
 h+='<div class="stats"><div class="stat"><span class="fn">Maten kostar ca</span><b>'+nv('m-total',total,'kr')+'</b></div><div class="stat"><span class="fn">Portioner</span><b>'+nv('m-port',port)+'</b></div><div class="stat"><span class="fn">Per portion</span><b>'+(port?nv('m-per',total/port,'kr'):'–')+'</b></div></div>';
 days.forEach(x=>{
  h+=sh(esc(dayHead(x.date))+(x.date===t?' <span class="acc">· Idag</span>':''));
  h+=group(x.meals.length?x.meals.map(mealCell).join(''):emptyCell('Ingen mat planerad.'))});
 const batch=String(st.storkok||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(batch.length){h+=sh('Storkok')+group(batch.map(id=>{const r=recipeById(id);return r?recipeCell(r,r.portions+' portioner'+(r.kr?' · '+kr(r.kr)+'/port':'')):''}).join(''));
  if(st.storkok_not)h+='<div class="foot">'+esc(st.storkok_not)+'</div>'}
 if(d.offers.length){h+=sh('Erbjudanden menyn bygger på')+group(d.offers.map(o=>'<div class="cell"><div class="grow"><div class="title">'+esc(o.item)+'</div><div class="meta">'+esc(o.store)+(o.note?' · '+esc(o.note):'')+'</div></div><span class="val">'+esc(o.price)+'</span></div>').join(''));
  if(st.erbjudanden_not)h+='<div class="foot">'+esc(st.erbjudanden_not)+'</div>'}
 return h}
function matRecipes(){
 const rs=D().recipes;let h='';
 if(!rs.length)return'<div style="height:22px"></div>'+group(emptyCell('Inga recept än. De skapas tillsammans med veckans matsedel.'));
 const groups=[...new Set(['Storkok','Vardag','Helg'].concat(rs.map(r=>r.group||'Övrigt')))];
 groups.forEach(g=>{const list=rs.filter(r=>(r.group||'Övrigt')===g);if(!list.length)return;
  h+=sh(esc(g))+group(list.map(r=>recipeCell(r,'<span class="num">'+r.min+' min · '+r.portions+' port'+(r.kr?' · '+kr(r.kr)+'/port':'')+'</span>')).join(''))});
 return h}

// Inköpslistan visas som en flik i Mat; ger rubrikens undertext, verktyg och innehåll
function inkopParts(){
 const d=D(),all=d.shop,f=S.shopFilter,st=settings();
 const groups=[['alla','Alla'],['offer','Erbjudanden'],['Vardag','Vardag'],['Helg','Helg'],['Storkok kött','Storkok kött'],['Storkok veg','Storkok veg'],['Bas','Bas'],['egen','Egna']];
 const match=i=>f==='alla'?true:f==='offer'?!!i.offer:f==='egen'?i.source==='egen':f==='Vardag'?(i.meals||[]).some(m=>m==='Vardag'||/^(Mån|Tis|Ons|Tor)/.test(m)):(i.meals||[]).some(m=>m.startsWith(f));
 const items=all.filter(match),left=all.filter(i=>!i.done),bought=all.filter(i=>i.done);
 const total=shopCost(all),port=planPortions(),mealCost=shopCost(all.filter(i=>!isBase(i))),B=Number(st.matbudget)||0;
 const sub=left.length+' kvar · ca '+kr(shopCost(left)),tools='<button class="ib plus" data-act="shopAdd" aria-label="Ny vara">'+I.plus+'</button>';let h='';
 h+='<div class="stats'+(B?' s4':'')+'"><div class="stat"><span class="fn">Hela listan</span><b>'+nv('s-total',total,'kr')+'</b></div><div class="stat"><span class="fn">Kvar att betala</span><b>'+nv('s-left',shopCost(left),'kr')+'</b></div><div class="stat"><span class="fn">Mat per portion</span><b>'+(port?kr(mealCost/port):'–')+'</b><span class="fn">'+port+' portioner</span></div>'+
  (B?'<div class="stat"><span class="fn">Budget '+kr(B)+'</span><b>'+(total>B?'+'+kr(total-B):kr(B-total)+' kvar')+'</b><div class="thin '+(total>B?'bad':total>B*.9?'warn':'')+'"><i style="width:'+Math.min(100,Math.round(total/B*100))+'%"></i></div></div>':'')+'</div>';
 h+='<div class="fchips" role="group" aria-label="Filter">'+groups.map(([k,l])=>'<button data-act="shopFilter" data-id="'+esc(k)+'" aria-pressed="'+(f===k)+'">'+l+'</button>').join('')+'</div>';
 h+='<div class="split"><div class="col">';
 if(!all.length)h+='<div style="height:22px"></div>'+group(emptyCell('Listan är tom. Veckoplaneringen fyller i den på onsdagar, och ni kan lägga till egna varor.'));
 CATS.forEach(c=>{const g=items.filter(i=>(CATS.includes(i.cat)?i.cat:'Övrigt')===c).sort((a,b)=>(a.done-b.done)||(a.order||0)-(b.order||0));if(!g.length)return;
  h+=sh(c,kr(shopCost(g)))+group(g.map(shopRow).join(''))});
 if(bought.length)h+='<div class="pills" style="padding:12px 16px 0 24px">'+(S.confirm==='clearShop'?'<span class="sub">Ta bort '+bought.length+' avbockade?</span><button class="tb red strong" data-act="clearShopYes">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="tb red" data-act="clearShop">Rensa avbockade ('+bought.length+')</button>')+'</div>';
 h+='</div><div class="col">';
 const prefs=(st.pref_henrik?'<div class="cell"><div class="grow"><span class="chip k">Kött</span><div class="meta" style="color:var(--ink)">'+esc(st.pref_henrik)+'</div></div></div>':'')+(st.pref_veg?'<div class="cell"><div class="grow"><span class="chip v">Vegetariskt</span><div class="meta" style="color:var(--ink)">'+esc(st.pref_veg)+'</div></div></div>':'')+(st.pref_ekonomi?'<div class="cell"><div class="grow"><span class="chip">Ekonomi</span><div class="meta" style="color:var(--ink)">'+esc(st.pref_ekonomi)+'</div></div></div>':'');
 if(prefs)h+=sh('Hushållets preferenser')+group(prefs);
 const offers=all.filter(i=>i.offer);
 if(offers.length)h+=sh('Erbjudanden på listan')+group(offers.map(i=>'<div class="cell"><div class="grow"><div class="title">'+esc(i.name)+'</div><div class="meta">'+esc(i.offer)+'</div></div></div>').join(''))+'<div class="foot">Priserna är uppskattade. Kolla hyllkanten i butiken.</div>';
 return{sub,tools,body:h+'</div></div>'}}
function shopRow(i){const chips=(i.offer?'<span class="chip offer">'+esc(i.store||'Erbjudande')+'</span>':'')+(i.meals||[]).map(m=>'<span class="chip">'+esc(m)+'</span>').join('')+(i.source==='egen'&&i.addedBy?'<span class="chip">'+esc(i.addedBy)+'</span>':'');
 return'<div class="cell ck'+(i.done?' done':'')+'"><input type="checkbox" class="check" data-act="shopToggle" data-id="'+esc(i.id)+'" aria-label="'+esc(i.name)+'"'+(i.done?' checked':'')+'><button class="grow rowbtn" data-act="shopToggle" data-id="'+esc(i.id)+'"><div class="title">'+esc(i.name)+'</div>'+((i.qty||chips)?'<div class="meta">'+(i.qty?'<span>'+esc(i.qty)+'</span>':'')+chips+'</div>':'')+'</button><span class="val">'+(i.price?kr(i.price):'')+'</span></div>'}

function scaled(r){const p=S.scale[r.id]||r.portions;return{p,f:p/r.portions}}
const qtyText=(it,f)=>it.q!=null?fmtQ(it.q*f)+' '+(it.u||''):(it.u||'');
const ingRow=(it,f,hit)=>'<div class="ingx'+(hit?' hit':'')+'"><span class="q">'+esc(qtyText(it,f))+'</span><span class="n">'+esc(it.n)+'</span></div>';
function ingList(r,f,hits){return(r.groups||[]).map(g=>(g.title?'<div class="sh sub2">'+esc(g.title)+'</div>':'')+group(g.items.map(it=>ingRow(it,f,hits&&hits.includes(it))).join(''))).join('')}

/* Vilka ingredienser nämns i ett steg? Jämför ordstammar åt båda hållen,
   så att böjningar (purjolöken/purjolökar) och sammansättningar
   (kycklingen/kycklinglårfilé, buljongen/grönsaksbuljongtärning) hittas. */
const ING_SKIP=new Set(['fryst','frysta','naturell','naturella','färsk','färska','kokta','kokt','gul','gula','röda','torkad','torkade','burk','burkar','kolla','hemma','servering','salt','peppar','och']);
const STEP_SKIP=new Set(['till','eller','från','under','inte','efter','innan','sedan','medan','minuter','minut','sista','några','hela','halva','halv','resten','gärna','lägg','låt','tillsätt','servera','rör','ihop','alltihop','samma','varje','omgång','omgångar','lådor','lådorna','grader','ugnen','plåt','plåten','panna','pannan','gryta','grytan','kastrull','skålar','lock','smaka','tills','genom','över','runt','omkring','mycket','både','andra','sida','sidan','stavar','bitar','stora','små','tunt','fint','grovt','slät','grov','medelvärme','klart','klar','varma','varm','het','heta','torr','torra','enligt','förpackningen','klick','fyra','gropar','soppan','såsen','fräs','koka','stek','rosta','hacka','skiva','skär','riv','dela','blanda','vänd','pensla','toppa','fördela','spara','packa','värm','mixa','skölj','sköljda','krama']);
const words=s=>String(s||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/till servering|kolla hemma/g,' ').split(/[^a-zåäöéü]+/).filter(Boolean);
const stem=w=>w.slice(0,Math.max(4,w.length-3));
// Ingrediensens grundform: ta bort pluraländelser (lökar → lök, bönor → bön) innan stammen tas fram
const ingStem=w=>{const b=w.replace(/(ar|or|er)$/,'');const x=b.length>=3?b:w;return x.length<=4?x:stem(x)};
const MEAT=/fläsk|kyckling|färs|nöt|kött|biff|kalkon|lamm/;
function ingInStep(stepText,name){
 const sw=words(stepText),iw=words(name).filter(w=>w.length>=3&&!ING_SKIP.has(w));
 // salt och peppar räknas bara när de nämns uttryckligen (salt, salta, peppar, peppra)
 const nw=words(name);
 if(nw.includes('salt')&&sw.some(x=>x.startsWith('salt')))return true;
 if(nw.includes('peppar')&&sw.some(x=>x.startsWith('pepp')))return true;
 if(!iw.length)return false;
 // "köttet" betyder receptets kött
 if(MEAT.test(name.toLowerCase())&&sw.some(x=>x.startsWith('kött')))return true;
 // ingrediensens ord i steget (stegets ord börjar med ingrediensens stam)
 if(iw.some(w=>{const s=ingStem(w);return sw.some(x=>x.startsWith(s))}))return true;
 // stegets ord i ingrediensnamnet (t.ex. "kycklingen" i "kycklinglårfilé")
 const name2=iw.join(' ');
 return sw.some(x=>{if(x.length<4||STEP_SKIP.has(x))return false;if(name2.includes(stem(x)))return true;return x.length>=8&&name2.includes(x.slice(0,5))})}
// Grupper för Henriks tillägg räknas bara i steg som gäller Henriks del, och tvärtom.
function stepIngredients(r,step){
 const gs=r.groups||[],isH=g=>/henrik/i.test(g.title||''),hasH=gs.some(isH);
 const pick=want=>{const out=[];gs.forEach(g=>{if(hasH&&isH(g)!==want)return;g.items.forEach(it=>{if(ingInStep(step.t,it.n))out.push(it)})});return out};
 const henrikStep=/^henriks? del/i.test(step.t);
 const out=pick(henrikStep);
 return(!out.length&&hasH&&!henrikStep)?pick(true):out}
window.__htStepIngredients=stepIngredients;
function recipeDetail(r){
 const{p,f}=scaled(r);
 const act=Math.min(S.step[r.id]||0,r.steps.length-1),actHits=stepIngredients(r,r.steps[act]);
 NB.title=r.title;NB.back=true;
 let h='<div class="rcp-top"><button class="back" data-act="recipeBack">'+I.back+'Mat</button>';
 h+='<div class="chips-row">'+whoChip(r.who)+(r.when?'<span class="chip">'+esc(r.when)+'</span>':'')+(r.freezes?'<span class="chip v">Går att frysa</span>':'')+'</div><h1 class="t1" id="lt">'+esc(r.title)+'</h1></div>';
 const facts=[['Tid','<span class="num">'+r.min+'</span> min']];if(r.kr)facts.push(['Per portion',kr(r.kr)]);if(r.protein)facts.push(['Protein',esc(r.protein)]);
 h+='<div class="group" style="margin-top:16px"><div class="rcp-facts" style="grid-template-columns:repeat('+facts.length+',minmax(0,1fr))">'+facts.map(([l,v])=>'<div><div class="fn">'+l+'</div><div class="v">'+v+'</div></div>').join('')+'</div></div>';
 if(r.why)h+='<div class="group" style="margin-top:12px"><div class="note">'+esc(r.why)+'</div></div>';
 h+='<div class="block"><button class="btn-fill" style="width:100%" data-act="cook" data-id="'+esc(r.id)+'">'+I.play+'Börja laga</button></div>';
 h+='<div class="recipe"><div class="col">';
 h+='<div class="sh with-ctl"><span>Ingredienser</span><span class="stepper"><button data-act="scale" data-id="'+esc(r.id)+'" data-d="-1" aria-label="Färre portioner">−</button><span><b>'+p+'</b> port</span><button data-act="scale" data-id="'+esc(r.id)+'" data-d="1" aria-label="Fler portioner">+</button></span></div>';
 h+=ingList(r,f,actHits)+'<div class="foot">Markerat: det som behövs i steg '+(act+1)+'.</div>';
 h+='</div><div class="col">';
 h+=sh('Gör så här','<span style="text-transform:none">Tryck på ett steg för att markera det</span>');
 h+='<div class="group"><ol class="steps">'+r.steps.map((s,i)=>{const hs=i===act?actHits:stepIngredients(r,s),on=i===act;
  const timerBtn=s.timer?'<button class="pill" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+I.clock+s.timer+' min</button>':'';
  return'<li class="'+(on?'active':'')+'" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+i+'"><span class="no">'+(i+1)+'</span><div class="txt">'+esc(s.t)+
  (on?(hs.length?'<div class="now"><div class="fn">Det här steget</div>'+hs.map(it=>ingRow(it,f)).join('')+'</div>':'')+
    ((timerBtn||i<r.steps.length-1)?'<div class="pills">'+timerBtn+(i<r.steps.length-1?'<button class="pill" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+(i+1)+'">Nästa steg</button>':'')+'</div>':''):
   (hs.length?'<div class="uses">'+hs.map(it=>'<span>'+esc((qtyText(it,f)+' '+it.n).trim())+'</span>').join('')+'</div>':'')+(timerBtn?'<div class="pills">'+timerBtn+'</div>':''))+'</div></li>'}).join('')+'</ol></div>';
 if(r.tips)h+='<div class="group" style="margin-top:12px"><div class="note">'+esc(r.tips)+'</div></div>';
 h+=rateBlock(r);
 h+='</div></div>';
 return h}
function rateBlock(r){const g=ratingOf(r.id),wished=wishes().some(x=>x.id===r.id),me=S.me&&g&&g.people.find(([p])=>p===S.me);
 let h=sh('Betyg',g?'<span class="st">'+starsTxt(g.avg)+'</span> '+g.avg.toFixed(1).replace('.',','):'');
 h+=group((g?g.people.map(([p,e])=>'<div class="cell"><div class="grow"><div class="title">'+esc(p)+' <span class="st">'+starsTxt(e.s)+'</span></div><div class="meta"><span class="chip '+(e.v==='igen'?'v':e.v==='aldrig'?'h':'')+'">'+esc(VERD[e.v]||'')+'</span>'+(e.c?'<span>'+esc(e.c)+'</span>':'')+(e.d?'<span>'+esc(dateShort(e.d))+'</span>':'')+'</div></div></div>').join(''):emptyCell('Ingen har betygsatt receptet än.'))+
  '<button class="cell link" data-act="rate" data-id="'+esc(r.id)+'"><span class="grow" style="color:var(--accent)">'+(me?'Ändra ditt betyg':'Betygsätt receptet')+'</span>'+chevron+'</button>');
 h+='<div class="pills" style="padding:12px 16px 0">'+(inBank(r.id)?'<span class="pill on">'+I.tick+'I receptbanken</span>':'<button class="pill" data-act="bankAdd" data-id="'+esc(r.id)+'">Spara i receptbanken</button>')+
  '<button class="pill'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'">'+(wished?I.tick+'Önskad nästa vecka':'Vill ha nästa vecka')+'</button></div>';
 return h}

V.uppgifter=function(){
 const t=today(),d=D(),open=d.tasks.filter(x=>!x.done),done=d.tasks.filter(x=>x.done);
 const g=[['Försenade',open.filter(x=>isDate(x.due)&&x.due<t)],['Idag',open.filter(x=>x.due===t)],['Kommande',open.filter(x=>isDate(x.due)&&x.due>t).sort((a,b)=>a.due.localeCompare(b.due))],['Utan datum',open.filter(x=>!isDate(x.due))]];
 let h=head('Uppgifter',{sub:open.length+' att göra',tools:'<button class="ib plus" data-act="taskAdd" aria-label="Ny uppgift">'+I.plus+'</button>'});
 h+='<div class="split"><div class="col">';
 g.forEach(([l,xs])=>{if(!xs.length)return;h+=sh(l,xs.length,l==='Försenade'?'red':'')+group(xs.map(taskRow).join(''))});
 if(!open.length)h+='<div style="height:22px"></div>'+group(emptyCell('Inget att göra just nu.'));
 h+='</div><div class="col">';
 if(done.length)h+='<details data-k="done"'+(S.open.done||S.confirm==='clearTasks'?' open':'')+'><summary class="sh"><span>Klara ('+done.length+')</span></summary>'+group(done.map(taskRow).join(''))+
  '<div class="pills" style="padding:12px 16px 0 24px">'+(S.confirm==='clearTasks'?'<span class="sub">Ta bort alla klara?</span><button class="tb red strong" data-act="clearTasksYes">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="tb red" data-act="clearTasks">Rensa klara</button>')+'</div></details>';
 return h+'</div></div>'};
function taskRow(x){const t=today(),late=isDate(x.due)&&x.due<t&&!x.done;
 const meta=(x.due?'<span'+(late?' class="red"':'')+'>'+esc(x.due===t?'Idag':dateShort(x.due))+'</span>':'')+(x.who?'<span class="chip'+(x.who==='Henrik'?' h':'')+'">'+esc(x.who)+'</span>':'')+(x.note?'<span>'+esc(x.note)+'</span>':'');
 return'<div class="cell ck'+(x.done?' done':'')+'"><input type="checkbox" class="check" data-act="taskToggle" data-id="'+esc(x.id)+'" aria-label="'+esc(x.title)+'"'+(x.done?' checked':'')+'><div class="grow"><div class="title">'+esc(x.title)+'</div>'+(meta?'<div class="meta">'+meta+'</div>':'')+'</div></div>'}

/* Reglage för dagens ork: tre fasta lägen */
const ORK=[{min:10,name:'Lite ork'},{min:20,name:'Normal ork'},{min:40,name:'Mycket ork'}];
const orkIndex=B=>{let best=0;ORK.forEach((o,i)=>{if(Math.abs(o.min-B)<Math.abs(ORK[best].min-B))best=i});return best};
function orkSlider(B){const i=orkIndex(B),o=ORK[i];
 return sh('Dagens ork')+'<div class="group ork"><div class="cell ork-head"><span id="ork-now">'+o.name+'</span><span class="val" id="ork-min">'+o.min+' min</span></div><div class="ork-body">'+
 '<div class="ork-track" style="--pos:'+(i*50)+'%"><input type="range" id="ork" min="0" max="2" step="1" value="'+i+'" data-change="ork" aria-label="Tid för städning idag" aria-valuetext="'+o.name+', '+o.min+' minuter"></div>'+
 '<div class="ork-labels" aria-hidden="true">'+ORK.map((x,k)=>'<button type="button" tabindex="-1" data-act="orkPick" data-id="'+k+'" class="'+(k===i?'on':'')+'"><b>'+x.name+'</b><span>'+x.min+' min</span></button>').join('')+'</div></div></div>'+
 '<div class="foot">Gäller bara idag. I morgon börjar det om på '+tomorrowDefault()+' min.</div>'}
function tomorrowDefault(){const wd=parse(addDays(today(),1)).getDay(),st=settings();return(wd===0||wd===6)?Number(st.stadtid_helg||40):Number(st.stadtid_vardag||20)}
function orkPreview(el){const i=Number(el.value),o=ORK[i];el.parentNode.style.setProperty('--pos',(i*50)+'%');el.setAttribute('aria-valuetext',o.name+', '+o.min+' minuter');
 const n=document.getElementById('ork-now');if(n)n.textContent=o.name;
 const m=document.getElementById('ork-min');if(m)m.textContent=o.min+' min';
 document.querySelectorAll('.ork-labels button').forEach((b,k)=>b.classList.toggle('on',k===i))}
const menuSel=(attrs,opts)=>'<span class="menu"><select '+attrs+'>'+opts+'</select></span>';
V.stad=function(){
 const cp=cleanPlan(),all=D().clean;
 let h=head('Städ',{sub:'Lite varje dag, så slipper ni storstäda'});
 if(!all.length)return h+'<div style="height:22px"></div>'+group(emptyCell('Städschemat är tomt.'));
 h+=orkSlider(cp.B);
 h+='<div class="split"><div class="col">';
 const rLeft=cp.routines.filter(t=>!doneToday(t)).length;
 h+=sh('Dagliga rutiner',(cp.routines.length-rLeft)+' av '+cp.routines.length)+group(cp.routines.map(x=>cleanRow(x)).join(''));
 h+=sh('Dagens pass · '+cp.todo.reduce((s,t)=>s+t.min,0)+' min');
 h+=group((cp.todo.length||cp.doneRot.length)?[...cp.todo,...cp.doneRot].map(t=>cleanRow(t,true)).join(''):emptyCell('Inget mer behöver göras idag.'));
 if(cp.later.length)h+='<details data-k="later"'+(S.open.later?' open':'')+'><summary class="sh"><span>Har ni mer tid? ('+cp.later.length+')</span></summary>'+group(cp.later.map(t=>cleanRow(t,false,true)).join(''))+'</details>';
 else if(cp.soon.length)h+='<details data-k="soon"'+(S.open.soon?' open':'')+'><summary class="sh"><span>Vill ni ligga före?</span></summary>'+group(cp.soon.map(t=>cleanRow(t,false,true)).join(''))+'</details>';
 h+='</div><div class="col">';
 h+=sh('Hemmet just nu')+group(roomHealth().map(healthRow).join(''));
 const bigDue=cp.big.filter(t=>ratio(t)>=.85),plannedLater=all.filter(t=>t.plannedFor&&t.plannedFor>today());
 h+=sh('Storstäd som närmar sig')+group(bigDue.length?bigDue.map(bigRow).join(''):emptyCell('Inget storstäd behövs just nu.'))+'<div class="foot">Planera in dem en lördag så kommer de med i det dagens pass.</div>';
 if(plannedLater.length)h+=sh('Inplanerat')+group(plannedLater.map(t=>'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta">'+esc(dateShort(t.plannedFor))+' · '+t.min+' min</div></div><button class="pill" data-act="unplan" data-id="'+esc(t.id)+'">Ångra</button></div>').join(''));
 h+='<details data-k="all"'+(S.open.all?' open':'')+'><summary class="sh"><span>Alla sysslor och intervall</span></summary>'+ROOMS.map(room=>{const ts=all.filter(t=>t.room===room).sort((a,b)=>a.freq-b.freq);if(!ts.length)return'';
  return'<div class="sh sub2">'+esc(room)+'</div>'+group(ts.map(t=>'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta">'+t.min+' min · '+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</div><div class="menus">'+
   menuSel('data-change="freq" data-id="'+esc(t.id)+'" aria-label="Intervall"',[1,2,3,4,5,7,14,30,90].map(f=>'<option value="'+f+'"'+(t.freq===f?' selected':'')+'>'+freqText(f)+'</option>').join(''))+
   menuSel('data-change="who" data-id="'+esc(t.id)+'" aria-label="Vem"','<option value="">Vem som helst</option>'+people().map(p=>'<option'+(t.who===p?' selected':'')+'>'+esc(p)+'</option>').join(''))+'</div></div></div>').join(''))}).join('')+'</details>';
 h+=sh('Så fungerar schemat')+'<div class="foot">Varje syssla har ett intervall. Appen väljer de mest försenade sysslorna och fyller dagens pass upp till den tid ni har. Hinner ni inte kommer de först i kön i morgon.</div>';
 return h+'</div></div>'};
function cleanRow(t,showWhy,offer){const d=doneToday(t),r=ratio(t);
 const why=t.freq<=1?'':(planned(t)&&!d?'inplanerat':r>=2?'mycket försenat':r>=1?'dags nu':'snart dags');
 return'<div class="cell ck'+(d?' done':'')+'"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(t.id)+'" aria-label="'+esc(t.title)+'"'+(d?' checked':'')+'><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span class="num">'+t.min+' min</span>'+(t.who?'<span class="chip'+(t.who==='Henrik'?' h':' v')+'">'+esc(t.who)+'</span>':'')+(showWhy&&why?'<span>'+why+'</span>':'')+(d&&t.doneBy?'<span>klart av '+esc(t.doneBy)+'</span>':'')+(t.tip&&!d?'<span>'+esc(t.tip)+'</span>':'')+'</div></div>'+
 (offer?'<button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Ta idag</button>':(!d&&t.freq>1&&showWhy?'<button class="pill" data-act="snooze" data-id="'+esc(t.id)+'">I morgon</button>':''))+'</div>'}
function bigRow(t){return'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span>'+t.min+' min</span><span>'+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</span></div></div><div class="pills" style="flex-wrap:nowrap"><button class="pill" data-act="planSat" data-id="'+esc(t.id)+'">Lördag</button><button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Idag</button></div></div>'}

/* ---------- overlay ---------- */
function sheetHtml(form,title,right,body,enter){return'<div class="sheet'+enter+'" data-act="sheetBg"><form class="sheet-panel" data-form="'+form+'" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="grabber" aria-hidden="true"></div><div class="sheet-head"><button type="button" class="tb" data-act="sheetClose">Avbryt</button><h2>'+title+'</h2>'+right+'</div><div class="sheet-body">'+body+'</div></form></div>'}
const fieldCell=(label,input)=>'<label class="cell"><span class="grow">'+label+'</span>'+input+'</label>';
function renderOverlay(){
 const o=document.getElementById('overlay');
 const k=S.cook?'cook':S.sheet==='settings'?'settings':S.sheet==='rate'?'rate':S.sheet==='income'?'income':S.sheet==='cost'?'cost':S.shopAdd?'shop':S.taskAdd?'task':'';
 const prev=o.dataset.k||'';
 // Rita inte om ett öppet blad medan någon skriver i det
 if(k&&k!=='cook'&&k===prev&&busyTyping()&&o.contains(document.activeElement))return;
 o.dataset.k=k;const enter=k!==prev?' enter':'';
 if(S.cook){const r=recipeById(S.cook.id);if(!r){S.cook=null;o.dataset.k='';o.innerHTML='';return}
  const i=S.cook.step,n=r.steps.length,s=r.steps[i],{f}=scaled(r),hits=stepIngredients(r,s);
  const dir=A.cookStep==null||A.cookStep===i?'':i>A.cookStep?' from-r':' from-l',grew=A.cookStep!=null&&i>A.cookStep;A.cookStep=i;
  const now=hits.length?sh('Det här steget')+group(hits.map(it=>ingRow(it,f)).join('')):'';
  o.innerHTML='<div class="cook" role="dialog" aria-modal="true" aria-label="Matlagningsläge"><div class="cook-top"><span></span><div class="fn">Steg '+(i+1)+' av '+n+'</div><button class="tb strong" data-act="cookClose">Klar</button></div><div class="cook-name">'+esc(r.title)+'</div>'+
  '<div class="progress" aria-hidden="true">'+r.steps.map((_,k)=>'<i class="'+(k<=i?'on':'')+(grew&&k===i?' just':'')+'"></i>').join('')+'</div>'+
  '<div class="cook-body'+dir+'"><div class="col"><p class="cook-text">'+esc(s.t)+'</p>'+(s.timer?'<div class="block"><button class="pill" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+I.clock+'Starta '+s.timer+' min</button></div>':'')+now+'</div><div class="col">'+sh('Alla ingredienser')+ingList(r,f,hits)+'</div></div>'+
  '<div class="cook-nav"><button class="btn-tint" data-act="cookStep" data-d="-1"'+(i===0?' disabled':'')+'>Förra</button>'+(i<n-1?'<button class="btn-fill" data-act="cookStep" data-d="1">Nästa</button>':'<button class="btn-fill" data-act="cookDone" data-id="'+esc(r.id)+'">Klar – betygsätt</button>')+'</div></div>';
  return}
 if(k==='settings'){const st=settings(),topic=D().ntfyTopic||'';
  const meRow=(id,l)=>'<button type="button" class="cell link" data-act="me" data-id="'+esc(id)+'" aria-pressed="'+(S.me===id)+'"><span class="grow">'+esc(l)+'</span>'+(S.me===id?'<span class="mark">'+I.tick+'</span>':'')+'</button>';
  const body=sh('Vem använder den här enheten?')+group(people().map(p=>meRow(p,p)).join('')+meRow('','Gemensam skärm'))+
  sh('Namn i hushållet')+group('<div class="cell"><input class="field" id="set-p1" name="p1" aria-label="Person 1" value="'+esc(people()[0])+'"></div><div class="cell"><input class="field" id="set-p2" name="p2" aria-label="Person 2" value="'+esc(people()[1]||'')+'"></div>')+
  sh('Städtid och budget')+group(fieldCell('Vardag, min','<input class="field r" id="set-wd" name="wd" inputmode="numeric" value="'+esc(st.stadtid_vardag||20)+'" style="max-width:110px">')+fieldCell('Helg, min','<input class="field r" id="set-we" name="we" inputmode="numeric" value="'+esc(st.stadtid_helg||40)+'" style="max-width:110px">')+fieldCell('Mat/vecka, kr','<input class="field r" id="set-budget" name="budget" inputmode="numeric" value="'+esc(st.matbudget||'')+'" style="max-width:110px">'))+
  sh('Utseende')+'<div class="seg-wrap">'+segc('Utseende','theme',[['system','System'],['light','Ljust'],['dark','Mörkt']],S.theme)+'</div>'+
  sh('Skärm')+group(fieldCell('Väggläge','<input type="checkbox" role="switch" class="switch" data-act="wall" aria-label="Väggläge"'+(S.wall?' checked':'')+'>')+statusHtml())+
  (topic?sh('Notiser')+group('<div class="cell"><span class="grow copy">'+esc(topic)+'</span><button type="button" class="pill" data-act="copy" data-id="'+esc(topic)+'">Kopiera</button></div>')+'<div class="foot">Installera appen ntfy och prenumerera på det här ämnet. Använd servern ntfy.sh.</div>':'')+
  sh('Den här enheten')+group('<button type="button" class="cell link center red" data-act="logout">Logga ut</button>');
  o.innerHTML=sheetHtml('settings','Inställningar','<button class="tb strong">Spara</button>',body,enter);segSlide(o);return}
 if(k==='income'){const m=S.ekoMonth||thisMonth(),cur=(ekoInc()[m])||ekoInc()[prevIncMonth(m)]||{};
  const body=sh('Inkomst efter skatt, '+monthName(m))+group(people().map((p,i)=>fieldCell('<span class="pdot p'+(i+1)+'"></span>'+esc(p),'<input class="field r" name="p'+i+'" inputmode="numeric" value="'+esc(cur[p]||'')+'" placeholder="0 kr" style="max-width:150px" aria-label="Inkomst '+esc(p)+'">')).join(''))+
   '<div class="foot">Fördelningen av de gemensamma utgifterna räknas fram från inkomsterna.</div>';
  o.innerHTML=sheetHtml('income','Inkomst','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='cost'){const e=S.ekoEdit||{},list=ekoList(e.list),c=list.find(x=>x.id===e.id)||{period:'månad'};
  const pays=['','E-faktura','Autogiro','Kort','Swish','Övrigt'];
  const body='<div style="height:16px"></div>'+group('<div class="cell"><input class="field" name="name" required placeholder="Namn, t.ex. Hyra" value="'+esc(c.name||'')+'" aria-label="Namn" autocomplete="off"></div>'+
    fieldCell('Belopp','<input class="field r" name="amount" inputmode="decimal" required value="'+esc(c.amount!=null?c.amount:'')+'" placeholder="0 kr" style="max-width:140px">'))+
   sh('Betalas per')+'<div class="vpick">'+[['månad','Månad'],['kvartal','Kvartal'],['år','År']].map(([v,l])=>'<label><input type="radio" name="period" value="'+v+'"'+((c.period||'månad')===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div>'+
   sh('Betalning')+group(fieldCell('Sätt',menuSel('name="pay"',pays.map(x=>'<option value="'+x+'"'+(x===(c.pay||'')?' selected':'')+'>'+(x||'Inget valt')+'</option>').join('')))+
    fieldCell('Dag i månaden','<input class="field r" name="day" value="'+esc(c.day||'')+'" placeholder="t.ex. 28 eller sista" style="max-width:170px">')+
    '<div class="cell"><input class="field" name="note" placeholder="Anteckning" value="'+esc(c.note||'')+'" aria-label="Anteckning"></div>')+
   (e.id?'<div style="height:22px"></div>'+group('<button type="button" class="cell link center red" data-act="ekoDel">Ta bort utgiften</button>'):'');
  o.innerHTML=sheetHtml('cost',e.id?'Ändra utgift':'Ny utgift','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='rate'){const r=recipeById(S.rate&&S.rate.id);if(!r){closeSheets();o.innerHTML='';o.dataset.k='';return}
  const who=S.me||'',x=(ratings()[r.id]||{}).p||{},cur=x[who]||{};
  const stars='<div class="stars" role="radiogroup" aria-label="Stjärnor">'+[5,4,3,2,1].map(n=>'<input type="radio" name="s" id="st'+n+'" value="'+n+'"'+(Number(cur.s)===n?' checked':'')+' required><label for="st'+n+'" aria-label="'+n+' stjärnor">★</label>').join('')+'</div>';
  const verd='<div class="vpick" role="radiogroup" aria-label="Laga igen?">'+[['igen','Laga igen'],['okej','Okej'],['aldrig','Aldrig mer']].map(([v,l])=>'<label><input type="radio" name="v" value="'+v+'"'+(cur.v===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div>';
  const body='<div class="rate-head"><div class="rate-ic" aria-hidden="true">'+foodIcon(r.title)+'</div><div class="hl">'+esc(r.title)+'</div></div>'+
   (who?'':sh('Vem betygsätter?')+'<div class="vpick">'+people().map(p=>'<label><input type="radio" name="who" value="'+esc(p)+'" required><span>'+esc(p)+'</span></label>').join('')+'</div>')+
   sh('Hur gott var det?')+stars+sh('Ska vi laga det igen?')+verd+
   sh('Kommentar')+group('<div class="cell"><input class="field" name="c" maxlength="140" placeholder="T.ex. mer kryddor nästa gång" value="'+esc(cur.c||'')+'" aria-label="Kommentar"></div>')+
   '<div class="foot">Bra betyg sparar receptet i receptbanken, och veckoplaneringen tar hänsyn till betygen.</div>';
  o.innerHTML=sheetHtml('rate','Betyg','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='shop'){
  const body='<div style="height:16px"></div>'+group('<div class="cell"><input class="field" id="shop-name" name="name" placeholder="Vara, t.ex. havregryn" required autocomplete="off" aria-label="Vara"></div><div class="cell"><input class="field" id="shop-qty" name="qty" placeholder="Mängd" aria-label="Mängd"></div><div class="cell"><input class="field" id="shop-price" name="price" inputmode="decimal" placeholder="Pris kr" aria-label="Pris kr"></div>'+
   fieldCell('Kategori',menuSel('id="shop-cat" name="cat"',CATS.map(c=>'<option>'+c+'</option>').join(''))));
  o.innerHTML=sheetHtml('shop','Ny vara','<button class="tb strong">Lägg till</button>',body,enter);return}
 if(k==='task'){
  const body='<div style="height:16px"></div>'+group('<div class="cell"><input class="field" id="task-title" name="title" placeholder="Vad behöver göras?" required autocomplete="off" aria-label="Uppgift"></div>'+
   fieldCell('Datum','<input class="field r" id="task-due" name="due" type="date" style="max-width:170px">')+
   fieldCell('Vem',menuSel('id="task-who" name="who"','<option value="">Vem som helst</option>'+people().map(p=>'<option>'+esc(p)+'</option>').join('')+'<option>Båda</option>')));
  o.innerHTML=sheetHtml('task','Ny uppgift','<button class="tb strong">Lägg till</button>',body,enter);return}
 o.innerHTML=''}

/* ---------- översiktens topp: klocka, väder, namnsdag och härnäst ---------- */
// Namnsdag från Svenska dagar-API:t; sparas lokalt och visas bara när den gått att hämta.
const EXT={yr:null,day:null};
try{const c=JSON.parse(lsGet('ext')||'null');if(c){EXT.yr=c.yr||null;EXT.day=c.day||null}}catch(e){}
/* ---------- väder från Yr (MET Norway) ----------
   Prognosen hämtas från MET Norways Locationforecast, samma källa som yr.no. Om den inte
   går att nå används Open-Meteo. Båda omvandlas till samma form: nu, timmar och dagar. */
const WX_POS=()=>{const st=settings();return{lat:Number(st.ort_lat)||57.186,lon:Number(st.ort_lon)||14.04,name:st.ort_namn||'Värnamo'}};
function sunTimes(date,lat,lon){const R=Math.PI/180,J=Date.parse(date+'T12:00:00Z')/864e5+2440587.5,n=Math.ceil(J-2451545+0.0008),Js=n-lon/360;
 const M=(357.5291+0.98560028*Js)%360,C=1.9148*Math.sin(M*R)+0.02*Math.sin(2*M*R)+0.0003*Math.sin(3*M*R),L=(M+C+180+102.9372)%360;
 const Jt=2451545+Js+0.0053*Math.sin(M*R)-0.0069*Math.sin(2*L*R),dec=Math.asin(Math.sin(L*R)*Math.sin(23.4397*R));
 const cw=(Math.sin(-0.833*R)-Math.sin(lat*R)*Math.sin(dec))/(Math.cos(lat*R)*Math.cos(dec));if(cw<-1||cw>1)return null;
 const w=Math.acos(cw)/R/360,toD=j=>new Date((j-2440587.5)*864e5);return[toD(Jt-w),toD(Jt+w)]}
const hhmm=d=>pad(d.getHours())+'.'+pad(d.getMinutes());
// Open-Meteos väderkoder översatta till Yrs symbolnamn
const OM_SYM={0:'clearsky',1:'fair',2:'partlycloudy',3:'cloudy',45:'fog',48:'fog',51:'lightrain',53:'lightrain',55:'rain',56:'lightsleet',57:'sleet',61:'lightrain',63:'rain',65:'heavyrain',66:'sleet',67:'heavysleet',
 71:'lightsnow',73:'snow',75:'heavysnow',77:'lightsnow',80:'lightrainshowers',81:'rainshowers',82:'heavyrainshowers',85:'snowshowers',86:'heavysnowshowers',95:'rainandthunder',96:'heavyrainandthunder',99:'heavyrainandthunder'};
async function loadWx(force){const P=WX_POS();if(!force&&EXT.yr&&Date.now()-EXT.yr.at<30*60000&&EXT.yr.lat===P.lat)return false;
 try{const r=await fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat='+P.lat.toFixed(4)+'&lon='+P.lon.toFixed(4));if(!r.ok)throw new Error(r.status);
  const j=await r.json();const ts=j.properties.timeseries.map(x=>{const i=x.data.instant.details,n1=x.data.next_1_hours,n6=x.data.next_6_hours,n12=x.data.next_12_hours;
   return{t:x.time,T:i.air_temperature,w:i.wind_speed,wd:i.wind_from_direction,h:i.relative_humidity,p:i.air_pressure_at_sea_level,
    s:(n1||n6||n12||{summary:{}}).summary.symbol_code||'',pr:n1?n1.details.precipitation_amount:null,pr6:n6?n6.details.precipitation_amount:null,s6:n6?n6.summary.symbol_code:''}});
  EXT.yr={at:Date.now(),src:'yr',lat:P.lat,ts};return true}
 catch(e){try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+P.lat+'&longitude='+P.lon+'&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,pressure_msl,is_day&timezone=UTC&forecast_days=9&wind_speed_unit=ms');
  const j=await r.json(),H=j.hourly;const ts=H.time.map((t,k)=>{const b=OM_SYM[H.weather_code[k]]||'cloudy',dn=/^(clearsky|fair|partlycloudy|.*showers)$/.test(b)?(H.is_day[k]?'_day':'_night'):'';
   return{t:t+':00Z',T:H.temperature_2m[k],w:H.wind_speed_10m[k],wd:H.wind_direction_10m[k],h:H.relative_humidity_2m[k],p:H.pressure_msl[k],s:b+dn,pr:H.precipitation[k],pr6:null,s6:''}});
  EXT.yr={at:Date.now(),src:'om',lat:P.lat,ts};return true}catch(e2){return false}}}
// Samlad bild: nu, kommande timmar och dagar (lokal tid)
function wxModel(){const y=EXT.yr;if(!y||!y.ts||!y.ts.length||Date.now()-y.at>12*3600000)return null;
 const now=Date.now(),hrs=y.ts.map(x=>Object.assign({},x,{d:new Date(x.t)})).filter(x=>x.d.getTime()>now-3600000);if(!hrs.length)return null;
 const cur=hrs[0],days={};
 hrs.forEach(x=>{const k=ymd(x.d);const D=days[k]=days[k]||{date:k,min:99,max:-99,pr:0,syms:[]};D.min=Math.min(D.min,x.T);D.max=Math.max(D.max,x.T);
  D.pr+=x.pr!=null?x.pr:(x.pr6!=null&&x.d.getHours()%6===0?x.pr6:0);const hr=x.d.getHours();if(hr>=9&&hr<=18)D.syms.push(x.s6||x.s)});
 const dl=Object.values(days).map(D=>Object.assign(D,{sym:D.syms[Math.floor(D.syms.length/2)]||(hrs.find(x=>ymd(x.d)===D.date)||{}).s||''})).slice(0,9);
 return{src:y.src,now:cur,hours:hrs.slice(0,25),days:dl}}
const symBase=s=>String(s||'').replace(/_(day|night|polartwilight)$/,'');
function symInfo(s){const b=symBase(s),night=/_night$/.test(s||'');
 if(/thunder/.test(b))return['⛈️','Åska'];
 if(/sleet/.test(b))return['🌨️',(/showers/.test(b)?'Byar av ':'')+'snöblandat regn'];
 if(/snow/.test(b))return[/heavy/.test(b)?'❄️':'🌨️',/showers/.test(b)?'Snöbyar':/heavy/.test(b)?'Kraftigt snöfall':/light/.test(b)?'Lätt snöfall':'Snöfall'];
 if(/rain/.test(b))return[/heavy/.test(b)?'🌧️':(/showers|light/.test(b)?'🌦️':'🌧️'),/showers/.test(b)?(/heavy/.test(b)?'Kraftiga regnskurar':/light/.test(b)?'Lätta regnskurar':'Regnskurar'):(/heavy/.test(b)?'Kraftigt regn':/light/.test(b)?'Lätt regn':'Regn')];
 return{clearsky:[night?'🌙':'☀️','Klart'],fair:[night?'🌙':'🌤️','Mest klart'],partlycloudy:[night?'☁️':'⛅','Halvklart'],cloudy:['☁️','Mulet'],fog:['🌫️','Dimma']}[b]||['🌡️','']}
const capS=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const deg=t=>Math.round(t)+'°';
const mm=v=>(Math.round(v*10)/10).toLocaleString('sv-SE')+' mm';
// Dagens klädsel: dagtid som är kvar idag, eller morgondagen efter kl 20
function wxToday(W){const n=new Date(),late=n.getHours()>=20,day=late?addDays(today(),1):today();
 const hs=W.hours.filter(x=>ymd(x.d)===day&&x.d.getHours()>=(late?8:Math.min(n.getHours(),20))&&x.d.getHours()<=20);const L=hs.length?hs:[W.now];
 const max=Math.max(...L.map(x=>x.T)),pr=L.reduce((a,x)=>a+(x.pr||0),0),syms=L.map(x=>symBase(x.s)).join(' ');
 const kind=/thunder/.test(syms)?'storm':(/snow|sleet/.test(syms)&&max<2)?'snow':(pr>=0.6||/rain|sleet/.test(syms)&&pr>=0.3)?'rain':/fog/.test(symBase(W.now.s))?'fog':
  max>=20?'hot':max>=14?'warm':max>=7?'mild':max>=0?'cold':'freezing';
 const sunny=/clearsky|fair/.test(syms)&&!/cloudy/.test(syms.replace('partlycloudy',''));
 const nt=!late&&isNight();
 const tip={hot:nt?'Shorts och t-shirt':'Shorts, t-shirt och solglasögon',warm:'T-shirt räcker'+(sunny&&!nt?', ta solglasögon':''),mild:'Lätt jacka',cold:'Jacka, mössa och vantar',freezing:'Varmt på dig, det är minusgrader',
  rain:'Ta med paraply',snow:'Vinterkläder, det snöar',storm:'Paraply, och håll dig inne vid åska',fog:'Dimmigt, ta reflex'}[kind];
 return{kind,night:nt,sunny,max,pr,tip,when:late?'i morgon':'idag'}}
function isNight(){const P=WX_POS(),s=sunTimes(today(),P.lat,P.lon),n=new Date();return s?(n<s[0]||n>s[1]):false}

/* Gubben: en SVG som klär sig efter dagens väder. Delarna slås på per läge och animeras i CSS. */
function figSvg(kind,o){o=o||{};const night=!!o.night,K=kind;
 const skin='#F2C3A0',hair='#5A3A28',shoe='#3A3A3C';
 const top={hot:'#4FB7E8',warm:'#7AC48A',mild:'#5C7FA3',cold:'#8E3B4E',freezing:'#2E4A6B',rain:'#F2C230',snow:'#2E4A6B',storm:'#F2C230',fog:'#6F7D8C'}[K];
 const pants={hot:'#2F5E8C',warm:'#3D5A80',mild:'#33415C',cold:'#2B2D42',freezing:'#2B2D42',rain:'#33415C',snow:'#2B2D42',storm:'#33415C',fog:'#33415C'}[K];
 const shorts=K==='hot',longSleeve=!/^(hot|warm)$/.test(K),coat=/^(cold|freezing|snow|rain|storm|fog|mild)$/.test(K),umbrella=/^(rain|storm)$/.test(K);
 const beanie=/^(cold|freezing|snow)$/.test(K),scarf=/^(freezing|snow|cold)$/.test(K),shades=(K==='hot'||(K==='warm'&&o.sunny))&&!night,boots=/^(rain|storm|snow)$/.test(K);
 let bg='';
 if(/^(hot|warm)$/.test(K)&&!night)bg+='<g class="fx-sun"><circle cx="24" cy="26" r="11" fill="#FFC53D"/><g class="rays" stroke="#FFC53D" stroke-width="3" stroke-linecap="round">'+[0,45,90,135,180,225,270,315].map(a=>{const r=Math.PI*a/180;return'<line x1="'+(24+16*Math.cos(r)).toFixed(1)+'" y1="'+(26+16*Math.sin(r)).toFixed(1)+'" x2="'+(24+21*Math.cos(r)).toFixed(1)+'" y2="'+(26+21*Math.sin(r)).toFixed(1)+'"/>'}).join('')+'</g></g>';
 if(night&&/^(hot|warm|mild|cold|freezing)$/.test(K))bg+='<g class="fx-moon"><path d="M30 14a12 12 0 1 0 10 18a10 10 0 0 1-10-18z" fill="#F5E6A8"/><circle class="tw" cx="96" cy="16" r="1.6" fill="#F5E6A8"/><circle class="tw d2" cx="104" cy="34" r="1.2" fill="#F5E6A8"/><circle class="tw d3" cx="14" cy="50" r="1.2" fill="#F5E6A8"/></g>';
 if(/^(mild|cold|rain|storm|fog|snow)$/.test(K))bg+='<g class="fx-cloud"><path d="M78 30h26a9 9 0 0 0 0-18a13 13 0 0 0-25 3a8 8 0 0 0-1 15z" fill="'+(/^(rain|storm)$/.test(K)?'#9AA3AE':'#C9D1DA')+'"/></g>';
 if(K==='storm')bg+='<path class="fx-bolt" d="M92 30l-8 14h7l-5 12 12-17h-7l5-9z" fill="#FFD43B"/>';
 if(/^(rain|storm)$/.test(K))bg+='<g class="fx-rain" stroke="#5AA9E6" stroke-width="2" stroke-linecap="round">'+[[10,0],[22,.35],[100,.15],[110,.55],[16,.7],[104,.85],[34,.5],[90,.25]].map(([x,dl])=>'<line x1="'+x+'" y1="0" x2="'+(x-2)+'" y2="7" style="animation-delay:-'+dl+'s"/>').join('')+'</g>';
 if(K==='snow'||K==='freezing')bg+='<g class="fx-snow" fill="#DCE8F5">'+[[12,0],[28,1.2],[98,.6],[108,2],[20,2.6],[104,3.1],[40,1.8],[88,.3]].map(([x,dl])=>'<circle cx="'+x+'" cy="0" r="2.2" style="animation-delay:-'+dl+'s"/>').join('')+'</g>';
 if(K==='fog')bg+='<g class="fx-fog" stroke="#C9D1DA" stroke-width="5" stroke-linecap="round" opacity=".8"><line x1="4" y1="96" x2="44" y2="96"/><line class="d2" x1="80" y1="110" x2="116" y2="110"/><line x1="10" y1="124" x2="38" y2="124"/></g>';
 const legs=shorts
  ?'<rect x="50" y="102" width="9" height="34" rx="4.5" fill="'+skin+'"/><rect x="61" y="102" width="9" height="34" rx="4.5" fill="'+skin+'"/><path d="M47 98h26v14h-11.5l-1.5-4-1.5 4H47z" fill="'+pants+'"/>'
  :'<rect x="50" y="98" width="9.5" height="38" rx="4.5" fill="'+pants+'"/><rect x="60.5" y="98" width="9.5" height="38" rx="4.5" fill="'+pants+'"/>';
 const feet=boots?'<rect x="47.5" y="128" width="12" height="11" rx="3" fill="'+(K==='snow'?'#5A3A28':'#2F6B4F')+'"/><rect x="60.5" y="128" width="12" height="11" rx="3" fill="'+(K==='snow'?'#5A3A28':'#2F6B4F')+'"/>'
  :'<ellipse cx="53.5" cy="137.5" rx="7" ry="3.6" fill="'+shoe+'"/><ellipse cx="66.5" cy="137.5" rx="7" ry="3.6" fill="'+shoe+'"/>';
 const bodyH=coat?46:40,armC=longSleeve?top:skin;
 const torso='<rect x="44" y="64" width="32" height="'+bodyH+'" rx="13" fill="'+top+'"/>'+(coat?'<line x1="60" y1="68" x2="60" y2="'+(62+bodyH)+'" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/><circle cx="55" cy="84" r="1.3" fill="rgba(0,0,0,.25)"/><circle cx="65" cy="84" r="1.3" fill="rgba(0,0,0,.25)"/>':'')+
  (K==='hot'?'<circle cx="60" cy="80" r="5" fill="#FFE27A" opacity=".9"/>':'');
 const sleeveL='<path d="M47 71 L38 95" stroke="'+armC+'" stroke-width="8" stroke-linecap="round"/>'+(longSleeve?'':'<path d="M47 71 L43 80" stroke="'+top+'" stroke-width="9" stroke-linecap="round"/>')+'<circle cx="37.5" cy="96.5" r="4.6" fill="'+(beanie?'#8E3B4E':skin)+'"/>';
 const armL='<g class="fig-wave">'+sleeveL+'</g>';
 const armR=umbrella
  ?'<path d="M73 71 L82 64" stroke="'+armC+'" stroke-width="8" stroke-linecap="round"/><circle cx="84" cy="62.5" r="4.6" fill="'+skin+'"/>'
  :'<path d="M73 71 L82 95" stroke="'+armC+'" stroke-width="8" stroke-linecap="round"/>'+(longSleeve?'':'<path d="M73 71 L77 80" stroke="'+top+'" stroke-width="9" stroke-linecap="round"/>')+'<circle cx="82.5" cy="96.5" r="4.6" fill="'+(beanie?'#8E3B4E':skin)+'"/>';
 const umb=umbrella?'<g class="fig-umb"><line x1="84" y1="64" x2="84" y2="20" stroke="#4A4A4F" stroke-width="2.4" stroke-linecap="round"/><path d="M84 66 q0 5 -5 5" fill="none" stroke="#4A4A4F" stroke-width="2.4" stroke-linecap="round"/>'+
  '<path d="M48 26 Q84 -6 120 26 Q111 21 102 26 Q93 21 84 26 Q75 21 66 26 Q57 21 48 26Z" fill="var(--p1,#A3253F)"/><path d="M84 3 Q72 10 66 26 M84 3 Q96 10 102 26" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/></g>':'';
 const head='<circle cx="60" cy="44" r="18" fill="'+skin+'"/>'+
  (beanie?'<path d="M41.5 42 a18.5 18.5 0 0 1 37 0z" fill="#8E3B4E"/><rect x="40.5" y="38" width="39" height="7" rx="3.5" fill="#B45A6E"/><circle cx="60" cy="24" r="4.5" fill="#F3E3E7"/>'
   :'<path d="M42.5 42 a17.5 17.5 0 0 1 35 0 q-6 -7 -15 -8 q-4 4 -12 4 q-5 0 -8 4z" fill="'+hair+'"/>')+
  '<g class="fig-eyes"><circle cx="53.5" cy="46" r="2.1" fill="#2B2B2E"/><circle cx="66.5" cy="46" r="2.1" fill="#2B2B2E"/></g>'+
  (shades?'<g><rect x="47" y="41.5" width="11" height="8" rx="3.5" fill="#1E1E22"/><rect x="62" y="41.5" width="11" height="8" rx="3.5" fill="#1E1E22"/><line x1="58" y1="44" x2="62" y2="44" stroke="#1E1E22" stroke-width="2"/><line x1="49" y1="43.5" x2="53" y2="43.5" stroke="rgba(255,255,255,.4)" stroke-width="1.2" stroke-linecap="round"/></g>':'')+
  '<circle cx="49" cy="52" r="3" fill="#F28B82" opacity=".35"/><circle cx="71" cy="52" r="3" fill="#F28B82" opacity=".35"/>'+
  '<path d="'+(/^(rain|storm|freezing)$/.test(K)?'M56 54.5 q4 -2 8 0':'M55 53 q5 5 10 0')+'" fill="none" stroke="#2B2B2E" stroke-width="1.8" stroke-linecap="round"/>'+
  (/^(cold|freezing|snow)$/.test(K)?'<g class="fig-breath" fill="#DCE8F5"><circle cx="76" cy="54" r="3"/><circle cx="82" cy="51" r="2.2"/></g>':'');
 const scarfS=scarf?'<rect x="46" y="60" width="28" height="7" rx="3.5" fill="#E07A5F"/><rect x="62" y="64" width="6" height="15" rx="3" fill="#E07A5F"/>':'';
 return'<svg class="fig k-'+K+'" viewBox="0 0 120 145" role="img" aria-label="'+esc(o.label||'')+'"><ellipse cx="60" cy="140" rx="24" ry="3.5" fill="currentColor" opacity=".12"/>'+bg+
  '<g class="fig-body">'+umb+legs+feet+armL+torso+scarfS+armR+head+'</g></svg>'}

const hm=m=>pad(Math.floor(m/60))+'.'+pad(m%60);
function nextHtml(){const n=new Date(),mins=n.getHours()*60+n.getMinutes(),td=dayOf(today());
 const at=(s,re)=>{const m=re.exec(s||'');return m?Number(m[1])*60+Number(m[2]):null};
 const evs=(td?td.events:[]).map(e=>({e,s:at(e.time,/^(\d{1,2})[.:](\d{2})/),en:at(e.time,/[–-]\s*(\d{1,2})[.:](\d{2})/)})).filter(x=>x.s!=null).sort((a,b)=>a.s-b.s);
 const dur=m=>m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'');
 const row=(l,x,r)=>'<div class="nx"><span class="nx-l">'+l+'</span><span class="grow">'+esc(x.e.title)+evWho(x.e)+'</span><span class="fn num">'+r+'</span></div>';
 const now=evs.filter(x=>x.s<=mins&&x.en!=null&&x.en>mins),nx=evs.find(x=>x.s>mins);
 const allDay=(td?td.events:[]).filter(e=>at(e.time,/^(\d{1,2})[.:](\d{2})/)==null).map(e=>'<div class="nx"><span class="nx-l">Idag</span><span class="grow">'+esc(e.title)+evWho(e)+'</span></div>').join('');
 return allDay+now.map(x=>row('Pågår',x,'till '+hm(x.en))).join('')+(nx?row('Härnäst',nx,'om '+dur(nx.s-mins)):'')}
function heroHtml(){const n=new Date(),t=today(),dy=EXT.day&&EXT.day.date===t?EXT.day:null,hh=n.getHours(),W=wxModel(),P=WX_POS();
 const greet=hh<5?'God natt':hh<10?'God morgon':hh<17?'Hej':hh<22?'God kväll':'God natt';
 const sun=sunTimes(t,P.lat,P.lon);
 let wx='';
 if(W){const[ic,tx]=symInfo(W.now.s),d0=W.days[0]||{},F=wxToday(W);
  wx='<button class="hero-wx" data-act="nav" data-id="vader" aria-label="Väder: '+esc(tx)+', '+deg(W.now.T)+'. Öppna vädret">'+
   '<div class="wx-now"><span class="wx-ic" aria-hidden="true">'+ic+'</span><span class="wx-t num">'+deg(W.now.T)+'</span></div>'+
   '<div class="fn">'+esc(tx)+'</div><div class="fn num">H:'+deg(d0.max)+' L:'+deg(d0.min)+'</div>'+
   '<div class="fig-box" aria-hidden="true">'+figSvg(F.kind,{night:F.night,sunny:F.sunny})+'</div><div class="fig-tip">'+esc(F.tip)+'</div></button>'}
 const facts=['Vecka '+isoWeek(n)];
 if(dy&&dy.holiday)facts.push(dy.holiday);else if(dy&&dy.flag)facts.push('Flaggdag: '+dy.flag);
 if(dy&&dy.names.length)facts.push('Namnsdag: '+dy.names.join(', '));
 if(sun)facts.push('Sol '+hhmm(sun[0])+'–'+hhmm(sun[1]));
 return'<section class="hero'+(wx?' has-wx':'')+'"><div class="hero-l"><div class="clock num" id="clock">'+pad(hh)+':'+pad(n.getMinutes())+'</div><div class="hero-date">'+esc(cap(dayHead(t)))+'</div>'+
  '<div class="hero-greet">'+greet+(S.me?', '+esc(S.me):'')+'!</div><div class="hero-facts">'+facts.map(f=>'<span>'+esc(f)+'</span>').join('')+'</div></div>'+wx+
  '<div id="hero-next">'+nextHtml()+'</div></section>'}
async function loadExt(){const t=today();let changed=await loadWx();
 if(!EXT.day||EXT.day.date!==t){try{const[y,mo,d]=t.split('-');
  const r=await fetch('https://sholiday.faboul.se/dagar/v2.1/'+y+'/'+mo+'/'+d);const j=await r.json(),x=j.dagar&&j.dagar[0];
  if(x){EXT.day={date:t,names:x.namnsdag||[],holiday:x.helgdag||'',flag:x.flaggdag||''};changed=true}}catch(e){}}
 if(changed){lsSet('ext',JSON.stringify(EXT));if(S.view==='oversikt'||S.view==='vader')render()}}
loadExt();setInterval(loadExt,10*60000);

/* Vädersidan, i stil med Apples Väder */
const DAYS3=['sön','mån','tis','ons','tor','fre','lör'];
function windDir(d){return['nordlig','nordostlig','ostlig','sydostlig','sydlig','sydvästlig','västlig','nordvästlig'][Math.round(((d||0)%360)/45)%8]}
function feels(T,w){return(T<=10&&w>1.3)?13.12+0.6215*T-11.37*Math.pow(w*3.6,0.16)+0.3965*T*Math.pow(w*3.6,0.16):T}
V.vader=function(){const W=wxModel(),P=WX_POS();
 let h='<div class="rcp-top"><button class="back" data-act="nav" data-id="oversikt">'+I.back+'Översikt</button></div>';
 NB.title='Väder';
 if(!W)return h+'<header class="head"><h1 class="lt" id="lt">Väder</h1></header>'+group(emptyCell('Prognosen kunde inte hämtas just nu.'))+'<div class="block"><button class="btn-tint" style="width:100%" data-act="wxRefresh">Försök igen</button></div>';
 const[ic,tx]=symInfo(W.now.s),d0=W.days[0],F=wxToday(W),sun=sunTimes(today(),P.lat,P.lon);
 h+='<section class="wx-hero"><div class="wx-place">'+esc(P.name)+'</div><div class="wx-big num" id="lt">'+deg(W.now.T)+'</div><div class="wx-cond">'+esc(tx)+'</div><div class="wx-hl num">H:'+deg(d0.max)+'  L:'+deg(d0.min)+'</div>'+
  '<div class="wx-fig"><div class="fig-box big" aria-hidden="true">'+figSvg(F.kind,{night:F.night,sunny:F.sunny})+'</div><div class="wx-tip"><b>'+esc(capS(F.when))+'</b><span>'+esc(F.tip)+'</span></div></div></section>';
 // Timmar
 h+='<div class="group wx-card"><div class="wx-cap">'+I.clock+'Kommande timmar</div><div class="hours" role="list">'+W.hours.slice(0,25).map((x,k)=>{const[ii]=symInfo(x.s);
  return'<div class="hr" role="listitem"><span class="fn">'+(k?pad(x.d.getHours()):'Nu')+'</span><span class="hi" aria-hidden="true">'+ii+'</span><b class="num">'+deg(x.T)+'</b><span class="hp num">'+(x.pr>=0.1?mm(x.pr).replace(' mm',''):'')+'</span></div>'}).join('')+'</div></div>';
 // Dagar
 const lo=Math.min(...W.days.map(x=>x.min)),hi=Math.max(...W.days.map(x=>x.max)),span=Math.max(1,hi-lo);
 h+='<div class="group wx-card"><div class="wx-cap">'+I.cal+W.days.length+'-dagarsprognos</div>'+W.days.map((x,k)=>{const[ii]=symInfo(x.sym),l=(x.min-lo)/span*100,r=(x.max-lo)/span*100;
  return'<div class="day-row"><span class="dn">'+(k?capS(DAYS3[parse(x.date).getDay()]):'Idag')+'</span><span class="di" aria-hidden="true">'+ii+'</span><span class="dp num">'+(x.pr>=0.2?mm(x.pr):'')+'</span><span class="dmin num">'+deg(x.min)+'</span><span class="range" aria-hidden="true"><i style="left:'+l+'%;right:'+(100-r)+'%"></i>'+(k===0?'<b style="left:'+((W.now.T-lo)/span*100)+'%"></b>':'')+'</span><span class="dmax num">'+deg(x.max)+'</span></div>'}).join('')+'</div>';
 // Detaljer
 const n=W.now,prToday=d0.pr,tile=(lab,val,sub)=>'<div class="wx-tile"><div class="wx-cap">'+lab+'</div><div class="tv num">'+val+'</div><div class="fn">'+sub+'</div></div>';
 h+='<div class="wx-tiles">'+
  tile('Vind',Math.round(n.w)+' m/s','<span class="wd" style="transform:rotate('+((n.wd||0)+180)+'deg)">↑</span> '+capS(windDir(n.wd))+' vind')+
  tile('Känns som',deg(feels(n.T,n.w)),feels(n.T,n.w)<n.T-1?'Vinden gör det kallare':'Ungefär som det är')+
  tile('Nederbörd',mm(prToday),'idag'+(W.days[1]?' · '+mm(W.days[1].pr)+' i morgon':''))+
  tile('Luftfuktighet',Math.round(n.h||0)+' %',(n.h||0)>85?'Fuktigt':(n.h||0)<40?'Torr luft':'Normal')+
  (sun?tile('Sol','<span class="sm">↑ '+hhmm(sun[0])+'</span> <span class="sm">↓ '+hhmm(sun[1])+'</span>','Dagens längd '+Math.floor((sun[1]-sun[0])/3600000)+' h '+Math.round(((sun[1]-sun[0])%3600000)/60000)+' min'):'')+
  tile('Lufttryck',Math.round(n.p||0)+' hPa',(n.p||1013)<1000?'Lågtryck':(n.p||1013)>1022?'Högtryck':'Normalt')+'</div>';
 h+='<div class="foot">Väderdata från '+(W.src==='yr'?'<a href="https://www.yr.no/" target="_blank" rel="noopener">Yr</a> och MET Norway (CC BY 4.0)':'Open-Meteo, eftersom Yr inte gick att nå')+'. Uppdaterad '+hhmm(new Date(EXT.yr.at))+'.</div>';
 return h};


/* ---------- ekonomi ----------
   Ersätter kalkylarket Ekonomikalkyl. Utgifterna ligger i raden ekonomi och inkomsterna per månad
   i raden ekonomi_inkomst i fliken Inställningar. Räknas som i kalkylen: de gemensamma utgifterna
   delas efter inkomst, och det som sätts in avrundas uppåt med en buffert. */
const thisMonth=()=>today().slice(0,7);
const addMonths=(m,n)=>{const[y,mo]=m.split('-').map(Number),d=new Date(y,mo-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const monthName=m=>{const[y,mo]=m.split('-').map(Number);return MON[mo-1]+(y!==new Date().getFullYear()?' '+y:'')};
const ekoData=()=>parseJ(settings().ekonomi,{});
const ekoInc=()=>parseJ(settings().ekonomi_inkomst,{});
const ekoList=k=>{const o=ekoData();return(k==='shared'?o.shared:(o.personal||{})[k])||[]};
function ekoListIn(o,k,fn){if(k==='shared')o.shared=fn(o.shared||[]);else{o.personal=o.personal||{};o.personal[k]=fn(o.personal[k]||[])}}
const perMonth=c=>(Number(c.amount)||0)/(c.period==='kvartal'?3:c.period==='år'?12:1);
const sumMonth=l=>l.reduce((a,c)=>a+perMonth(c),0);
const prevIncMonth=m=>Object.keys(ekoInc()).filter(k=>k<m&&Object.values(ekoInc()[k]||{}).some(Number)).sort().pop();
const dayTxt=d=>{d=String(d||'').trim();if(!d)return'';if(/^sista/i.test(d))return'sista i månaden';const n=Number(d);if(!n)return d;return n+((n%10===1||n%10===2)&&n!==11&&n!==12?':a':':e')};
function ekoCalc(m){const o=ekoData(),ps=people(),all=ekoInc();let src=m,inc=all[m];
 if(!inc||!ps.some(p=>Number(inc[p]))){src=prevIncMonth(m);inc=src?all[src]:{}}
 const tot=ps.reduce((a,p)=>a+(Number(inc[p])||0),0),shared=sumMonth(o.shared||[]),b=1+(Number(o.buffer!=null?o.buffer:2))/100,R=Number(o.round||100)||1;
 const up=x=>Math.ceil(x*b/R-1e-9)*R;
 const per=ps.map(p=>{const i=Number(inc[p])||0,share=tot?i/tot:1/ps.length,own=sumMonth((o.personal||{})[p]||[]);
  const dep=up(shared*share),pdep=up(own);return{p,inc:i,share,sharedPart:shared*share,dep,own,pdep,sum:dep+pdep,left:i-dep-pdep}});
 return{m,src,own:src===m,tot,shared,per,o}}
const pcls=p=>'p'+(Math.max(0,people().indexOf(p))+1);
function costRow(c,list,split){const pm=perMonth(c),meta=[c.pay,dayTxt(c.day),c.note].filter(Boolean).join(' · ');
 return'<button class="cell link" data-act="ekoCost" data-id="'+esc(c.id)+'" data-list="'+esc(list)+'"><div class="grow"><div class="title">'+esc(c.name)+'</div>'+
  ((meta||c.period!=='månad')?'<div class="meta">'+(c.period!=='månad'?'<span class="num">'+kr(c.amount)+'/'+esc(c.period)+'</span>':'')+(meta?'<span>'+esc(meta)+'</span>':'')+'</div>':'')+
  (split?'<div class="meta num">'+split.map(x=>'<span><span class="pdot '+pcls(x.p)+'"></span>'+kr(pm*x.share)+'</span>').join('')+'</div>':'')+
  '</div><span class="val num">'+kr(pm)+'</span>'+chevron+'</button>'}
function splitPreview(el){const v=Number(String(el.value).replace(/\s/g,'').replace(',','.'))||0,c=ekoCalc(S.ekoMonth||thisMonth()),out=document.getElementById('split-out');
 if(out)out.innerHTML=c.per.map(x=>'<div><span class="fn"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+' '+(x.share*100).toFixed(1).replace('.',',')+' %</span><b class="num">'+kr(v*x.share)+'</b></div>').join('')}
V.ekonomi=function(){const m=S.ekoMonth||thisMonth(),c=ekoCalc(m),o=c.o;
 let h=head('Ekonomi',{sub:'Fasta utgifter och fördelning'});
 h+='<div class="mswitch"><button class="ib" data-act="ekoMonth" data-d="-1" aria-label="Förra månaden">'+I.back+'</button><div class="hl">'+esc(cap(monthName(m)))+'</div><button class="ib flip" data-act="ekoMonth" data-d="1" aria-label="Nästa månad">'+I.back+'</button></div>';
 // Inkomst och fördelning
 const pct=x=>(x*100).toFixed(1).replace('.',',')+' %';
 h+=sh('Inkomst',c.own?'<button class="linkbtn" data-act="ekoIncome">Ändra</button>':'');
 if(!c.own)h+='<div class="block" style="padding-top:0"><button class="btn-fill" style="width:100%" data-act="ekoIncome">'+I.plus+'Fyll i inkomst för '+esc(monthName(m))+'</button>'+(c.src?'<div class="foot" style="padding:8px 4px 0">Tills dess räknas med inkomsten från '+esc(monthName(c.src))+'.</div>':'')+'</div>';
 h+='<div class="group"><div class="cell eko-split"><div class="splitbar" role="img" aria-label="Fördelning '+c.per.map(x=>x.p+' '+pct(x.share)).join(', ')+'">'+c.per.map(x=>'<i class="'+pcls(x.p)+'" style="flex:'+Math.max(x.share,.0001)+'"></i>').join('')+'</div>'+
  '<div class="splitleg">'+c.per.map(x=>'<div><span class="fn"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+'</span><b class="num">'+nv('e-inc-'+x.p,x.inc,'kr')+'</b><span class="fn num">'+pct(x.share)+'</span></div>').join('')+'</div></div>'+
  '<div class="cell"><span class="grow muted">Totalt</span><span class="val num" style="color:var(--ink)">'+nv('e-inc-tot',c.tot,'kr')+'</span></div></div>';
 // Per person
 h+=sh('Att sätta in varje månad')+'<div class="eko-people">'+c.per.map(x=>{const w=v=>x.inc?Math.max(0,v/x.inc*100):0;
  return'<div class="group eko-card"><div class="eko-name"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+'</div>'+
   '<div class="eko-left"><span class="fn">Kvar efter fasta</span><b class="num'+(x.left<0?' red':'')+'">'+nv('e-left-'+x.p,x.left,'kr')+'</b></div>'+
   '<div class="stack" aria-hidden="true"><i class="'+pcls(x.p)+'" style="width:'+w(x.dep)+'%"></i><i class="'+pcls(x.p)+' soft" style="width:'+w(x.pdep)+'%"></i></div>'+
   '<div class="eko-rows"><div><span><span class="sw '+pcls(x.p)+'"></span>Gemensamma kontot</span><b class="num">'+nv('e-dep-'+x.p,x.dep,'kr')+'</b></div>'+
   '<div><span><span class="sw '+pcls(x.p)+' soft"></span>Egna fasta</span><b class="num">'+nv('e-pdep-'+x.p,x.pdep,'kr')+'</b></div>'+
   '<div class="tot"><span>Summa</span><b class="num">'+nv('e-sum-'+x.p,x.sum,'kr')+'</b></div></div></div>'}).join('')+'</div>';
 h+='<div class="foot">Avrundat uppåt till '+kr(o.round||100)+' med '+(o.buffer!=null?o.buffer:2)+' % buffert, som i kalkylen.</div>';
 // Gemensamma utgifter
 h+='<div class="split"><div class="col">';
 h+=sh('Gemensamma fasta',kr(c.shared)+'/mån')+group((o.shared||[]).map(x=>costRow(x,'shared',c.per)).join('')+'<button class="cell link" data-act="ekoCost" data-list="shared"><span class="grow" style="color:var(--accent)">Lägg till utgift</span></button>');
 h+='</div><div class="col">';
 people().forEach(p=>{const l=(o.personal||{})[p]||[];h+=sh(esc(p)+'s fasta',kr(sumMonth(l))+'/mån')+group(l.map(x=>costRow(x,p)).join('')+'<button class="cell link" data-act="ekoCost" data-list="'+esc(p)+'"><span class="grow" style="color:var(--accent)">Lägg till utgift</span></button>')});
 h+='</div></div>';
 // Dela en kostnad
 h+=sh('Dela en kostnad')+group('<div class="cell"><input class="field" id="split-amt" inputmode="decimal" placeholder="Belopp att dela, t.ex. 1000" aria-label="Belopp att dela"></div><div class="cell eko-calc" id="split-out" aria-live="polite"></div>');
 // Historik
 const months=Object.keys(ekoInc()).filter(k=>Object.values(ekoInc()[k]||{}).some(Number)).sort().reverse().slice(0,12);
 if(months.length){const max=Math.max(...months.map(k=>people().reduce((a,p)=>a+(Number(ekoInc()[k][p])||0),0)));
  h+=sh('Inkomst per månad')+group(months.map(k=>{const v=ekoInc()[k],t=people().reduce((a,p)=>a+(Number(v[p])||0),0);
   return'<div class="cell hist" title="'+esc(people().map(p=>p+' '+kr(v[p]||0)).join(', '))+'"><span class="hm">'+esc(cap(monthName(k)))+'</span><div class="hbar" aria-hidden="true">'+people().map(p=>'<i class="'+pcls(p)+'" style="width:'+((Number(v[p])||0)/max*100)+'%"></i>').join('')+'</div><span class="val num">'+kr(t)+'</span></div>'}).join(''))}
 // Inställningar
 h+=sh('Beräkning')+group(fieldCell('Buffert, %','<input class="field r" data-change="eko" data-id="buffer" inputmode="decimal" value="'+esc(o.buffer!=null?o.buffer:2)+'" style="max-width:90px">')+fieldCell('Avrunda uppåt till, kr','<input class="field r" data-change="eko" data-id="round" inputmode="numeric" value="'+esc(o.round||100)+'" style="max-width:90px">'));
 setTimeout(()=>{const el=document.getElementById('split-amt');if(el&&el.value)splitPreview(el);else{const out=document.getElementById('split-out');if(out)splitPreview({value:1000})}},0);
 return h};

/* ---------- utseende ---------- */
function applyTheme(fade){const root=document.documentElement;
 if(fade&&!calm()){root.classList.add('theme-fade');clearTimeout(applyTheme.t);applyTheme.t=setTimeout(()=>root.classList.remove('theme-fade'),450)}
 if(S.theme==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',S.theme);
 document.querySelectorAll('meta[name="theme-color"]').forEach(mt=>{const dark=S.theme==='dark'||(S.theme==='system'&&/dark/.test(mt.media));mt.content=dark?'#000000':'#F2F2F7'})}
applyTheme(false);

/* ---------- animationer ----------
   Vyerna ritas om helt vid varje ändring. A.before/A.after jämför före och efter
   och spelar upp rörelsen: sidbyte, rader som flyttar sig eller tillkommer,
   siffror som räknas, staplar som fylls, segmentreglage och konfetti. */
const calm=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
const nv=(k,v,f)=>'<span class="nv" data-n="'+k+'" data-v="'+(Math.round(Number(v)*100)/100)+'" data-f="'+(f||'n')+'">'+(f==='kr'?kr(v):Math.round(v))+'</span>';
const rowKey=el=>el.dataset.act+':'+el.dataset.id;
const A={page:'',keys:null,rects:null,nums:{},bars:{},segs:{},done:null,user:0,cookStep:null,widgets:null,
 before(m){this.rects=null;
  if(this.flip){this.rects={};m.querySelectorAll('.cell input.check').forEach(b=>{const r=b.closest('.cell').getBoundingClientRect();if(r.height)this.rects[rowKey(b)]=r.top});this.flip=false}
  this.widgets=S.view==='oversikt'?[...m.querySelectorAll('.widget')].map(w=>w.innerHTML):null},
 after(m){const page=S.view+'|'+(S.recipe||'')+'|'+(S.view==='mat'?S.matTab:''),newPage=page!==this.page,prev=this.page;this.page=page;
  const keys=new Set([...m.querySelectorAll('.cell input.check')].map(rowKey));
  if(!calm()){
   if(newPage&&prev){const[pv,pr]=prev.split('|');const cls=S.recipe&&!pr?'in-right':(!S.recipe&&pr&&pv===S.view)?'in-left':'in-fade';
    m.classList.remove('in-fade','in-right','in-left');void m.offsetWidth;m.classList.add(cls)}
   if(!newPage){
    // Rader som flyttat sig glider till sin nya plats
    if(this.rects)m.querySelectorAll('.cell input.check').forEach(b=>{const old=this.rects[rowKey(b)];if(old==null)return;const row=b.closest('.cell'),dy=old-row.getBoundingClientRect().top;
     if(Math.abs(dy)>2&&row.animate)row.animate([{transform:'translateY('+dy+'px)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1)'})});
    // Nya rader fälls ut, men inte när en tillfällig rad får sitt riktiga id från kalkylarket
    if(this.keys&&![...this.keys].some(k=>/:tmp/.test(k))){const fresh=[...keys].filter(k=>!this.keys.has(k));
     if(fresh.length&&fresh.length<=3)fresh.forEach(k=>{const b=m.querySelector('.cell input.check[data-act="'+k.split(':')[0]+'"][data-id="'+CSS.escape(k.slice(k.indexOf(':')+1))+'"]');if(b)b.closest('.cell').classList.add('appear')})}
    // Översiktens rutor tonar när ny data kommer utan att någon har tryckt
    if(this.widgets&&Date.now()-this.user>2000)m.querySelectorAll('.widget').forEach((w,i)=>{if(this.widgets[i]!=null&&this.widgets[i]!==w.innerHTML){w.classList.remove('upd');void w.offsetWidth;w.classList.add('upd')}})}
  }
  this.keys=keys;
  // Siffror räknas från förra värdet
  m.querySelectorAll('.nv').forEach(el=>{const k=el.dataset.n,v=Number(el.dataset.v),f=el.dataset.f,old=this.nums[k];this.nums[k]=v;
   if(old==null||old===v||calm())return;const fmt=x=>f==='kr'?kr(x):String(Math.round(x));const t0=performance.now(),dur=650;
   const step=now=>{const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(old+(v-old)*e);if(p<1&&el.isConnected)requestAnimationFrame(step)};
   el.textContent=fmt(old);requestAnimationFrame(step)});
  // Staplar fylls från förra läget, eller från noll på en ny sida
  m.querySelectorAll('.thin>i,.cap>i').forEach((el,i)=>{const k=S.view+':'+i,to=el.style.width,from=newPage?'0%':this.bars[k];this.bars[k]=to;
   if(calm()||from==null||from===to)return;el.style.transition='none';el.style.width=from;void el.offsetWidth;el.style.transition='';el.style.width=to});
  segSlide(m);
  this.celebrate(newPage)},
 // Konfetti när något blir helt klart genom ett tryck
 celebrate(newPage){const d=D(),t=today(),cp=cleanPlan();
  const st={shop:d.shop.length>0&&d.shop.every(i=>i.done),
   clean:cp.routines.length+cp.doneRot.length>0&&cp.todo.length===0&&cp.routines.every(doneToday),
   tasks:d.tasks.some(x=>isDate(x.due)&&x.due<=t)&&d.tasks.filter(x=>isDate(x.due)&&x.due<=t).every(x=>x.done)};
  const was=this.done;this.done=st;if(!was||Date.now()-this.user>3000)return;
  const msg=st.shop&&!was.shop?'Allt är handlat! 🎉':st.clean&&!was.clean?'Dagens städpass är klart! ✨':st.tasks&&!was.tasks?'Alla dagens uppgifter är klara! 🎉':'';
  if(msg){toast(msg);confetti()}}};
function checkAnim(id,done,then){A.user=Date.now();
 const box=[...document.querySelectorAll('.cell input.check')].find(b=>b.dataset.id===id),row=box&&box.closest('.cell');
 if(!row||calm()){A.flip=true;then();return}
 // Klicket på kryssrutan avbryts (appen ritar om den själv), så bocken sätts först i nästa bildruta
 requestAnimationFrame(()=>{box.checked=done;row.classList.add(done?'checking':'unchecking')});
 setTimeout(()=>{A.flip=true;then()},done?400:180)}
function leaveAnim(act,items,then){A.user=Date.now();const ids=new Set(items.map(i=>i.id));
 const rows=[...document.querySelectorAll('.cell input.check[data-act="'+act+'"]')].filter(b=>ids.has(b.dataset.id)).map(b=>b.closest('.cell'));
 if(!rows.length||calm()){then();return}
 rows.forEach(r=>{r.style.height=r.offsetHeight+'px';void r.offsetHeight;r.classList.add('leaving')});setTimeout(then,300)}
function segSlide(root){root.querySelectorAll('.segc[data-seg]').forEach(sg=>{const k=sg.dataset.seg,i=Number(getComputedStyle(sg).getPropertyValue('--i'))||0,old=A.segs[k];A.segs[k]=i;
 const th=sg.querySelector('.seg-thumb');if(old==null||old===i||calm()||!th||!th.animate)return;
 th.animate([{transform:'translateX('+old*100+'%)'},{transform:'translateX('+i*100+'%)'}],{duration:380,easing:'cubic-bezier(.3,1.25,.5,1)'})})}
function flipClock(c,txt){if(c.dataset.v===txt)return;const old=c.dataset.v||'';c.dataset.v=txt;
 if(!old||calm()){c.textContent=txt;return}
 c.innerHTML=[...txt].map((ch,i)=>'<span'+(ch!==old[i]?' class="fl"':'')+'>'+ch+'</span>').join('')}
function confetti(){if(calm())return;const cv=document.createElement('canvas'),dpr=window.devicePixelRatio||1,W=innerWidth,H=innerHeight;
 cv.className='confetti';cv.width=W*dpr;cv.height=H*dpr;document.body.appendChild(cv);const g=cv.getContext('2d');g.scale(dpr,dpr);
 const css=getComputedStyle(document.documentElement),cols=['--accent','--green','--orange','#FFCC00','#5AC8FA'].map(c=>c[0]==='-'?css.getPropertyValue(c).trim():c);
 const P=Array.from({length:140},(_,i)=>({x:W*(i%2?.15:.85),y:H*.75,vx:(i%2?1:-1)*(1+Math.random()*9),vy:-(9+Math.random()*9),r:Math.random()*6.28,vr:(Math.random()-.5)*.4,w:6+Math.random()*6,h:4+Math.random()*4,c:cols[i%cols.length]}));
 const t0=performance.now();(function fr(now){const t=now-t0;g.clearRect(0,0,W,H);g.globalAlpha=Math.max(0,1-Math.max(0,t-1800)/700);
  P.forEach(p=>{p.vy+=.32;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*2)));g.restore()});
  if(t<2500)requestAnimationFrame(fr);else cv.remove()})(t0)}

/* ---------- local mutations (optimistic) ---------- */
function mutate(list,id,fields){const it=D()[list].find(x=>x.id===id);if(it)Object.assign(it,fields);render()}
function closeSheets(){S.sheet=null;S.rate=null;S.ekoEdit=null;S.shopAdd=false;S.taskAdd=false}

/* ---------- actions ---------- */
const ACT={
 nav(id){try{document.activeElement&&document.activeElement.blur()}catch(e){}id=normView(id);S.shopAdd=false;S.taskAdd=false;S.view=id;S.recipe=null;S.confirm=null;lsSet('view',id);try{history.replaceState(null,'','#'+id)}catch(e){}window.scrollTo(0,0);render()},
 refresh(){refresh()},
 settings(){S.sheet='settings';render()},
 sheetClose(){closeSheets();render()},
 sheetBg(id,el,e){if(e.target===el){closeSheets();render()}},
 me(id){S.me=id;lsSet('me',id);render()},
 logout(){S.key='';S.data=null;S.sheet=null;lsSet('key',null);lsSet('cache',null);render()},
 copy(id){try{navigator.clipboard.writeText(id).then(()=>toast('Kopierat'),()=>toast('Markera och kopiera texten'))}catch(e){toast('Markera och kopiera texten')}},
 theme(id){S.theme=['light','dark'].includes(id)?id:'system';lsSet('theme',S.theme==='system'?null:S.theme);applyTheme(true);render()},
 wall(){S.wall=!S.wall;lsSet('wall',S.wall?'1':'0');wake();render()},
 matTab(id){S.matTab=['recept','bank','inkop'].includes(id)?id:'vecka';lsSet('matTab',S.matTab);S.recipe=null;render()},
 recipe(id){S.view='mat';S.recipe=id;lsSet('view','mat');try{history.replaceState(null,'','#mat')}catch(e){}window.scrollTo(0,0);render()},
 recipeBack(){S.recipe=null;window.scrollTo(0,0);render()},
 scale(id,el){const r=recipeById(id);const{p}=scaled(r);S.scale[id]=Math.max(1,Math.min(20,p+Number(el.dataset.d)));render()},
 cook(id){S.cook={id,step:S.step[id]||0};wake();render()},
 pickStep(id,el){S.step[id]=Number(el.dataset.i);render();setTimeout(()=>{const li=document.querySelector('.steps li.active');if(li&&li.getBoundingClientRect().top<70)li.scrollIntoView({block:'start',behavior:'smooth'})},30)},
 cookStep(id,el){A.user=Date.now();const r=recipeById(S.cook.id);S.cook.step=Math.max(0,Math.min(r.steps.length-1,S.cook.step+Number(el.dataset.d)));S.step[S.cook.id]=S.cook.step;render()},
 ekoMonth(id,el){S.ekoMonth=addMonths(S.ekoMonth||thisMonth(),Number(el.dataset.d));render()},
 ekoIncome(){S.sheet='income';render()},
 ekoCost(id,el){S.ekoEdit={list:el.dataset.list,id:id||null};S.sheet='cost';render()},
 ekoDel(){const e=S.ekoEdit;if(!e||!e.id)return;closeSheets();A.user=Date.now();A.flip=true;
  updJSON('ekonomi',{},o=>{ekoListIn(o,e.list,l=>l.filter(x=>x.id!==e.id));return o});toast('Utgiften är borttagen')},
 wxRefresh(){loadWx(true).then(ok=>{if(ok){lsSet('ext',JSON.stringify(EXT))}render();if(!ok)toast('Vädret kunde inte hämtas')})},
 cookDone(id){S.cook=null;A.cookStep=null;wake();ACT.rate(id)},
 rate(id){S.rate={id};S.sheet='rate';render()},
 bankFilter(id){S.bankFilter=id;render()},
 bankAdd(id){addToBank(recipeById(id));render()},
 wish(id){const r=recipeById(id);if(!r)return;A.user=Date.now();const on=wishes().some(x=>x.id===id);
  if(!on&&!inBank(id))addToBank(r,true);
  updJSON('onskelista',[],a=>on?a.filter(x=>x.id!==id):a.some(x=>x.id===id)?a:a.concat([{id,t:r.title,by:S.me||'',d:today()}]));
  toast(on?'Borttagen från önskelistan':'Önskad till nästa vecka')},
 cookClose(){S.cook=null;A.cookStep=null;wake();render()},
 timer(id,el){unlockAudio();const m=Number(el.dataset.min);S.timers.push({k:Math.random().toString(36).slice(2),label:el.dataset.label||'Timer',end:Date.now()+m*60000,ring:false});tick();toast('Timer: '+m+' min')},
 timerStop(id){S.timers=S.timers.filter(t=>t.k!==id);tick()},
 shopFilter(id){S.shopFilter=id;render()},
 shopAdd(){S.shopAdd=!S.shopAdd;render();if(S.shopAdd)setTimeout(()=>document.getElementById('shop-name')?.focus(),30)},
 shopToggle(id){const i=D().shop.find(x=>x.id===id);if(!i)return;const done=!i.done;checkAnim(id,done,()=>{mutate('shop',id,{done});apiPost({action:'shopToggle',id,done})})},
 clearShop(){S.confirm='clearShop';render()},
 clearShopYes(){S.confirm=null;leaveAnim('shopToggle',D().shop.filter(i=>i.done),()=>{S.data.shop=D().shop.filter(i=>!i.done);render();apiPost({action:'shopClearDone'})})},
 confirmNo(){S.confirm=null;render()},
 taskAdd(){S.taskAdd=!S.taskAdd;render();if(S.taskAdd)setTimeout(()=>document.getElementById('task-title')?.focus(),30)},
 taskToggle(id){const x=D().tasks.find(t=>t.id===id);if(!x)return;const done=!x.done;checkAnim(id,done,()=>{mutate('tasks',id,{done});apiPost({action:'taskToggle',id,done})})},
 clearTasks(){S.confirm='clearTasks';render()},
 clearTasksYes(){S.confirm=null;leaveAnim('taskToggle',D().tasks.filter(i=>i.done),()=>{S.data.tasks=D().tasks.filter(i=>!i.done);render();apiPost({action:'taskClearDone'})})},
 cleanToggle(id){const t=D().clean.find(x=>x.id===id);if(!t)return;
  if(doneToday(t))checkAnim(id,false,()=>{mutate('clean',id,{lastDone:t.prevDone||'',prevDone:'',doneBy:''});apiPost({action:'cleanUndo',id})});
  else checkAnim(id,true,()=>{mutate('clean',id,{prevDone:t.lastDone,lastDone:today(),doneBy:S.me,plannedFor:'',snoozeUntil:''});apiPost({action:'cleanDone',id})})},
 snooze(id){const v=addDays(today(),1);mutate('clean',id,{snoozeUntil:v});apiPost({action:'cleanSet',id,fields:{snoozeUntil:v}});toast('Flyttad till i morgon')},
 planToday(id){mutate('clean',id,{plannedFor:today(),snoozeUntil:''});apiPost({action:'cleanSet',id,fields:{plannedFor:today(),snoozeUntil:''}})},
 planSat(id){const d=nextSaturday();mutate('clean',id,{plannedFor:d});apiPost({action:'cleanSet',id,fields:{plannedFor:d}});toast('Inplanerad '+dateShort(d))},
 unplan(id){mutate('clean',id,{plannedFor:''});apiPost({action:'cleanSet',id,fields:{plannedFor:''}})},
 orkPick(id){const el=document.getElementById('ork');if(el){el.value=id;orkPreview(el)}ACT.budget(String(ORK[Number(id)].min))},
 budget(id){const v=today()+'|'+id;S.data.settings.stadtid_idag=v;render();apiPost({action:'setting',k:'stadtid_idag',v})}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act;if(!ACT[a])return;
 if(el.tagName==='INPUT'&&el.type==='checkbox')e.preventDefault();
 ACT[a](el.dataset.id,el,e)});
// Kom ihåg vilka hopfällbara sektioner som är öppna mellan renderingar
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.k)S.open[d.dataset.k]=d.open},true);
document.addEventListener('input',e=>{if(e.target.id==='ork')orkPreview(e.target);if(e.target.id==='split-amt')splitPreview(e.target)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(!el)return;const id=el.dataset.id;
 if(el.dataset.change==='ork'){el.blur();ACT.budget(String(ORK[Number(el.value)].min));return}
 if(el.dataset.change==='eko'){const v=Math.max(0,Number(String(el.value).replace(',','.'))||0);updJSON('ekonomi',{},o=>{o[id]=v;return o});return}
 const f=el.dataset.change==='freq'?{freq:Number(el.value)}:{who:el.value};mutate('clean',id,f);apiPost({action:'cleanSet',id,fields:f})});
document.addEventListener('submit',async e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const d=Object.fromEntries(new FormData(f));
 if(f.dataset.form==='setup'){S.key=String(d.key||'').trim().toLowerCase();S.error='';S.sync='busy';render();
  try{const data=await apiGet();lsSet('key',S.key);setData(data);S.sync='idle';if(!S.me)S.sheet='settings'}catch(err){S.error=err.message;S.key=''}render();return}
 if(f.dataset.form==='shop'){if(!d.name.trim())return;const price=parseFloat(String(d.price||'').replace(',','.'));
  D().shop.push({id:'tmp'+Date.now(),done:false,name:d.name.trim(),qty:d.qty.trim(),cat:d.cat,meals:[],price:isNaN(price)?null:price,offer:'',source:'egen',addedBy:S.me,order:1000});
  f.reset();render();setTimeout(()=>document.getElementById('shop-name')?.focus(),30);
  apiPost({action:'shopAdd',name:d.name.trim(),qty:d.qty.trim(),cat:d.cat,price:isNaN(price)?'':price});toast('Tillagd')}
 if(f.dataset.form==='task'){if(!d.title.trim())return;
  D().tasks.push({id:'tmp'+Date.now(),done:false,title:d.title.trim(),due:d.due||'',who:d.who||'',note:'',source:'egen'});S.taskAdd=false;render();
  apiPost({action:'taskAdd',title:d.title.trim(),due:d.due||'',who:d.who||''})}
 if(f.dataset.form==='income'){const m=S.ekoMonth||thisMonth(),v={};people().forEach((p,i)=>{v[p]=Math.round(Number(String(d['p'+i]||'').replace(/\s/g,'').replace(',','.'))||0)});
  closeSheets();A.user=Date.now();updJSON('ekonomi_inkomst',{},o=>{o[m]=v;return o});toast('Inkomsten för '+monthName(m)+' är sparad');return}
 if(f.dataset.form==='cost'){const e=S.ekoEdit||{},amt=Number(String(d.amount||'').replace(/\s/g,'').replace(',','.'));if(!d.name||!isFinite(amt))return;
  const c={id:e.id||('x'+Date.now().toString(36)),name:d.name.trim(),amount:amt,period:d.period||'månad',pay:d.pay||'',day:String(d.day||'').trim(),note:String(d.note||'').trim()};
  closeSheets();A.user=Date.now();A.flip=true;
  updJSON('ekonomi',{},o=>{ekoListIn(o,e.list,l=>l.some(x=>x.id===c.id)?l.map(x=>x.id===c.id?c:x):l.concat([c]));return o});toast(e.id?'Sparat':'Utgiften är tillagd');return}
 if(f.dataset.form==='rate'){const r=recipeById(S.rate&&S.rate.id),who=S.me||d.who;if(!r||!who||!d.s)return;
  const sN=Number(d.s),v=d.v||(sN>=4?'igen':sN===3?'okej':'aldrig'),e={s:sN,v,c:String(d.c||'').trim(),d:today()};
  closeSheets();A.user=Date.now();
  updJSON('betyg',{},o=>{o[r.id]=o[r.id]||{p:{}};o[r.id].t=r.title;o[r.id].p=o[r.id].p||{};o[r.id].p[who]=e;return o});
  const saved=(sN>=4||v==='igen')&&addToBank(r,true);
  toast(saved?'Tack! Receptet sparades i receptbanken':'Tack för betyget!');if(sN>=4)confetti();return}
 if(f.dataset.form==='settings'){const p=[d.p1.trim()||'Henrik',d.p2.trim()||'Cornelia'].join(', ');const st=settings();
  const ch=[['personer',p],['stadtid_vardag',String(Number(d.wd)||20)],['stadtid_helg',String(Number(d.we)||40)],['matbudget',String(Number(d.budget)||0)]].filter(([k,v])=>String(st[k]||'')!==v);
  ch.forEach(([k,v])=>{st[k]=v;apiPost({action:'setting',k,v})});S.sheet=null;render();if(ch.length)toast('Sparat')}
});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(!VIEW_IDS.includes(h)&&!OLD_VIEWS[h])return;const tab=S.matTab,v=normView(h);if(v!==S.view||tab!==S.matTab||S.recipe)ACT.nav(v)});
document.addEventListener('keydown',e=>{if(S.cook){if(e.key==='ArrowRight')ACT.cookStep(null,{dataset:{d:1}});if(e.key==='ArrowLeft')ACT.cookStep(null,{dataset:{d:-1}});if(e.key==='Escape')ACT.cookClose()}else if((S.sheet||S.shopAdd||S.taskAdd)&&e.key==='Escape'){closeSheets();render()}});

/* ---------- timers, clock, wake lock ---------- */
let actx=null;function unlockAudio(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume()}catch(e){}}
function beep(){if(!actx)return;try{for(let i=0;i<3;i++){const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+i*.35;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.start(t);o.stop(t+.3)}}catch(e){}}
function tick(){
 const c=document.getElementById('clock');if(c){const n=new Date(),txt=pad(n.getHours())+':'+pad(n.getMinutes());
  if(c.dataset.v!==txt){flipClock(c,txt);const nx=document.getElementById('hero-next');if(nx)nx.innerHTML=nextHtml()}}
 const box=document.getElementById('timers');
 box.innerHTML=S.timers.map(t=>{const ms=t.end-Date.now();if(ms<=0&&!t.ring){t.ring=true;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}const s=Math.max(0,Math.ceil(ms/1000));
  return'<div class="timer'+(t.ring?' ring':'')+'"><span>'+esc(t.label)+'</span><span class="num">'+(t.ring?'Klart!':Math.floor(s/60)+':'+pad(s%60))+'</span><button data-act="timerStop" data-id="'+t.k+'" aria-label="Stäng timer">'+I.x+'</button></div>'}).join('');
 if(S.timers.some(t=>t.ring)&&Date.now()%5000<1000)beep()}
setInterval(tick,1000);
let lock=null;
async function wake(){const want=S.wall||!!S.cook;try{if(want&&!lock&&navigator.wakeLock){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}else if(!want&&lock){await lock.release();lock=null}}catch(e){lock=null}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){wake();refresh(true)}});
// Hämta nytt var 30:e sekund när appen syns (var 60:e i väggläge räcker också), och rita om vid ny dag
setInterval(()=>{if(document.visibilityState==='visible')refresh(true)},30000);
let lastDay=today();setInterval(()=>{if(today()!==lastDay){lastDay=today();render()}},30000);

render();if(S.key)refresh();wake();
})();
