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

const I={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/></svg>',
 cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2L20 8H6.3"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12l3 3 5-6"/></svg>',
 broom:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l-3.5 9"/><path d="M6.5 12h8l2 9h-12z"/><path d="M9 16v5M12 16v5"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 screen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>',
 refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>'
};
const VIEWS=[['oversikt','Översikt',I.home],['matsedel','Matsedel',I.menu],['inkop','Inköp',I.cart],['recept','Recept',I.book],['uppgifter','Uppgifter',I.check],['stad','Städ',I.broom]];
const VIEW_IDS=VIEWS.map(v=>v[0]);

/* ---------- state ---------- */
const CFG=window.HT_CONFIG||{};
const S={key:lsGet('key')||'',me:lsGet('me')||'',view:lsGet('view')||'oversikt',wall:lsGet('wall')==='1',
 data:null,sync:'idle',lastSync:null,error:'',recipe:null,scale:{},cook:null,shopFilter:'alla',shopAdd:false,taskAdd:false,
 sheet:null,confirm:null,timers:[],pending:0,step:{}};
try{const c=lsGet('cache');if(c)S.data=JSON.parse(c)}catch(e){}
const h0=location.hash.slice(1);if(VIEW_IDS.includes(h0))S.view=h0;
if(!VIEW_IDS.includes(S.view))S.view='oversikt';

const D=()=>S.data||{settings:{},shop:[],tasks:[],clean:[],menu:[],events:[],offers:[],recipes:[]};
const settings=()=>D().settings||{};
const people=()=>{const p=String(settings().personer||'').split(',').map(s=>s.trim()).filter(Boolean);return p.length?p:['Henrik','Cornelia']};
const recipeById=id=>D().recipes.find(r=>r.id===id);

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
function whoChip(w){const k=w==='Henrik'?'h':w==='Vegetariskt'?'v':w==='Gemensam'?'g':'';return'<span class="chip '+k+'">'+esc(w)+'</span>'}
const shopCost=items=>items.reduce((s,i)=>s+(Number(i.price)||0),0);
const isBase=i=>(i.meals||[]).length>0&&(i.meals||[]).every(m=>m==='Bas');
function planPortions(){const ids=new Set();D().menu.forEach(m=>{if(m.recipe)ids.add(m.recipe)});
 String(settings().storkok||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(id=>ids.add(id));
 let n=0;ids.forEach(id=>{const r=recipeById(id);if(r&&r.course!=='efterrätt')n+=r.portions||0});return n}

/* ---------- render ---------- */
let rq=0,pendingRender=false;
function render(){if(rq)return;rq=setTimeout(()=>{rq=0;doRender()},0)}
function busyTyping(){const a=document.activeElement;return a&&a.closest&&a.closest('#main,#overlay')&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.type!=='checkbox'}
function renderStatus(){const el=document.getElementById('sync');if(el)el.outerHTML=statusHtml()}
function statusHtml(){const t=S.lastSync?pad(S.lastSync.getHours())+':'+pad(S.lastSync.getMinutes()):'';
 const cls=S.sync==='busy'?'busy':S.sync==='err'?'err':'';const txt=S.sync==='busy'?'Sparar…':S.sync==='err'?'Ingen kontakt':(t?'Uppdaterad '+t:'');
 return'<button class="sync '+cls+' linkbtn" id="sync" data-act="refresh" aria-label="Uppdatera nu"><i></i>'+txt+'</button>'}
function doRender(){
 document.body.classList.toggle('wall',S.wall);
 document.body.classList.toggle('cook-open',!!S.cook);
 const nav=document.getElementById('nav'),m=document.getElementById('main');
 if(!CFG.api||/DIN-/.test(CFG.api)){nav.hidden=true;m.innerHTML='<div class="setup"><h1>Hemma</h1><div class="banner">Appen är inte kopplad till kalkylarket än. Lägg in adressen till Apps Script-webbappen i filen <b>config.js</b>.</div></div>';return}
 if(!S.key){nav.hidden=true;renderOverlay();if(busyTyping())return;m.innerHTML=setupHtml();return}
 nav.hidden=false;
 nav.innerHTML='<div class="brand" aria-hidden="true">Ht</div>'+VIEWS.map(([id,l,ic])=>'<button data-act="nav" data-id="'+id+'"'+(S.view===id?' aria-current="page"':'')+'>'+ic+'<span>'+l+'</span></button>').join('');
 renderOverlay();
 if(busyTyping()){pendingRender=true;return}
 pendingRender=false;
 if(!S.data){m.innerHTML='<div class="setup"><h1>Hemma</h1><p class="muted">Hämtar hushållets data…</p>'+(S.sync==='err'?'<div class="banner">'+esc(S.error)+'</div><button class="btn" data-act="refresh">Försök igen</button>':'')+'</div>';return}
 const banner=S.sync==='err'?'<div class="banner">Ingen kontakt med kalkylarket just nu. Du ser senast hämtade data. '+esc(S.error)+'</div>':'';
 m.innerHTML=banner+(V[S.view]||V.oversikt)();
}
document.addEventListener('focusout',()=>setTimeout(()=>{if(pendingRender&&!busyTyping())render()},50));
function setupHtml(){return'<form class="setup" data-form="setup"><h1>Hemma</h1><p>Skriv hushållets kod för att öppna tavlan. Du behöver bara göra det en gång på den här enheten.</p>'+
 '<input id="setup-key" name="key" class="btn" style="border-radius:12px;font-weight:400" placeholder="t.ex. lingon-tass-42" autocomplete="off" autocapitalize="none" spellcheck="false" required>'+
 '<button class="btn primary" style="justify-content:center">Öppna tavlan</button>'+(S.error?'<div class="banner">'+esc(S.error)+'</div>':'')+'</form>'}

function topbar(title,sub,extra){return'<div class="topbar"><div><h1>'+title+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div><div class="tools">'+(extra||'')+'<button class="btn ghost icon" data-act="settings" aria-label="Inställningar">'+I.gear+'</button></div></div>'}
function weekSub(){const st=settings();return esc(st.vecka_rubrik||'')+(isDate(st.uppdaterad)?' · uppdaterad '+esc(dateShort(st.uppdaterad)):'')}

const V={};
V.oversikt=function(){
 const t=today(),now=new Date(),days=planDays();
 const td=dayOf(t),tm=dayOf(addDays(t,1));
 const nextDay=(td&&td.meals.length)?td:days.find(d=>d.date>t&&d.meals.length);
 const cp=cleanPlan(),d=D();
 const left=d.shop.filter(i=>!i.done);
 const tasksNow=d.tasks.filter(x=>!x.done&&isDate(x.due)&&x.due<=t).sort((a,b)=>a.due.localeCompare(b.due));
 const tasksSoon=d.tasks.filter(x=>!x.done&&!(isDate(x.due)&&x.due<=t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,4);
 const routinesLeft=cp.routines.filter(x=>!doneToday(x));
 let h='<div class="hero"><div><div class="clock num" id="clock">'+pad(now.getHours())+':'+pad(now.getMinutes())+'</div><div class="datebig">'+esc(dateLong(t))+' · v. '+isoWeek(now)+'</div></div>'+
  '<div class="tools">'+statusHtml()+'<button class="btn'+(S.wall?' primary':'')+'" data-act="wall">'+I.screen+(S.wall?'Väggläge på':'Väggläge')+'</button><button class="btn ghost icon" data-act="settings" aria-label="Inställningar">'+I.gear+'</button></div></div>';
 h+='<div class="grid">';
 h+='<section class="card"><div class="card-head"><h2>Idag</h2><span class="label">'+esc(dayName(t))+'</span></div>'+(eventsHtml(td)||'<div class="empty">Inga händelser idag.</div>');
 if(tasksNow.length)h+='<div class="list">'+tasksNow.map(taskRow).join('')+'</div>';
 h+='</section>';
 h+='<section class="card"><div class="card-head"><h2>'+(nextDay&&nextDay.date===t?'Mat idag':'Nästa planerade mat')+'</h2><button class="linkbtn" data-act="nav" data-id="matsedel">Hela veckan</button></div>';
 if(nextDay){if(nextDay.date!==t)h+='<div class="label">'+esc(dateLong(nextDay.date))+'</div>';h+=mealsHtml(nextDay)}
 else h+='<div class="empty">Ingen matsedel inlagd än. Den fylls i när veckoplaneringen körs på onsdag.</div>';
 h+='</section>';
 const doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 h+='<section class="card"><div class="card-head"><h2>Dagens städ</h2><span class="muted small num">'+doneN+' av '+totN+' · ca '+cp.minLeft+' min kvar</span></div>';
 h+='<div class="bar"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>';
 const q=[...routinesLeft,...cp.todo].slice(0,5);
 h+=q.length?'<div class="list">'+q.map(x=>cleanRow(x)).join('')+'</div>':'<div class="empty">Allt för idag är klart. Snyggt jobbat.</div>';
 h+='<button class="linkbtn" data-act="nav" data-id="stad">Öppna städschemat</button></section>';
 h+='<section class="card"><div class="card-head"><h2>Inköp</h2><button class="linkbtn" data-act="nav" data-id="inkop">Öppna listan</button></div>';
 h+='<div class="stats"><div class="stat"><span class="label">Kvar att handla</span><b class="num">'+left.length+'</b></div><div class="stat"><span class="label">Kostar ca</span><b class="num">'+kr(shopCost(left))+'</b></div></div></section>';
 h+='<section class="card"><div class="card-head"><h2>Kommande uppgifter</h2><button class="linkbtn" data-act="nav" data-id="uppgifter">Alla</button></div>';
 h+=tasksSoon.length?'<div class="list">'+tasksSoon.map(taskRow).join('')+'</div>':'<div class="empty">Inga fler uppgifter.</div>';
 h+='</section>';
 const rh=roomHealth();
 h+='<section class="card"><h2>Hemmet just nu</h2>'+(rh.length?rh.map(healthRow).join(''):'<div class="empty">Städschemat är tomt.</div>')+'</section>';
 if(tm)h+='<section class="card"><div class="card-head"><h2>Imorgon</h2><span class="label">'+esc(dateShort(tm.date))+'</span></div>'+(eventsHtml(tm)||'<div class="empty">Inga händelser.</div>')+mealsHtml(tm,true)+'</section>';
 return h+'</div>'};
const healthRow=r=>'<div class="health"><span>'+esc(r.room)+'</span><div class="bar '+healthCls(r.score)+'"><i style="width:'+Math.round(r.score*100)+'%"></i></div><span class="small muted">'+healthWord(r.score)+'</span></div>';
function eventsHtml(d){if(!d||!d.events.length)return'';return'<div class="events">'+d.events.map(e=>'<div><span class="t">'+esc(e.time||'Heldag')+'</span><span>'+esc(e.title)+'</span></div>').join('')+'</div>'}
function mealsHtml(d,compact){const ms=d.meals||[];if(!ms.length)return'<div class="empty">Ingen mat planerad.</div>';
 return'<div class="list" style="gap:8px">'+ms.map(m=>{const r=m.recipe&&recipeById(m.recipe);const open=r?'<button class="meal" data-act="recipe" data-id="'+esc(m.recipe)+'">':'<div class="meal">';const close=r?'</button>':'</div>';
  return open+whoChip(m.who)+(r&&r.kr?'<span class="small muted num" style="margin-left:auto">'+kr(r.kr)+'/port</span>':'')+'<div class="grow"><div class="title">'+esc(m.title)+'</div>'+(m.addon?'<div class="addon">+ Henrik: '+esc(m.addon)+'</div>':'')+(m.note&&!compact?'<div class="addon">'+esc(m.note)+'</div>':'')+'</div>'+close}).join('')+'</div>'}

V.matsedel=function(){
 const t=today(),d=D(),st=settings(),days=planDays();let h=topbar('Veckans matsedel',weekSub());
 if(!days.length)return h+'<div class="card empty">Matsedeln fylls i när veckoplaneringen körs på onsdag.</div>';
 const total=shopCost(d.shop.filter(i=>!isBase(i))),port=planPortions();
 h+='<div class="stats"><div class="stat"><span class="label">Maten kostar ca</span><b class="num">'+kr(total)+'</b></div><div class="stat"><span class="label">Portioner</span><b class="num">'+port+'</b></div><div class="stat"><span class="label">Per portion</span><b class="num">'+(port?kr(total/port):'–')+'</b></div></div>';
 h+='<div class="days">'+days.map(x=>'<section class="card day'+(x.date===t?' today':'')+'"><div class="card-head"><h3>'+esc(dateLong(x.date))+'</h3>'+(x.date===t?'<span class="chip offer">Idag</span>':'')+'</div>'+eventsHtml(x)+mealsHtml(x)+'</section>').join('')+'</div>';
 const batch=String(st.storkok||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(batch.length)h+='<section class="card"><h2>Storkok</h2>'+(st.storkok_not?'<p class="muted" style="margin:0">'+esc(st.storkok_not)+'</p>':'')+'<div class="list" style="gap:8px">'+batch.map(id=>{const r=recipeById(id);return r?'<button class="meal" data-act="recipe" data-id="'+esc(id)+'">'+whoChip(r.who)+'<span class="small muted num" style="margin-left:auto">'+kr(r.kr)+'/port</span><div class="grow"><div class="title">'+esc(r.title)+'</div><div class="addon">'+r.portions+' portioner'+(r.why?' · '+esc(r.why):'')+'</div></div></button>':''}).join('')+'</div></section>';
 if(d.offers.length)h+='<section class="card"><h2>Erbjudanden menyn bygger på</h2><div class="list">'+d.offers.map(o=>'<div class="row"><div class="grow"><div class="title">'+esc(o.item)+'</div><div class="meta">'+esc(o.store)+(o.note?' · '+esc(o.note):'')+'</div></div><span class="price num">'+esc(o.price)+'</span></div>').join('')+'</div>'+(st.erbjudanden_not?'<div class="small muted">'+esc(st.erbjudanden_not)+'</div>':'')+'</section>';
 return h};

V.inkop=function(){
 const d=D(),all=d.shop,f=S.shopFilter,st=settings();
 const groups=[['alla','Alla'],['offer','Erbjudanden'],['Vardag','Vardag'],['Helg','Helg'],['Storkok kött','Storkok kött'],['Storkok veg','Storkok veg'],['Bas','Bas'],['egen','Egna']];
 const match=i=>f==='alla'?true:f==='offer'?!!i.offer:f==='egen'?i.source==='egen':f==='Vardag'?(i.meals||[]).some(m=>m==='Vardag'||/^(Mån|Tis|Ons|Tor)/.test(m)):(i.meals||[]).some(m=>m.startsWith(f));
 const items=all.filter(match),left=all.filter(i=>!i.done),bought=all.filter(i=>i.done);
 const total=shopCost(all),port=planPortions(),mealCost=shopCost(all.filter(i=>!isBase(i))),B=Number(st.matbudget)||0;
 let h=topbar('Inköpslista',left.length+' kvar av '+all.length+' varor','<button class="btn primary" data-act="shopAdd">+ Lägg till</button>');
 h+='<div class="stats"><div class="stat"><span class="label">Hela listan</span><b class="num">'+kr(total)+'</b></div><div class="stat"><span class="label">Kvar att betala</span><b class="num">'+kr(shopCost(left))+'</b></div><div class="stat"><span class="label">Mat per portion</span><b class="num">'+(port?kr(mealCost/port):'–')+'</b><span class="small muted">'+port+' portioner</span></div>'+
  (B?'<div class="stat"><span class="label">Budget '+kr(B)+'</span><b class="num">'+(total>B?'+'+kr(total-B):kr(B-total)+' kvar')+'</b><div class="bar '+(total>B?'bad':total>B*.9?'warn':'')+'"><i style="width:'+Math.min(100,Math.round(total/B*100))+'%"></i></div></div>':'')+'</div>';
 if(S.shopAdd)h+='<form class="card form" data-form="shop"><input id="shop-name" name="name" placeholder="Vara, t.ex. havregryn" required autocomplete="off"><input id="shop-qty" name="qty" placeholder="Mängd" style="flex:0 1 120px"><select id="shop-cat" name="cat">'+CATS.map(c=>'<option>'+c+'</option>').join('')+'</select><input id="shop-price" name="price" inputmode="decimal" placeholder="Pris kr" style="flex:0 1 110px"><button class="btn primary">Lägg till</button><button type="button" class="btn ghost" data-act="shopAdd">Avbryt</button></form>';
 h+='<div class="seg" role="group" aria-label="Filter">'+groups.map(([k,l])=>'<button data-act="shopFilter" data-id="'+esc(k)+'" aria-pressed="'+(f===k)+'">'+l+'</button>').join('')+'</div>';
 h+='<div class="split"><section class="card">';
 if(!all.length)h+='<div class="empty">Listan är tom. Veckoplaneringen fyller i den på onsdagar, och ni kan lägga till egna varor.</div>';
 CATS.forEach(c=>{const g=items.filter(i=>(CATS.includes(i.cat)?i.cat:'Övrigt')===c).sort((a,b)=>(a.done-b.done)||(a.order||0)-(b.order||0));if(!g.length)return;
  h+='<div class="cat"><h3><span>'+c+'</span><span class="small muted num">'+kr(shopCost(g))+'</span></h3><div class="list">'+g.map(shopRow).join('')+'</div></div>'});
 if(bought.length)h+='<div class="tools" style="margin-top:8px">'+(S.confirm==='clearShop'?'<span class="muted">Ta bort '+bought.length+' avbockade?</span><button class="btn sm primary" data-act="clearShopYes">Ja, ta bort</button><button class="btn sm ghost" data-act="confirmNo">Avbryt</button>':'<button class="btn sm ghost" data-act="clearShop">Rensa avbockade ('+bought.length+')</button>')+'</div>';
 h+='</section><div style="display:flex;flex-direction:column;gap:14px">';
 h+='<section class="card"><h2>Hushållets preferenser</h2><div class="list">'+(st.pref_henrik?'<div class="row"><span class="chip h">Henrik</span><div class="grow small">'+esc(st.pref_henrik)+'</div></div>':'')+(st.pref_veg?'<div class="row"><span class="chip v">Vegetariskt</span><div class="grow small">'+esc(st.pref_veg)+'</div></div>':'')+(st.pref_ekonomi?'<div class="row"><span class="chip">Ekonomi</span><div class="grow small">'+esc(st.pref_ekonomi)+'</div></div>':'')+'</div></section>';
 const offers=all.filter(i=>i.offer);
 if(offers.length)h+='<section class="card"><h2>Erbjudanden på listan</h2><div class="list">'+offers.map(i=>'<div class="row"><div class="grow"><div class="title">'+esc(i.name)+'</div><div class="meta">'+esc(i.offer)+'</div></div></div>').join('')+'</div><div class="small muted">Priserna är uppskattade. Kolla hyllkanten i butiken.</div></section>';
 return h+'</div></div>'};
function shopRow(i){return'<div class="row'+(i.done?' done':'')+'"><input type="checkbox" class="check" data-act="shopToggle" data-id="'+esc(i.id)+'" aria-label="'+esc(i.name)+'"'+(i.done?' checked':'')+'><button class="grow rowbtn" data-act="shopToggle" data-id="'+esc(i.id)+'"><div class="title">'+esc(i.name)+'</div><div class="meta"><span>'+esc(i.qty||'')+'</span>'+(i.offer?'<span class="chip offer">'+esc(i.store||'Erbjudande')+'</span>':'')+(i.meals||[]).map(m=>'<span class="chip">'+esc(m)+'</span>').join('')+(i.source==='egen'&&i.addedBy?'<span class="chip">'+esc(i.addedBy)+'</span>':'')+'</div></button><span class="price num small">'+(i.price?kr(i.price):'')+'</span></div>'}

V.recept=function(){
 if(S.recipe){const r=recipeById(S.recipe);if(r)return recipeDetail(r);S.recipe=null}
 let h=topbar('Recept',weekSub());const rs=D().recipes;
 if(!rs.length)return h+'<div class="card empty">Inga recept än. De skapas tillsammans med veckans matsedel.</div>';
 const groups=[...new Set(['Storkok','Vardag','Helg'].concat(rs.map(r=>r.group||'Övrigt')))];
 const title={Storkok:'Storkok på söndag',Vardag:'Vardagsmiddagar',Helg:'Helgens gemensamma middagar'};
 groups.forEach(g=>{const list=rs.filter(r=>(r.group||'Övrigt')===g);if(!list.length)return;
  h+='<h2 style="font-size:1.25rem">'+esc(title[g]||g)+'</h2><div class="rgrid">'+list.map(r=>'<button class="rcard" data-act="recipe" data-id="'+esc(r.id)+'"><div style="display:flex;gap:6px;flex-wrap:wrap">'+whoChip(r.who)+(r.when?'<span class="chip">'+esc(r.when)+'</span>':'')+'</div><h3>'+esc(r.title)+'</h3><div class="facts"><span><b class="num">'+r.min+'</b> min</span><span><b class="num">'+r.portions+'</b> port</span>'+(r.kr?'<span><b class="num">'+kr(r.kr)+'</b>/port</span>':'')+'</div></button>').join('')+'</div>'});
 return h};
function scaled(r){const p=S.scale[r.id]||r.portions;return{p,f:p/r.portions}}
const qtyText=(it,f)=>it.q!=null?fmtQ(it.q*f)+' '+(it.u||''):(it.u||'');
function ingList(r,f,hits){return(r.groups||[]).map(g=>(g.title?'<div class="label" style="margin-top:10px">'+esc(g.title)+'</div>':'')+'<ul class="ing">'+g.items.map(it=>'<li'+(hits&&hits.includes(it)?' class="hit"':'')+'><span class="q">'+esc(qtyText(it,f))+'</span><span>'+esc(it.n)+'</span></li>').join('')+'</ul>').join('')}

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
 let h='<div><button class="linkbtn" data-act="recipeBack">← Alla recept</button></div>';
 h+='<div class="topbar"><div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+whoChip(r.who)+(r.when?'<span class="chip">'+esc(r.when)+'</span>':'')+(r.freezes?'<span class="chip v">Går att frysa</span>':'')+'</div><h1>'+esc(r.title)+'</h1><div class="facts" style="margin-top:8px"><span><b class="num">'+r.min+'</b> min</span>'+(r.kr?'<span><b class="num">'+kr(r.kr)+'</b> per portion</span>':'')+(r.protein?'<span>Protein <b class="num">'+esc(r.protein)+'</b></span>':'')+'</div></div><div class="tools"><button class="btn primary" data-act="cook" data-id="'+esc(r.id)+'">'+I.play+'Börja laga</button></div></div>';
 if(r.why)h+='<div class="note">'+esc(r.why)+'</div>';
 h+='<div class="recipe"><section class="card"><div class="card-head"><h2>Ingredienser</h2><div class="stepper"><button data-act="scale" data-id="'+esc(r.id)+'" data-d="-1" aria-label="Färre portioner">−</button><span class="num"><b>'+p+'</b> port</span><button data-act="scale" data-id="'+esc(r.id)+'" data-d="1" aria-label="Fler portioner">+</button></div></div><p class="small muted" style="margin:0">Markerat: det som behövs i steg '+(act+1)+'.</p>'+ingList(r,f,actHits)+'</section>';
 h+='<section class="card"><div class="card-head"><h2>Gör så här</h2><span class="small muted">Tryck på ett steg för att markera det</span></div><ol class="steps">'+r.steps.map((s,i)=>{const hs=i===act?actHits:stepIngredients(r,s),on=i===act;
  return'<li class="'+(on?'active':'')+'" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+i+'"><div style="flex:1;min-width:0">'+esc(s.t)+(s.timer?' <button class="mini" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+s.timer+' min</button>':'')+
  (on?(hs.length?'<div class="now" style="margin-top:10px"><div class="label">Det här steget</div><ul class="ing">'+hs.map(it=>'<li><span class="q">'+esc(qtyText(it,f))+'</span><span>'+esc(it.n)+'</span></li>').join('')+'</ul></div>':'')+(i<r.steps.length-1?'<button class="btn sm" style="margin-top:10px" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+(i+1)+'">Nästa steg →</button>':''):
   (hs.length?'<div class="uses">'+hs.map(it=>'<span>'+esc((qtyText(it,f)+' '+it.n).trim())+'</span>').join('')+'</div>':''))+'</div></li>'}).join('')+'</ol>'+(r.tips?'<div class="note">'+esc(r.tips)+'</div>':'')+'</section></div>';
 return h}

V.uppgifter=function(){
 const t=today(),d=D(),open=d.tasks.filter(x=>!x.done),done=d.tasks.filter(x=>x.done);
 const g=[['Försenade',open.filter(x=>isDate(x.due)&&x.due<t)],['Idag',open.filter(x=>x.due===t)],['Kommande',open.filter(x=>isDate(x.due)&&x.due>t).sort((a,b)=>a.due.localeCompare(b.due))],['Utan datum',open.filter(x=>!isDate(x.due))]];
 let h=topbar('Uppgifter',open.length+' att göra','<button class="btn primary" data-act="taskAdd">+ Ny</button>');
 if(S.taskAdd)h+='<form class="card form" data-form="task"><input id="task-title" name="title" placeholder="Vad behöver göras?" required autocomplete="off"><input id="task-due" name="due" type="date" style="flex:0 1 170px"><select id="task-who" name="who" style="flex:0 1 160px"><option value="">Vem som helst</option>'+people().map(p=>'<option>'+esc(p)+'</option>').join('')+'<option>Båda</option></select><button class="btn primary">Lägg till</button><button type="button" class="btn ghost" data-act="taskAdd">Avbryt</button></form>';
 h+='<div class="grid">';
 g.forEach(([l,xs])=>{if(!xs.length)return;h+='<section class="card"><div class="card-head"><h2>'+l+'</h2><span class="muted num">'+xs.length+'</span></div><div class="list">'+xs.map(taskRow).join('')+'</div></section>'});
 if(!open.length)h+='<section class="card"><div class="empty">Inget att göra just nu.</div></section>';
 h+='</div>';
 if(done.length)h+='<details class="card"><summary>Klara ('+done.length+')</summary><div class="list">'+done.map(taskRow).join('')+'</div>'+(S.confirm==='clearTasks'?'<div class="tools"><span class="muted">Ta bort alla klara?</span><button class="btn sm primary" data-act="clearTasksYes">Ja, ta bort</button><button class="btn sm ghost" data-act="confirmNo">Avbryt</button></div>':'<div><button class="btn sm ghost" data-act="clearTasks">Rensa klara</button></div>')+'</details>';
 return h};
function taskRow(x){const t=today(),late=isDate(x.due)&&x.due<t&&!x.done;
 return'<div class="row'+(x.done?' done':'')+'"><input type="checkbox" class="check" data-act="taskToggle" data-id="'+esc(x.id)+'" aria-label="'+esc(x.title)+'"'+(x.done?' checked':'')+'><div class="grow"><div class="title">'+esc(x.title)+'</div><div class="meta">'+(x.due?'<span'+(late?' style="color:var(--danger);font-weight:700"':'')+'>'+esc(x.due===t?'Idag':dateShort(x.due))+'</span>':'')+(x.who?'<span class="chip'+(x.who==='Henrik'?' h':'')+'">'+esc(x.who)+'</span>':'')+(x.note?'<span>'+esc(x.note)+'</span>':'')+'</div></div></div>'}

/* Reglage för dagens ork: tre fasta lägen */
const ORK=[{min:10,name:'Lite ork'},{min:20,name:'Normal ork'},{min:40,name:'Mycket ork'}];
const orkIndex=B=>{let best=0;ORK.forEach((o,i)=>{if(Math.abs(o.min-B)<Math.abs(ORK[best].min-B))best=i});return best};
function orkSlider(B){const i=orkIndex(B),o=ORK[i];
 return'<section class="card ork"><div class="card-head"><h2>Hur mycket tid har ni idag?</h2><span class="ork-now" id="ork-now"><b>'+o.name+'</b> · '+o.min+' min</span></div>'+
 '<div class="ork-track" style="--pos:'+(i*50)+'%"><input type="range" id="ork" min="0" max="2" step="1" value="'+i+'" data-change="ork" aria-label="Tid för städning idag" aria-valuetext="'+o.name+', '+o.min+' minuter"></div>'+
 '<div class="ork-labels" aria-hidden="true">'+ORK.map((x,k)=>'<button type="button" tabindex="-1" data-act="orkPick" data-id="'+k+'" class="'+(k===i?'on':'')+'"><b>'+x.name+'</b><span>'+x.min+' min</span></button>').join('')+'</div>'+
 '<div class="small muted">Gäller bara idag. I morgon börjar det om på '+tomorrowDefault()+' min.</div></section>'}
function tomorrowDefault(){const wd=parse(addDays(today(),1)).getDay(),st=settings();return(wd===0||wd===6)?Number(st.stadtid_helg||40):Number(st.stadtid_vardag||20)}
function orkPreview(el){const i=Number(el.value),o=ORK[i];el.parentNode.style.setProperty('--pos',(i*50)+'%');el.setAttribute('aria-valuetext',o.name+', '+o.min+' minuter');
 const n=document.getElementById('ork-now');if(n)n.innerHTML='<b>'+o.name+'</b> · '+o.min+' min';
 document.querySelectorAll('.ork-labels button').forEach((b,k)=>b.classList.toggle('on',k===i))}
V.stad=function(){
 const cp=cleanPlan(),all=D().clean;
 let h=topbar('Städschema','Lite varje dag, så slipper ni storstäda');
 if(!all.length)return h+'<div class="card empty">Städschemat är tomt.</div>';
 h+=orkSlider(cp.B);
 h+='<div class="split"><div style="display:flex;flex-direction:column;gap:14px">';
 const rLeft=cp.routines.filter(t=>!doneToday(t)).length;
 h+='<section class="card"><div class="card-head"><h2>Dagliga rutiner</h2><span class="muted small num">'+(cp.routines.length-rLeft)+' av '+cp.routines.length+'</span></div><div class="list">'+cp.routines.map(x=>cleanRow(x)).join('')+'</div></section>';
 h+='<section class="card"><div class="card-head"><h2>Dagens pass</h2><span class="muted small num">'+cp.todo.reduce((s,t)=>s+t.min,0)+' min</span></div>';
 h+=(cp.todo.length||cp.doneRot.length)?'<div class="list">'+[...cp.todo,...cp.doneRot].map(t=>cleanRow(t,true)).join('')+'</div>':'<div class="empty">Inget mer behöver göras idag.</div>';
 if(cp.later.length)h+='<details><summary>Har ni mer tid? ('+cp.later.length+')</summary><div class="list">'+cp.later.map(t=>cleanRow(t,false,true)).join('')+'</div></details>';
 else if(cp.soon.length)h+='<details><summary>Vill ni ligga före?</summary><div class="list">'+cp.soon.map(t=>cleanRow(t,false,true)).join('')+'</div></details>';
 h+='</section></div><div style="display:flex;flex-direction:column;gap:14px">';
 h+='<section class="card"><h2>Hemmet just nu</h2>'+roomHealth().map(healthRow).join('')+'</section>';
 const bigDue=cp.big.filter(t=>ratio(t)>=.85),plannedLater=all.filter(t=>t.plannedFor&&t.plannedFor>today());
 h+='<section class="card"><h2>Storstäd som närmar sig</h2><p class="small muted" style="margin:0">Planera in dem en lördag så kommer de med i det dagens pass.</p>'+(bigDue.length?'<div class="list">'+bigDue.map(bigRow).join('')+'</div>':'<div class="empty">Inget storstäd behövs just nu.</div>');
 if(plannedLater.length)h+='<div class="label">Inplanerat</div><div class="list">'+plannedLater.map(t=>'<div class="row"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta">'+esc(dateShort(t.plannedFor))+' · '+t.min+' min</div></div><button class="mini" data-act="unplan" data-id="'+esc(t.id)+'">Ångra</button></div>').join('')+'</div>';
 h+='</section>';
 h+='<details class="card"><summary>Alla sysslor och intervall</summary>'+ROOMS.map(room=>{const ts=all.filter(t=>t.room===room).sort((a,b)=>a.freq-b.freq);if(!ts.length)return'';
  return'<div class="cat"><h3><span>'+esc(room)+'</span></h3><div class="list">'+ts.map(t=>'<div class="row" style="flex-wrap:wrap"><div class="grow" style="flex-basis:100%"><div class="title">'+esc(t.title)+'</div><div class="meta">'+t.min+' min · '+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</div></div><select class="mini" data-change="freq" data-id="'+esc(t.id)+'" aria-label="Intervall">'+[1,2,3,4,5,7,14,30,90].map(f=>'<option value="'+f+'"'+(t.freq===f?' selected':'')+'>'+freqText(f)+'</option>').join('')+'</select><select class="mini" data-change="who" data-id="'+esc(t.id)+'" aria-label="Vem"><option value="">Vem som helst</option>'+people().map(p=>'<option'+(t.who===p?' selected':'')+'>'+esc(p)+'</option>').join('')+'</select></div>').join('')+'</div></div>'}).join('')+'</details>';
 h+='<section class="card"><h2>Så fungerar schemat</h2><p class="small" style="margin:0">Varje syssla har ett intervall. Appen väljer de mest försenade sysslorna och fyller dagens pass upp till den tid ni har. Hinner ni inte kommer de först i kön i morgon.</p></section>';
 return h+'</div></div>'};
function cleanRow(t,showWhy,offer){const d=doneToday(t),r=ratio(t);
 const why=t.freq<=1?'':(planned(t)&&!d?'inplanerat':r>=2?'mycket försenat':r>=1?'dags nu':'snart dags');
 return'<div class="row'+(d?' done':'')+'"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(t.id)+'" aria-label="'+esc(t.title)+'"'+(d?' checked':'')+'><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span class="num">'+t.min+' min</span>'+(t.who?'<span class="chip'+(t.who==='Henrik'?' h':' v')+'">'+esc(t.who)+'</span>':'')+(showWhy&&why?'<span>'+why+'</span>':'')+(d&&t.doneBy?'<span>klart av '+esc(t.doneBy)+'</span>':'')+(t.tip&&!d?'<span>'+esc(t.tip)+'</span>':'')+'</div></div>'+
 (offer?'<button class="mini" data-act="planToday" data-id="'+esc(t.id)+'">Ta idag</button>':(!d&&t.freq>1&&showWhy?'<button class="mini" data-act="snooze" data-id="'+esc(t.id)+'">I morgon</button>':''))+'</div>'}
function bigRow(t){return'<div class="row"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span>'+t.min+' min</span><span>'+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</span></div></div><button class="mini" data-act="planSat" data-id="'+esc(t.id)+'">Lördag</button><button class="mini" data-act="planToday" data-id="'+esc(t.id)+'">Idag</button></div>'}

/* ---------- overlay ---------- */
function renderOverlay(){
 const o=document.getElementById('overlay');
 if(S.cook){const r=recipeById(S.cook.id);if(!r){S.cook=null;o.innerHTML='';return}
  const i=S.cook.step,n=r.steps.length,s=r.steps[i],{f}=scaled(r),hits=stepIngredients(r,s);
  const now=hits.length?'<div class="now"><div class="label">Det här steget</div><ul class="ing">'+hits.map(it=>'<li><span class="q">'+esc(qtyText(it,f))+'</span><span>'+esc(it.n)+'</span></li>').join('')+'</ul></div>':'';
  o.innerHTML='<div class="cook" role="dialog" aria-label="Matlagningsläge"><div class="cook-top"><div style="min-width:0"><div class="label">Steg '+(i+1)+' av '+n+'</div><h2 style="font-size:1.15rem">'+esc(r.title)+'</h2></div><button class="btn" data-act="cookClose">Stäng</button></div>'+
  '<div class="progress" aria-hidden="true">'+r.steps.map((_,k)=>'<i class="'+(k<=i?'on':'')+'"></i>').join('')+'</div>'+
  '<div class="cook-body"><div class="cook-step"><p>'+esc(s.t)+'</p>'+now+(s.timer?'<div><button class="btn primary" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+I.clock+'Starta '+s.timer+' min</button></div>':'')+'</div><aside class="card" style="align-self:start"><h2>Alla ingredienser</h2>'+ingList(r,f,hits)+'</aside></div>'+
  '<div class="cook-nav"><button class="btn" data-act="cookStep" data-d="-1"'+(i===0?' disabled':'')+'>← Förra</button>'+(i<n-1?'<button class="btn primary" data-act="cookStep" data-d="1">Nästa →</button>':'<button class="btn primary" data-act="cookClose">Klart!</button>')+'</div></div>';
  return}
 if(S.sheet==='settings'){const st=settings(),topic=D().ntfyTopic||'';
  o.innerHTML='<div class="sheet" data-act="sheetBg"><form class="card" data-form="settings" role="dialog" aria-label="Inställningar"><div class="card-head"><h2>Inställningar</h2><button type="button" class="btn ghost sm" data-act="sheetClose">Stäng</button></div>'+
  '<div><div class="label">Vem använder den här enheten?</div><div class="seg wrap" style="margin-top:6px">'+people().map(p=>'<button type="button" data-act="me" data-id="'+esc(p)+'" aria-pressed="'+(S.me===p)+'">'+esc(p)+'</button>').join('')+'<button type="button" data-act="me" data-id="" aria-pressed="'+(!S.me)+'">Gemensam skärm</button></div></div>'+
  '<div><div class="label">Namn i hushållet</div><div class="form" style="margin-top:6px"><input id="set-p1" name="p1" value="'+esc(people()[0])+'"><input id="set-p2" name="p2" value="'+esc(people()[1]||'')+'"></div></div>'+
  '<div><div class="label">Städtid och budget</div><div class="form" style="margin-top:6px"><label class="small" style="flex:1 1 90px">Vardag, min<input id="set-wd" name="wd" inputmode="numeric" value="'+esc(st.stadtid_vardag||20)+'" style="width:100%"></label><label class="small" style="flex:1 1 90px">Helg, min<input id="set-we" name="we" inputmode="numeric" value="'+esc(st.stadtid_helg||40)+'" style="width:100%"></label><label class="small" style="flex:1 1 120px">Mat/vecka, kr<input id="set-budget" name="budget" inputmode="numeric" value="'+esc(st.matbudget||'')+'" style="width:100%"></label></div></div>'+
  '<div class="tools"><button class="btn primary">Spara</button></div>'+
  (topic?'<div><div class="label">Notiser</div><p class="small" style="margin:6px 0">Installera appen ntfy och prenumerera på det här ämnet. Använd servern ntfy.sh.</p><div class="copy"><span style="flex:1">'+esc(topic)+'</span><button type="button" class="mini" data-act="copy" data-id="'+esc(topic)+'">Kopiera</button></div></div>':'')+
  '<div><div class="label">Den här enheten</div><div class="tools" style="margin-top:6px"><button type="button" class="btn sm ghost" data-act="logout">Logga ut</button></div></div>'+
  '</form></div>';return}
 o.innerHTML=''}

/* ---------- local mutations (optimistic) ---------- */
function mutate(list,id,fields){const it=D()[list].find(x=>x.id===id);if(it)Object.assign(it,fields);render()}

/* ---------- actions ---------- */
const ACT={
 nav(id){try{document.activeElement&&document.activeElement.blur()}catch(e){}S.shopAdd=false;S.taskAdd=false;S.view=id;S.recipe=null;S.confirm=null;lsSet('view',id);try{history.replaceState(null,'','#'+id)}catch(e){}window.scrollTo(0,0);render()},
 refresh(){refresh()},
 settings(){S.sheet='settings';render()},
 sheetClose(){S.sheet=null;render()},
 sheetBg(id,el,e){if(e.target===el){S.sheet=null;render()}},
 me(id){S.me=id;lsSet('me',id);render()},
 logout(){S.key='';S.data=null;S.sheet=null;lsSet('key',null);lsSet('cache',null);render()},
 copy(id){try{navigator.clipboard.writeText(id).then(()=>toast('Kopierat'),()=>toast('Markera och kopiera texten'))}catch(e){toast('Markera och kopiera texten')}},
 wall(){S.wall=!S.wall;lsSet('wall',S.wall?'1':'0');wake();render()},
 recipe(id){S.view='recept';S.recipe=id;lsSet('view','recept');window.scrollTo(0,0);render()},
 recipeBack(){S.recipe=null;render()},
 scale(id,el){const r=recipeById(id);const{p}=scaled(r);S.scale[id]=Math.max(1,Math.min(20,p+Number(el.dataset.d)));render()},
 cook(id){S.cook={id,step:S.step[id]||0};wake();render()},
 pickStep(id,el){S.step[id]=Number(el.dataset.i);render();setTimeout(()=>{const li=document.querySelector('.steps li.active');if(li&&li.getBoundingClientRect().top<70)li.scrollIntoView({block:'start',behavior:'smooth'})},30)},
 cookStep(id,el){const r=recipeById(S.cook.id);S.cook.step=Math.max(0,Math.min(r.steps.length-1,S.cook.step+Number(el.dataset.d)));S.step[S.cook.id]=S.cook.step;render()},
 cookClose(){S.cook=null;wake();render()},
 timer(id,el){unlockAudio();const m=Number(el.dataset.min);S.timers.push({k:Math.random().toString(36).slice(2),label:el.dataset.label||'Timer',end:Date.now()+m*60000,ring:false});tick();toast('Timer: '+m+' min')},
 timerStop(id){S.timers=S.timers.filter(t=>t.k!==id);tick()},
 shopFilter(id){S.shopFilter=id;render()},
 shopAdd(){S.shopAdd=!S.shopAdd;render();if(S.shopAdd)setTimeout(()=>document.getElementById('shop-name')?.focus(),30)},
 shopToggle(id){const i=D().shop.find(x=>x.id===id);if(!i)return;const done=!i.done;mutate('shop',id,{done});apiPost({action:'shopToggle',id,done})},
 clearShop(){S.confirm='clearShop';render()},
 clearShopYes(){S.confirm=null;S.data.shop=D().shop.filter(i=>!i.done);render();apiPost({action:'shopClearDone'})},
 confirmNo(){S.confirm=null;render()},
 taskAdd(){S.taskAdd=!S.taskAdd;render();if(S.taskAdd)setTimeout(()=>document.getElementById('task-title')?.focus(),30)},
 taskToggle(id){const x=D().tasks.find(t=>t.id===id);if(!x)return;const done=!x.done;mutate('tasks',id,{done});apiPost({action:'taskToggle',id,done})},
 clearTasks(){S.confirm='clearTasks';render()},
 clearTasksYes(){S.confirm=null;S.data.tasks=D().tasks.filter(i=>!i.done);render();apiPost({action:'taskClearDone'})},
 cleanToggle(id){const t=D().clean.find(x=>x.id===id);if(!t)return;
  if(doneToday(t)){mutate('clean',id,{lastDone:t.prevDone||'',prevDone:'',doneBy:''});apiPost({action:'cleanUndo',id})}
  else{mutate('clean',id,{prevDone:t.lastDone,lastDone:today(),doneBy:S.me,plannedFor:'',snoozeUntil:''});apiPost({action:'cleanDone',id})}},
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
document.addEventListener('input',e=>{if(e.target.id==='ork')orkPreview(e.target)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(!el)return;const id=el.dataset.id;
 if(el.dataset.change==='ork'){el.blur();ACT.budget(String(ORK[Number(el.value)].min));return}
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
 if(f.dataset.form==='settings'){const p=[d.p1.trim()||'Henrik',d.p2.trim()||'Cornelia'].join(', ');const st=settings();
  const ch=[['personer',p],['stadtid_vardag',String(Number(d.wd)||20)],['stadtid_helg',String(Number(d.we)||40)],['matbudget',String(Number(d.budget)||0)]].filter(([k,v])=>String(st[k]||'')!==v);
  ch.forEach(([k,v])=>{st[k]=v;apiPost({action:'setting',k,v})});S.sheet=null;render();if(ch.length)toast('Sparat')}
});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(VIEW_IDS.includes(h)&&h!==S.view)ACT.nav(h)});
document.addEventListener('keydown',e=>{if(S.cook){if(e.key==='ArrowRight')ACT.cookStep(null,{dataset:{d:1}});if(e.key==='ArrowLeft')ACT.cookStep(null,{dataset:{d:-1}});if(e.key==='Escape')ACT.cookClose()}else if(S.sheet&&e.key==='Escape'){S.sheet=null;render()}});

/* ---------- timers, clock, wake lock ---------- */
let actx=null;function unlockAudio(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume()}catch(e){}}
function beep(){if(!actx)return;try{for(let i=0;i<3;i++){const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+i*.35;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.start(t);o.stop(t+.3)}}catch(e){}}
function tick(){
 const c=document.getElementById('clock');if(c){const n=new Date();c.textContent=pad(n.getHours())+':'+pad(n.getMinutes())}
 const box=document.getElementById('timers');
 box.innerHTML=S.timers.map(t=>{const ms=t.end-Date.now();if(ms<=0&&!t.ring){t.ring=true;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}const s=Math.max(0,Math.ceil(ms/1000));
  return'<div class="timer'+(t.ring?' ring':'')+'"><span>'+esc(t.label)+'</span><span class="num">'+(t.ring?'Klart!':Math.floor(s/60)+':'+pad(s%60))+'</span><button data-act="timerStop" data-id="'+t.k+'" aria-label="Stäng timer">✕</button></div>'}).join('');
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
