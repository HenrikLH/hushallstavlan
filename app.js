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
 heart:SV+'<path d="M12 20.3s-7.6-4.5-7.6-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.6 2.8c0 5.6-7.6 10.1-7.6 10.1z"/></svg>',
 heartOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.3s-7.6-4.5-7.6-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.6 2.8c0 5.6-7.6 10.1-7.6 10.1z"/></svg>',
 bookmark:SV+'<path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.3-6.5 4.3v-16a1 1 0 0 1 1-1z"/></svg>',
 bookmarkOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.3-6.5 4.3v-16a1 1 0 0 1 1-1z"/></svg>',
 pencil:SV+'<path d="M4 20h4L19.2 8.8a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
 starO:SV+'<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
 calPlus:SV+'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
 repeat:SV+'<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-2a4 4 0 0 1 4-4h12"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5v2a4 4 0 0 1-4 4H4"/></svg>',
 dots:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>',
 camera:SV+'<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.3" r="3.4"/></svg>',
 trash:SV+'<path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13"/></svg>',
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
// Raden personer i Inställningar: "Henrik:indigo, Cornelia:teal". Färgen efter kolon är valfri.
const personList=()=>{const p=String(settings().personer||'').split(',').map(s=>{const[n,c]=s.split(':');return{n:n.trim(),c:(c||'').trim()}}).filter(x=>x.n);return p.length?p:[{n:'Henrik',c:''},{n:'Cornelia',c:''}]};
const people=()=>personList().map(x=>x.n);
/* Användarfärger: [namn, ljust läge, text i ljust, mörkt läge, text i mörkt] */
const PCOL={indigo:['Indigo','#4B4FC4','#3D41A8','#8C8FF2','#AEB0FF'],bla:['Blå','#1F6FB2','#185C95','#5AAEEE','#86C4F4'],teal:['Teal','#0F8C83','#0B6E67','#35C2B5','#62D8CC'],
 gron:['Grön','#2E8540','#226B32','#4CC764','#7ADB8D'],plommon:['Plommon','#8E3B9E','#7A2F89','#C985D8','#DCA6E8'],vinrod:['Vinröd','#A3253F','#A3253F','#D9566F','#EC7088'],
 rosa:['Rosa','#C2457E','#A8346A','#F07EB0','#F7A3C8'],orange:['Orange','#C25E0A','#A34E06','#F2994A','#F7B57A'],grafit:['Grafit','#5B6472','#4A525E','#A3ACB9','#C2C9D3']};
const PCOL_DEF=['indigo','teal'];
const personColor=i=>{const c=(personList()[i]||{}).c;return PCOL[c]?c:PCOL_DEF[i]||'grafit'};
const rgba=(h,a)=>'rgba('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')+','+a+')';
let pcolKey='';
function applyPersonColors(){const ks=[0,1].map(personColor),key=ks.join();if(key===pcolKey)return;pcolKey=key;
 const v=dark=>ks.map((k,i)=>{const c=PCOL[k],m=dark?c[3]:c[1];return'--p'+(i+1)+':'+m+';--p'+(i+1)+'-soft:'+rgba(m,dark?.22:.13)+';--p'+(i+1)+'-ink:'+(dark?c[4]:c[2])}).join(';');
 let el=document.getElementById('pcol');if(!el){el=document.createElement('style');el.id='pcol';document.head.appendChild(el)}
 el.textContent=':root{'+v(false)+'}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){'+v(true)+'}}:root[data-theme="dark"]{'+v(true)+'}'}
const recipeById=id=>D().recipes.find(r=>r.id===id)||bankList().find(r=>r.id===id)||inspoList().find(r=>r.id===id);
/* Inspiration: recept från nätet i inspiration.json (följer med appen, inte kalkylarket).
   Hjärtat sparar som favorit och bokmärket som sparat recept i receptbanken. */
const INSPO={list:null,busy:false};
function inspoList(){if(!INSPO.list&&!INSPO.busy){INSPO.busy=true;fetch('inspiration.json?v=1').then(r=>r.json()).then(a=>{INSPO.list=Array.isArray(a)?a:[];render()}).catch(()=>{INSPO.busy=false})}return INSPO.list||[]}
/* ---------- betyg, önskelista och receptbank ----------
   Sparas som JSON i fliken Inställningar (raderna betyg, onskelista och receptbank_1…7)
   via appens vanliga inställningsanrop, så Apps Script-skriptet behöver inte ändras. */
const parseJ=(s,d)=>{try{const v=JSON.parse(s);return v==null?d:v}catch(e){return d}};
const BANK_ROWS=()=>Object.keys(settings()).filter(k=>/^receptbank_\d+$/.test(k)).sort((a,b)=>Number(a.split('_')[1])-Number(b.split('_')[1]));
function bankList(){const seen=new Set(),out=[];BANK_ROWS().forEach(k=>parseJ(settings()[k],[]).forEach(x=>{if(x&&x.id&&!seen.has(x.id)){seen.add(x.id);out.push(x)}}));return out}
const inBank=id=>bankList().some(x=>x.id===id);
const isFav=id=>bankList().some(x=>x.id===id&&x.fav);
// Kalorier per portion: raden kcal i Inställningar, {receptId: kcal}; en lista [kcal, …] läses som första värdet. Fylls av veckoplaneringen.
function kcalOf(id){const v=parseJ(settings().kcal,{})[id];if(v==null||v==='')return null;const n=Number(Array.isArray(v)?v[0]:v);return n>0?{n:Math.round(n)}:null}
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
function bankSnap(r){const x=JSON.parse(JSON.stringify(r));x.savedAt=today();delete x.when;delete x.fav;return x}
// Ändra ett recept som redan ligger i receptbanken
function bankEdit(id,fn){A.user=Date.now();BANK_ROWS().forEach(k=>{if(parseJ(settings()[k],[]).some(x=>x.id===id))updJSON(k,[],a=>a.map(x=>x.id===id?fn(Object.assign({},x)):x))})}
function addToBank(r,quiet,fav){if(!r||inBank(r.id))return false;const snap=bankSnap(r);if(fav)snap.fav=true;const len=JSON.stringify(snap).length;
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
  if(!on()||e.button>0||!S.data||e.target.closest('input,select,textarea,[contenteditable],.nav')||(S.arrange&&e.target.closest('[data-box]')))return;
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
  if(idle&&S.arrange){S.arrange=false;render()}
  if(idle&&(S.view!=='oversikt'||S.sheet||S.shopAdd||S.taskAdd||S.recipe||window.scrollY>0)&&!S.cook){closeSheets();S.recipe=null;ACT.nav('oversikt')}
  else if(S.view==='oversikt'&&document.body.classList.contains('is-night')!==nightOn())render()},20000)})();

/* Ändra ordning: håll fingret på en ruta på Översikt tills rutorna vickar och dra sedan, som på mobilens hemskärm.
   De andra rutorna glider undan medan man drar. Klockan räknas inte (där sitter kioskens stäng-gest). */
(function(){let lp=0,x=0,y=0,eat=false,G=null,pid='',mouse=false;const stop=()=>{clearTimeout(lp);lp=0};
 const rects=()=>{const m={};document.querySelectorAll('[data-box]').forEach(b=>{const r=b.getBoundingClientRect();m[b.dataset.box]={l:r.left,t:r.top+scrollY,w:r.width,h:r.height}});return m};
 // rita om och låt rutorna glida från sina gamla platser till de nya
 const redraw=()=>{const old=rects();doRender();const now=rects();
  if(!calm())document.querySelectorAll('[data-box]').forEach(b=>{const o=old[b.dataset.box],n=now[b.dataset.box];if(!o)return;const dx=o.l-n.l,dy=o.t-n.t;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
   b.style.transition='none';b.style.translate=dx+'px '+dy+'px';requestAnimationFrame(()=>requestAnimationFrame(()=>{b.style.transition='translate .25s cubic-bezier(.2,.8,.2,1)';b.style.translate='0px 0px'}))});
  return now};
 // en kopia av rutan följer fingret; den läggs i samma omgivning så att den ser likadan ut
 function lift(b){const r=b.getBoundingClientRect(),m=document.querySelector('main'),z=parseFloat(getComputedStyle(m).zoom)||1;let root=null,inner=null;
  for(let el=b.parentElement;el&&el!==document.body;el=el.parentElement){const w=document.createElement(el.tagName);w.className=el.className;w.style.cssText='display:block;position:static;height:auto;width:auto;padding:0;margin:0;overflow:visible;columns:auto';if(inner)w.appendChild(root);else inner=w;root=w;if(el===m)break}
  const c=b.cloneNode(true);c.removeAttribute('data-box');c.classList.remove('ph');c.classList.add('lift');c.style.cssText='width:'+r.width/z+'px;height:'+r.height/z+'px;margin:0';
  inner.appendChild(c);root.style.cssText+=';position:fixed;left:0;top:0;z-index:90;pointer-events:none;width:'+r.width/z+'px';root.classList.add('lift-root');document.body.appendChild(root);return{root,z}}
 function place(){const{root,z}=G.lf;root.style.transform='translate('+(G.px-G.dx)/z+'px,'+(G.py-G.dy)/z+'px)'}
 function start(id,px,py){const b=document.querySelector('[data-box="'+id+'"]');if(!b)return;const r=b.getBoundingClientRect(),wall=wallBoardOn();
  const L=JSON.parse(JSON.stringify(layout(wall,wall?WALL_DEF:OV_DEF())));
  G={id,wall,L,px,py,dx:px-r.left,dy:py-r.top,lf:lift(b)};place();PREVIEW={wall,L};DRAG_ID=id;G.rects=redraw();eat=true;
  try{navigator.vibrate&&navigator.vibrate(10)}catch(err){}}
 function move(px,py){G.px=px;G.py=py;place();const X=px,Y=py+scrollY,R=G.rects,L=G.L;
  if(!G.wall){if(py<90)scrollBy(0,-12);else if(py>innerHeight-160)scrollBy(0,12)}
  const inR=r=>r&&X>=r.l&&X<=r.l+r.w&&Y>=r.t&&Y<=r.t+r.h;if(inR(R[G.id]))return;
  const col=L.cols.find(c=>c.includes(G.id));let to=null;
  for(const k in R){if(k===G.id||!inR(R[k]))continue;const r=R[k],tc=L.cols.find(c=>c.includes(k)),side=L.size[k]==='h'&&(G.wall||L.size[G.id]==='h'),after=side?X>r.l+r.w/2:Y>r.t+r.h/2;
   const c2=tc.filter(x=>x!==G.id);to={c:tc,i:c2.indexOf(k)+(after?1:0)};break}
  if(!to&&G.wall){document.querySelectorAll('.bcol[data-col]').forEach(cl=>{const r=cl.getBoundingClientRect();if(px>=r.left&&px<=r.right&&py>=r.top&&py<=r.bottom){const tc=L.cols[Number(cl.dataset.col)];{const last=tc.filter(x=>x!==G.id).map(x=>R[x]).filter(Boolean).pop();if(!last||Y>last.t+last.h)to={c:tc,i:tc.filter(x=>x!==G.id).length}}}})}
  if(!to)return;const before=JSON.stringify(L.cols);col.splice(col.indexOf(G.id),1);to.c.splice(to.i,0,G.id);if(JSON.stringify(L.cols)!==before)G.rects=redraw()}
 function end(){const g=G;G=null;PREVIEW=null;DRAG_ID=null;saveLayout(g.wall,g.L);const ph=document.querySelector('[data-box="'+g.id+'"]'),{root,z}=g.lf;
  const done=()=>{root.remove();doRender()};if(!ph||calm())return done();const r=ph.getBoundingClientRect();
  root.style.transition='transform .18s ease';root.style.transform='translate('+r.left/z+'px,'+r.top/z+'px)';setTimeout(done,190);setTimeout(()=>eat=false,250)}
 document.addEventListener('pointerdown',e=>{if(e.button>0||S.view!=='oversikt'||nightOn()||G)return;const b=e.target.closest('[data-box]');if(!b||e.target.closest('#clock,.arr-x,.arr-s'))return;
  stop();x=e.clientX;y=e.clientY;const id=b.dataset.box,was=S.arrange;pid=id;mouse=e.pointerType!=='touch';
  // i ändra-läget räcker en kort stund, annars en längre så att vanliga tryck och scroll fungerar som förut
  lp=setTimeout(()=>{lp=0;if(!was){S.arrange=true;doRender()}start(id,x,y)},was?180:600)});
 // med mus (och väggskärmens pekskärm) börjar dragningen direkt när man rör sig i ändra-läget
 addEventListener('pointermove',e=>{if(G){move(e.clientX,e.clientY);return}if(!lp||Math.hypot(e.clientX-x,e.clientY-y)<=(S.arrange&&mouse?4:9))return;stop();if(S.arrange&&mouse){start(pid,x,y);if(G)move(e.clientX,e.clientY)}});
 addEventListener('pointerup',()=>{stop();if(G)end()});addEventListener('pointercancel',()=>{stop();if(G)end()});
 document.addEventListener('touchmove',e=>{if(G)e.preventDefault()},{passive:false});
 document.addEventListener('click',e=>{if(eat){eat=false;e.stopPropagation();e.preventDefault()}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-box]')&&S.view==='oversikt')e.preventDefault()})})();

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
   if(!j.ok){toast(/okänd åtgärd/i.test(j.error||'')?'Det här kräver att Kod.gs uppdateras på datorn först.':'Ändringen sparades inte: '+(j.error||'Okänt fel'));if(!OUTBOX.length){S.sync='idle';flushing=false;refresh(true);return}continue}
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
// Födelsedagar är bara information och tillhör ingen, även om de ligger i någons kalender
function evPerson(e){return isBdEv(e)?'':String(e.who||e.vem||'').trim()}
// Står ett namn först eller sist i titeln flyttas det ut till namnetiketten: "Henrik jobbar" blir "Jobb" + Henrik
function evParts(e){const t=String(e.title||'').trim(),ps=people(),is=s=>ps.find(p=>p.toLowerCase()===s.replace(/[:,–-]+$/,'').toLowerCase());
 const a=/^(\S+)\s+(.+)$/.exec(t),b=/^(.+?)\s+(\S+)$/.exec(t);let name='',rest=t;
 if(a&&is(a[1])){name=is(a[1]);rest=a[2]}else if(b&&is(b[2])){name=is(b[2]);rest=b[1].replace(/\s*[:,–-]$/,'')}
 if(name&&/^jobbar$/i.test(rest))rest='Jobb';
 return{title:name?cap(rest):t,name}}
const evTitle=e=>esc(evParts(e).title);
function evWho(e){const w=evParts(e).name||evPerson(e);return w?' '+personChip(w):''}
// Namnchip i personens egen färg (--p1/--p2), grå för den som inte finns bland personerna
const personChip=w=>'<span class="chip'+(people().includes(w)?' '+pcls(w):'')+'">'+esc(w)+'</span>';
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
function doRender(){applyPersonColors();
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
 placeSky();fitBoard();
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
/* ---------- egen ordning på rutorna ----------
   Som hemskärmen i en mobil: håll fingret på en ruta tills rutorna börjar vicka, dra den dit du vill
   så viker de andra undan. − döljer en ruta och hörnknappen växlar mellan halv och hel bredd.
   Ordningen sparas per enhet, så telefonen och väggskärmen kan se olika ut. Bilden med klockan ligger alltid först. */
const BOX={kal:'Kalender',mat:'Middag',stad:'Städ',inkop:'Inköp',upg:'Uppgifter',hem:'Hemmet',fod:'Födelsedagar',imorgon:'Imorgon'};
// vilka rutor som får vara halv bredd, och vilka som är det från början
const SIZES={ov:{can:['mat','stad','inkop','upg','hem','fod','imorgon'],half:['stad','inkop']},wall:{can:['mat','inkop','fod'],half:['inkop','fod']}};
const SV2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const IA={minus:SV2+'<path d="M6 12h12"/></svg>',grow:SV2+'<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/></svg>',shrink:SV2+'<path d="M20 10h-6V4M4 14h6v6M14 10l6-6M10 14l-6 6"/></svg>'};
let PREVIEW=null,DRAG_ID=null;// medan en ruta dras ritas tavlan med den tillfälliga ordningen
function layout(wall,def){if(PREVIEW&&PREVIEW.wall===wall)return PREVIEW.L;
 const k=wall?'wallLayout':'ovLayout',Z=SIZES[wall?'wall':'ov'];let o=null;try{o=JSON.parse(lsGet(k)||'null')}catch(e){}
 const known=new Set(def.flat()),hidden=(o&&Array.isArray(o.hidden)?o.hidden:[]).filter(x=>known.has(x));
 let cols=o&&Array.isArray(o.cols)&&o.cols.length===def.length?o.cols.map(c=>c.filter(x=>known.has(x))):def.map(c=>c.slice());
 const seen=new Set(cols.flat().concat(hidden));def.forEach((c,i)=>c.forEach(x=>{if(!seen.has(x))cols[i].push(x)}));// nya rutor hamnar på sin vanliga plats
 const size={};known.forEach(id=>{const v=o&&o.size&&o.size[id];size[id]=Z.can.includes(id)&&(v?v==='h':Z.half.includes(id))?'h':'f'});
 return{cols,hidden,size}}
function saveLayout(wall,L){lsSet(wall?'wallLayout':'ovLayout',L?JSON.stringify({cols:L.cols,hidden:L.hidden,size:L.size}):null)}
// I ändra-läget vickar rutorna och får sina knappar. Innehållet syns som vanligt men går inte att trycka på.
function boxify(id,html,wall,L){if(!html)return'';
 const half=L.size[id]==='h';
 if(!wall)html=html.replace(/class="widget( w2)?/,'class="widget'+(half?'':' w2'));
 html=html.replace('<section ','<section data-box="'+id+'" ');if(!S.arrange)return html;
 html=html.replace(/(<section[^>]*?) data-act="nav"/,'$1').replace(/(<section[^>]*?class="widget)/,'$1 arr'+(DRAG_ID===id?' ph':''));
 const can=SIZES[wall?'wall':'ov'].can.includes(id);
 const btn='<button type="button" class="arr-x" data-act="boxHide" data-id="'+id+'" aria-label="Dölj '+BOX[id]+'">'+IA.minus+'</button>'+
  (can?'<button type="button" class="arr-s" data-act="boxSize" data-id="'+id+'" aria-label="'+(half?'Hel':'Halv')+' bredd för '+BOX[id]+'">'+(half?IA.grow:IA.shrink)+'</button>':'');
 return html.replace(/(<section[^>]*>)/,'$1'+btn)}
// Telefonen: rutorna ligger i ett rutnät med två spalter. Väggen: två halva rutor i rad delar rad.
function boxRow(list,wall,html,L){let out='',i=0;const n=list.length,H=id=>L.size[id]==='h';
 while(i<n){const a=list[i],b=list[i+1];
  if(wall&&H(a)){const two=b&&H(b);out+='<div class="wpair"'+(two&&!(a==='inkop'&&b==='fod')?' style="grid-template-columns:1fr 1fr"':'')+'>'+boxify(a,html[a],wall,L)+(two?boxify(b,html[b],wall,L):'<div></div>')+'</div>';i+=two?2:1;continue}
  out+=boxify(a,html[a],wall,L);i++}
 return out}
function arrangeFoot(L,wall){if(!S.arrange)return'';
 const hid=L.hidden.map(id=>'<button type="button" class="pill" data-act="boxShow" data-id="'+id+'">'+I.plus+BOX[id]+'</button>').join('');
 return'<div class="arr-foot" role="toolbar" aria-label="Ändra ordning"><div class="arr-hid">'+(hid?'<span class="muted">Dolda:</span>'+hid:'<span class="muted">Inga dolda rutor</span>')+'</div>'+
  '<button type="button" class="tb" data-act="boxReset">Återställ</button><button type="button" class="btn-fill" data-act="arrangeDone">Klar</button></div>'}
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
// Mer väder under hundarna på väggen: kommande timmar och tre dagar framåt
function wallWx(){const W=wxModel();if(!W)return'';
 // ett dygn framåt, timme för timme; svep i sidled för fler timmar, tryck för att öppna vädret
 const hrs=W.hours.slice(1,25);
 const R=rainTxt(W);
 let h='<div class="bwx"><div class="bwx-r'+(R.wet?' wet':'')+'">'+(R.wet?UMB:I.tick)+'<span>'+esc(R.txt)+'</span></div>';
 h+='<div class="bwx-h" data-act="nav" data-id="vader" role="link" aria-label="Väder timme för timme, öppna vädret">'+hrs.map((x,k)=>{const[ic]=symInfo(x.s),hr=x.d.getHours(),nd=hr===0&&k>0;
  return'<div class="'+(nd?'nd':'')+'"><span class="fn num">'+(nd?capS(DAYS3[x.d.getDay()]):pad(hr))+'</span><span class="hi">'+ic+'</span><b class="num">'+deg(x.T)+'</b>'+(x.pr>=0.1?'<span class="pr num">'+mm(x.pr)+'</span>':'<span class="pr"></span>')+'</div>'}).join('')+'</div></div>';
 return h}
// Paraply? Regnet under resten av dagen (efter kl. 18: i morgon dagtid), med tider och mängd
const UMB='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v7a2 2 0 0 0 4 0"/></svg>';
function rainTxt(W){const n=new Date(),tm=n.getHours()>=18,day=tm?ymd(new Date(n.getFullYear(),n.getMonth(),n.getDate()+1)):ymd(n);
 const L=(W.all||W.hours).filter(x=>ymd(x.d)===day&&x.d.getHours()>=(tm?6:0)&&x.d.getHours()<22&&x.d>=new Date(n.getTime()-36e5));
 const wet=L.filter(x=>(x.pr||0)>=0.1);
 if(!wet.length)return{wet:false,txt:tm?'Inget regn i morgon':'Inget regn resten av dagen'};
 // sammanhängande regntimmar blir ett intervall
 const sp=[];wet.forEach(x=>{const l=sp[sp.length-1],h=x.d.getHours();if(l&&h===l.b)l.b=h+1,l.mm+=x.pr,l.mx=Math.max(l.mx,x.pr);else sp.push({a:h,b:h+1,mm:x.pr,mx:x.pr})});
 const tot=sp.reduce((a,x)=>a+x.mm,0),mx=Math.max(...sp.map(x=>x.mx)),ord=mx>=2?'kraftigt regn':mx>=0.5?'regn':'lätt regn';
 const when=sp.slice(0,2).map(x=>pad(x.a)+'–'+pad(x.b)).join(' och ')+(sp.length>2?' med flera':'');
 return{wet:tot>=0.3,txt:(tot>=0.3?'Ta paraply'+(tm?' i morgon':'')+' · '+cap(ord):(tm?'I morgon ':'')+ord)+' '+when+' · '+mm(tot)}}
// liten version av årshjulet och månadens födelsedagar i tur och ordning
function wallBd(){const L=bdays();if(!L.length)return'';const t=parse(today()),m=t.getMonth();
 let mon=L.filter(b=>b.mo===m).sort((a,b)=>a.dd-b.dd),mm2=m;
 if(!mon.length){const nx=bdNext(L)[0];mm2=nx.mo;mon=L.filter(b=>b.mo===mm2).sort((a,b)=>a.dd-b.dd)}
 const more=mon.length>4?mon.length-3:0,show=more?mon.slice(0,3):mon;
 return widget('fod','bbd',I.cake,'Födelsedagar',esc(cap(MON[mm2])),'<div class="bbd-in"><div class="bbd-w">'+bdWheel(L,mm2)+'</div><div class="bbd-l">'+
  show.map(b=>'<div class="'+(b.days===0?'today':b.passed?'past':'')+'"><span class="num">'+b.dd+'</span><span class="grow">'+esc(b.name)+'</span><span class="fn num">'+(b.age!=null?b.age:"")+'</span></div>').join('')+
  (more?'<div class="fn">och '+more+' till</div>':'')+'</div></div>')}
function wallBoard(){
 if(nightOn())return wallNight();
 const t=today(),d=D(),cp=cleanPlan(),td=dayOf(t),tm=dayOf(addDays(t,1)),days=planDays();
 const nextDay=(td&&td.meals.length)?td:days.find(x=>x.date>t&&x.meals.length),isT=nextDay&&nextDay.date===t;
 const left=d.shop.filter(i=>!i.done);
 const clean=[...cp.routines.filter(x=>!doneToday(x)),...cp.todo].slice(0,4),doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 const tasks=d.tasks.filter(x=>!x.done).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,7);
 const popDone=A.cleanOpen&&!clean.length;A.cleanOpen=clean.length>0;
 const H={};
 H.kal=calWidget();
 H.mat=widget('mat','bmeal',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',(nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel än.</div>'));
 H.inkop=widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+left.length+'</div><div class="sub">kvar</div><div class="sub">ca '+kr(shopCost(left))+'</div>');
 H.fod=wallBd();
 H.stad=widget('stad','bclean',I.sparkles,'Städ idag',nv('stadN',doneN)+'/'+totN,
  '<div class="thin bprog"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>'+
  (clean.length?'<div class="wl">'+clean.map(x=>'<div class="cell ck" data-act="cleanToggle" data-id="'+esc(x.id)+'"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(x.id)+'" aria-label="'+esc(x.title)+'"><span class="grow">'+esc(x.title)+'</span><span class="val num">'+x.min+' min</span></div>').join('')+'</div>':'<div class="bdone'+(popDone?' pop':'')+'">'+I.tick+'Allt är gjort idag</div>')+
  '<div class="wk-sub">Hemmet</div><div class="brooms">'+roomHealth().map(r=>'<div class="'+healthCls(r.score)+'"><span>'+esc(r.room)+'</span><i><b style="width:'+Math.round(r.score*100)+'%"></b></i></div>').join('')+'</div>');
 H.upg=widget('uppgifter','btasks',I.list,'Uppgifter',d.tasks.filter(x=>!x.done).length+' kvar',tasks.length?'<div class="wl">'+tasks.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra.</div>');
 const L=layout(true,WALL_DEF);
 let h='<div class="board'+(S.arrange?' arranging':'')+'"><div class="board-gear">'+gearBtn+'</div>';
 h+='<div class="bcol bhero">'+heroHtml()+wallWx()+'</div>';
 L.cols.forEach((c,ci)=>{h+='<div class="bcol" data-col="'+ci+'">'+boxRow(c.filter(id=>H[id]),true,H,L)+'</div>'});
 return h+'</div>'+arrangeFoot(L,true)}
const WALL_DEF=[['kal','mat','inkop','fod'],['stad','upg']];
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
 h+='<div class="ov">'+heroHtml()+(S.arrange?'':smileyCard());
 const H={kal:calWidget()};
 const isT=nextDay&&nextDay.date===t;
 H.mat=widget('mat','w2',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',
  nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel inlagd än. Den fylls i när veckoplaneringen körs på söndag.</div>');
 const doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 H.stad=widget('stad','',I.sparkles,'Städ','','<div class="wbig">'+nv('w-clean',doneN)+'<small>/'+totN+'</small></div><div class="sub">'+nv('w-min',cp.minLeft)+' min kvar</div><div class="thin"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>');
 H.inkop=widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+nv('w-shop',left.length)+'</div><div class="sub">kvar · ca '+nv('w-shopkr',shopCost(left),'kr')+'</div>');
 const tl=tasksNow.concat(tasksSoon).slice(0,5);
 H.upg=widget('uppgifter','w2',I.list,'Uppgifter',tasksNow.length?tasksNow.length+' idag':'',tl.length?'<div class="wl">'+tl.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra just nu.</div>');
 const rh=roomHealth();
 H.hem=widget('stad','w2',I.home,'Hemmet','',rh.length?'<div class="wl">'+rh.map(healthRow).join('')+'</div>':'<div class="wempty">Städschemat är tomt.</div>');
 H.imorgon=tm?widget('mat','w2',I.cal,'Imorgon',esc(dateShort(tm.date)),(eventsHtml(tm)||'<div class="wempty">Inga händelser.</div>')+(tm.meals.length?wMeals(tm):'')):'';
 H.fod=bdWidget();
 const L=layout(false,OV_DEF());
 return h+(S.arrange?'<p class="arr-intro">Håll kvar och dra en ruta dit du vill ha den. − döljer rutan och hörnknappen gör den halv eller hel. Gäller bara den här enheten.</p>':'')+'<div class="widgets'+(S.arrange?' arranging':'')+'">'+boxRow(L.cols[0].filter(id=>H[id]),false,H,L)+'</div></div>'+arrangeFoot(L,false)};
// utan egen ordning ligger födelsedagarna näst sist
const OV_DEF=()=>[dayOf(addDays(today(),1))?['kal','mat','stad','inkop','upg','hem','fod','imorgon']:['kal','mat','stad','inkop','upg','fod','hem','imorgon']];
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
// Filtren för receptbanken och inspirationen
const RFILT=[['alla','Alla'],['k','Kött'],['v','Vegetariskt'],['g','Gemensam'],['snabbt','Snabbt'],['storkok','Storkok'],['efter','Efterrätt']];
function rfOk(f,r,w){return f==='alla'||(f==='snabbt'?r.min&&r.min<=30:f==='storkok'?/storkok/i.test((r.group||'')+r.title):f==='efter'?r.course==='efterrätt':f==='onskat'?w.has(r.id):kind(r)===f)}
const fchips=(act,fs,f)=>'<div class="fchips" role="group" aria-label="Filter">'+fs.map(([k,l])=>'<button data-act="'+act+'" data-id="'+k+'" aria-pressed="'+(f===k)+'">'+l+'</button>').join('')+'</div>';
// Stort kort med bild, hjärta och bokmärke. Används i receptbanken och bland inspirationen
function rCard(r,o){o=o||{};const g=ratingOf(r.id),wished=o.wish&&o.wish.has(r.id),img=r.img||imgOf(r.id);
 return'<article class="bcard '+kind(r)+'"><div class="bimgw"><button class="bimg" data-act="recipe" data-id="'+esc(r.id)+'" aria-label="Öppna '+esc(r.title)+'">'+(img?'<img src="'+esc(img)+'" alt="" loading="lazy">':'<span aria-hidden="true">'+foodIcon(r.title)+'</span>')+'</button>'+bookBtn(r,'bc-gl')+favBtn(r,'bc-gl')+'</div>'+
 '<div class="bbody"><div class="chips-row">'+whoChip(r.who)+(o.wish?freqChip(r.id):'')+(r.min?'<span class="chip num">'+r.min+' min</span>':'')+(r.kr?'<span class="chip num">'+kr(r.kr)+'/port</span>':'')+'</div>'+
 '<button class="btitle" data-act="recipe" data-id="'+esc(r.id)+'">'+esc(r.title)+'</button>'+
 (o.wish?(g?'<div class="bstars"><span class="st" aria-label="'+g.avg.toFixed(1)+' av 5">'+starsTxt(g.avg)+'</span>'+g.people.map(([p,e])=>'<span class="fn">'+esc(p)+': '+esc(VERD[e.v]||'')+'</span>').join('')+'</div>':'<div class="fn">Inget betyg än</div>'):(r.why?'<div class="fn bwhy">'+esc(r.why)+'</div>':''))+
 (r.src?'<a class="fn bsrc" href="'+esc(r.src)+'" target="_blank" rel="noopener">Från '+esc(r.srcName||new URL(r.src).hostname.replace(/^www\./,''))+'</a>':'')+
 (o.wish?'<button class="pill'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'">'+(wished?I.tick+'Önskad nästa vecka':'Vill ha nästa vecka')+'</button>':'')+'</div></article>'}
/* Receptbanken: favoriter (hjärta) och sparade recept (bokmärke) */
function matBank(){
 const f=S.bankFilter||'alla',w=new Set(wishes().map(x=>x.id));
 const all=bankList().map(r=>({r,g:ratingOf(r.id)})).sort((a,b)=>((b.g?b.g.avg:0)-(a.g?a.g.avg:0))||String(b.r.savedAt||'').localeCompare(String(a.r.savedAt||'')));
 let h=fchips('bankFilter',RFILT.concat([['onskat','Önskade']]),f);
 if(!all.length)return h+'<div style="height:16px"></div>'+group(emptyCell('Receptbanken är tom än. Tryck på hjärtat eller bokmärket på ett recept, till exempel under Recept, så hamnar det här.'));
 const list=all.filter(({r})=>rfOk(f,r,w)).map(x=>x.r),fav=list.filter(r=>r.fav),saved=list.filter(r=>!r.fav);
 h+=sh(I.heartOn.replace('<svg','<svg class="shic fav"')+'Favoriter','<span class="num">'+fav.length+'</span>');
 h+=fav.length?'<div class="bank">'+fav.map(r=>rCard(r,{wish:w})).join('')+'</div>':group(emptyCell(f==='alla'?'Inga favoriter än. Tryck på hjärtat på ett recept ni gillar extra mycket.':'Inga favoriter matchar filtret.'));
 h+=sh(I.bookmarkOn.replace('<svg','<svg class="shic"')+'Sparade recept','<span class="num">'+saved.length+'</span>');
 h+=saved.length?'<div class="bank">'+saved.map(r=>rCard(r,{wish:w})).join('')+'</div>':group(emptyCell(f==='alla'?'Inga sparade recept än. Tryck på bokmärket på ett recept för att spara det.':'Inga sparade recept matchar filtret.'));
 return h+'<div class="foot">Veckoplaneringen väljer bland favoriterna och de sparade recepten. Favoriter kommer tillbaka oftare.</div>'}
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
 return allRecipes().filter(r=>!onMenu.has(r.id)&&r.course!=='efterrätt'&&!matLage(r.id).paus).map(r=>{
  const g=ratingOf(r.id),l=matLage(r.id),last=lastServed(r.id),ago=last?Math.round((Date.parse(t)-Date.parse(last))/864e5):null;
  const due=ago==null?1.5:Math.min(2,ago/(Math.max(l.w,1)*7));
  const kind=(want.indexOf(r.who)>=0?2:0)+(isStorkok(r)===sk?1:0);
  return{r,g,ago,score:kind*10+l.s+due}}).sort((a,b)=>b.score-a.score)}
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
/* Veckan: rätterna indelade i Storkok, Vardag och Helg i stället för dag för dag */
function weekDishes(){const d=D(),seen=new Set(),out=[];
 d.menu.forEach(m=>{if(m.who==='Borta')return;const key=m.recipe||(m.who+'|'+m.title);if(seen.has(key))return;seen.add(key);
  const r=m.recipe&&recipeById(m.recipe);out.push({m,r,g:r&&r.group?(isStorkok(r)?'Storkok':r.group):(m.who==='Gemensam'?'Helg':'Vardag')})});
 String(settings().storkok||'').split(',').map(x=>x.trim()).filter(id=>id&&!seen.has(id)).forEach(id=>{const r=recipeById(id);if(r){seen.add(id);out.push({m:null,r,g:'Storkok'})}});
 return out}
function dishCell(x){const{m,r}=x;if(m)return mealCell(m);return recipeCell(r,r.portions+' portioner'+(r.kr?' · '+kr(r.kr)+'/port':''))}
function matWeek(){
 const d=D(),st=settings(),ds=weekDishes();let h='';
 if(!ds.length)return'<div style="height:22px"></div>'+group(emptyCell('Veckans mat fylls i när veckoplaneringen körs på söndag.'))+wishesBlock()+prefsBlock();
 const total=shopCost(d.shop.filter(i=>!isBase(i))),port=planPortions();
 h+='<div class="stats"><div class="stat"><span class="fn">Maten kostar ca</span><b>'+nv('m-total',total,'kr')+'</b></div><div class="stat"><span class="fn">Portioner</span><b>'+nv('m-port',port)+'</b></div><div class="stat"><span class="fn">Per portion</span><b>'+(port?nv('m-per',total/port,'kr'):'–')+'</b></div></div>';
 const order={Henrik:0,Vegetariskt:1,Gemensam:2};
 [...new Set(['Storkok','Vardag','Helg'].concat(ds.map(x=>x.g)))].forEach(g=>{const list=ds.filter(x=>x.g===g).sort((a,b)=>(order[(a.r||a.m).who]??3)-(order[(b.r||b.m).who]??3));if(!list.length)return;
  h+=sh(esc(g),'<span class="num">'+list.length+' '+(list.length===1?'rätt':'rätter')+'</span>')+group(list.map(dishCell).join(''));
  if(g==='Storkok'&&st.storkok_not)h+='<div class="foot">'+esc(st.storkok_not)+'</div>'});
 if(d.offers.length){h+=sh('Erbjudanden menyn bygger på')+group(d.offers.map(o=>'<div class="cell"><div class="grow"><div class="title">'+esc(o.item)+'</div><div class="meta">'+esc(o.store)+(o.note?' · '+esc(o.note):'')+'</div></div><span class="val">'+esc(o.price)+'</span></div>').join(''));
  if(st.erbjudanden_not)h+='<div class="foot">'+esc(st.erbjudanden_not)+'</div>'}
 return h+wishesBlock()+prefsBlock()}
/* Recept: inspiration från nätet att spara i receptbanken */
function matRecipes(){
 const all=inspoList(),f=S.inspoFilter||'alla';let h=fchips('inspoFilter',RFILT,f);
 if(!INSPO.list)return h+'<div style="height:16px"></div>'+group(emptyCell(INSPO.busy?'Hämtar recept…':'Recepten kunde inte hämtas. Försök igen när du har nät.'));
 const list=all.filter(r=>rfOk(f,r,new Set()));
 h+='<p class="inspo-intro">'+all.length+' recept att inspireras av. '+I.heartOn.replace('<svg','<svg class="ic fav"')+' gör ett recept till favorit och '+I.bookmarkOn.replace('<svg','<svg class="ic"')+' sparar det i receptbanken, så kan veckoplaneringen välja det.</p>';
 return h+(list.length?'<div class="bank mini">'+list.map(r=>rCard(r)).join('')+'</div>':group(emptyCell('Inga recept matchar filtret.')))}

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
 h+=rcpPhoto(r);
 h+='<div class="chips-row">'+whoChip(r.who)+(r.when?'<span class="chip">'+esc(r.when)+'</span>':'')+(r.freezes?'<span class="chip v">Går att frysa</span>':'')+'</div><h1 class="t1" id="lt">'+esc(r.title)+'</h1>'+rcpActions(r)+'</div>';
 const facts=[['Tid','<span class="num">'+r.min+'</span> min']];if(r.kr)facts.push(['Per portion',kr(r.kr)]);if(r.protein){const pr=String(r.protein).replace(/\s*\/\s*port(ion)?\.?$/i,''),ph=pr.match(/^henriks?\s+(?:del\s+)?(?:ca\s+)?(.+)$/i);facts.push(['Protein',esc(ph?ph[1]:pr)])}
 const kc=kcalOf(r.id);if(kc)facts.push(['Kalorier','<span class="num">'+kc.n+'</span> kcal']);
 h+='<div class="group" style="margin-top:16px"><div class="rcp-facts'+(facts.length>3?' f4':'')+'" style="grid-template-columns:repeat('+facts.length+',minmax(0,1fr))">'+facts.map(([l,v])=>'<div><div class="fn">'+l+'</div><div class="v">'+v+'</div></div>').join('')+'</div></div>';
 if(r.why)h+='<div class="group" style="margin-top:12px"><div class="note">'+esc(r.why)+'</div></div>';
 if(r.src)h+='<div class="foot"><a href="'+esc(r.src)+'" target="_blank" rel="noopener" style="color:var(--accent)">Inspiration från '+esc(r.srcName||'nätet')+'</a></div>';
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
/* Tidigast igen: hur snart en rätt får föreslås igen. Räknas av matpoang.js från baslinjen och stjärnorna.
   Sparas i Inställningar: frekvens = {id:{w,t,d}} där w är baslinjen i veckor som sattes första gången rätten lagades (0 = aldrig),
   I samma post: n = hur många gånger rätten lagats och l = senast. receptlogg = {id:'ÅÅÅÅ-MM-DD'} fylls av söndagsrutinen.
   Allt ligger i rader som appen redan får skriva, så ingen ändring i Kod.gs behövs. */
const MP=window.MatPoang;
const BASW=[1,2,3,4,6,8,12];
const freqs=()=>parseJ(settings().frekvens,{});
const lagadAll=()=>{const o={};Object.entries(freqs()).forEach(([id,x])=>{if(x&&(x.n||x.l))o[id]={n:Number(x.n)||0,d:x.l||''}});return o};
const lastServed=id=>{const l=lagadAll()[id],r=parseJ(settings().receptlogg,{})[id]||'';return l&&l.d&&l.d>r?l.d:r};
const baseOf=id=>{const x=freqs()[id];return x&&x.w!=null&&x.w!==''?Number(x.w):null};
/* Smileys sparas i betyget: betyg[id].sm = [[måltidens datum, 1|0|-1|'x', vem, svarsdatum], ...] de 10 senaste. 'x' = lagade inte.
   Stjärnorna räknas från betyget och flyttas av smileys som kom efter den senaste manuella ändringen. */
const smileysAll=()=>{const o={};Object.entries(ratings()).forEach(([id,x])=>{if(x&&Array.isArray(x.sm))o[id]=x.sm});return o};
const smileysOf=id=>(smileysAll()[id]||[]).filter(x=>typeof x[1]==='number').map(x=>[x[3]||x[0],x[1]]);
const betygDatum=g=>g?g.people.map(([,e])=>e.d||'').sort().pop()||'':'';
function matLage(id){const g=ratingOf(id),b=baseOf(id),r=recipeById(id),l=lagadAll()[id]||{},last=lastServed(id);
 const d={s0:g?g.avg:null,smileys:smileysOf(id),sedan:betygDatum(g),bas:b!=null?b:(r?MP.grundintervall(r):2),fav:isFav(id),aldrig:!!(g&&g.never),lagad:{n:Number(l.n)||0,d:last||null}};
 return Object.assign(MP.lage(d,today()),{harBas:b!=null,betyg:!!g})}
// Stjärnor med upp till två decimaler, t.ex. 4,45
const starNum=n=>String(Math.round(n*100)/100).replace('.',',');
const veckor=w=>(w===1?'1 vecka':String(w).replace('.',',')+' veckor');
const freqChip=id=>{const l=matLage(id);if(!l.harBas&&!l.betyg)return'';return'<span class="chip">'+(l.paus?'Pausad':'Tidigast '+String(l.w).replace('.',',')+' v')+'</span>'};
// Spara att rätten är lagad (i dag eller den dag den stod på matsedeln). bas sätter också baslinjen om den saknas.
function cookedIn(o,id,t){const r=recipeById(id),x=o[id]||{};if(x.l!==t){x.n=(Number(x.n)||0)+1;if(!x.l||x.l<t)x.l=t}if(!x.t&&r)x.t=r.title;o[id]=x;return o}
function markCooked(id,dt){updJSON('frekvens',{},o=>cookedIn(o,id,dt||today()))}
/* Smiley-frågan på översikten: gårdagens middagar, och kvällens efter kl. 19, som inte har fått svar */
const SMIL=[[-1,'☹️','Inte så god'],[0,'😐','Okej'],[1,'😊','God']];
function smileyAsk(){const t=today(),y=addDays(t,-1),late=new Date().getHours()>=19,all=smileysAll(),seen=new Set();
 return D().menu.filter(m=>{const r=m.recipe&&recipeById(m.recipe);if(!r||r.course==='efterrätt'||m.who==='Borta')return false;
  if(!(m.date===y||(late&&m.date===t)))return false;const k=m.recipe+'|'+m.date;if(seen.has(k))return false;seen.add(k);
  return!(all[m.recipe]||[]).some(x=>x[0]===m.date)}).slice(0,3)}
function smileyCard(){const L=smileyAsk();if(!L.length)return'';const t=today(),allT=L.every(m=>m.date===t);
 return'<section class="smc"><div class="smc-h">'+I.fork+'<span>'+(allT?'Hur var maten ikväll?':'Hur var maten igår?')+'</span></div>'+
  L.map(m=>{const r=recipeById(m.recipe);return'<form class="smc-r" data-form="smiley" data-id="'+esc(m.recipe)+'" data-date="'+esc(m.date)+'">'+
   '<div class="smc-t"><div class="grow"><div class="chips-row">'+whoChip(m.who)+'</div><div class="title">'+esc(r.title)+'</div></div><span class="smc-face" aria-hidden="true">😐</span></div>'+
   '<input class="smc-sl" type="range" name="v" min="-1" max="1" step="1" value="0" aria-label="Hur god var '+esc(r.title)+'? Ledsen, neutral eller glad">'+
   '<div class="smc-lb" aria-hidden="true">'+SMIL.map(([,e])=>'<span>'+e+'</span>').join('')+'</div>'+
   '<div class="smc-b"><button type="button" class="tb" data-act="smileySkip" data-id="'+esc(m.recipe)+'" data-date="'+esc(m.date)+'">Lagade inte</button><button class="btn-fill">Spara</button></div></form>'}).join('')+'</section>'}
function saveSmiley(id,date,v){const who=S.me||'';
 const r=recipeById(id);updJSON('betyg',{},o=>{const x=o[id]=o[id]||{p:{}};if(!x.t&&r)x.t=r.title;x.sm=(x.sm||[]).filter(y=>y[0]!==date).concat([[date,v,who,today()]]).slice(-10);return o})}
function rateBlock(r){const g=ratingOf(r.id);if(!g)return'';
 return sh('Betyg','<span class="st">'+starsTxt(g.avg)+'</span> '+starNum(matLage(r.id).s))+
  group(g.people.map(([p,e])=>'<div class="cell"><div class="grow"><div class="title">'+esc(p)+' <span class="st">'+starsTxt(e.s)+'</span></div><div class="meta"><span class="chip '+(e.v==='igen'?'v':e.v==='aldrig'?'h':'')+'">'+esc(VERD[e.v]||'')+'</span>'+(e.c?'<span>'+esc(e.c)+'</span>':'')+(e.d?'<span>'+esc(dateShort(e.d))+'</span>':'')+'</div></div></div>').join('')+
  '<button class="cell link" data-act="rate" data-id="'+esc(r.id)+'"><span class="grow" style="color:var(--accent)">'+(S.me&&g.people.some(([p])=>p===S.me)?'Ändra ditt betyg':'Betygsätt receptet')+'</span>'+chevron+'</button>')}
/* Receptets bild: pennan byter eller tar bort fotot, hjärtat gör receptet till favorit, bokmärket sparar det i receptbanken
   och betyget står i nedre kanten */
const favBtn=(r,cls)=>{const on=isFav(r.id);return'<button class="'+cls+' rp-heart'+(on?' on':'')+'" data-act="favToggle" data-id="'+esc(r.id)+'" aria-pressed="'+on+'" aria-label="'+(on?'Favorit. Tryck för att ta bort som favorit':'Gör till favorit')+'">'+(on?I.heartOn:I.heart)+'</button>'};
const bookBtn=(r,cls)=>{const on=inBank(r.id);return'<button class="'+cls+' rp-book'+(on?' on':'')+'" data-act="bankToggle" data-id="'+esc(r.id)+'" aria-pressed="'+on+'" aria-label="'+(on?'Sparat i receptbanken. Tryck för att ta bort':'Spara i receptbanken')+'">'+(on?I.bookmarkOn:I.bookmark)+'</button>'};
function rcpPhoto(r){const img=imgOf(r.id)||r.img||'',g=ratingOf(r.id),busy=S.photoBusy===r.id;
 const heart=bookBtn(r,'rp-gl')+favBtn(r,'rp-gl');
 const score='<button class="rp-gl rp-score" data-act="rate" data-id="'+esc(r.id)+'" aria-label="'+(g?'Betyg '+g.avg.toFixed(1)+' av 5. Tryck för att betygsätta':'Betygsätt receptet')+'">'+
  (g?I.star+'<b class="num">'+starNum(matLage(r.id).s)+'</b><small>· '+g.people.length+' betyg</small>':I.starO+'<b>Betygsätt</b>')+'</button>';
 if(!img)return'<div class="rcp-photo rp-none"><label class="rp-add photo-pick">'+I.camera+'<span>'+(busy?'Laddar upp…':'Lägg till foto')+'</span><input type="file" accept="image/*" data-change="photo" data-id="'+esc(r.id)+'"'+(S.photoBusy?' disabled':'')+'></label>'+score+heart+'</div>';
 return'<div class="rcp-photo"><img src="'+esc(img)+'" alt="'+esc(r.title)+'">'+(busy?'<span class="rp-gl rp-busy">Laddar upp…</span>':'')+
  '<button class="rp-gl rp-edit" data-act="rcpSheet" data-id="'+esc(r.id)+'" data-k="photo" aria-label="Byt eller ta bort fotot">'+I.pencil+'</button>'+score+heart+'</div>'}
/* Raden under titeln: önska nästa vecka, tidigast igen och mer */
function rcpActions(r){const wished=wishes().some(x=>x.id===r.id),l=matLage(r.id);
 const lbl=l.paus?'Pausad':(l.harBas||l.betyg)?'Tidigast '+String(l.w).replace('.',',')+' v':'Tidigast igen';
 return'<div class="rp-row">'+
  '<button class="rp-ib'+(wished?' on':'')+'" data-act="wish" data-id="'+esc(r.id)+'" aria-pressed="'+wished+'"><span class="c">'+(wished?I.tick:I.calPlus)+'</span><span class="l">'+(wished?'Önskad nästa v':'Önska nästa v')+'</span></button>'+
  '<button class="rp-ib" data-act="rcpSheet" data-id="'+esc(r.id)+'" data-k="tidigast"><span class="c">'+I.repeat+'</span><span class="l">'+lbl+'</span></button>'+
  '<button class="rp-ib" data-act="rcpSheet" data-id="'+esc(r.id)+'" data-k="more"><span class="c">'+I.dots+'</span><span class="l">Mer</span></button></div>'}
// Bladet Tidigast igen: varför rätten får komma tillbaka när den får
function tidigastHtml(r){const l=matLage(r.id),b=baseOf(r.id),def=MP.grundintervall(r);
 const row=(k,v)=>'<div class="ti-row"><span>'+k+'</span><b>'+v+'</b></div>';
 const ny=!l.harBas&&!l.betyg;
 let h='<div class="ti-big">'+(l.paus?'Pausad':ny?'Inte satt än':veckor(l.w))+'</div><div class="ti-sub">'+(l.paus?esc(l.paus):ny?'Väljs när ni betygsätter rätten första gången':l.redo?'Kan föreslås nu':'Kan föreslås från '+esc(dateShort(l.tidigastDatum)))+'</div>';
 h+='<div class="ti-rows">'+
  row('Baslinje',b!=null?(b===0?'Aldrig':veckor(b)):'Förval '+veckor(def))+
  row('Stjärnor',l.betyg?starNum(l.s):'Inget betyg än')+
  (smileysOf(r.id).length?row('Smileys',SMIL.map(([v,e])=>e+' '+smileysOf(r.id).filter(x=>x[1]===v).length).join(' · ')):'')+
  (l.harBas||l.betyg?row('Favorit',isFav(r.id)?'Ja, 20 % tätare':'Nej'):'')+
  row('Senast lagad',l.senast?esc(dateShort(l.senast)):'Inte än')+
  (l.n?row('Lagad',l.n+(l.n===1?' gång':' gånger')):'')+'</div>';
 h+='<div class="ti-foot">Bättre stjärnor ger kortare tid, sämre ger längre. 1,5 stjärna över 3,5 halverar tiden, 1,5 under fördubblar den.</div>';
 return h}
/* Åtgärdsblad i iOS-stil för fotot och Mer */
function rcpSheetHtml(enter){const x=S.rcpSheet,r=recipeById(x.id);if(!r)return'';const id=esc(r.id),last=lastServed(r.id);
 let items='',head=esc(r.title);
 if(x.k==='photo')items='<label class="it photo-pick">'+I.camera+'Byt foto<input type="file" accept="image/*" data-change="photo" data-id="'+id+'"></label>'+
  (x.confirm?'<button class="it red strong" data-act="photoRemove" data-id="'+id+'">'+I.trash+'Ja, ta bort fotot</button>':'<button class="it red" data-act="rcpConfirm">'+I.trash+'Ta bort fotot</button>');
 else if(x.k==='tidigast'){head='<b>Tidigast igen</b><br>'+esc(r.title)+tidigastHtml(r)}
 else if(x.k==='unbank'){head='Ta bort '+esc(r.title)+' ur receptbanken? Fotot tas också bort.';items='<button class="it red strong" data-act="bankToggle" data-id="'+id+'">'+I.bookmark+'Ta bort ur receptbanken</button>'}
 else{if(last){const l=matLage(r.id);head+='<br>Senast lagad '+esc(dateShort(last))+(l.tidigastDatum&&!l.paus?' · tidigast igen '+esc(dateShort(l.tidigastDatum)):'')}
  items=(inBank(r.id)?'<button class="it" data-act="bankToggle" data-id="'+id+'">'+I.bookmark+'Ta bort ur receptbanken</button>':'<button class="it" data-act="bankToggle" data-id="'+id+'">'+I.bookmark+'Spara i receptbanken</button>')+
  (x.confirm?'<div class="ttl">Receptet tas bort ur receptbanken och föreslås aldrig igen.</div><button class="it red strong" data-act="deleteRecipe" data-id="'+id+'">'+I.trash+'Ja, föreslå aldrig igen</button>':'<button class="it red" data-act="rcpConfirm">'+I.trash+'Föreslå aldrig igen</button>')}
 return'<div class="asheet'+enter+'" data-act="sheetBg"><div class="as-panel" role="dialog" aria-modal="true" aria-label="'+(x.k==='photo'?'Foto':x.k==='tidigast'?'Tidigast igen':x.k==='unbank'?'Ta bort ur receptbanken':'Mer')+'"><div class="grp"><div class="ttl">'+head+'</div>'+items+'</div><div class="grp"><button class="it strong" data-act="sheetClose">'+(x.k==='tidigast'?'Stäng':'Avbryt')+'</button></div></div></div>'}
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
 evs.filter(e=>!isBdEv(e)).forEach(e=>{const w=evPerson(e);out.push(w&&people().includes(w)?'e '+pcls(w):'e o')});
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
   return'<div class="ev'+(x.st==='past'?' past':'')+'"><span class="t">'+esc(e.time||'Heldag')+'</span><span class="grow">'+evTitle(e)+who(e)+'</span>'+r+'</div>'}).join('')+'</div>'}
 if(CAL_STYLE==='2'){
  // förslag 2: det som pågår får en tunn förloppsstapel under titeln
  return head+'<div class="evs">'+evs.map(e=>{const x=st.get(e)||{};
   const bar=x.st==='now'?'<div class="ev-pb"><span class="pb"><i style="width:'+Math.round(x.p*100)+'%"></i></span><span class="pbt num">'+x.left+' kvar</span></div>':'';
   const r=x.st==='next'?'<span class="cd">om '+x.inn+'</span>':'';
   return'<div class="ev'+(x.st==='past'?' past':'')+(x.st==='now'?' now':'')+'"><span class="t">'+esc(e.time||'Heldag')+'</span><span class="grow"><span class="ev-ti">'+evTitle(e)+who(e)+'</span>'+bar+'</span>'+r+'</div>'}).join('')+'</div>'}
 // förslag 3: dagens tidsaxel med block och en nu-linje, listan under visar bara starttid
 const timed=evs.filter(e=>st.has(e)||/^\d/.test(e.time||'')),allday=evs.filter(e=>!/^\d/.test(e.time||''));
 const at=v=>{const m=/^(\d{1,2})[.:](\d{2})/.exec(v||'');return m?Number(m[1])*60+Number(m[2]):null},en=v=>{const m=/[–-]\s*(\d{1,2})[.:](\d{2})/.exec(v||'');return m?Number(m[1])*60+Number(m[2]):null};
 let lo=Math.min(7*60,...timed.map(e=>at(e.time))),hi=Math.max(21*60,...timed.map(e=>en(e.time)||at(e.time)+30));lo=Math.floor(lo/60)*60;hi=Math.ceil(hi/60)*60;
 const X=m=>((m-lo)/(hi-lo)*100).toFixed(2),n=new Date(),nm=n.getHours()*60+n.getMinutes();
 let ax='<div class="tl"><div class="tl-track">'+timed.map((e,i)=>{const s0=at(e.time),e0=en(e.time)||s0+30,w=evPerson(e);
  return'<i class="tl-b '+(w&&people().includes(w)?pcls(w):'o')+'" style="left:'+X(s0)+'%;width:'+(X(e0)-X(s0))+'%;top:'+(i%2?11:2)+'px"></i>'}).join('')+
  (sel===t&&nm>=lo&&nm<=hi?'<b class="tl-now" style="left:'+X(nm)+'%"></b>':'')+'</div><div class="tl-ax num">';
 for(let h=lo;h<=hi;h+=180)ax+='<span style="left:'+X(h)+'%">'+pad(h/60)+'</span>';ax+='</div></div>';
 return head+ax+'<div class="evs">'+allday.concat(timed).map(e=>{const x=st.get(e)||{};
  const r=x.st==='now'?'<span class="cd now">'+x.left+' kvar</span>':x.st==='next'?'<span class="cd">om '+x.inn+'</span>':'';
  return'<div class="ev'+(x.st==='past'?' past':'')+'"><span class="t short">'+esc(e.time?String(e.time).split(/\s*[–-]\s*/)[0]:'Heldag')+'</span><span class="grow">'+evTitle(e)+who(e)+'</span>'+r+'</div>'}).join('')+'</div>'}
function calWidget(){const t=today(),wk=[];for(let i=0;i<7;i++)wk.push(addDays(t,i));
 const sel=wk.includes(S.ovDay)?S.ovDay:t;
 let strip='<div class="wk" role="group" aria-label="Veckans dagar">';
 wk.forEach((k,i)=>{const dt=parse(k),dots=calDots(k);
  strip+='<button class="wk-d'+(i===0?' today':'')+(k===sel?' sel':'')+'" data-act="ovDay" data-id="'+k+'" aria-pressed="'+(k===sel)+'" aria-label="'+esc(dateLong(k))+(dots.length?', '+dots.length+' saker':'')+'"><span class="wd">'+(i===0?'Idag':cap(DAYS[dt.getDay()].slice(0,3)))+'</span><span class="n num">'+dt.getDate()+'</span><span class="dots">'+dots.map(c=>'<i class="'+c+'"></i>').join('')+'</span></button>'});
 strip+='</div>';
 // under ett streck: dagens att göra-uppgifter med egen rubrik
 const ts=D().tasks.filter(x=>x.due===sel&&!x.done);
 const todo=ts.length&&!wallBoardOn()?'<div class="wk-todo wk-link" data-act="taskList" role="link" tabindex="0" aria-label="Att göra, öppna Uppgifter"><div class="wk-sub">Att göra</div><div class="evs">'+ts.map(x=>'<div class="ev task"><span>'+esc(x.title)+evWho(x)+'</span></div>').join('')+'</div></div>':'';
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
 const evRow=e=>{const w=evPerson(e);return'<div class="cell cal-ev edit" data-act="evEdit" data-id="'+d.events.indexOf(e)+'" role="button" tabindex="0"><span class="bar '+(w&&people().includes(w)?pcls(w):'o')+'"></span><span class="t num">'+esc(e.time||'Heldag')+'</span><span class="grow"><span class="title">'+evTitle(e)+'</span>'+(evWho(e)?'<span class="meta">'+evWho(e)+'</span>':'')+'</span></div>'};
 const body=evs.map(evRow).join('')+late.concat(ts).map(taskRow).join('');
 h+=group(body||emptyCell('Inget inplanerat. Tryck på Ny uppgift för att lägga till något.'));
 if(meals.length)h+=sh('Mat')+group(meals.map(mealCell).join(''));
 // de närmaste dagarna i listform
 const next=[];for(let i=1;i<=6;i++){const k=addDays(sel,i),n=d.events.filter(e=>e.date===k).length+d.tasks.filter(x=>x.due===k&&!x.done).length;if(n)next.push([k,n])}
 if(next.length)h+=sh('Kommande dagar')+group(next.map(([k,n])=>'<button class="cell link" data-act="calDay" data-id="'+k+'"><span class="grow">'+esc(cap(dayHead(k)))+'</span><span class="val num">'+n+(n===1?' sak':' saker')+'</span>'+chevron+'</button>').join(''));
 h+='<div class="foot">Händelserna kommer från Google Kalender och uppdateras var 15:e minut. Tryck på en händelse eller uppgift för att ändra eller ta bort den.</div>';
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
 const meta=(x.due?'<span'+(late?' class="red"':'')+'>'+esc(x.due===t?'Idag':dateShort(x.due))+'</span>':'')+(repName(x.repeat)?'<span class="chip">↻ '+esc(repName(x.repeat))+'</span>':'')+(x.who?personChip(x.who):'')+(x.note?'<span>'+esc(x.note)+'</span>':'');
 return'<div class="cell ck'+(x.done?' done':'')+'"><input type="checkbox" class="check" data-act="taskToggle" data-id="'+esc(x.id)+'" aria-label="'+esc(x.title)+'"'+(x.done?' checked':'')+'><div class="grow'+(S.view==='uppgifter'?' edit" data-act="taskEdit" data-id="'+esc(x.id)+'" role="button" tabindex="0" aria-label="Ändra '+esc(x.title)+'"':'"')+'><div class="title">'+esc(x.title)+'</div>'+(meta?'<div class="meta">'+meta+'</div>':'')+'</div></div>'}

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
 return'<div class="cell ck'+(d?' done':'')+'"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(t.id)+'" aria-label="'+esc(t.title)+'"'+(d?' checked':'')+'><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span class="num">'+t.min+' min</span>'+(t.who?personChip(t.who):'')+(showWhy&&why?'<span>'+why+'</span>':'')+(d&&t.doneBy?'<span>klart av '+esc(t.doneBy)+'</span>':'')+(t.tip&&!d?'<span>'+esc(t.tip)+'</span>':'')+'</div></div>'+
 (offer?'<button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Ta idag</button>':(!d&&t.freq>1&&showWhy?'<button class="pill" data-act="snooze" data-id="'+esc(t.id)+'">I morgon</button>':''))+'</div>'}
function bigRow(t){return'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span>'+t.min+' min</span><span>'+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</span></div></div><div class="pills" style="flex-wrap:nowrap"><button class="pill" data-act="planSat" data-id="'+esc(t.id)+'">Lördag</button><button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Idag</button></div></div>'}

/* ---------- overlay ---------- */
function sheetHtml(form,title,right,body,enter){return'<div class="sheet'+enter+'" data-act="sheetBg"><form class="sheet-panel" data-form="'+form+'" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="grabber" aria-hidden="true"></div><div class="sheet-head"><button type="button" class="tb" data-act="sheetClose">Avbryt</button><h2>'+title+'</h2>'+right+'</div><div class="sheet-body">'+body+'</div></form></div>'}
const fieldCell=(label,input)=>'<label class="cell"><span class="grow">'+label+'</span>'+input+'</label>';
function renderOverlay(){
 const o=document.getElementById('overlay');
 const k=S.cook?'cook':S.sheet==='settings'?'settings':S.sheet==='rate'?'rate':S.sheet==='income'?'income':S.sheet==='cost'?'cost':S.sheet==='prefs'?'prefs':S.sheet==='swap'?'swap':S.sheet==='wish'?'wish':S.rcpSheet?'rcpSheet':S.sheet==='taskEdit'?'taskEdit':S.sheet==='evEdit'?'evEdit':S.shopAdd?'shop':S.taskAdd?'task':'';
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
  sh('Namn och färg i hushållet')+[0,1].map(i=>group('<div class="cell"><span class="pdot p'+(i+1)+'"></span><input class="field" id="set-p'+(i+1)+'" name="p'+(i+1)+'" aria-label="Person '+(i+1)+'" value="'+esc(people()[i]||'')+'"></div>'+
   '<div class="cell"><div class="pcols" role="radiogroup" aria-label="Färg för person '+(i+1)+'">'+Object.keys(PCOL).map(k=>'<label title="'+PCOL[k][0]+'"><input type="radio" name="c'+(i+1)+'" value="'+k+'"'+(personColor(i)===k?' checked':'')+'><span style="--c:'+PCOL[k][1]+';--cd:'+PCOL[k][3]+'"></span></label>').join('')+'</div></div>')).join('<div style="height:10px"></div>')+
  '<div class="foot">Färgen används för era händelser, uppgifter, sysslor och i Ekonomi.</div>'+
  sh('Städtid och budget')+group(fieldCell('Vardag, min','<input class="field r" id="set-wd" name="wd" inputmode="numeric" value="'+esc(st.stadtid_vardag||20)+'" style="max-width:110px">')+fieldCell('Helg, min','<input class="field r" id="set-we" name="we" inputmode="numeric" value="'+esc(st.stadtid_helg||40)+'" style="max-width:110px">')+fieldCell('Mat/vecka, kr','<input class="field r" id="set-budget" name="budget" inputmode="numeric" value="'+esc(st.matbudget||'')+'" style="max-width:110px">'))+
  sh('Utseende')+'<div class="seg-wrap">'+segc('Utseende','theme',[['system','System'],['light','Ljust'],['dark','Mörkt']],S.theme)+'</div>'+
  sh('Schemat i kalenderrutan')+'<div class="seg-wrap">'+segc('Schemat i kalenderrutan','calStyle',[['1','Tid kvar'],['2','Stapel'],['3','Tidsaxel']],CAL_STYLE)+'</div>'+
  sh('Översikten')+group('<button type="button" class="cell link" data-act="arrange"><span class="grow">Ändra ordning på rutorna</span>'+chevron+'</button>')+'<div class="foot">Gäller bara den här enheten. Du kan också hålla fingret på en ruta en stund.</div>'+
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
 if(k==='rcpSheet'){const h=rcpSheetHtml(enter);if(!h){closeSheets();o.innerHTML='';o.dataset.k='';return}o.innerHTML=h;return}
 if(k==='rate'){const r=recipeById(S.rate&&S.rate.id);if(!r){closeSheets();o.innerHTML='';o.dataset.k='';return}
  const who=S.me||'',x=(ratings()[r.id]||{}).p||{},cur=x[who]||{};
  const stars='<div class="stars" role="radiogroup" aria-label="Stjärnor">'+[5,4,3,2,1].map(n=>'<input type="radio" name="s" id="st'+n+'" value="'+n+'"'+(Number(cur.s)===n?' checked':'')+' required><label for="st'+n+'" aria-label="'+n+' stjärnor">★</label>').join('')+'</div>';
  const verd='<div class="vpick" role="radiogroup" aria-label="Laga igen?">'+[['igen','Laga igen'],['okej','Okej'],['aldrig','Aldrig mer']].map(([v,l])=>'<label><input type="radio" name="v" value="'+v+'"'+(cur.v===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div>';
  const body='<div class="rate-head"><div class="rate-ic" aria-hidden="true">'+foodIcon(r.title)+'</div><div class="hl">'+esc(r.title)+'</div></div>'+
   (who?'':sh('Vem betygsätter?')+'<div class="vpick">'+people().map(p=>'<label><input type="radio" name="who" value="'+esc(p)+'" required><span>'+esc(p)+'</span></label>').join('')+'</div>')+
   sh('Hur gott var det?')+stars+sh('Ska vi laga det igen?')+verd+
   (baseOf(r.id)==null?sh('Hur ofta får den komma tillbaka som tidigast?')+'<div class="vpick basw">'+BASW.map(w=>'<label><input type="radio" name="bas" value="'+w+'"'+(w===MP.grundintervall(r)?' checked':'')+'><span>'+w+' v</span></label>').join('')+'</div><div class="foot">Det här är startvärdet. Sedan ändras det med stjärnorna: bättre betyg ger kortare tid.</div>':'')+
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
 if(k==='taskEdit'){const x=S.edit||{},rp=repName(x.repeat),who=String(x.who||'');
  const ask=S.confirm==='delTask';
  const del=!ask?'<button type="button" class="cell link center red" data-act="taskDelAsk">Ta bort uppgiften</button>':
   rp?'<div class="cell"><span class="grow">Uppgiften upprepas '+esc(rp.toLowerCase())+'. Vad vill du ta bort?</span></div><button type="button" class="cell link center red" data-act="taskDel" data-id="once">Bara den här gången</button><button type="button" class="cell link center red" data-act="taskDel" data-id="all">Alla gånger</button><button type="button" class="cell link center" data-act="confirmNo">Avbryt</button>':
   '<div class="cell"><span class="grow">Ta bort uppgiften?</span><button type="button" class="tb red strong" data-act="taskDel" data-id="all">Ja, ta bort</button><button type="button" class="tb" data-act="confirmNo">Avbryt</button></div>';
  const body='<div style="height:16px"></div>'+group('<div class="cell"><input class="field" id="te-title" name="title" value="'+esc(x.title||'')+'" required autocomplete="off" aria-label="Uppgift"></div>'+
   fieldCell('Datum','<input class="field r" id="te-due" name="due" type="date" value="'+esc(isDate(x.due)?x.due:'')+'" style="max-width:170px">')+
   fieldCell('Vem',menuSel('id="te-who" name="who"','<option value="">Vem som helst</option>'+people().concat(['Båda']).concat(who&&!people().includes(who)&&who!=='Båda'?[who]:[]).map(p=>'<option'+(p===who?' selected':'')+'>'+esc(p)+'</option>').join('')))+
   fieldCell('Upprepa',menuSel('id="te-rep" name="repeat"',REPEATS.map(([k,l])=>'<option value="'+k+'"'+(k===(rp?x.repeat:'')?' selected':'')+'>'+l+'</option>').join(''))))+
   (rp?'<div class="foot">Ändringen gäller alla gånger uppgiften kommer tillbaka.</div>':'')+
   '<div style="height:22px"></div>'+group(del);
  o.innerHTML=sheetHtml('taskEdit','Ändra uppgift','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='evEdit'){const e=S.edit||{},fl=String(e.flags||''),allDay=fl?fl.includes('a'):!e.time,rec=fl.includes('r');
  // Kalenderhändelser kan ändras när Kod.gs skriver id:n (kolumn F i Händelser). Helgdagar och kontakternas födelsedagar har inget id.
  const cal=e.source==='kalender',locked=cal&&!e.id,old=cal&&!('id' in e);
  const tm=String(e.time||'').match(/^(\d{1,2})[.:](\d{2})(?:\s*[–-]\s*(\d{1,2})[.:](\d{2}))?/),st=tm?pad(+tm[1])+':'+tm[2]:'',en=tm&&tm[3]?pad(+tm[3])+':'+tm[4]:'';
  if(locked){const body='<div style="height:16px"></div>'+group('<div class="cell cal-ev"><span class="t num">'+esc(e.time||'Heldag')+'</span><span class="grow"><span class="title">'+esc(e.title)+'</span></span></div>')+
    '<div class="foot">'+(old?'Kalenderhändelser går att ändra och ta bort här när Kod.gs har uppdaterats på datorn.':'Helgdagar och födelsedagar från kontakterna går inte att ändra här. Ändra dem i Google Kalender eller Kontakter.')+'</div>';
   o.innerHTML=sheetHtml('evEdit','Händelse','',body,enter);return}
  const ask=S.confirm==='delEv';
  const del=!ask?'<button type="button" class="cell link center red" data-act="evDelAsk">Ta bort händelsen</button>':
   rec?'<div class="cell"><span class="grow">Händelsen upprepas. Vad vill du ta bort?</span></div><button type="button" class="cell link center red" data-act="evDel" data-id="once">Bara den här gången</button><button type="button" class="cell link center red" data-act="evDel" data-id="all">Alla gånger</button><button type="button" class="cell link center" data-act="confirmNo">Avbryt</button>':
   '<div class="cell"><span class="grow">Ta bort händelsen'+(cal?' ur Google Kalender':'')+'?</span><button type="button" class="tb red strong" data-act="evDel" data-id="all">Ja, ta bort</button><button type="button" class="tb" data-act="confirmNo">Avbryt</button></div>';
  const body='<div style="height:16px"></div>'+group('<div class="cell"><input class="field" id="ee-title" name="title" value="'+esc(e.title||'')+'" required autocomplete="off" aria-label="Titel"></div>'+
   fieldCell('Datum','<input class="field r" id="ee-date" name="date" type="date" value="'+esc(e.date||'')+'" required style="max-width:170px">')+
   fieldCell('Heldag','<input type="checkbox" class="switch" id="ee-allday" name="allDay"'+(allDay?' checked':'')+'>')+
   '<div id="ee-times"'+(allDay?' hidden':'')+'>'+fieldCell('Börjar','<input class="field r" name="start" type="time" value="'+st+'" style="max-width:130px">')+fieldCell('Slutar','<input class="field r" name="end" type="time" value="'+en+'" style="max-width:130px">')+'</div>')+
   '<div class="foot">'+(cal?'Ändras i Google Kalender'+(rec?', bara den här gången. Hela serien ändrar du i kalendern.':'.'):'Finns bara i hushållstavlan.')+'</div>'+
   '<div style="height:22px"></div>'+group(del);
  o.innerHTML=sheetHtml('evEdit','Ändra händelse','<button class="tb strong">Spara</button>',body,enter);return}
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
 return{src:y.src,now:cur,hours:hrs.slice(0,25),all:hrs,days:dl}}
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
function skyHtml(W,big){const P=WX_POS(),sc=wxScene(W),k=SKY(new Date(),P.lat,P.lon),sz=big?56:wallBoardOn()?84:44,pk=big?null:skyPeak(P.lat,P.lon);
 const covered=sc.sky==='cloudy'||sc.sky==='fog'||/^(rain|sleet|snow)$/.test(sc.type)&&sc.lv>=2||sc.thunder,op=covered?.35:1;
 // i översikten går banan från namnsdagsraden (--hz) upp till rutans överkant, där solen får beskäras
 const at=(b,html,cls,f)=>{const q=skyXY(b),pos=big?'top:'+q.y.toFixed(1)+'%':'top:calc(var(--hz,62%) - '+Math.max(0,Math.min(1,b.alt/Math.max(pk[cls==='sky-sun'?'sun':'moon'],8))).toFixed(3)+' * (var(--hz,62%) - 8px))';
  return'<div class="sky-b '+cls+'" style="left:'+(wallBoardOn()&&!big?50:q.x).toFixed(1)+'%;'+pos+';opacity:'+(op*(f||1))+'">'+html+'</div>'};
 let h='';
 // stjärnor när det är mörkt och himlen inte är täckt
 if(sc.dark&&!covered)h+='<svg class="sky-stars" viewBox="0 0 100 100" preserveAspectRatio="none">'+[[8,14],[22,40],[36,10],[47,28],[61,8],[70,36],[83,18],[93,44],[15,62],[55,52]].slice(0,sc.sky==='partly'?4:10)
  .map(([x,y],i)=>'<circle class="tw'+(i%3?' d'+(i%3+1):'')+'" cx="'+x+'" cy="'+y+'" r=".45"/>').join('')+'</svg>';
 if(k.sun.alt>-1)h+=at(k.sun,sunSvg(k.sun.alt<8,big?sz:wallBoardOn()?104:84),'sky-sun');
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
/* Gräsplätten hundarna står på i översikten. Ingen annan bakgrund: årstiden och vädret syns i gräset,
   med påskliljor runt påsk, löv på hösten och snö som ligger kvar tills det töar. */
function easterDay(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,
 i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return y+'-'+pad(Math.floor(n/31))+'-'+pad(n%31+1)}
function grassSeason(t){const mo=+t.slice(5,7),e=easterDay(+t.slice(0,4));
 if(t>=addDays(e,-9)&&t<=addDays(e,3))return'easter';   // från veckan före palmsöndagen till efter annandagen
 return mo===12||mo<=2?'winter':mo===3?'early':mo<=5?'spring':mo<=8?'summer':mo===9?'autumn1':mo===10?'autumn2':'autumn3'}
// snöminnet: centimeter snö på marken, uppskattat ur prognosens timmar som har passerat (1 mm nederbörd ≈ 1 cm snö) och töväder
function snowDepth(){const y=EXT.yr,now=Date.now(),m=parseJ(lsGet('snow'),null)||{cm:0,at:now};
 if(y&&y.ts){let last=m.at;y.ts.forEach(x=>{const t=new Date(x.t).getTime();if(t<=m.at||t>now)return;last=Math.max(last,t);
   const b=symBase(x.s),p=x.pr!=null?x.pr:/heavy/.test(b)?2:/light/.test(b)?.3:.8;
   if(/snow/.test(b)&&x.T<=1.5)m.cm+=p;else if(/sleet/.test(b))m.cm+=x.T<=.5?p*.5:-p;else if(x.T>0)m.cm-=x.T*.15+(/rain/.test(b)?p*.8:0);
   m.cm=Math.max(0,Math.min(60,m.cm))});
  if(last!==m.at){m.at=last;lsSet('snow',JSON.stringify(m))}}
 return m.cm}
// 0 ingen snö, 1 fläckar, 2 vitt täcke, 3 djup snö som hundarnas tassar sjunker ned i
function snowLevel(sc){const cm=snowDepth(),falling=sc.type==='snow'&&(sc.lv>=2||sc.T<=0)?(sc.lv>=3?2:1):0;
 return Math.max(falling,cm<.5?0:cm<4?1:cm<12?2:3)}
const GRASS={winter:['#94A27A','#6F7F5B'],early:['#9AB070','#728B55'],spring:['#93CF60','#63A443'],easter:['#93CF60','#63A443'],summer:['#7CC157','#50983B'],
 autumn1:['#A6B85C','#7E9142'],autumn2:['#B5A95B','#8A8043'],autumn3:['#A09163','#776B4B']};
function grassPatch(sc,id){const ss=grassSeason(today()),snow=snowLevel(sc),frost=!snow&&sc.T<0,wet=/^(drizzle|rain|sleet)$/.test(sc.type)||sc.thunder;
 let[g1,g2]=GRASS[ss];if(frost){g1=mixHex(g1,'#E2ECF5',.42);g2=mixHex(g2,'#C6D5E4',.3)}if(wet){g1=shadeHex(g1,.88);g2=shadeHex(g2,.88)}
 const rnd=k=>{const x=Math.sin(k*91.7+3.1)*43758.5453;return x-Math.floor(x)},f=v=>v.toFixed(1);
 // en mjuk oval med lite ojämn kant, som i en tecknad bild
 const blob=(cx,cy,rx,ry,j,seed)=>{const n=16,P=[];for(let i=0;i<n;i++){const a=i/n*2*Math.PI,r=1+(rnd(i+seed)-.5)*j;P.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r])}
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];let d='M'+mid(P[n-1],P[0]).map(f).join(' ');
  P.forEach((p,i)=>{const m=mid(p,P[(i+1)%n]);d+=' Q'+f(p[0])+' '+f(p[1])+' '+f(m[0])+' '+f(m[1])});return d+'Z'};
 const tuft=(x,y,c)=>'<path d="M'+x+' '+y+' l-2.4 -5.5 M'+(x+1.4)+' '+y+' l.3 -7 M'+(x+2.8)+' '+y+' l2.6 -4.6" stroke="'+c+'"/>';
 const TU=[[14,129],[26,121],[42,134],[60,137],[76,118],[98,118],[112,136],[128,133],[146,121],[156,130],[34,128],[136,128]];
 const tc=frost?'#E9F1F8':shadeHex(g1,.7);
 let b='<defs><linearGradient id="'+id+'gs" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="140"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F1F5FA"/><stop offset="1" stop-color="#CFDBE9"/></linearGradient></defs>',fr='';
 const deep=snow>=3;
 // snön ligger som en bubblig kudde: en kärna med en krans av rundlar längs kanten och en lite mörkare undersida
 const BUB=[];for(let i=0;i<22;i++){const a=i/22*2*Math.PI,r=5.5+rnd(i+60)*4.5;BUB.push([85+Math.cos(a)*(74-r*.55),127+Math.sin(a)*(10.5-r*.25),r])}
 const lobes=(dy,grow,fill)=>'<g fill="'+fill+'"><ellipse cx="85" cy="'+f(127+dy)+'" rx="'+f(70+grow)+'" ry="'+f(10+grow*.4)+'"/>'+
  BUB.map(([x,y,r])=>'<ellipse cx="'+f(x)+'" cy="'+f(y+dy)+'" rx="'+f(r+grow)+'" ry="'+f(r*.62+grow*.4)+'"/>').join('')+'</g>';
 // gräset har ingen hård kant: en ojämn yta med ljusare och mörkare fläckar, strån som sticker upp och små tuvor som läcker ut runt om
 const lite=mixHex(g1,'#FFFFFF',.2),dk=shadeHex(g1,.84);
 const blade=(x,y,h,lean,c)=>'<path d="M'+f(x-1.1)+' '+y+' Q'+f(x+lean*.4)+' '+f(y-h*.6)+' '+f(x+lean)+' '+f(y-h)+' Q'+f(x+lean*.4+.6)+' '+f(y-h*.5)+' '+f(x+1.1)+' '+y+'Z" fill="'+c+'"/>';
 const clump=(x,y,n,h,k)=>{let r='';for(let i=0;i<n;i++){const o=(i-(n-1)/2)*2.2,hh=h*(.6+rnd(k+i)*.55);r+=blade(x+o,y,hh,o*.9+(rnd(k+i+9)-.5)*3,i%2?(frost?'#E6EEF5':g2):(frost?'#D3E0EA':lite))}return r};
 if(snow>=2){b+=lobes(deep?1.2:2.4,deep?2:.3,'#A9BBD3');b+=lobes(deep?-2.5:0,deep?2:0,'url(#'+id+'gs)')}
 else{b+='<path d="'+blob(85,129.5,79,14,.22,3)+'" fill="'+g1+'"/>';
  b+=[[0,131,6,2.4],[166,133,7,2.6],[28,144,9,2],[134,144.5,11,2.1],[156,141.5,5,1.6],[-6,125,3,1.2],[175,127,3.5,1.3],[64,146.5,6,1.5],[104,146,3.5,1.1],[86,148.5,2.5,.9]].map(([x,y,rx,ry])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+g1+'"/>').join('');
  b+='<g opacity=".7">'+[[38,123,22,3.6,lite],[128,123.5,20,3.4,lite],[70,136,28,3.8,dk],[124,136.5,18,3,dk],[22,132,11,2.6,dk],[100,140,14,2.2,lite]].map(([x,y,rx,ry,c],i)=>'<path d="'+blob(x,y,rx,ry,.4,30+i)+'" fill="'+c+'"/>').join('')+'</g>'}
 // skuggan under hundarna, lite bort från solen
 b+='<ellipse cx="'+f(sc.sunUp?85+(.5-sc.f)*12:85)+'" cy="131.5" rx="50" ry="4.2" fill="'+(snow>=2?'#B7C6DA':shadeHex(g1,.72))+'" opacity=".85"/>';
 if(snow<2)b+=[[6,131,5,17,1],[17,123,4,13,2],[152,123,4,14,3],[164,131,5,18,4],[40,141,4,10,5],[124,142,5,12,6],[96,143,3,8,7],[66,142,4,10,8],[144,137,4,13,9],[28,135,3,11,10],[2,135,2,8,11],[170,136,2,8,12],[52,121,3,8,13],[116,121,3,8,14]].map(([x,y,n,h,k])=>clump(x,y,n,h,k*7)).join('');
 else b+='<g fill="none" stroke-width="1.2" stroke-linecap="round">'+[[12,130],[157,127],[86,138]].map(([x,y])=>tuft(x,y,mixHex(g2,'#FFFFFF',.2))).join('')+'</g>';
 // snöfläckar på gräset
 if(snow===1)b+='<g fill="#FAFCFF" stroke="#C9D6E6" stroke-width=".5">'+[[50,123,26,5.4,7],[114,125,28,5.8,9],[84,133,20,3.2,11],[22,129,11,3.4,13],[150,123,11,3.2,15],[40,134,9,2.4,17],[130,134,10,2.4,19]].map(([x,y,rx,ry,s])=>'<path d="'+blob(x,y,rx,ry,.35,s)+'"/>').join('')+'</g>';
 // löv på hösten (inte under snön)
 const LV={autumn1:[3,['#E0A24A','#D9894A','#C9B24A']],autumn2:[8,['#D9894A','#C9694F','#E0A24A','#B9503F']],autumn3:[5,['#A86B3E','#8E5A3A','#C07C45']]}[ss];
 if(LV&&snow<2){const L=[[24,125],[46,131],[120,133],[140,125],[64,134],[104,131],[154,127],[32,130]];
  b+=L.slice(0,LV[0]).map(([x,y],i)=>{const c=LV[1][i%LV[1].length];
   return'<g transform="translate('+x+' '+y+') rotate('+Math.round(rnd(i+40)*180-90)+')"><path d="M-5 0 Q-1 -3.6 5 0 Q-1 3.6 -5 0Z" fill="'+c+'"/><path d="M-5 0 H4" stroke="'+shadeHex(c,.7)+'" stroke-width=".5"/></g>'}).join('')}
 // vattenpölar i regn
 if((wet&&sc.type!=='drizzle'||sc.thunder)&&sc.lv>=2&&sc.T>0)b+='<g class="fx-pud"><ellipse cx="30" cy="130" rx="11" ry="2.2" fill="#8FC4F0" opacity=".5"/><ellipse cx="134" cy="131" rx="10" ry="2" fill="#8FC4F0" opacity=".5"/>'+
  [[30,130,0],[134,131,.7]].map(([x,y,d])=>'<ellipse class="rip" cx="'+x+'" cy="'+y+'" rx="4" ry="1" fill="none" stroke="#8FC4F0" stroke-width=".7" style="animation-delay:-'+d+'s"/>').join('')+'</g>';
 // blommor efter årstid: krokus i mars, vitsippor på våren, påskliljor runt påsk och prästkragar på sommaren
 const fl=(x,y,s,petal,mid,n)=>{let p='<path d="M'+x+' '+y+' q.6 -'+(5*s)+' 0 -'+(9*s)+'" stroke="#4F8A3C" stroke-width="'+(1*s)+'" fill="none"/><g transform="translate('+x+' '+f(y-9*s)+')">';
  for(let i=0;i<n;i++)p+='<ellipse rx="'+(1.15*s)+'" ry="'+(2.4*s)+'" cy="-'+(2*s)+'" transform="rotate('+(i*360/n)+')" fill="'+petal+'"/>';
  return p+'<circle r="'+(1.2*s)+'" fill="'+mid+'"/></g>'};
 const daff=(x,y,s)=>'<path d="M'+x+' '+y+' q1 -7 .5 -14 M'+(x-1)+' '+y+' q-4 -5 -3 -10 M'+(x+1)+' '+y+' q4 -4 3.5 -9" stroke="#4F8A3C" stroke-width="1.2" fill="none" stroke-linecap="round" transform="scale('+s+')" transform-origin="'+x+' '+y+'"/>'+
  '<g transform="translate('+(x+.5)+' '+f(y-14*s)+') scale('+s+')">'+[0,60,120,180,240,300].map(a=>'<ellipse rx="1.9" ry="3.4" cy="-3" transform="rotate('+a+')" fill="#FFE15A" stroke="#F2C230" stroke-width=".4"/>').join('')+
  '<circle r="2.3" fill="#F5A623"/><circle r="1.3" fill="#E08A12"/></g>';
 const crocus=(x,y)=>'<path d="M'+x+' '+y+' v-5" stroke="#4F8A3C" stroke-width="1"/><path d="M'+(x-2.4)+' '+(y-9)+' Q'+x+' '+(y-3)+' '+(x+2.4)+' '+(y-9)+' Q'+(x+1)+' '+(y-4.6)+' '+x+' '+(y-10)+' Q'+(x-1)+' '+(y-4.6)+' '+(x-2.4)+' '+(y-9)+'Z" fill="#9C7FD6" stroke="#7E62BC" stroke-width=".4"/>';
 if(snow<2){
  if(ss==='easter'){b+=daff(16,129,1.25)+daff(28,133,1)+daff(144,127,1.25)+daff(155,132,1.05);fr+=daff(76,139,.85)}
  else if(ss==='early')b+=crocus(22,128)+crocus(28,131)+crocus(146,127)+crocus(140,131);
  else if(ss==='spring')b+=[[20,128],[34,132],[144,126],[152,130],[118,134]].map(([x,y])=>fl(x,y,.6,'#FFFFFF','#F2C94C',6)).join('');
  else if(ss==='summer')b+=[[18,128],[30,132],[146,125],[154,130],[120,134]].map(([x,y],i)=>fl(x,y,i%2?.65:.8,'#FFFFFF','#F2B705',10)).join('')}
 // djup snö: drivor framför tassarna och en snökant runt plätten
 // några strån framför tassarna så att hundarna står i gräset
 if(snow<2)fr+=[[34,136,3,6,31],[62,136.5,3,5,32],[104,136.5,3,6,33],[134,136,3,5,34]].map(([x,y,n,h,k])=>clump(x,y,n,h,k*7)).join('');
 if(deep)fr+='<g fill="url(#'+id+'gs)"><path d="'+blob(50,134,21,4.6,.25,21)+'"/><path d="'+blob(114,134.5,22,4.6,.25,23)+'"/></g>';
 return{back:b,front:fr}}
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
 if(o.patch&&!(wet||snow||sc.thunder))base=null;   // på gräsplätten bara moln när det regnar eller snöar
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
 const flt=x=>dark?'<g filter="url(#'+id+'n)">'+x+'</g>':warmL?'<g filter="url(#'+id+'w)">'+x+'</g>':x,gp=o.patch?grassPatch(sc,id):null;
 if(gp)s+=flt(gp.back);
 else if(!o.nodogs)s+='<ellipse cx="'+(sc.sunUp&&!covered?85+(.5-sc.f)*24:85)+'" cy="125" rx="62" ry="5" fill="url(#'+id+'s)"/>';
 if(gp);else if(snow&&(lv>=2||sc.T<=0))s+='<path d="M0 127 Q30 114 70 118 Q110 113 170 125 V131 H0Z" fill="url(#'+id+'d)"/><path d="M8 124 Q40 117 70 119" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>';
 else if(sc.T<0)s+='<path d="M10 126 Q85 119 160 126" stroke="#BFD6F2" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>';
 if(!gp&&(wet&&sc.type!=='drizzle'||sc.thunder)&&lv>=2&&sc.T>0)s+='<g class="fx-pud"><ellipse cx="20" cy="127" rx="15" ry="2.4" fill="#8FC4F0" opacity=".35"/><ellipse cx="152" cy="128" rx="13" ry="2.2" fill="#8FC4F0" opacity=".35"/>'+
  [[20,127,0],[152,128,.7],[26,127,1.3]].map(([x,y,d])=>'<ellipse class="rip" cx="'+x+'" cy="'+y+'" rx="5" ry="1.2" fill="none" stroke="#8FC4F0" stroke-width=".8" style="animation-delay:-'+d+'s"/>').join('')+'</g>';
 if(sc.T<0&&!gp)s+='<g class="fx-frost" fill="#BFD6F2">'+[[16,40],[34,22],[132,46],[160,58],[10,78],[156,96],[24,104]].map(([x,y],k)=>'<path class="tw'+(k%3?' d'+(k%3+1):'')+'" d="M'+x+' '+(y-4)+' L'+(x+1)+' '+(y-1)+' L'+(x+4)+' '+y+' L'+(x+1)+' '+(y+1)+' L'+x+' '+(y+4)+' L'+(x-1)+' '+(y+1)+' L'+(x-4)+' '+y+' L'+(x-1)+' '+(y-1)+'Z"/>').join('')+'</g>';
 // 5. hundarna. Varianten listar hundarna från vänster: a/b = fawn/svart sittande, A/B = liggande och sovande
 const v=o.variant||figVariant(sc),toks=v.split(''),oo={fit:sc.fit,night:dark};
 const one=(t,pos)=>{const isA=t.toLowerCase()==='a',lie=t===t.toUpperCase(),g=dogSvg(DOGS[isA?0:1],oo,id+(isA?'a':'b'),lie?'lie':'sit');
  let tr;
  if(pos==='c')tr=lie?'translate(26 4)':(isA?'translate(29 6) scale(.95)':'translate(25 0)');
  else if(lie)tr=pos==='l'?'translate(-8 '+(isA?14:8)+') scale('+(isA?.8:.85)+')':'translate('+(isA?82:76)+' '+(isA?14:8)+') scale('+(isA?.8:.85)+')';
  else tr=pos==='l'?(isA?'translate(4 6) scale(.9)':'translate(4 0)'):(isA?'translate(64 6) scale(.9)':'translate(58 0)');
  // på gräsplätten flyttas varje hund ned så att tassarna (eller magen när den ligger) vilar mitt på gräset
  if(o.patch){const m=/translate\(([-\d.]+) ([-\d.]+)\)(?: scale\(([\d.]+)\))?/.exec(tr),k=m&&m[3]?+m[3]:1;if(m)tr='translate('+m[1]+' '+(132-k*123.4).toFixed(1)+')'+(m[3]?' scale('+m[3]+')':'')}
  return'<g class="dog-'+(isA?'a':'b')+'" transform="'+tr+'">'+g+'</g>'};
 const dogs=toks.length===1?one(toks[0],'c'):one(toks[0],'l')+one(toks[1],'r');
 if(!o.nodogs)s+=flt(dogs);
 if(gp&&gp.front)s+=flt(gp.front);
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
 return'<svg class="fig k-'+sc.tc+' w'+sc.wl+(sc.sleep?' zz':'')+'" viewBox="0 0 170 '+(o.patch?150:130)+'" role="img" aria-label="'+esc(o.label||sc.label)+'">'+s+'</svg>'}

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
 const arc=h.querySelector('.arc.b'),gf=h.querySelector('.fig-box.grass');
 if(arc&&gf){const hr=h.getBoundingClientRect(),fr=gf.getBoundingClientRect();const hl=[...h.querySelectorAll('.hero-wx .fn')].pop();arc.style.bottom=Math.round(hr.bottom-fr.top+2)+'px';if(hl)arc.style.top=Math.round(hl.getBoundingClientRect().bottom-hr.top+16)+'px'}
 const chips=[...h.querySelectorAll('.hero-facts span')],c=chips.find(x=>/^Namnsdag/.test(x.textContent))||chips[Math.floor((chips.length-1)/2)],fig=h.querySelector('.fig-box');
 if(!c)return;const top=h.getBoundingClientRect().top,r=c.getBoundingClientRect();let y=r.top+r.height/2-top;
 if(fig){const f=fig.getBoundingClientRect();y=Math.min(y,f.bottom-top-6)}
 h.style.setProperty('--hz',Math.round(y)+'px');
 // väggtavlan: solen och månen står i rutan till höger om klockan och stiger och sjunker där
 const ck=h.querySelector('.clock'),sky=h.querySelector('.sky');
 if(sky&&ck&&h.closest('.board')){const rg=document.createRange();rg.selectNodeContents(ck);const hr=h.getBoundingClientRect(),cr=rg.getBoundingClientRect(),z=h.offsetWidth?hr.width/h.offsetWidth:1;
  sky.style.left=Math.round((cr.right-hr.left)/z+4)+'px';sky.style.right='4px'}}
window.addEventListener('resize',placeSky);
// väggtavlan: rader som inte får plats i sin ruta döljs hela i stället för att klippas mitt i
function fitBoard(){document.querySelectorAll('.board .btasks .wl').forEach(l=>{const box=l.closest('.widget').getBoundingClientRect().bottom-12;
 [...l.children].forEach(c=>c.hidden=false);[...l.children].forEach(c=>{if(c.getBoundingClientRect().bottom>box)c.hidden=true})})}
window.addEventListener('resize',fitBoard);
/* Sol- och månbanan ovanför gräsplätten i stället för över hela rutan. Solen går från soluppgången till vänster
   till solnedgången till höger, på natten månen i sin verkliga fas. Banan har samma höjd året runt och ligger ovanför hundarna. */
function arcHtml(W,v){const P=WX_POS(),sc=wxScene(W),now=new Date(),k=SKY(now,P.lat,P.lon),st=sunTimes(today(),P.lat,P.lon),pk=skyPeak(P.lat,P.lon);
 const covered=sc.sky==='cloudy'||sc.sky==='fog'||/^(rain|sleet|snow)$/.test(sc.type)&&sc.lv>=2||sc.thunder;
 const K=1,day=!!st&&now>=st[0]&&now<=st[1],f=day?(now-st[0])/(st[1]-st[0]):nightFrac(now,P);
 const th=Math.PI*f,x=50-50*Math.cos(th),y=100-K*100*Math.sin(th),ry=(K*100).toFixed(1);
 const gid='af'+(++FIG_N),fade=(k,c)=>'<linearGradient id="'+gid+k+'" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0"><stop offset="0" stop-color="'+c+'" stop-opacity="0"/><stop offset=".22" stop-color="'+c+'"/><stop offset=".78" stop-color="'+c+'"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></linearGradient>';
 // banan tonar in och ut i ändarna
 let s='<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs>'+fade('t','currentColor')+fade('d',day?'#F5B940':'#9AA8D6')+'</defs><path class="trk" stroke="url(#'+gid+'t)" d="M0 100 A50 '+ry+' 0 0 1 100 100"/>'+
  '<path class="done" stroke="url(#'+gid+'d)" d="M0 100 A50 '+ry+' 0 0 1 '+x.toFixed(2)+' '+y.toFixed(2)+'"/></svg>';
 if(!day&&!covered)s+=[[18,40],[34,14],[62,8],[80,30],[50,46],[90,60]].slice(0,sc.sky==='partly'?3:6).map(([a,b],i)=>'<i class="arc-st tw'+(i%3?' d'+(i%3+1):'')+'" style="left:'+a+'%;top:'+b+'%"></i>').join('');
 const z=34;
 s+='<div class="sky-b '+(day?'sky-sun':'sky-moon')+'" style="left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%;opacity:'+(covered?.4:1)+'">'+(day?sunSvg(k.sun.alt<8,z*1.5):moonSvg(k.moon.frac,k.moon.waxing,z))+'</div>';
 return'<div class="arc '+v+'" aria-hidden="true">'+s+'</div>'}
// b (vald): bågen i högra delen av rutan bakom temperaturen; a = bågen tätt över hundarna
const GRASS_V=lsGet('grass')==='a'?'a':'b',grassOn=()=>!wallBoardOn();
function heroHtml(){const n=new Date(),t=today(),dy=EXT.day&&EXT.day.date===t?EXT.day:null,hh=n.getHours(),W=wxModel(),P=WX_POS();
 const greet=hh<5?'God natt':hh<10?'God morgon':hh<17?'Hej':hh<22?'God kväll':'God natt';
 const sun=sunTimes(t,P.lat,P.lon);
 let wx='';
 if(W){const[ic,tx]=symInfo(W.now.s),d0=W.days[0]||{},F=wxToday(W);
  wx='<button class="hero-wx" data-act="nav" data-id="vader" aria-label="Väder: '+esc(tx)+', '+deg(W.now.T)+'. Öppna vädret">'+
   '<div class="wx-now"><span class="wx-ic" aria-hidden="true">'+ic+'</span><span class="wx-t num">'+deg(W.now.T)+'</span></div>'+
   '<div class="fn">'+esc(tx)+'</div><div class="fn num">H:'+deg(d0.max)+' L:'+deg(d0.min)+'</div>'+
   (grassOn()?'<div class="gs '+GRASS_V+'">'+(GRASS_V==='a'?arcHtml(W,'a'):'')+'<div class="fig-box grass" aria-hidden="true">'+figSvg(wxScene(W),{bare:1,patch:1})+'</div></div>':'<div class="fig-box" aria-hidden="true">'+figSvg(wxScene(W),{bare:1})+'</div>')+'<div class="fig-tip">'+esc((F.when==='i morgon'?'I morgon: ':'')+F.tip)+'</div></button>'}
 const facts=['Vecka '+isoWeek(n)];
 if(dy&&dy.holiday)facts.push(dy.holiday);else if(dy&&dy.flag)facts.push('Flaggdag: '+dy.flag);
 if(dy&&dy.names.length)facts.push('Namnsdag: '+dy.names.join(', '));
 if(sun)facts.push('Sol '+hhmm(sun[0])+'–'+hhmm(sun[1]));
 return'<section class="hero'+(wx?' has-wx':'')+'">'+(W?(grassOn()?(GRASS_V==='b'?arcHtml(W,'b'):''):skyHtml(W)):'')+'<div class="hero-l"><div class="clock num" id="clock">'+pad(hh)+':'+pad(n.getMinutes())+'</div><div class="hero-date">'+esc(cap(dayHead(t)))+'</div>'+
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
 // på väggtavlan glider en avbockad städsyssla ut, och nästa flyttar upp
 const out=done&&row.closest('.board .bclean');if(out)setTimeout(()=>{row.style.height=row.offsetHeight+'px';void row.offsetHeight;row.classList.add('leaving')},380);
 setTimeout(()=>{A.flip=true;then()},out?700:done?400:180)}
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
function closeSheets(){S.edit=null;S.rcpSheet=null;S.sheet=null;S.swap=null;S.wishFor=null;S.rate=null;S.ekoEdit=null;S.shopAdd=false;S.taskAdd=false}

/* ---------- actions ---------- */
function boxEdit(fn){const wall=wallBoardOn(),L=layout(wall,wall?WALL_DEF:OV_DEF());fn(L);saveLayout(wall,L);render()}
const ACT={
 smileySkip(id,el){A.user=Date.now();saveSmiley(id,el.dataset.date,'x');toast('Okej, den räknas inte som lagad')},
 wakeBoard(){render()},
 nav(id){if(id!=='oversikt')S.arrange=false;try{document.activeElement&&document.activeElement.blur()}catch(e){}id=normView(id);S.shopAdd=false;S.taskAdd=false;S.view=id;S.recipe=null;S.confirm=null;lsSet('view',id);try{history.replaceState(null,'','#'+id)}catch(e){}window.scrollTo(0,0);render()},
 refresh(){refresh()},
 settings(){S.sheet='settings';render()},
 arrange(){closeSheets();S.arrange=true;ACT.nav('oversikt')},
 arrangeDone(){S.arrange=false;render()},
 boxSize(id){boxEdit(L=>{L.size[id]=L.size[id]==='h'?'f':'h'})},
 boxHide(id){boxEdit(L=>{L.cols.forEach(c=>{const i=c.indexOf(id);if(i>=0)c.splice(i,1)});L.hidden.push(id)})},
 boxShow(id){boxEdit(L=>{L.hidden=L.hidden.filter(x=>x!==id);L.cols[L.cols.length-1].push(id)})},
 boxReset(){saveLayout(wallBoardOn(),null);render();toast('Rutorna ligger som från början')},
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
 cookDone(id){S.cook=null;A.cookStep=null;wake();markCooked(id);ACT.rate(id)},
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
 rcpSheet(id,el){S.rcpSheet={id,k:el.dataset.k};render()},
 rcpConfirm(){if(S.rcpSheet){S.rcpSheet.confirm=true;render()}},
 bankToggle(id){const r=recipeById(id);if(!r)return;const sure=S.rcpSheet&&S.rcpSheet.k==='unbank';S.rcpSheet=null;
  if(!inBank(id)){addToBank(r,true);toast('Sparat i receptbanken');render();return}
  // fotot sparas på receptet i receptbanken, så fråga först om det försvinner
  if(imgOf(id)&&!sure){S.rcpSheet={id,k:'unbank'};render();return}
  A.user=Date.now();BANK_ROWS().forEach(k=>{if(parseJ(settings()[k],[]).some(x=>x.id===id))updJSON(k,[],a=>a.filter(x=>x.id!==id))});
  toast('Borttaget ur receptbanken');render()},
 // Hjärtat: favorit. Ett recept som inte är sparat sparas samtidigt; utan hjärta ligger det kvar bland sparade
 favToggle(id){const r=recipeById(id);if(!r)return;
  if(!inBank(id)){addToBank(r,true,true);toast('Sparat som favorit');render();return}
  const on=isFav(id);bankEdit(id,x=>{if(on)delete x.fav;else x.fav=true;return x});
  toast(on?'Inte längre favorit. Receptet ligger kvar bland sparade':'Sparat som favorit');render()},
 inspoFilter(id){S.inspoFilter=id;render()},
 photoRemove(id){S.rcpSheet=null;A.user=Date.now();BANK_ROWS().forEach(k=>{if(parseJ(settings()[k],[]).some(x=>x.id===id))updJSON(k,[],a=>a.map(x=>x.id===id?Object.assign({},x,{img:''}):x))});
  toast('Fotot är borttaget');render()},
 deleteRecipe(id){const r=recipeById(id);if(!r)return;S.confirm=null;S.rcpSheet=null;A.user=Date.now();
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
 taskEdit(id){const x=D().tasks.find(t=>t.id===id);if(!x)return;S.edit=Object.assign({},x);S.confirm=null;S.sheet='taskEdit';render()},
 taskDelAsk(){S.confirm='delTask';render()},
 taskDel(id){const x=S.edit&&D().tasks.find(t=>t.id===S.edit.id);closeSheets();S.confirm=null;if(!x){render();return}A.user=Date.now();
  if(id==='once'&&repName(x.repeat)){const nd=nextDue(x.due,x.repeat,today());mutate('tasks',x.id,{due:nd});apiPost({action:'taskToggle',id:x.id,done:true});toast('Hoppar över den här gången. Nästa gång '+(nd===addDays(today(),1)?'i morgon':dateShort(nd)));return}
  apiPost({action:'taskDelete',id:x.id});S.data.tasks=D().tasks.filter(t=>t!==x);render();toast('Uppgiften är borttagen')},
 evEdit(id){const e=D().events[Number(id)];if(!e)return;S.edit=Object.assign({},e);S.confirm=null;S.sheet='evEdit';render()},
 evDelAsk(){S.confirm='delEv';render()},
 evDel(id){const e=S.edit;closeSheets();S.confirm=null;if(!e){render();return}A.user=Date.now();const all=id==='all';
  apiPost({action:'eventDelete',id:e.id||'',date:e.date,time:e.time||'',title:e.title,all});
  S.data.events=D().events.filter(x=>!(x.date===e.date&&x.time===e.time&&x.title===e.title)&&!(all&&e.id&&x.id===e.id));render();toast(all&&String(e.flags||'').includes('r')?'Alla gånger är borttagna':'Händelsen är borttagen')},
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
document.addEventListener('change',e=>{if(e.target.id==='ee-allday'){const t=document.getElementById('ee-times');if(t)t.hidden=e.target.checked}});
document.addEventListener('input',e=>{if(e.target.classList.contains('smc-sl')){const f=e.target.closest('.smc-r').querySelector('.smc-face');if(f)f.textContent=SMIL[Number(e.target.value)+1][1]}
 if(e.target.id==='ork')orkPreview(e.target);if(e.target.id==='split-amt')splitPreview(e.target)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(!el)return;const id=el.dataset.id;
 if(el.dataset.change==='photo'){const f=el.files&&el.files[0];el.value='';if(S.rcpSheet){S.rcpSheet=null;render()}uploadPhoto(id,f);return}
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
  const rp=repName(d.repeat)?d.repeat:'',due=d.due||(rp?today():'');
  D().tasks.push({id:'tmp'+Date.now(),done:false,title:d.title.trim(),due,who:d.who||'',note:'',source:'egen',repeat:rp});S.taskAdd=false;render();
  apiPost({action:'taskAdd',title:d.title.trim(),due,who:d.who||'',repeat:rp})}
 if(f.dataset.form==='taskEdit'){const x=S.edit,t=String(d.title||'').trim();if(!x||!t)return;
  const rp=repName(d.repeat)?d.repeat:'',fields={title:t,due:d.due||(rp?today():''),who:d.who||'',repeat:rp};
  const ch=Object.keys(fields).filter(k=>String(x[k]||'')!==fields[k]),out={};ch.forEach(k=>out[k]=fields[k]);
  closeSheets();A.user=Date.now();if(ch.length){mutate('tasks',x.id,out);apiPost({action:'taskEdit',id:x.id,fields:out});toast('Sparat')}else render();return}
 if(f.dataset.form==='evEdit'){const e=S.edit,t=String(d.title||'').trim();if(!e||!t||!isDate(d.date))return;
  const allDay=!!d.allDay,start=allDay?'':String(d.start||''),end=allDay?'':String(d.end||'');
  if(!allDay&&!start){toast('Fyll i när händelsen börjar, eller välj Heldag');return}
  const time=allDay?'':start.replace(':','.')+(end?'–'+end.replace(':','.'):'');
  closeSheets();A.user=Date.now();
  if(t!==e.title||d.date!==e.date||time!==String(e.time||'')){
   const it=D().events.find(x=>x.date===e.date&&x.time===e.time&&x.title===e.title);if(it)Object.assign(it,{title:t,date:d.date,time});
   apiPost({action:'eventEdit',id:e.id||'',date:e.date,time:e.time||'',title:e.title,fields:{title:t,date:d.date,allDay,start,end}});S.calDay=d.date;S.calMonth=ymKey(d.date);toast('Sparat')}
  render();return}
 if(f.dataset.form==='income'){const m=S.ekoMonth||thisMonth(),v={};people().forEach((p,i)=>{v[p]=Math.round(Number(String(d['p'+i]||'').replace(/\s/g,'').replace(',','.'))||0)});
  closeSheets();A.user=Date.now();updJSON('ekonomi_inkomst',{},o=>{o[m]=v;return o});toast('Inkomsten för '+monthName(m)+' är sparad');return}
 if(f.dataset.form==='cost'){const e=S.ekoEdit||{},amt=Number(String(d.amount||'').replace(/\s/g,'').replace(',','.'));if(!d.name||!isFinite(amt))return;
  const c={id:e.id||('x'+Date.now().toString(36)),name:d.name.trim(),amount:amt,period:d.period||'månad',pay:d.pay||'',day:String(d.day||'').trim(),note:String(d.note||'').trim()};
  closeSheets();A.user=Date.now();A.flip=true;
  const to=d.owner||e.list||'shared',moved=e.id&&to!==e.list;
  updJSON('ekonomi',{},o=>{if(moved)ekoListIn(o,e.list,l=>l.filter(x=>x.id!==c.id));ekoListIn(o,to,l=>l.some(x=>x.id===c.id)?l.map(x=>x.id===c.id?c:x):l.concat([c]));return o});
  toast(moved?'Flyttad till '+(to==='shared'?'gemensamma':to+'s')+' utgifter':e.id?'Sparat':'Utgiften är tillagd');return}
 if(f.dataset.form==='smiley'){const id=f.dataset.id,dt=f.dataset.date,v=Number(d.v)||0;A.user=Date.now();
  saveSmiley(id,dt,v);markCooked(id,dt);toast(v>0?'Vad bra! Rätten kommer tillbaka lite oftare':v<0?'Noterat. Rätten kommer tillbaka mer sällan':'Tack!');return}
 if(f.dataset.form==='rate'){const r=recipeById(S.rate&&S.rate.id),who=S.me||d.who;if(!r||!who||!d.s)return;
  const sN=Number(d.s),v=d.v||(sN>=4?'igen':sN===3?'okej':'aldrig'),e={s:sN,v,c:String(d.c||'').trim(),d:today()};
  closeSheets();A.user=Date.now();
  updJSON('betyg',{},o=>{o[r.id]=o[r.id]||{p:{}};o[r.id].t=r.title;o[r.id].p=o[r.id].p||{};o[r.id].p[who]=e;return o});
  const nyBas=baseOf(r.id)==null,w=Number(d.bas)||MP.grundintervall(r),forst=!(lagadAll()[r.id]||{}).n;
  if(nyBas||forst)updJSON('frekvens',{},o=>{if(forst)cookedIn(o,r.id,today());const x=o[r.id]=o[r.id]||{t:r.title};if(nyBas&&x.w==null){x.w=w;x.d=today()}return o});
  const saved=(sN>=4||v==='igen')&&addToBank(r,true);
  toast(saved?'Tack! Receptet sparades i receptbanken':'Tack för betyget!');if(sN>=4)confetti();return}
 if(f.dataset.form==='wish'){const r=S.wishFor&&recipeById(S.wishFor),t=r?r.title:String(d.t||'').trim();if(!t)return;
  const w={t,slot:d.slot||slotFor(r),by:S.me||'',d:today()};if(r)w.id=r.id;
  if(r&&!inBank(r.id))addToBank(r,true);
  closeSheets();A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>!(r&&x.id===r.id)).concat([w]));toast('Önskad till nästa vecka: '+w.slot.toLowerCase());return}
 if(f.dataset.form==='prefs'){const st=settings();
  const ch=PREFS.map(([k])=>[k,String(d[k]||'').replace(/\s+\n/g,'\n').trim()]).filter(([k,v])=>String(st[k]||'')!==v);
  closeSheets();ch.forEach(([k,v])=>{st[k]=v;apiPost({action:'setting',k,v})});render();toast(ch.length?'Preferenserna är sparade':'Inget ändrades');return}
 if(f.dataset.form==='settings'){const p=[[d.p1.trim()||'Henrik',d.c1],[d.p2.trim()||'Cornelia',d.c2]].map(([n,c])=>n.replace(/[:,]/g,' ').trim()+(PCOL[c]?':'+c:'')).join(', ');const st=settings();
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
