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
 cake:SV+'<path d="M4 21h16M5 21v-7.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M5 16c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0"/><path d="M12 12V8.5"/><path d="M12 3.5c1 1.2 1.3 2.2.6 2.9a.9.9 0 0 1-1.2 0c-.7-.7-.4-1.7.6-2.9z"/></svg>',
 clock:SV+'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>'
};
// Översikt ligger i mitten av flikraden
const I_EKO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h1.5"/></svg>';
// Inköp ligger under Mat; Ekonomi har fått dess plats i flikraden
const VIEWS=[['mat','Mat',I.fork],['ekonomi','Ekonomi',I_EKO],['oversikt','Översikt',I.home],['uppgifter','Uppgifter',I.list],['stad','Städ',I.sparkles]];
const VIEW_IDS=VIEWS.map(v=>v[0]).concat(['vader','fod']);
const OLD_VIEWS={matsedel:'vecka',recept:'recept',inkop:'inkop'};

/* ---------- state ---------- */
const CFG=window.HT_CONFIG||{};
const S={theme:['light','dark'].includes(lsGet('theme'))?lsGet('theme'):'system',key:lsGet('key')||'',me:lsGet('me')||'',view:lsGet('view')||'oversikt',wall:lsGet('wall')==='1',
 data:null,sync:'idle',lastSync:null,error:'',recipe:null,scale:{},cook:null,shopFilter:'alla',shopAdd:false,taskAdd:false,
 sheet:null,confirm:null,timers:[],pending:0,step:{},matTab:['recept','bank','inkop'].includes(lsGet('matTab'))?lsGet('matTab'):'vecka',taskTab:lsGet('taskTab')==='kalender'?'kalender':'lista',calDay:null,calMonth:null,ovDay:null,taskDue:'',bankFilter:'alla',rate:null,open:{}};
try{const c=lsGet('cache');if(c)S.data=JSON.parse(c)}catch(e){}
// Gamla vyer (Matsedel, Recept) ligger nu i fliken Mat
function normView(id){if(OLD_VIEWS[id]){S.matTab=OLD_VIEWS[id];lsSet('matTab',S.matTab);return'mat'}return id}
S.view=normView(S.view);
S.fodMode=['hjul','manad','lista'].includes(lsGet('fodMode'))?lsGet('fodMode'):'hjul';
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
 nav.addEventListener('pointerdown',e=>{if(e.button>0)return;st={x0:e.clientX,id:e.pointerId,moved:false}});
 nav.addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;
  if(!st.moved){if(Math.abs(e.clientX-st.x0)<8)return;st.moved=true;nav.classList.add('drag');try{nav.setPointerCapture(e.pointerId)}catch(_){}}
  const p=at(e.clientX);nav.style.setProperty('--dx',p.dx+'px');nav.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('over',k===p.j))});
 const end=(e,go)=>{if(!st||e.pointerId!==st.id)return;const moved=st.moved;st=null;if(!moved)return;
  const p=at(e.clientX);nav.classList.remove('drag');nav.querySelectorAll('.over').forEach(b=>b.classList.remove('over'));
  skip=true;setTimeout(()=>skip=false,60);
  if(go&&VIEWS[p.j][0]!==S.view)ACT.nav(VIEWS[p.j][0])};
 nav.addEventListener('pointerup',e=>end(e,true));nav.addEventListener('pointercancel',e=>end(e,false));
 nav.addEventListener('click',e=>{if(skip){e.stopPropagation();e.preventDefault()}},true)})();

/* Dra för att scrolla och svep mellan flikarna på stora skärmar och i väggläge.
   På Linux kommer pekskärmens rörelser ofta fram som musrörelser, och då scrollar webbläsaren
   inte när man drar. Här scrollar appen själv när en mus eller penna drar, med fart som klingar av.
   Pekskärmar som skickar riktiga touchhändelser scrollar som vanligt. Ett tydligt svep i sidled
   byter flik i samma ordning som flikraden. */
(function(){let st=null,skip=false,glide=0;
 const on=()=>S.wall||matchMedia('(min-width:900px)').matches;
 // tomma ytan under en kort sida räknas också som sidan
 const inMain=el=>!!el.closest('main')||el===document.body||el===document.documentElement;
 const ax=(el,a)=>{const cs=getComputedStyle(el),o=a==='x'?cs.overflowX:cs.overflowY;return/(auto|scroll)/.test(o)&&(a==='x'?el.scrollWidth>el.clientWidth+1:el.scrollHeight>el.clientHeight+1)};
 const scroller=(el,a)=>{for(;el&&el!==document.body&&el!==document.documentElement;el=el.parentElement)if(ax(el,a))return el;return null};
 document.addEventListener('pointerdown',e=>{cancelAnimationFrame(glide);
  if(!on()||e.button>0||!S.data||e.target.closest('input,select,textarea,[contenteditable],.nav'))return;
  st={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t:performance.now(),v:0,mouse:e.pointerType!=='touch',a:null,el:null,tg:e.target}});
 addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;const dx=e.clientX-st.x0,dy=e.clientY-st.y0;
  if(!st.a){if(Math.hypot(dx,dy)<10)return;st.a=Math.abs(dx)>Math.abs(dy)?'x':'y';st.el=scroller(st.tg,st.a);if(st.mouse)document.body.classList.add('dragging')}
  const now=performance.now(),d=st.a==='y'?e.clientY-st.y:e.clientX-st.x,dt=Math.max(8,now-st.t);
  st.v=.7*(d/dt)+.3*st.v;st.x=e.clientX;st.y=e.clientY;st.t=now;
  if(!st.mouse)return;
  if(st.a==='y')(st.el||document.scrollingElement).scrollTop-=d;else if(st.el)st.el.scrollLeft-=d});
 const end=(e,ok)=>{if(!st||e.pointerId!==st.id)return;const s=st;st=null;document.body.classList.remove('dragging');if(!s.a||!ok)return;
  skip=true;setTimeout(()=>skip=false,80);
  const dx=e.clientX-s.x0,dy=e.clientY-s.y0;
  // svep i sidled där inget scrollar i sidled: byt flik
  // (i Mat och Uppgifter byts först undermenyn, vid sista undermenyn fortsätter svepet till nästa flik)
  if(s.a==='x'&&!s.el&&Math.abs(dx)>80&&Math.abs(dx)>1.5*Math.abs(dy)&&inMain(s.tg)&&!document.querySelector('#overlay .sheet')){
   if(subSwipe(dx))return;
   const i=VIEWS.findIndex(v=>v[0]===S.view),j=i<0?2:i+(dx<0?1:-1);if(j>=0&&j<VIEWS.length)ACT.nav(VIEWS[j][0]);return}
  if(!s.mouse||performance.now()-s.t>80)return;
  // fortsätt glida och bromsa in mjukt
  const el=s.a==='y'?(s.el||document.scrollingElement):s.el;if(!el)return;let v=s.v,last=performance.now();
  const step=now=>{const dt=now-last;last=now;if(s.a==='y')el.scrollTop-=v*dt;else el.scrollLeft-=v*dt;v*=Math.pow(.994,dt);if(Math.abs(v)>.03)glide=requestAnimationFrame(step)};
  glide=requestAnimationFrame(step)};
 addEventListener('pointerup',e=>end(e,true));addEventListener('pointercancel',e=>end(e,false));
 document.addEventListener('click',e=>{if(skip){e.stopPropagation();e.preventDefault()}},true);
 document.addEventListener('dragstart',e=>{if(on())e.preventDefault()});
 // Telefonen: ett tydligt svep i sidled byter undermeny i Mat och Uppgifter (flikarna byts som förut med flikraden).
 // Svep som börjar vid skärmkanten lämnas åt Safaris bakåtgest, och listor som scrollar i sidled scrollar som vanligt.
 let t=null;
 document.addEventListener('touchstart',e=>{t=null;if(on()||e.touches.length!==1||!S.data)return;const p=e.touches[0];
  if(p.clientX<24||p.clientX>innerWidth-24||!inMain(e.target)||e.target.closest('input,select,textarea,[contenteditable]')||scroller(e.target,'x'))return;
  t={x0:p.clientX,y0:p.clientY,x:p.clientX,y:p.clientY,t0:performance.now()}},{passive:true});
 document.addEventListener('touchmove',e=>{if(!t)return;if(e.touches.length!==1){t=null;return}t.x=e.touches[0].clientX;t.y=e.touches[0].clientY},{passive:true});
 document.addEventListener('touchcancel',()=>{t=null},{passive:true});
 document.addEventListener('touchend',()=>{if(!t)return;const g=t;t=null;const dx=g.x-g.x0,dy=g.y-g.y0;
  if(Math.abs(dx)>70&&Math.abs(dx)>1.8*Math.abs(dy)&&performance.now()-g.t0<800&&!document.querySelector('#overlay .sheet'))subSwipe(dx)},{passive:true})})();

/* Undermenyerna i Mat och Uppgifter i samma ordning som segmentreglaget. Svep åt vänster = nästa. */
const SUBS={mat:['matTab',['vecka','inkop','recept','bank']],uppgifter:['taskTab',['lista','kalender']]};
function subSwipe(dx){const sub=SUBS[S.view];if(!sub||S.recipe||S.cook||S.sheet)return false;
 const[k,list]=sub,i=list.indexOf(S[k]),j=i+(dx<0?1:-1);if(i<0||j<0||j>=list.length)return false;
 A.dir=dx<0?'in-right':'in-left';A.user=Date.now();
 const sg=document.querySelector('#main .segc[data-seg="'+k+'"]');if(sg&&sg.getBoundingClientRect().top<0)window.scrollTo(0,0);
 ACT[k](list[j]);return true}

let fitScrollbar=()=>{};
/* Rullningslisten på stora skärmar och i väggläge syns bara medan man scrollar */
(function(){const el=document.documentElement;let t=0;
 const fit=()=>el.classList.toggle('sb-auto',S.wall||matchMedia('(min-width:900px)').matches);fit();addEventListener('resize',fit);
 document.addEventListener('scroll',()=>{if(!el.classList.contains('sb-auto'))return;el.classList.add('scrolling');clearTimeout(t);t=setTimeout(()=>el.classList.remove('scrolling'),900)},{capture:true,passive:true});
 fitScrollbar=fit})();

/* Väggtavlan: tillbaka till Översikt efter två minuter utan beröring, och väck nattläget vid tryck */
(function(){const touch=()=>{const was=nightOn();A.touch=Date.now();if(was&&S.view==='oversikt')render()};
 document.addEventListener('pointerdown',touch,true);
 setInterval(()=>{if(!S.wall)return;const idle=Date.now()-(A.touch||0)>120000;
  if(idle&&(S.view!=='oversikt'||S.sheet||S.shopAdd||S.taskAdd||S.recipe||window.scrollY>0)&&!S.cook){closeSheets();S.recipe=null;ACT.nav('oversikt')}
  else if(S.view==='oversikt'&&document.body.classList.contains('is-night')!==nightOn())render()},20000)})();

/* Lämna kioskläget utan tangentbord: håll fingret still på klockan i tre sekunder så stängs tavlan */
(function(){let t=0,x=0,y=0;const stop=()=>{clearTimeout(t);t=0};
 document.addEventListener('pointerdown',e=>{if(e.button>0||!e.target.closest('#clock'))return;stop();x=e.clientX;y=e.clientY;
  t=setTimeout(()=>{t=0;toast('Stänger tavlan …');setTimeout(()=>{try{window.close()}catch(err){}setTimeout(()=>toast('Tavlan gick inte att stänga härifrån'),500)},700)},3000)});
 addEventListener('pointermove',e=>{if(t&&Math.hypot(e.clientX-x,e.clientY-y)>12)stop()});
 addEventListener('pointerup',stop);addEventListener('pointercancel',stop);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('#clock'))e.preventDefault()})})();

/* ---------- api ---------- */
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)}
function setData(d){S.data=d;S.lastSync=new Date();S.error='';try{lsSet('cache',JSON.stringify(d))}catch(e){}}
async function apiGet(){
 const r=await fetch(CFG.api+'?key='+encodeURIComponent(S.key)+'&t='+Date.now(),{cache:'no-store'});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'Okänt fel');return j.data}
/* Ändringar sparas först i telefonen (utkorgen) och skickas sedan i tur och ordning.
   Utan nät ligger de kvar och skickas när nätet kommer tillbaka, så inget försvinner i butiken.
   Medan något väntar skrivs telefonens data inte över av äldre data från kalkylarket. */
const OUTBOX=(()=>{try{const a=JSON.parse(lsGet('outbox')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}})();
S.pending=OUTBOX.length;
const saveOutbox=()=>{lsSet('outbox',OUTBOX.length?JSON.stringify(OUTBOX):null);try{if(S.data)lsSet('cache',JSON.stringify(S.data))}catch(e){}};
let flushing=false,lastServer=null;
// En vara eller uppgift som lagts till utan nät har ett tillfälligt id; slå upp det riktiga i svaret från arket
function realId(b){if(!/^tmp/.test(String(b.id||''))||!lastServer)return b.id;
 const list=/^shop/.test(b.action)?lastServer.shop:/^task/.test(b.action)?lastServer.tasks:[],k=/^shop/.test(b.action)?'name':'title';
 const hit=list.filter(x=>x[k]===b.tmpName).pop();return hit?hit.id:b.id}
async function flush(){
 if(flushing||!OUTBOX.length)return;flushing=true;S.sync='busy';renderStatus();
 try{
  while(OUTBOX.length){const b=Object.assign({},OUTBOX[0]);b.id=realId(b);delete b.tmpName;
   let j;
   try{const r=await fetch(CFG.api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign(b,{key:S.key,by:b.by!=null?b.by:S.me}))});j=await r.json()}
   catch(e){S.sync='offline';S.pending=OUTBOX.length;render();return}   // inget nät: försök igen senare
   OUTBOX.shift();S.pending=OUTBOX.length;saveOutbox();
   if(!j.ok){toast('Ändringen sparades inte: '+(j.error||'Okänt fel'));if(!OUTBOX.length){S.sync='idle';flushing=false;refresh(true);return}continue}
   lastServer=j.data;
   if(!OUTBOX.length){setData(j.data);S.sync='idle'}}
 }finally{flushing=false}
 render()}
if(OUTBOX.length)setTimeout(flush,800);
function apiPost(body){
 if(!navigator.onLine&&body.action==='menuSwap'){toast('Kräver nät. Försök igen när du har täckning.');refresh(true);return Promise.resolve()}
 const it=Object.assign({},body,{by:S.me});
 if(/^tmp/.test(String(body.id||''))){const list=/^shop/.test(body.action)?D().shop:D().tasks,x=list.find(y=>y.id===body.id);if(x)it.tmpName=x.name||x.title}
 OUTBOX.push(it);S.pending=OUTBOX.length;saveOutbox();renderStatus();
 return flush()}
addEventListener('online',()=>flush());
setInterval(()=>{if(OUTBOX.length)flush()},15000);
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
const waitTxt=n=>n+(n===1?' ändring väntar':' ändringar väntar')+' på nät';
function statusHtml(){const t=S.lastSync?pad(S.lastSync.getHours())+':'+pad(S.lastSync.getMinutes()):'';
 const n=OUTBOX.length,cls=S.sync==='busy'?'busy':(S.sync==='err'||S.sync==='offline')?'err':'';const txt=S.sync==='offline'&&n?waitTxt(n):S.sync==='busy'?'Sparar…':S.sync==='err'?'Ingen kontakt':(t?'Uppdaterad '+t:'Inte uppdaterad än');
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
 document.body.classList.toggle('wall',S.wall);document.body.classList.toggle('is-night',S.view==='oversikt'&&nightOn());document.body.dataset.view=S.view;
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
 const banner=S.sync==='offline'&&OUTBOX.length?'<div class="outbox" role="status">'+I.clock+'<span class="grow">'+waitTxt(OUTBOX.length)+'</span><span class="muted">Skickas automatiskt</span></div>':S.sync==='err'?'<div class="banner">Ingen kontakt med kalkylarket just nu. Du ser senast hämtade data. '+esc(S.error)+'</div>':'';
 A.before(m);
 m.innerHTML=banner+(V[S.view]||V.oversikt)();
 placeSky();
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
/* ---------- väggtavlan ----------
   På väggskärmen (väggläge, bred skärm) blir Översikt en tavla i tre kolumner som alltid får plats
   utan att scrolla: tid och väder | kalender och middag | städ, inköp och födelsedagar.
   Mellan 22 och 06 visas ett mörkt nattläge, och efter två minuter utan beröring går tavlan tillbaka hit. */
const wallBoardOn=()=>S.wall&&matchMedia('(min-width:900px)').matches;
const nightOn=()=>{const h=new Date().getHours();return S.wall&&(h>=22||h<6)&&Date.now()-(A.touch||0)>120000};
function wallNight(){const n=new Date(),t=today(),tm=addDays(t,1),W=wxModel();
 const first=D().events.filter(e=>e.date===tm).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')))[0];
 const f=W&&W.days.find(x=>x.date===tm);
 return'<div class="night" data-act="wakeBoard"><div class="clock num" id="clock">'+pad(n.getHours())+':'+pad(n.getMinutes())+'</div>'+
  '<div class="night-l">I morgon '+esc(dayHead(tm))+'</div>'+
  (first?'<div class="night-l">'+esc(first.time?String(first.time).split(/\s*[–-]\s*/)[0]+' ':'')+esc(first.title)+'</div>':'')+
  (f?'<div class="night-l">'+symInfo(f.sym)[0]+' '+deg(f.min)+' till '+deg(f.max)+'</div>':'')+'</div>'}
function wallBoard(){
 if(nightOn())return wallNight();
 const t=today(),d=D(),cp=cleanPlan(),td=dayOf(t),days=planDays();
 const nextDay=(td&&td.meals.length)?td:days.find(x=>x.date>t&&x.meals.length),isT=nextDay&&nextDay.date===t;
 const left=d.shop.filter(i=>!i.done);
 const clean=[...cp.routines.filter(x=>!doneToday(x)),...cp.todo].slice(0,7),doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 const bd=bdNext(bdays()).filter(b=>b.days<=14).slice(0,3);
 let h='<div class="board"><div class="board-gear">'+gearBtn+'</div>';
 h+='<div class="bcol">'+heroHtml()+'</div>';
 h+='<div class="bcol">'+calWidget()+widget('mat','',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel än.</div>')+'</div>';
 h+='<div class="bcol">'+widget('stad','bclean',I.sparkles,'Städ idag',doneN+'/'+totN,clean.length?'<div class="wl">'+clean.map(x=>'<div class="cell ck"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(x.id)+'" aria-label="'+esc(x.title)+'"><span class="grow">'+esc(x.title)+'</span><span class="val num">'+x.min+' min</span></div>').join('')+'</div>':'<div class="wempty">Allt är gjort idag.</div>');
 h+='<div class="wpair">'+widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+left.length+'</div><div class="sub">kvar · ca '+kr(shopCost(left))+'</div>')+
  widget('uppgifter','',I.list,'Uppgifter','','<div class="wbig">'+d.tasks.filter(x=>!x.done&&isDate(x.due)&&x.due<=t).length+'</div><div class="sub">idag och försenade</div>')+'</div>';
 if(bd.length)h+=widget('fod','',I.cake,'Födelsedagar','','<div class="wl">'+bd.map(b=>'<div class="cell bdw"><span class="grow">'+esc(b.name)+' <span class="muted">'+esc(bdTurns(b))+'</span></span><span class="bd-when'+(b.days<14?' soon':'')+'">'+esc(bdWhen(b))+'</span></div>').join('')+'</div>');
 return h+'</div></div>'}
V.oversikt=function(){
 if(wallBoardOn())return wallBoard();
 const t=today(),now=new Date(),days=planDays();
 const td=dayOf(t),tm=dayOf(addDays(t,1));
 const nextDay=(td&&td.meals.length)?td:days.find(d=>d.date>t&&d.meals.length);
 const cp=cleanPlan(),d=D();
 const left=d.shop.filter(i=>!i.done);
 const tasksNow=d.tasks.filter(x=>!x.done&&isDate(x.due)&&x.due<=t).sort((a,b)=>a.due.localeCompare(b.due));
 const tasksSoon=d.tasks.filter(x=>!x.done&&!(isDate(x.due)&&x.due<=t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,4);
 let h=head('Översikt');
 h+='<div class="ov">'+heroHtml();
 h+='<div class="widgets">';
 h+=calWidget();
 const top=h;h='';
 const isT=nextDay&&nextDay.date===t;
 h+=widget('mat','w2',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',
  nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel inlagd än. Den fylls i när veckoplaneringen körs på söndag.</div>');
 const doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 h+='<div class="wpair">'+widget('stad','',I.sparkles,'Städ','','<div class="wbig">'+nv('w-clean',doneN)+'<small>/'+totN+'</small></div><div class="sub">'+nv('w-min',cp.minLeft)+' min kvar</div><div class="thin"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>');
 h+=widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+nv('w-shop',left.length)+'</div><div class="sub">kvar · ca '+nv('w-shopkr',shopCost(left),'kr')+'</div>')+'</div>';
 const tl=tasksNow.concat(tasksSoon).slice(0,5);
 h+=widget('uppgifter','w2',I.list,'Uppgifter',tasksNow.length?tasksNow.length+' idag':'',tl.length?'<div class="wl">'+tl.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra just nu.</div>');
 const rh=roomHealth();
 const home=widget('stad','w2',I.home,'Hemmet','',rh.length?'<div class="wl">'+rh.map(healthRow).join('')+'</div>':'<div class="wempty">Städschemat är tomt.</div>');
 const tmw=tm?widget('mat','w2',I.cal,'Imorgon',esc(dateShort(tm.date)),(eventsHtml(tm)||'<div class="wempty">Inga händelser.</div>')+(tm.meals.length?wMeals(tm):'')):'';
 // födelsedagarna ligger näst sist
 return top+h+(tmw?home+bdWidget()+tmw:bdWidget()+home)+'</div></div>'};
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
  '<div class="bbody"><div class="chips-row">'+whoChip(r.who)+freqChip(r.id)+(r.min?'<span class="chip num">'+r.min+' min</span>':'')+(r.kr?'<span class="chip num">'+kr(r.kr)+'/port</span>':'')+'</div>'+
  '<button class="btitle" data-act="recipe" data-id="'+esc(r.id)+'">'+esc(r.title)+'</button>'+
  (g?'<div class="bstars"><span class="st" aria-label="'+g.avg.toFixed(1)+' av 5">'+starsTxt(g.avg)+'</span>'+g.people.map(([p,e])=>'<span class="fn">'+esc(p)+': '+esc(VERD[e.v]||'')+'</span>').join('')+'</div>':'<div class="fn">Inget betyg än</div>')+
  '<button class="pill'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'">'+(wished?I.tick+'Önskad nästa vecka':'Vill ha nästa vecka')+'</button></div></article>'}).join('')+'</div>'}
function mealCell(m){const r=m.recipe&&recipeById(m.recipe),i=D().menu.indexOf(m),canSwap=m.who!=='Borta'&&m.date>=today();
 const inner='<div class="grow"><div class="chips-row">'+whoChip(m.who)+'</div><div class="title" style="margin-top:3px">'+esc(m.title)+'</div>'+(m.addon?'<div class="meta">+ Kött: '+esc(m.addon)+'</div>':'')+(m.note?'<div class="meta">'+esc(m.note)+'</div>':'')+(m.recipe&&ratingOf(m.recipe)?'<div class="meta"><span class="st">'+starsTxt(ratingOf(m.recipe).avg)+'</span></div>':'')+'</div>'+(r&&r.kr?'<span class="val">'+kr(r.kr)+'/port</span>':'');
 const swap=canSwap?'<button class="pill" data-act="swap" data-id="'+i+'" aria-label="Byt '+esc(m.title)+'">'+(m.recipe?'Byt':'Välj rätt')+'</button>':'';
 return r?'<div class="cell meal-cell"><button class="grow rowbtn" data-act="recipe" data-id="'+esc(m.recipe)+'" style="display:flex;align-items:center;gap:12px;text-align:left">'+inner+'</button>'+swap+'</div>':'<div class="cell meal-cell">'+inner+swap+'</div>'}
function recipeCell(r,meta){return'<button class="cell link" data-act="recipe" data-id="'+esc(r.id)+'"><div class="grow"><div class="title">'+esc(r.title)+'</div><div class="meta">'+meta+'</div></div>'+whoChip(r.who)+chevron+'</button>'}
/* Hushållets matpreferenser: rader i Inställningar som veckoplaneringen läser när den gör menyn */
const PREFS=[['pref_henrik','Kött','k','Henriks mat, t.ex. proteinrik och kalorisnål'],['pref_veg','Vegetariskt','v','Den vegetariska maten, t.ex. kost och GI'],['pref_ekonomi','Ekonomi','','Budget, butiker och svinn'],['pref_ovrigt','Övrigt','','Sådant ni inte gillar, allergier, önskemål']];
function prefsBlock(){const st=settings(),rows=PREFS.filter(([k])=>String(st[k]||'').trim());
 return sh('Hushållets preferenser','<button class="linkbtn" data-act="prefs">Ändra</button>')+
  group(rows.length?rows.map(([k,l,c])=>'<div class="cell"><div class="grow"><span class="chip'+(c?' '+c:'')+'">'+l+'</span><div class="meta" style="color:var(--ink)">'+esc(st[k])+'</div></div></div>').join(''):emptyCell('Inga preferenser än. Tryck på Ändra och skriv vad ni vill att menyn tar hänsyn till.'))+
  '<div class="foot">Veckoplaneringen utgår från de här när den gör nästa veckas meny.</div>'}
/* ---------- önskemål och byten ----------
   Önskemål sparas i onskelista som {id?, t, by, d, slot}. slot säger vilken matlagning rätten ersätter.
   Veckoplaneringen lägger dem på sin plats och tömmer listan varje söndag. */
const SLOTS=['Vardagsmiddag, kött','Vardagsmiddag, vegetarisk','Fredagsmiddag','Lördagsmiddag','Söndagsmiddag','Storkok, kött','Storkok, vegetariskt'];
function slotFor(r){if(!r)return SLOTS[0];const sk=r.group==='Storkok'||/^storkok/i.test(r.title||'');
 return sk?(r.who==='Vegetariskt'?SLOTS[6]:SLOTS[5]):r.who==='Gemensam'?SLOTS[2]:r.who==='Vegetariskt'?SLOTS[1]:SLOTS[0]}
function allRecipes(){const seen=new Set(),out=[];bankList().concat(D().recipes).forEach(r=>{if(r&&r.id&&!seen.has(r.id)){seen.add(r.id);out.push(r)}});return out}
const isStorkok=r=>!!r&&(r.group==='Storkok'||/^storkok/i.test(r.title||''));
// Rätter som kan ersätta en rätt på matsedeln: samma sort först, sedan goda och efterlängtade recept först
function swapCandidates(m){const cur=m.recipe&&recipeById(m.recipe),onMenu=new Set(D().menu.map(x=>x.recipe).filter(Boolean)),t=today();
 const want=m.who==='Gemensam'?['Gemensam','Vegetariskt']:[m.who],sk=isStorkok(cur)||/^storkok/i.test(m.title||'');
 return allRecipes().filter(r=>!onMenu.has(r.id)&&freqOf(r.id).w!==0&&r.course!=='efterrätt'&&!(ratingOf(r.id)||{}).never).map(r=>{
  const g=ratingOf(r.id),f=freqOf(r.id).w||8,last=lastServed(r.id),ago=last?Math.round((Date.parse(t)-Date.parse(last))/864e5):null;
  const due=ago==null?1.5:Math.min(2,ago/(f*7));
  const kind=(want.indexOf(r.who)>=0?2:0)+(isStorkok(r)===sk?1:0);
  return{r,g,ago,score:kind*10+(g?g.avg:3)+due}}).sort((a,b)=>b.score-a.score)}
function swapWhy(c){const p=[];if(c.g)p.push(starsTxt(c.g.avg));p.push(c.ago==null?'inte lagad på ett tag':c.ago<0?'planerad':'senast för '+(c.ago<14?c.ago+' dagar':Math.round(c.ago/7)+' veckor')+' sedan');if(c.r.kr)p.push(kr(c.r.kr)+'/port');return p.join(' · ')}
function wishesBlock(){const w=wishes();
 return sh('Önskemål till nästa vecka','<button class="linkbtn" data-act="wishNew">Önska</button>')+
  group(w.length?w.map((x,i)=>'<div class="cell"><div class="grow"><div class="title">'+esc(x.t)+'</div><div class="meta"><span class="chip">'+esc(x.slot||'Valfri plats')+'</span>'+(x.by?'<span>'+esc(x.by)+'</span>':'')+'</div></div><button class="pill" data-act="wishDel" data-id="'+i+'" aria-label="Ta bort önskemålet">Ta bort</button></div>').join(''):emptyCell('Inga önskemål än. Tryck på Önska eller på Vill ha nästa vecka på ett recept.'))+
  '<div class="foot">Söndagens veckoplanering lägger önskade rätter i stället för den matlagning ni valt och tömmer sedan listan.</div>'}
// Byt rätten på matsedeln direkt i appen och skicka bytet till kalkylarket
function doSwap(r){const sw=S.swap;if(!sw)return;if(!navigator.onLine){toast('Att byta rätt kräver nät. Försök igen när du har täckning.');return}const m=sw.m,d=D();
 const rows=d.menu.filter(x=>m.recipe?x.recipe===m.recipe:(x.date===m.date&&x.who===m.who&&x.title===m.title));
 rows.forEach(x=>{if(r){x.title=r.title;x.recipe=r.id;x.addon='';x.note='Bytt i appen'}else{x.title='Fritt val';x.recipe='';x.addon='';x.note='Borttagen i appen'}});
 if(r&&!d.recipes.some(x=>x.id===r.id))d.recipes.push(r);
 if(r&&wishes().some(x=>x.id===r.id))updJSON('onskelista',[],a=>a.filter(x=>x.id!==r.id));
 S.confirm=null;closeSheets();A.user=Date.now();render();
 const rec=r?{id:r.id,group:r.group,who:r.who,title:r.title,portions:r.portions,min:r.min,kr:r.kr,protein:r.protein,freezes:r.freezes,course:r.course,why:r.why,groups:r.groups,steps:r.steps,tips:r.tips}:null;
 apiPost({action:'menuSwap',date:m.date,who:m.who,title:m.title,recipe:m.recipe||'',rec});
 toast(r?'Bytt till '+r.title+'. Inköpslistan uppdateras.':'Rätten är borttagen')}
function matWeek(){
 const t=today(),d=D(),st=settings(),days=planDays();let h='';
 if(!days.length)return'<div style="height:22px"></div>'+group(emptyCell('Matsedeln fylls i när veckoplaneringen körs på söndag.'))+wishesBlock()+prefsBlock();
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
 return h+wishesBlock()+prefsBlock()}
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
 if(!all.length)h+='<div style="height:22px"></div>'+group(emptyCell('Listan är tom. Veckoplaneringen fyller i den på söndagar, och ni kan lägga till egna varor.'));
 CATS.forEach(c=>{const g=items.filter(i=>(CATS.includes(i.cat)?i.cat:'Övrigt')===c).sort((a,b)=>(a.done-b.done)||(a.order||0)-(b.order||0));if(!g.length)return;
  h+=sh(c,kr(shopCost(g)))+group(g.map(shopRow).join(''))});
 if(bought.length)h+='<div class="pills" style="padding:12px 16px 0 24px">'+(S.confirm==='clearShop'?'<span class="sub">Ta bort '+bought.length+' avbockade?</span><button class="tb red strong" data-act="clearShopYes">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="tb red" data-act="clearShop">Rensa avbockade ('+bought.length+')</button>')+'</div>';
 h+='</div><div class="col">';
 h+=prefsBlock();
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
 if(imgOf(r.id))h+='<div class="rcp-photo"><img src="'+esc(imgOf(r.id))+'" alt="'+esc(r.title)+'"></div>';
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
 h+=freqBlock(r);
 h+='</div></div>';
 return h}
/* Hur ofta ett recept ska komma tillbaka. Sparas i Inställningar: frekvens = {id:{w,t}} (w=0 betyder aldrig),
   receptlogg = {id:'ÅÅÅÅ-MM-DD'} som veckoplaneringen fyller i när receptet läggs på menyn. */
const FREQS=[[1,'Varje vecka'],[2,'Varannan vecka'],[3,'Var 3:e vecka'],[4,'Var 4:e vecka'],[6,'Var 6:e vecka'],[8,'Var 8:e vecka'],[12,'Var 12:e vecka'],[26,'Ett par gånger om året'],[0,'Aldrig']];
const freqName=w=>(FREQS.find(([n])=>n===w)||[0,'Var '+w+':e vecka'])[1];
const freqs=()=>parseJ(settings().frekvens,{});
const lastServed=id=>parseJ(settings().receptlogg,{})[id]||'';
// Förslag utifrån betyget: 5 stjärnor var 3:e vecka, 4 stjärnor eller Laga igen var 6:e, 3 stjärnor var 12:e, annars aldrig
function autoFreq(id){const g=ratingOf(id);if(!g)return null;if(g.never)return 0;const igen=g.people.some(([,e])=>e.v==='igen');
 return g.avg>=4.75?3:(g.avg>=3.75||igen)?6:g.avg>=2.75?12:0}
function freqOf(id){const x=freqs()[id];return x&&x.w!=null?{w:Number(x.w),own:true}:{w:autoFreq(id),own:false}}
const freqChip=id=>{const w=freqOf(id).w;return w==null?'':'<span class="chip">'+(w===0?'Aldrig':w===1?'Varje vecka':w===26?'Sällan':'Var '+w+':e v')+'</span>'};
function freqBlock(r){const f=freqOf(r.id),a=autoFreq(r.id),last=lastServed(r.id);
 const opts='<option value="auto"'+(f.own?'':' selected')+'>Efter betyget'+(a!=null?' ('+freqName(a).toLowerCase()+')':'')+'</option>'+FREQS.map(([n,l])=>'<option value="'+n+'"'+(f.own&&f.w===n?' selected':'')+'>'+l+'</option>').join('');
 let next='';if(last&&f.w)next=addDays(last,f.w*7);
 return sh('Hur ofta?')+group(fieldCell('Laga','<span class="menu"><select data-change="rfreq" data-id="'+esc(r.id)+'" aria-label="Hur ofta">'+opts+'</select></span>')+
  (last?'<div class="cell"><div class="grow"><div class="meta">Senast på menyn '+esc(dateShort(last))+(next?' · tidigast igen '+esc(dateShort(next)):'')+'</div></div></div>':''))+
  '<div class="foot">'+(f.w==null?'Betygsätt receptet så föreslås hur ofta det kommer tillbaka. ':'')+'Veckoplaneringen tar med receptet igen när det har gått så här länge.</div>'}
function rateBlock(r){const g=ratingOf(r.id),wished=wishes().some(x=>x.id===r.id),me=S.me&&g&&g.people.find(([p])=>p===S.me);
 let h=sh('Betyg',g?'<span class="st">'+starsTxt(g.avg)+'</span> '+g.avg.toFixed(1).replace('.',','):'');
 h+=group((g?g.people.map(([p,e])=>'<div class="cell"><div class="grow"><div class="title">'+esc(p)+' <span class="st">'+starsTxt(e.s)+'</span></div><div class="meta"><span class="chip '+(e.v==='igen'?'v':e.v==='aldrig'?'h':'')+'">'+esc(VERD[e.v]||'')+'</span>'+(e.c?'<span>'+esc(e.c)+'</span>':'')+(e.d?'<span>'+esc(dateShort(e.d))+'</span>':'')+'</div></div></div>').join(''):emptyCell('Ingen har betygsatt receptet än.'))+
  '<button class="cell link" data-act="rate" data-id="'+esc(r.id)+'"><span class="grow" style="color:var(--accent)">'+(me?'Ändra ditt betyg':'Betygsätt receptet')+'</span>'+chevron+'</button>');
 h+='<div class="pills" style="padding:12px 16px 0">'+(inBank(r.id)?'<span class="pill on">'+I.tick+'I receptbanken</span>':'<button class="pill" data-act="bankAdd" data-id="'+esc(r.id)+'">Spara i receptbanken</button>')+
  '<button class="pill'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'">'+(wished?I.tick+'Önskad nästa vecka':'Vill ha nästa vecka')+'</button>'+
  (S.confirm==='delRecipe'?'<span class="sub" style="width:100%">Ta bort receptet ur receptbanken så att det aldrig föreslås igen?</span><button class="tb red strong" data-act="deleteRecipe" data-id="'+esc(r.id)+'">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="pill red" data-act="deleteRecipeAsk">Ta bort receptet</button>')+'<label class="pill photo-pick">'+(S.photoBusy===r.id?'Laddar upp…':(imgOf(r.id)?'Byt foto':'Lägg till foto'))+'<input type="file" accept="image/*" data-change="photo" data-id="'+esc(r.id)+'"'+(S.photoBusy?' disabled':'')+'></label></div>';
 return h}
/* Matfoton: bilden förminskas i telefonen, laddas upp till Drive via Apps Script och
   adressen sparas på receptet i receptbanken (receptet sparas där om det inte redan finns) */
const imgOf=id=>{const b=bankList().find(x=>x.id===id);return b&&b.img||''};
function shrinkImage(file,max){return new Promise((ok,bad)=>{const u=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.82))};
 im.onerror=()=>{URL.revokeObjectURL(u);bad(new Error('Bilden kunde inte läsas'))};im.src=u})}
async function uploadPhoto(id,file){const r=recipeById(id);if(!r||!file)return;if(!navigator.onLine){toast('Att spara foton kräver nät.');return}S.photoBusy=id;render();
 try{const data=await shrinkImage(file,1280);
  const res=await fetch(CFG.api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'photoUpload',key:S.key,by:S.me,id,title:r.title,data})});
  const j=await res.json();if(!j.ok||!j.url)throw new Error(j.error||'Uppladdningen misslyckades');
  if(!inBank(id))addToBank(Object.assign({},r,{img:j.url}),true);
  else{const row=BANK_ROWS().find(k=>parseJ(settings()[k],[]).some(x=>x.id===id));if(row)updJSON(row,[],a=>a.map(x=>x.id===id?Object.assign({},x,{img:j.url}):x))}
  toast('Fotot är sparat')}
 catch(e){toast('Fotot sparades inte: '+e.message)}
 S.photoBusy=null;render()}

V.uppgifter=function(){
 const t=today(),d=D(),open=d.tasks.filter(x=>!x.done),done=d.tasks.filter(x=>x.done);
 const g=[['Försenade',open.filter(x=>isDate(x.due)&&x.due<t)],['Idag',open.filter(x=>x.due===t)],['Kommande',open.filter(x=>isDate(x.due)&&x.due>t).sort((a,b)=>a.due.localeCompare(b.due))],['Utan datum',open.filter(x=>!isDate(x.due))]];
 let h=head('Uppgifter',{sub:open.length+' att göra',tools:'<button class="ib plus" data-act="taskAdd" aria-label="Ny uppgift">'+I.plus+'</button>'});
 h+=segc('Visa','taskTab',[['lista','Lista'],['kalender','Kalender']],S.taskTab);
 if(S.taskTab==='kalender')return h+calView();
 h+='<div class="split"><div class="col">';
 g.forEach(([l,xs])=>{if(!xs.length)return;h+=sh(l,xs.length,l==='Försenade'?'red':'')+group(xs.map(taskRow).join(''))});
 if(!open.length)h+='<div style="height:22px"></div>'+group(emptyCell('Inget att göra just nu.'));
 h+='</div><div class="col">';
 if(done.length)h+='<details data-k="done"'+(S.open.done||S.confirm==='clearTasks'?' open':'')+'><summary class="sh"><span>Klara ('+done.length+')</span></summary>'+group(done.map(taskRow).join(''))+
  '<div class="pills" style="padding:12px 16px 0 24px">'+(S.confirm==='clearTasks'?'<span class="sub">Ta bort alla klara?</span><button class="tb red strong" data-act="clearTasksYes">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="tb red" data-act="clearTasks">Rensa klara</button>')+'</div></details>';
 return h+'</div></div>'};
/* Kalender: månadsöversikt med kalenderhändelser (fliken Händelser) och uppgifter,
   och under den allt som händer den valda dagen */
const ymKey=d=>d.slice(0,7);
function calDots(date){const d=D(),evs=d.events.filter(e=>e.date===date),ts=d.tasks.filter(x=>x.due===date&&!x.done),out=[];
 evs.forEach(e=>{const w=String(e.who||'').trim();out.push(w&&people().includes(w)?'e '+pcls(w):'e o')});
 ts.forEach(()=>out.push('t'));return out.slice(0,4)}
// Översiktens kalenderruta: veckoremsa där man väljer dag, och den dagens händelser med start- och sluttid
let CAL_STYLE=['1','2','3'].includes(lsGet('calStyle'))?lsGet('calStyle'):'2';
// Födelsedagar i kalendern ("Leah fyller 12 år") visas som en påminnelse överst i stället för som en heldagsrad
const isBdEv=e=>!e.time&&/ fyller( \d+)? år$/.test(String(e.title||''));
function calDayRows(sel){const d=D(),t=today();
 const all=d.events.filter(e=>e.date===sel).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
 const bds=all.filter(isBdEv),evs=all.filter(e=>!isBdEv(e)),st=sel===t?evStates(evs):new Map();
 const rem=bds.map(e=>'<div class="bd-remind">'+I.cake+'<span>'+esc(e.title)+(sel===t?' idag':'')+'</span></div>').join('');
 if(!evs.length)return rem+(bds.length?'':'<div class="wempty">Inget i kalendern '+(sel===t?'idag':'den här dagen')+'.</div>');
 const head=rem+'<div class="wk-sub">Schema</div>',who=e=>evWho(e);
 if(CAL_STYLE==='1'){
  // förslag 1: tiden till vänster, bara det som inte redan står där till höger
  return head+'<div class="evs">'+evs.map(e=>{const x=st.get(e)||{};
   const r=x.st==='now'?'<span class="cd now">'+x.left+' kvar</span>':x.st==='next'?'<span class="cd">om '+x.inn+'</span>':'';
   return'<div class="ev'+(x.st==='past'?' past':'')+'"><span class="t">'+esc(e.time||'Heldag')+'</span><span class="grow">'+esc(e.title)+who(e)+'</span>'+r+'</div>'}).join('')+'</div>'}
 if(CAL_STYLE==='2'){
  // förslag 2: det som pågår får en tunn förloppsstapel under titeln
  return head+'<div class="evs">'+evs.map(e=>{const x=st.get(e)||{};
   const bar=x.st==='now'?'<div class="ev-pb"><span class="pb"><i style="width:'+Math.round(x.p*100)+'%"></i></span><span class="pbt num">'+x.left+' kvar</span></div>':'';
   const r=x.st==='next'?'<span class="cd">om '+x.inn+'</span>':'';
   return'<div class="ev'+(x.st==='past'?' past':'')+(x.st==='now'?' now':'')+'"><span class="t">'+esc(e.time||'Heldag')+'</span><span class="grow"><span class="ev-ti">'+esc(e.title)+who(e)+'</span>'+bar+'</span>'+r+'</div>'}).join('')+'</div>'}
 // förslag 3: dagens tidsaxel med block och en nu-linje, listan under visar bara starttid
 const timed=evs.filter(e=>st.has(e)||/^\d/.test(e.time||'')),allday=evs.filter(e=>!/^\d/.test(e.time||''));
 const at=v=>{const m=/^(\d{1,2})[.:](\d{2})/.exec(v||'');return m?Number(m[1])*60+Number(m[2]):null},en=v=>{const m=/[–-]\s*(\d{1,2})[.:](\d{2})/.exec(v||'');return m?Number(m[1])*60+Number(m[2]):null};
 let lo=Math.min(7*60,...timed.map(e=>at(e.time))),hi=Math.max(21*60,...timed.map(e=>en(e.time)||at(e.time)+30));lo=Math.floor(lo/60)*60;hi=Math.ceil(hi/60)*60;
 const X=m=>((m-lo)/(hi-lo)*100).toFixed(2),n=new Date(),nm=n.getHours()*60+n.getMinutes();
 let ax='<div class="tl"><div class="tl-track">'+timed.map((e,i)=>{const s0=at(e.time),e0=en(e.time)||s0+30,w=String(e.who||'').trim();
  return'<i class="tl-b '+(w&&people().includes(w)?pcls(w):'o')+'" style="left:'+X(s0)+'%;width:'+(X(e0)-X(s0))+'%;top:'+(i%2?11:2)+'px"></i>'}).join('')+
  (sel===t&&nm>=lo&&nm<=hi?'<b class="tl-now" style="left:'+X(nm)+'%"></b>':'')+'</div><div class="tl-ax num">';
 for(let h=lo;h<=hi;h+=180)ax+='<span style="left:'+X(h)+'%">'+pad(h/60)+'</span>';ax+='</div></div>';
 return head+ax+'<div class="evs">'+allday.concat(timed).map(e=>{const x=st.get(e)||{};
  const r=x.st==='now'?'<span class="cd now">'+x.left+' kvar</span>':x.st==='next'?'<span class="cd">om '+x.inn+'</span>':'';
  return'<div class="ev'+(x.st==='past'?' past':'')+'"><span class="t short">'+esc(e.time?String(e.time).split(/\s*[–-]\s*/)[0]:'Heldag')+'</span><span class="grow">'+esc(e.title)+who(e)+'</span>'+r+'</div>'}).join('')+'</div>'}
function calWidget(){const t=today(),wk=[];for(let i=0;i<7;i++)wk.push(addDays(t,i));
 const sel=wk.includes(S.ovDay)?S.ovDay:t;
 let strip='<div class="wk" role="group" aria-label="Veckans dagar">';
 wk.forEach((k,i)=>{const dt=parse(k),dots=calDots(k);
  strip+='<button class="wk-d'+(i===0?' today':'')+(k===sel?' sel':'')+'" data-act="ovDay" data-id="'+k+'" aria-pressed="'+(k===sel)+'" aria-label="'+esc(dateLong(k))+(dots.length?', '+dots.length+' saker':'')+'"><span class="wd">'+(i===0?'Idag':cap(DAYS[dt.getDay()].slice(0,3)))+'</span><span class="n num">'+dt.getDate()+'</span><span class="dots">'+dots.map(c=>'<i class="'+c+'"></i>').join('')+'</span></button>'});
 strip+='</div>';
 // under ett streck: dagens att göra-uppgifter med egen rubrik
 const ts=D().tasks.filter(x=>x.due===sel&&!x.done);
 const todo=ts.length?'<div class="wk-todo wk-link" data-act="taskList" role="link" tabindex="0" aria-label="Att göra, öppna Uppgifter"><div class="wk-sub">Att göra</div><div class="evs">'+ts.map(x=>'<div class="ev task"><span>'+esc(x.title)+evWho(x)+'</span></div>').join('')+'</div></div>':'';
 return'<section class="widget w2 calw"><button class="wh" data-act="calOpen" data-id="'+sel+'" style="width:100%">'+I.cal+'<span>Kalender</span><span class="r">'+esc(cap(MON[parse(sel).getMonth()]))+'</span></button>'+strip+
  // schemadelen öppnar kalendern på vald dag, att göra-delen öppnar uppgiftslistan
  '<div class="wk-day"><div id="cal-rows" class="wk-link" data-d="'+sel+'" data-act="calOpen" data-id="'+sel+'" role="link" tabindex="0" aria-label="Schema, öppna kalendern">'+calDayRows(sel)+'</div>'+todo+'</div></section>'}
function calView(){const t=today(),sel=S.calDay||t,m=S.calMonth||ymKey(sel),[y,mo]=m.split('-').map(Number);
 const first=new Date(y,mo-1,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));
 let h='<div class="cal-head"><button class="ib" data-act="calMonth" data-d="-1" aria-label="Förra månaden">'+I.back+'</button><div class="hl">'+esc(cap(MON[mo-1]))+(y!==new Date().getFullYear()?' '+y:'')+'</div>'+
  '<button class="ib flip" data-act="calMonth" data-d="1" aria-label="Nästa månad">'+I.back+'</button>'+(sel!==t||m!==ymKey(t)?'<button class="tb" data-act="calToday">Idag</button>':'')+'</div>';
 h+='<div class="group cal"><div class="cal-wd" aria-hidden="true">'+['M','T','O','T','F','L','S'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="cal-grid" role="grid">';
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=ymd(d),inM=d.getMonth()===mo-1;if(i===35&&!inM)break;
  const dots=calDots(k),wd=(d.getDay()+6)%7;
  h+='<button class="cal-d'+(inM?'':' out')+(k===t?' today':'')+(k===sel?' sel':'')+(wd>4?' we':'')+'" data-act="calDay" data-id="'+k+'" aria-label="'+esc(dateLong(k))+(dots.length?', '+dots.length+' saker':'')+'"'+(k===sel?' aria-current="date"':'')+'>'+
   '<span class="n num">'+d.getDate()+'</span><span class="dots">'+dots.map(c=>'<i class="'+c+'"></i>').join('')+'</span></button>'}
 h+='</div></div>';
 // dagens innehåll: händelser i tidsordning och uppgifter
 const d=D(),evs=d.events.filter(e=>e.date===sel).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||''))),late=sel===t?d.tasks.filter(x=>!x.done&&isDate(x.due)&&x.due<t):[],
  ts=d.tasks.filter(x=>x.due===sel),meals=d.menu.filter(x=>x.date===sel);
 h+=sh(esc(cap(dayHead(sel)))+(sel===t?' <span class="acc">· Idag</span>':''),'<button class="linkbtn" data-act="calAddTask" data-id="'+sel+'">'+'Ny uppgift</button>');
 const evRow=e=>{const w=String(e.who||'').trim();return'<div class="cell cal-ev"><span class="bar '+(w&&people().includes(w)?pcls(w):'o')+'"></span><span class="t num">'+esc(e.time||'Heldag')+'</span><span class="grow"><span class="title">'+esc(e.title)+'</span>'+(w?'<span class="meta"><span class="chip'+(w==='Henrik'?' h':'')+'">'+esc(w)+'</span></span>':'')+'</span></div>'};
 const body=evs.map(evRow).join('')+late.concat(ts).map(taskRow).join('');
 h+=group(body||emptyCell('Inget inplanerat. Tryck på Ny uppgift för att lägga till något.'));
 if(meals.length)h+=sh('Mat')+group(meals.map(mealCell).join(''));
 // de närmaste dagarna i listform
 const next=[];for(let i=1;i<=6;i++){const k=addDays(sel,i),n=d.events.filter(e=>e.date===k).length+d.tasks.filter(x=>x.due===k&&!x.done).length;if(n)next.push([k,n])}
 if(next.length)h+=sh('Kommande dagar')+group(next.map(([k,n])=>'<button class="cell link" data-act="calDay" data-id="'+k+'"><span class="grow">'+esc(cap(dayHead(k)))+'</span><span class="val num">'+n+(n===1?' sak':' saker')+'</span>'+chevron+'</button>').join(''));
 h+='<div class="foot">Händelserna kommer från Google Kalender och uppdateras var 15:e minut.</div>';
 return h}
/* Återkommande uppgifter: kolumnen Upprepa i Uppgifter. När en sådan bockas av flyttas datumet fram
   till nästa gång (samma uträkning som nextDue_ i Kod.gs) och uppgiften ligger kvar. */
const REPEATS=[['','Ingen'],['dag','Varje dag'],['vecka','Varje vecka'],['2veckor','Varannan vecka'],['4veckor','Var 4:e vecka'],['manad','Varje månad'],['ar','Varje år']];
const repName=k=>(REPEATS.find(r=>r[0]===k&&k)||[0,''])[1];
function nextDue(due,rep,t){let d=isDate(due)?due:t;const anchor=Number(d.slice(8,10));
 for(let i=0;i<1000&&(i===0||d<=t);i++){
  const n={dag:1,vecka:7,'2veckor':14,'4veckor':28}[rep];
  if(n)d=addDays(d,n);
  else{const[y0,m0]=d.split('-').map(Number),y=rep==='ar'?y0+1:y0+(m0===12?1:0),m=rep==='ar'?m0:m0%12+1,last=new Date(y,m,0).getDate();d=y+'-'+pad(m)+'-'+pad(Math.min(anchor,last))}}
 return d}
function taskRow(x){const t=today(),late=isDate(x.due)&&x.due<t&&!x.done;
 const meta=(x.due?'<span'+(late?' class="red"':'')+'>'+esc(x.due===t?'Idag':dateShort(x.due))+'</span>':'')+(repName(x.repeat)?'<span class="chip">↻ '+esc(repName(x.repeat))+'</span>':'')+(x.who?'<span class="chip'+(x.who==='Henrik'?' h':'')+'">'+esc(x.who)+'</span>':'')+(x.note?'<span>'+esc(x.note)+'</span>':'');
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
 const k=S.cook?'cook':S.sheet==='settings'?'settings':S.sheet==='rate'?'rate':S.sheet==='income'?'income':S.sheet==='cost'?'cost':S.sheet==='prefs'?'prefs':S.sheet==='swap'?'swap':S.sheet==='wish'?'wish':S.shopAdd?'shop':S.taskAdd?'task':'';
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
  sh('Schemat i kalenderrutan')+'<div class="seg-wrap">'+segc('Schemat i kalenderrutan','calStyle',[['1','Tid kvar'],['2','Stapel'],['3','Tidsaxel']],CAL_STYLE)+'</div>'+
  sh('Skärm')+group(fieldCell('Väggläge','<input type="checkbox" role="switch" class="switch" data-act="wall" aria-label="Väggläge"'+(S.wall?' checked':'')+'>')+statusHtml())+
  (topic?sh('Notiser')+group('<div class="cell"><span class="grow copy">'+esc(topic)+'</span><button type="button" class="pill" data-act="copy" data-id="'+esc(topic)+'">Kopiera</button></div>')+'<div class="foot">Installera appen ntfy och prenumerera på det här ämnet. Använd servern ntfy.sh.</div>':'')+
  sh('Den här enheten')+group('<button type="button" class="cell link center red" data-act="logout">Logga ut</button>');
  o.innerHTML=sheetHtml('settings','Inställningar','<button class="tb strong">Spara</button>',body,enter);segSlide(o);return}
 if(k==='prefs'){const st=settings();
  const body=PREFS.map(([key,l,,ph])=>sh(l)+group('<div class="cell"><textarea class="field area" name="'+key+'" rows="'+Math.max(3,Math.ceil(String(st[key]||'').length/34)+1)+'" maxlength="600" placeholder="'+esc(ph)+'" aria-label="'+esc(l)+'">'+esc(st[key]||'')+'</textarea></div>')).join('')+
   '<div class="foot">Sparas i kalkylarket. Veckoplaneringen läser dem nästa gång den gör menyn.</div>';
  o.innerHTML=sheetHtml('prefs','Matpreferenser','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='swap'){const sw=S.swap||{},m=sw.m||{},cands=swapCandidates(m);let body='<div style="height:16px"></div>'+group('<div class="cell"><div class="grow"><div class="chips-row">'+whoChip(m.who)+'<span class="chip">'+esc(dateShort(m.date))+'</span></div><div class="title" style="margin-top:3px">'+esc(m.title)+'</div></div></div>');
  if(sw.step==='pick'){const same=cands.filter(c=>c.score>=20),other=cands.filter(c=>c.score<20);
   const row=c=>'<button type="button" class="cell link" data-act="swapTo" data-id="'+esc(c.r.id)+'"><div class="grow"><div class="title">'+esc(c.r.title)+'</div><div class="meta">'+whoChip(c.r.who)+'<span>'+swapWhy(c)+'</span></div></div>'+chevron+'</button>';
   body+=sh('Välj en rätt')+group(same.length?same.map(row).join(''):emptyCell('Inga rätter av samma sort i receptbanken.'))+(other.length?sh('Andra rätter')+group(other.map(row).join('')):'')+
    '<div class="pills" style="padding:12px 16px 0"><button type="button" class="pill" data-act="swapStep" data-id="ask">Tillbaka</button></div>'}
  else if(sw.step==='suggest'){const c=cands[(sw.i||0)%Math.max(1,cands.length)];
   body+=sh('Förslag')+(c?group('<div class="cell"><div class="grow"><div class="chips-row">'+whoChip(c.r.who)+(c.r.min?'<span class="chip num">'+c.r.min+' min</span>':'')+'</div><div class="title" style="margin-top:3px">'+esc(c.r.title)+'</div><div class="meta">'+swapWhy(c)+'</div></div></div>')+
    '<div class="block" style="display:flex;gap:8px"><button type="button" class="btn-fill" style="flex:1" data-act="swapTo" data-id="'+esc(c.r.id)+'">Ta den här</button>'+(cands.length>1?'<button type="button" class="btn-tint" style="flex:1" data-act="swapNext">Ett annat förslag</button>':'')+'</div>'+
    '<div class="foot">Inköpslistan uppdateras: varor som bara behövdes till den gamla rätten tas bort och ingredienserna till den nya läggs till.</div>'
    :group(emptyCell('Receptbanken har inga fler rätter att föreslå. Ta bort rätten, eller önska något till nästa vecka.')))+
    '<div class="pills" style="padding:12px 16px 0"><button type="button" class="pill" data-act="swapStep" data-id="ask">Tillbaka</button></div>'}
  else body+=sh('Vill du önska något själv?')+group('<button type="button" class="cell link" data-act="swapStep" data-id="pick"><span class="grow" style="color:var(--accent)">Ja, jag väljer från receptbanken</span>'+chevron+'</button>'+
    '<button type="button" class="cell link" data-act="swapStep" data-id="suggest"><span class="grow" style="color:var(--accent)">Nej, föreslå något</span>'+chevron+'</button>')+
    sh('Eller')+group(S.confirm==='swapRemove'?'<div class="cell"><span class="grow">Ta bort rätten utan att lägga in någon ny?</span><button type="button" class="tb red strong" data-act="swapRemove">Ja, ta bort</button><button type="button" class="tb" data-act="confirmNo">Avbryt</button></div>':
     '<button type="button" class="cell link center red" data-act="swapRemoveAsk">Ta bort utan ny rätt</button>')+
    '<div class="foot">'+(m.recipe&&D().menu.filter(x=>x.recipe===m.recipe).length>1?'Rätten står på flera dagar och byts överallt. ':'')+'Varor som bara behövdes till rätten tas bort från inköpslistan.</div>';
  o.innerHTML=sheetHtml('swap',m.recipe?'Byt rätt':'Välj rätt','<span></span>',body,enter);return}
 if(k==='wish'){const r=S.wishFor&&recipeById(S.wishFor),sel=slotFor(r);
  const body=(r?'<div style="height:16px"></div>'+group('<div class="cell"><div class="grow"><div class="chips-row">'+whoChip(r.who)+'</div><div class="title" style="margin-top:3px">'+esc(r.title)+'</div></div></div>'):
   sh('Vad vill du äta?')+group('<div class="cell"><input class="field" name="t" required maxlength="120" placeholder="T.ex. lasagne eller pad thai" aria-label="Rätt" autocomplete="off"></div>'))+
   sh('Vilken matlagning ska den ersätta?')+'<div class="vpick col" role="radiogroup" aria-label="Ersätter">'+SLOTS.map(x=>'<label><input type="radio" name="slot" value="'+esc(x)+'"'+(x===sel?' checked':'')+'><span>'+esc(x)+'</span></label>').join('')+'</div>'+
   '<div class="foot">Söndagens veckoplanering lägger rätten där i stället för det den annars hade valt. Önskemålen töms varje vecka.</div>';
  o.innerHTML=sheetHtml('wish','Önska till nästa vecka','<button class="tb strong">Önska</button>',body,enter);return}
 if(k==='income'){const m=S.ekoMonth||thisMonth(),cur=(ekoInc()[m])||ekoInc()[prevIncMonth(m)]||{};
  const body=sh('Inkomst efter skatt, '+monthName(m))+group(people().map((p,i)=>fieldCell('<span class="pdot p'+(i+1)+'"></span>'+esc(p),'<input class="field r" name="p'+i+'" inputmode="numeric" value="'+esc(cur[p]||'')+'" placeholder="0 kr" style="max-width:150px" aria-label="Inkomst '+esc(p)+'">')).join(''))+
   '<div class="foot">Fördelningen av de gemensamma utgifterna räknas fram från inkomsterna.</div>';
  o.innerHTML=sheetHtml('income','Inkomst','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='cost'){const e=S.ekoEdit||{},list=ekoList(e.list),c=list.find(x=>x.id===e.id)||{period:'månad'};
  const pays=['','E-faktura','Autogiro','Kort','Swish','Övrigt'];
  // vem som betalar; byts listan flyttas utgiften dit när den sparas
  const own='<div class="vpick">'+[['shared','Gemensam']].concat(people().map(p=>[p,p])).map(([v,l])=>'<label><input type="radio" name="owner" value="'+esc(v)+'"'+((e.list||'shared')===v?' checked':'')+'><span>'+esc(l)+'</span></label>').join('')+'</div>';
  const body=sh('Vem betalar?')+own+'<div style="height:16px"></div>'+group('<div class="cell"><input class="field" name="name" required placeholder="Namn, t.ex. Spotify eller Hyra" value="'+esc(c.name||'')+'" aria-label="Namn" autocomplete="off"></div>'+
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
   fieldCell('Datum','<input class="field r" id="task-due" name="due" type="date" value="'+esc(S.taskDue||'')+'" style="max-width:170px">')+
   fieldCell('Vem',menuSel('id="task-who" name="who"','<option value="">Vem som helst</option>'+people().map(p=>'<option>'+esc(p)+'</option>').join('')+'<option>Båda</option>'))+
   fieldCell('Upprepa',menuSel('id="task-rep" name="repeat"',REPEATS.map(([k,l])=>'<option value="'+k+'">'+l+'</option>').join(''))))+
   '<div class="foot">En uppgift som upprepas flyttas till nästa gång när den bockas av. Utan datum börjar den i dag.</div>';
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
function sunTimes(date,lat,lon){const R=Math.PI/180,J=Date.parse(date+'T00:00:00Z')/864e5+2440587.5,n=Math.ceil(J-2451545+0.0008),Js=n-lon/360;
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
// dimma ritas själv: telefonens dimemoji ser ut som en suddig grå fyrkant
const FOG_IC='<svg class="ic-fog" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><g fill="none" stroke="#A7B0BF" stroke-width="2.2" stroke-linecap="round"><path d="M3 8c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M3 13c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0" opacity=".8"/><path d="M5 18c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0 3.3-1.2 4 0" opacity=".6"/></g></svg>';
function symInfo(s){const b=symBase(s),night=/_night$/.test(s||'');
 if(/thunder/.test(b))return['⛈️','Åska'];
 if(/sleet/.test(b))return['🌨️',(/showers/.test(b)?'Byar av ':'')+'snöblandat regn'];
 if(/snow/.test(b))return[/heavy/.test(b)?'❄️':'🌨️',/showers/.test(b)?'Snöbyar':/heavy/.test(b)?'Kraftigt snöfall':/light/.test(b)?'Lätt snöfall':'Snöfall'];
 if(/rain/.test(b))return[/heavy/.test(b)?'🌧️':(/showers|light/.test(b)?'🌦️':'🌧️'),/showers/.test(b)?(/heavy/.test(b)?'Kraftiga regnskurar':/light/.test(b)?'Lätta regnskurar':'Regnskurar'):(/heavy/.test(b)?'Kraftigt regn':/light/.test(b)?'Lätt regn':'Regn')];
 return{clearsky:[night?'🌙':'☀️','Klart'],fair:[night?'🌙':'🌤️','Mest klart'],partlycloudy:[night?'☁️':'⛅','Halvklart'],cloudy:['☁️','Mulet'],fog:[FOG_IC,'Dimma']}[b]||['🌡️','']}
// temperaturfärg efter verklig temperatur (som Apples väder): mörkblått under 0, ljusblått till 15, grönt till 20,
// gult till 25, orange till 30 och rött över; färgerna glider över i varandra vid gränserna
const T_COL=[[-15,'#2B3FB0'],[-3,'#3478F6'],[3,'#5AC8FA'],[13,'#64D2E6'],[17.5,'#4CD964'],[22.5,'#FFD60A'],[27.5,'#FF9F0A'],[32,'#FF453A'],[40,'#D70015']];
function tempCol(T){const c=T_COL;if(T<=c[0][0])return c[0][1];for(let i=1;i<c.length;i++)if(T<=c[i][0])return mixHex(c[i-1][1],c[i][1],(T-c[i-1][0])/(c[i][0]-c[i-1][0]));return c[c.length-1][1]}
function tempGrad(a,b){if(b-a<.5)return tempCol((a+b)/2);const n=Math.max(2,Math.ceil(b-a)+1);
 return'linear-gradient(90deg,'+Array.from({length:n},(_,i)=>tempCol(a+(b-a)*i/(n-1))+' '+(i/(n-1)*100).toFixed(1)+'%').join(',')+')'}
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
 const nt=isNight();
 const tip={hot:nt?'Shorts och t-shirt':'Shorts, t-shirt och solglasögon',warm:'T-shirt räcker'+(sunny&&!nt?', ta solglasögon':''),mild:'Lätt jacka',cold:'Jacka, mössa och vantar',freezing:'Varmt på dig, det är minusgrader',
  rain:'Ta med paraply',snow:'Vinterkläder, det snöar',storm:'Paraply, och håll dig inne vid åska',fog:'Dimmigt, ta reflex'}[kind];
 return{kind,night:nt,sunny,max,pr,tip,when:late?'i morgon':'idag'}}
function isNight(){const P=WX_POS(),s=sunTimes(today(),P.lat,P.lon),n=new Date();return s?(n<s[0]||n>s[1]):false}

/* Vädervovvarna: hushållets två franska bulldoggar i Kurzgesagt-anda.
   Geometriska former, nästan inga ansiktsdrag, hård skugga i kall ton på högra sidan,
   mjuk högdager uppe till vänster och lysande ljuskällor med koncentriska sken.
   Ingen bakgrundsruta: vädret svävar fritt runt hundarna. */
let FIG_N=0;
const mixHex=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const shadeHex=(h,f)=>mixHex(h,'#000000',1-f);
const shadow=c=>mixHex(mixHex(c,'#2A2350',.38),'#000000',.18);   // kall, lite lila skugga
const light=c=>mixHex(c,'#FFF6E0',.22);
const DOGS=[
 {fur:'#C9874C',mask:'#2E2522',ear:'#7E4F35',chest:null,eye:'#1A1210',
  coat:{mild:'#3F7FA6',cold:'#B4475D',freezing:'#2D4F7C',snow:'#2D4F7C',rain:'#E8B931',storm:'#E8B931',fog:'#6F7E8E'},band:'#B4475D',scarf:'#D9894A',hat:'#B4475D'},
 {fur:'#2C2A33',mask:'#1D1B22',ear:'#3A3742',chest:'#EDE7E0',eye:'#0B0A0E',
  coat:{mild:'#C9694F',cold:'#3F7FA6',freezing:'#B4475D',snow:'#B4475D',rain:'#E8B931',storm:'#E8B931',fog:'#4F7E6C'},band:'#3F7FA6',scarf:'#6FA393',hat:'#2D4F7C'}];
function dogSvg(D,o,id,pose){
 const F=o.fit||{},night=!!o.night,coat=F.coat?D.coat[F.coat]:null,lie=pose==='lie';
 const shades=!!F.shades,beanie=!!F.beanie,scarf=!!F.scarf,puffer=!!F.puffer,rainc=!!F.rain,sleepy=lie,snowy=!!F.snowy;
 const C=(c,sh)=>sh?shadow(c):c;
 const hood=rainc;
 // liggande: en låg limpa med framtassarna framåt och huvudet vilande på dem
 const bodyLie=sh=>{let b='<path d="M14 112 Q12 94 30 91 H88 Q104 93 104 112 Q104 123 92 123 H26 Q14 123 14 112Z" fill="'+C(D.fur,sh)+'"/>';
  if(coat)b+='<path d="M15 108 Q14 94 30 92 H88 Q103 94 103 108 Q90 112 60 112 Q30 112 15 108Z" fill="'+C(coat,sh)+'"/>';
  if(!sh&&snowy)b+='<path d="M24 93 Q34 86 46 90 Q38 94 24 93Z M70 90 Q82 85 94 92 Q82 94 70 90Z" fill="#FFFFFF"/>';
  const paw=D.chest?'#DCD3CA':shadeHex(D.fur,.9);
  b+='<rect x="38" y="115" width="20" height="8" rx="4" fill="'+C(D.fur,sh)+'"/><rect x="62" y="115" width="20" height="8" rx="4" fill="'+C(D.fur,sh)+'"/>'+
   '<rect x="38" y="119" width="7" height="4" rx="2" fill="'+C(paw,sh)+'"/><rect x="62" y="119" width="7" height="4" rx="2" fill="'+C(paw,sh)+'"/>';
  return b};
 const body=sh=>{let b='<path d="M33 113 Q31 88 43 77 Q60 68 77 77 Q89 88 87 113 Q87 123 75 123 H45 Q33 123 33 113Z" fill="'+C(D.fur,sh)+'"/>';
  if(!sh&&D.chest&&!coat)b+='<path d="M53 76 Q60 72 67 76 L65 93 L60 106 L55 93Z" fill="'+D.chest+'"/>';
  if(coat){b+='<path d="M34 107 Q32 86 44 77.5 Q60 69.5 76 77.5 Q88 86 86 107 Q75 114 60 114 Q45 114 34 107Z" fill="'+C(coat,sh)+'"/>';
   if(!sh&&puffer)b+='<path d="M36 88 Q60 94 84 88 M35 99 Q60 106 85 99" stroke="'+shadow(coat)+'" stroke-width="1.2" fill="none" opacity=".7"/>';
   if(!sh&&rainc)b+='<line x1="60" y1="79" x2="60" y2="112" stroke="'+shadow(coat)+'" stroke-width="1" opacity=".8"/>'}
  if(!sh&&snowy)b+='<path d="M36 86 Q40 78 50 78 Q44 83 36 86Z M84 86 Q80 78 70 78 Q76 83 84 86Z" fill="#FFFFFF"/>';
  b+='<rect x="45" y="101" width="12" height="21" rx="5" fill="'+C(D.fur,sh)+'"/><rect x="63" y="101" width="12" height="21" rx="5" fill="'+C(D.fur,sh)+'"/>';
  const paw=D.chest?'#DCD3CA':shadeHex(D.fur,.9);
  b+=rainc?'<rect x="44" y="114" width="14" height="9" rx="3" fill="'+C('#2E3A4F',sh)+'"/><rect x="62" y="114" width="14" height="9" rx="3" fill="'+C('#2E3A4F',sh)+'"/>'
   :'<rect x="44.5" y="119" width="13" height="4" rx="2" fill="'+C(paw,sh)+'"/><rect x="62.5" y="119" width="13" height="4" rx="2" fill="'+C(paw,sh)+'"/>';
  return b};
 const head=sh=>{let h='';
  // öronen: enkla, rundade trianglar
  h+='<g class="ear-l"><path d="M35 44 Q25 22 31 13 Q39 7 56 31Z" fill="'+C(D.fur,sh)+'"/>'+(sh?'':'<path d="M37 38 Q31 22 34 16.5 Q39 13.5 49 31Z" fill="'+D.ear+'"/>')+'</g>';
  h+='<g class="ear-r"><path d="M85 44 Q95 22 89 13 Q81 7 64 31Z" fill="'+C(D.fur,sh)+'"/>'+(sh?'':'<path d="M83 38 Q89 22 86 16.5 Q81 13.5 71 31Z" fill="'+D.ear+'"/>')+'</g>';
  if(hood)h+='<path d="M29 54 Q29 23 60 23 Q91 23 91 54 L87 72 H33Z" fill="'+C(coat,sh)+'"/>';
  // huvudet: bred, rundad trapets
  h+='<path d="M33 50 Q33 29 60 29 Q87 29 87 50 Q87 74 60 75 Q33 74 33 50Z" fill="'+C(D.fur,sh)+'"/>';
  if(!sh)h+='<path d="M48 36 Q60 31 72 36 Q66 40 60 40 Q54 40 48 36Z" fill="'+shadeHex(D.fur,.9)+'" opacity=".8"/>';
  // mask: nosparti, och hos den fawnfärgade även kring ögonen
  if(!D.chest)h+='<path d="M38 46 Q46 39 55 45 Q53 53 45 53 Q38 52 38 46Z M82 46 Q74 39 65 45 Q67 53 75 53 Q82 52 82 46Z" fill="'+C(D.mask,sh)+'"/>';
  h+='<path d="M45 58 Q45 49 60 49 Q75 49 75 58 Q75 69 60 70 Q45 69 45 58Z" fill="'+C(D.mask,sh)+'"/>';
  return h};
 const face=()=>{let f='<path d="M55.5 53 Q60 50.5 64.5 53 Q63.5 57 60 57.5 Q56.5 57 55.5 53Z" fill="#0B0A0E"/><ellipse cx="58.3" cy="52.8" rx="1.4" ry=".7" fill="#fff" opacity=".35"/>';
  if(sleepy)f+='<path d="M43.5 47 Q47 48.6 50.5 47 M69.5 47 Q73 48.6 76.5 47" stroke="'+(D.chest?'#55515F':'#0B0A0E')+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  else if(shades)f+='<path d="M40 43.5 H55 Q55.5 50 49 50.5 Q41 50.5 40 43.5Z M65 43.5 H80 Q79 50.5 71 50.5 Q64.5 50 65 43.5Z" fill="#0E1022"/><path d="M55 44.5 H65" stroke="#0E1022" stroke-width="1.6"/><path d="M42 45 H48" stroke="#9FB4FF" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>';
  else if(night)f+='<g class="fig-eyes"><ellipse cx="47" cy="45.6" rx="2.6" ry="2.9" fill="'+D.eye+'"/><ellipse cx="73" cy="45.6" rx="2.6" ry="2.9" fill="'+D.eye+'"/><circle cx="46.6" cy="44.2" r=".85" fill="#DDE6FF" opacity=".9"/><circle cx="72.6" cy="44.2" r=".85" fill="#DDE6FF" opacity=".9"/></g>';
  else f+='<g class="fig-eyes"><ellipse cx="47" cy="46.5" rx="2.6" ry="2.9" fill="'+D.eye+'"/><ellipse cx="73" cy="46.5" rx="2.6" ry="2.9" fill="'+D.eye+'"/><circle cx="46.1" cy="45.5" r=".85" fill="#fff" opacity=".8"/><circle cx="72.1" cy="45.5" r=".85" fill="#fff" opacity=".8"/></g>';
  return f};
 let acc='';
 if(!coat&&!scarf)acc+='<path d="M41 74 Q60 81 79 74 L79.5 78 Q60 85 40.5 78Z" fill="'+(F.band?D.band:'#16151B')+'"/>';
 if(scarf)acc+='<path d="M39 74 Q60 81 81 74 L82 80.5 Q60 88 38 80.5Z" fill="'+D.scarf+'"/><path d="M60 81 Q72 79.5 82 75 L82 80.5 Q72 85 60 87Z" fill="'+shadow(D.scarf)+'"/>';
 let hat='';
 if(beanie)hat='<path d="M38 38 Q38 19 60 19 Q82 19 82 38Z" fill="'+D.hat+'"/><path d="M60 19 Q82 19 82 38 H71 Q71 22 60 19Z" fill="'+shadow(D.hat)+'"/><rect x="36.5" y="34.5" width="47" height="6" rx="3" fill="'+light(D.hat)+'"/>'+
  (snowy?'<path d="M42 24 Q50 15 60 17 Q71 14 78 23 Q70 21 63 23 Q55 20 48 24 Q45 25 42 24Z" fill="#FFFFFF"/><path d="M63 23 Q70 21 78 23 Q77 25 72 25Z" fill="#D6E2F0"/>':'');
 const breath=F.breath&&!lie?'<g class="fig-breath" fill="#E8F0FA"><circle cx="70" cy="60" r="3.2"/><circle cx="77" cy="56" r="2.4"/><circle cx="82" cy="51" r="1.6"/></g>':'';
 if(lie)return'<g class="fig-body dog lie">'+bodyLie(false)+'<g clip-path="url(#'+id+')">'+bodyLie(true)+'</g>'+
  '<g transform="translate(0 37)"><g class="dog-head">'+acc+head(false)+'<g clip-path="url(#'+id+')">'+head(true)+'</g>'+'<ellipse cx="49" cy="40" rx="11" ry="7" fill="url(#'+id+'h)"/>'+face()+hat+'</g></g>'+
  // Zzz som stiger från den sovande hunden
  '<g class="fig-z" font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif" font-weight="800" fill="#8FA2D8" stroke="#2E3760" stroke-width=".6" paint-order="stroke"><text x="86" y="66" font-size="11">z</text><text class="d2" x="94" y="54" font-size="14">z</text><text class="d3" x="103" y="40" font-size="18">Z</text></g></g>';
 return'<g class="fig-body dog">'+body(false)+'<g clip-path="url(#'+id+')">'+body(true)+'</g>'+acc+
  '<g class="dog-head">'+head(false)+'<g clip-path="url(#'+id+')">'+head(true)+'</g>'+
  '<ellipse cx="49" cy="40" rx="11" ry="7" fill="url(#'+id+'h)"/>'+face()+hat+'</g>'+breath+'</g>'}
/* Väderscenen visar vädret just nu, samma som väderrutan, och byggs av fristående lager som
   kombineras fritt: himlen (klart, mest klart, halvklart, mulet, dimma), sol eller måne efter
   klockslaget, nederbörd med typ och styrka, åska, vind och temperatur. Råden under bilden gäller
   resten av dagen (wxToday). Hundarna sover alltid på natten, oavsett väder. */
function dayPhase(d){const P=WX_POS(),s=sunTimes(ymd(d),P.lat,P.lon),H=3600000;
 if(!s){const m=d.getMonth();return{phase:m>2&&m<9?'day':'night',f:.5}}   // midnattssol eller polarnatt
 const t=d.getTime(),r=s[0].getTime(),e=s[1].getTime(),f=Math.max(0,Math.min(1,(t-r)/(e-r)));
 return{phase:t<r-.6*H||t>e+.6*H?'night':t<r+H?'dawn':t>e?'dusk':t>e-1.5*H?'golden':'day',f}}
function wxScene(W,at){const c=W.now,n1=W.hours[1]||c,b=symBase(c.s),amt=Math.max(c.pr||0,0);
 // nederbörd: symbolen avgör typen, mängden den närmaste timmen kan höja styrkan
 const src=/rain|sleet|snow/.test(b)?b:(amt>=.2&&/rain|sleet|snow/.test(symBase(n1.s))?symBase(n1.s):'');
 let type=!src?'none':/sleet/.test(src)?'sleet':/snow/.test(src)?'snow':'rain',lv=/heavy/.test(src)?3:/light/.test(src)?1:2;
 if(type!=='none'){if(amt>=4)lv=3;else if(amt>=1&&lv<2)lv=2}
 if(type==='rain'&&lv===1&&amt<.3)type='drizzle';
 const thunder=/thunder/.test(b);
 const sky=/^fog/.test(b)?'fog':/^clearsky/.test(b)?'clear':/^fair/.test(b)?'fair':/^partlycloudy|showers/.test(b)?'partly':'cloudy';
 const T=c.T,w=c.w||0,wl=w<4?0:w<8?1:w<14?2:3,dx=-Math.sin((c.wd||0)*Math.PI/180);   // vinden blåser åt höger när den kommer från väst
 const{phase,f}=dayPhase(at||new Date()),dark=phase==='night'||phase==='dusk',sunUp=!dark&&f>0&&f<1;
 const tc=T>=20?'hot':T>=14?'warm':T>=7?'mild':T>=0?'cold':'freezing';
 const sleep=phase==='night',wet=/^(drizzle|rain|sleet)$/.test(type),snow=type==='snow';
 // kläderna följer temperaturen och nederbörden var för sig
 const rain=wet&&(type!=='drizzle'||T<14);
 const fit={rain,coat:rain?'rain':snow?'snow':T<0?'freezing':T<7?'cold':T<14?'mild':null,puffer:snow||(!rain&&T<0),
  scarf:T<7||(sky==='fog'&&T<12),beanie:!rain&&(snow||T<0),snowy:snow&&lv>=2,breath:T<3,band:tc==='warm'&&!rain,
  shades:sunUp&&/^(clear|fair)$/.test(sky)&&!wet&&!snow&&T>=14};
 const pt={none:'',drizzle:'duggregn',rain:['lätt regn','regn','kraftigt regn'][lv-1],sleet:'snöblandat regn',snow:['lätt snöfall','snöfall','kraftigt snöfall'][lv-1]}[type];
 const label=capS([thunder?'åska':'',pt,{clear:'klart',fair:'mest klart',partly:'halvklart',cloudy:'mulet',fog:'dimma'}[sky],deg(T),['','','blåsigt','hård vind'][wl],
  {night:'natt',dawn:'gryning',day:'dag',golden:'kväll',dusk:'skymning'}[phase]].filter(Boolean).join(', '))+(sleep?'. Hundarna sover':'');
 return{sky,type,lv,thunder,T,tc,wl,dir:dx<-.2?-1:1,phase,f,dark,sunUp,sleep,fit,label}}
/* Himlen bakom väderrutan: solen och månen där de står just nu, sett mot söder.
   Vänster kant är öster, mitten söder och höger kant väster; underkanten är horisonten.
   Positionerna räknas som i SunCalc (förenklade astronomiska formler, räcker gott för en bild). */
const SKY=(()=>{const R=Math.PI/180,e=R*23.4397,toD=d=>d.valueOf()/864e5-.5+2440588-2451545;
 const ra=(l,b)=>Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)),dc=(l,b)=>Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
 const az=(H,p,d)=>Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(p)-Math.tan(d)*Math.cos(p)),alt=(H,p,d)=>Math.asin(Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(H));
 return(date,lat,lon)=>{const d=toD(date),p=R*lat,st=R*(280.16+360.9856235*d)+R*lon;
  const M=R*(357.5291+.98560028*d),L=M+R*(1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M))+R*102.9372+Math.PI,s={ra:ra(L,0),dec:dc(L,0)};
  const ml=R*(218.316+13.176396*d),mm=R*(134.963+13.064993*d),mf=R*(93.272+13.22935*d),l=ml+R*6.289*Math.sin(mm),b=R*5.128*Math.sin(mf);
  const m={ra:ra(l,b),dec:dc(l,b),dist:385001-20905*Math.cos(mm)};
  const sd=149598000,ph=Math.acos(Math.sin(s.dec)*Math.sin(m.dec)+Math.cos(s.dec)*Math.cos(m.dec)*Math.cos(s.ra-m.ra)),inc=Math.atan2(sd*Math.sin(ph),m.dist-sd*Math.cos(ph));
  const ang=Math.atan2(Math.cos(s.dec)*Math.sin(s.ra-m.ra),Math.sin(s.dec)*Math.cos(m.dec)-Math.cos(s.dec)*Math.sin(m.dec)*Math.cos(s.ra-m.ra));
  const pos=o=>{const H=st-o.ra;return{az:az(H,p,o.dec)/R,alt:alt(H,p,o.dec)/R}};
  return{sun:pos(s),moon:Object.assign(pos(m),{frac:(1+Math.cos(inc))/2,waxing:ang<0})}}})();
// en kropp på himlen: x från öster till väster, y från horisonten upp till ungefär 60 graders höjd
const skyXY=b=>({x:Math.max(5,Math.min(95,50+b.az/90*44)),y:Math.max(10,Math.min(90,90-b.alt/60*80))});
function moonSvg(frac,waxing,sz){const r=10,k=Math.abs(2*frac-1)*r,lit=frac<.03?'':frac>.97?'<circle r="10" fill="#EEF1FA"/>':
  '<path d="M0 -10 A10 10 0 0 1 0 10 A'+k.toFixed(2)+' 10 0 0 '+(frac<.5?0:1)+' 0 -10Z" fill="#EEF1FA"'+(waxing?'':' transform="scale(-1 1)"')+'/>';
 const g='mg'+(++FIG_N);
 return'<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><defs><radialGradient id="'+g+'"><stop offset=".4" stop-color="#DCE6FF" stop-opacity="'+(.12+frac*.3).toFixed(2)+'"/><stop offset="1" stop-color="#DCE6FF" stop-opacity="0"/></radialGradient></defs>'+
  '<circle r="24" fill="url(#'+g+')"/><circle r="10" fill="#8C99B8" opacity=".3"/>'+lit+
  '<circle cx="-3" cy="-2.5" r="2.2" fill="#C2CBE2" opacity="'+(frac>.5?.45:0)+'"/><circle cx="3.5" cy="3.5" r="1.5" fill="#C2CBE2" opacity="'+(frac>.5?.4:0)+'"/></svg>'}
function sunSvg(warm,sz){const c=warm?'#FFB877':'#FFE7A3',d=warm?'#FF9F5A':'#FFD666';
 return'<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="24" fill="'+c+'" opacity=".16"/><circle r="17" fill="'+c+'" opacity=".22"/><circle r="12.5" fill="'+c+'" opacity=".3"/><circle r="8.5" fill="'+d+'"/></svg>'}
// dagens högsta höjd för solen och månen, så att banan i översiktens ruta alltid når upp till kanten
const SKY_TOP={};
function skyPeak(lat,lon){const t=today(),key=t+lat+lon;if(SKY_TOP[key])return SKY_TOP[key];
 const d0=parse(t).getTime(),p={sun:0,moon:0};
 for(let i=0;i<=96;i++){const k=SKY(new Date(d0+i*9e5),lat,lon);p.sun=Math.max(p.sun,k.sun.alt);p.moon=Math.max(p.moon,k.moon.alt)}
 return SKY_TOP[key]=p}
function skyHtml(W,big){const P=WX_POS(),sc=wxScene(W),k=SKY(new Date(),P.lat,P.lon),sz=big?56:44,pk=big?null:skyPeak(P.lat,P.lon);
 const covered=sc.sky==='cloudy'||sc.sky==='fog'||/^(rain|sleet|snow)$/.test(sc.type)&&sc.lv>=2||sc.thunder,op=covered?.35:1;
 // i översikten går banan från namnsdagsraden (--hz) upp till rutans överkant, där solen får beskäras
 const at=(b,html,cls,f)=>{const q=skyXY(b),pos=big?'top:'+q.y.toFixed(1)+'%':'top:calc(var(--hz,62%) - '+Math.max(0,Math.min(1,b.alt/Math.max(pk[cls==='sky-sun'?'sun':'moon'],8))).toFixed(3)+' * (var(--hz,62%) - 8px))';
  return'<div class="sky-b '+cls+'" style="left:'+q.x.toFixed(1)+'%;'+pos+';opacity:'+(op*(f||1))+'">'+html+'</div>'};
 let h='';
 // stjärnor när det är mörkt och himlen inte är täckt
 if(sc.dark&&!covered)h+='<svg class="sky-stars" viewBox="0 0 100 100" preserveAspectRatio="none">'+[[8,14],[22,40],[36,10],[47,28],[61,8],[70,36],[83,18],[93,44],[15,62],[55,52]].slice(0,sc.sky==='partly'?4:10)
  .map(([x,y],i)=>'<circle class="tw'+(i%3?' d'+(i%3+1):'')+'" cx="'+x+'" cy="'+y+'" r=".45"/>').join('')+'</svg>';
 if(k.sun.alt>-1)h+=at(k.sun,sunSvg(k.sun.alt<8,big?sz:84),'sky-sun');
 // på natten vandrar månen i en båge från öster till väster, i sin verkliga fas; på dagen syns den där den står
 const nq=k.sun.alt<-1&&nightFrac(new Date(),P);
 if(nq!==false)h+=at({az:-90+nq*180,alt:Math.sin(Math.PI*nq)*.8*(big?55:Math.max(pk.moon,8))},moonSvg(k.moon.frac,k.moon.waxing,sz*1.1),'sky-moon');
 else if(k.moon.alt>-1)h+=at(k.moon,moonSvg(k.moon.frac,k.moon.waxing,sz*.9),'sky-moon',k.sun.alt>0?.55:1);
 return'<div class="sky" aria-hidden="true">'+h+'</div>'}
/* Vädervyns lilla miljö: himmel, kullar, träd och gräs som följer tid på dygnet, väder och årstid.
   Hundarna står på gräset till vänster; solen och månen följer sina banor över hela rutan,
   där överkanten motsvarar dagens högsta solhöjd. */
// hur långt natten har kommit, 0 vid solnedgången och 1 vid soluppgången
function nightFrac(now,P){const d=ymd(now),a=sunTimes(d,P.lat,P.lon);if(!a)return .5;
 let set,rise;if(now>=a[1]){set=a[1];const b=sunTimes(addDays(d,1),P.lat,P.lon);rise=b?b[0]:new Date(set.getTime()+12*36e5)}
 else{rise=a[0];const b=sunTimes(addDays(d,-1),P.lat,P.lon);set=b?b[1]:new Date(rise.getTime()-12*36e5)}
 return Math.max(0,Math.min(1,(now-set)/(rise-set)))}
function wxSceneHtml(W,o){o=o||{};const P=WX_POS(),sc=wxScene(W),now=new Date(),k=SKY(now,P.lat,P.lon),pk=skyPeak(P.lat,P.lon),ph=sc.phase,mo=now.getMonth();
 const wet=/^(drizzle|rain|sleet)$/.test(sc.type),snow=sc.type==='snow',heavy=(wet||snow)&&sc.lv>=2||sc.thunder;
 const covered=sc.sky==='cloudy'||sc.sky==='fog'||heavy,grey=covered||wet||snow;
 // himlen: två toner uppifrån och ned efter klockslag, gråare när det är mulet
 let sky={night:['#0E1530','#26345E'],dusk:['#2B3768','#C9806E'],dawn:['#5B7DB8','#F4BC93'],golden:['#6E9BD6','#FFCB8E'],day:['#5FA8EC','#BFE3FF']}[ph];
 if(grey)sky=sky.map((c,i)=>mixHex(c,ph==='night'?'#2A2E3A':sc.thunder?'#4E586C':['#8C9BB0','#C9D3DF'][i],sc.sky==='fog'?.75:heavy?.7:.5));
 if(sc.sky==='fog'&&!sc.dark)sky=['#C3CAD3','#E2E6EA'];
 // marken: gräs efter årstid, snö när det har snöat eller är minusgrader med snöfall
 const snowy=snow&&(sc.lv>=2||sc.T<=0),frost=sc.T<0&&!snowy;
 let g1=snowy?'#F2F6FB':frost?'#B7C9B0':mo>=5&&mo<=7?'#7DB45A':mo>=8&&mo<=10?'#8FA650':'#7FA36A',g2=snowy?'#D3DFEC':frost?'#94AD90':shadeHex(g1,.8);
 if(wet&&!snowy){g1=shadeHex(g1,.88);g2=shadeHex(g2,.88)}
 const tone=c=>sc.dark?mixHex(c,'#1A2240',ph==='night'?.62:.45):ph==='dawn'||ph==='golden'?mixHex(c,'#F2A86E',.14):c;
 const hill=c=>tone(mixHex(c,sky[1],.45));
 const id='sc'+(++FIG_N),HT=o.h||210,H=HT-(o.g||60);   // horisonten i bildens koordinater (360 x HT)
 let s='<defs><linearGradient id="'+id+'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient>'+
  '<linearGradient id="'+id+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+tone(g1)+'"/><stop offset="1" stop-color="'+tone(g2)+'"/></linearGradient></defs>'+
  '<rect width="360" height="'+HT+'" fill="url(#'+id+'k)"/>';
 // stjärnor när det är mörkt och klart
 if(sc.dark&&!covered)s+='<g class="fx-stars" fill="#E6ECFF">'+[[24,22],[70,48],[112,16],[150,40],[196,12],[236,34],[282,20],[330,44],[48,84],[178,70],[300,76],[350,14]].slice(0,sc.sky==='partly'?5:12)
  .map(([x,y],i)=>'<circle class="tw'+(i%3?' d'+(i%3+1):'')+'" cx="'+x+'" cy="'+Math.round(y*H/150)+'" r="'+(i%4?.9:1.3)+'"/>').join('')+'</g>';
 // solen och månen: vänster öster, höger väster, överkanten är dagens högsta solhöjd
 const pos=(b,top)=>({x:Math.max(18,Math.min(342,180+b.az/90*160)),y:H-Math.max(0,Math.min(1,b.alt/Math.max(top,10)))*(H-26)});
 const nq=k.sun.alt<-1&&nightFrac(now,P);   // på natten vandrar månen i en båge från öster till väster, i sin verkliga fas
 if(nq!==false){const f=nq,z=64,x=125+f*200,y=H-30-(H-80)*Math.sin(Math.PI*f);
  s+='<svg class="sc-moon" x="'+(x-z/2).toFixed(1)+'" y="'+(y-z/2).toFixed(1)+'" width="'+z+'" height="'+z+'" opacity="'+(covered?.35:1)+'" overflow="visible">'+moonSvg(k.moon.frac,k.moon.waxing,z)+'</svg>'}
 else if(k.moon.alt>-1){const q=pos(k.moon,Math.max(pk.sun,pk.moon*.8)),z=40;s+='<svg x="'+(q.x-z/2).toFixed(1)+'" y="'+(q.y-z/2).toFixed(1)+'" width="'+z+'" height="'+z+'" opacity="'+((covered?.35:1)*(k.sun.alt>0?.6:1))+'" overflow="visible">'+moonSvg(k.moon.frac,k.moon.waxing,z).replace(/^<svg /,'<svg width="40" height="40" ')+'</svg>'}
 if(k.sun.alt>-1){const q=pos(k.sun,pk.sun),z=64;s+='<svg class="sc-sun" x="'+(q.x-z/2).toFixed(1)+'" y="'+(q.y-z/2).toFixed(1)+'" width="'+z+'" height="'+z+'" opacity="'+(covered?.4:1)+'" overflow="visible">'+sunSvg(k.sun.alt<8,z)+'</svg>'}
 // kullar och träd i fjärran, sedan gräset hundarna står på
 s+='<path d="M0 '+(H-6)+' Q60 '+(H-34)+' 130 '+(H-12)+' T260 '+(H-20)+' T360 '+(H-10)+' V'+HT+' H0Z" fill="'+hill(g2)+'"/>';
 const leaf=snowy?'#E9EEF5':mo>=8&&mo<=10?['#D9894A','#C9694F','#E0A24A']:mo<=2||mo===11?null:['#5E9440','#6FA34C','#4F8A3C'];
 const tree=(x,y,sz,i)=>{const t='<rect x="'+(x-1.6*sz)+'" y="'+(y-10*sz)+'" width="'+(3.2*sz)+'" height="'+(10*sz)+'" rx="'+sz+'" fill="'+tone(shadeHex('#6B4A35',.9))+'"/>';
  const c=Array.isArray(leaf)?leaf[i%3]:leaf;
  return t+(c?'<circle cx="'+x+'" cy="'+(y-14*sz)+'" r="'+(9*sz)+'" fill="'+tone(c)+'"/><circle cx="'+(x+3*sz)+'" cy="'+(y-12*sz)+'" r="'+(6.5*sz)+'" fill="'+tone(shadow(c))+'" opacity=".45"/>':
   '<path d="M'+x+' '+(y-10*sz)+' l-5 -8 M'+x+' '+(y-12*sz)+' l5 -7 M'+x+' '+(y-9*sz)+' l7 -3" stroke="'+tone('#6B4A35')+'" stroke-width="'+(1.4*sz)+'" stroke-linecap="round"/>')};
 s+=tree(244,H-14,1.1,0)+tree(276,H-17,.85,1)+tree(318,H-11,1.25,2)+tree(36,H-2,.8,1);
 if(sc.sky==='fog')s+='<rect y="'+(H-46)+'" width="360" height="64" fill="'+(sc.dark?'#8A93A8':'#FFFFFF')+'" opacity=".45"/>';   // dimman lägger sig över kullarna
 s+='<path d="M0 '+(H+12)+' Q90 '+(H-2)+' 190 '+(H+8)+' T360 '+(H+4)+' V'+HT+' H0Z" fill="url(#'+id+'g)"/>';
 // grästuvor längs kanten
 if(!snowy)s+='<g fill="none" stroke="'+tone(shadeHex(g1,.72))+'" stroke-width="1.4" stroke-linecap="round">'+[14,58,104,150,206,248,296,338].map((x,i)=>{const y=H+10-Math.sin(x/58)*4;
  return'<path d="M'+x+' '+y+' l-2 -6 M'+(x+3)+' '+y+' l0 -8 M'+(x+6)+' '+y+' l2 -5"/>'}).join('')+'</g>';
 // vädret över hela miljön (moln och nederbörd) och hundarna till vänster
 const fx=figSvg(sc,{bare:1,nodogs:1,seed:3});
 return'<div class="wx-scene'+(o.cls?' '+o.cls:'')+(sc.sky==='fog'&&!sc.dark?' sc-light':'')+'" style="color:'+(sc.dark?'#E6ECFF':'#3A4458')+'"><svg class="sc-bg" viewBox="0 0 360 '+HT+'" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+s+'</svg>'+
  '<div class="sc-fx" aria-hidden="true">'+fx+'</div>'+
  '<button class="fig-box sc-dogs" data-act="wxVar" aria-label="'+esc(sc.label)+'. Visa en annan bild av hundarna">'+figSvg(sc,{bare:1})+'</button>'+(o.inner||'')+'</div>'}
function figSvg(sc,o){o=o||{};const id='fg'+(++FIG_N),ph=sc.phase,dark=sc.dark,warmL=ph==='dawn'||ph==='golden';
 const wet=/^(drizzle|rain|sleet)$/.test(sc.type),snow=sc.type==='snow',sleet=sc.type==='sleet',lv=sc.lv;
 const sunC=warmL?'#FFB877':'#FFE7A3',sunD=warmL?'#FF9F5A':'#FFD666';
 let s='<defs><radialGradient id="'+id+'g"><stop offset="0" stop-color="'+sunC+'" stop-opacity=".7"/><stop offset="1" stop-color="'+sunC+'" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="'+id+'m"><stop offset="0" stop-color="#DCE6FF" stop-opacity=".55"/><stop offset="1" stop-color="#DCE6FF" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="'+id+'o"><stop offset="0" stop-color="#FF9F5A" stop-opacity=".45"/><stop offset="1" stop-color="#FF9F5A" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="'+id+'ah"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="'+id+'bh"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="'+id+'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC4F0" stop-opacity="0"/><stop offset="1" stop-color="#8FC4F0" stop-opacity=".9"/></linearGradient>'+
  '<radialGradient id="'+id+'s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
  '<filter id="'+id+'n"><feColorMatrix type="matrix" values=".66 .04 0 0 .02  .02 .7 .04 0 .03  0 .06 .9 0 .07  0 0 0 1 0"/></filter>'+
  '<filter id="'+id+'w"><feColorMatrix type="matrix" values="1.04 .04 0 0 .03  .02 .94 0 0 .01  0 0 .82 0 0  0 0 0 1 0"/></filter>'+
  '<linearGradient id="'+id+'d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFE"/><stop offset="1" stop-color="#C9D8EA"/></linearGradient>'+
  ['a','b'].map(k=>'<clipPath id="'+id+k+'"><path d="M77 -20 Q70 20 80 46 Q86 60 78 76 Q71 92 78 112 Q80 124 74 150 H170 V-20Z"/></clipPath>').join('')+'</defs>';
 // moln: mjuka, överlappande ellipser i två toner
 const cloud=(x,y,sc,c1,cls)=>'<g class="fx-cloud'+(cls?' '+cls:'')+'" transform="translate('+x+' '+y+') scale('+sc+')"><ellipse cx="24" cy="12" rx="24" ry="8" fill="'+c1+'"/><circle cx="16" cy="8" r="8" fill="'+c1+'"/><circle cx="28" cy="5" r="10" fill="'+c1+'"/><ellipse cx="26" cy="15" rx="20" ry="4" fill="'+shadow(c1)+'" opacity=".55"/></g>';
 // 1. ljuset: gryningens och skymningens sken, solen längs sin bana eller månen
 const covered=sc.sky==='cloudy'||sc.sky==='fog'||(wet&&lv>=2)||sc.thunder;
 if(!o.bare&&(ph==='dawn'||ph==='dusk'||(ph==='golden'&&!covered))){const gx=ph==='dawn'?14:156;s+='<circle class="fx-glow" cx="'+gx+'" cy="44" r="38" fill="url(#'+id+'o)" opacity="'+(covered?.5:1)+'"/>'}
 if(sc.sunUp&&!o.bare){const sx=16+sc.f*138,sy=36-Math.sin(sc.f*Math.PI)*24;
  if(!(wet||snow||sc.thunder)||!covered)s+=covered?'<g class="fx-sun dim"><circle cx="'+sx+'" cy="'+sy+'" r="16" fill="url(#'+id+'g)" opacity=".6"/><circle cx="'+sx+'" cy="'+sy+'" r="7.5" fill="#F4F1E4" opacity=".55"/></g>'
   :'<g class="fx-sun"><circle cx="'+sx+'" cy="'+sy+'" r="28" fill="url(#'+id+'g)"/><circle cx="'+sx+'" cy="'+sy+'" r="18" fill="'+sunC+'" opacity=".18"/><circle cx="'+sx+'" cy="'+sy+'" r="13" fill="'+sunC+'" opacity=".22"/><circle cx="'+sx+'" cy="'+sy+'" r="8.5" fill="'+sunD+'"/></g>'}
 if(dark&&!covered&&!o.bare){const mx=150;
  s+='<g class="fx-moon"><circle cx="'+mx+'" cy="18" r="22" fill="url(#'+id+'m)"/><circle cx="'+mx+'" cy="18" r="14" fill="#DCE6FF" opacity=".12"/><circle cx="'+mx+'" cy="18" r="7.5" fill="#E6ECFB" stroke="#AFBCE2" stroke-width=".8"/><circle cx="'+(mx+2.5)+'" cy="16" r="7" fill="#C7D2F2" opacity=".35"/></g>';
  const st=[[10,12,1,''],[132,6,.8,' d3'],[24,26,.8,' d2'],[88,4,.7,''],[60,10,.6,' d2']].slice(0,sc.sky==='partly'?2:ph==='dusk'?3:5);
  s+='<g class="fx-stars" fill="#E6ECFF">'+st.map(([x,y,r,c])=>'<circle class="tw'+c+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>').join('')+'</g>'}
 // 2. molnen: antalet följer himlen, tonen följer nederbörden och ljuset
 const sky=wet||snow||sc.thunder?(/^(clear|fair)$/.test(sc.sky)?'partly':sc.sky):sc.sky;
 let base=sc.thunder?'#4C5672':wet?['#A3AFC2','#7E8BA3','#5F6B84'][lv-1]:snow?['#CBD6E3','#B9C6D7','#A2B1C6'][lv-1]:{fair:'#EEF3F8',partly:'#DCE4EE',cloudy:'#C3CFDE',fog:'#DCE4EE'}[sky];
 if(base){base=dark?mixHex(base,'#2A3350',.5):warmL?mixHex(base,'#F2B48A',.22):base;
  const L={fair:[[4,12,.55]],partly:[[4,12,.6],[122,28,.45,'d2']],cloudy:[[120,0,.85],[2,6,.7,'d2']],fog:[[124,4,.75],[2,16,.55,'d2']]}[sky].slice();
  if(sky==='cloudy'&&((wet||snow)&&lv>=2||sc.thunder))L.push([58,-9,.62,'d3']);
  s+=L.map(([x,y,k,c],i)=>cloud(x,y,k,i?shadeHex(base,.94):base,c)).join('')}
 if(sc.thunder)s+='<g class="fx-bolt"><circle cx="140" cy="34" r="12" fill="#FFF3B0" opacity=".25"/><path d="M142 22l-6 11h5l-4 9 10-13h-5l4-7z" fill="#FFE27A"/></g>'+
  (lv>=3?'<g class="fx-bolt d2"><circle cx="26" cy="38" r="10" fill="#FFF3B0" opacity=".25"/><path d="M28 27l-5 9h4l-3 8 8-11h-4l3-6z" fill="#FFE27A"/></g>':'');
 if(sc.sky==='fog')s+='<g class="fx-fog" stroke="currentColor" stroke-linecap="round" opacity=".14"><line x1="0" y1="98" x2="34" y2="98" stroke-width="5"/><line class="d2" x1="136" y1="108" x2="170" y2="108" stroke-width="6"/><line x1="6" y1="118" x2="28" y2="118" stroke-width="4"/><line class="d2" x1="120" y1="70" x2="166" y2="70" stroke-width="5"/></g>';
 // 3. värmedaller i stark sol
 if(sc.T>=24&&sc.sunUp&&!covered&&!wet)s+='<g class="fx-heat" stroke="'+sunD+'" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5">'+[[14,0],[152,.8],[34,1.6],[134,2.3]].map(([x,d])=>'<path d="M'+x+' 122 q3 -4 0 -8 t0 -8" style="animation-delay:-'+d+'s"/>').join('')+'</g>';
 // 4. marken: skugga bort från solen, snö, frost eller vattenpölar
 if(!o.nodogs)s+='<ellipse cx="'+(sc.sunUp&&!covered?85+(.5-sc.f)*24:85)+'" cy="125" rx="62" ry="5" fill="url(#'+id+'s)"/>';
 if(snow&&(lv>=2||sc.T<=0))s+='<path d="M0 127 Q30 114 70 118 Q110 113 170 125 V131 H0Z" fill="url(#'+id+'d)"/><path d="M8 124 Q40 117 70 119" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>';
 else if(sc.T<0)s+='<path d="M10 126 Q85 119 160 126" stroke="#BFD6F2" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>';
 if((wet&&sc.type!=='drizzle'||sc.thunder)&&lv>=2&&sc.T>0)s+='<g class="fx-pud"><ellipse cx="20" cy="127" rx="15" ry="2.4" fill="#8FC4F0" opacity=".35"/><ellipse cx="152" cy="128" rx="13" ry="2.2" fill="#8FC4F0" opacity=".35"/>'+
  [[20,127,0],[152,128,.7],[26,127,1.3]].map(([x,y,d])=>'<ellipse class="rip" cx="'+x+'" cy="'+y+'" rx="5" ry="1.2" fill="none" stroke="#8FC4F0" stroke-width=".8" style="animation-delay:-'+d+'s"/>').join('')+'</g>';
 if(sc.T<0)s+='<g class="fx-frost" fill="#BFD6F2">'+[[16,40],[34,22],[132,46],[160,58],[10,78],[156,96],[24,104]].map(([x,y],k)=>'<path class="tw'+(k%3?' d'+(k%3+1):'')+'" d="M'+x+' '+(y-4)+' L'+(x+1)+' '+(y-1)+' L'+(x+4)+' '+y+' L'+(x+1)+' '+(y+1)+' L'+x+' '+(y+4)+' L'+(x-1)+' '+(y+1)+' L'+(x-4)+' '+y+' L'+(x-1)+' '+(y-1)+'Z"/>').join('')+'</g>';
 // 5. hundarna. Varianten listar hundarna från vänster: a/b = fawn/svart sittande, A/B = liggande och sovande
 const v=o.variant||figVariant(sc),toks=v.split(''),oo={fit:sc.fit,night:dark};
 const one=(t,pos)=>{const isA=t.toLowerCase()==='a',lie=t===t.toUpperCase(),g=dogSvg(DOGS[isA?0:1],oo,id+(isA?'a':'b'),lie?'lie':'sit');
  let tr;
  if(pos==='c')tr=lie?'translate(26 4)':(isA?'translate(29 6) scale(.95)':'translate(25 0)');
  else if(lie)tr=pos==='l'?'translate(-8 '+(isA?14:8)+') scale('+(isA?.8:.85)+')':'translate('+(isA?82:76)+' '+(isA?14:8)+') scale('+(isA?.8:.85)+')';
  else tr=pos==='l'?(isA?'translate(4 6) scale(.9)':'translate(4 0)'):(isA?'translate(64 6) scale(.9)':'translate(58 0)');
  return'<g class="dog-'+(isA?'a':'b')+'" transform="'+tr+'">'+g+'</g>'};
 const dogs=toks.length===1?one(toks[0],'c'):one(toks[0],'l')+one(toks[1],'r');
 if(!o.nodogs)s+=dark?'<g filter="url(#'+id+'n)">'+dogs+'</g>':warmL?'<g filter="url(#'+id+'w)">'+dogs+'</g>':dogs;
 // 6. nederbörden: tätheten och farten följer styrkan, lutningen följer vinden
 const rnd=k=>{const x=Math.sin(k*127.1+lv*7.3+(o.seed||0))*43758.5453;return x-Math.floor(x)};
 const sl=sc.wl?sc.wl*.22*sc.dir:-.06,dx=Math.round(sl*124);
 const fall=(n,fn)=>{let r='';const x0=Math.min(0,-sl*120),x1=170+Math.max(0,-sl*120);for(let k=0;k<n;k++)r+=fn(x0+(k+.2+rnd(k)*.6)*(x1-x0)/n,k);return r};
 if(wet){const drz=sc.type==='drizzle',n=drz?9:sleet?[6,8,11][lv-1]:[10,16,24][lv-1],len=drz?5:[9,12,16][lv-1],dur=(drz?1.5:[1.05,.8,.58][lv-1])*(sleet?1.15:1);
  s+='<g class="fx-rain" stroke="url(#'+id+'r)" stroke-width="'+(drz?.9:lv>=3?1.3:1.1)+'" stroke-linecap="round">'+fall(n,(x,k)=>{const y=6+rnd(k+50)*14;
   return'<line x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+(x+sl*len).toFixed(1)+'" y2="'+(y+len).toFixed(1)+'" style="--dx:'+dx+'px;animation-duration:'+dur.toFixed(2)+'s;animation-delay:-'+(rnd(k+9)*dur).toFixed(2)+'s"/>'})+'</g>'}
 if(snow||sleet){const n=sleet?[4,6,8][lv-1]:[8,14,22][lv-1],dur=(sleet?2.4:[6,4.6,3.4][lv-1])/(1+sc.wl*.25);
  s+='<g class="fx-snow" fill="#FFFFFF" stroke="#9DB4D3" stroke-width=".6">'+fall(n,(x,k)=>'<circle cx="'+x.toFixed(1)+'" cy="'+(6+rnd(k+30)*12).toFixed(1)+'" r="'+(sleet?1.3+rnd(k)*.8:1.4+rnd(k+3)*1.5).toFixed(1)+'" style="--dx:'+dx+'px;animation-duration:'+dur.toFixed(2)+'s;animation-delay:-'+(rnd(k+17)*dur).toFixed(2)+'s"/>')+'</g>';
  if(snow&&lv>=2)s+='<g class="fx-flakes" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round">'+[[40,.4],[128,2.1],[86,3.2]].map(([x,d])=>'<g style="--dx:'+dx+'px;animation-delay:-'+d+'s"><path d="M'+x+' 6v10M'+(x-4.3)+' 8.5l8.6 5M'+(x-4.3)+' 13.5l8.6-5" stroke="#9DB4D3" stroke-width="2.4"/><path d="M'+x+' 6v10M'+(x-4.3)+' 8.5l8.6 5M'+(x-4.3)+' 13.5l8.6-5"/></g>').join('')+'</g>'}
 // 7. vinden visas som text i vädervyn i stället för som animation; den lutar bara regnet och snön
 return'<svg class="fig k-'+sc.tc+' w'+sc.wl+(sc.sleep?' zz':'')+'" viewBox="0 0 170 130" role="img" aria-label="'+esc(o.label||sc.label)+'">'+s+'</svg>'}

const hm=m=>pad(Math.floor(m/60))+'.'+pad(m%60);
// nedräkning för dagens händelser: "till 16.00" när den pågår, "om 2 h 5 min" för nästa som börjar
// läget för dagens händelser just nu: passerad, pågår (med andel och tid kvar), nästa eller senare
function evStates(evs){const n=new Date(),mins=n.getHours()*60+n.getMinutes(),out=new Map();
 const at=(s,re)=>{const m=re.exec(s||'');return m?Number(m[1])*60+Number(m[2]):null};
 const L=evs.map(e=>({e,s:at(e.time,/^(\d{1,2})[.:](\d{2})/),en:at(e.time,/[–-]\s*(\d{1,2})[.:](\d{2})/)})).filter(x=>x.s!=null);
 const nx=L.filter(x=>x.s>mins).sort((a,b)=>a.s-b.s)[0];
 L.forEach(x=>{const end=x.en!=null?x.en:x.s;
  if(x.s<=mins&&end>mins)out.set(x.e,{st:'now',s:x.s,en:end,p:(mins-x.s)/(end-x.s),left:durTxt(end-mins)});
  else if(end<=mins)out.set(x.e,{st:'past',s:x.s,en:end});
  else out.set(x.e,{st:x===nx?'next':'later',s:x.s,en:end,inn:durTxt(x.s-mins)})});
 return out}
const durTxt=m=>m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'');
// sol- och månbanans horisont: mitt i namnsdagsraden (annars faktaraden), aldrig under hundarnas fötter
function placeSky(){const h=document.querySelector('.hero');if(!h)return;
 const chips=[...h.querySelectorAll('.hero-facts span')],c=chips.find(x=>/^Namnsdag/.test(x.textContent))||chips[Math.floor((chips.length-1)/2)],fig=h.querySelector('.fig-box');
 if(!c)return;const top=h.getBoundingClientRect().top,r=c.getBoundingClientRect();let y=r.top+r.height/2-top;
 if(fig){const f=fig.getBoundingClientRect();y=Math.min(y,f.bottom-top-6)}
 h.style.setProperty('--hz',Math.round(y)+'px')}
window.addEventListener('resize',placeSky);
function heroHtml(){const n=new Date(),t=today(),dy=EXT.day&&EXT.day.date===t?EXT.day:null,hh=n.getHours(),W=wxModel(),P=WX_POS();
 const greet=hh<5?'God natt':hh<10?'God morgon':hh<17?'Hej':hh<22?'God kväll':'God natt';
 const sun=sunTimes(t,P.lat,P.lon);
 let wx='';
 if(W){const[ic,tx]=symInfo(W.now.s),d0=W.days[0]||{},F=wxToday(W);
  wx='<button class="hero-wx" data-act="nav" data-id="vader" aria-label="Väder: '+esc(tx)+', '+deg(W.now.T)+'. Öppna vädret">'+
   '<div class="wx-now"><span class="wx-ic" aria-hidden="true">'+ic+'</span><span class="wx-t num">'+deg(W.now.T)+'</span></div>'+
   '<div class="fn">'+esc(tx)+'</div><div class="fn num">H:'+deg(d0.max)+' L:'+deg(d0.min)+'</div>'+
   '<div class="fig-box" aria-hidden="true">'+figSvg(wxScene(W),{bare:1})+'</div><div class="fig-tip">'+esc((F.when==='i morgon'?'I morgon: ':'')+F.tip)+'</div></button>'}
 const facts=['Vecka '+isoWeek(n)];
 if(dy&&dy.holiday)facts.push(dy.holiday);else if(dy&&dy.flag)facts.push('Flaggdag: '+dy.flag);
 if(dy&&dy.names.length)facts.push('Namnsdag: '+dy.names.join(', '));
 if(sun)facts.push('Sol '+hhmm(sun[0])+'–'+hhmm(sun[1]));
 return'<section class="hero'+(wx?' has-wx':'')+'">'+(W?skyHtml(W):'')+'<div class="hero-l"><div class="clock num" id="clock">'+pad(hh)+':'+pad(n.getMinutes())+'</div><div class="hero-date">'+esc(cap(dayHead(t)))+'</div>'+
  '<div class="hero-greet">'+greet+(S.me?', '+esc(S.me):'')+'!</div><div class="hero-facts">'+facts.map(f=>'<span>'+esc(f)+'</span>').join('')+'</div></div>'+wx+'</section>'}
async function loadExt(){const t=today();let changed=await loadWx();
 if(!EXT.day||EXT.day.date!==t){try{const[y,mo,d]=t.split('-');
  const r=await fetch('https://sholiday.faboul.se/dagar/v2.1/'+y+'/'+mo+'/'+d);const j=await r.json(),x=j.dagar&&j.dagar[0];
  if(x){EXT.day={date:t,names:x.namnsdag||[],holiday:x.helgdag||'',flag:x.flaggdag||''};changed=true}}catch(e){}}
 if(changed){lsSet('ext',JSON.stringify(EXT));if(S.view==='oversikt'||S.view==='vader')render()}}
loadExt();setInterval(loadExt,10*60000);

// Vilka hundar som visas: växlar var tredje timme, oftast båda
// a/b = fawn/svart sittande, A/B = liggande och sovande; ordningen är från vänster
const figVariants=sleep=>sleep?['AB','AB','BA','A','B']:['ab','ab','ab','ba','ba','a','a','b','b'];
function figVariant(sc){const L=figVariants(sc.sleep);if(S.wxVar&&L.includes(S.wxVar))return S.wxVar;const n=new Date(),key=today()+'|'+Math.floor(n.getHours()/3)+'|'+(sc.sleep?1:0);let h=0;for(const c of key)h=(h*31+c.charCodeAt(0))>>>0;return L[h%L.length]}
// Scenen ritas om när ljuset eller vädret ändras, till exempel vid solnedgången, även om prognosen inte hämtats på nytt
let SCENE_KEY='';
const sceneKey=()=>{const W=wxModel();if(!W)return'';const c=wxScene(W);return[c.phase,c.sky,c.type,c.lv,c.thunder,c.tc,c.wl,Math.floor(Date.now()/6e5)].join('|')};   // himlakropparna flyttas var tionde minut
setInterval(()=>{if(document.visibilityState!=='visible'||(S.view!=='oversikt'&&S.view!=='vader')||S.sheet)return;const k=sceneKey();if(k&&SCENE_KEY&&k!==SCENE_KEY)render();SCENE_KEY=k},60000);
/* Vädersidan, i stil med Apples Väder */
const DAYS3=['sön','mån','tis','ons','tor','fre','lör'];
// Vindstyrkan med SMHI:s benämningar, till exempel "Måttlig sydvästlig vind, 6 m/s"
function windText(x){const w=x.w||0;if(w<.3)return'Lugnt';
 const k=w<3.4?'Svag':w<8?'Måttlig':w<13.9?'Frisk':w<24.5?'Hård':w<32.7?'Storm':'Orkan';
 return(k==='Storm'||k==='Orkan'?k+', '+windDir(x.wd)+' vind':k+' '+windDir(x.wd)+' vind')+', '+Math.round(w)+'\u00a0m/s'}
function windDir(d){return['nordlig','nordostlig','ostlig','sydostlig','sydlig','sydvästlig','västlig','nordvästlig'][Math.round(((d||0)%360)/45)%8]}
function feels(T,w){return(T<=10&&w>1.3)?13.12+0.6215*T-11.37*Math.pow(w*3.6,0.16)+0.3965*T*Math.pow(w*3.6,0.16):T}
V.vader=function(){const W=wxModel(),P=WX_POS();
 let h='<div class="rcp-top"><button class="back" data-act="nav" data-id="oversikt">'+I.back+'Översikt</button></div>';
 NB.title='Väder';
 if(!W)return h+'<header class="head"><h1 class="lt" id="lt">Väder</h1></header>'+group(emptyCell('Prognosen kunde inte hämtas just nu.'))+'<div class="block"><button class="btn-tint" style="width:100%" data-act="wxRefresh">Försök igen</button></div>';
 const[ic,tx]=symInfo(W.now.s),d0=W.days[0],F=wxToday(W),sun=sunTimes(today(),P.lat,P.lon);
 // vädret ligger i miljöbilden: ort och temperatur uppe till vänster, väderläget uppe till höger, tips och vind i en remsa nederst
 h+=wxSceneHtml(W,{h:330,g:100,inner:'<div class="sc-head"><div class="wx-place">'+esc(P.name)+'</div><div class="wx-big num" id="lt">'+deg(W.now.T)+'</div><div><div class="wx-cond">'+esc(tx)+'</div><div class="wx-hl num">H:'+deg(d0.max)+'  L:'+deg(d0.min)+'</div></div></div>'+
  '<div class="sc-bar"><div><b>'+esc(capS(F.when))+'</b><span>'+esc(F.tip)+'</span></div><div><b>Vind</b><span>'+esc(windText(W.now))+'</span></div></div>'});
 // Timmar
 h+='<div class="group wx-card"><div class="wx-cap">'+I.clock+'Kommande timmar</div><div class="hours" role="list">'+W.hours.slice(0,25).map((x,k)=>{const[ii]=symInfo(x.s);
  return'<div class="hr" role="listitem"><span class="fn">'+(k?pad(x.d.getHours()):'Nu')+'</span><span class="hi" aria-hidden="true">'+ii+'</span><b class="num">'+deg(x.T)+'</b><span class="hp num">'+(x.pr>=0.1?mm(x.pr).replace(' mm',''):'')+'</span></div>'}).join('')+'</div></div>';
 // Dagar
 const lo=Math.min(...W.days.map(x=>x.min)),hi=Math.max(...W.days.map(x=>x.max)),span=Math.max(1,hi-lo);
 h+='<div class="group wx-card"><div class="wx-cap">'+I.cal+W.days.length+'-dagarsprognos</div>'+W.days.map((x,k)=>{const[ii]=symInfo(x.sym),l=(x.min-lo)/span*100,r=(x.max-lo)/span*100;
  return'<div class="day-row"><span class="dn">'+(k?capS(DAYS3[parse(x.date).getDay()]):'Idag')+'</span><span class="di" aria-hidden="true">'+ii+'</span><span class="dp num">'+(x.pr>=0.2?mm(x.pr):'')+'</span><span class="dmin num">'+deg(x.min)+'</span><span class="range" aria-hidden="true"><i style="left:'+l+'%;right:'+(100-r)+'%;background:'+tempGrad(x.min,x.max)+'"></i>'+(k===0?'<b style="left:'+((W.now.T-lo)/span*100)+'%"></b>':'')+'</span><span class="dmax num">'+deg(x.max)+'</span></div>'}).join('')+'</div>';
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
 let h=head('Ekonomi',{sub:'Fasta utgifter och fördelning',tools:'<button class="ib plus" data-act="ekoCost" data-list="shared" aria-label="Ny utgift">'+I.plus+'</button>'});
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

/* ---------- födelsedagar ----------
   Listan står som JSON i fliken Inställningar (raden fodelsedagar) och skrivs av kalenderrutinen:
   [{"namn":"Leah","datum":"10-15","ar":2014}, …]. ar saknas när födelseåret inte står i kalendern. */
const MON3=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
function bdays(){const t=today(),ty=Number(t.slice(0,4)),seen=new Set();
 return parseJ(settings().fodelsedagar,[]).map(x=>{const m=/^(\d{1,2})-(\d{1,2})$/.exec(String(x&&x.datum||''));if(!m||!x.namn)return null;
  const mo=Number(m[1])-1,dd=Number(m[2]),k=x.namn+'|'+mo+'|'+dd;if(mo<0||mo>11||seen.has(k))return null;seen.add(k);
  let y=ty;const at=yy=>ymd(new Date(yy,mo,dd));if(at(y)<t)y++;const next=at(y),yr=Number(x.ar)||null;
  return{name:String(x.namn),mo,dd,yr,next,days:Math.round((parse(next)-parse(t))/864e5),age:yr?y-yr:null,passed:y>ty}}).filter(Boolean)
  .sort((a,b)=>a.mo-b.mo||a.dd-b.dd||a.name.localeCompare(b.name,'sv'))}
const bdWhen=b=>b.days===0?'idag':b.days===1?'imorgon':b.days<7?'på '+DAYS[parse(b.next).getDay()]:b.days<45?'om '+b.days+' dagar':'om '+Math.round(b.days/30.4)+' mån';
const bdTurns=b=>b.age!=null?'fyller '+b.age:'fyller år';
const bdNext=L=>L.slice().sort((a,b)=>a.days-b.days);
function bdRow(b,o){o=o||{};return'<div class="cell bd'+(b.days===0?' today':'')+(b.passed&&o.dim?' past':'')+'"><span class="bd-date num"><b>'+b.dd+'</b><small>'+MON3[b.mo]+'</small></span>'+
 '<div class="grow"><div>'+esc(b.name)+'</div><div class="sub">'+esc(cap(bdTurns(b)))+(b.yr?' · född '+b.yr:'')+'</div></div><span class="bd-when'+(b.days<14?' soon':'')+'">'+esc(bdWhen(b))+'</span></div>'}
function bdWidget(){const L=bdNext(bdays()).slice(0,3);if(!L.length)return'';
 return widget('fod','w2',I.cake,'Födelsedagar','',
  '<div class="wl">'+L.map(b=>'<div class="cell bdw"><span class="grow">'+esc(b.name)+' <span class="muted">'+esc(bdTurns(b))+'</span></span><span class="bd-when'+(b.days<14?' soon':'')+'">'+esc(bdWhen(b))+'</span></div>').join('')+'</div>')}

// Årshjul: tolv lika stora månadssegment, januari överst, medurs. Varje födelsedag är en prick på sin dag.
function bdWheel(L,sel){const C=180,R0=102,R1=174,t=parse(today());
 const ang=(mo,day)=>{const n=new Date(2001,mo+1,0).getDate();return(mo+(day-.5)/n)/12*2*Math.PI-Math.PI/2};
 const pt=(r,a)=>[(C+r*Math.cos(a)).toFixed(1),(C+r*Math.sin(a)).toFixed(1)];
 let s='<svg class="bd-wheel" viewBox="0 0 360 360" role="group" aria-label="Årshjul med födelsedagar">';
 for(let m=0;m<12;m++){const g=.012,a0=m/12*2*Math.PI-Math.PI/2+g,a1=(m+1)/12*2*Math.PI-Math.PI/2-g,
   [x0,y0]=pt(R1,a0),[x1,y1]=pt(R1,a1),[x2,y2]=pt(R0,a1),[x3,y3]=pt(R0,a0),n=L.filter(b=>b.mo===m).length,
   cls='seg'+(m===sel?' on':'')+(m===t.getMonth()?' now':'')+(n?' has':'');
  s+='<path class="'+cls+'" data-act="fodMon" data-id="'+m+'" d="M'+x0+' '+y0+'A'+R1+' '+R1+' 0 0 1 '+x1+' '+y1+'L'+x2+' '+y2+'A'+R0+' '+R0+' 0 0 0 '+x3+' '+y3+'Z"><title>'+cap(MON[m])+': '+n+'</title></path>';
  const[lx,ly]=pt(R0+14,(m+.5)/12*2*Math.PI-Math.PI/2);
  s+='<text class="ml'+(m===sel?' on':'')+'" x="'+lx+'" y="'+ly+'" text-anchor="middle" dominant-baseline="central">'+MON3[m]+'</text>'}
 const nx=bdNext(L)[0];
 // Födelsedagar som ligger nära varandra läggs i en inre bana så att prickarna inte täcker varandra
 const lanes=[];L.forEach(b=>{const a=ang(b.mo,b.dd);let k=0;while(lanes[k]!=null&&a-lanes[k]<.09)k++;lanes[k]=a;
  const[x,y]=pt(R1-14-k*11,a);s+='<circle class="dot'+(b===nx?' next':'')+'" cx="'+x+'" cy="'+y+'" r="'+(b===nx?6:4.5)+'"/>'});
 const ta=ang(t.getMonth(),t.getDate()),[hx0,hy0]=pt(R1+3,ta),[hx1,hy1]=pt(R1+13,ta);
 s+='<line class="hand" x1="'+hx0+'" y1="'+hy0+'" x2="'+hx1+'" y2="'+hy1+'"/><circle class="hand-dot" cx="'+hx1+'" cy="'+hy1+'" r="3"/>';
 return s+'</svg>'}

V.fod=function(){const L=bdays(),t=parse(today()),mode=S.fodMode||'hjul';
 let h='<div class="rcp-top"><button class="back" data-act="nav" data-id="oversikt">'+I.back+'Översikt</button></div>';
 h+=head('Födelsedagar',{sub:L.length?L.length+' personer':''});
 if(!L.length)return h+group(emptyCell('Inga födelsedagar ännu. Listan fylls i när kalenderrutinen körs på söndag.'));
 h+=segc('Visning','fodMode',[['hjul','Årshjul'],['manad','Månader'],['lista','Tidslinje']],mode);
 const nx=bdNext(L),first=nx[0],same=nx.filter(b=>b.days===first.days);
 if(mode==='hjul'){const sel=S.fodMon!=null?S.fodMon:t.getMonth(),ML=L.filter(b=>b.mo===sel);
  h+='<div class="bd-wrap">'+bdWheel(L,sel)+'<div class="bd-center"><div class="eyebrow">'+(first.days===0?'Idag':'Nästa')+'</div><div class="bd-cn">'+esc(same.map(b=>b.name).join(' & '))+'</div><div class="sub">'+esc(cap(same.length===1?bdTurns(first):'fyller år')+(first.days?' '+bdWhen(first):''))+'</div></div></div>';
  h+=sh(cap(MON[sel]),ML.length?ML.length+(ML.length===1?' födelsedag':' födelsedagar'):'')+group(ML.length?ML.map(b=>bdRow(b)).join(''):emptyCell('Ingen fyller år i '+MON[sel]+'.'));
  h+='<div class="foot">Tryck på en månad i hjulet för att se vilka som fyller år då.</div>'}
 else if(mode==='manad'){h+='<div class="bd-grid">';
  for(let m=0;m<12;m++){const ML=L.filter(b=>b.mo===m),cur=m===t.getMonth();
   h+='<section class="bd-mon'+(cur?' now':'')+(!ML.length?' empty':'')+'"><div class="bd-mh"><span>'+cap(MON[m])+'</span>'+(ML.length?'<span class="n">'+ML.length+'</span>':'')+'</div>'+
    (ML.length?ML.map(b=>'<div class="bd-li'+(b.passed?' past':'')+(b===first?' next':'')+'"><span class="d num">'+b.dd+'</span><span class="nm">'+esc(b.name)+'</span>'+(b.age!=null?'<span class="a num">'+b.age+'</span>':'')+'</div>').join(''):'<div class="bd-none">–</div>')+'</section>'}
  h+='</div><div class="foot">Siffran efter namnet är åldern personen fyller. Grått har redan varit i år.</div>'}
 else{h+='<section class="bd-hero"><div class="eyebrow">'+(first.days===0?'Idag':'Nästa födelsedag')+'</div><div class="bd-hn">'+esc(same.map(b=>b.name).join(' & '))+'</div><div class="bd-hs">'+esc(cap(same.length===1?bdTurns(first):'fyller år'))+' '+esc(bdWhen(first))+'</div><div class="sub">'+esc(dateLong(first.next))+'</div></section>';
  // Årsremsa: tolv månader från och med den här, en prick per födelsedag
  h+='<div class="bd-strip">';for(let i=0;i<12;i++){const m=(t.getMonth()+i)%12,ML=L.filter(b=>b.mo===m);
   h+='<div class="bs-col'+(i===0?' now':'')+'"><div class="bs-dots">'+ML.map(b=>'<i'+(b===first?' class="next"':'')+'></i>').join('')+'</div><span>'+MON3[m].charAt(0).toUpperCase()+'</span></div>'}
  h+='</div>';
  let lastM=-1;const rows=[];nx.forEach(b=>{if(b.mo!==lastM){if(rows.length)h+=group(rows.splice(0).join(''));h+=sh(cap(MON[b.mo])+(parse(b.next).getFullYear()!==t.getFullYear()?' '+parse(b.next).getFullYear():''));lastM=b.mo}rows.push(bdRow(b))});
  if(rows.length)h+=group(rows.join(''))}
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
 after(m){const page=S.view+'|'+(S.recipe||'')+'|'+(S.view==='mat'?S.matTab:S.view==='uppgifter'?S.taskTab:''),newPage=page!==this.page,prev=this.page;this.page=page;
  const keys=new Set([...m.querySelectorAll('.cell input.check')].map(rowKey));
  if(!calm()){
   if(newPage&&prev){const[pv,pr]=prev.split('|');const cls=this.dir||(S.recipe&&!pr?'in-right':(!S.recipe&&pr&&pv===S.view)?'in-left':'in-fade');
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
  this.dir=null;this.keys=keys;
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
function closeSheets(){S.sheet=null;S.swap=null;S.wishFor=null;S.rate=null;S.ekoEdit=null;S.shopAdd=false;S.taskAdd=false}

/* ---------- actions ---------- */
const ACT={
 wakeBoard(){render()},
 nav(id){try{document.activeElement&&document.activeElement.blur()}catch(e){}id=normView(id);S.shopAdd=false;S.taskAdd=false;S.view=id;S.recipe=null;S.confirm=null;lsSet('view',id);try{history.replaceState(null,'','#'+id)}catch(e){}window.scrollTo(0,0);render()},
 refresh(){refresh()},
 settings(){S.sheet='settings';render()},
 prefs(){S.sheet='prefs';render()},
 sheetClose(){closeSheets();render()},
 sheetBg(id,el,e){if(e.target===el){closeSheets();render()}},
 me(id){S.me=id;lsSet('me',id);render()},
 logout(){S.key='';S.data=null;S.sheet=null;lsSet('key',null);lsSet('cache',null);render()},
 copy(id){try{navigator.clipboard.writeText(id).then(()=>toast('Kopierat'),()=>toast('Markera och kopiera texten'))}catch(e){toast('Markera och kopiera texten')}},
 calStyle(id){CAL_STYLE=['1','3'].includes(id)?id:'2';lsSet('calStyle',CAL_STYLE==='2'?null:CAL_STYLE);render()},
 theme(id){S.theme=['light','dark'].includes(id)?id:'system';lsSet('theme',S.theme==='system'?null:S.theme);applyTheme(true);render()},
 wall(){S.wall=!S.wall;lsSet('wall',S.wall?'1':'0');fitScrollbar();wake();render()},
 matTab(id){S.matTab=['recept','bank','inkop'].includes(id)?id:'vecka';lsSet('matTab',S.matTab);S.recipe=null;render()},
 recipe(id){S.view='mat';S.recipe=id;lsSet('view','mat');try{history.replaceState(null,'','#mat')}catch(e){}window.scrollTo(0,0);render()},
 recipeBack(){S.recipe=null;window.scrollTo(0,0);render()},
 scale(id,el){const r=recipeById(id);const{p}=scaled(r);S.scale[id]=Math.max(1,Math.min(20,p+Number(el.dataset.d)));render()},
 cook(id){S.cook={id,step:S.step[id]||0};wake();render()},
 pickStep(id,el){S.step[id]=Number(el.dataset.i);render();setTimeout(()=>{const li=document.querySelector('.steps li.active');if(li&&li.getBoundingClientRect().top<70)li.scrollIntoView({block:'start',behavior:'smooth'})},30)},
 cookStep(id,el){A.user=Date.now();const r=recipeById(S.cook.id);S.cook.step=Math.max(0,Math.min(r.steps.length-1,S.cook.step+Number(el.dataset.d)));S.step[S.cook.id]=S.cook.step;render()},
 fodMode(id){S.fodMode=id;lsSet('fodMode',id);render()},
 fodMon(id){S.fodMon=Number(id);render()},
 ekoMonth(id,el){S.ekoMonth=addMonths(S.ekoMonth||thisMonth(),Number(el.dataset.d));render()},
 ekoIncome(){S.sheet='income';render()},
 ekoCost(id,el){S.ekoEdit={list:el.dataset.list,id:id||null};S.sheet='cost';render()},
 ekoDel(){const e=S.ekoEdit;if(!e||!e.id)return;closeSheets();A.user=Date.now();A.flip=true;
  updJSON('ekonomi',{},o=>{ekoListIn(o,e.list,l=>l.filter(x=>x.id!==e.id));return o});toast('Utgiften är borttagen')},
 wxVar(){const W=wxModel();if(!W)return;const sc=wxScene(W),L=[...new Set(figVariants(sc.sleep))],cur=figVariant(sc);S.wxVar=L[(L.indexOf(cur)+1)%L.length];render()},
 wxRefresh(){loadWx(true).then(ok=>{if(ok){lsSet('ext',JSON.stringify(EXT))}render();if(!ok)toast('Vädret kunde inte hämtas')})},
 cookDone(id){S.cook=null;A.cookStep=null;wake();ACT.rate(id)},
 rate(id){S.rate={id};S.sheet='rate';render()},
 bankFilter(id){S.bankFilter=id;render()},
 bankAdd(id){addToBank(recipeById(id));render()},
 wish(id){const r=recipeById(id);if(!r)return;const on=wishes().some(x=>x.id===id);
  if(on){A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>x.id!==id));toast('Borttagen från önskelistan');return}
  S.wishFor=id;S.sheet='wish';render()},
 wishNew(){S.wishFor=null;S.sheet='wish';render()},
 wishDel(id){const w=wishes()[Number(id)];if(!w)return;A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>!(x.t===w.t&&x.d===w.d&&x.slot===w.slot)));toast('Önskemålet är borttaget')},
 swap(id){const m=D().menu[Number(id)];if(!m)return;S.swap={m:Object.assign({},m),step:'ask',i:0};S.confirm=null;S.sheet='swap';render()},
 swapStep(id){if(!S.swap)return;S.swap.step=id;S.confirm=null;render()},
 swapNext(){if(!S.swap)return;S.swap.i=(S.swap.i||0)+1;render()},
 swapRemoveAsk(){S.confirm='swapRemove';render()},
 swapRemove(){doSwap(null)},
 swapTo(id){const r=recipeById(id);if(r)doSwap(r)},
 deleteRecipeAsk(){S.confirm='delRecipe';render()},
 deleteRecipe(id){const r=recipeById(id);if(!r)return;S.confirm=null;A.user=Date.now();
  BANK_ROWS().forEach(k=>{if(parseJ(settings()[k],[]).some(x=>x.id===id))updJSON(k,[],a=>a.filter(x=>x.id!==id))});
  updJSON('frekvens',{},o=>{o[id]={w:0,t:r.title};return o});
  if(wishes().some(x=>x.id===id))updJSON('onskelista',[],a=>a.filter(x=>x.id!==id));
  const onMenu=D().menu.some(m=>m.recipe===id&&m.date>=today());
  S.recipe=null;render();toast(onMenu?'Receptet föreslås inte igen. Det står kvar på veckans meny, tryck Byt där för att byta ut det.':'Receptet är borttaget och föreslås inte igen')},
 cookClose(){S.cook=null;A.cookStep=null;wake();render()},
 timer(id,el){unlockAudio();const m=Number(el.dataset.min);S.timers.push({k:Math.random().toString(36).slice(2),label:el.dataset.label||'Timer',end:Date.now()+m*60000,ring:false});tick();toast('Timer: '+m+' min')},
 timerStop(id){S.timers=S.timers.filter(t=>t.k!==id);tick()},
 shopFilter(id){S.shopFilter=id;render()},
 shopAdd(){S.shopAdd=!S.shopAdd;render();if(S.shopAdd)setTimeout(()=>document.getElementById('shop-name')?.focus(),30)},
 shopToggle(id){const i=D().shop.find(x=>x.id===id);if(!i)return;const done=!i.done;checkAnim(id,done,()=>{mutate('shop',id,{done});apiPost({action:'shopToggle',id,done})})},
 clearShop(){S.confirm='clearShop';render()},
 clearShopYes(){S.confirm=null;leaveAnim('shopToggle',D().shop.filter(i=>i.done),()=>{S.data.shop=D().shop.filter(i=>!i.done);render();apiPost({action:'shopClearDone'})})},
 confirmNo(){S.confirm=null;render()},
 taskList(){S.taskTab='lista';lsSet('taskTab','lista');ACT.nav('uppgifter')},
 taskTab(id){S.taskTab=id==='kalender'?'kalender':'lista';lsSet('taskTab',S.taskTab);render()},
 calDay(id){S.calDay=id;S.calMonth=ymKey(id);render()},
 ovDay(id){S.ovDay=id;render()},
 calOpen(id){S.taskTab='kalender';lsSet('taskTab','kalender');S.calDay=id||today();S.calMonth=ymKey(S.calDay);ACT.nav('uppgifter')},
 calMonth(id,el){const[y,m]=(S.calMonth||ymKey(S.calDay||today())).split('-').map(Number),d=new Date(y,m-1+Number(el.dataset.d),1);S.calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1);render()},
 calToday(){S.calDay=today();S.calMonth=ymKey(S.calDay);render()},
 calAddTask(id){S.taskDue=id;S.taskAdd=true;render();setTimeout(()=>document.getElementById('task-title')?.focus(),30)},
 taskAdd(){S.taskDue='';S.taskAdd=!S.taskAdd;render();if(S.taskAdd)setTimeout(()=>document.getElementById('task-title')?.focus(),30)},
 taskToggle(id){const x=D().tasks.find(t=>t.id===id);if(!x)return;const done=!x.done;
  if(done&&repName(x.repeat)){const nd=nextDue(x.due,x.repeat,today());A.user=Date.now();mutate('tasks',id,{due:nd});apiPost({action:'taskToggle',id,done:true});toast('Klart. Nästa gång '+(nd===addDays(today(),1)?'i morgon':dateShort(nd)));return}
 checkAnim(id,done,()=>{mutate('tasks',id,{done});apiPost({action:'taskToggle',id,done})})},
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
 if(el.dataset.change==='photo'){const f=el.files&&el.files[0];el.value='';uploadPhoto(id,f);return}
 if(el.dataset.change==='ork'){el.blur();ACT.budget(String(ORK[Number(el.value)].min));return}
 if(el.dataset.change==='rfreq'){const r=recipeById(id),v=el.value;updJSON('frekvens',{},o=>{if(v==='auto')delete o[id];else o[id]={w:Number(v),t:r?r.title:''};return o});toast(v==='auto'?'Följer betyget':freqName(Number(v)));return}
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
  const rp=repName(d.repeat)?d.repeat:'',due=d.due||(rp?today():'');
  D().tasks.push({id:'tmp'+Date.now(),done:false,title:d.title.trim(),due,who:d.who||'',note:'',source:'egen',repeat:rp});S.taskAdd=false;render();
  apiPost({action:'taskAdd',title:d.title.trim(),due,who:d.who||'',repeat:rp})}
 if(f.dataset.form==='income'){const m=S.ekoMonth||thisMonth(),v={};people().forEach((p,i)=>{v[p]=Math.round(Number(String(d['p'+i]||'').replace(/\s/g,'').replace(',','.'))||0)});
  closeSheets();A.user=Date.now();updJSON('ekonomi_inkomst',{},o=>{o[m]=v;return o});toast('Inkomsten för '+monthName(m)+' är sparad');return}
 if(f.dataset.form==='cost'){const e=S.ekoEdit||{},amt=Number(String(d.amount||'').replace(/\s/g,'').replace(',','.'));if(!d.name||!isFinite(amt))return;
  const c={id:e.id||('x'+Date.now().toString(36)),name:d.name.trim(),amount:amt,period:d.period||'månad',pay:d.pay||'',day:String(d.day||'').trim(),note:String(d.note||'').trim()};
  closeSheets();A.user=Date.now();A.flip=true;
  const to=d.owner||e.list||'shared',moved=e.id&&to!==e.list;
  updJSON('ekonomi',{},o=>{if(moved)ekoListIn(o,e.list,l=>l.filter(x=>x.id!==c.id));ekoListIn(o,to,l=>l.some(x=>x.id===c.id)?l.map(x=>x.id===c.id?c:x):l.concat([c]));return o});
  toast(moved?'Flyttad till '+(to==='shared'?'gemensamma':to+'s')+' utgifter':e.id?'Sparat':'Utgiften är tillagd');return}
 if(f.dataset.form==='rate'){const r=recipeById(S.rate&&S.rate.id),who=S.me||d.who;if(!r||!who||!d.s)return;
  const sN=Number(d.s),v=d.v||(sN>=4?'igen':sN===3?'okej':'aldrig'),e={s:sN,v,c:String(d.c||'').trim(),d:today()};
  closeSheets();A.user=Date.now();
  updJSON('betyg',{},o=>{o[r.id]=o[r.id]||{p:{}};o[r.id].t=r.title;o[r.id].p=o[r.id].p||{};o[r.id].p[who]=e;return o});
  const saved=(sN>=4||v==='igen')&&addToBank(r,true);
  toast(saved?'Tack! Receptet sparades i receptbanken':'Tack för betyget!');if(sN>=4)confetti();return}
 if(f.dataset.form==='wish'){const r=S.wishFor&&recipeById(S.wishFor),t=r?r.title:String(d.t||'').trim();if(!t)return;
  const w={t,slot:d.slot||slotFor(r),by:S.me||'',d:today()};if(r)w.id=r.id;
  if(r&&!inBank(r.id))addToBank(r,true);
  closeSheets();A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>!(r&&x.id===r.id)).concat([w]));toast('Önskad till nästa vecka: '+w.slot.toLowerCase());return}
 if(f.dataset.form==='prefs'){const st=settings();
  const ch=PREFS.map(([k])=>[k,String(d[k]||'').replace(/\s+\n/g,'\n').trim()]).filter(([k,v])=>String(st[k]||'')!==v);
  closeSheets();ch.forEach(([k,v])=>{st[k]=v;apiPost({action:'setting',k,v})});render();toast(ch.length?'Preferenserna är sparade':'Inget ändrades');return}
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
  if(c.dataset.v!==txt){flipClock(c,txt);const cr=document.getElementById('cal-rows');if(cr)cr.innerHTML=calDayRows(cr.dataset.d)}}
 const box=document.getElementById('timers');
 box.innerHTML=S.timers.map(t=>{const ms=t.end-Date.now();if(ms<=0&&!t.ring){t.ring=true;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}const s=Math.max(0,Math.ceil(ms/1000));
  return'<div class="timer'+(t.ring?' ring':'')+'"><span>'+esc(t.label)+'</span><span class="num">'+(t.ring?'Klart!':Math.floor(s/60)+':'+pad(s%60))+'</span><button data-act="timerStop" data-id="'+t.k+'" aria-label="Stäng timer">'+I.x+'</button></div>'}).join('');
 if(S.timers.some(t=>t.ring)&&Date.now()%5000<1000)beep()}
setInterval(tick,1000);
let lock=null;
async function wake(){const want=S.wall||!!S.cook;try{if(want&&!lock&&navigator.wakeLock){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}else if(!want&&lock){await lock.release();lock=null}}catch(e){lock=null}}
// När appen öppnas igen: hämta kalkylarket och (vid behov) vädret direkt, iOS pausar timrarna i bakgrunden
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){wake();refresh(true);loadExt()}});
// Hämta nytt var 30:e sekund när appen syns (var 60:e i väggläge räcker också), och rita om vid ny dag
setInterval(()=>{if(document.visibilityState==='visible')refresh(true)},30000);
let lastDay=today();setInterval(()=>{if(today()!==lastDay){lastDay=today();render()}},30000);

render();if(S.key)refresh();wake();
})();
