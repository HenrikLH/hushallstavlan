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
 lock:SV+'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
 unlock:SV+'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.5"/></svg>',
 home:SV+'<path d="M3.5 11.2L12 4l8.5 7.2"/><path d="M5.8 9.5V20h4.4v-5.5h3.6V20h4.4V9.5"/></svg>',
 fork:SV+'<path d="M6 3v5a3 3 0 0 0 6 0V3"/><path d="M9 3v18"/><path d="M18 21V3c-2.2 1.4-3.3 4-3.3 7.6V13H18"/></svg>',
 basket:SV+'<path d="M3 9.5h18l-1.7 9a2 2 0 0 1-2 1.6H6.7a2 2 0 0 1-2-1.6z"/><path d="M8 9.5l3.2-5.5M16 9.5l-3.2-5.5"/><path d="M9.2 13.5v3M12 13.5v3M14.8 13.5v3"/></svg>',
 list:SV+'<path d="M3.5 6.2l1.6 1.6L8 4.9M3.5 12.2l1.6 1.6L8 10.9M3.5 18.2l1.6 1.6L8 16.9"/><path d="M11 6.5h9.5M11 12.5h9.5M11 18.5h9.5"/></svg>',
 sparkles:SV+'<path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7z"/><path d="M17.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
 cal:SV+'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
 gear:SV+'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8.5h14.5M15 5l3.5 3.5L15 12"/><path d="M20 15.5H5.5M9 12l-3.5 3.5L9 19"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15"/></svg>',
 minus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4.5 12h15"/></svg>',
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
 imp:SV+'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg>',
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
 sheet:null,confirm:null,timers:[],pending:0,step:{},matTab:['recept','bank','efter','inkop'].includes(lsGet('matTab'))?lsGet('matTab'):'vecka',taskTab:lsGet('taskTab')==='kalender'?'kalender':'lista',calDay:null,calMonth:null,ovDay:null,taskDue:'',bankFilter:'alla',rate:null,open:{}};
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
/* Fria färger från färgslidern i Färgval: nyckeln h<nyans 0-360>s<ton 0-6>, nyans över 360 är grått.
   Ton 0 är ljusast och 6 mörkast; 3 är mitten som väljs först. Färgerna läggs in i PCOL när de används. */
const hslHex=(h,s,l)=>{s/=100;l/=100;const f=n=>{const k=(n+h/30)%12,c=l-s*Math.min(l,1-l)*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0')};return'#'+f(0)+f(8)+f(4)};
const hexHue=x=>{const[r,g,b]=[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)/255),M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;if(d<.08)return 370;
 const h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;return Math.round((h*60+360)%360)};
const HUE_NAMN=[[12,'Röd'],[38,'Orange'],[62,'Gul'],[88,'Gulgrön'],[150,'Grön'],[185,'Turkos'],[212,'Himmelsblå'],[242,'Blå'],[268,'Indigo'],[298,'Lila'],[332,'Rosa'],[347,'Hallon'],[361,'Röd']];
function genCol(H,t){const g=H>360,sa=g?0:H>40&&H<175?56:66,lo=g?0:H>48&&H<175?6:H>14&&H<=48?-5:0;
 const L=[60,53,46,40,34,28,22][t]-lo,Ld=[80,74,68,62,56,50,44][t]-lo/2;
 const nm=g?'Grå':HUE_NAMN.find(x=>H<x[0])[1],adj=t<=1?'Ljus ':t>=5?'Mörk ':'';
 return[adj?adj+nm.toLowerCase():nm,hslHex(H%360,sa,L),hslHex(H%360,sa,L-7),hslHex(H%360,g?0:72,Ld),hslHex(H%360,g?0:72,Math.min(Ld+6,88))]}
// färgerna i raden: de namngivna färgerna och fler nyanser emellan, ordnade som regnbågen, grafit sist
let FARB=null;const farbList=()=>FARB||(FARB=(()=>{const n=Object.keys(PCOL).filter(k=>!/^h\d/.test(k)&&k!=='grafit'),L=[...n];
 for(let h=0;h<360;h+=20)if(!n.some(k=>{const d=Math.abs(hexHue(PCOL[k][1])-h);return Math.min(d,360-d)<12})){const k='h'+h+'s3';colOk(k);L.push(k)}
 return L.sort((a,b)=>colPos(a).h-colPos(b).h).concat('grafit')})());
const colOk=k=>{if(PCOL[k])return true;const m=/^h(\d{1,3})s([0-6])$/.exec(k||'');if(!m||+m[1]>380)return false;PCOL[k]=genCol(+m[1],+m[2]);return true};
// var på slidern en färg ligger och vilken ton den har (de fasta färgerna har ingen ton i raden)
const colPos=k=>{const m=/^h(\d+)s(\d)$/.exec(k);if(m)return{h:+m[1],t:+m[2]};return{h:colOk(k)?hexHue(PCOL[k][1]):0,t:-1}};
const personColor=i=>{const c=(personList()[i]||{}).c;return colOk(c)?c:PCOL_DEF[i]||'grafit'};
const rgba=(h,a)=>'rgba('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')+','+a+')';
let pcolKey='';
function applyPersonColors(){const ks=[0,1].map(personColor),key=ks.join();if(key===pcolKey)return;pcolKey=key;
 const v=dark=>ks.map((k,i)=>{const c=PCOL[k],m=dark?c[3]:c[1];return'--p'+(i+1)+':'+m+';--p'+(i+1)+'-soft:'+rgba(m,dark?.22:.13)+';--p'+(i+1)+'-ink:'+(dark?c[4]:c[2])}).join(';');
 let el=document.getElementById('pcol');if(!el){el=document.createElement('style');el.id='pcol';document.head.appendChild(el)}
 el.textContent=':root{'+v(false)+'}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){'+v(true)+'}}:root[data-theme="dark"]{'+v(true)+'}'}
/* Accentfärgen (Inställningar → Färgval) gäller bara den här enheten: en av användarfärgerna eller "min färg",
   som följer färgen för den som använder enheten. Vinröd är standard. */
let ACCENT=lsGet('accent')||'vinrod';
const FARG_OPEN={},FARG_X={};
function setPcol(i,key){const L=personList().slice(0,2);while(L.length<2)L.push({n:['Henrik','Cornelia'][L.length],c:''});if(!colOk(key))return;L[i].c=key;
 const v=L.map(x=>x.n+':'+(colOk(x.c)?x.c:PCOL_DEF[L.indexOf(x)])).join(', ');settings().personer=v;render();apiPost({action:'setting',k:'personer',v})}   // vilka tonrader som är utfällda i Färgval (2 = fälls ut just nu)
const accentKey=()=>{if(ACCENT==='min'){const i=people().indexOf(S.me);return i>=0?personColor(i):'vinrod'}return colOk(ACCENT)?ACCENT:'vinrod'};
let accKey='';
function applyAccent(){const k=accentKey();if(k===accKey)return;accKey=k;let el=document.getElementById('acc');
 if(k==='vinrod'){if(el)el.remove();return}
 if(!el){el=document.createElement('style');el.id='acc';document.head.appendChild(el)}
 const c=PCOL[k],v=dark=>{const m=dark?c[4]:c[1];return'--accent:'+m+';--accent-soft:'+rgba(m,dark?.22:.12)+';--on-accent:'+(dark?shadeHex(m,.16):'#FFFFFF')};
 el.textContent=':root{'+v(false)+'}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){'+v(true)+'}}:root[data-theme="dark"]{'+v(true)+'}'}
const recipeById=id=>D().recipes.find(r=>r.id===id)||bankList().find(r=>r.id===id)||inspoList().find(r=>r.id===id);
/* Inspiration: recept från nätet i inspiration.json (följer med appen, inte kalkylarket).
   Hjärtat sparar som favorit och bokmärket som sparat recept i receptbanken. */
const INSPO={list:null,busy:false};
function inspoList(){if(!INSPO.list&&!INSPO.busy){INSPO.busy=true;fetch('inspiration.json?v=2').then(r=>r.json()).then(a=>{INSPO.list=Array.isArray(a)?a:[];render()}).catch(()=>{INSPO.busy=false})}return INSPO.list||[]}
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
// Veckans efterrätt och låsta rätter ligger också i önskelistan (som {efter:1,...} och {las:1,...}) men är inga önskemål
const wishes=()=>parseJ(settings().onskelista,[]).filter(x=>x&&!x.efter&&!x.las);
function ratingOf(id){const x=ratings()[id];if(!x||!x.p)return null;const ps=Object.entries(x.p).filter(([,e])=>e&&e.s);if(!ps.length)return null;
 return{avg:ps.reduce((a,[,e])=>a+Number(e.s),0)/ps.length,people:ps,never:ps.some(([,e])=>e.v==='aldrig')}}
const VERD={igen:'Laga igen',okej:'Okej',aldrig:'Aldrig mer'};
const starsTxt=n=>'★★★★★'.slice(0,Math.round(n))+'☆☆☆☆☆'.slice(0,5-Math.round(n));
// Läs färskt värde från kalkylarket, ändra och skriv tillbaka, så att två telefoner inte skriver över varandra
/* Ändringar i en JSON-rad görs direkt i telefonen och skickas sedan som hela raden. Före sändning hämtas
   arket så att ändringar från den andra telefonen inte skrivs över. Flera snabba ändringar i samma rad
   (t.ex. bocka av flera överföringar i rad) köas, och alla ändringar som ännu inte skickats läggs på det
   hämtade värdet. Annars kunde ett andra tryck skicka en gammal rad och sudda ut det första. */
const UPD={q:{},chain:{},n:0};
function updJSON(k,def,fn){const st=settings();st[k]=JSON.stringify(fn(parseJ(st[k],def)));render();
 (UPD.q[k]=UPD.q[k]||[]).push(fn);UPD.n++;
 const run=async()=>{try{
  if(!UPD.q[k].length)return;
  let fresh=null;
  if(!OUTBOX.some(b=>b.action==='setting'&&b.k===k)){try{const d=await apiGet();if(d.settings&&k in d.settings)fresh=d.settings[k]}catch(e){}}
  const fns=UPD.q[k].splice(0);let v=settings()[k];
  if(fresh!=null&&!OUTBOX.some(b=>b.action==='setting'&&b.k===k)){let o=parseJ(fresh,def);fns.forEach(f=>{o=f(o)});v=JSON.stringify(o);S.data.settings[k]=v;render()}
  await apiPost({action:'setting',k,v})}finally{UPD.n--}};
 return UPD.chain[k]=(UPD.chain[k]||Promise.resolve()).then(run,run)}
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
 nav.addEventListener('pointerdown',e=>{if(e.button>0||nav.classList.contains('mini'))return;st={x0:e.clientX,id:e.pointerId,moved:false}});
 nav.addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;
  if(!st.moved){if(Math.abs(e.clientX-st.x0)<8)return;st.moved=true;nav.classList.add('drag');try{nav.setPointerCapture(e.pointerId)}catch(_){}}
  const p=at(e.clientX);nav.style.setProperty('--dx',p.dx+'px');nav.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('over',k===p.j))});
 const end=(e,go)=>{if(!st||e.pointerId!==st.id)return;const moved=st.moved;st=null;if(!moved)return;
  const p=at(e.clientX);nav.classList.remove('drag');nav.querySelectorAll('.over').forEach(b=>b.classList.remove('over'));
  skip=true;setTimeout(()=>skip=false,60);
  if(go&&VIEWS[p.j][0]!==S.view)ACT.nav(VIEWS[p.j][0])};
 nav.addEventListener('pointerup',e=>end(e,true));nav.addEventListener('pointercancel',e=>end(e,false));
 nav.addEventListener('click',e=>{if(skip){e.stopPropagation();e.preventDefault()}},true)})();
// Svävande menyrad på telefon: krymper till en rund knapp nere till vänster när man scrollar nedåt,
// växer ut igen när man scrollar uppåt, når toppen eller trycker på knappen.
// Piller: samma kapsel krymper till ett litet piller med bara ikonerna, halvt nedanför skärmkanten (bara CSS).
(function(){const nav=document.getElementById('nav'),mini=document.createElement('button');let y0=scrollY,acc=0;
 mini.className='nav-mini';mini.type='button';mini.setAttribute('aria-label','Visa menyn');document.body.appendChild(mini);
 const on=()=>NY&&FLIKRAD!=='fast'&&!nav.classList.contains('none');
 const set=m=>{if(nav.classList.contains('mini')===m)return;
  if(m){const b=nav.querySelector('button[aria-current] svg');mini.innerHTML=b?b.outerHTML:''}
  nav.classList.remove('ut');nav.classList.toggle('mini',m);if(!m)nav.classList.add('ut');mini.classList.toggle('on',m);};
 nav.addEventListener('click',e=>{if(nav.classList.contains('mini')&&!e.target.closest('button'))set(false)});
 nav.addEventListener('animationend',e=>{if(e.animationName==='navFranMini')nav.classList.remove('ut')});
 document.addEventListener('scroll',()=>{const y=scrollY,d=y-y0,yp=y0;y0=y;if(!on()){set(false);acc=0;return}
  if(y<40){acc=0;set(false);return}
  // längst ner studsar sidan tillbaka en bit; den rörelsen räknas inte som att man scrollar uppåt
  const max=document.documentElement.scrollHeight-innerHeight;if(y>=max-4||yp>=max-4){acc=0;return}
  acc=(acc>0)===(d>0)?acc+d:d;if(acc>24)set(true);else if(acc<-24)set(false)},{passive:true});
 mini.addEventListener('click',()=>set(false))})();

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
  if(!on()||e.button>0||!S.data||e.target.closest('input,select,textarea,[contenteditable],.nav,.dr-slide,.car')||(S.arrange&&e.target.closest('[data-box]')))return;
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
  if(p.clientX<24||p.clientX>innerWidth-24||!inMain(e.target)||e.target.closest('input,select,textarea,[contenteditable],.dr-slide,.car')||scroller(e.target,'x'))return;
  t={x0:p.clientX,y0:p.clientY,x:p.clientX,y:p.clientY,t0:performance.now()}},{passive:true});
 document.addEventListener('touchmove',e=>{if(!t)return;if(e.touches.length!==1){t=null;return}t.x=e.touches[0].clientX;t.y=e.touches[0].clientY},{passive:true});
 document.addEventListener('touchcancel',()=>{t=null},{passive:true});
 document.addEventListener('touchend',()=>{if(!t)return;const g=t;t=null;const dx=g.x-g.x0,dy=g.y-g.y0;
  if(Math.abs(dx)>70&&Math.abs(dx)>1.8*Math.abs(dy)&&performance.now()-g.t0<800&&!document.querySelector('#overlay .sheet'))subSwipe(dx)},{passive:true})})();

/* Undermenyerna i Mat och Uppgifter i samma ordning som segmentreglaget. Svep åt vänster = nästa. */
const SUBS={mat:['matTab',['vecka','inkop','recept','bank','efter']],uppgifter:['taskTab',['lista','kalender']]};
function subSwipe(dx){const sub=SUBS[S.view];if(!sub||S.recipe||S.cook||S.sheet)return false;
 const[k,list]=sub,i=list.indexOf(S[k]),j=i+(dx<0?1:-1);if(i<0||j<0||j>=list.length)return false;
 A.dir=dx<0?'in-right':'in-left';A.user=Date.now();
 const sg=document.querySelector('#main .segc[data-seg="'+k+'"]');if(sg&&sg.getBoundingClientRect().top<0)window.scrollTo(0,0);
 ACT[k](list[j]);return true}

let fitScrollbar=()=>{},hideCursor=()=>{};
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
  else if(S.view==='oversikt'&&document.body.classList.contains('is-night')!==nightOn())render();
  autoTheme()},20000)})();

/* Muspekaren syns inte i väggläge. Flyttar man en riktig mus syns den i tre sekunder; pekskärmen räknas inte. */
(function(){const el=document.documentElement;let t=0,lastTouch=0;
 const hide=()=>el.classList.toggle('no-cur',S.wall);hide();hideCursor=hide;
 document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')lastTouch=Date.now()},true);
 document.addEventListener('pointermove',e=>{if(!S.wall||e.pointerType!=='mouse'||Date.now()-lastTouch<1500)return;el.classList.remove('no-cur');clearTimeout(t);t=setTimeout(hide,3000)},{passive:true})})();

/* Rummets ljus: väggskärmen tittar med kameran en gång i minuten och räknar ut hur ljust det är.
   Bara medelljusheten i en bild på 32×24 punkter används; bilden sparas aldrig och skickas ingenstans.
   Mörkt rum ger mörkt läge och en svagare bild (sidan kan inte styra datorns egen ljusstyrka).
   Under nattläget är kameran av och tavlan alltid mörk. */
const CAM={on:lsGet('kamera')==='1',lvl:null,dark:false,dim:true,thr:Number(lsGet('kamGrans'))||25,err:'',busy:false};
CAM.dim=lsGet('kamDampa')!=='0';
const wallDark=()=>S.wall&&(inNight()||CAM.on&&CAM.dark);
function autoTheme(){const d=wallDark();if(d!==autoTheme.was){const first=autoTheme.was===undefined;autoTheme.was=d;if(!first){applyTheme(true);render()}}
 let el=document.getElementById('dimmer');const k=S.wall&&CAM.on&&CAM.dim&&CAM.lvl!=null&&!inNight()?Math.max(0,Math.min(1,(CAM.thr+15-CAM.lvl)/(CAM.thr+15)))*.45:0;
 if(!el&&k>0){el=document.createElement('div');el.id='dimmer';el.setAttribute('aria-hidden','true');document.body.appendChild(el)}
 if(el)el.style.opacity=k.toFixed(2)}
async function camSample(){if(!CAM.on||!S.wall||CAM.busy||document.visibilityState!=='visible'||inNight())return;
 if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){CAM.err='Den här webbläsaren kan inte använda kameran';camShow();return}
 CAM.busy=true;let st=null;
 try{st=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:160},height:{ideal:120},facingMode:'user'},audio:false});
  const tr=st.getVideoTracks()[0];
  // fast exponering om kameran tillåter det, annars jämnar kameran själv ut ljuset och mörka rum ser ljusare ut än de är
  try{const c=tr.getCapabilities?tr.getCapabilities():{};if(c.exposureMode&&c.exposureMode.includes('manual')&&c.exposureTime){const e=Math.max(c.exposureTime.min,Math.min(c.exposureTime.max,166));await tr.applyConstraints({advanced:[{exposureMode:'manual',exposureTime:e}]})}}catch(e){}
  const v=document.createElement('video');v.muted=true;v.playsInline=true;v.srcObject=st;await v.play();
  await new Promise(r=>setTimeout(r,1200));
  const cv=document.createElement('canvas');cv.width=32;cv.height=24;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(v,0,0,32,24);
  const px=g.getImageData(0,0,32,24).data;let sum=0;for(let i=0;i<px.length;i+=4)sum+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];
  const lvl=sum/(px.length/4)/255*100;g.clearRect(0,0,32,24);v.srcObject=null;
  CAM.lvl=CAM.lvl==null?lvl:CAM.lvl*.5+lvl*.5;CAM.err='';
  // lite marginal åt båda hållen så att tavlan inte slår fram och tillbaka i skymningen
  if(CAM.dark&&CAM.lvl>CAM.thr+6)CAM.dark=false;else if(!CAM.dark&&CAM.lvl<CAM.thr)CAM.dark=true}
 catch(e){CAM.err=e&&e.name==='NotAllowedError'?'Kameran är inte tillåten. Tryck på Tillåt när tavlan frågar':e&&e.name==='NotFoundError'?'Hittar ingen kamera':'Kameran svarar inte'}
 finally{if(st)st.getTracks().forEach(t=>t.stop());CAM.busy=false}
 camShow();autoTheme()}
function camShow(){const el=document.querySelector('[data-cam-lvl]');if(el)el.textContent=camTxt()}
const camTxt=()=>!CAM.on?'':CAM.err?CAM.err:inNight()?'Av under nattläget':CAM.lvl==null?'Mäter …':Math.round(CAM.lvl)+' %'+(CAM.dark?' · mörkt':' · ljust');
setInterval(camSample,60000);setTimeout(camSample,3000);

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
/* Ta bort en vara med svep. Raden försvinner direkt, men borttagningen skickas först när Ångra har försvunnit (5 s),
   när nästa vara tas bort eller när appen läggs undan */
const DEL={items:null,list:null,t:0};
function delCommit(keep){if(!DEL.items)return;clearTimeout(DEL.t);const ids=DEL.items.filter(x=>!keep||keep(x)).map(x=>x.id);DEL.items=null;DEL.list=null;undoHide();ids.forEach(id=>apiPost({action:'shopDelete',id}))}
// Tar bort varorna direkt i appen och visar Ångra i 5 sekunder
function delStart(items,msg){delCommit();cdelCommit();if(!items.length)return;const ids=new Set(items.map(x=>x.id));DEL.list=D().shop.slice();DEL.items=items;S.data.shop=D().shop.filter(x=>!ids.has(x.id));render();
 const u=document.getElementById('undo');u.querySelector('.ud-t').textContent=msg;u.querySelector('.ud-b').dataset.act='shopUndo';u.hidden=false;DEL.t=setTimeout(delCommit,5000)}
// Samma sak för sysslor i Städ
const CDEL={item:null,list:null,t:0};
function cdelCommit(){if(!CDEL.item)return;clearTimeout(CDEL.t);const id=CDEL.item.id;CDEL.item=null;CDEL.list=null;undoHide();apiPost({action:'cleanDelete',id})}
function cdelStart(t){delCommit();cdelCommit();CDEL.list=D().clean.slice();CDEL.item=t;S.data.clean=D().clean.filter(x=>x.id!==t.id);render();
 const u=document.getElementById('undo');u.querySelector('.ud-t').textContent=t.title+' togs bort';u.querySelector('.ud-b').dataset.act='cleanDelUndo';u.hidden=false;CDEL.t=setTimeout(cdelCommit,5000)}
function undoHide(){const u=document.getElementById('undo');if(u)u.hidden=true}
addEventListener('visibilitychange',()=>{if(document.hidden){delCommit();cdelCommit()}});
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)}
// Kalkylarket vägrar ta bort sista raden under rubriken. En dold egen rad i Inköp gör att fliken aldrig töms helt.
const PLATS='(rad för appen, ta inte bort)';let platsFinns=false;
function platsVakt(a){if(platsFinns||!/^(planSend|shopDelete)$/.test(a))return;platsFinns=true;const it={action:'shopAdd',name:PLATS,qty:'',cat:'Övrigt',price:'',by:S.me};OUTBOX.push(it)}
function setData(d){if(d&&Array.isArray(d.shop)){if(d.shop.some(x=>x.name===PLATS))platsFinns=true;d.shop=d.shop.filter(x=>x.name!==PLATS)}if(d&&Array.isArray(d.menu))d.menu=d.menu.filter(m=>!(m&&!m.recipe&&/^ledig$/i.test(m.title||'')));if(d&&DEL.items&&Array.isArray(d.shop)){const ids=new Set(DEL.items.map(x=>x.id));d.shop=d.shop.filter(x=>!ids.has(x.id))}if(d&&CDEL.item&&Array.isArray(d.clean))d.clean=d.clean.filter(x=>x.id!==CDEL.item.id);S.data=d;if(window.MatVaror&&d&&d.settings)MatVaror.setPriser(parseJ(d.settings.priser,{}));S.lastSync=new Date();S.error='';try{lsSet('cache',JSON.stringify(d))}catch(e){}}
async function apiGet(){
 const r=await fetch(CFG.api+'?key='+encodeURIComponent(S.key)+'&t='+Date.now(),{cache:'no-store'});
 const j=await r.json();if(!j.ok)throw new Error(j.error||'Okänt fel');return j.data}
/* Ändringar sparas först i telefonen (utkorgen) och skickas sedan i tur och ordning.
   Utan nät ligger de kvar och skickas när nätet kommer tillbaka, så inget försvinner i butiken.
   Medan något klartr skrivs telefonens data inte över av äldre data från kalkylarket. */
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
   // Kalkylarket tar en ändring i taget. Är det upptaget (låst av en annan ändring eller kalendersynken) har inget sparats,
   // så ändringen ligger kvar i utkorgen och skickas igen om en stund i stället för att visa ett fel
   if(!j.ok&&/lock|lås/i.test(j.error||'')&&(OUTBOX[0].forsok=(OUTBOX[0].forsok||0)+1)<=20){saveOutbox();S.sync='busy';renderStatus();flushing=false;setTimeout(flush,4000+2000*Math.min(OUTBOX[0].forsok,10));return}
   OUTBOX.shift();S.pending=OUTBOX.length;saveOutbox();
   if(!j.ok){S.postErr=j.error||'fel';toast(/okänd åtgärd/i.test(j.error||'')?'Det här kräver att Kod.gs uppdateras på datorn först.':'Ändringen sparades inte: '+(j.error||'Okänt fel'));if(!OUTBOX.length){S.sync='idle';flushing=false;refresh(true);return}continue}
   lastServer=j.data;
   if(!OUTBOX.length){if(!UPD.n)setData(j.data);S.sync='idle'}}
 }finally{flushing=false}
 render()}
if(OUTBOX.length)setTimeout(flush,800);
function apiPost(body){
 if(!navigator.onLine&&body.action==='menuSwap'){toast('Kräver nät. Försök igen när du har täckning.');refresh(true);return Promise.resolve()}
 platsVakt(body.action);
 const it=Object.assign({},body,{by:S.me});
 if(/^tmp/.test(String(body.id||''))){const list=/^shop/.test(body.action)?D().shop:D().tasks,x=list.find(y=>y.id===body.id);if(x)it.tmpName=x.name||x.title}
 OUTBOX.push(it);S.pending=OUTBOX.length;saveOutbox();renderStatus();
 return flush()}
addEventListener('online',()=>flush());
setInterval(()=>{if(OUTBOX.length)flush()},15000);
async function refresh(silent){
 if(!S.key||!CFG.api)return;
 if(S.pending||UPD.n)return;
 if(!silent){S.sync='busy';renderStatus()}
 try{const d=await apiGet();if(!S.pending&&!UPD.n){setData(d);S.sync='idle'}}
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
function whoChip(w){const k=w==='Henrik'?'k':w==='Vegetariskt'?'v':w==='Gemensam'?'g':w==='Kött/Veg'?'kv':'';return'<span class="chip '+k+'">'+esc(w==='Henrik'?'Kött':w)+'</span>'}
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
const personChip=w=>'<span class="chip'+(people().includes(w)?' '+pcls(w):NY?' o':'')+'">'+esc(w)+'</span>';
const shopCost=items=>items.reduce((s,i)=>s+(Number(i.price)||0),0);
const isBase=i=>(i.meals||[]).length>0&&(i.meals||[]).every(m=>m==='Bas');
/* Veckosedelns siffror räknas på veckan som skickats: varorna som planen lade i inköpslistan (även de som redan är köpta)
   och portionerna som ska ätas, alltså två per middag och storkokets portioner. Mackor räknas inte */
function veckaKostnad(){const vs=settings().vecka_start,tag=isDate(vs)?'plan'+vs.replace(/-/g,''):'',sh=D().shop.filter(i=>!isBase(i));
 const plan=tag?sh.filter(i=>String(i.id).indexOf(tag)===0):[];return shopCost(plan.length?plan:sh.filter(i=>i.source!=='egen'))}
function veckaPortioner(){let n=0;weekDishes().forEach(x=>{if(!x.m||x.r&&x.r.course==='efterrätt')return;n+=dishPort(x.m,x.r)});return n||planPortions()}
// Portioner för en rätt på veckosedeln: talet i noten ("Lagas 4 portioner", "(10 portioner)"), annars 5 för storkok och 2 för middag
function dishPort(m,r){const x=/(\d+)\s*portion(er)?\b/.exec(m&&m.note||'');return x?Number(x[1]):r&&isStorkok(r)?5:2}
function portNote(m,r,n){let t=String(m.note||'');
 if(r&&isStorkok(r)){t=t.replace(/\s*\(\d+ portion(er)?\)/,'');return (t?t+' ':'')+'('+n+(n===1?' portion)':' portioner)')}
 t=t.replace(/(,\s*)?(Lagas|Gör) \d+ portion(er)?(, rester [^.]*)?\.?/i,'').trim();return n===2?t:(t?t+'. ':'')+'Lagas '+n+(n===1?' portion':' portioner')}
// Noten utan portionsuppgiften, som nu visas vid plus och minus
const noteUtanPort=t=>String(t||'').replace(/\s*\(\d+ portion(er)?\)/,'').replace(/(,\s*)?(Lagas|Gör) \d+ portion(er)?(, rester [^.]*)?\.?/i,'').replace(/^[\s.,]+|[\s.,]+$/g,'');
function planPortions(){const ids=new Set();D().menu.forEach(m=>{if(m.recipe)ids.add(m.recipe)});
 String(settings().storkok||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(id=>ids.add(id));
 let n=0;ids.forEach(id=>{const r=recipeById(id);if(r&&r.course!=='efterrätt')n+=r.portions||0});return n}

/* ---------- render ---------- */
/* ---------- render ---------- */
let rq=0,pendingRender=false;
function render(){if(rq)return;rq=setTimeout(()=>{rq=0;doRender()},0)}
function busyTyping(){const a=document.activeElement;return a&&a.closest&&a.closest('#main,#overlay')&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&!/^(checkbox|radio|range)$/.test(a.type)}
function renderStatus(){const el=document.getElementById('sync');if(el)el.outerHTML=statusHtml()}
const waitTxt=n=>n+(n===1?' ändring klartr':' ändringar klartr')+' på nät';
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
function doRender(){applyPersonColors();applyAccent();
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
 // Om en vy kraschar visas ett fel i stället, så att resten av appen (svep, menyn) fortsätter att fungera
 let page;try{page=(V[S.view]||V.oversikt)()}catch(e){console.error(e);page='<div class="banner">Något gick fel när sidan skulle visas: '+esc(e.message)+'</div>'}
 m.innerHTML=banner+page;
 {const w=m.querySelector('.wk-sw');if(w&&S.wkX){w.scrollLeft=S.wkX;wkMonth(w)}}
 {const w=m.querySelector('.wxC-sc');if(w)w.scrollLeft=S.wxX!=null?S.wxX:WXC_NP*WXC_SW}
 placeSky();fitBoard();
 watchTitle();plPin();wsPin();vvFix();
 A.after(m);
}
document.addEventListener('focusout',e=>{setTimeout(()=>{if(pendingRender&&!busyTyping())render()},50);
 /* iPhone: när tangentbordet stängs kan sidan bli kvar förskjuten, så att menyn längst ner och fälten som ska
    följa med vid scroll hamnar fel. En scroll till samma ställe får Safari att räkna om, när tangentbordet har gått ner */
 if(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))[120,450].forEach(t=>setTimeout(()=>{const a=document.activeElement;if(!a||!a.matches('input,textarea,select'))window.scrollTo(window.scrollX,window.scrollY)},t))});
function setupHtml(){return'<form class="setup" data-form="setup"><h1 class="lt">Hemma</h1><p>Skriv hushållets kod för att öppna tavlan. Du behöver bara göra det en gång på den här enheten.</p>'+
 '<div class="sh">Hushållskod</div><div class="group"><div class="cell"><input id="setup-key" name="key" class="field" placeholder="t.ex. lingon-tass-42" autocomplete="off" autocapitalize="none" spellcheck="false" required></div></div>'+
 '<div class="block"><button class="btn-fill" style="width:100%">Öppna tavlan</button></div>'+(S.error?'<div class="banner">'+esc(S.error)+'</div>':'')+'</form>'}

/* Byggstenar */
const gearBtn='<button class="ib" data-act="settings" aria-label="Inställningar">'+I.gear+'</button>';
// Ny design: initialen i personens färg öppnar Inställningar, så att man ser vem enheten är inställd på
const meBtn=()=>people().includes(S.me)?'<button class="ib me-av '+pcls(S.me)+'" data-act="settings" aria-label="Inställningar, '+esc(S.me)+'"><span>'+esc(S.me.slice(0,1).toUpperCase())+'</span></button>':gearBtn;
function head(title,o){o=o||{};NB.title=title;
 return'<header class="head">'+(o.eyebrow?'<div class="eyebrow">'+o.eyebrow+'</div>':'')+'<div class="head-row"><h1 class="lt" id="lt">'+esc(title)+'</h1><div class="tools">'+(o.tools||'')+(NY?meBtn():gearBtn)+'</div></div>'+(o.sub?'<div class="sub">'+o.sub+'</div>':'')+'</header>'}
const sh=(l,r,cls)=>'<div class="sh'+(cls?' '+cls:'')+'"><span>'+l+'</span>'+(r!=null&&r!==''?'<span class="r">'+r+'</span>':'')+'</div>';
const group=inner=>'<div class="group">'+inner+'</div>';
// Rubrik inuti en lista: listan är en enda yta där kategorierna skiljs åt av en rubrik med streck under
const gh=(l,r,cls)=>'<div class="gh'+(cls?' '+cls:'')+'"><span>'+l+'</span>'+(r!=null&&r!==''?'<span class="r">'+r+'</span>':'')+'</div>';
// Segmentreglage; markeringen är ett eget element så att den kan glida mellan valen
function segc(label,act,opts,cur){const i=Math.max(0,opts.findIndex(o=>o[0]===cur));
 return'<div class="segc" role="group" aria-label="'+esc(label)+'" data-seg="'+esc(act)+'" style="--n:'+opts.length+';--i:'+i+'"><i class="seg-thumb" aria-hidden="true"></i>'+opts.map(([k,l])=>'<button type="button" data-act="'+act+'" data-id="'+k+'" aria-pressed="'+(cur===k)+'">'+l+'</button>').join('')+'</div>'}
const emptyCell=t=>'<div class="cell empty">'+t+'</div>';
const chevron='<span class="chev">'+I.chev+'</span>';
function weekSub(){const st=settings(),W=weekTarget();if(W.ny)return'Vecka '+isoWeek(parse(W.vs))+' · inte planerad än';if(NY){const a=parse(W.vs),b=parse(W.ve),m=x=>MON[x.getMonth()];return'Vecka '+isoWeek(a)+' · '+a.getDate()+(m(a)===m(b)?'':' '+m(a))+'–'+b.getDate()+' '+m(b)}
 return esc(st.vecka_rubrik||'')+(isDate(st.uppdaterad)?' · uppdaterad '+esc(dateShort(st.uppdaterad)):'')}
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
 const k=(wall?'wallLayout':'ovLayout')+(NY?'Ny':''),Z=SIZES[wall?'wall':'ov'];let o=null;try{o=JSON.parse(lsGet(k)||'null')}catch(e){}
 const known=new Set(def.flat()),hidden=(o&&Array.isArray(o.hidden)?o.hidden:[]).filter(x=>known.has(x));
 let cols=o&&Array.isArray(o.cols)&&o.cols.length===def.length?o.cols.map(c=>c.filter(x=>known.has(x))):def.map(c=>c.slice());
 const seen=new Set(cols.flat().concat(hidden));def.forEach((c,i)=>c.forEach(x=>{if(!seen.has(x))cols[i].push(x)}));// nya rutor hamnar på sin vanliga plats
 const size={};known.forEach(id=>{const v=o&&o.size&&o.size[id];size[id]=Z.can.includes(id)&&(v?v==='h':Z.half.includes(id))?'h':'f'});
 return{cols,hidden,size}}
function saveLayout(wall,L){lsSet((wall?'wallLayout':'ovLayout')+(NY?'Ny':''),L?JSON.stringify({cols:L.cols,hidden:L.hidden,size:L.size}):null)}
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
// Nattlägets tider väljs i Inställningar → Nattläge (bara den här enheten), som standard 22–06
const NATT=(()=>{const v=String(lsGet('natt')||''),m=/^(\d+)-(\d+)$/.exec(v);return{on:v!=='av',a:m?+m[1]:1320,b:m?+m[2]:360,sol:lsGet('nattSol')==='1'}})();
// med Följ solnedgång och soluppgång är det natt från solnedgången till soluppgången, efter ortens riktiga soltider
const nattSol=d=>{const P=WX_POS();return sunTimes(ymd(d||new Date()),P.lat,P.lon)};
const saveNatt=()=>lsSet('natt',!NATT.on?'av':NATT.a===1320&&NATT.b===360?null:NATT.a+'-'+NATT.b);
const inNight=(d)=>{if(!S.wall||!NATT.on)return false;d=d||new Date();
 if(NATT.sol){const s=nattSol(d);return s?d<s[0]||d>s[1]:false}
 if(NATT.a===NATT.b)return false;const m=d.getHours()*60+d.getMinutes();return NATT.a<NATT.b?m>=NATT.a&&m<NATT.b:m>=NATT.a||m<NATT.b};
const nattTid=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const nightOn=()=>inNight()&&Date.now()-(A.touch||0)>120000;
// Klockan i nattläget flyttar sig varje timme så att samma bildpunkter inte lyser hela natten (inbränning)
const NPOS=[[0,0],[-20,-15],[18,12],[-16,14],[20,-13],[-6,-19],[8,17],[-22,3],[22,2],[4,-9],[-10,8],[14,-4]];
const nightPos=d=>{d=d||new Date();const doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),p=NPOS[(d.getHours()+doy*5)%NPOS.length];return'translate('+p[0]+'vw,'+p[1]+'vh)'};
function wallNight(){const n=new Date(),t=today(),tm=addDays(t,1),W=wxModel();
 const first=D().events.filter(e=>e.date===tm).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')))[0];
 const f=W&&W.days.find(x=>x.date===tm);
 return'<div class="night" data-act="wakeBoard"><div class="night-in" style="transform:'+nightPos(n)+'" data-h="'+n.getHours()+'"><div class="clock num" id="clock">'+pad(n.getHours())+':'+pad(n.getMinutes())+'</div>'+
  '<div class="night-l">I morgon '+esc(dayHead(tm))+'</div>'+
  (first?'<div class="night-l">'+esc(first.time?String(first.time).split(/\s*[–-]\s*/)[0]+' ':'')+esc(first.title)+'</div>':'')+
  (f?'<div class="night-l">'+symInfo(f.sym)[0]+' '+deg(f.min)+' till '+deg(f.max)+'</div>':'')+'</div></div>'}
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
 const hh=now.getHours(),greet=hh<5?'God natt':hh<10?'God morgon':hh<17?'Hej':hh<22?'God kväll':'God natt';
 let h=NY?head(greet+(people().includes(S.me)?', '+S.me:'')):head('Översikt');
 h+='<div class="ov">'+heroHtml()+(S.arrange||NY?'':smileyCard());
 const H={kal:calWidget()};
 const isT=nextDay&&nextDay.date===t;
 H.mat=widget('mat','w2',I.fork,(isT||!nextDay)?'Middag ikväll':'Nästa middag',nextDay&&!isT?esc(dateShort(nextDay.date)):'',
  nextDay?wMeals(nextDay):'<div class="wempty">Ingen matsedel inlagd än. Den fylls i när veckoplaneringen körs på söndag.</div>');
 const doneN=cp.routines.filter(doneToday).length+cp.doneRot.length,totN=cp.routines.length+cp.doneRot.length+cp.todo.length;
 H.stad=widget('stad','',I.sparkles,'Städ','','<div class="wbig">'+nv('w-clean',doneN)+'<small>/'+totN+'</small></div><div class="sub">'+nv('w-min',cp.minLeft)+' min kvar</div><div class="thin"><i style="width:'+(totN?Math.round(doneN/totN*100):0)+'%"></i></div>');
 H.inkop=widget('inkop','',I.basket,'Inköp','','<div class="wbig">'+nv('w-shop',left.length)+'</div><div class="sub">kvar · ca '+nv('w-shopkr',shopCost(left),'kr')+'</div>');
 const tl=tasksNow.concat(tasksSoon).slice(0,5);
 if(NY){// Ny design: Att göra med bockar och de stående överföringar som saknas, i stället för två listor
  const ovs=!people().includes(S.me)?[]:[['shared',ovOpen('shared')],[S.me,ovOpen(S.me)]].flatMap(([l,a])=>a.map(c=>({l,c})));
  const ovRows=ovs.map(x=>'<div class="cell ck ov-cell" data-act="ovGo" data-id="'+esc(x.l+'|'+x.c.id)+'" role="link" tabindex="0"><span class="ovs tap saknas" data-act="ovDone" data-id="'+esc(x.c.id)+'" data-list="'+esc(x.l)+'" role="button" tabindex="0" aria-label="Bekräfta att den är inlagd">!</span><div class="grow"><div class="title">'+(ovState(x.c)==='andrad'?'Uppdatera':'Lägg in')+' stående överföring</div><div class="meta"><span>'+esc(x.c.name)+'</span></div></div>'+chevron+'</div>').join('');
  const all=d.tasks.filter(x=>!x.done).length;
  H.upg=widget('uppgifter','w2',I.list,'Att göra',all?'Alla '+all:'',(ovRows||tl.length)?'<div class="wl">'+ovRows+tl.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra just nu.</div>')}
 else H.upg=widget('uppgifter','w2',I.list,'Uppgifter',tasksNow.length?tasksNow.length+' idag':'',tl.length?'<div class="wl">'+tl.map(taskRow).join('')+'</div>':'<div class="wempty">Inget att göra just nu.</div>');
 const rh=roomHealth();
 H.hem=widget('stad','w2',I.home,'Hemmet','',rh.length?'<div class="wl">'+rh.map(healthRow).join('')+'</div>':'<div class="wempty">Städschemat är tomt.</div>');
 H.imorgon=tm?widget('mat','w2',I.cal,'Imorgon',esc(dateShort(tm.date)),(eventsHtml(tm)||'<div class="wempty">Inga händelser.</div>')+(tm.meals.length?wMeals(tm):'')):'';
 H.fod=bdWidget();
 const L=layout(false,OV_DEF());
 return h+(S.arrange?'<p class="arr-intro">Håll kvar och dra en ruta dit du vill ha den. − döljer rutan och hörnknappen gör den halv eller hel. Gäller bara den här enheten.</p>':'')+'<div class="widgets'+(S.arrange?' arranging':'')+'">'+boxRow(L.cols[0].filter(id=>H[id]),false,H,L)+'</div>'+(NY&&!S.arrange?smileyCard():'')+'</div>'+arrangeFoot(L,false)};
// utan egen ordning ligger födelsedagarna näst sist
const OV_DEF=()=>NY?[['kal','upg','mat','stad','inkop','fod','hem','imorgon']]:[dayOf(addDays(today(),1))?['kal','mat','stad','inkop','upg','hem','fod','imorgon']:['kal','mat','stad','inkop','upg','fod','hem','imorgon']];
function wMeals(d){return(d.meals||[]).map(m=>{const r=m.recipe&&recipeById(m.recipe);const tag=r?'button':'div';
 return'<'+tag+' class="wmeal"'+(r?' data-act="recipe" data-id="'+esc(m.recipe)+'"':'')+'><div class="top">'+whoChip(m.who)+(r&&r.kr?'<span class="val">'+kr(r.kr)+'/port</span>':'')+'</div><div class="hl title">'+esc(m.title)+'</div>'+(m.addon?'<div class="sub">+ Kött: '+esc(m.addon)+'</div>':'')+'</'+tag+'>'}).join('')}
const healthRow=r=>'<div class="cell room"><div class="grow"><div>'+esc(r.room)+'</div><div class="cap '+healthCls(r.score)+'"><i style="width:'+Math.round(r.score*100)+'%"></i></div></div><span class="hw '+healthCls(r.score)+'">'+healthWord(r.score)+'</span></div>';
function eventsHtml(d){if(!d||!d.events.length)return'';return'<div class="evs">'+d.events.map(e=>'<div class="ev"><span class="t">'+esc(e.time||'Heldag')+'</span><span>'+esc(e.title)+evWho(e)+'</span></div>').join('')+'</div>'}

/* Mat: Vecka | Recept */
V.mat=function(){
 if(S.recipe){const r=recipeById(S.recipe);if(r)return recipeDetail(r);S.recipe=null}
 if(S.plan&&(S.plan==='auto'||DEV))return S.plan==='port'?portView():S.plan==='auto'?autoView():planView();
 const ink=S.matTab==='inkop'?inkopParts():null;
 let h=head('Mat',ink?{sub:ink.sub,tools:ink.tools}:{sub:weekSub()});
 if(NY){const rt=S.matTab==='recept'||S.matTab==='bank'||S.matTab==='efter';h+=segc('Visa','matTab',[['vecka','Vecka'],['inkop','Inköp'],['recept','Recept']],rt?'recept':S.matTab);
  if(rt)h+='<div class="subseg">'+segc('Recept','matTab',[['recept','Inspiration'],['bank','Mina recept'],['efter','Efterrätter']],S.matTab)+'</div>'}
 else h+=segc('Visa','matTab',[['vecka','Vecka'],['inkop','Inköp'],['recept','Recept'],['bank','Receptbank'],['efter','Efterrätter']],S.matTab);
 return h+(ink?ink.body:S.matTab==='recept'?matRecipes():S.matTab==='bank'?matBank():S.matTab==='efter'?matDessert():matWeek())};
/* Receptbanken: stora kort att bläddra i när man inte vet vad man vill äta */
const FOOD=[[/soppa/i,'🍲'],[/chili/i,'🌶️'],[/rödbet|falafel|bönbiff|linsbiff|grönsaksbiff/i,'🧆'],[/dal|curry/i,'🍛'],[/gryta/i,'🥘'],[/kyckling/i,'🍗'],[/lax|fisk|torsk|sej/i,'🐟'],[/pasta|lasagne|spagetti/i,'🍝'],[/sallad|bulgur/i,'🥗'],[/shakshuka|ägg|omelett/i,'🍳'],[/blåbär|bär|efterrätt|kaka/i,'🫐'],[/pizza/i,'🍕'],[/taco|tortilla/i,'🌮'],[/burgare/i,'🍔'],[/fläsk|kött|biff/i,'🥩'],[/blomkål|grönsak|aubergine/i,'🥦']];
const SOTT=[[/päron/i,'🍐'],[/äpple/i,'🍎'],[/glass/i,'🍨'],[/choklad/i,'🍫'],[/paj/i,'🥧'],[/bollar/i,'🍪'],[/kompott|rabarber|hallon|jordgubb/i,'🍓'],[/blåbär/i,'🫐'],[/parfait|yoghurt|kvarg|pudding/i,'🍮']];
const foodIcon=(t,r)=>(r&&isDessert(r)?SOTT.find(([re])=>re.test(t||''))||[0,'🍰']:FOOD.find(([re])=>re.test(t||''))||[0,'🍽️'])[1];
const isDessert=r=>!!r&&r.course==='efterrätt';
const kind=r=>{if(isDessert(r))return'e';const w=effWho(r);return w==='Kött/Veg'?'kv':w==='Henrik'?'k':w==='Vegetariskt'?'v':w==='Gemensam'?'g':''};
// Filtren för receptbanken och inspirationen
// Efterrätter har en egen flik och visas inte bland inspirationen eller i Mina recept
const RFILT=[['alla','Alla'],['k','Kött'],['v','Vegetariskt'],['kv','Kött/Veg'],['g','Gemensam'],['snabbt','Snabbt'],['storkok','Storkok']];
function rfOk(f,r,w){return f==='efter'?isDessert(r):isDessert(r)?false:f==='alla'||(f==='snabbt'?r.min&&r.min<=30:f==='storkok'?/storkok/i.test((r.group||'')+r.title):f==='efter'?r.course==='efterrätt':f==='onskat'?w.has(r.id):kind(r)===f)}
const fchips=(act,fs,f)=>'<div class="fchips" role="group" aria-label="Filter">'+fs.map(([k,l])=>'<button data-act="'+act+'" data-id="'+k+'" aria-pressed="'+(f===k)+'">'+l+'</button>').join('')+'</div>';
// Stort kort med bild, hjärta och bokmärke. Används i receptbanken och bland inspirationen
function rCard(r,o){o=o||{};const g=ratingOf(r.id),wished=o.wish&&o.wish.has(r.id),img=r.img||imgOf(r.id);
 return'<article class="bcard '+kind(r)+'"><div class="bimgw"><button class="bimg" data-act="recipe" data-id="'+esc(r.id)+'" aria-label="Öppna '+esc(r.title)+'">'+(img?'<img src="'+esc(img)+'" alt="" loading="lazy">':'<span aria-hidden="true">'+foodIcon(r.title,r)+'</span>')+'</button>'+bookBtn(r,'bc-gl')+favBtn(r,'bc-gl')+'</div>'+
 '<div class="bbody"><div class="chips-row">'+(isDessert(r)?'<span class="chip e">Efterrätt</span>':whoChip(effWho(r)))+(o.wish?freqChip(r.id):'')+(r.min?'<span class="chip num">'+r.min+' min</span>':'')+(r.kr?'<span class="chip num">'+kr(r.kr)+'/port</span>':'')+'</div>'+
 '<button class="btitle" data-act="recipe" data-id="'+esc(r.id)+'">'+esc(r.title)+'</button>'+
 (o.wish?(g?'<div class="bstars"><span class="st" aria-label="'+g.avg.toFixed(1)+' av 5">'+starsTxt(g.avg)+'</span>'+g.people.map(([p,e])=>'<span class="fn">'+esc(p)+': '+esc(VERD[e.v]||'')+'</span>').join('')+'</div>':'<div class="fn">Inget betyg än</div>'):(r.why?'<div class="fn bwhy">'+esc(r.why)+'</div>':''))+
 (r.src?'<a class="fn bsrc" href="'+esc(r.src)+'" target="_blank" rel="noopener">Från '+esc(r.srcName||new URL(r.src).hostname.replace(/^www\./,''))+'</a>':'')+
 (o.wish&&!isDessert(r)?veckoKnapp(r,'pill')+(paVeckan(r.id)?I.tick+'På veckosedeln':'Till veckosedeln')+'</button>':'')+'</div></article>'}
/* Receptbanken: favoriter (hjärta) och sparade recept (bokmärke) */
function matBank(){
 const f=S.bankFilter||'alla',w=new Set(wishes().map(x=>x.id));
 const all=bankList().map(r=>({r,g:ratingOf(r.id)})).sort((a,b)=>((b.g?b.g.avg:0)-(a.g?a.g.avg:0))||String(b.r.savedAt||'').localeCompare(String(a.r.savedAt||'')));
 let h=fchips('bankFilter',RFILT,f);
 if(!all.length)return h+'<div style="height:16px"></div>'+group(emptyCell('Receptbanken är tom än. Tryck på hjärtat eller bokmärket på ett recept, till exempel under Recept, så hamnar det här.'));
 const list=all.filter(({r})=>rfOk(f,r,w)).map(x=>x.r),fav=list.filter(r=>r.fav),saved=list.filter(r=>!r.fav);
 h+=sh(I.heartOn.replace('<svg','<svg class="shic fav"')+'Favoriter','<span class="num">'+fav.length+'</span>');
 h+=fav.length?'<div class="bank">'+fav.map(r=>rCard(r,{wish:w})).join('')+'</div>':group(emptyCell(f==='alla'?'Inga favoriter än. Tryck på hjärtat på ett recept ni gillar extra mycket.':'Inga favoriter matchar filtret.'));
 h+=sh(I.bookmarkOn.replace('<svg','<svg class="shic"')+'Sparade recept','<span class="num">'+saved.length+'</span>');
 h+=saved.length?'<div class="bank">'+saved.map(r=>rCard(r,{wish:w})).join('')+'</div>':group(emptyCell(f==='alla'?'Inga sparade recept än. Tryck på bokmärket på ett recept för att spara det.':'Inga sparade recept matchar filtret.'));
 return h+'<div class="foot">Veckoplaneringen väljer bland favoriterna och de sparade recepten. Favoriter kommer tillbaka oftare.</div>'}
/* Efterrätter: en egen kategori. De föreslås aldrig av veckoplaneringen eller Byt, men finns här när man vill laga något sött */
function matDessert(){
 const seen=new Set(),all=allRecipes().concat(inspoList()).filter(r=>{if(!isDessert(r)||seen.has(r.id))return false;seen.add(r.id);return true});
 const mine=all.filter(r=>inBank(r.id)).sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||((ratingOf(b.id)||{avg:0}).avg-(ratingOf(a.id)||{avg:0}).avg)),fler=all.filter(r=>!inBank(r.id));
 let h=sh(I.heartOn.replace('<svg','<svg class="shic fav"')+'Mina efterrätter','<span class="num">'+mine.length+'</span>');
 h+=mine.length?'<div class="bank">'+mine.map(r=>rCard(r)).join('')+'</div>':group(emptyCell('Inga sparade efterrätter än. Tryck på hjärtat eller bokmärket på en efterrätt nedan.'));
 if(!INSPO.list&&INSPO.busy)return h+group(emptyCell('Hämtar recept…'));
 if(fler.length)h+=sh('Att prova','<span class="num">'+fler.length+'</span>')+'<div class="bank mini">'+fler.map(r=>rCard(r)).join('')+'</div>';
 return h+'<div class="foot">Efterrätter föreslås aldrig när veckan planeras.</div>'}
/* Efterrätt på veckosedeln: en valfri plats per vecka. Sparas som {efter:1, v: veckans start, id} i önskelistan,
   eftersom appen bara får skriva vissa inställningar och då behövs ingen ändring i Kod.gs.
   Den följer med när man hämtar varor men räknas inte in i portionerna */
function weekDessert(){const st=settings(),o=parseJ(st.onskelista,[]).find(x=>x&&x.efter),r=o&&o.id&&o.v===(st.vecka_start||'')?recipeById(o.id):null;return r&&isDessert(r)?r:null}
function setWeekDessert(id){const v=settings().vecka_start||'';A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>x&&!x.efter).concat(id?[{efter:1,v,id}]:[]))}
// Receptets ingredienser som rader på inköpslistan. Samma vara slås ihop, mängder utan mått (salt, lite citronsaft) och vatten hoppas över
function dessertVaror(r,f,lista){const m=new Map();
 (r.groups||[]).forEach(g=>(g.items||[]).forEach(it=>{if(it.q==null)return;
  const n=String(it.n||'').replace(/\(.*?\)/g,'').replace(/,.*$/,'').replace(/^(kallt|kall|kalla|smält|mjukt|lite)\s+/i,'').trim();if(!n||/^vatten$/i.test(n))return;
  const k=n.toLowerCase(),x=m.get(k)||{name:n,u:{}};x.u[it.u||'']=(x.u[it.u||'']||0)+it.q*(f||1);m.set(k,x)}));
 // Varor som redan står (obockade) på listan läggs inte till en gång till
 const har=new Set((lista||D().shop).filter(i=>!i.done).map(i=>String(i.name||'').toLowerCase()));
 return[...m.values()].filter(x=>!har.has(x.name.toLowerCase())).map(x=>({name:cap(x.name),qty:Object.entries(x.u).map(([u,q])=>(fmtQ(q)+' '+u).trim()).join(' + ')}))}
function dessertTillInkop(id){const r=recipeById(id);if(!r)return;const v=dessertVaror(r,scaled(r).f);
 v.forEach((x,i)=>{const cat=katGissa(x.name);D().shop.push({id:'tmp'+Date.now()+'-'+i,done:false,name:x.name,qty:x.qty,cat,meals:['Efterrätt'],price:null,offer:'',source:'egen',addedBy:S.me,order:1000});apiPost({action:'shopAdd',name:x.name,qty:x.qty,cat,price:''})});
 render();toast(v.length?v.length+(v.length===1?' vara lagd':' varor lagda')+' i inköpslistan':'Allt står redan på inköpslistan')}
// Miniatyr: receptets foto, annars en matsymbol
const dishThumb=(r,t)=>{const img=r&&(r.img||imgOf(r.id));return'<span class="dr-th" aria-hidden="true">'+'<span>'+foodIcon(t,r)+'</span>'+(img?'<img src="'+esc(img)+'" alt="" loading="lazy" onerror="this.remove()">':'')+'</span>'};
/* En rätt på veckosedeln: bild, namn, dagar, pris och betyg. Byt finns så länge rätten har en dag kvar */
function mealCell(m,rows,flex){rows=rows||[m];const r=m.recipe&&recipeById(m.recipe),t=today(),days=[...new Set(rows.map(y=>y.date).filter(isDate))].sort(),left=flex&&flex.slut?(t<=flex.slut?[flex.slut]:[]):days.filter(d=>d>=t);
 const g=m.recipe&&ratingOf(m.recipe),meta=[flex?(flex.port?'':flex.txt):days.map(d=>cap(DAYS3[parse(d).getDay()])).join(', '),r&&r.kr?kr(r.kr)+'/port':'',g?'<span class="dr-st">★ '+starNum(matLage(m.recipe).s)+'</span>':''].filter(Boolean).join('<span class="dot" aria-hidden="true">·</span>');
 const pa=protFromAddon(m.addon);
 const lst=!!(m.recipe&&weekLocks(weekTarget().vs).has(m.recipe));
 const hl=!!(m.who!=='Borta'&&m.recipe&&(flex&&flex.slut?today()<=flex.slut:rows.some(y=>isDate(y.date)&&y.date>=today()))),lkm='<span class="lk-ring" aria-hidden="true"></span><span class="lk-bd" aria-hidden="true">'+I.lock+'</span>',th=dishThumb(r,m.title);
 const inner=(hl&&LASSTIL==='bild'?'<span class="lk-tw'+(lst?' lk-on':'')+'" data-lk>'+th+lkm+'</span>':th)+'<span class="grow"><span class="chips-row">'+whoChip(pa?'Kött/Veg':m.who)+'</span><span class="title">'+esc(m.title)+'</span><span class="meta">'+meta+'</span>'+(pa?protPills(pa):m.addon?'<span class="dr-sub">+ Kött: '+esc(m.addon)+'</span>':'')+(noteUtanPort(m.note)?'<span class="dr-sub">'+esc(noteUtanPort(m.note))+'</span>':'')+'</span>';
 // Portionerna med plus och minus under rätten. Ändringen sparas och inköpslistan räknas om
 const P=flex&&flex.port,pr=P?'<div class="dr-port"><span class="grow"><b>'+P.n+(P.n===1?' portion':' portioner')+'</b>'+(P.txt&&!NY?'<span class="meta">'+cap(P.txt)+'</span>':'')+'</span><span class="pl-step" role="group" aria-label="Portioner"><button type="button" data-act="portStep" data-id="'+D().menu.indexOf(m)+'" data-d="-1" aria-label="Färre portioner"'+(P.n<=1?' disabled':'')+'>'+I.minus+'</button><span class="num" aria-live="polite">'+P.n+'</span><button type="button" data-act="portStep" data-id="'+D().menu.indexOf(m)+'" data-d="1" aria-label="Fler portioner"'+(P.n>=20?' disabled':'')+'>'+I.plus+'</button></span></div>':'';
 const can=m.who!=='Borta'&&left.length,i=D().menu.indexOf(m),lab=(m.recipe?'Byt ':'Välj rätt i stället för ')+esc(m.title);
 const end=m.who==='Borta'?'':!left.length?'<span class="dr-done">'+I.tick+'Ätit</span>':NY?'<button class="dr-byt" data-act="swap" data-id="'+D().menu.indexOf(m)+'" aria-label="'+(m.recipe?'Byt ':'Välj rätt i stället för ')+esc(m.title)+'">'+I.swap+'</button>':'<span class="dr-sw" aria-hidden="true">'+I.swap+'</span>';
 const rad=hl&&LASSTIL!=='bild';
 // Håll in rätten för att låsa den (eller låsa upp). data-hold-lock bär receptet
 const row='<div class="cell dr'+(left.length?'':' past')+(can?' dr-slide':'')+(rad?' lk-rad'+(lst?' lk-on':''):'')+'"'+(rad?' data-lk':'')+(hl?' data-hold-lock="'+esc(m.recipe)+'" data-lst="'+(lst?1:0)+'"':'')+'>'+(rad?lkm:'')+(r?'<button class="dr-main" data-act="recipe" data-id="'+esc(m.recipe)+'">'+inner+'</button>':'<div class="dr-main">'+inner+'</div>')+end+pr+'</div>';
 // Svep åt vänster för Byt och åt höger för Ta bort, som i iPhones listor. Hela vägen byter eller tar bort direkt
 return can?'<div class="dr-wrap"><button class="dr-act" data-act="swap" data-id="'+i+'" aria-label="'+lab+'">'+I.swap+'<span>'+(m.recipe?'Byt':'Välj')+'</span></button>'+
  '<button class="dr-actl" data-act="weekDel" data-id="'+i+'" aria-label="Ta bort '+esc(m.title)+'">'+I.trash+'<span>Ta bort</span></button>'+row+'</div>':row}
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
/* Rätter som kan ersätta en rätt på matsedeln, eller fylla en tom plats (o.slot). Samma sort först, sedan efter poäng.
   Poängen är restpoängen (restpoang.js): grundpoängen (smak, dags igen, pris, hjärta, nyhet, säsong), justerad mot det som
   redan ligger i veckan. Rätter som tar vara på dyra och känsliga rester, eller som är billiga att handla till, kommer högre.
   Ligger inget känsligt över blir poängen i stort sett grundpoängen. */
let SWC=null;
// Veckans rätter (utom den som byts ut) som varubehov
function veckaBehov(utan){const b=[],rs=[];if(weekTarget().ny)return{b,rs};
 weekDishes().forEach(x=>{const r=x.r;if(!r||isDessert(r)||r.id===utan||!(r.groups||[]).length)return;const port=x.m?dishPort(x.m,r):(Number(r.portions)||5);b.push(MV.behov(r,port/(Number(r.portions)||2)));rs.push(r)});
 return{b,rs}}
function swapCandidates(m,o){o=o||{};const d=D(),key=JSON.stringify([m.date,m.who,m.title,m.recipe,o,settings().vecka_start,settings().lager,planBudget()])+d.menu.map(x=>x.date+(x.recipe||x.title)+x.note).join()+d.recipes.length+bankList().length+'|'+inspoList().length;
 if(SWC&&SWC.key===key)return SWC.val;
 const cur=m.recipe&&recipeById(m.recipe),onMenu=new Set(d.menu.map(x=>x.recipe).filter(Boolean)),t=today();
 const want=m.who==='Gemensam'?['Gemensam','Vegetariskt']:[m.who],sk=o.slot?!!o.sk:isStorkok(cur)||/^storkok/i.test(m.title||'');
 const seen=new Set();// receptbanken först, sedan inspirationsrecepten
 const base=allRecipes().concat(inspoList()).filter(r=>{if(!r||!r.id||seen.has(r.id))return false;seen.add(r.id);return true}).filter(r=>!onMenu.has(r.id)&&r.course!=='efterrätt'&&!matLage(r.id).paus).map(r=>{
  const g=ratingOf(r.id),l=matLage(r.id),last=lastServed(r.id),ago=last?Math.round((Date.parse(t)-Date.parse(last))/864e5):null;
  let kind,extra=l.redo?0:-15;// rätter som inte fått komma tillbaka än hamnar längre ner
  if(o.slot){if(sk)kind=o.want?(r.who===o.want?1:0):0;
   // Middagar: rätter som passar båda först, och rätter för rätt del av veckan lite före
   else{kind=0;extra+=(r.who==='Vegetariskt'||r.who==='Gemensam'||protInfo(r)?8:0)+(r.group===o.g?4:0)}}
  else kind=(want.indexOf(r.who)>=0?2:0)+(isStorkok(r)===sk?1:0);
  return{r,g,ago,l,kind,extra}});
 const V=veckaBehov(m.recipe),lager=planLager(settings().vecka_start),manad=parse(t).getMonth()+1,port=r=>isStorkok(r)?(Number(r.portions)||5):2;
 RP.CFG.mal=planBudget()*MP.CFG.marginal/24;
 const med=base.filter(c=>(c.r.groups||[]).length);
 RP.rangordna(med.map(c=>({r:c.r,d:{fav:isFav(c.r.id)},l:c.l,port:port(c.r),b:MV.behov(c.r,port(c.r)/(Number(c.r.portions)||2)),extra:c.extra,c})),V.b,lager,{veckaRatter:V.rs,manad})
  .forEach(y=>Object.assign(y.x.c,{J:y.J,kop:y.kop,raddat:y.raddat,anvander:y.anvander}));
 // Recept utan ingredienser: grundpoäng med mellanpris
 base.forEach(c=>{if(c.J==null)c.J=RP.grund(c.r,{fav:isFav(c.r.id)},c.l,{perPort:RP.CFG.mal,manad})+c.extra;c.score=c.kind*1000+c.J});
 const val=base.sort((a,b)=>b.score-a.score);val.rester=RP.veckansRester(V.b,lager);
 SWC={key,val};return val}
// Vad som blir över i veckan, överst i bladen när det är värt något
function resterRad(L){const v=(L||[]).filter(x=>x.hotat>=1.5).slice(0,4);if(v.reduce((a,x)=>a+x.hotat,0)<4)return'';
 return'<div class="foot sw-rest">Blir över i veckan: '+esc(v.map(x=>x.k+' ('+kr(x.kr)+')').join(', '))+'. Rätter som tar vara på det kommer högre.</div>'}
// Etikett och pris för en kandidat
const tarVara=c=>c.raddat>=2&&c.anvander&&c.anvander.length?'<span class="chip g">Tar vara på '+esc(lista(c.anvander.slice(0,2)))+'</span>':'';
const handla=c=>c.kop!=null?'Handla för '+kr(c.kop):'';
function swapWhy(c){const p=[];if(c.g)p.push(starsTxt(c.g.avg));p.push(c.ago==null?'inte lagad på ett tag':c.ago<0?'planerad':'senast för '+(c.ago<14?c.ago+' dagar':Math.round(c.ago/7)+' veckor')+' sedan');if(c.r.kr)p.push(kr(c.r.kr)+'/port');return p.join(' · ')}
function wishesBlock(){const w=wishes();
 return sh('Önskemål till nästa vecka','<button class="linkbtn" data-act="wishNew">Önska</button>')+
  group(w.length?w.map((x,i)=>'<div class="cell"><div class="grow"><div class="title">'+esc(x.t)+'</div><div class="meta"><span class="chip">'+esc(x.slot||'Valfri plats')+'</span>'+(x.by?'<span>'+esc(x.by)+'</span>':'')+'</div></div><button class="pill" data-act="wishDel" data-id="'+i+'" aria-label="Ta bort önskemålet">Ta bort</button></div>').join(''):emptyCell('Inga önskemål än. Tryck på Önska eller på Vill ha nästa vecka på ett recept.'))+
  '<div class="foot">Söndagens veckoplanering lägger önskade rätter i stället för den matlagning ni valt och tömmer sedan listan.</div>'}
// Byt rätten på matsedeln direkt i appen och skicka bytet till kalkylarket
function doSwap(r){const sw=S.swap;if(!sw)return;if(!navigator.onLine){toast('Att byta rätt kräver nät. Försök igen när du har täckning.');return}const m=sw.m,d=D();
 const rows=d.menu.filter(x=>m.recipe?x.recipe===m.recipe:(x.date===m.date&&x.who===m.who&&x.title===m.title));
 rows.forEach(x=>{if(r){x.title=r.title;x.recipe=r.id;x.addon='';x.note=''}else{x.title='Fritt val';x.recipe='';x.addon='';x.note='Borttagen i appen'}});
 if(r&&wishes().some(x=>x.id===r.id))updJSON('onskelista',[],a=>a.filter(x=>x.id!==r.id));
 S.confirm=null;closeSheets();A.user=Date.now();render();
 // Hela veckan skickas med planSend (matsedel, nya receptet och inköpslistan) i stället för menuSwap. menuSwap letade upp
 // den gamla raden i arket och gav fel när rätten bara fanns i telefonen än, t.ex. när man bytte en rätt man nyss lagt till
 shopImport(true,{msg:r?'Bytt till '+r.title+'. Inköpslistan uppdateras.':'Rätten är borttagen',force:1})}
/* Veckan: rätterna indelade i Storkok, Vardag och Helg i stället för dag för dag */
function weekDishes(){const d=D(),st=settings(),seen=new Set(),out=[];
 const inV=m=>!isDate(st.vecka_start)||!isDate(st.vecka_slut)||!isDate(m.date)||(m.date>=st.vecka_start&&m.date<=st.vecka_slut);
 d.menu.filter(inV).forEach(m=>{if(m.who==='Borta'||(!m.recipe&&/^(macka$|rester:|ledig$)/i.test(m.title)))return;const key=m.recipe||(m.who+'|'+m.title);const prev=out.find(x=>x.key===key);
  if(prev){prev.rows.push(m);if(prev.m.date<today()&&m.date>=today())prev.m=m;return}seen.add(key);
  const r=m.recipe&&recipeById(m.recipe);const dow=isDate(m.date)?parse(m.date).getDay():-1;
  out.push({key,rows:[m],m,r,g:r&&isStorkok(r)?'Storkok':dow>=1&&dow<=4?'Vardag':dow>=0?'Helg':r&&r.group?r.group:(m.who==='Gemensam'?'Helg':'Vardag')})});
 return out}
// Veckosedeln binder inte rätterna till en dag: vardagsrätterna lagas valfri kväll mån–tor, helgrätterna fre–sön
function dishCell(x){const{m,r}=x;if(m)return mealCell(m,x.rows,x.flex);return recipeCell(r,r.portions+' portioner'+(r.kr?' · '+kr(r.kr)+'/port':''))}
/* ---------- Platser på veckosedeln ----------
   Vardagar har fyra kvällar, helgen tre och lunchlådorna tio luncher (två storkok à 5). Det som inte täcks av en rätt,
   en macka eller en kväll borta visas som en tom plats. Man fyller en plats med en rätt eller en macka, tar bort en rätt
   (då blir platsen tom igen) och låser en rätt så att Föreslå en ny vecka behåller den.
   Ändringarna skickas som en hel vecka med planSend, som också räknar om inköpslistan. */
const isLedig=m=>!m.recipe&&/^ledig$/i.test(m.title||'');
// Veckan som visas: den sparade veckan om den inte är slut, annars nästa vecka (som ännu inte är gjord)
function weekTarget(){const st=settings();if(isDate(st.vecka_start)&&isDate(st.vecka_slut)&&st.vecka_slut>=today())return{vs:st.vecka_start,ve:st.vecka_slut,ny:false};const m=planMonday();return{vs:m,ve:addDays(m,6),ny:true}}
const weekRows=W=>D().menu.filter(m=>isDate(m.date)&&m.date>=W.vs&&m.date<=W.ve&&!isLedig(m));
const dagNr=(W,date)=>Math.round((Date.parse(date)-Date.parse(W.vs))/864e5);
// Tomma platser per grupp, räknat som i Räcker-rutan
function tommaPlatser(W,ds,g){const rows=weekRows(W);
 if(g==='Storkok'){const sk=ds.filter(x=>x.g==='Storkok'&&x.r),n=sk.filter(x=>x.m).reduce((a,x)=>a+dishPort(x.m,x.r),0)+sk.filter(x=>!x.m).reduce((a,x)=>a+(Number(x.r.portions)||5),0);return Math.max(1,Math.min(Math.ceil((10-n)/5),2-sk.length))}// alltid en tom plats för ett extra storkok
 const kv=g==='Vardag'?4:3,inG=y=>{const d=dagNr(W,y.date);return g==='Vardag'?d<=3:d>=4};
 const tack=rows.filter(y=>inG(y)&&(y.who==='Borta'||/^macka$/i.test(y.title))).length+ds.filter(x=>x.g===g&&x.m&&!isDessert(x.r)).reduce((a,x)=>a+Math.max(1,Math.floor(dishPort(x.m,x.r)/2)),0);
 return Math.max(1,kv-tack)}// alltid minst en tom plats för en extra rätt
// Låsta rätter: {las:1, v: veckans start, ids:[recept]} i önskelistan, så att båda ser samma lås
function weekLocks(vs){const o=parseJ(settings().onskelista,[]).find(x=>x&&x.las&&x.v===vs);return new Set(o&&o.ids||[])}
function setWeekLocks(vs,ids){A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>x&&!x.las).concat(ids.length?[{las:1,v:vs,ids}]:[]))}
// Skicka veckan som den ser ut i telefonen. Tom vecka får en rad Ledig, eftersom kalkylarket vill ha minst en rad
function weekSend(W,msg){const st=settings(),out={};
 if(W.ny||st.vecka_start!==W.vs){const m=parse(W.vs),s2=parse(W.ve);Object.assign(out,{vecka_start:W.vs,vecka_slut:W.ve,vecka_rubrik:'Vecka '+isoWeek(m)+' · '+DAYS3[m.getDay()].toLowerCase()+' '+m.getDate()+' – '+DAYS3[s2.getDay()].toLowerCase()+' '+s2.getDate()+' '+MON[s2.getMonth()],storkok_not:'Lagas i helgen. Räcker till lunch måndag–fredag veckan efter.'})}
 out.storkok=[...new Set(weekRows(W).filter(m=>m.recipe&&isStorkok(recipeById(m.recipe))).map(m=>m.recipe))].join(', ');
 Object.assign(st,out);D().menu=D().menu.filter(m=>!(isDate(m.date)&&m.date>=W.vs&&m.date<=W.ve&&isLedig(m)));
 const led=!weekRows(W).length&&{date:W.vs,who:'Gemensam',title:'Ledig',recipe:'',addon:'',note:''};if(led)D().menu.push(led);
 A.user=Date.now();shopImport(true,{settings:out,msg:msg||'Veckosedeln är uppdaterad',force:1});if(led)D().menu=D().menu.filter(m=>m!==led)}
// Lägg en rätt eller en macka på en tom plats. Den hamnar på första lediga dagen i gruppen
/* Storkok: planerarna föreslår högst två, men man kan lägga till fler själv. Har ett kött (även Kött/Veg, där köttet går till en av er) ska ett nytt vara köttfritt */
const KOTTVAROR=new Set(['kycklingfilé','kalkon','färs','fläsk','rimmat fläsk','lax','vit fisk','räkor','tonfisk']);
const harKott=r=>!!r&&r.who!=='Vegetariskt'&&(r.who==='Henrik'||!!protRaw(r,true)||Object.keys(MV.behov(r,1)).some(k=>KOTTVAROR.has(k)));
function storkokLage(utan){const st=weekTarget().ny?[]:weekDishes().filter(x=>x.g==='Storkok'&&x.r&&x.r.id!==utan);return{antal:st.length,kott:st.some(x=>harKott(x.r))}}
function slotFill(g,id){const W=weekTarget(),rows=weekRows(W),r=id&&id!=='macka'?recipeById(id):null;if(id!=='macka'&&!r)return;
 if(g==='Storkok'){const L=storkokLage();if(L.kott&&harKott(r)){toast('Ett storkok har redan kött, så det här måste vara utan kött');return}}
 if(g==='Storkok'){D().menu.push({date:W.ve,who:r.who==='Henrik'||r.who==='Vegetariskt'?r.who:'Gemensam',title:r.title,recipe:r.id,addon:'',note:'Lagas i helgen, lunch nästa vecka'})}
 else{const ds=g==='Vardag'?[0,1,2,3]:[4,5,6],upptagen=d=>rows.some(y=>y.date===addDays(W.vs,d)&&!(y.recipe&&isStorkok(recipeById(y.recipe)))),d=ds.find(x=>!upptagen(x));const date=addDays(W.vs,d==null?ds[0]:d);
  D().menu.push(r?{date,who:'Gemensam',title:r.title,recipe:r.id,addon:'',note:''}:{date,who:'Gemensam',title:'Macka',recipe:'',addon:'',note:''});
}
 closeSheets();render();weekSend(W,r?r.title+' ligger på veckosedeln':'Macka på veckosedeln')}
// Ta bort en rätt (alla dess rader i veckan, även resterna) eller en macka. Platsen blir tom
function weekDel(i){const W=weekTarget(),m=D().menu[Number(i)];if(!m)return;
 const bort=m.recipe?y=>y.recipe===m.recipe||(!y.recipe&&y.title==='Rester: '+m.title):y=>y===m;
 D().menu=D().menu.filter(y=>!(isDate(y.date)&&y.date>=W.vs&&y.date<=W.ve&&bort(y)));
 if(m.recipe&&weekLocks(W.vs).has(m.recipe))setWeekLocks(W.vs,[...weekLocks(W.vs)].filter(x=>x!==m.recipe));
 closeSheets();render();weekSend(W,m.recipe?m.title+' är borttagen':'Mackan är borttagen')}
function weekLock(id){const W=weekTarget(),L=weekLocks(W.vs),on=!L.has(id);if(on)L.add(id);else L.delete(id);setWeekLocks(W.vs,[...L]);toast(on?'Låst. Föreslå en ny vecka behåller rätten':'Upplåst')}
// Föreslå en ny vecka för samma vecka som veckosedeln: utgå från det som redan ligger där.
// Rätter, mackor och rester som finns behålls (de låsta även när man gör om veckan), bara tomma platser fylls
function autoFranVecka(P){const st=settings();if(st.vecka_start!==P.vecka)return;const W={vs:P.vecka,ve:addDays(P.vecka,6)},rows=weekRows(W);if(!rows.some(m=>m.recipe))return;
 const las=weekLocks(P.vecka),pl={mode:'two',st:[],dag:Array(7).fill(null).map(()=>({t:'tom'}))},las2={},tmp={};
 rows.forEach(m=>{const r=m.recipe&&recipeById(m.recipe),d=dagNr(W,m.date);if(r&&isDessert(r))return;
  if(r&&isStorkok(r)){const k=m.who==='Henrik'?'sk':m.who==='Vegetariskt'?'sv':'sg';if(!pl.st.some(x=>x.key===k))pl.st.push({key:k,id:r.id,n:dishPort(m,r)});return}
  if(d<0||d>6)return;if(r){if(pl.dag[d].t!=='ratt')pl.dag[d]={t:'ratt',id:r.id,n:dishPort(m,r)>2?4:2}}
  else if(/^rester:/i.test(m.title)){if(pl.dag[d].t==='tom')pl.dag[d]={t:'rest'}}else if(/^macka$/i.test(m.title)&&pl.dag[d].t==='tom')pl.dag[d]={t:'macka'}});
 // Högst två storkok: ett var (kött och vegetariskt) går före ett gemensamt
 if(pl.st.some(x=>x.key!=='sg'))pl.st=pl.st.filter(x=>x.key!=='sg');else if(pl.st.length)pl.mode='gem';
 pl.dag.forEach((x,d)=>{if(x.t==='tom'){pl.dag[d]={t:'macka'};return}tmp['d'+d]=1;if(x.t==='ratt'&&las.has(x.id))las2['d'+d]=1});
 pl.st.forEach(x=>{tmp[x.key]=1;if(las.has(x.id))las2[x.key]=1});
 pl.vecka=P.vecka;P.plan=pl;P.lock=tmp;PLANP=P;const X=autoCtx(P);X.behall=1;P.plan=autoGen(X,P.gen);P.plan.vecka=P.vecka;P.lock=las2;autoSync(P);PLANP=null;planSave(P)}
// Planera nästa vecka och Planera med portioner syns bara i utvecklarläget
const planBtn=()=>(DEV?'<button class="pl-open" data-act="planOpen"><span class="pl-ic" aria-hidden="true">🗓️</span><span class="grow"><span class="title">Planera nästa vecka</span><span class="meta">Välj rätter inom budgeten '+kr(planBudget())+'</span></span>'+chevron+'</button>'+'<button class="pl-open pt-open" data-act="portOpen"><span class="pl-ic" aria-hidden="true">🍽️</span><span class="grow"><span class="title">Planera med portioner <span class="chip g">Ny</span></span><span class="meta">Mat alla kvällar, rester och mackor läggs in automatiskt</span></span>'+chevron+'</button>':'')+'<button class="pl-open pt-open" data-act="autoOpen"><span class="pl-ic" aria-hidden="true">✨</span><span class="grow"><span class="title">Veckoförslag <span class="chip g">Ny</span></span><span class="meta">Appen föreslår hela veckan, du byter det du vill</span></span>'+chevron+'</button>';
/* Räcker maten veckan? Middag för två varje kväll (mån–tor och fre–sön) och lunchlåda för två mån–fre.
   Mackkvällar och kvällar borta räknas som täckta. Helgluncher planeras inte */
function raeckerKort(ds){const st=settings(),vs=st.vecka_start;if(!isDate(vs))return'';const d=D(),ve=addDays(vs,6);
 const kv=g=>{let n=0;d.menu.forEach(y=>{if(!isDate(y.date)||y.date<vs||y.date>ve)return;const w=parse(y.date).getDay(),vd=w>=1&&w<=4;if(vd!==(g==='Vardag'))return;if(y.who==='Borta'||/^macka$/i.test(y.title))n++});return n};
 const har=g=>ds.filter(x=>x.g===g&&x.m&&!(x.r&&x.r.course==='efterrätt')).reduce((a,x)=>a+dishPort(x.m,x.r),0);
 const rader=[['Vardag','Middag mån–tor',8-2*kv('Vardag')],['Helg','Middag fre–sön',6-2*kv('Helg')],['Storkok','Lunchlådor mån–fre',10]].map(([g,l,beh])=>{const n=har(g),diff=n-beh;
  return{l,n,beh,diff,txt:diff<0?'Saknas '+(-diff):diff>0?diff+' över':'Räcker'}});
 const kvSaknas=rader.slice(0,2).reduce((a,r)=>a+(r.diff<0?Math.ceil(-r.diff/2):0),0),lSaknas=Math.max(0,-rader[2].diff);
 const brist=kvSaknas||lSaknas,rub=!brist?'Maten räcker hela veckan':'Maten räcker inte: '+[kvSaknas?kvSaknas+(kvSaknas===1?' kväll':' kvällar')+' utan middag':'',lSaknas?lSaknas+(lSaknas===1?' lunchlåda':' lunchlådor')+' för lite':''].filter(Boolean).join(' och ');
 return'<div class="rk'+(brist?' bad':'')+'"><div class="rk-h">'+rub+'</div>'+rader.map(r=>'<div class="rk-r"><span class="grow">'+r.l+'</span><span class="rk-n">'+r.n+' av '+r.beh+'</span><span class="rk-s'+(r.diff<0?' bad':'')+'">'+r.txt+'</span></div>').join('')+'</div>'}
// Nya designen: en knapp för veckoförslaget och en sammanfattning med kostnad, portioner och om maten räcker
// Knappen ligger längst ner i sammanfattningsrutan när veckan har rätter, annars ensam
const planBtnDev=()=>DEV?planBtn().replace(/<button class="pl-open pt-open" data-act="autoOpen">[\s\S]*$/,''):'';
const wkNewBtn=()=>'<button class="btn-tint wk-new" data-act="autoOpen">'+I.swap+'Föreslå en ny vecka</button>';
const planBtnNy=()=>planBtnDev()+wkNewBtn();
function weekSummary(ds,total,port){const rk=raeckerKort(ds),bad=/class="rk bad"/.test(rk),rub=(rk.match(/<div class="rk-h">([^<]*)<\/div>/)||[])[1]||'',B=Number(settings().matbudget)||0;
 // Översta raden finns två gånger: i rutan och som en kopia som ligger fast under navigeringsfältet.
 // Kopian visas exakt när rutans överkant når fältet, så det ser ut som att raden glider fast. Tryck fäller ut räcker-listan
 const op=S.wsumOpen?' open':'',top=big=>'<button type="button" class="wm-top" data-act="wsumMini" aria-expanded="'+!!S.wsumOpen+'"><b class="num">'+(big?nv('m-total',total,'kr'):kr(total))+'</b>'+
  '<span class="wm-c"><span>'+port+' portioner</span><span>'+(port?kr(total/port)+' per portion':'')+'</span></span><span class="grow"></span>'+
  (rub?'<span class="wsum-s'+(bad?' bad':'')+'"><span class="dotc"></span>'+(bad?'Räcker inte':'Räcker')+'</span>':'')+'<span class="wm-ch" aria-hidden="true">'+chevron+'</span></button>';
 const body='<div class="wm-body">'+(rub?'<div class="wm-h'+(bad?' bad':'')+'">'+esc(rub)+'</div>'+rk.replace(/<div class="rk-h">[^<]*<\/div>/,''):'')+
  (B?'<div class="rk-r wm-b"><span class="grow">Budget '+kr(B)+'</span><span class="rk-s'+(total>B?' bad':'')+'">'+(total>B?kr(total-B)+' över':kr(B-total)+' kvar')+'</span></div>':'')+'</div>';
 return'<div class="ws-pin" aria-hidden="true"><div class="wcard ws-mini'+op+'">'+top(0)+body+'</div></div><div class="wcard ws-card'+op+'">'+top(1)+body+wkNewBtn()+'</div>'}
function matWeek(){
 const d=D(),st=settings(),W=weekTarget(),ds=W.ny?[]:weekDishes();let h=NY?(ds.length?planBtnDev():planBtnNy()):planBtn();
 const total=veckaKostnad(),port=veckaPortioner();
 if(ds.length){if(NY)h+=weekSummary(ds,total,port);else h+='<div class="stats"><div class="stat"><span class="fn">Maten kostar ca</span><b>'+nv('m-total',total,'kr')+'</b></div><div class="stat"><span class="fn">Portioner</span><b>'+nv('m-port',port)+'</b></div><div class="stat"><span class="fn">Per portion</span><b>'+(port?nv('m-per',total/port,'kr'):'–')+'</b></div></div>'+raeckerKort(ds)}
 else h+='<div class="wk-tom"><b>'+(W.ny?'Vecka '+isoWeek(parse(W.vs))+' är inte planerad än':'Veckan är tom')+'</b><span>Fyll platserna själv eller tryck på Föreslå en ny vecka.</span></div>';
 const order={Henrik:0,Vegetariskt:1,Gemensam:2},rows=weekRows(W);let vd='';
 const tom=g=>'<button class="cell dess-empty" data-act="slotPick" data-id="'+g+'"><span class="dess-plus" aria-hidden="true">'+I.plus+'</span><span class="grow"><span class="title">'+(g==='Storkok'?'Lägg till ett storkok':'Lägg till en rätt')+'</span><span class="meta">'+(g==='Storkok'?'Lunchlådor till nästa vecka':'Eller en macka')+'</span></span></button>';
 ['Vardag','Helg','Storkok'].concat([...new Set(ds.map(x=>x.g))].filter(g=>!['Vardag','Helg','Storkok'].includes(g))).forEach(g=>{const list=ds.filter(x=>x.g===g).sort((a,b)=>(order[(a.r||a.m).who]??3)-(order[(b.r||b.m).who]??3));
  const vs=W.vs,slut=addDays(vs,g==='Vardag'?3:6);
  list.forEach(x=>{if(!x.m)return;const n=dishPort(x.m,x.r);if(x.r&&x.r.course==='efterrätt'){x.flex={slut,txt:''};return}
   const kv=Math.floor(n/2);x.flex={slut,txt:'',port:{n,txt:g==='Storkok'?n+(n===1?' lunch':' luncher'):kv<1?'räcker inte en kväll':kv===1?'räcker 1 kväll':'räcker '+kv+' kvällar'}}});
  const namn=g==='Storkok'?'Lunchlådor':g==='Vardag'?'Vardagar':g,sub=g==='Storkok'?'Görs i helgen':g==='Vardag'?'Mån–tor, valfri kväll':g==='Helg'?'Fre–sön':'';
  const mack=g==='Storkok'?[]:rows.filter(y=>/^macka$/i.test(y.title)&&((dagNr(W,y.date)<=3)===(g==='Vardag'))),nTom=['Vardag','Helg','Storkok'].includes(g)?tommaPlatser(W,ds,g):0;
  if(!list.length&&!mack.length&&!nTom)return;
  vd+=gh(esc(namn),(sub?esc(sub)+' · ':'')+'<span class="num">'+(list.length?list.length+' '+(list.length===1?'rätt':'rätter'):nTom?nTom+' '+(nTom===1?'tom plats':'tomma platser'):'')+'</span>')+list.map(dishCell).join('');
  vd+=mack.map(y=>'<div class="cell dess-c mk-c"><span class="dess-b"><span class="dr-th" aria-hidden="true"><span>🥪</span></span><span class="grow"><span class="title">Macka</span><span class="meta">'+esc(kr(MP.CFG.mackaKr))+' för två</span></span></span><button class="dess-x" data-act="weekDel" data-id="'+d.menu.indexOf(y)+'" aria-label="Ta bort mackan">'+I.x+'</button></div>').join('');
  for(let i=0;i<nTom;i++)vd+=tom(g);
  });
 const dr=weekDessert();
 // Efterrätten låses som rätterna (håll in). Bara en låst efterrätt kommer med när man uppdaterar varorna
 const dl=dr&&weekLocks(st.vecka_start).has(dr.id);
 vd+=gh('Efterrätt','Valfri')+(dr?'<div class="cell dess-c lk-rad'+(dl?' lk-on':'')+'" data-lk data-hold-lock="'+esc(dr.id)+'" data-lst="'+(dl?1:0)+'"><span class="lk-ring" aria-hidden="true"></span><span class="lk-bd" aria-hidden="true">'+I.lock+'</span><button class="grow dess-b" data-act="recipe" data-id="'+esc(dr.id)+'">'+dishThumb(dr,dr.title)+'<span class="grow"><span class="title">'+esc(dr.title)+'</span><span class="meta">'+[dr.portions?dr.portions+' portioner':'',dr.min?dr.min+' min':''].filter(Boolean).join(' · ')+'</span></span></button>'+
  '<button class="dess-x" data-act="dessClear" aria-label="Ta bort efterrätten från veckosedeln">'+I.x+'</button></div>':
  '<button class="cell dess-empty" data-act="dessPick"><span class="dess-plus" aria-hidden="true">'+I.plus+'</span><span class="grow"><span class="title">Lägg till en efterrätt</span><span class="meta">Lås den för att få med varorna</span></span></button>');
 h+='<div class="g-one">'+group(vd)+'</div>';
 return h}
/* ---------- Valfritt protein (kategorin Kött/Veg) ----------
   Rätter med ett tydligt huvudprotein lagas som en grundrätt där var och en väljer sitt eget protein.
   Henrik väljer bland allt, den vegetariska i hushållet bara vegetariskt (inget ägg). Kan stängas av per recept (frekvens[id].vp=false). */
const MV=window.MatVaror;
// id, namn, ikon, gram per portion, råvara (namn som matvaror.js känner igen), gram protein per portion, vegetariskt, tillagning
const PROT=[
 ['kyckling','Kyckling','🍗',125,'kycklingfilé',31,0,'Stek i 6–7 minuter per sida tills den är genomstekt.'],
 ['flask','Fläskfilé','🐷',125,'fläskytterfilé',27,0,'Stek i 3–4 minuter per sida och låt vila en stund.'],
 ['fars','Nötfärs','🥩',125,'nötfärs',25,0,'Stek färsen smulig och krydda som receptet.'],
 ['kalkon','Kalkon','🦃',125,'kalkonfilé',29,0,'Stek i 4–5 minuter per sida.'],
 ['lax','Lax','🐟',125,'laxfilé',25,0,'Ugnsbaka i 12–15 minuter på 200 grader eller stek i panna.'],
 ['torsk','Torsk','🐠',140,'torskfilé',25,0,'Ugnsbaka i 12–15 minuter på 200 grader.'],
 ['rakor','Räkor','🍤',125,'räkor',24,0,'Vänd ner räkorna sist, de ska bara bli varma.'],
 ['halloumi','Halloumi','🧀',90,'halloumi',20,1,'Skiva och stek 2 minuter per sida.'],
 ['tofu','Tofu','🟨',150,'tofu',18,1,'Pressa ur vätskan, tärna och stek tofun krispig.'],
 ['kikartor','Kikärtor','🧆',190,'kikärtor',14,1,'Skölj och rosta i ugnen, eller värm i såsen.'],
 ['bonor','Bönor','🫘',190,'bönor på burk',13,1,'Skölj och värm i såsen.'],
 ['linser','Linser','🫛',60,'röda linser',15,1,'Koka i 10–12 minuter, eller direkt i såsen.'],
 ['feta','Fetaost','🥗',75,'fetaost',11,1,'Smula över när rätten är klar.']
].map(([id,namn,ic,g,vara,pr,veg,tips])=>({id,namn,ic,g,vara,pr,veg:!!veg,tips}));
const protById=id=>PROT.find(x=>x.id===id);
// Råvarunyckel i matvaror.js -> protein
const PKEY={};PROT.forEach(x=>{const v=MV.vara(x.vara);if(v)PKEY[v.k]=x.id});{const v=MV.vara('gröna linser');if(v)PKEY[v.k]='linser'}
const kottPerson=()=>'Henrik',vegPerson=()=>people().find(p=>p!=='Henrik')||'Cornelia';
// Receptets huvudprotein, eller null om det inte går att välja protein (storkok, efterrätt, flera proteiner eller inget)
const PROTC={};
// I Veckoförslaget kan även ett gemensamt storkok få olika protein
const KV=window.KottVeg||{};
// Egna recept: inte Kött/Veg när köttet är själva rätten eller rätten redan är delad med ett tillägg för Henrik
const KV_NEJ=/biff|bullar|burgare|schnitzel|gratäng|lasagne|moussaka|pulled|soppa|färs|pytt|paj|kåldolm|korv|ärtsoppa/i;
function protRaw(r,alla){if(!r||!r.id)return null;const sk=alla||S.plan==='auto',ck=r.id+(sk?'|a':'');if(ck in PROTC)return PROTC[ck];let out=null;
 const kv=KV[r.id],insp=/^insp-/.test(r.id);
 if((sk||!isStorkok(r))&&r.course!=='efterrätt'&&(kv||!insp)){const hits=[],ord=[];(r.groups||[]).forEach(g=>(g.items||[]).forEach(i=>{ord.push(i.n);const v=MV.vara(i.n);if(v&&PKEY[v.k])hits.push(PKEY[v.k])}));
  const kott=[...new Set(hits.filter(id=>!protById(id).veg))],veg=[...new Set(hits.filter(id=>protById(id).veg))],set=kott.length?kott:veg;
  const nej=!kv&&(kott[0]==='fars'||KV_NEJ.test(r.title||'')||(r.groups||[]).some(g=>/tillägg/i.test(g.title||''))||
   (kott.length&&veg.some(id=>id!=='feta'))||(kott.length&&ord.some(n=>/(kyckling|kött|kalv|ox|fläsk|höns|vilt)\S*(buljong|fond)|(buljong|fond)\S*(kyckling|kött|kalv|ox|fläsk|höns)/i.test(n))));
  if(set.length===1&&!nej)out={id:set[0],vkey:MV.vara(protById(set[0]).vara).k}}
 return PROTC[ck]=out}
const protOff=id=>{const x=freqs()[id];return!!(x&&x.vp===false)};
const protInfo=r=>r&&!protOff(r.id)?protRaw(r):null;
const effWho=r=>protInfo(r)?'Kött/Veg':r.who;
// Förval: receptets eget protein för den som kan äta det, annars ett som brukar passa
const TILL_VEG={kyckling:'halloumi',flask:'halloumi',kalkon:'halloumi',fars:'linser',lax:'tofu',torsk:'tofu',rakor:'tofu'};
const TILL_KOTT={halloumi:'kyckling',tofu:'kyckling',feta:'kyckling',kikartor:'kyckling',bonor:'fars',linser:'fars'};
function protMinne(){return parseJ(lsGet('protval'),{})}
function protVal(slot,r){const info=protInfo(r);if(!info)return null;const P=PLANP||planState(),x=P.prot&&P.prot[slot];
 if(x&&x.r===r.id)return x;const m=protMinne()[r.id];if(m)return{r:r.id,k:m.k,v:m.v};
 return protDef(r,info)}
function protDef(r,info){const o=protById(info.id),kv=KV[r.id]||{};return{r:r.id,k:o.veg?kv.dk||TILL_KOTT[o.id]:o.id,v:o.veg?o.id:kv.dv||TILL_VEG[o.id]}}
let PLANP=null;
// Receptet med proteinet utbytt: varje person får sitt protein för sin halva av portionerna
function protRecipe(r,val){const info=!protOff(r.id)&&protRaw(r,true);if(!info||!val)return r;const half=(Number(r.portions)||2)/2;
 const add=[],k=protById(val.k),v=protById(val.v);if(val.k===val.v)add.push({q:k.g*half*2,u:'g',n:k.vara});else{add.push({q:k.g*half,u:'g',n:k.vara});add.push({q:v.g*half,u:'g',n:v.vara})}
 let done=false;const groups=(r.groups||[]).map(g=>({title:g.title,items:(g.items||[]).flatMap(i=>{const x=MV.vara(i.n);if(x&&x.k===info.vkey){if(done)return[];done=true;return add}return[i]})}));
 return Object.assign({},r,{groups})}
// Grundrättens kostnad per portion (det som äts, inte hela förpackningar) och proteinets
function protBasPris(r){const info=protInfo(r);if(!info)return 0;const b=MV.behov(Object.assign({},r,{groups:(r.groups||[]).map(g=>({items:(g.items||[]).filter(i=>{const x=MV.vara(i.n);return!(x&&x.k===info.vkey)})}))}),1/(Number(r.portions)||2));
 return Object.values(b).reduce((a,x)=>a+x.m*x.v.kr/x.v.pkt,0)}
const protPris=x=>{const v=MV.vara(x.vara);return v?x.g*v.kr/v.pkt:0};
const protKort=val=>val?kottPerson()+': '+protById(val.k).namn.toLowerCase()+' · '+vegPerson()+': '+protById(val.v).namn.toLowerCase():'';
// Två små knappar, en per person, med valt protein
const pinit=n=>esc(String(n||'?').slice(0,1).toUpperCase());
function protPills(val,act,id){const one=(cls,who,x)=>'<span class="ppl '+cls+'"'+(act?' role="button" tabindex="0" data-act="'+act+'" data-id="'+esc(id)+'" aria-label="Välj protein för '+esc(who)+', nu '+esc(x.namn)+'"':'')+'><span class="av">'+pinit(who)+'</span><span class="em" aria-hidden="true">'+x.ic+'</span>'+esc(x.namn)+(act?'<span class="car" aria-hidden="true">▾</span>':'')+'</span>';
 return'<span class="pl-pr">'+one('p1',kottPerson(),protById(val.k))+one('p2',vegPerson(),protById(val.v))+'</span>'}
// Läser tillbaka valen från matsedelns tilläggskolumn: "Henrik: kyckling · Cornelia: halloumi"
function protFromAddon(a){const m=/^([^:·]+):\s*([^·]+?)\s*·\s*([^:·]+):\s*(.+)$/.exec(String(a||''));if(!m)return null;
 const f=n=>PROT.find(x=>x.namn.toLowerCase()===n.trim().toLowerCase());const k=f(m[2]),v=f(m[4]);return k&&v?{k:k.id,v:v.id,kn:m[1].trim(),vn:m[3].trim()}:null}
/* Matlagningsläget för Kött/Veg: stegen delar sig där proteinet lagas.
   Valet tas från veckosedeln, annars det senaste valet, annars förvalet. Storkok är bara Kött/Veg när veckosedeln säger det. */
function protNu(r){if(!r||protOff(r.id))return null;const info=protRaw(r,true);if(!info)return null;
 const mm=D().menu.find(m=>m.recipe===r.id&&protFromAddon(m.addon)),pa=mm&&protFromAddon(mm.addon);if(pa)return{r:r.id,k:pa.k,v:pa.v,kn:pa.kn,vn:pa.vn};
 if(isStorkok(r))return null;const m=protMinne()[r.id];return m?{r:r.id,k:m.k,v:m.v}:protDef(r,info)}
const PDEF={kyckling:'kycklingen',flask:'fläskfilén',fars:'färsen',kalkon:'kalkonen',lax:'laxen',torsk:'torsken',rakor:'räkorna',halloumi:'halloumin',tofu:'tofun',kikartor:'kikärtorna',bonor:'bönorna',linser:'linserna',feta:'fetaosten'};
const PORD={kyckling:/kyckling/i,flask:/fläsk|kotlett|köttet/i,fars:/färs/i,kalkon:/kalkon/i,lax:/lax/i,torsk:/torsk|sej|fisk/i,rakor:/räk/i,halloumi:/halloumi/i,tofu:/tofu/i,kikartor:/kikärt/i,bonor:/bön/i,linser:/lins/i,feta:/feta/i};
const protGen=id=>{const x=protById(id);return cap(PDEF[id])+': '+x.tips.charAt(0).toLowerCase()+x.tips.slice(1)};
function kvSteps(r,val){if(!val)return r.steps;const info=protRaw(r,true),own=protById(info.id),kv=KV[r.id];
 const fill=t=>String(t).replace(/\{kott\}/g,PDEF[val.k]).replace(/\{veg\}/g,PDEF[val.v]);
 if(kv){const ownK=own.veg?kv.dk:own.id,ownV=own.veg?own.id:kv.dv,lane=(t,g,ch,o)=>g?(ch===o&&t?t:protGen(ch)):t?fill(t):'';
  return kv.s.map(x=>({t:x.t?fill(x.t):'',timer:x.timer,k:lane(x.k,x.g,val.k,ownK),v:lane(x.v,x.g,val.v,ownV)}))}
 // Eget recept: steget där proteinet först nämns får en del per person när någon har ett annat protein
 let done=false;return r.steps.map(x=>{if(done||!PORD[own.id].test(x.t))return x;done=true;
  return{t:x.t,timer:x.timer,k:own.veg||val.k!==own.id?protGen(val.k)+' Laga det i en egen panna.':'',v:!own.veg||val.v!==own.id?protGen(val.v)+' Laga det i en egen panna.':''}})}
const stegText=x=>[x.t,x.k,x.v].filter(Boolean).join(' ');
// Två rader under ett steg: vad Henrik gör och vad den vegetariska gör
function kvLanes(x,val){if(!x.k&&!x.v)return'';const one=(cls,who,id,t)=>t?'<div class="kv-l '+cls+'"><div class="kv-h"><span class="av" aria-hidden="true">'+pinit(who)+'</span>'+esc(who)+' · '+protById(id).ic+' '+esc(protById(id).namn)+'</div><div class="kv-t">'+esc(t)+'</div></div>':'';
 return'<div class="kv">'+one('p1',val.kn||kottPerson(),val.k,x.k)+one('p2',val.vn||vegPerson(),val.v,x.v)+'</div>'}
const stegFor=r=>kvSteps(r,protNu(r));
/* ---------- Planera veckan ----------
   Appen föreslår rätter till varje plats med poängen i matpoang.js. Veckobudgeten är en spärr: en rätt visas bara om
   resten av veckan fortfarande får plats. Varorna räknas i hela förpackningar (matvaror.js), så rester och det som finns
   hemma används först. Planen sparas i telefonen tills den skickas till veckosedeln och inköpslistan. */
const PLATSER=[
 {id:'sk',namn:'Storkok kött',typ:'storkok',who:'Henrik',port:5,dag:6,not:'Lunch nästa vecka'},
 {id:'sv',namn:'Storkok vegetariskt',typ:'storkok',who:'Vegetariskt',port:5,dag:6,not:'Lunch nästa vecka'},
 {id:'fr',namn:'Fredag',typ:'helg',who:'Gemensam',port:2,dag:4},
 {id:'lo',namn:'Lördag',typ:'helg',who:'Gemensam',port:2,dag:5},
 {id:'so',namn:'Söndag',typ:'helg',who:'Gemensam',port:2,dag:6},
 {id:'v1',namn:'Tisdag',typ:'vardag',who:'Gemensam',port:2,dag:1},
 {id:'v2',namn:'Torsdag',typ:'vardag',who:'Gemensam',port:2,dag:3,valfri:true},
 {id:'v3',namn:'Måndag',typ:'vardag',who:'Gemensam',port:2,dag:0,valfri:true},
 {id:'v4',namn:'Onsdag',typ:'vardag',who:'Gemensam',port:2,dag:2,valfri:true}];
const antal=(n,en,fler)=>n+' '+(n===1?en:fler);
const lista=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' och '+a[a.length-1];
// Vardagskvällarna mån–tor: vardagsrätter läggs i den här ordningen (tis, tor, mån, ons), resten blir macka
const VARDAG=PLATSER.filter(p=>p.typ==='vardag');
const mackDagar=n=>VARDAG.slice(n).map(p=>p.dag).sort((a,c)=>a-c);
function planMonday(){let d=today();if(parse(d).getDay()===1)return d;d=addDays(d,1);while(parse(d).getDay()!==1)d=addDays(d,1);return d}
// Den gamla planeraren och portionsplaneringen har var sin plan i telefonen
const planKey=()=>S.plan==='port'?'veckoplan2':S.plan==='auto'?'veckoplan3':'veckoplan';
function planState(){let P=null;try{P=JSON.parse(lsGet(planKey())||'null')}catch(e){}
 const v=planMonday();if(!P||P.vecka!==v)P={vecka:v,val:{},v2:'auto',seed:{}};if(S.plan==='port'){P.port=P.port||{};P.mack=P.mack||{}}return P}
const planSave=P=>lsSet(planKey(),JSON.stringify(P));
const planBudget=()=>Number(settings().matbudget)||850;
/* Lagret: det som finns hemma när veckan börjar. planSend sparar det som blir över efter veckan, och förr räknades nästa
   sändning av samma vecka från det, så varje plus på en portion eller Uppdatera varor drog av varorna en gång till och listan
   krympte. Nu sparas också lagret som veckan räknades från (_f:vara) och veckan (_v), och samma vecka räknas alltid från det */
const lagTag=v=>Number(String(v||'').replace(/-/g,''))||0;
function planLager(v){const o=parseJ(settings().lager,{}),fore=o._v&&o._v===lagTag(v),out={};
 Object.keys(o).forEach(k=>{if(fore?k.startsWith('_f:'):k[0]!=='_')out[fore?k.slice(3):k]=o[k]});return out}
function lagerUt(v,rest){const out={_v:lagTag(v)},f=planLager(v);Object.keys(rest||{}).forEach(k=>{if(rest[k]>0)out[k]=rest[k]});Object.keys(f).forEach(k=>{if(f[k]>0)out['_f:'+k]=f[k]});return out}
function planPool(){const seen=new Set();return allRecipes().concat(inspoList()).filter(r=>{if(!r||!r.id||seen.has(r.id)||r.course==='efterrätt'||!(r.groups||[]).length)return false;seen.add(r.id);return true})}
const planPassar=(r,p)=>p.typ==='storkok'?isStorkok(r)&&r.who===p.who:p.typ==='helg'?r.group==='Helg'&&!isStorkok(r):r.group==='Vardag'&&!isStorkok(r)&&(r.who==='Vegetariskt'||r.who==='Gemensam'||!!protInfo(r));
const planBehov=(r,p)=>MV.behov(protRecipe(r,protVal(p.id,r)),p.port/(Number(r.portions)||2));
function seedRng(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);
 return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
// Önskemål från listan hamnar först bland förslagen till sin plats
const WISHSLOT={'Storkok, kött':'sk','Storkok, vegetariskt':'sv','Fredagsmiddag':'fr','Lördagsmiddag':'lo','Söndagsmiddag':'so','Vardagsmiddag, kött':'v1','Vardagsmiddag, vegetarisk':'v1'};
function planCalc(){
 const P=planState(),B=planBudget(),lager=planLager(P.vecka),pool=planPool(),CF=MP.CFG,ctxBas={manad:parse(P.vecka).getMonth()+1};PLANP=P;
 const valt=id=>{const r=P.val[id]&&recipeById(P.val[id]);return r||null};
 const kand={};PLATSER.forEach(p=>kand[p.id]=pool.filter(r=>planPassar(r,p)));
 const standalone={};const ensam=(r,p)=>{const k=r.id+p.id;return standalone[k]??(standalone[k]=MV.korg([planBehov(r,p)],lager).kr)};
 const tagna=except=>new Set(PLATSER.filter(q=>q.id!==except&&valt(q.id)).map(q=>P.val[q.id]));
 const minKostnad=(p,ut)=>{const L=kand[p.id].filter(r=>!ut.has(r.id)&&matLage(r.id).redo);return L.length?Math.min(...L.map(r=>ensam(r,p))):0};
 /* Billigaste sättet att fylla de tomma platserna. Platserna fylls en i taget med den rätt som kostar minst
    ovanpå det som redan ligger i korgen (b), så att paket som räcker till flera rätter bara räknas en gång */
 const minFyll=(tomma,b,ut)=>{const korg=b.slice(),tagen=new Set(ut),rad=[];let bas=MV.korg(korg,lager).kr,sum=0;
  tomma.slice().sort((a,c)=>c.port-a.port).forEach(q=>{let best=null;
   kand[q.id].forEach(r=>{if(tagen.has(r.id)||!matLage(r.id).redo)return;const bh=planBehov(r,q),k=MV.korg(korg.concat([bh]),lager).kr-bas;if(!best||k<best.k)best={k,bh,id:r.id,q}});
   if(best){korg.push(best.bh);tagen.add(best.id);rad.push(best);bas+=best.k;sum+=best.k}});
  return{sum,rad}};
 // Vardagsrätt 2: med om du valt den, annars bara om budgeten räcker till en rätt i mellanpris
 let v2=P.v2==='ja'||!!valt('v2');
 if(!v2&&P.v2!=='nej'&&typeof P.mack!=='number'){const ut=tagna('v2'),andra=PLATSER.filter(q=>q.typ!=='vardag'||q.id==='v1'),b=andra.filter(q=>valt(q.id)).map(q=>planBehov(valt(q.id),q));
  const kvar=B*CF.marginal-MV.korg(b,lager).kr-3*CF.mackaKr-andra.filter(q=>!valt(q.id)).reduce((a,q)=>a+minKostnad(q,ut),0);
  const k=kand.v2.filter(r=>!ut.has(r.id)&&matLage(r.id).redo).map(r=>ensam(r,PLATSER[6])).sort((a,c)=>a-c);
  v2=k.length&&kvar>=k[Math.floor(k.length/2)]}
 // Antal mackkvällar: valt i planeraren (P.mack), annars efter budgeten som förut (1 eller 2 vardagsrätter)
 const nV=typeof P.mack==='number'?CF.vardagskvallar-P.mack:v2?2:1;
 const aktiva=PLATSER.filter(p=>p.typ!=='vardag'||VARDAG.indexOf(p)<nV),macka=(CF.vardagskvallar-aktiva.filter(p=>p.typ==='vardag').length)*CF.mackaKr;
 const wish=wishes().filter(w=>w.id&&WISHSLOT[w.slot]);
 const valda=aktiva.filter(p=>valt(p.id)),bValda=valda.map(p=>planBehov(valt(p.id),p)),korg=MV.korg(bValda,lager);
 // Den billigaste veckan som går att bygga av det som är valt. En rätt ryms om veckan fortfarande går ihop
 // när den tar sin plats och de andra tomma platserna fylls på billigaste sätt
 const tomma=aktiva.filter(p=>!valt(p.id)),G=minFyll(tomma,bValda,new Set(valda.map(p=>P.val[p.id])));
 const plats={};
 aktiva.forEach(p=>{
  const andra=aktiva.filter(q=>q.id!==p.id&&valt(q.id)),bAndra=andra.map(q=>planBehov(valt(q.id),q)),ut=tagna(p.id);
  const kvar=B*CF.marginal-MV.korg(bAndra,lager).kr-macka;
  // De andra tomma måltiderna fylls på billigaste sätt utan den här, så att varje måltid får samma chans
  const tomma=aktiva.filter(q=>q.id!==p.id&&!valt(q.id)),F=minFyll(tomma,bAndra,ut),ovr=F.rad.map(x=>x.bh),Fby=new Set(F.rad.map(x=>x.id)),basA=MV.korg(bAndra,lager).kr;
  const mal=Math.max(1,kvar*p.port/(p.port+tomma.reduce((a,q)=>a+q.port,0)));
  const huvud=andra.map(q=>MP.huvudravara(valt(q.id)));
  const mk2=(r,extra)=>{const b=planBehov(r,p),t=MV.tillagg(bAndra,b,lager),l=matLage(r.id);
   const pp=MP.poang(r,{fav:isFav(r.id)},l,Object.assign({},ctxBas,{prisKvot:t.kassa/mal,ateranvandning:t.ateranvandning,valda:huvud}));
   // Är rätten redan den billigaste till en annan måltid räknas veckan om utan den där, så att samma rätt inte räknas två gånger
   const over=Fby.has(r.id)?MV.korg(bAndra.concat([b]),lager).kr-basA+minFyll(tomma,bAndra.concat([b]),new Set([...ut,r.id])).sum-kvar:MV.korg(bAndra.concat(ovr,[b]),lager).kr-basA-kvar;
   return Object.assign({r,t,l,p:pp,ok:over<=0,over},extra||{})};
  // Bara rätter som ryms i budgeten visas. Ryms ingen alls får vyn veta hur mycket som saknas
  const alla=kand[p.id].filter(r=>!ut.has(r.id)&&r.id!==P.val[p.id]&&matLage(r.id).redo).map(r=>mk2(r)),lista=alla.filter(x=>x.ok);
  const f=MP.foreslag(lista,seedRng(P.vecka+p.id+(P.seed[p.id]||0)),3);
  const w=wish.filter(x=>WISHSLOT[x.slot]===p.id||(p.typ==='vardag'&&WISHSLOT[x.slot]==='v1')).map(x=>recipeById(x.id)).filter(r=>r&&!ut.has(r.id)&&r.id!==P.val[p.id]&&!f.val.some(y=>y.r.id===r.id)).map(r=>mk2(r,{onskad:true})).filter(x=>x.ok);
  const val=w.slice(0,1).concat(f.val).slice(0,3);
  plats[p.id]={p,kvar,antal:alla.length,antalOk:lista.length,saknas:alla.length&&!lista.length?Math.min(...alla.map(x=>x.over)):0,billigast:alla.length?Math.min(...alla.map(x=>x.over))+kvar:Infinity,valt:valt(p.id)?mk2(valt(p.id)):null,val,bonus:f.bonus&&!val.some(y=>y.r.id===f.bonus.r.id)?Object.assign({},f.bonus,{bonus:true}):null}});
 // Det billigaste av två sätt att räkna: hela fyllningen på en gång, eller varje tom måltids billigaste rätt plus resten
 const reserv=Math.min(G.sum,...tomma.map(p=>plats[p.id].billigast));
 PLANP=null;
 return{P,B,v2:nV>=2,nV,aktiva,plats,valda,korg,macka,kassa:korg.kr+macka,tomma,reserv,klar:valda.length===aktiva.length}}
// Etiketten som Kod.gs använder för att veta vilken rätt en vara hör till (samma som mealLabel_)
function planEtikett(p,date){if(p.typ==='storkok')return'Storkok '+(p.who==='Vegetariskt'?'veg':'kött');const d=['Sön','Mån','Tis','Ons','Tor','Fre','Lör'][parse(date).getDay()];return p.typ==='vardag'&&p.who==='Gemensam'?d+' middag':p.who==='Gemensam'?'Helg ('+d.toLowerCase()+')':d+' '+(p.who==='Vegetariskt'?'veg':'kött')}
function planCard(x,p,chosen){const r=x.r,stars=x.l.betyg?'★ '+starNum(x.l.s):'Ny',re=Math.round(x.t.ateranvandning*100);
 const pv=protVal(p.id,r);
 const tag=whoChip(pv?'Kött/Veg':r.who)+(x.onskad?'<span class="chip v">Önskad</span>':x.bonus?'<span class="chip g">Bonus</span>':isFav(r.id)?'<span class="chip k">Favorit</span>':'');
 // Vad du betalar i butiken för rätten (hela förpackningar, minus det som redan köps till andra rätter) och vad ni faktiskt äter upp
 const handla=Math.round(x.t.kassa),ater=Math.round(MV.korg([planBehov(r,p)],{}).forbrukat);
 const meta='<span>'+stars+'</span><span class="num">Handla för '+kr(handla)+'</span>';
 const atTxt=handla-ater>=20?'Ni äter för '+kr(ater)+', resten blir över till andra rätter':ater-handla>=20?'Ni äter för '+kr(ater)+', en del finns redan i korgen':'';
 // Hur mycket billigare rätten blir tillsammans med veckans andra val, och en infoknapp som visar vilka varor som återanvänds
 const pct=x.t.ensamKr>0?Math.round((1-x.t.kassa/x.t.ensamKr)*100):0,ik=p.id+'|'+r.id,open=!!(S.plInfo||{})[ik];
 const delar=pct>=10&&x.t.delar&&x.t.delar.length?'<span class="pl-re'+(open?' open':'')+'"><span class="pl-rt">'+pct+' % billigare tillsammans med dina andra val<span class="pl-i" role="button" tabindex="0" data-act="planInfo" data-id="'+esc(ik)+'" aria-expanded="'+open+'" aria-label="Vilka varor återanvänds?">i</span></span><span class="pl-rd">Återanvänder: '+esc(x.t.delar.join(', '))+'</span></span>':'';
 // Vald rätt: bocken till vänster avmarkerar, svep åt vänster visar Byt som på veckosedeln
 if(chosen)return'<div class="dr-wrap"><button class="dr-act" data-act="planByt" data-full="planByt" data-id="'+p.id+'" aria-label="Byt '+esc(r.title)+'">'+I.swap+'<span>Byt</span></button><div class="cell pl-c on dr-slide"><button class="pl-chk" data-act="planUnpick" data-id="'+p.id+'" aria-pressed="true" aria-label="Vald. Tryck för att avmarkera '+esc(r.title)+'">'+I.tick+'</button><button class="grow pl-b" data-act="recipe" data-id="'+esc(r.id)+'"><span class="pl-ic" aria-hidden="true">'+foodIcon(r.title)+'</span><span class="grow"><span class="chips-row">'+tag+'</span><span class="title">'+esc(r.title)+'</span><span class="meta">'+meta+'</span>'+(atTxt?'<span class="pl-at">'+atTxt+'</span>':'')+(pv?protPills(pv,'planProt',p.id):'')+delar+'</span></button><span class="dr-sw" aria-hidden="true">'+I.swap+'</span></div></div>';
 return'<button class="cell pl-c" data-act="planPick" data-id="'+esc(r.id)+'" data-k="'+p.id+'"><span class="pl-ic" aria-hidden="true">'+foodIcon(r.title)+'</span><span class="grow"><span class="chips-row">'+tag+'</span><span class="title">'+esc(r.title)+'</span><span class="meta">'+meta+'</span>'+(x.pk?'<span class="pl-at pt-pk">'+esc(x.pk)+'</span>':'')+(atTxt?'<span class="pl-at">'+atTxt+'</span>':'')+(pv?'<span class="pl-pv">'+esc(protById(pv.k).ic+' '+protById(pv.k).namn+' till '+kottPerson()+', '+protById(pv.v).ic+' '+protById(pv.v).namn+' till '+vegPerson())+'</span>':'')+delar+'</span><span class="pl-add" aria-hidden="true">'+I.plus+'</span></button>'}
// Lägsta budget som räcker till det som är valt plus de billigaste rätterna på de tomma platserna
const minBud=C=>Math.ceil((C.kassa+C.reserv)/MP.CFG.marginal/10)*10;
const tommaTxt=C=>antal(C.tomma.length,'måltid','måltider')+' kvar att välja';
function planView(){const C=planCalc(),{P,B}=C,mon=parse(P.vecka),sun=parse(addDays(P.vecka,6));
 NB.title='Planera veckan';NB.back=true;
 const wk=isoWeek(mon);
 let h='<div class="rcp-top"><button class="back" data-act="planClose">'+I.back+'Mat</button></div><header class="head"><div class="head-row"><h1 class="lt" id="lt">Vecka '+wk+'</h1></div><div class="sub">'+esc(cap(DAYS[mon.getDay()])+' '+mon.getDate()+' '+MON[mon.getMonth()]+' – '+DAYS[sun.getDay()]+' '+sun.getDate()+' '+MON[sun.getMonth()])+'</div></header>';
 const pct=Math.min(100,Math.round(C.kassa/B*100)),over=C.kassa>B;
 h+='<div class="pl-bud"><div class="pl-bt"><div><span class="fn">I kassan</span><b class="num">'+kr(C.kassa)+'</b></div><label class="pl-bb"><span class="fn">Budget</span><input class="num" type="number" inputmode="numeric" min="200" max="5000" step="10" value="'+B+'" data-change="planBudget" aria-label="Veckobudget i kronor"></label></div>'+
  '<div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><div class="fn">'+(over?'Över budget med '+kr(C.kassa-B):'Kvar '+kr(B-C.kassa))+' · '+antal(C.nV,'vardagsrätt','vardagsrätter')+', '+antal(4-C.nV,'mackkväll','mackkvällar')+' ('+kr(C.macka)+')</div>'+
  (C.tomma.length?(C.kassa+C.reserv>B*MP.CFG.marginal?'<div class="fn pl-warn">'+tommaTxt(C)+'. De kostar minst '+kr(C.reserv)+' och ryms inte i budgeten. '+(C.valda.length?'Byt en dyr rätt eller höj budgeten till ungefär '+kr(minBud(C))+'.':'Den billigaste veckan behöver en budget på ungefär '+kr(minBud(C))+'.')+'</div>':'<div class="fn">'+tommaTxt(C)+' · minst '+kr(C.reserv)+'</div>'):'')+'</div>';
 // Liten budgetrad som följer med när den stora rutan har scrollats förbi
 h+='<div class="pl-pin"><div class="pl-mini" aria-hidden="true"><span class="fn">I kassan</span><b class="num">'+kr(C.kassa)+'</b><div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><span class="fn'+(over?' bad':'')+'">'+(over?'Över '+kr(C.kassa-B):'Kvar '+kr(B-C.kassa))+'</span></div></div>';
 const heltOver=C.tomma.length&&C.kassa+C.reserv>B*MP.CFG.marginal;
 // Mackkvällar: välj hur många av måndag–torsdag som blir macka. Resten av kvällarna får en vardagsrätt
 const nM=4-C.nV,md=mackDagar(C.nV).map(d=>DAYS[(d+1)%7]);
 h+=sh('Vardagskvällar','Måndag–torsdag')+group('<div class="cell pl-mk"><div class="grow"><div class="title">'+(nM?antal(nM,'mackkväll','mackkvällar'):'Inga mackkvällar')+'</div><div class="meta">'+(nM?esc(cap(lista(md)))+' · '+kr(C.macka):'Vardagsrätt alla fyra kvällarna')+(typeof P.mack==='number'?'':' · Valt efter budgeten')+'</div></div>'+
  '<div class="pl-step" role="group" aria-label="Antal mackkvällar"><button data-act="planMack" data-id="'+(nM-1)+'" aria-label="Färre mackkvällar"'+(nM<=0?' disabled':'')+'>'+I.minus+'</button><span class="num" aria-live="polite">'+nM+'</span><button data-act="planMack" data-id="'+(nM+1)+'" aria-label="Fler mackkvällar"'+(nM>=4?' disabled':'')+'>'+I.plus+'</button></div></div>');
 PLATSER.filter(p=>p.typ!=='vardag').concat(C.aktiva.filter(p=>p.typ==='vardag').sort((a,c)=>a.dag-c.dag)).forEach(p=>{const X=C.plats[p.id];if(!X)return;
  const open=!X.valt||S.planOpen===p.id;
  h+=sh(esc(p.namn),p.port+' portioner'+(p.not?' · '+p.not:''));
  let g=X.valt?planCard(X.valt,p,true):'';
  const visas=X.val.length+(X.bonus?1:0);
  if(open&&X.antalOk)g+=X.val.map(x=>planCard(x,p)).join('')+(X.bonus?planCard(X.bonus,p):'')+(X.antalOk>visas?'<button class="cell link" data-act="planMore" data-id="'+p.id+'"><span class="grow" style="color:var(--accent)">Andra förslag</span><span class="meta">'+X.antalOk+' rätter ryms</span></button>':'');
  // Ryms ingen rätt alls: säg det tydligt, så att ingen tror att fler förslag skulle hjälpa
  else if(open&&X.antal)g+='<div class="cell pl-none"><div class="grow"><div class="title">Ingen rätt ryms i budgeten</div><div class="meta">Appen har provat alla '+X.antal+' rätter som passar '+esc(p.namn.toLowerCase())+', och ingen går ihop med resten av veckan. '+(heltOver?'Se budgetrutan överst.':'Höj budgeten till ungefär '+kr(Math.ceil((B+X.saknas/MP.CFG.marginal)/10)*10)+' eller välj billigare rätter till andra måltider.')+'</div></div></div>';
  h+=group(g||emptyCell('Inga rätter passar just nu.'))});
 const rad=C.korg.rad.filter(x=>x.n>0).sort((a,c)=>c.kr-a.kr),hemma=C.korg.rad.filter(x=>x.fran>0);
 if(rad.length)h+=sh('Att köpa',kr(C.korg.kr))+group(rad.map(x=>'<div class="cell"><div class="grow"><div class="title">'+esc(planVaraNamn(x))+'</div><div class="meta">'+esc(MV.forp(x)+' · '+C.valda.filter(p=>planBehov(recipeById(C.P.val[p.id]),p)[x.k]).map(p=>p.namn).join(', '))+'</div></div><span class="val">'+kr(x.kr)+'</span></div>').join(''));
 if(hemma.length)h+='<div class="foot">Finns hemma och används: '+esc(hemma.map(x=>x.k).join(', '))+'.</div>';
 h+='<div class="pl-send"><button class="btn-fill" data-act="planSend"'+(C.klar?'':' disabled')+'>Skicka till veckosedeln</button><div class="foot">'+(C.klar?'Rätterna läggs på veckosedeln och varorna i inköpslistan.':'Välj en rätt till varje måltid först.')+' Priserna är ungefärliga.</div></div>';
 return h}
// Varor utan känt pris får inget pris på inköpslistan (där står "prisuppgift saknas")
const shopPris=x=>x.okand?null:Math.round(x.kr);
/* Varans namn i inköpslistan. Ett recept: receptets namn. Flera: basvarans namn, och inom parentes bara det som skiljer
   (gula lökar och gul lök blir Gul lök, frysta edamamebönor och gröna ärtor blir Frysta grönsaker (edamamebönor, gröna ärtor)) */
const VARA_FYLL=/^(lätt|lätta|färsk|färska|fryst|frysta|hel|hela|små|stora|naturell|krossade|torkade|kokta|riven|rivna|eller|och|med|till)$/;
function planVaraNamn(x){const n=(x.namn||[]).map(t=>String(t).replace(/\s*\(.*$/,'').trim()).filter(Boolean);if(!n.length)return cap(x.k);
 if(n.length===1||new Set(n).size===1)return cap(n[0]);
 const kw=String(x.k).toLowerCase().split(/\s+/).map(w=>w.slice(0,3)),egen=t=>t.toLowerCase().split(/\s+/).filter(w=>w.length>2&&!VARA_FYLL.test(w)&&!kw.some(k=>w.startsWith(k)));
 const extra=[...new Set(n.filter(t=>egen(t).length).map(t=>t.toLowerCase().split(/\s+/).filter(w=>!/^(fryst|frysta)$/.test(w)||!/fryst/.test(x.k)).join(' ')))];
 return cap(x.k)+(extra.length?' ('+extra.join(', ')+')':'')}
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7)}
function planSend(){const C=planCalc();if(!C.klar)return;const{P}=C,day=p=>addDays(P.vecka,p.dag),me=S.me||'';
 const menu=[],lab={};
 C.valda.forEach(p=>{const r=recipeById(P.val[p.id]),date=day(p);lab[p.id]=planEtikett(p,date);
  const pv=protVal(p.id,r);
  menu.push({date,who:p.who,title:r.title,recipe:r.id,addon:pv?protKort(pv):p.typ==='vardag'?'vid sidan till Henrik':'',note:p.typ==='storkok'?'Lagas söndag, lunch nästa vecka':''})});
 mackDagar(C.nV).forEach(n=>menu.push({date:addDays(P.vecka,n),who:'Gemensam',title:'Macka',recipe:'',addon:'',note:''}));
 menu.sort((a,b)=>a.date.localeCompare(b.date));
 // Proteinet får namnet på den som ska äta det
 const vem={};C.valda.forEach(p=>{const pv=protVal(p.id,recipeById(P.val[p.id]));if(!pv)return;[[pv.k,kottPerson()],[pv.v,vegPerson()]].forEach(([id,n])=>{const k=MV.vara(protById(id).vara).k;(vem[k]||(vem[k]=new Set)).add(n)})});
 const shop=C.korg.rad.filter(x=>x.n>0).map(x=>({name:planVaraNamn(x)+(vem[x.k]?' – '+[...vem[x.k]].join(' och '):''),qty:MV.forp(x),price:shopPris(x),
  meals:C.valda.filter(p=>planBehov(recipeById(P.val[p.id]),p)[x.k]).map(p=>lab[p.id])}));
 const inSheet=new Set(D().recipes.map(r=>r.id)),recipes=C.valda.map(p=>recipeById(P.val[p.id])).filter(r=>!inSheet.has(r.id)).map(bankSnap);
 const sun=addDays(P.vecka,6),m=parse(P.vecka),s2=parse(sun);
 const settingsOut={vecka_start:P.vecka,vecka_slut:sun,vecka_rubrik:'Vecka '+isoWeek(m)+' · '+DAYS3[m.getDay()].toLowerCase()+' '+m.getDate()+' – '+DAYS3[s2.getDay()].toLowerCase()+' '+s2.getDate()+' '+MON[s2.getMonth()],
  storkok:['sk','sv'].map(k=>P.val[k]).filter(Boolean).join(', '),storkok_not:'Lagas i helgen. Räcker till lunch måndag–fredag veckan efter.'};
 const used=new Set(C.valda.map(p=>P.val[p.id]));
 apiPost({action:'planSend',start:P.vecka,end:sun,menu,shop,recipes,lager:lagerUt(P.vecka,C.korg.rest),settings:settingsOut});
 if(wishes().some(w=>used.has(w.id)))updJSON('onskelista',[],a=>a.filter(w=>!used.has(w.id)));
 S.plan=false;S.planOpen=null;S.matTab='vecka';lsSet('matTab','vecka');window.scrollTo(0,0);render();toast('Veckan skickas till veckosedeln och inköpslistan')}
/* ---------- Planera med portioner (ny meny bredvid den gamla) ----------
   Varje dag har middag: en egen rätt, rester eller macka. Luncherna mån–fre är storkoket som lagas på söndagen.
   En rätt kan lagas till fler portioner, och det som blir över läggs automatiskt på nästa kväll utan egen rätt.
   Räcker budgeten inte till en rätt föreslås macka, och i stället för macka går det att laga fler portioner av en tidigare rätt. */
const PORTDAG=[0,1,2,3,4,5,6].map(i=>({id:'d'+i,namn:cap(DAYS[(i+1)%7]),typ:i<4?'vardag':'helg',who:'Gemensam',port:2,dag:i}));
const PLATSER2=PLATSER.filter(p=>p.typ==='storkok').concat(PORTDAG);
const PWISH={sk:'sk',sv:'sv',fr:'d4',lo:'d5',so:'d6'};
// Vilka kvällar som får mat: egna rätter först, sedan resterna i tur och ordning på nästa kväll utan egen rätt
function portTack(egna){const cov=Array(7).fill(null);let over=0;
 Object.keys(egna).forEach(d=>cov[d]={t:'ratt'});
 Object.keys(egna).map(Number).sort((a,c)=>a-c).forEach(d=>{let n=egna[d]/2-1;for(let e=d+1;e<7&&n>0;e++)if(!cov[e]){cov[e]={t:'rest',fr:d};n--}over+=n});
 return{cov,over}}
function portCalc(){
 const P=planState(),B=planBudget(),lager=planLager(P.vecka),pool=planPool(),CF=MP.CFG,MK=CF.mackaKr,tak=B*CF.marginal,ctxBas={manad:parse(P.vecka).getMonth()+1};PLANP=P;
 const valt=id=>{const r=P.val[id]&&recipeById(P.val[id]);return r||null};
 const portOf=p=>p.typ==='storkok'?p.port:Math.max(2,Number(P.port[p.id])||2);
 const Q=(p,n)=>Object.assign({},p,{port:n||portOf(p)});
 const kand={};PLATSER2.forEach(p=>kand[p.id]=pool.filter(r=>planPassar(r,p)));
 const tagna=except=>new Set(PLATSER2.filter(q=>q.id!==except&&valt(q.id)).map(q=>P.val[q.id]));
 const sk=PLATSER2.filter(p=>p.typ==='storkok');
 // Billigaste storkok till de tomma storkoksplatserna, ovanpå det som redan ligger i korgen
 const skFyll=(b,ut,utom)=>{const korg=b.slice(),tagen=new Set(ut),rad=[];let bas=MV.korg(korg,lager).kr,sum=0;
  sk.filter(q=>q.id!==utom&&!valt(q.id)).forEach(q=>{let best=null;
   kand[q.id].forEach(r=>{if(tagen.has(r.id)||!matLage(r.id).redo)return;const bh=planBehov(r,q),k=MV.korg(korg.concat([bh]),lager).kr-bas;if(!best||k<best.k)best={k,bh,id:r.id}});
   if(best){korg.push(best.bh);tagen.add(best.id);rad.push(best.bh);bas+=best.k;sum+=best.k}});
  return{sum,rad}};
 const egna=(utom,extra)=>{const o={};PORTDAG.forEach(p=>{if(p.id!==utom&&valt(p.id))o[p.dag]=portOf(p)});return Object.assign(o,extra||{})};
 // Kvällar utan mat kostar minst en macka
 const tomKr=e=>portTack(e).cov.filter(x=>!x).length*MK;
 const T=portTack(egna()),valda=PLATSER2.filter(p=>valt(p.id)),bValda=valda.map(p=>planBehov(valt(p.id),Q(p))),korg=MV.korg(bValda,lager);
 const wish=wishes().filter(w=>w.id&&WISHSLOT[w.slot]);
 const plats={};
 PLATSER2.forEach(p=>{
  const andra=valda.filter(q=>q.id!==p.id),bAndra=andra.map(q=>planBehov(valt(q.id),Q(q))),ut=tagna(p.id),F=skFyll(bAndra,ut,p.id),basF=bAndra.concat(F.rad);
  const ar=p.typ!=='storkok',e0=egna(p.id),vecka=(b,n)=>MV.korg(basF.concat([b]),lager).kr+tomKr(ar?Object.assign({},e0,{[p.dag]:n}):e0);
  const huvud=andra.map(q=>MP.huvudravara(valt(q.id))),mal=Math.max(1,(tak-MV.korg(bAndra,lager).kr)/4);
  const mk=(r,extra)=>{const b2=planBehov(r,Q(p,ar?2:0)),t=MV.tillagg(bAndra,b2,lager),l=matLage(r.id);
   const pp=MP.poang(r,{fav:isFav(r.id)},l,Object.assign({},ctxBas,{prisKvot:t.kassa/mal,ateranvandning:t.ateranvandning,valda:huvud}));
   const k2=vecka(b2,2);let n=ar?2:p.port,t2=t;
   // Fler portioner när det blir tydligt billigare per middag (hela förpackningar används) och nästa kväll saknar egen rätt
   if(ar&&portTack(Object.assign({},e0,{[p.dag]:4})).cov.filter(x=>!x).length<portTack(Object.assign({},e0,{[p.dag]:2})).cov.filter(x=>!x).length){
    const b4=planBehov(r,Q(p,4)),t4=MV.tillagg(bAndra,b4,lager),eff=x=>x.kassa+Math.max(0,x.svinnEfter-x.svinnFore);
    if(eff(t4)/2<=eff(t)*0.85&&vecka(b4,4)<=tak){n=4;t2=t4}}
   return Object.assign({r,t:t2,l,p:pp,n,ok:k2<=tak,over:k2-tak},extra||{})};
  const alla=kand[p.id].filter(r=>!ut.has(r.id)&&r.id!==P.val[p.id]&&matLage(r.id).redo).map(r=>mk(r)),lista=alla.filter(x=>x.ok);
  const f=MP.foreslag(lista,seedRng(P.vecka+p.id+(P.seed[p.id]||0)),3);
  const w=wish.filter(x=>PWISH[WISHSLOT[x.slot]]===p.id||(p.typ==='vardag'&&WISHSLOT[x.slot]==='v1')).map(x=>recipeById(x.id)).filter(r=>r&&!ut.has(r.id)&&r.id!==P.val[p.id]&&!f.val.some(y=>y.r.id===r.id)).map(r=>mk(r,{onskad:true})).filter(x=>x.ok);
  const val=w.slice(0,1).concat(f.val).slice(0,3);
  let valtX=null;
  if(valt(p.id)){const r=valt(p.id),b=planBehov(r,Q(p)),t=MV.tillagg(bAndra,b,lager);valtX={r,t,l:matLage(r.id),p:null,n:portOf(p)};
   // Plus och minus på portionerna: plus bara om en kväll till får mat och veckan ryms
   if(ar){const n=portOf(p),e2=Object.assign({},e0,{[p.dag]:n+2});valtX.plus=portTack(e2).over===0&&vecka(planBehov(r,Q(p,n+2)),n+2)<=tak;valtX.minus=n>2}}
  plats[p.id]={p,antal:alla.length,antalOk:lista.length,saknas:alla.length&&!lista.length?Math.min(...alla.map(x=>x.over)):0,valt:valtX,val,bonus:f.bonus&&!val.some(y=>y.r.id===f.bonus.r.id)?Object.assign({},f.bonus,{bonus:true}):null}});
 // Kvällarna: egen rätt, rester, vald macka, macka för att ingen rätt ryms, eller tom
 const dag=PORTDAG.map(p=>{const c=T.cov[p.dag];if(c)return Object.assign({p},c);if(P.mack[p.id])return{p,t:'macka'};return{p,t:plats[p.id].antalOk?'tom':'auto'}});
 const nMack=dag.filter(x=>x.t==='macka'||x.t==='auto').length,tomma=dag.filter(x=>x.t==='tom');
 // Laga fler portioner i stället för macka: en tidigare rätt vars rester då hamnar just den här kvällen
 dag.forEach(x=>{if(x.t!=='macka'&&x.t!=='auto')return;x.fler=[];
  PORTDAG.filter(q=>q.dag<x.p.dag&&valt(q.id)).forEach(q=>{const n=portOf(q)+2,e=egna(null,{[q.dag]:n}),T2=portTack(e);if(T2.over||!T2.cov[x.p.dag]||T2.cov[x.p.dag].fr!==q.dag)return;
   const b=valda.map(v=>planBehov(valt(v.id),v.id===q.id?Q(v,n):Q(v))),F=skFyll(b,tagna(null),null),k=MV.korg(b.concat(F.rad),lager).kr+tomKr(e);
   if(k<=tak)x.fler.push({q,n,r:valt(q.id),extra:MV.korg(b,lager).kr-korg.kr-MK})})});
 const skTom=sk.filter(p=>!valt(p.id)),Fsk=skFyll(bValda,tagna(null),null);
 const reserv=Fsk.sum+tomma.length*MK,kassa=korg.kr+nMack*MK;
 // Varor som blir över och inte håller
 const svinn=korg.rad.filter(x=>x.over>0&&!x.hall&&x.overKr>=8).sort((a,c)=>c.overKr-a.overKr);
 PLANP=null;
 return{P,B,MK,plats,dag,valda,korg,kassa,reserv,skTom,tomma,nMack,svinn,Q,klar:!skTom.length&&!tomma.length}}
const portDag=d=>DAYS[(d+1)%7];
function portView(){const C=portCalc(),{P,B}=C,mon=parse(P.vecka),sun=parse(addDays(P.vecka,6));
 NB.title='Planera med portioner';NB.back=true;
 let h='<div class="rcp-top"><button class="back" data-act="planClose">'+I.back+'Mat</button></div><header class="head"><div class="head-row"><h1 class="lt" id="lt">Vecka '+isoWeek(mon)+'</h1></div><div class="sub">'+esc(cap(DAYS[mon.getDay()])+' '+mon.getDate()+' '+MON[mon.getMonth()]+' – '+DAYS[sun.getDay()]+' '+sun.getDate()+' '+MON[sun.getMonth()])+' · portioner</div></header>';
 const pct=Math.min(100,Math.round(C.kassa/B*100)),over=C.kassa>B,heltOver=C.kassa+C.reserv>B*MP.CFG.marginal;
 const n=t=>C.dag.filter(x=>x.t===t).length,harMat=7-C.tomma.length;
 h+='<div class="pl-bud"><div class="pl-bt"><div><span class="fn">I kassan</span><b class="num">'+kr(C.kassa)+'</b></div><label class="pl-bb"><span class="fn">Budget</span><input class="num" type="number" inputmode="numeric" min="200" max="5000" step="10" value="'+B+'" data-change="planBudget" aria-label="Veckobudget i kronor"></label></div>'+
  '<div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><div class="fn">'+(over?'Över budget med '+kr(C.kassa-B):'Kvar '+kr(B-C.kassa))+(C.nMack?' · '+antal(C.nMack,'mackkväll','mackkvällar')+' ('+kr(C.nMack*C.MK)+')':'')+'</div>'+
  (heltOver&&(C.tomma.length||C.skTom.length)?'<div class="fn pl-warn">Det som är kvar att välja kostar minst '+kr(C.reserv)+' och ryms inte. Byt en dyr rätt eller höj budgeten.</div>':'')+'</div>';
 h+='<div class="pl-pin"><div class="pl-mini" aria-hidden="true"><span class="fn">I kassan</span><b class="num">'+kr(C.kassa)+'</b><div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><span class="fn'+(over?' bad':'')+'">'+(over?'Över '+kr(C.kassa-B):'Kvar '+kr(B-C.kassa))+'</span></div></div>';
 // Portionskollen: har varje kväll mat, och blir något över
 const delar=[[n('ratt'),'rätt','rätter'],[n('rest'),'kväll med rester','kvällar med rester'],[n('macka')+n('auto'),'macka','mackor']].filter(x=>x[0]).map(x=>antal(...x));
 h+='<div class="pt-koll"><div class="pt-stor"><b class="num">'+harMat+' av 7</b><span>middagar har mat</span></div><div class="fn">'+(delar.length?esc(cap(lista(delar))):'Inget valt än')+' · lunch mån–fre är storkoket</div>'+
  '<div class="pt-rad">'+C.dag.map(x=>'<span class="pt-d '+x.t+'" title="'+esc(cap(portDag(x.p.dag)))+'">'+esc(DAYS3[(x.p.dag+1)%7].slice(0,1).toUpperCase())+'</span>').join('')+'</div>'+
  (C.svinn.length?'<div class="fn pt-svinn">Blir över och håller inte: '+esc(lista(C.svinn.slice(0,3).map(x=>planVaraNamn(x).toLowerCase()+' ('+kr(x.overKr)+')')))+'</div>':'<div class="fn pt-ok">Inget som inte håller blir över</div>')+'</div>';
 // Storkok: lunch måndag–fredag
 const kort=(X,p,chosen)=>{if(!chosen){const q=C.Q(p,X.n),nx=C.dag.find(y=>y.p.dag>p.dag&&y.t!=='ratt'&&y.t!=='rest');if(p.typ!=='storkok')X.pk=X.n>2&&nx?'Lagas '+X.n+' portioner, räcker även till '+portDag(nx.p.dag):'Lagas 2 portioner';return planCard(X,q).replace(' data-k="',' data-n="'+X.n+'" data-k="')}return planCard(X,C.Q(p),true)};
 const forslag=(X,p)=>{const visas=X.val.length+(X.bonus?1:0);
  // Karusell: den rätt som passar bäst stort, de andra ett svep bort (och runt igen)
  if(FL_STYLE==='karusell'&&visas){const alla=X.val.concat(X.bonus?[X.bonus]:[]).sort((a,c)=>(c.p?c.p.summa:0)-(a.p?a.p.summa:0));
   return'</div>'+portKarusell(alla,p,C)+'<div class="group">'+(X.antalOk>visas?'<button class="cell link" data-act="planMore" data-id="'+p.id+'"><span class="grow" style="color:var(--accent)">Fyra andra förslag</span><span class="meta">'+X.antalOk+' rätter ryms</span></button>':'')}
  return X.val.map(x=>kort(x,p)).join('')+(X.bonus?kort(X.bonus,p):'')+(X.antalOk>visas?'<button class="cell link" data-act="planMore" data-id="'+p.id+'"><span class="grow" style="color:var(--accent)">Andra förslag</span><span class="meta">'+X.antalOk+' rätter ryms</span></button>':'')};
 PLATSER2.filter(p=>p.typ==='storkok').forEach(p=>{const X=C.plats[p.id],open=!X.valt||S.planOpen===p.id;
  h+=sh(esc(p.namn),'5 portioner · lunch mån–fre');
  let g=X.valt?kort(X.valt,p,true):'';
  if(open&&X.antalOk)g+=forslag(X,p);else if(open&&X.antal)g+='<div class="cell pl-none"><div class="grow"><div class="title">Inget storkok ryms i budgeten</div><div class="meta">Appen har provat alla '+X.antal+'. Höj budgeten eller välj billigare middagar.</div></div></div>';
  h+=group(g||emptyCell('Inga rätter passar just nu.'))});
 // Middagarna, en dag i taget
 h+='<div class="pt-mid">'+sh('Middagar','Måndag–söndag')+'</div>';
 C.dag.forEach(x=>{const p=x.p,X=C.plats[p.id],namn=cap(portDag(p.dag));let g='',st='';
  if(x.t==='ratt'){const v=X.valt,rest=C.dag.filter(y=>y.t==='rest'&&y.fr===p.dag).map(y=>portDag(y.p.dag));
   st=v.n+' portioner';
   g=kort(v,p,true)+'<div class="cell pt-port"><div class="grow"><div class="title">Lagas '+v.n+' portioner</div><div class="meta">'+(rest.length?'Rester '+esc(lista(rest)):'Inga rester')+'</div></div><div class="pl-step" role="group" aria-label="Portioner"><button data-act="portPort" data-id="'+p.id+'" data-d="-2" aria-label="Färre portioner"'+(v.minus?'':' disabled')+'>'+I.minus+'</button><span class="num" aria-live="polite">'+v.n+'</span><button data-act="portPort" data-id="'+p.id+'" data-d="2" aria-label="Fler portioner"'+(v.plus?'':' disabled')+'>'+I.plus+'</button></div></div>';
   if(S.planOpen===p.id&&X.antalOk)g+=forslag(X,p)}
  else if(x.t==='rest'){const r=recipeById(P.val['d'+x.fr]);st='Rester';
   g='<div class="cell pt-rest"><span class="pl-ic" aria-hidden="true">'+foodIcon(r.title)+'</span><div class="grow"><span class="chips-row"><span class="chip r">Rester</span></span><div class="title">'+esc(r.title)+'</div><div class="meta">Lagas '+esc(portDag(x.fr))+'. Ändra portionerna där.</div></div></div>'}
  else if(x.t==='macka'||x.t==='auto'){st='Macka';
   g='<div class="cell pt-macka"><span class="pl-ic" aria-hidden="true">🥪</span><div class="grow"><div class="title">Macka</div><div class="meta">'+kr(C.MK)+' för två · '+(x.t==='auto'?'Budgeten räcker inte till en rätt den här kvällen':'Vald')+'</div></div>'+(x.t==='macka'?'<button class="pt-btn" data-act="portMacka" data-id="'+p.id+'">Välj rätt</button>':'')+'</div>'+
    x.fler.map(f=>'<button class="cell pt-fler" data-act="portFler" data-id="'+f.q.id+'" data-n="'+f.n+'"><span class="pl-ic" aria-hidden="true">'+foodIcon(f.r.title)+'</span><span class="grow"><span class="title">Laga '+f.n+' portioner '+esc(f.r.title.toLowerCase())+' i stället</span><span class="meta">Rester från '+esc(portDag(f.q.dag))+' · '+(f.extra>0?'+'+kr(f.extra):kr(-f.extra)+' billigare')+'</span></span><span class="pl-add" aria-hidden="true">'+I.plus+'</span></button>').join('')}
  else{st='Välj';g=forslag(X,p)+'<button class="cell link" data-act="portMacka" data-id="'+p.id+'"><span class="pl-ic" aria-hidden="true">🥪</span><span class="grow" style="color:var(--accent)">Macka den här kvällen</span><span class="meta">'+kr(C.MK)+'</span></button>'}
  h+=sh(esc(namn),st)+group(g)});
 const rad=C.korg.rad.filter(x=>x.n>0).sort((a,c)=>c.kr-a.kr),hemma=C.korg.rad.filter(x=>x.fran>0);
 if(rad.length)h+=sh('Att köpa',kr(C.korg.kr))+group(rad.map(x=>'<div class="cell"><div class="grow"><div class="title">'+esc(planVaraNamn(x))+'</div><div class="meta">'+esc(MV.forp(x)+' · '+C.valda.filter(p=>planBehov(recipeById(P.val[p.id]),C.Q(p))[x.k]).map(p=>p.namn).join(', '))+'</div></div><span class="val">'+kr(x.kr)+'</span></div>').join(''));
 if(hemma.length)h+='<div class="foot">Finns hemma och används: '+esc(hemma.map(x=>x.k).join(', '))+'.</div>';
 h+='<div class="pl-send"><button class="btn-fill" data-act="portSend"'+(C.klar?'':' disabled')+'>Skicka till veckosedeln</button><div class="foot">'+(C.klar?'Rätterna, resterna och mackorna läggs på veckosedeln och varorna i inköpslistan.':'Varje middag behöver en rätt, rester eller macka, och båda storkoken behöver väljas.')+' Priserna är ungefärliga.</div></div>';
 return h}
// Förslagen som stora kort i en karusell som loopar. Varje kort: bild (eller ikon), namn, pris, portioner och kort om rätten
let FL_STYLE=lsGet('forslag')==='lista'?'lista':'karusell';
// Utvecklarläge: visar menyer som inte är färdiga. Gäller bara den här enheten
let DEV=lsGet('dev')==='1';
// Designens versionsnummer. UI 2.0 ("Lugn") gäller för alla. UI 1.0, den gamla designen, går bara att välja i utvecklarläget
const UI_VER='2.0';
// Appens version, samma nummer som ?v= på app.js
const APP_VER=((document.querySelector('script[src*="app.js?v="]')||{}).src||'').replace(/.*\?v=/,'')||'?';
const nyNu=()=>!(DEV&&lsGet('ny')==='0');
let NY=nyNu();
function applyNy(){document.documentElement.classList.toggle('ny',NY)}
applyNy();
// menyväljarens och flikradens utseende i UI 2.0, valt per enhet i Inställningar
let SEGSTIL=['kapsel','klassisk'].includes(lsGet('segstil'))?lsGet('segstil'):'standard',FLIKRAD=['glas','piller'].includes(lsGet('flikrad'))?lsGet('flikrad'):'fast';
function applyStil(){const c=document.documentElement.classList;c.toggle('seg-kapsel',SEGSTIL==='kapsel');c.toggle('seg-klassisk',SEGSTIL==='klassisk');c.toggle('nav-glas',FLIKRAD!=='fast');c.toggle('nav-piller',FLIKRAD==='piller')}
applyStil();
function portKarusell(alla,p,C){const n=alla.length,i0=Math.min(Math.max(1,(S.carIdx||{})[p.id]||1),n);
 const nx=C.dag.find(y=>y.p.dag>p.dag&&y.t!=='ratt'&&y.t!=='rest');
 const kortet=(x,klon)=>{const r=x.r,img=r.img||imgOf(r.id),q=C.Q(p,x.n),pv=protVal(p.id,r),stars=x.l.betyg?'★ '+starNum(x.l.s):'Ny';
  const tag=whoChip(pv?'Kött/Veg':r.who)+(x.onskad?'<span class="chip v">Önskad</span>':x.bonus?'<span class="chip g">Bonus</span>':isFav(r.id)?'<span class="chip k">Favorit</span>':'');
  const port=p.typ==='storkok'?p.port+' portioner, lunch mån–fre':x.n>2&&nx?'Lagas '+x.n+' portioner, räcker även till '+portDag(nx.p.dag):'Lagas 2 portioner';
  const om=[r.min?r.min+' min':'',pv?protById(pv.k).namn+' till '+kottPerson()+', '+protById(pv.v).namn.toLowerCase()+' till '+vegPerson():''].filter(Boolean).join(' · ');
  return'<div class="car-s '+kind(r)+'"'+(klon?' aria-hidden="true"':'')+'><button class="car-img" data-act="recipe" data-id="'+esc(r.id)+'" tabindex="'+(klon?-1:0)+'" aria-label="Öppna '+esc(r.title)+'">'+(img?'<img src="'+esc(img)+'" alt="" loading="lazy" onerror="this.remove()">':'')+'<span aria-hidden="true">'+foodIcon(r.title)+'</span></button>'+
   '<div class="car-b"><span class="chips-row">'+tag+'</span><div class="car-t">'+esc(r.title)+'</div><div class="car-m"><span>'+stars+'</span> · <span class="num">Handla för '+kr(Math.round(x.t.kassa))+'</span></div>'+
   '<div class="car-p">'+esc(port)+'</div>'+(om?'<div class="car-o">'+esc(om)+'</div>':'')+(r.why?'<div class="car-w">'+esc(r.why)+'</div>':'')+
   '<button class="btn-fill car-v" data-act="planPick" data-id="'+esc(r.id)+'" data-k="'+p.id+'" data-n="'+x.n+'"'+(klon?' tabindex="-1"':'')+'>Välj</button></div></div>'};
 const sl=n>1?[kortet(alla[n-1],1)].concat(alla.map(x=>kortet(x)),[kortet(alla[0],1)]):alla.map(x=>kortet(x));
 return'<div class="car'+(n>1?' loop':'')+'" data-car="'+p.id+'" data-n="'+n+'" data-i="'+(n>1?i0:0)+'" aria-roledescription="karusell"><div class="car-tr" style="--i:'+(n>1?i0:0)+'">'+sl.join('')+'</div></div>'+
  (n>1?'<div class="car-dots" aria-hidden="true">'+alla.map((x,i)=>'<i'+(i+1===i0?' class="on"':'')+'></i>').join('')+'</div>':'')}
// Svep i karusellen. Klonerna i ändarna gör att den loopar: efter sista kortet kommer det första igen
(function(){let g=null;
 const set=(car,i,anim)=>{const tr=car.firstElementChild,n=Number(car.dataset.n);tr.style.transition=anim?'':'none';tr.style.setProperty('--dx','0px');tr.style.setProperty('--i',i);car.dataset.i=i;
  const k=((i-1)%n+n)%n;car.nextElementSibling&&car.nextElementSibling.querySelectorAll('i').forEach((d,j)=>d.classList.toggle('on',j===k));(S.carIdx||(S.carIdx={}))[car.dataset.car]=k+1};
 document.addEventListener('pointerdown',e=>{const car=e.target.closest('.car.loop');if(!car||e.button>0)return;g={car,x0:e.clientX,y0:e.clientY,dx:0,a:null,id:e.pointerId}},true);
 addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const dx=e.clientX-g.x0,dy=e.clientY-g.y0;
  if(!g.a){if(Math.hypot(dx,dy)<8)return;g.a=Math.abs(dx)>Math.abs(dy)?'x':'y';if(g.a==='x')g.car.firstElementChild.style.transition='none'}
  if(g.a!=='x')return;g.dx=dx;g.car.firstElementChild.style.setProperty('--dx',dx+'px')});
 const end=e=>{if(!g||e.pointerId!==g.id)return;const s=g;g=null;if(s.a!=='x')return;
  const w=s.car.offsetWidth*.89,i=Number(s.car.dataset.i),j=Math.abs(s.dx)>Math.min(60,w*.2)?i+(s.dx<0?1:-1):i;
  set(s.car,j,true);const n=Number(s.car.dataset.n);
  if(j===0||j===n+1)setTimeout(()=>{if(s.car.isConnected)set(s.car,j===0?n:1,false)},320);
  const stop=ev=>{ev.stopPropagation();ev.preventDefault()};if(Math.abs(s.dx)>8){addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>removeEventListener('click',stop,true),60)}};
 addEventListener('pointerup',end);addEventListener('pointercancel',end)})();
function portSend(){const C=portCalc();if(!C.klar)return;const{P}=C,me=S.me||'',vd=d=>addDays(P.vecka,d);
 PLANP=P;const menu=[],lab={};
 C.valda.forEach(p=>{const r=recipeById(P.val[p.id]),date=vd(p.dag),q=C.Q(p);lab[p.id]=planEtikett(p,date);const pv=protVal(p.id,r);
  const rest=C.dag.filter(y=>y.t==='rest'&&y.fr===p.dag).map(y=>portDag(y.p.dag));
  menu.push({date,who:p.who,title:r.title,recipe:r.id,addon:pv?protKort(pv):'',note:p.typ==='storkok'?'Lagas söndag, lunch nästa vecka':q.port>2?'Lagas '+q.port+' portioner, rester '+lista(rest):''})});
 C.dag.forEach(x=>{const date=vd(x.p.dag);
  if(x.t==='rest'){const r=recipeById(P.val['d'+x.fr]);menu.push({date,who:'Gemensam',title:'Rester: '+r.title,recipe:'',addon:'',note:'Lagas '+portDag(x.fr)})}
  else if(x.t==='macka'||x.t==='auto')menu.push({date,who:'Gemensam',title:'Macka',recipe:'',addon:'',note:''})});
 menu.sort((a,b)=>a.date.localeCompare(b.date));
 const vem={};C.valda.forEach(p=>{const pv=protVal(p.id,recipeById(P.val[p.id]));if(!pv)return;[[pv.k,kottPerson()],[pv.v,vegPerson()]].forEach(([id,n])=>{const k=MV.vara(protById(id).vara).k;(vem[k]||(vem[k]=new Set)).add(n)})});
 const shop=C.korg.rad.filter(x=>x.n>0).map(x=>({name:planVaraNamn(x)+(vem[x.k]?' – '+[...vem[x.k]].join(' och '):''),qty:MV.forp(x),price:shopPris(x),
  meals:C.valda.filter(p=>planBehov(recipeById(P.val[p.id]),C.Q(p))[x.k]).map(p=>lab[p.id])}));
 PLANP=null;
 const inSheet=new Set(D().recipes.map(r=>r.id)),recipes=C.valda.map(p=>recipeById(P.val[p.id])).filter(r=>!inSheet.has(r.id)).map(bankSnap);
 const sun=addDays(P.vecka,6),m=parse(P.vecka),s2=parse(sun);
 const settingsOut={vecka_start:P.vecka,vecka_slut:sun,vecka_rubrik:'Vecka '+isoWeek(m)+' · '+DAYS3[m.getDay()].toLowerCase()+' '+m.getDate()+' – '+DAYS3[s2.getDay()].toLowerCase()+' '+s2.getDate()+' '+MON[s2.getMonth()],
  storkok:['sk','sv'].map(k=>P.val[k]).filter(Boolean).join(', '),storkok_not:'Lagas i helgen. Räcker till lunch måndag–fredag veckan efter.'};
 const used=new Set(C.valda.map(p=>P.val[p.id]));
 apiPost({action:'planSend',start:P.vecka,end:sun,menu,shop,recipes,lager:lagerUt(P.vecka,C.korg.rest),settings:settingsOut});
 if(wishes().some(w=>used.has(w.id)))updJSON('onskelista',[],a=>a.filter(w=>!used.has(w.id)));
 S.plan=false;S.planOpen=null;S.matTab='vecka';lsSet('matTab','vecka');window.scrollTo(0,0);render();toast('Veckan skickas till veckosedeln och inköpslistan')}
/* ---------- Veckoförslag (tredje menyn) ----------
   Appen bygger hela veckan på en gång: storkok, middagar, rester och mackor. Den provar många varianter och behåller den
   som ger mest poäng (uppskattade rätter som inte varit för nyligen) för pengarna, med lite svinn och utan för mycket av
   samma råvara. Budgeten är en spärr. Du kan låsa en rätt, byta till nästa rätt i poängordning eller göra om resten. */
// Macka är dyr i poäng så att den bara blir kvar när budgeten inte räcker till en rätt
// var = vad en ny huvudråvara i veckan är värd i kronor (omväxling som inte kostar mer vinner)
const AUTO_W={billigt:{kr:.5,rest:.95,macka:-15,var:4},balans:{kr:.3,rest:.85,macka:-15,var:6},omvaxlande:{kr:.18,rest:.65,macka:-15,var:10}};
const AUTO_SK={sk:PLATSER[0],sv:PLATSER[1]};
const autoNamn=k=>k==='sk'?'Storkok kött':k==='sv'?'Storkok vegetariskt':k==='sg'?'Gemensamt storkok':cap(portDag(Number(k.slice(1))));
// Allt som behövs för att räkna på en vecka: kandidater i poängordning per funktion, poäng och varubehov
function autoCtx(P){const B=planBudget(),CF=MP.CFG,lager=planLager(P.vecka),pool=planPool(),manad=parse(P.vecka).getMonth()+1,tak=B*CF.marginal,mal=tak/24;
 const redo=r=>matLage(r.id).redo,BH={},SC={},RANK={};
 const fn=k=>k==='sk'||k==='sv'||k==='sg'?k:Number(k.slice(1))<4?'vardag':'helg';
 const portBas=k=>k==='sg'?10:k==='sk'||k==='sv'?5:2;
 const behov=x=>{const c=x.key+'|'+x.id+'|'+x.n;if(BH[c])return BH[c];const r=recipeById(x.id);
  return BH[c]=x.key==='sk'||x.key==='sv'?MV.behov(r,x.n/(Number(r.portions)||2)):planBehov(r,{id:x.key,port:x.n})};
 const score=(id,k)=>{const f=fn(k),c=f+'|'+id;if(c in SC)return SC[c];const r=recipeById(id),n=portBas(k),kr=MV.korg([behov({key:f==='vardag'||f==='helg'?k:f,id,n})],lager).kr;
  return SC[c]=MP.poang(r,{fav:isFav(id)},matLage(id),{manad,prisKvot:kr/n/mal}).summa};
 const rank=k=>{const f=fn(k);if(RANK[f])return RANK[f];
  const L=f==='sk'||f==='sv'?pool.filter(r=>planPassar(r,AUTO_SK[f])&&redo(r)):f==='sg'?pool.filter(r=>isStorkok(r)&&redo(r)&&protRaw(r)):pool.filter(r=>planPassar(r,PORTDAG[f==='vardag'?0:4])&&redo(r));
  return RANK[f]=L.map(r=>({id:r.id,s:score(r.id,f==='vardag'?'d0':f==='helg'?'d4':f)})).sort((a,c)=>c.s-a.s)};
 return{P,B,tak,lager,MK:CF.mackaKr,W:AUTO_W[P.prio]||AUTO_W.balans,behov,score,rank,fn}}
const autoItems=pl=>pl.st.concat(pl.dag.map((x,d)=>x.t==='ratt'?{key:'d'+d,id:x.id,n:x.n}:null).filter(Boolean));
function autoEval(pl,X){const it=autoItems(pl),korg=MV.korg(it.map(X.behov),X.lager),mack=pl.dag.filter(x=>x.t==='macka').length,kassa=korg.kr+mack*X.MK,W=X.W;
 let u=0,pen=0;const hv={},ids={};
 pl.st.forEach(x=>{const s=X.score(x.id,x.key);u+=x.key==='sg'?s*2.7:s*1.5});
 pl.dag.forEach((x,d)=>{if(x.t==='ratt'){const s=X.score(x.id,'d'+d);u+=s+(x.n>=4?s*W.rest:0)}else if(x.t==='macka')u+=W.macka});
 it.forEach(x=>{const h=MP.huvudravara(recipeById(x.id));hv[h]=(hv[h]||0)+1;ids[x.id]=(ids[x.id]||0)+1});
 Object.values(hv).forEach(c=>{if(c>2)pen+=150*(c-2)});if(X.undvik)it.forEach(x=>{if(X.undvik.has(x.id))pen+=14});Object.values(ids).forEach(c=>{if(c>1)pen+=500});
 const over=Math.max(0,kassa-X.tak);
 // Svinnet räknas som det som riskerar att slängas: rester värderade i kronor gånger risken att de blir dåliga
 const hot=RP.hotat(RP.rester(korg)),fam=Object.keys(hv).length;
 return{val:u-W.kr*kassa-.3*hot+.3*(W.var||6)*fam-pen-(over?300+over*5:0),kassa,korg,mack,over,hv,hot}}
// Rester bara kvällen efter, och bara efter en rätt som lagas till 4 portioner
function autoNorm(pl,lock){const D=pl.dag;
 for(let d=0;d<7;d++){const x=D[d];
  if(x.t==='rest'&&!(d>0&&D[d-1].t==='ratt'&&D[d-1].n===4))D[d]={t:'macka'};
  if(x.t==='ratt'&&x.n===4){if(d===6||d===3)x.n=2;else if(D[d+1].t!=='rest'){if(lock['d'+(d+1)])x.n=2;else D[d+1]={t:'rest'}}}}
 return pl}
const autoClone=pl=>({mode:pl.mode,st:pl.st.map(x=>Object.assign({},x)),dag:pl.dag.map(x=>Object.assign({},x))});
function autoGen(X,seed){const P=X.P,lock=P.lock||{},rng=seedRng(P.vecka+'|'+seed),old=P.plan,used=pl=>new Set(autoItems(pl).map(x=>x.id));
 // Gör om: rätterna från de två senaste förslagen (utom de låsta) väljs inte igen så länge det finns andra som passar
 const las=new Set(old?autoItems(old).filter(x=>lock[x.key]).map(x=>x.id):[]);
 X.undvik=seed>0&&!X.behall&&P.hist&&P.hist.length?new Set(P.hist.flat().filter(id=>!las.has(id))):null;
 const pick=(k,pl,top)=>{const u=used(pl);let L=X.rank(k).filter(c=>!u.has(c.id));if(X.undvik){const L2=L.filter(c=>!X.undvik.has(c.id));if(L2.length)L=L2}L=L.slice(0,top||12);return L.length?L[Math.floor(rng()*rng()*L.length)].id:null};
 const stFor=(mode,pl)=>(mode==='gem'?['sg']:['sk','sv']).map(k=>{const o=old&&old.st.find(x=>x.key===k);if(o&&lock[k])return Object.assign({},o);const id=pick(k,pl,3);return id?{key:k,id,n:k==='sg'?10:5}:null}).filter(Boolean);
 let pl={mode:P.skMode==='gem'?'gem':P.skMode==='two'?'two':(old&&old.mode)||'two',st:[],dag:Array(7).fill(null).map(()=>({t:'macka'}))};
 if(old)old.dag.forEach((x,d)=>{if(lock['d'+d]){pl.dag[d]=Object.assign({},x);if(x.n===4&&d<6)pl.dag[d+1]={t:'rest'}}});
 pl.st=stFor(pl.mode,pl);
 for(let d=0;d<7;d++)if(!lock['d'+d]&&pl.dag[d].t!=='rest'){const id=pick('d'+d,pl,3);if(id)pl.dag[d]={t:'ratt',id,n:2}}
 autoNorm(pl,lock);
 let cur=pl,cv=autoEval(cur,X).val,best=cur,bv=cv;const N=1400;
 for(let i=0;i<N;i++){const T=8*Math.pow(.2/8,i/N),q=autoClone(cur),m=rng(),d=Math.floor(rng()*7),k='d'+d;
  if(m<.42){if(lock[k])continue;const id=pick(k,q);if(!id)continue;const was=q.dag[d];if(was.t==='rest')q.dag[d-1].n=2;q.dag[d]={t:'ratt',id,n:was.t==='ratt'?was.n:2}}
  else if(m<.64){const x=q.dag[d];if(lock[k]||x.t!=='ratt')continue;if(x.n===2){if(d===6||d===3||lock['d'+(d+1)])continue;x.n=4;q.dag[d+1]={t:'rest'}}else{x.n=2;const id=pick('d'+(d+1),q);q.dag[d+1]=id?{t:'ratt',id,n:2}:{t:'macka'}}}
  else if(m<.76){const x=q.dag[d];if(lock[k])continue;if(x.t==='macka'){const id=pick(k,q);if(!id)continue;q.dag[d]={t:'ratt',id,n:2}}else if(x.t==='ratt')q.dag[d]={t:'macka'};else continue}
  else if(m<.95){const s=q.st[Math.floor(rng()*q.st.length)];if(!s||lock[s.key])continue;const id=pick(s.key,q);if(!id)continue;s.id=id}
  else{if(P.skMode==='gem'||P.skMode==='two'||q.st.some(x=>lock[x.key]))continue;q.mode=q.mode==='gem'?'two':'gem';q.st=stFor(q.mode,q);if(!q.st.length)continue}
  autoNorm(q,lock);const v=autoEval(q,X).val;
  if(v>=cv||rng()<Math.exp((v-cv)/T)){cur=q;cv=v;if(v>bv){best=q;bv=v}}}
 X.undvik=null;return best}
function autoState(){const P=planState();P.lock=P.lock||{};P.prio=P.prio||'balans';P.skMode=P.skMode||'auto';P.gen=P.gen||0;return P}
// Håller val och protein i samma form som de andra planerarna, så att proteinbladet fungerar
// Nytt förslag efter ändrat val: låsta rätter behålls, övriga räknas om med de nya vikterna
function autoNy(P){PLANP=P;const X=autoCtx(P);X.behall=1;P.plan=autoGen(X,P.gen);P.plan.vecka=P.vecka;autoSync(P);PLANP=null;planSave(P)}
function autoSync(P){P.val={};if(P.plan)autoItems(P.plan).forEach(x=>P.val[x.key]=x.id)}
function autoCalc(){const P=autoState();PLANP=P;let X=autoCtx(P);
 if(!P.plan||!P.plan.dag||P.plan.vecka!==P.vecka){P.plan=autoGen(X,P.gen);P.plan.vecka=P.vecka;autoSync(P);planSave(P);X=autoCtx(P)}
 const E=autoEval(P.plan,X);PLANP=null;
 const ids=autoItems(P.plan),betyg=ids.map(x=>matLage(x.id)).filter(l=>l.betyg).map(l=>l.s);
 return Object.assign({X,E,P,B:X.B,olika:new Set(ids.map(x=>x.id)).size,betyg:betyg.length?betyg.reduce((a,b)=>a+b,0)/betyg.length:0},{kassa:E.kassa})}
function autoCard(C,x,sub){const P=C.P,r=recipeById(x.id);if(!r)return'';const lock=!!P.lock[x.key],L=C.X.rank(x.key),i=L.findIndex(c=>c.id===x.id);
 PLANP=P;const pv=x.key==='sk'||x.key==='sv'?null:protVal(x.key,r);PLANP=null;
 const ensam=MV.korg([C.X.behov(x)],C.X.lager).kr,stars=matLage(r.id).betyg?'★ '+starNum(matLage(r.id).s):'Ny';
 const tag=whoChip(pv?'Kött/Veg':r.who)+(isFav(r.id)?'<span class="chip k">Favorit</span>':'')+(r.freezes?'<span class="chip">Går att frysa</span>':'');
 // Samma rad som på veckosedeln: håll in för att låsa, svep åt vänster eller tryck på ⇄ för nästa rätt
 const meta=[stars,'<span class="num">Handla för '+kr(ensam)+'</span>',esc(sub)].join('<span class="dot" aria-hidden="true">·</span>');
 const row='<div class="cell dr au-r lk-rad'+(lock?' lk-on':' dr-slide')+'" data-lk data-hold-lock="'+x.key+'" data-lock-act="autoLock" data-lst="'+(lock?1:0)+'"><span class="lk-ring" aria-hidden="true"></span><span class="lk-bd" aria-hidden="true">'+I.lock+'</span>'+
  '<button class="dr-main" data-act="recipe" data-id="'+esc(r.id)+'">'+dishThumb(r,r.title)+'<span class="grow"><span class="chips-row">'+tag+'</span><span class="title">'+esc(r.title)+'</span><span class="meta">'+meta+'</span>'+(pv?protPills(pv,'planProt',x.key):'')+'</span></button>'+
  (lock?'':'<button class="dr-byt" data-act="autoNasta" data-id="'+x.key+'" aria-label="Nästa rätt i stället för '+esc(r.title)+'">'+I.swap+'</button>')+'</div>';
 return lock?row:'<div class="dr-wrap"><button class="dr-act" data-act="autoNasta" data-id="'+x.key+'" aria-label="Nästa rätt i stället för '+esc(r.title)+'">'+I.swap+'<span>Nästa</span></button>'+row+'</div>'}
function autoView(){const C=autoCalc(),{P,B,E}=C,mon=parse(P.vecka),sun=parse(addDays(P.vecka,6)),pl=P.plan;
 NB.title='Veckoförslag';NB.back=true;
 let h='<div class="rcp-top"><button class="back" data-act="planClose">'+I.back+'Mat</button></div><header class="head"><div class="head-row"><h1 class="lt" id="lt">Vecka '+isoWeek(mon)+'</h1></div><div class="sub">'+esc(cap(DAYS[mon.getDay()])+' '+mon.getDate()+' '+MON[mon.getMonth()]+' – '+DAYS[sun.getDay()]+' '+sun.getDate()+' '+MON[sun.getMonth()])+' · veckoförslag</div></header>';
 const pct=Math.min(100,Math.round(E.kassa/B*100)),over=E.kassa>B;
 h+='<div class="pl-bud"><div class="pl-bt"><div><span class="fn">I kassan</span><b class="num">'+kr(E.kassa)+'</b></div><label class="pl-bb"><span class="fn">Budget</span><input class="num" type="number" inputmode="numeric" min="200" max="5000" step="10" value="'+B+'" data-change="planBudget" aria-label="Veckobudget i kronor"></label></div>'+
  '<div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><div class="fn">'+(over?'Över budget med '+kr(E.kassa-B)+'. Tryck på Gör om veckan.':'Kvar '+kr(B-E.kassa))+'</div>'+
  '<div class="au-stats"><span><b class="num">'+kr(E.hot)+'</b><span class="fn">kan slängas</span></span><span><b class="num">'+C.olika+'</b><span class="fn">olika rätter</span></span><span><b class="num">'+(C.betyg?starNum(Math.round(C.betyg*10)/10):'–')+'</b><span class="fn">snittbetyg</span></span><span><b class="num">'+E.mack+'</b><span class="fn">'+(E.mack===1?'macka':'mackor')+'</span></span></div></div>';
 h+='<div class="pl-pin"><div class="pl-mini" aria-hidden="true"><span class="fn">I kassan</span><b class="num">'+kr(E.kassa)+'</b><div class="thin'+(over?' bad':'')+'"><i style="width:'+pct+'%"></i></div><span class="fn'+(over?' bad':'')+'">'+(over?'Över '+kr(E.kassa-B):'Kvar '+kr(B-E.kassa))+'</span></div></div>';
 // Två val som styr förslaget, med en mening under som säger vad det valda betyder
 const PRIO_TXT={billigt:'Billigare rätter och fler rester, så samma middag kommer oftare två kvällar i rad.',balans:'En blandning: rester när det sparar pengar, annars olika rätter.',omvaxlande:'Fler olika rätter och färre rester. Kostar mer.'};
 const SK_TXT={two:'Två storkok med 5 portioner var: ett med kött till '+kottPerson()+' och ett vegetariskt till '+vegPerson()+'.',gem:'Ett storkok med 10 portioner som ni delar. Samma grund, men '+kottPerson()+' får kött och '+vegPerson()+' vegetariskt protein. Oftast billigast.',auto:'Appen väljer det som ger bäst vecka inom budgeten. Just nu: '+(pl.mode==='gem'?'samma för båda.':'en var.')};
 h+=sh('Vad är viktigast den här veckan?')+'<div class="seg-wrap">'+segc('Vad är viktigast den här veckan?','autoPrio',[['billigt','Spara pengar'],['balans','Lagom'],['omvaxlande','Variation']],P.prio)+'</div><div class="foot au-ft">'+esc(PRIO_TXT[P.prio]||PRIO_TXT.balans)+'</div>';
 h+=sh('Lunchlådor (storkok)')+'<div class="seg-wrap">'+segc('Lunchlådor (storkok)','autoSk',[['two','En var'],['gem','Samma för båda'],['auto','Appen väljer']],P.skMode)+'</div><div class="foot au-ft">'+esc(SK_TXT[P.skMode]||SK_TXT.auto)+'</div>';
 h+='<div class="au-gor"><button class="btn-tint" data-act="autoGor">'+I.swap+'Gör om veckan</button><div class="foot">Byter alla rätter som inte är låsta. Håll in en rätt för att låsa den, och svep eller tryck på '+I.swap.replace('<svg','<svg class="ic-inl"')+' för nästa rätt.</div></div>';
 // Middagarna är inte bundna till en dag: vardagsrätterna lagas vilken kväll som helst måndag–torsdag, helgen är fredag–söndag.
 // Lunchlådorna lagas i helgen till nästa vecka
 const kvallar=n=>n+(n===1?' kväll':' kvällar');
 const period=(namn,sub,d0,d1)=>{let mack=[],rows='',n=0;for(let d=d0;d<=d1;d++){const x=pl.dag[d];if(x.t==='ratt'){n+=x.n>2?2:1;rows+=autoCard(C,{key:'d'+d,id:x.id,n:x.n},x.n>2?'Räcker 2 kvällar':'1 kväll')}else if(x.t==='macka')mack.push(d)}
  if(mack.length)rows+='<div class="cell au-rest"><span class="grow">🥪 Macka '+kvallar(mack.length)+' · '+kr(C.X.MK*mack.length)+'</span><button class="pt-btn" data-act="autoNasta" data-id="d'+mack[0]+'">Välj rätt</button></div>';
  return sh(namn,sub+' · '+kvallar(d1-d0+1))+group(rows)};
 h+=period('Vardagar','Mån–tor, valfri kväll',0,3);
 h+=period('Helg','Fre–sön',4,6);
 h+=sh(pl.mode==='gem'?'Lunchlådor, samma för båda':'Lunchlådor, en var','Görs i helgen till nästa vecka')+group(pl.st.map(x=>autoCard(C,x,x.n+' portioner')).join(''));
 const rad=E.korg.rad.filter(x=>x.n>0).sort((a,c)=>c.kr-a.kr);
 if(rad.length)h+=sh('Att köpa',kr(E.korg.kr))+group(rad.map(x=>'<div class="cell"><div class="grow"><div class="title">'+esc(planVaraNamn(x))+'</div><div class="meta">'+esc(MV.forp(x))+'</div></div><span class="val">'+kr(x.kr)+'</span></div>').join(''));
 h+='<div class="pl-send"><button class="btn-fill" data-act="autoSend">Skicka till veckosedeln</button><div class="foot">Rätterna, resterna och mackorna läggs på veckosedeln och varorna i inköpslistan. Priserna är ungefärliga.</div></div>';
 return h}
// Nästa rätt i poängordning med samma funktion, som inte redan finns i veckan och som ryms i budgeten
function autoNasta(key){const P=autoState();PLANP=P;const X=autoCtx(P),pl=P.plan,L=X.rank(key);if(!L.length){PLANP=null;return}
 const d=key[0]==='d'?Number(key.slice(1)):-1,cur=d>=0?(pl.dag[d].t==='ratt'?pl.dag[d].id:null):(pl.st.find(x=>x.key===key)||{}).id;
 const used=new Set(autoItems(pl).map(x=>x.id).filter(id=>id!==cur));let i=L.findIndex(c=>c.id===cur),fallback=null;
 for(let k=1;k<=L.length;k++){const c=L[(i+k+L.length)%L.length];if(used.has(c.id)||c.id===cur)continue;
  const q=autoClone(pl);if(d>=0){const was=q.dag[d];if(was.t==='rest')q.dag[d-1].n=2;q.dag[d]={t:'ratt',id:c.id,n:was.t==='ratt'?was.n:2}}else q.st.find(x=>x.key===key).id=c.id;
  autoNorm(q,P.lock);if(!fallback)fallback=q;if(autoEval(q,X).kassa<=X.tak){fallback=q;break}}
 if(fallback){fallback.vecka=P.vecka;P.plan=fallback;autoSync(P);planSave(P)}PLANP=null;render()}
function autoSend(){const C=autoCalc(),{P}=C,pl=P.plan,vd=d=>addDays(P.vecka,d),sun=addDays(P.vecka,6);PLANP=P;const menu=[],lab={},items=autoItems(pl);
 pl.st.forEach(x=>{const r=recipeById(x.id),pv=x.key==='sg'?protVal('sg',r):null;lab[x.key]=x.key==='sg'?'Storkok':'Storkok '+(x.key==='sv'?'veg':'kött');
  menu.push({date:sun,who:x.key==='sk'?'Henrik':x.key==='sv'?'Vegetariskt':'Gemensam',title:r.title,recipe:r.id,addon:pv?protKort(pv):'',note:'Lagas i helgen, lunch nästa vecka'+(x.key==='sg'?' ('+x.n+' portioner)':'')})});
 pl.dag.forEach((x,d)=>{const date=vd(d);
  if(x.t==='ratt'){const r=recipeById(x.id),pv=protVal('d'+d,r);lab['d'+d]=planEtikett(PORTDAG[d],date);menu.push({date,who:'Gemensam',title:r.title,recipe:r.id,addon:pv?protKort(pv):'',note:x.n>2?'Lagas 4 portioner':''})}
  else if(x.t==='rest'){const r=recipeById(pl.dag[d-1].id);menu.push({date,who:'Gemensam',title:'Rester: '+r.title,recipe:'',addon:'',note:'Lagas '+portDag(d-1)})}
  else menu.push({date,who:'Gemensam',title:'Macka',recipe:'',addon:'',note:''})});
 menu.sort((a,b)=>a.date.localeCompare(b.date));
 const vem={};items.forEach(x=>{if(x.key==='sk'||x.key==='sv')return;const pv=protVal(x.key,recipeById(x.id));if(!pv)return;[[pv.k,kottPerson()],[pv.v,vegPerson()]].forEach(([id,n])=>{const k=MV.vara(protById(id).vara).k;(vem[k]||(vem[k]=new Set)).add(n)})});
 const shop=C.E.korg.rad.filter(x=>x.n>0).map(x=>({name:planVaraNamn(x)+(vem[x.k]?' – '+[...vem[x.k]].join(' och '):''),qty:MV.forp(x),price:shopPris(x),meals:items.filter(i=>C.X.behov(i)[x.k]).map(i=>lab[i.key])}));
 PLANP=null;
 const inSheet=new Set(D().recipes.map(r=>r.id)),recipes=items.map(x=>recipeById(x.id)).filter(r=>!inSheet.has(r.id)).map(bankSnap);
 const m=parse(P.vecka),s2=parse(sun);
 const settingsOut={vecka_start:P.vecka,vecka_slut:sun,vecka_rubrik:'Vecka '+isoWeek(m)+' · '+DAYS3[m.getDay()].toLowerCase()+' '+m.getDate()+' – '+DAYS3[s2.getDay()].toLowerCase()+' '+s2.getDate()+' '+MON[s2.getMonth()],
  storkok:pl.st.map(x=>x.id).join(', '),storkok_not:'Lagas i helgen. Räcker till lunch måndag–fredag veckan efter.'};
 const used=new Set(items.map(x=>x.id));
 apiPost({action:'planSend',start:P.vecka,end:sun,menu,shop,recipes,lager:lagerUt(P.vecka,C.E.korg.rest),settings:settingsOut});
 if(wishes().some(w=>used.has(w.id)))updJSON('onskelista',[],a=>a.filter(w=>!used.has(w.id)));
 S.plan=false;S.matTab='vecka';lsSet('matTab','vecka');window.scrollTo(0,0);render();toast('Veckan skickas till veckosedeln och inköpslistan')}
/* Recept: inspiration från nätet att spara i receptbanken */
function matRecipes(){
 const all=inspoList(),f=S.inspoFilter||'alla';let h=fchips('inspoFilter',RFILT,f);
 if(!INSPO.list)return h+'<div style="height:16px"></div>'+group(emptyCell(INSPO.busy?'Hämtar recept…':'Recepten kunde inte hämtas. Försök igen när du har nät.'));
 const list=all.filter(r=>rfOk(f,r,new Set()));
 h+='<p class="inspo-intro">'+all.filter(r=>!isDessert(r)).length+' recept att inspireras av. '+I.heartOn.replace('<svg','<svg class="ic fav"')+' gör ett recept till favorit och '+I.bookmarkOn.replace('<svg','<svg class="ic"')+' sparar det i receptbanken, så kan veckoplaneringen välja det.</p>';
 return h+(list.length?'<div class="bank mini">'+list.map(r=>rCard(r)).join('')+'</div>':group(emptyCell('Inga recept matchar filtret.')))}

// Inköpslistan visas som en flik i Mat; ger rubrikens undertext, verktyg och innehåll
function inkopParts(){
 const d=D(),all=d.shop,f=S.shopFilter,st=settings();
 // Filtret visar butikens avdelningar som finns på listan, så man kan handla en avdelning i taget
 const kats=CATS.filter(c=>all.some(i=>shopKat(i)===c)),f2=f==='offer'&&all.some(i=>i.offer)||kats.includes(f)?f:'alla';
 const groups=[['alla','Alla']].concat(all.some(i=>i.offer)?[['offer','Erbjudanden']]:[],kats.map(c=>[c,c+' '+all.filter(i=>shopKat(i)===c&&!i.done).length]));
 const match=i=>f2==='alla'?true:f2==='offer'?!!i.offer:shopKat(i)===f2;
 const items=all.filter(match),left=all.filter(i=>!i.done),bought=all.filter(i=>i.done);
 // Hela listan och Kvar att betala gäller allt på listan. Per portion och budget gäller veckans mat, samma siffror som på veckosedeln
 const total=shopCost(all),port=veckaPortioner(),mealCost=veckaKostnad(),B=Number(st.matbudget)||0;
 let sub=left.length+' kvar · ca '+kr(shopCost(left)),tools='<button class="ib plus" data-act="shopAdd" aria-label="Ny vara">'+I.plus+'</button>',h='';
 const vs=st.vecka_start,wk=isDate(vs)?'Vecka '+isoWeek(parse(vs)):'veckan';
 if(NY){sub='';
  h+='<div class="wsum"><div class="wsum-n"><b class="num">'+left.length+'</b><span>'+(left.length===1?'vara kvar':'varor kvar')+' · ca '+kr(shopCost(left))+'</span></div>'+
   (B?'<div class="wsum-m">Veckans mat '+kr(mealCost)+' av '+kr(B)+(mealCost>B?' · '+kr(mealCost-B)+' över':' · '+kr(B-mealCost)+' kvar')+'</div><div class="thin '+(mealCost>B?'bad':mealCost>B*.9?'warn':'')+'"><i style="width:'+Math.min(100,Math.round(mealCost/B*100))+'%"></i></div>':'')+'</div>'+
   '<form class="add-row" data-form="shopQuick"><input class="field" name="name" placeholder="Lägg till vara" aria-label="Lägg till vara" autocomplete="off" enterkeyhint="done"><button type="button" class="add-go" data-act="quickGo" data-alt="shopAdd" aria-label="Lägg till">'+I.plus+'</button></form>'}
 else{h+='<div class="stats'+(B?' s4':'')+'"><div class="stat"><span class="fn">Hela listan</span><b>'+nv('s-total',total,'kr')+'</b></div><div class="stat"><span class="fn">Kvar att betala</span><b>'+nv('s-left',shopCost(left),'kr')+'</b></div><div class="stat"><span class="fn">Mat per portion</span><b>'+(port?kr(mealCost/port):'–')+'</b><span class="fn">'+port+' portioner</span></div>'+
  (B?'<div class="stat"><span class="fn">Matbudget '+kr(B)+'</span><b>'+(mealCost>B?'+'+kr(mealCost-B):kr(B-mealCost)+' kvar')+'</b><div class="thin '+(mealCost>B?'bad':mealCost>B*.9?'warn':'')+'"><i style="width:'+Math.min(100,Math.round(mealCost/B*100))+'%"></i></div></div>':'')+'</div>'}
 // Två knappar under siffrorna: hämta veckans varor och töm listan. Frågan visas i samma kort innan något händer
 // Håll in knappen för att bekräfta: en fyllning går över knappen och åtgärden körs när den är full
 h+='<div class="sh-tools"><button type="button" class="sh-btn" data-hold="shopImportYes" aria-label="Håll in för att uppdatera varorna för '+esc(wk.toLowerCase())+'"><i class="sh-fill"></i><span class="sh-ic">'+I.imp+'</span><b>Uppdatera varor</b></button>'
  +'<button type="button" class="sh-btn red" data-hold="shopEmptyYes"'+(all.length?'':' disabled')+' aria-label="Håll in för att tömma listan"><i class="sh-fill"></i><span class="sh-ic">'+I.trash+'</span><b>Töm listan</b></button></div>';
 h+='<div class="fchips" role="group" aria-label="Filter">'+groups.map(([k,l])=>'<button data-act="shopFilter" data-id="'+esc(k)+'" aria-pressed="'+(f2===k)+'">'+l+'</button>').join('')+'</div>';
 h+='<div class="split"><div class="col">';
 if(!all.length)h+='<div style="height:22px"></div>'+group(emptyCell('Listan är tom. Tryck på Uppdatera varor för veckans rätter, eller lägg till egna varor med plus.'));
 const delar=CATS.map(c=>{const g=items.filter(i=>shopKat(i)===c).sort((a,b)=>(a.done-b.done)||(a.order||0)-(b.order||0));return g.length?gh(c,kr(shopCost(g)))+g.map(shopRow).join(''):''}).join('');
 if(delar)h+='<div class="g-one">'+group(delar)+'</div>';
 if(bought.length)h+='<div class="pills" style="padding:12px 16px 0 24px">'+(S.confirm==='clearShop'?'<span class="sub">Ta bort '+bought.length+' avbockade?</span><button class="tb red strong" data-act="clearShopYes">Ja, ta bort</button><button class="tb" data-act="confirmNo">Avbryt</button>':'<button class="tb red" data-act="clearShop">Rensa avbockade ('+bought.length+')</button>')+'</div>';
 h+='</div><div class="col">';

 const offers=all.filter(i=>i.offer);
 if(offers.length)h+=sh('Erbjudanden på listan')+group(offers.map(i=>'<div class="cell"><div class="grow"><div class="title">'+esc(i.name)+'</div><div class="meta">'+esc(i.offer)+'</div></div></div>').join(''))+'<div class="foot">Priserna är uppskattade. Kolla hyllkanten i butiken.</div>';
 return{sub,tools,body:h+'</div></div>'}}
/* Hämta från veckosedeln: räknar fram varorna till veckans rätter (middagar 2 eller 4 portioner, storkok 5 eller 10)
   och skickar veckan på nytt med planSend, som byter ut förra planens varor och låter egna varor ligga kvar */
// Avdelning i butiken räknas fram i appen från varans namn, utan att fråga kalkylarket.
// Ordningen spelar roll: "krossade tomater" är torrvara, "kokosmjölk" och "jordnötssmör" är inte mejeri. Okänt hamnar i Övrigt
const KAT=[['Frys',/fryst|frysta|frysen|glass\b|edamame/],
 ['Torrvaror',/torkade|gula ärtor|pasta|spaghetti|spagetti|makaron|penne|fusilli|lasagneplattor|nudlar|(^|\s)ris\b|jasminris|basmatiris|fullkornsris|risotto|bulgur|matvete|couscous|quinoa|linser|bönor|kikärt|mjöl(?!k)|havre|gryn|flingor|müsli|nötter|mandel|cashew|valnöt|jordnöt|hasselnöt|frön|sesam|olja|buljong|fond\b|krossade|passerade|tomatpuré|konserv|burk|socker|honung|sirap|kryddor|spiskummin|gurkmeja|kanel|paprikapulver|chiliflakes|curry|garam|oregano|timjan torkad|soja|vinäger|kokosmjölk|kokos|tahini|pesto|ketchup|senap|majonnäs|sambal|sriracha|sås\b|salt\b|peppar\b|bakpulver|jäst|kakao|russin|dadlar|tonfisk|sylt|stärkelse|maizena|digestive|kex\b|kardemumma|vanilj/],
 ['Kött & fisk',/kyckling|fläsk|nötkött|nötfärs|färs(?!k)|korv|bacon|lax|torsk|sej\b|fisk|räk|kalkon|lamm|skinka|sidfläsk|lägg\b|biff|entrecote|karré|kotlett|köttbull|makrill|sill\b|salami|chorizo|kassler|högrev|grytbitar|gris|filé|kött/],
 ['Mejeri & ägg',/mjölk|grädde|gräddfil|crème|creme|fraiche|kvarg|yoghurt|(^|[^r])ost(ar)?\b|smör|ägg|keso|kesella|cottage|feta|halloumi|mozzarella|parmesan|ricotta|mascarpone|havredryck|ostdryck|filmjölk|(^|\s)fil(\s|$)|tzatziki/],
 ['Bröd',/bröd|tortilla|pita|bulle|bullar|knäcke|baguette|fralla|frallor|wraps|naan|tunnbröd|ciabatta|limpa/],
 ['Frukt & grönt',/lök|vitlök|morot|morötter|potatis|tomat|gurka|paprika|sallad|sallat|isberg|rucola|ruccola|spenat|kål|broccoli|blomkål|zucchini|squash|aubergine|svamp|champinjon|citron|lime|äpple|päron|banan|apelsin|clementin|mandarin|mango|kiwi|melon|vindruv|druvor|plommon|bär\b|blåbär|hallon|jordgubb|ingefära|persilja|koriander|dill|basilika|mynta|gräslök|timjan|rosmarin|örter|purjo|selleri|rödbet|rotfrukt|kålrot|palsternacka|sötpotatis|rädis|fänkål|sparris|avokado|pumpa|majs|chili|böngroddar|sockerärt|haricots|edamame|groddar/]];
function katGissa(n){n=String(n||'').toLowerCase();const k=KAT.find(([,re])=>re.test(n));return k?k[0]:'Övrigt'}
// Egna varor behåller avdelningen man valde själv; allt annat räknas fram från namnet
function shopKat(i){return i.source==='egen'&&CATS.includes(i.cat)&&i.cat!=='Övrigt'?i.cat:katGissa(i.name)}
function shopImport(tyst,o){o=o||{};
 // planSend byter ändå ut alla varor från planer, så de behöver inte raderas en och en först (det tog lång tid).
 // Bara egna varor som väntar på att tas bort skickas, och redan köade raderingar av planvaror stryks ur utkorgen
 delCommit(x=>x.source==='egen');
 for(let i=OUTBOX.length-1;i>=(flushing?1:0);i--)if(OUTBOX[i].action==='shopDelete'&&/^plan/.test(String(OUTBOX[i].id||''))||OUTBOX[i].action==='planSend')OUTBOX.splice(i,1);
 S.pending=OUTBOX.length;saveOutbox();const st=settings(),vs=st.vecka_start,ve=st.vecka_slut;if(!isDate(vs)||!isDate(ve)){toast('Veckosedeln har ingen vecka än.');return}
 // Är den sparade veckan slut visar veckosedeln nästa vecka, och då ska inte förra veckans varor hämtas
 if(weekTarget().ny){toast('Vecka '+isoWeek(parse(weekTarget().vs))+' har inga rätter än. Lägg till rätter på veckosedeln först.');return}
 // Bara låsta rätter ger varor på inköpslistan. Listan räknas om från dem, så en borttagen eller upplåst rätt tar bara bort sin egen del av en vara
 const rows=D().menu.filter(m=>isDate(m.date)&&m.date>=vs&&m.date<=ve),lab={},list=[],L=weekLocks(vs);
 rows.forEach(m=>{const r=m.recipe&&recipeById(m.recipe);if(!r||m.who==='Borta'||!L.has(r.id))return;const sk=isStorkok(r),n=dishPort(m,r);
  const pa=protFromAddon(m.addon),rr=pa?protRecipe(r,{r:r.id,k:pa.k,v:pa.v}):r;
  const key='m'+list.length;const dw=parse(m.date).getDay();lab[key]=sk?(m.who==='Vegetariskt'?'Storkok veg':m.who==='Henrik'?'Storkok kött':'Storkok'):dw>=1&&dw<=4?'Vardag':'Helg';list.push({key,b:MV.behov(rr,n/(Number(r.portions)||2))})});
 // Efterrätten tas med (bara när den är låst) som receptets egna rader, utan pris, eftersom bakvaror som färskost och digestivekex inte finns bland basvarorna
 const dr=weekDessert(),dv=dr&&L.has(dr.id)?dessertVaror(dr,1,D().shop.filter(i=>i.source==='egen')).map(x=>({name:x.name,qty:x.qty,price:null,meals:['Efterrätt']})):[];
 const korg=MV.korg(list.map(x=>x.b),planLager(vs));
 const shop=korg.rad.filter(x=>x.n>0).map(x=>({name:planVaraNamn(x),qty:MV.forp(x),price:shopPris(x),meals:[...new Set(list.filter(i=>i.b[x.k]).map(i=>lab[i.key]))]})).concat(dv);
 // Varorna visas direkt i telefonen och sparas i kalkylarket i bakgrunden via utkorgen, som när man bockar av
 // Egna varor (inskrivna för hand) rörs aldrig, inte heller de avbockade
 const tag='plan'+vs.replace(/-/g,''),egna=D().shop.filter(i=>i.source==='egen');
 // Det som redan är köpt (samma vara och mängd) står kvar avbockat, och bara varor som saknas läggs till
 const nyck=x=>String(x.name||'').toLowerCase()+'|'+String(x.qty||'').toLowerCase(),fore=new Set(D().shop.map(nyck)),kopt=new Set(D().shop.filter(i=>i.done&&i.source!=='egen').map(nyck));
 const nya=shop.filter(x=>!fore.has(nyck(x))).length,nu=new Set(shop.map(nyck)),borta=D().shop.filter(i=>i.source!=='egen'&&!nu.has(nyck(i))).length;
 S.data.shop=egna.concat(shop.map((x,n)=>({id:tag+'-'+n,name:x.name,qty:x.qty,price:x.price,meals:x.meals,cat:katGissa(x.name),done:kopt.has(nyck(x)),source:'veckoplan'})));
 if(!tyst)S.shopFilter='alla';render();toast(o.msg||(tyst?'Inköpslistan uppdaterad':!list.length&&!dv.length?'Inga låsta rätter. Lås rätterna du vill handla till.':nya||borta?[nya?nya+' tillagda':'',borta?borta+' borttagna':''].filter(Boolean).join(', '):'Inköpslistan stämmer med veckosedeln'));
 // Recept från inspirationen eller receptbanken som saknas i kalkylarkets flik Recept skickas med
 const inSheet=new Set(D().recipes.map(r=>r.id)),recipes=o.force?[...new Set(rows.map(m=>m.recipe).filter(Boolean))].map(recipeById).filter(r=>r&&!inSheet.has(r.id)&&!isDessert(r)).slice(0,12).map(bankSnap):[];
 apiPost({action:'planSend',start:vs,end:ve,menu:rows.map(m=>({date:m.date,who:m.who,title:m.title,recipe:m.recipe||'',addon:m.addon||'',note:m.note||''})),shop,recipes,lager:lagerUt(vs,korg.rest),settings:o.settings||{}});
 // Kalkylarket skriver om alla veckans varor som inte köpta, så de köpta bockas av igen
 S.data.shop.forEach(i=>{if(i.done&&i.source==='veckoplan')apiPost({action:'shopToggle',id:i.id,done:true})});
 // Kalkylarket tar bort avbockade egna varor när veckans varor skickas, så de läggs tillbaka avbockade
 egna.filter(i=>i.done).forEach((i,n)=>{i.id='tmp'+Date.now()+'-k'+n;apiPost({action:'shopAdd',name:i.name,qty:i.qty||'',cat:i.cat||'Övrigt',price:i.price==null?'':i.price});apiPost({action:'shopToggle',id:i.id,done:true})})}
function shopRow(i){return'<div class="dr-wrap"><button class="dr-act del" data-act="shopDel" data-full="shopDel" data-id="'+esc(i.id)+'" aria-label="Ta bort '+esc(i.name)+'">'+I.trash+'<span>Ta bort</span></button>'+shopRowIn(i).replace('<div class="cell ck','<div class="cell dr-slide ck')+'</div>'}
function shopRowIn(i){const chips=(i.offer?'<span class="chip offer">'+esc(i.store||'Erbjudande')+'</span>':'')+(i.meals||[]).map(m=>'<span class="chip">'+esc(m)+'</span>').join('')+(i.source==='egen'&&i.addedBy?'<span class="chip">'+esc(i.addedBy)+'</span>':'');
 return'<div class="cell ck'+(i.done?' done':'')+'"><input type="checkbox" class="check" data-act="shopToggle" data-id="'+esc(i.id)+'" aria-label="'+esc(i.name)+'"'+(i.done?' checked':'')+'><button class="grow rowbtn" data-act="shopToggle" data-id="'+esc(i.id)+'"><div class="title">'+esc(i.name)+'</div>'+((i.qty||chips)?'<div class="meta">'+(i.qty?'<span>'+esc(i.qty)+'</span>':'')+chips+'</div>':'')+'</button>'+(i.price?'<span class="val">'+kr(i.price)+'</span>':'<span class="val nopris">prisuppgift saknas</span>')+'</div>'}

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
 const pv=protNu(r),rr=pv?protRecipe(r,pv):r,ST=kvSteps(r,pv),act=Math.min(S.step[r.id]||0,ST.length-1),actHits=stepIngredients(rr,{t:stegText(ST[act])});
 NB.title=r.title;NB.back=true;
 let h='<div class="rcp-top"><button class="back" data-act="recipeBack">'+I.back+'Mat</button>';
 h+=rcpPhoto(r);
 h+='<div class="chips-row">'+(isDessert(r)?'<span class="chip e">Efterrätt</span>':whoChip(effWho(r)))+(r.freezes?'<span class="chip v">Går att frysa</span>':'')+'</div><h1 class="t1" id="lt">'+esc(r.title)+'</h1>'+rcpActions(r)+'</div>';
 const cookBtn='<div class="block"><button class="btn-fill" style="width:100%" data-act="cook" data-id="'+esc(r.id)+'">'+I.play+'Börja laga</button></div>';
 if(NY)h+=cookBtn;
 const facts=[['Tid','<span class="num">'+r.min+'</span> min']];if(r.kr)facts.push(['Per portion',kr(r.kr)]);if(r.protein){const pr=String(r.protein).replace(/\s*\/\s*port(ion)?\.?$/i,''),ph=pr.match(/^henriks?\s+(?:del\s+)?(?:ca\s+)?(.+)$/i);facts.push(['Protein',esc(ph?ph[1]:pr)])}
 const kc=kcalOf(r.id);if(kc)facts.push(['Kalorier','<span class="num">'+kc.n+'</span> kcal']);
 h+='<div class="group" style="margin-top:16px"><div class="rcp-facts'+(facts.length>3?' f4':'')+'" style="grid-template-columns:repeat('+facts.length+',minmax(0,1fr))">'+facts.map(([l,v])=>'<div><div class="fn">'+l+'</div><div class="v">'+v+'</div></div>').join('')+'</div></div>';
 if(r.why)h+='<div class="group" style="margin-top:12px"><div class="note">'+esc(r.why)+'</div></div>';
 const praw=protRaw(r);if(praw){const on=!protOff(r.id),orig=protById(praw.id),mm=D().menu.find(m=>m.recipe===r.id&&protFromAddon(m.addon)),pa=mm&&protFromAddon(mm.addon);
  h+=sh('Valfritt protein')+group(on&&pa?[[pa.kn,pa.k,'p1'],[pa.vn,pa.v,'p2']].map(([n,id,c])=>{const x=protById(id);return'<div class="cell pt-row"><span class="pt-ri" aria-hidden="true">'+x.ic+'</span><div class="grow"><div class="title"><span class="chip '+c+'">'+esc(n)+'</span> '+esc(x.namn)+'</div><div class="meta">'+esc(x.g+' g per portion. '+x.tips)+'</div></div></div>'}).join('')
   :'<div class="cell"><div class="grow"><div class="meta" style="color:var(--ink)">'+(on?'Receptet har '+esc(orig.namn.toLowerCase())+'. När veckan planeras väljer var och en sitt protein, och resten av rätten lagas en gång.':'Avstängt. Rätten lagas med '+esc(orig.namn.toLowerCase())+' som i receptet.')+'</div></div></div>')+
   '<div class="foot"><button class="linkbtn" data-act="protToggle" data-id="'+esc(r.id)+'">'+(on?'Stäng av för den här rätten':'Slå på valfritt protein')+'</button></div>'}
 if(r.src)h+='<div class="foot"><a href="'+esc(r.src)+'" target="_blank" rel="noopener" style="color:var(--accent)">Inspiration från '+esc(r.srcName||'nätet')+'</a></div>';
 if(!NY)h+=cookBtn;
 h+='<div class="recipe"><div class="col">';
 h+='<div class="sh with-ctl"><span>Ingredienser</span><span class="stepper"><button data-act="scale" data-id="'+esc(r.id)+'" data-d="-1" aria-label="Färre portioner">−</button><span><b>'+p+'</b> port</span><button data-act="scale" data-id="'+esc(r.id)+'" data-d="1" aria-label="Fler portioner">+</button></span></div>';
 h+=ingList(rr,f,actHits)+'<div class="foot">Markerat: det som behövs i steg '+(act+1)+'.</div>';
 h+='</div><div class="col">';
 h+=sh('Gör så här','<span style="text-transform:none">Tryck på ett steg för att markera det</span>');
 h+='<div class="group"><ol class="steps">'+ST.map((s,i)=>{const hs=i===act?actHits:stepIngredients(rr,{t:stegText(s)}),on=i===act;
  const timerBtn=s.timer?'<button class="pill" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+I.clock+s.timer+' min</button>':'';
  return'<li class="'+(on?'active':'')+'" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+i+'"><span class="no">'+(i+1)+'</span><div class="txt">'+(s.t?esc(s.t):'')+(pv?kvLanes(s,pv):'')+
  (on?(hs.length?'<div class="now"><div class="fn">Det här steget</div>'+hs.map(it=>ingRow(it,f)).join('')+'</div>':'')+
    ((timerBtn||i<ST.length-1)?'<div class="pills">'+timerBtn+(i<ST.length-1?'<button class="pill" data-act="pickStep" data-id="'+esc(r.id)+'" data-i="'+(i+1)+'">Nästa steg</button>':'')+'</div>':''):
   (hs.length?'<div class="uses">'+hs.map(it=>'<span>'+esc((qtyText(it,f)+' '+it.n).trim())+'</span>').join('')+'</div>':'')+(timerBtn?'<div class="pills">'+timerBtn+'</div>':''))+'</div></li>'}).join('')+'</ol></div>';
 if(r.tips)h+='<div class="group" style="margin-top:12px"><div class="note">'+esc(r.tips)+'</div></div>';
 h+=rateBlock(r);
 h+='</div></div>';
 return h}
/* Tidigast igen: hur snart en rätt får föreslås igen. Räknas av matpoang.js från baslinjen och stjärnorna.
   Sparas i Inställningar: frekvens = {id:{w,t,d}} där w är baslinjen i veckor som sattes första gången rätten lagades (0 = aldrig),
   I samma post: n = hur många gånger rätten lagats och l = senast. receptlogg = {id:'ÅÅÅÅ-MM-DD'} fylls av söndagsrutinen.
   Allt ligger i rader som appen redan får skriva, så ingen ändring i Kod.gs behövs. */
const MP=window.MatPoang,RP=window.RestPoang;
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
 if(NY)return'<section class="smc ny-smc"><h2 class="smc-q">'+(allT?'Hur var maten ikväll?':'Hur var maten igår?')+'</h2>'+
  L.map(m=>{const r=recipeById(m.recipe),a='data-id="'+esc(m.recipe)+'" data-date="'+esc(m.date)+'"';return'<div class="smc-r"><div class="smc-t"><div class="grow"><div class="title">'+esc(r.title)+'</div><div class="meta"><span>Tryck på en min så sparas den</span></div></div>'+
   SMIL.map(([v,e,n])=>'<button type="button" class="smc-f" data-act="smileyQuick" data-v="'+v+'" '+a+' aria-label="'+esc(r.title)+': '+esc(n)+'">'+e+'</button>').join('')+'</div>'+
   '<button type="button" class="tb smc-skip" data-act="smileySkip" '+a+'>Vi lagade den inte</button></div>'}).join('')+'</section>';
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
// Står receptet på veckan som veckosedeln visar?
const paVeckan=id=>{const W=weekTarget();return!W.ny&&weekRows(W).some(m=>m.recipe===id)};
const veckoKnapp=(r,cls)=>{const pa=paVeckan(r.id);return'<button class="'+cls+(pa?' on':'')+'" data-act="'+(pa?'weekShow':'weekAdd')+'" data-id="'+esc(r.id)+'" aria-pressed="'+pa+'">'}
function rcpActions(r){const l=matLage(r.id),pa=paVeckan(r.id);
 if(isDessert(r)){const pa=weekDessert()===r;return'<div class="rp-row">'+
  '<button class="rp-ib" data-act="dessShop" data-id="'+esc(r.id)+'"><span class="c">'+I.basket+'</span><span class="l">Till inköpslistan</span></button>'+
  '<button class="rp-ib'+(pa?' on':'')+'" data-act="'+(pa?'dessClear':'dessSet')+'" data-id="'+esc(r.id)+'" aria-pressed="'+pa+'"><span class="c">'+(pa?I.tick:I.calPlus)+'</span><span class="l">'+(pa?'På veckosedeln':'Till veckosedeln')+'</span></button>'+
  '<button class="rp-ib" data-act="rcpSheet" data-id="'+esc(r.id)+'" data-k="more"><span class="c">'+I.dots+'</span><span class="l">Mer</span></button></div>'}
 const lbl=l.paus?'Pausad':(l.harBas||l.betyg)?'Tidigast '+String(l.w).replace('.',',')+' v':'Tidigast igen';
 return'<div class="rp-row">'+
  veckoKnapp(r,'rp-ib')+'<span class="c">'+(pa?I.tick:I.calPlus)+'</span><span class="l">'+(pa?'På veckosedeln':'Till veckosedeln')+'</span></button>'+
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
 if(NY)h+='<form class="add-row" data-form="taskQuick"><input class="field" name="title" placeholder="Ny uppgift" aria-label="Ny uppgift" autocomplete="off" enterkeyhint="done"><button type="button" class="add-go" data-act="quickGo" data-alt="taskAdd" aria-label="Lägg till">'+I.plus+'</button></form>';
 h+='<div class="split"><div class="col">';
 const td=g.filter(([,xs])=>xs.length).map(([l,xs])=>gh(l,xs.length,l==='Försenade'?'red':'')+xs.map(taskRow).join('')).join('');if(td)h+='<div class="g-one">'+group(td)+'</div>';
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
// Dagraden: fyra veckor framåt att svepa i på telefonen, en vecka på väggen
function calWidget(){const t=today(),wk=[],N=wallBoardOn()?7:28;for(let i=0;i<N;i++)wk.push(addDays(t,i));
 const sel=wk.includes(S.ovDay)?S.ovDay:t;
 let strip='<div class="wk'+(N>7?' wk-sw':'')+'" role="group" aria-label="Kommande dagar">';
 wk.forEach((k,i)=>{const dt=parse(k),dots=calDots(k);
  strip+='<button class="wk-d'+(i===0?' today':'')+(k===sel?' sel':'')+(i%7===0?' snap':'')+'" data-act="ovDay" data-id="'+k+'" aria-pressed="'+(k===sel)+'" aria-label="'+esc(dateLong(k))+(dots.length?', '+dots.length+' saker':'')+'"><span class="wd'+(i&&dt.getDate()===1?' m':'')+'">'+(i===0?'Idag':dt.getDate()===1?cap(MON[dt.getMonth()].slice(0,3)):cap(DAYS[dt.getDay()].slice(0,3)))+'</span><span class="n num">'+dt.getDate()+'</span><span class="dots">'+dots.map(c=>'<i class="'+c+'"></i>').join('')+'</span></button>'});
 strip+='</div>';
 // under ett streck: dagens att göra-uppgifter med egen rubrik
 const ts=D().tasks.filter(x=>x.due===sel&&!x.done);
 // saknade stående överföringar visas bara för den det gäller och aldrig på väggen
 const ovs=S.wall||wallBoardOn()||!people().includes(S.me)?[]:[['shared',ovOpen('shared')],[S.me,ovOpen(S.me)]].flatMap(([l,a])=>a.map(c=>({l,c})));
 const todo=(ts.length||ovs.length)&&!wallBoardOn()&&!NY?'<div class="wk-todo wk-link" data-act="taskList" role="link" tabindex="0" aria-label="Att göra, öppna Uppgifter"><div class="wk-sub">Att göra</div><div class="evs">'+
  ovs.map(x=>'<div class="ev task ov-task" data-act="ovGo" data-id="'+esc(x.l+'|'+x.c.id)+'" role="link" tabindex="0"><span class="ovs tap saknas" data-act="ovDone" data-id="'+esc(x.c.id)+'" data-list="'+esc(x.l)+'" role="button" tabindex="0" aria-label="Bekräfta att den är inlagd">!</span><span>'+(ovState(x.c)==='andrad'?'Uppdatera':'Lägg in')+' stående överföring: '+esc(x.c.name)+'</span></div>').join('')+
  ts.map(x=>'<div class="ev task"><span>'+esc(x.title)+evWho(x)+'</span></div>').join('')+'</div></div>':'';
 return'<section class="widget w2 calw"><button class="wh" data-act="calOpen" data-id="'+sel+'" style="width:100%">'+I.cal+(NY?'<span>Schema'+(N>7?' <span class="wk-mo">'+esc(MON[parse(t).getMonth()])+'</span>':'')+'</span><span class="r lnk">Kalender</span>':'<span>Kalender</span><span class="r">'+esc(cap(MON[parse(sel).getMonth()]))+'</span>')+'</button>'+strip+
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
 if(meals.length)h+=sh('Mat')+group(meals.map(m=>mealCell(m)).join(''));
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
 // Nya designen: tre knappar i ett segment i stället för reglaget
 if(NY)return sh('Hur mycket ork har ni idag?','<span class="num">'+o.min+' min</span>')+'<div class="ork-seg">'+segc('Dagens ork','orkPick',ORK.map((x,k)=>[String(k),x.name.replace(' ork','')]),String(i))+'</div><div class="foot">Gäller bara idag. I morgon börjar det om på '+tomorrowDefault()+' min.</div>';
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
 h+='<form class="add-row" data-form="cleanQuick" data-room=""><input class="field" name="title" placeholder="Ny syssla" aria-label="Ny syssla" autocomplete="off" enterkeyhint="done"><button type="button" class="add-go" data-act="quickGo" data-alt="cleanFocus" aria-label="Lägg till">'+I.plus+'</button></form>';
 if(!all.length)return h+'<div style="height:22px"></div>'+group(emptyCell('Städschemat är tomt. Lägg till sysslor under rummen nedan.'))+cleanAll(all,true);
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
 h+=cleanAll(all);
 h+=sh('Så fungerar schemat')+'<div class="foot">Varje syssla har ett intervall. Appen väljer de mest försenade sysslorna och fyller dagens pass upp till den tid ni har. Hinner ni inte kommer de först i kön i morgon.</div>';
 return h+'</div></div>'};
// Alla sysslor rum för rum. Under varje rum finns samma lägg till-rad som i Inköp och Uppgifter
function cleanAll(all,open){const mins=t=>[...new Set([5,10,15,20,25,30,45,60,90,120,t.min].filter(Boolean))].sort((a,b)=>a-b);
 return'<details data-k="all"'+(open||S.open.all?' open':'')+'><summary class="sh"><span>Alla sysslor och intervall</span></summary>'+ROOMS.map(room=>{const ts=all.filter(t=>t.room===room).sort((a,b)=>a.freq-b.freq);
  return'<div class="sh sub2">'+esc(room)+'</div>'+(ts.length?group(ts.map(t=>cleanSw(t,'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta">'+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</div><div class="menus">'+
   menuSel('data-change="freq" data-id="'+esc(t.id)+'" aria-label="Intervall"',[1,2,3,4,5,7,14,30,90].map(f=>'<option value="'+f+'"'+(t.freq===f?' selected':'')+'>'+freqText(f)+'</option>').join(''))+
   menuSel('data-change="min" data-id="'+esc(t.id)+'" aria-label="Tid"',mins(t).map(m=>'<option value="'+m+'"'+(t.min===m?' selected':'')+'>'+m+' min</option>').join(''))+
   menuSel('data-change="who" data-id="'+esc(t.id)+'" aria-label="Vem"','<option value="">Vem som helst</option>'+people().map(p=>'<option'+(t.who===p?' selected':'')+'>'+esc(p)+'</option>').join(''))+'</div></div></div>')).join('')):'')+
  '<form class="add-row" data-form="cleanQuick" data-room="'+esc(room)+'"><input class="field" name="title" placeholder="Ny syssla" aria-label="Ny syssla i '+esc(room)+'" autocomplete="off" enterkeyhint="done"><button type="button" class="add-go" data-act="quickGo" data-alt="cleanFocus" aria-label="Lägg till i '+esc(room)+'">'+I.plus+'</button></form>'}).join('')+
  '<div class="foot">Svep åt vänster på en syssla för att ta bort den. Nya sysslor görs varje vecka och tar 10 minuter tills du ändrar det.</div></details>'}
// Raden högst upp i Städ har inget rum, så rummet gissas från orden. Annars blir det Alla rum
function rumGissa(t){t=t.toLowerCase();const R=[['Vardagsrum',/vardagsrum|soffa|(^|\s)tv($|[\s-])|bokhylla|soffbord/],['Kök',/kök|kyl|frys|spis|micro|mikro|ugn|disk|bänk|fläkt|skafferi/],['Toalett',/toa|wc|badrum|dusch|handfat|kakel|spegel|badkar/],['Hundar',/hund|koppel|matskål|tass/],['Sovrum',/sovrum|säng|lakan|täcke|kudd|garderob/],['Hall',/hall|sko|ytterkläder|dörrmatta|entré/]];
 const m=R.find(([,re])=>re.test(t));return m?m[0]:'Alla rum'}
// Svep åt vänster tar bort sysslan, som i Inköp
const cleanSw=(t,html)=>'<div class="dr-wrap cs"><button class="dr-act del" data-act="cleanDel" data-full="cleanDel" data-id="'+esc(t.id)+'" aria-label="Ta bort '+esc(t.title)+'">'+I.trash+'<span>Ta bort</span></button>'+html.replace('<div class="cell','<div class="cell dr-slide')+'</div>';
function cleanRow(t,showWhy,offer){const d=doneToday(t),r=ratio(t);
 const why=t.freq<=1?'':(planned(t)&&!d?'inplanerat':r>=2?'mycket försenat':r>=1?'dags nu':'snart dags');
 return cleanSw(t,'<div class="cell ck'+(d?' done':'')+'"><input type="checkbox" class="check" data-act="cleanToggle" data-id="'+esc(t.id)+'" aria-label="'+esc(t.title)+'"'+(d?' checked':'')+'><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span class="num">'+t.min+' min</span>'+(t.who?personChip(t.who):'')+(showWhy&&why?'<span>'+why+'</span>':'')+(d&&t.doneBy?'<span>klart av '+esc(t.doneBy)+'</span>':'')+(t.tip&&!d?'<span>'+esc(t.tip)+'</span>':'')+'</div></div>'+
 (offer?'<button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Ta idag</button>':(!d&&t.freq>1&&showWhy?'<button class="pill" data-act="snooze" data-id="'+esc(t.id)+'">I morgon</button>':''))+'</div>')}
function bigRow(t){return cleanSw(t,'<div class="cell"><div class="grow"><div class="title">'+esc(t.title)+'</div><div class="meta"><span class="chip">'+esc(t.room)+'</span><span>'+t.min+' min</span><span>'+(t.lastDone?'senast '+esc(dateShort(t.lastDone)):'inte gjort än')+'</span></div></div><div class="pills" style="flex-wrap:nowrap"><button class="pill" data-act="planSat" data-id="'+esc(t.id)+'">Lördag</button><button class="pill" data-act="planToday" data-id="'+esc(t.id)+'">Idag</button></div></div>')}

/* ---------- overlay ---------- */
/* ---------- Välj rätt: samma blad för Lägg till en rätt, Lägg till ett storkok, Byt rätt och Välj efterrätt ----------
   Överst vad man byter eller lägger till, sedan sök, Förslag (bäst för veckan) och Alla rätter, alla med samma rader.
   Man trycker på en rad för att välja den och bekräftar med knappen längst ner */
const utanStorkok=t=>cap(String(t||'').replace(/^storkok:\s*/i,''));
function pickRow(c,o){const r=c.r,on=S.psel===r.id,t=o.sk?utanStorkok(r.title):r.title;
 const l1=o.dess?'':whoChip(effWho(r))+(c.g?'<span class="dr-st">★ '+starNum(matLage(r.id).s)+'</span>':c.ago==null?'<span class="sw-new">Ny</span>':'')+tarVara(c);
 const l2=(o.dess?[r.portions?r.portions+' portioner':'',r.min?r.min+' min':'']:[c.ago==null||c.g?'':c.ago<0?'Planerad':'Senast för '+(c.ago<14?c.ago+' dagar':Math.round(c.ago/7)+' veckor')+' sedan',handla(c),r.min?r.min+' min':'']).filter(Boolean).join(' · ');
 return'<button type="button" class="cell sw-row'+(on?' on':'')+'" data-act="pickSel" data-id="'+esc(r.id)+'" aria-pressed="'+on+'" data-q="'+esc((r.title+' '+(r.who||'')).toLowerCase())+'">'+dishThumb(r,r.title)+
  '<span class="grow"><span class="title">'+esc(t)+'</span>'+(l1?'<span class="meta sw-l1">'+l1+'</span>':'')+(l2?'<span class="meta">'+esc(l2)+'</span>':'')+'</span><span class="sw-ck" aria-hidden="true">'+I.tick+'</span></button>'}
// Knappen längst ner: vad som händer med det valda
function pickBtnTxt(k,id){if(!id)return k==='dess'?'Välj en efterrätt':k==='slot'&&S.slotG==='Storkok'?'Välj ett storkok':'Välj en rätt';
 if(id==='macka')return'Lägg till en macka';const r=recipeById(id),t=r?(isStorkok(r)?utanStorkok(r.title):r.title):'';return(k==='swap'?'Byt till ':'Lägg till ')+t}
function pickSheet(k,enter){
 let title,ctxL,ctxT,ctxR=null,note='',macka=false,top=[],rest=[],rester=null,sk=false,dess=false,alla='Alla rätter';
 if(k==='swap'){const sw=S.swap||{},m=sw.m||{},cur=m.recipe&&recipeById(m.recipe),skKott=isStorkok(cur)&&storkokLage(m.recipe).kott,all=swapCandidates(m),cands=all.filter(c=>!(skKott&&isStorkok(c.r)&&harKott(c.r)));
  sk=isStorkok(cur);top=cands.filter(c=>c.kind>=2).slice(0,3);rest=cands.filter(c=>!top.includes(c));rester=all.rester;
  const many=m.recipe&&D().menu.filter(x=>x.recipe===m.recipe).length>1;
  title=m.recipe?'Byt rätt':'Välj rätt';ctxL=many?'Byter · står på flera dagar och byts överallt':'Byter · '+dateShort(m.date);ctxT=m.title;ctxR=cur;
  if(skKott)note='Ett storkok i veckan har redan kött, så storkok med kött visas inte.'}
 else if(k==='slot'){const g=S.slotG||'Vardag';sk=g==='Storkok';
  let want=null;if(sk){const has=new Set(weekDishes().filter(x=>x.g==='Storkok'&&x.r).map(x=>x.r.who));want=has.has('Henrik')&&!has.has('Vegetariskt')?'Vegetariskt':has.has('Vegetariskt')&&!has.has('Henrik')?'Henrik':null}
  const all=swapCandidates({who:'Gemensam',title:sk?'Storkok':''},{slot:1,sk,want,g}),kott=sk&&storkokLage().kott,cands=all.filter(c=>isStorkok(c.r)===sk&&(c.r.groups||[]).length&&!(kott&&harKott(c.r)));
  top=cands.slice(0,3);rest=cands.slice(3);rester=all.rester;macka=!sk;
  title=sk?'Lägg till ett storkok':'Lägg till en rätt';ctxL='Lägger till';ctxT=sk?'Lunchlådor · görs i helgen till nästa vecka':g==='Vardag'?'Vardagar · mån–tor, valfri kväll':'Helg · fre–sön';alla=sk?'Alla storkok':alla;
  if(kott)note='Ett storkok i veckan har redan kött, så bara storkok utan kött visas.'}
 else{dess=true;const seen=new Set(),all=allRecipes().concat(inspoList()).filter(r=>{if(!isDessert(r)||seen.has(r.id))return false;seen.add(r.id);return true})
   .sort((a,b)=>(inBank(b.id)?1:0)-(inBank(a.id)?1:0)||(isFav(b.id)?1:0)-(isFav(a.id)?1:0)||((ratingOf(b.id)||{avg:0}).avg-(ratingOf(a.id)||{avg:0}).avg)||a.title.localeCompare(b.title,'sv')).map(r=>({r,g:ratingOf(r.id)}));
  top=all.filter(c=>inBank(c.r.id)).slice(0,3);rest=all.filter(c=>!top.includes(c));
  title='Lägg till en efterrätt';ctxL='Lägger till';ctxT='Efterrätt · räknas inte in i portionerna';alla='Alla efterrätter'}
 const o={sk,dess},n=top.length+rest.length,ctxIc=ctxR?dishThumb(ctxR,ctxT):'<span class="dr-th" aria-hidden="true"><span>'+(dess?'🍰':sk?'🥘':'🍽️')+'</span></span>';
 let body='<div class="sw-now">'+ctxIc+'<div class="grow"><div class="fn">'+esc(ctxL)+'</div><div class="title">'+esc(ctxT)+'</div></div></div>';
 if(n>6)body+='<div class="sw-search pk-search"><input type="search" id="sw-q" placeholder="Sök bland '+n+' '+(dess?'efterrätter':sk?'storkok':'rätter')+'" aria-label="Sök" autocomplete="off" enterkeyhint="search"></div>';
 if(macka){const on=S.psel==='macka';body+=group('<button type="button" class="cell sw-row'+(on?' on':'')+'" data-act="pickSel" data-id="macka" aria-pressed="'+on+'" data-q="macka smörgås"><span class="dr-th" aria-hidden="true"><span>🥪</span></span><span class="grow"><span class="title">Macka</span><span class="meta">'+esc(kr(MP.CFG.mackaKr))+' för två</span></span><span class="sw-ck" aria-hidden="true">'+I.tick+'</span></button>')}
 if(note)body+='<div class="foot sw-rest">'+esc(note)+'</div>';
 body+=resterRad(rester);
 if(top.length)body+=sh(dess?'Sparade':'Förslag',dess?'':'<span class="fn">Bäst för veckan först</span>')+group(top.map(c=>pickRow(c,o)).join(''));
 if(rest.length)body+=sh(alla)+group(rest.map(c=>pickRow(c,o)).join(''));
 if(!n&&!macka)body+=group(emptyCell(dess?'Inga efterrätter än.':'Inga rätter passar.'));
 body+='<div class="foot sw-none" hidden>Inget matchar sökningen.</div>';
 if(k==='swap')body+='<div class="foot pk-info">Inköpslistan räknas om efter bytet. Svep åt höger på rätten för att ta bort den utan att välja en ny.</div>';
 if(dess)body+='<div class="foot pk-info">Lås efterrätten på veckosedeln för att få med varorna när du uppdaterar inköpslistan.</div>';
 body+='<div class="sw-foot"><button type="button" class="btn-fill" data-act="pickGo"'+(S.psel?'':' disabled')+'>'+esc(pickBtnTxt(k,S.psel))+'</button></div>';
 return sheetHtml(k,title,'<span class="tb" aria-hidden="true"></span>',body,enter)}
function sheetHtml(form,title,right,body,enter,left){return'<div class="sheet'+enter+'" data-act="sheetBg"><form class="sheet-panel" data-form="'+form+'" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="grabber" aria-hidden="true"></div><div class="sheet-head">'+(left||'<button type="button" class="tb" data-act="sheetClose">Avbryt</button>')+'<h2>'+title+'</h2>'+right+'</div><div class="sheet-body">'+body+'</div></form></div>'}
const fieldCell=(label,input)=>'<label class="cell"><span class="grow">'+label+'</span>'+input+'</label>';
function renderOverlay(){
 const o=document.getElementById('overlay');
 const k=S.cook?'cook':S.sheet==='settings'?'settings':S.sheet==='farg'?'farg':S.sheet==='vagg'?'vagg':S.sheet==='rate'?'rate':S.sheet==='income'?'income':S.sheet==='cost'?'cost':S.sheet==='ov'?'ov':S.sheet==='prefs'?'prefs':S.sheet==='swap'?'swap':S.sheet==='prot'?'prot':S.sheet==='wish'?'wish':S.sheet==='shopMore'?'shopMore':S.sheet==='dess'?'dess':S.sheet==='slot'?'slot':S.sheet==='delLas'?'delLas':S.rcpSheet?'rcpSheet':S.sheet==='taskEdit'?'taskEdit':S.sheet==='evEdit'?'evEdit':S.shopAdd?'shop':S.taskAdd?'task':'';
 const prev=o.dataset.k||'';
 // Rita inte om ett öppet blad medan någon skriver i det
 if(k&&k!=='cook'&&k===prev&&busyTyping()&&o.contains(document.activeElement))return;
 o.dataset.k=k;const enter=k!==prev?' enter':'';
 if(S.cook){const r=recipeById(S.cook.id);if(!r){S.cook=null;o.dataset.k='';o.innerHTML='';return}
  const pv=protNu(r),rr=pv?protRecipe(r,pv):r,ST=kvSteps(r,pv),i=Math.min(S.cook.step,ST.length-1),n=ST.length,s=ST[i],{f}=scaled(r),hits=stepIngredients(rr,{t:stegText(s)});
  const dir=A.cookStep==null||A.cookStep===i?'':i>A.cookStep?' from-r':' from-l',grew=A.cookStep!=null&&i>A.cookStep;A.cookStep=i;
  const now=hits.length?sh('Det här steget')+group(hits.map(it=>ingRow(it,f)).join('')):'';
  o.innerHTML='<div class="cook" role="dialog" aria-modal="true" aria-label="Matlagningsläge"><div class="cook-top"><span></span><div class="fn">Steg '+(i+1)+' av '+n+'</div><button class="tb strong" data-act="cookClose">Klar</button></div><div class="cook-name">'+esc(r.title)+'</div>'+
  '<div class="progress" aria-hidden="true">'+ST.map((_,k)=>'<i class="'+(k<=i?'on':'')+(grew&&k===i?' just':'')+'"></i>').join('')+'</div>'+
  '<div class="cook-body'+dir+'"><div class="col">'+(s.t?'<p class="cook-text">'+esc(s.t)+'</p>':'')+(pv?kvLanes(s,pv):'')+(s.timer?'<div class="block"><button class="pill" data-act="timer" data-min="'+s.timer+'" data-label="Steg '+(i+1)+'">'+I.clock+'Starta '+s.timer+' min</button></div>':'')+now+'</div><div class="col">'+sh('Alla ingredienser')+ingList(rr,f,hits)+'</div></div>'+
  '<div class="cook-nav"><button class="btn-tint" data-act="cookStep" data-d="-1"'+(i===0?' disabled':'')+'>Förra</button>'+(i<n-1?'<button class="btn-fill" data-act="cookStep" data-d="1">Nästa</button>':'<button class="btn-fill" data-act="cookDone" data-id="'+esc(r.id)+'">Klar – betygsätt</button>')+'</div></div>';
  return}
 if(k==='settings'){const st=settings(),topic=D().ntfyTopic||'';
  const meRow=(id,l)=>'<button type="button" class="cell link" data-act="me" data-id="'+esc(id)+'" aria-pressed="'+(S.me===id)+'"><span class="grow">'+esc(l)+'</span>'+(S.me===id?'<span class="mark">'+I.tick+'</span>':'')+'</button>';
  const body=sh('Vem använder den här enheten?')+group(people().map(p=>meRow(p,p)).join('')+meRow('','Gemensam skärm'))+
  sh('Namn i hushållet')+group([0,1].map(i=>'<div class="cell"><span class="pdot p'+(i+1)+'"></span><input class="field" id="set-p'+(i+1)+'" name="p'+(i+1)+'" aria-label="Person '+(i+1)+'" value="'+esc(people()[i]||'')+'"><input type="hidden" name="c'+(i+1)+'" value="'+personColor(i)+'"></div>').join(''))+
  sh('Städtid och budget')+group(fieldCell('Vardag, min','<input class="field r" id="set-wd" name="wd" inputmode="numeric" value="'+esc(st.stadtid_vardag||20)+'" style="max-width:110px">')+fieldCell('Helg, min','<input class="field r" id="set-we" name="we" inputmode="numeric" value="'+esc(st.stadtid_helg||40)+'" style="max-width:110px">')+fieldCell('Mat/vecka, kr','<input class="field r" id="set-budget" name="budget" inputmode="numeric" value="'+esc(st.matbudget||'')+'" style="max-width:110px">'))+
  sh('Utseende')+group('<button type="button" class="cell link" data-act="farg"><span class="grow">Färgval</span><span class="meta">'+esc({system:'System',light:'Ljust',dark:'Mörkt'}[S.theme]+' · '+(ACCENT==='min'?'Min färg':PCOL[accentKey()][0]))+'</span>'+chevron+'</button>')+'<div class="foot">Ljust eller mörkt, accentfärg och era färger i hushållet.</div>'+
  (NY?sh('Form på knappar och rutor')+'<div class="seg-wrap">'+segc('Form på knappar och rutor','segstil',[['standard','Kantiga'],['kapsel','Runda'],['klassisk','Raka']],SEGSTIL)+'</div><div class="foot">Gäller växlingsknappar, rutor, listor och knappar i hela appen. Kantiga har lätt rundade hörn. Runda har helt runda knappar och mjukare rutor, som i iOS 26. Raka har små hörn och streck mellan valen, som i äldre iOS. Text, höjd och färg är samma i alla tre. Gäller bara den här enheten.</div>'+
   sh('Menyraden längst ner')+'<div class="seg-wrap">'+segc('Menyraden längst ner','flikrad',[['fast','Fast'],['glas','Svävande'],['piller','Piller']],FLIKRAD)+'</div><div class="foot">Fast ligger kant i kant längst ner. Svävande är en rundad glasbubbla ovanpå innehållet, som i iOS 26, och krymper till en rund knapp när du scrollar. Piller krymper i stället till ett smalt piller med bara ikonerna, halvt nedanför skärmkanten. Gäller bara den här enheten.</div>':'')+
  sh('Vädervyn')+'<div class="seg-wrap">'+segc('Vädervyn','wxvy',[['kurva','Dagskurva'],['bild','Bild med hundar']],WXVY)+'</div><div class="foot">Dagskurvan visar temperaturen de närmaste 24 timmarna. Gäller bara den här enheten.</div>'+
  sh('Låsa rätter')+'<div class="seg-wrap">'+segc('Låsa rätter','lasstil',[['rad','Runt rätten'],['bild','Runt bilden']],LASSTIL)+'</div><div class="foot">Håll in en rätt på veckosedeln i en sekund för att låsa den. Föreslå en ny vecka behåller låsta rätter. Gäller bara den här enheten.</div>'+
  sh('Hundar i bilden')+'<div class="seg-wrap">'+segc('Hundar i bilden','hundar',[['vaxla','Växla'],['bada','Båda'],['brun','Bruna'],['svart','Svarta']],HUNDAR)+'</div><div class="foot">Växla byter var tredje timme. Du kan också trycka på hundarna i Väder för att byta. Gäller bara den här enheten.</div>'+
  sh('Schemat i kalenderrutan')+'<div class="seg-wrap">'+segc('Schemat i kalenderrutan','calStyle',[['1','Tid kvar'],['2','Stapel'],['3','Tidsaxel']],CAL_STYLE)+'</div>'+
  (DEV?sh('Förslag i Planera med portioner')+'<div class="seg-wrap">'+segc('Förslag i Planera med portioner','flStyle',[['karusell','Stort kort'],['lista','Lista']],FL_STYLE)+'</div>':'')+
  sh('Översikten')+group('<button type="button" class="cell link" data-act="arrange"><span class="grow">Ändra ordning på rutorna</span>'+chevron+'</button>')+'<div class="foot">Gäller bara den här enheten. Du kan också hålla fingret på en ruta en stund.</div>'+
  sh('Skärm')+group(fieldCell('Väggläge','<input type="checkbox" role="switch" class="switch" data-act="wall" aria-label="Väggläge"'+(S.wall?' checked':'')+'>')+
   (S.wall?'<button type="button" class="cell link" data-act="vagg"><span class="grow">Nattläge</span><span class="meta">'+esc((!NATT.on?'Av':NATT.sol?'Solnedgång–soluppgång':nattTid(NATT.a)+'–'+nattTid(NATT.b))+(CAM.on?' · kamera':''))+'</span>'+chevron+'</button>':'')+statusHtml())+
  (topic?sh('Notiser')+group('<div class="cell"><span class="grow copy">'+esc(topic)+'</span><button type="button" class="pill" data-act="copy" data-id="'+esc(topic)+'">Kopiera</button></div>')+'<div class="foot">Installera appen ntfy och prenumerera på det här ämnet. Använd servern ntfy.sh.</div>':'')+
  sh('Utvecklare')+group(fieldCell('Utvecklarläge','<input type="checkbox" role="switch" class="switch" data-act="dev" aria-label="Utvecklarläge"'+(DEV?' checked':'')+'>'))+'<div class="foot">Visar menyer som inte är färdiga, just nu Planera nästa vecka och Planera med portioner. Gäller bara den här enheten.</div>'+
  (DEV?sh('Design')+'<div class="seg-wrap">'+segc('Design','design',[['gammal','UI 1.0'],['ny','UI '+UI_VER]],NY?'ny':'gammal')+'</div><div class="foot">UI 1.0 är den gamla designen. Gäller bara den här enheten och bara i utvecklarläget.</div>':'')+
  sh('Den här enheten')+group('<button type="button" class="cell link center red" data-act="logout">Logga ut</button>')+
  '<div class="foot ver">Hushållstavlan · UI '+(NY?UI_VER:'1.0')+' · version '+esc(APP_VER)+'</div>';
  o.innerHTML=sheetHtml('settings','Inställningar','<button class="tb strong">Spara</button>',body,enter);segSlide(o);return}
 if(k==='vagg'){const ss=nattSol(),tIn=(ch,cur,lab)=>'<input type="text" inputmode="numeric" maxlength="5" placeholder="tt:mm" class="field ntid" data-change="'+ch+'" value="'+nattTid(cur)+'" aria-label="'+lab+'"'+(NATT.sol?' disabled':'')+'>',dm=d=>nattTid(d.getHours()*60+d.getMinutes());
  const body=sh('Nattläge')+group(fieldCell('Nattläge','<input type="checkbox" role="switch" class="switch" data-act="natt" aria-label="Nattläge"'+(NATT.on?' checked':'')+'>')+
    (NATT.on?fieldCell('Följ solnedgång och soluppgång','<input type="checkbox" role="switch" class="switch" data-act="nattSolv" aria-label="Följ solnedgång och soluppgång"'+(NATT.sol?' checked':'')+'>')+
     '<div class="cell ntid-row'+(NATT.sol?' off':'')+'"><span class="grow">Tid</span>'+tIn('nattA',NATT.a,'Nattläget börjar klockan')+'<span class="ntid-d">–</span>'+tIn('nattB',NATT.b,'Nattläget slutar klockan')+'</div>':''))+
   '<div class="foot">'+(NATT.sol&&ss?'Nattläget följer solen: i dag från '+dm(ss[1])+' till '+dm(ss[0])+' i morgon. ':'')+'Under nattläget visar tavlan bara en dämpad klocka när ingen har rört den på två minuter, och appen är i mörkt läge. Klockan flyttar sig lite varje timme så att den inte bränns in i skärmen. Tryck på skärmen för att väcka tavlan.</div>'+
   sh('Rummets ljus')+group(fieldCell('Använd kameran','<input type="checkbox" role="switch" class="switch" data-act="kamera" aria-label="Använd kameran för rummets ljus"'+(CAM.on?' checked':'')+'>')+
    (CAM.on?'<div class="cell"><span class="grow">Ljus i rummet</span><span class="meta" data-cam-lvl>'+esc(camTxt())+'</span></div>'+
     fieldCell('Dämpa skärmen när det är mörkt','<input type="checkbox" role="switch" class="switch" data-act="kamDampa" aria-label="Dämpa skärmen när det är mörkt"'+(CAM.dim?' checked':'')+'>'):''))+
   (CAM.on?sh('Mörkt läge under')+'<div class="seg-wrap">'+segc('Mörkt läge under','kamGrans',[['15','15 %'],['25','25 %'],['35','35 %'],['45','45 %']],String(CAM.thr))+'</div>':'')+
   '<div class="foot">Kameran tittar en gång i minuten och räknar bara ut hur ljust det är. Ingen bild sparas eller skickas någonstans. När rummet blir mörkare än gränsen byter tavlan till mörkt läge och dämpar bilden. Under nattläget är kameran avstängd. Gäller bara den här enheten.</div>'+
   '<div class="foot">Muspekaren är dold i väggläge. Flyttar du musen syns den en kort stund.</div>';
  o.innerHTML=sheetHtml('vagg','Nattläge','<button type="button" class="tb strong" data-act="sheetClose">Klar</button>',body,enter,'<button type="button" class="back" data-act="settings">'+I.back+'Inställningar</button>');segSlide(o);return}
 if(k==='farg'){const mi=people().indexOf(S.me);if(enter)[FARG_OPEN,FARG_X].forEach(o=>Object.keys(o).forEach(k=>delete o[k]));
  // en rad färgcirklar som går att dra i sidled för fler färger; efter ett val fälls en rad med toner av färgen ut under
  const strip=farbList(),near=h=>strip.reduce((b,k)=>Math.min(Math.abs(colPos(k).h-h),360-Math.abs(colPos(k).h-h))<Math.min(Math.abs(colPos(b).h-h),360-Math.abs(colPos(b).h-h))?k:b,strip[0]);
  const dot=(name,chg,id,key,on,lab)=>{const c=PCOL[key];return'<label title="'+esc(lab||c[0])+'"><input type="radio" name="'+name+'" value="'+key+'" data-change="'+chg+'"'+(id!=null?' data-id="'+id+'"':'')+(on?' checked':'')+'><span style="--c:'+c[1]+';--cd:'+c[chg==='accent'?4:3]+'"></span></label>'};
  const picker=(name,chg,id,cur,lab)=>{const pc=PCOL[cur],P=colPos(cur),open=FARG_OPEN[name],base=strip.includes(cur)?cur:/^h\d+s\d$/.test(cur)&&strip.includes('h'+P.h+'s3')?'h'+P.h+'s3':near(P.h);
   return'<div class="cell strip-cell"><div class="pcols pstrip" role="radiogroup" aria-label="'+esc(lab)+'" data-strip="'+name+'">'+strip.map(k=>dot(name+'-f',chg,id,k,k===base)).join('')+'</div></div>'+
    '<div class="shades'+(open?' open'+(open===2?' grow':''):'')+'" data-shades="'+name+'"><div><div class="cell"><div class="pcols" role="radiogroup" aria-label="Toner av '+esc(pc[0].toLowerCase())+'">'+
    [0,1,2,3,4,5,6].map(t=>{const key='h'+colPos(base).h+'s'+t;colOk(key);return dot(name,chg,id,key,cur===key)}).join('')+'</div></div></div></div>'};
  Object.keys(FARG_OPEN).forEach(k=>{if(FARG_OPEN[k]===2)FARG_OPEN[k]=1});
  const accName=ACCENT==='min'?'Min färg ('+PCOL[accentKey()][0].toLowerCase()+')':PCOL[accentKey()][0]+(accentKey()==='vinrod'?' (standard)':'');
  const body=sh('Ljust eller mörkt')+'<div class="seg-wrap">'+segc('Ljust eller mörkt','theme',[['system','System'],['light','Ljust'],['dark','Mörkt']],S.theme)+'</div>'+
   sh('Accentfärg')+group('<div class="cell"><span class="grow">Knappar och länkar</span><span class="meta" data-name="acc">'+esc(accName)+'</span></div>'+
    (ACCENT==='min'?'':picker('acc','accent',null,accentKey(),'Accentfärg'))+
    (mi>=0?fieldCell('Samma som min färg','<input type="checkbox" role="switch" class="switch" data-act="accMin" aria-label="Samma som min färg"'+(ACCENT==='min'?' checked':'')+'>'):''))+
   '<div class="foot">'+(ACCENT==='min'?'Knapparna följer din färg i hushållet nedanför. ':'')+'Gäller bara den här enheten.</div>'+
   sh('Färg i hushållet')+people().slice(0,2).map((n,i)=>group('<div class="cell"><span class="grow">'+esc(n)+'</span><span class="meta" data-name="pc'+i+'">'+esc(PCOL[personColor(i)][0])+'</span></div>'+picker('pc'+i,'pcol',i,personColor(i),'Färg för '+n))).join('<div style="height:10px"></div>')+
   '<div class="foot">Används för era händelser, uppgifter, sysslor och i Ekonomi. Gäller alla enheter.</div>';
  o.innerHTML=sheetHtml('farg','Färgval','<button type="button" class="tb strong" data-act="sheetClose">Klar</button>',body,enter,'<button type="button" class="back" data-act="settings">'+I.back+'Inställningar</button>');segSlide(o);
  // raden står kvar där den var, och första gången med vald färg i mitten
  o.querySelectorAll('[data-strip]').forEach(sp=>{const x=FARG_X[sp.dataset.strip];if(x!=null){sp.scrollLeft=x;return}const c=sp.querySelector('input:checked');if(c){const l=c.parentElement;sp.scrollLeft=l.offsetLeft-(sp.clientWidth-l.offsetWidth)/2}});return}
 if(k==='prefs'){const st=settings();
  const body=PREFS.map(([key,l,,ph])=>sh(l)+group('<div class="cell"><textarea class="field area" name="'+key+'" rows="'+Math.max(3,Math.ceil(String(st[key]||'').length/34)+1)+'" maxlength="600" placeholder="'+esc(ph)+'" aria-label="'+esc(l)+'">'+esc(st[key]||'')+'</textarea></div>')).join('')+
   '<div class="foot">Sparas i kalkylarket. Veckoplaneringen läser dem nästa gång den gör menyn.</div>';
  o.innerHTML=sheetHtml('prefs','Matpreferenser','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='prot'){const P=planState(),slot=S.protFor,r=recipeById(P.val[slot]),val=r&&protVal(slot,r);if(!val){S.sheet=null;return}
  const info=protInfo(r),bas=protBasPris(r),orig=protById(info.id),K=protById(val.k),Vg=protById(val.v);
  const basNamn=[...new Set((r.groups||[]).flatMap(g=>(g.items||[]).filter(i=>{const x=MV.vara(i.n);return x&&x.k!==info.vkey&&!/salt|peppar|olja|vatten|buljong/.test(i.n)}).map(i=>i.n)))].slice(0,5);
  const tile=(w,x,on,cls)=>'<button type="button" class="pt'+(on?' on '+cls:'')+'" data-act="protPick" data-id="'+w+'|'+x.id+'" aria-pressed="'+on+'"><span class="e" aria-hidden="true">'+x.ic+'</span><span class="n">'+esc(x.namn)+'</span><span class="m">'+x.g+' g · '+kr(protPris(x))+'<br>'+x.pr+' g protein</span></button>';
  const who=(cls,n,right)=>'<div class="pt-who '+cls+'"><span class="av">'+pinit(n)+'</span>'+esc(n)+(right||'')+'</div>';
  let body='<div class="pt-bas"><span class="pt-bi" aria-hidden="true">'+foodIcon(r.title)+'</span><div><div class="fn">Grundrätten lagas en gång</div><div class="title">'+esc(r.title)+'</div><div class="fn">'+esc(cap(basNamn.join(', ')))+'. Receptet har '+esc(orig.namn.toLowerCase())+', som här byts mot det ni väljer.</div></div></div>';
  body+=who('p1',kottPerson())+'<div class="pt-grid">'+PROT.map(x=>tile('k',x,x.id===val.k,'p1')).join('')+'</div>';
  body+=who('p2',vegPerson(),K.veg&&K.id!==val.v?'<button type="button" class="pt-same" data-act="protPick" data-id="v|'+K.id+'">Samma som '+esc(kottPerson())+'</button>':'')+'<div class="pt-grid">'+PROT.filter(x=>x.veg).map(x=>tile('v',x,x.id===val.v,'p2')).join('')+'</div>';
  const pk=protPris(K),pvv=protPris(Vg);
  body+='<div class="pt-sum"><div><span>Grundrätten</span><b>'+kr(bas)+'/port</b></div><div><span>'+esc(K.namn)+' till '+esc(kottPerson())+'</span><b>'+kr(pk)+'</b></div><div><span>'+esc(Vg.namn)+' till '+esc(vegPerson())+'</span><b>'+kr(pvv)+'</b></div><div class="tot"><span>Per portion</span><b>'+kr(bas+(pk+pvv)/2)+'</b></div></div>';
  body+='<div class="foot">Valet blir förval nästa gång rätten föreslås. '+esc(vegPerson())+' får bara vegetariska alternativ utan ägg. Varorna räknas i hela förpackningar i inköpslistan.</div>';
  o.innerHTML=sheetHtml('prot','Välj protein','<button type="button" class="tb strong" data-act="sheetClose">Klar</button>',body,enter);return}
 if(k==='swap'||k==='slot'||k==='dess'){o.innerHTML=pickSheet(k,enter);return}
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
  const own='<div class="vpick">'+[['shared','Gemensam']].concat(people().map(p=>[p,p])).map(([v,l])=>'<label'+(v==='shared'?'':' class="pc '+pcls(v)+'"')+'><input type="radio" name="owner" value="'+esc(v)+'"'+((e.list||'shared')===v?' checked':'')+'><span>'+esc(l)+'</span></label>').join('')+'</div>';
  const body=sh('Vem betalar?')+own+'<div style="height:16px"></div>'+group('<div class="cell"><input class="field" name="name" required placeholder="Namn, t.ex. Spotify eller Hyra" value="'+esc(c.name||'')+'" aria-label="Namn" autocomplete="off"></div>'+
    fieldCell('Belopp','<input class="field r" name="amount" inputmode="decimal" required value="'+esc(c.amount!=null?c.amount:'')+'" placeholder="0 kr" style="max-width:140px">'))+
   sh('Betalas per')+'<div class="vpick">'+[['månad','Månad'],['kvartal','Kvartal'],['år','År']].map(([v,l])=>'<label><input type="radio" name="period" value="'+v+'"'+((c.period||'månad')===v?' checked':'')+'><span>'+l+'</span></label>').join('')+'</div>'+
   sh('Betalning')+group(fieldCell('Sätt',menuSel('name="pay"',pays.map(x=>'<option value="'+x+'"'+(x===(c.pay||'')?' selected':'')+'>'+(x||'Inget valt')+'</option>').join('')))+
    fieldCell('Dag i månaden','<input class="field r" name="day" value="'+esc(c.day||'')+'" placeholder="t.ex. 28 eller sista" style="max-width:170px">')+
    '<div class="cell"><input class="field" name="note" placeholder="Anteckning" value="'+esc(c.note||'')+'" aria-label="Anteckning"></div>')+
   sh('Stående överföring från '+esc(ovFrom(e.list||'shared')))+group(fieldCell('Överföringsdag','<input class="field r" name="tday" inputmode="numeric" value="'+esc(c.tday||'')+'" placeholder="28" style="max-width:120px">')+(!e.id?'':ovState(c)==='ok'?'<div class="cell"><span class="ovs ok" aria-hidden="true">'+I.tick+'</span><span class="grow">Inlagd'+(c.ov.t?' '+esc(dateShort(c.ov.t)):'')+'</span><button type="button" class="linkbtn" data-act="ovUndo">Ångra</button></div>':
     '<button type="button" class="cell link" data-act="ovShow" data-id="'+esc(c.id)+'" data-list="'+esc(e.list)+'"><span class="ovs '+ovState(c)+'" aria-hidden="true">!</span><span class="grow" style="color:var(--orange)">'+(ovState(c)==='andrad'?'Uppdatera och bekräfta':'Bekräfta att den är inlagd')+'</span>'+chevron+'</button>'))+
   (e.id?'<div style="height:22px"></div>'+group('<button type="button" class="cell link center red" data-act="ekoDel">Ta bort utgiften</button>'):'');
  o.innerHTML=sheetHtml('cost',e.id?'Ändra utgift':'Ny utgift','<button class="tb strong">Spara</button>',body,enter);return}
 if(k==='ov'){const L=(S.ovEdit||{}).list||'shared',c=ekoList(L).find(x=>x.id===(S.ovEdit||{}).id);if(!c){closeSheets();o.innerHTML='';o.dataset.k='';return}
  const st=ovState(c),was=c.ov&&st==='andrad'?c.ov:null,row=(l,v)=>'<div class="ti-row"><span>'+l+'</span><b>'+v+'</b></div>';
  const body='<div class="ov-sheet"><div class="ov-flow" aria-hidden="true"><span>'+I.lock+'</span><i></i><span>'+I_EKO+'</span></div>'+
   '<div class="ti-big">'+kr(c.amount)+'</div><div class="ti-sub">'+esc(c.name)+' · '+esc(ovEvery[c.period||'månad'].toLowerCase())+'</div>'+
   '<div class="ti-rows">'+row('Från',esc(ovFrom(L)))+row('Till',esc(ovTo))+row('Belopp',kr(c.amount))+row('Upprepas',esc(ovEvery[c.period||'månad']))+
    row('Datum','Den '+esc(dayTxt(ovTday(c))))+'</div>'+
   (was?'<div class="ov-was">Ändrad sedan sist. Förut '+kr(was.a)+(was.p&&was.p!==(c.period||'månad')?' per '+esc(was.p):'')+(String(was.d||'28')!==ovTday(c)?', den '+esc(dayTxt(was.d||'28')):'')+'. Ändra den befintliga överföringen i banken.</div>':'')+
   '<button type="button" class="btn-fill" data-act="ovDone" data-id="'+esc(c.id)+'" data-list="'+esc(L)+'">'+I.tick+(was?'Den är ändrad':'Den är inlagd')+'</button>'+
   '<button type="button" class="ov-later" data-act="ovLater">Gör det senare</button>'+
   '<div class="ti-foot fn">Utgiften visas som '+(was?'ändrad':'saknad')+' tills du bockar av den.</div></div>';
  o.innerHTML=sheetHtml('ov','Stående överföring','<span class="tb" aria-hidden="true"></span>',body,enter);return}
 if(k==='delLas'){const i=S.delAsk,m=D().menu[i];if(!m){closeSheets();o.dataset.k='';o.innerHTML='';return}
  o.innerHTML='<div class="pop-bg'+enter+'" data-act="sheetBg"><div class="pop" role="alertdialog" aria-modal="true" aria-labelledby="pop-t"><span class="pop-ic" aria-hidden="true">'+I.lock+'</span><h2 id="pop-t">Ta bort en låst rätt?</h2><p>'+esc(m.title)+' är låst. Håll in Bekräfta för att ta bort den från veckosedeln.</p>'+
   '<button type="button" class="sh-btn red pop-ok" data-hold="weekDelYes" data-id="'+i+'" aria-label="Håll in för att bekräfta"><i class="sh-fill"></i><b>Bekräfta</b></button><button type="button" class="pop-no" data-act="sheetClose">Avbryt</button></div></div>';return}
 if(k==='shopMore'){const st=settings(),vs=st.vecka_start,wk=isDate(vs)?'vecka '+isoWeek(parse(vs)):'veckan',n=D().shop.length;
  o.innerHTML='<div class="asheet'+enter+'" data-act="sheetBg"><div class="as-panel" role="dialog" aria-modal="true" aria-label="Inköpslistan"><div class="grp"><div class="ttl">'+(S.shopMoreC?'Ta bort alla '+n+' varor på listan? Du kan ångra i några sekunder.':'Inköpslistan')+'</div>'+
   (S.shopMoreC?'<button class="it red strong" data-act="shopMoreEmpty">'+I.trash+'Ja, töm listan</button>':
    '<button class="it" data-act="shopMoreImp">'+I.imp+'Uppdatera varor för '+esc(wk)+'</button>'+(n?'<button class="it red" data-act="shopMoreAsk">'+I.trash+'Töm listan</button>':''))+
   '</div><div class="grp"><button class="it strong" data-act="sheetClose">Avbryt</button></div></div></div>';return}
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
   fieldCell('Avdelning',menuSel('id="shop-cat" name="cat"','<option value="">Automatiskt</option>'+CATS.map(c=>'<option>'+c+'</option>').join(''))));
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
/* Senaste dygnet till dagskurvan. Yr ger bara prognos framåt, så de passerade timmarna hämtas från Open-Meteo (past_days=1),
   som bygger på väderanalysen för platsen. Hämtas om en gång i timmen. */
async function loadPast(force){const P=WX_POS();if(!force&&EXT.past&&Date.now()-EXT.past.at<60*60000&&EXT.past.lat===P.lat)return false;
 try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+P.lat+'&longitude='+P.lon+'&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,is_day&timezone=UTC&past_days=1&forecast_days=1&wind_speed_unit=ms');
  if(!r.ok)throw new Error(r.status);const j=await r.json(),H=j.hourly,now=Date.now();
  const ts=H.time.map((t,k)=>{const b=OM_SYM[H.weather_code[k]]||'cloudy',dn=/^(clearsky|fair|partlycloudy|.*showers)$/.test(b)?(H.is_day[k]?'_day':'_night'):'';
   return{t:t+':00Z',T:H.temperature_2m[k],w:H.wind_speed_10m[k],wd:H.wind_direction_10m[k],s:b+dn,pr:H.precipitation[k]}}).filter(x=>x.T!=null&&Date.parse(x.t)<now&&Date.parse(x.t)>now-26*36e5);
  EXT.past={at:now,lat:P.lat,ts};return true}catch(e){return false}}
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
// måne med moln för halvklara och mest klara nätter (det finns ingen sådan emoji)
const MOON_C=big=>'<svg class="ic-mc" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M12.6 2.6a7.4 7.4 0 1 0 7.6 9.8A6 6 0 0 1 12.6 2.6z" fill="#F6C344"/>'+
 (big?'<path d="M8.6 21.2h10.2a3.6 3.6 0 0 0 .3-7.2 4.9 4.9 0 0 0-9.3 1.5 2.9 2.9 0 0 0-1.2 5.7z" fill="#EEF1F6" stroke="#B9C2CF" stroke-width=".8"/>'
  :'<path d="M13.4 21.4h6.4a2.6 2.6 0 0 0 .2-5.2 3.5 3.5 0 0 0-6.6 1 2.1 2.1 0 0 0 0 4.2z" fill="#EEF1F6" stroke="#B9C2CF" stroke-width=".8"/>')+'</svg>';
function symInfo(s){const b=symBase(s),night=/_night$/.test(s||'');
 if(/thunder/.test(b))return['⛈️','Åska'];
 if(/sleet/.test(b))return['🌨️',(/showers/.test(b)?'Byar av ':'')+'snöblandat regn'];
 if(/snow/.test(b))return[/heavy/.test(b)?'❄️':'🌨️',/showers/.test(b)?'Snöbyar':/heavy/.test(b)?'Kraftigt snöfall':/light/.test(b)?'Lätt snöfall':'Snöfall'];
 if(/rain/.test(b))return[/heavy/.test(b)||(night&&/showers/.test(b))?'🌧️':(/showers|light/.test(b)?'🌦️':'🌧️'),/showers/.test(b)?(/heavy/.test(b)?'Kraftiga regnskurar':/light/.test(b)?'Lätta regnskurar':'Regnskurar'):(/heavy/.test(b)?'Kraftigt regn':/light/.test(b)?'Lätt regn':'Regn')];
 return{clearsky:[night?'🌙':'☀️','Klart'],fair:[night?MOON_C(0):'🌤️','Mest klart'],partlycloudy:[night?MOON_C(1):'⛅','Halvklart'],cloudy:['☁️','Mulet'],fog:[FOG_IC,'Dimma']}[b]||['🌡️','']}
// temperaturfärg efter verklig temperatur, som en tydlig skala där färgen byter ton var femte grad:
// lila i sträng kyla, blått kring nollan, turkost kring 10, grönt kring 15, gult kring 20, orange kring 25 och rött över 30
const T_COL=[[-15,'#7A5CF0'],[-5,'#3D6BF5'],[0,'#2F8CFF'],[5,'#2FBDF2'],[10,'#2CD3B5'],[15,'#6FD957'],[20,'#F2D43A'],[25,'#FF9F0A'],[30,'#FF5A36'],[36,'#E0203F']];
function tempCol(T){const c=T_COL;if(T<=c[0][0])return c[0][1];for(let i=1;i<c.length;i++)if(T<=c[i][0])return mixHex(c[i-1][1],c[i][1],(T-c[i-1][0])/(c[i][0]-c[i-1][0]));return c[c.length-1][1]}
function tempGrad(a,b){if(b-a<.5)return tempCol((a+b)/2);const n=Math.max(2,Math.ceil(b-a)+1);
 return'linear-gradient(90deg,'+Array.from({length:n},(_,i)=>tempCol(a+(b-a)*i/(n-1))+' '+(i/(n-1)*100).toFixed(1)+'%').join(',')+')'}
const capS=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const deg=t=>Math.round(t)+'°';
const mm=v=>(Math.round(v*10)/10).toLocaleString('sv-SE')+' mm';
// Dagens klädsel: dagtid som är kvar idag, eller morgondagen efter kl 20. Råden utgår från den kallaste
// känns som-temperaturen (med vinden) under de timmarna, eftersom man ska klara den kallaste stunden ute.
// Regn, snö, åska, sol och dimma läggs till efter klädraden i stället för att ersätta den.
const KLADER=[[22,'Shorts och t-shirt'],[18,'T-shirt och en tröja med'],[14,'Tröja eller tunn jacka'],[10,'Vår- eller höstjacka'],[5,'Varm jacka'],
 [0,'Varm jacka och mössa'],[-5,'Vinterjacka, mössa, vantar'],[-12,'Vinterkläder och halsduk'],[-99,'Långkalsonger och vinterkläder']];
function kladRad(t,host){const k=KLADER.find(([g])=>t>=g)[1];return k==='Vår- eller höstjacka'?(host?'Höstjacka':'Vårjacka'):k}
function wxToday(W){const n=new Date(),late=n.getHours()>=20,day=late?addDays(today(),1):today();
 const hs=W.hours.filter(x=>ymd(x.d)===day&&x.d.getHours()>=(late?8:Math.min(n.getHours(),20))&&x.d.getHours()<=20);const L=hs.length?hs:[W.now];
 const max=Math.max(...L.map(x=>x.T)),pr=L.reduce((a,x)=>a+(x.pr||0),0),syms=L.map(x=>symBase(x.s)).join(' ');
 const fl=L.map(x=>feels(x.T,x.w||0)),low=Math.min(...fl),high=Math.max(...fl);
 const storm=/thunder/.test(syms),snow=/snow|sleet/.test(syms)&&max<2,rain=!snow&&(pr>=0.6||/rain|sleet/.test(syms)&&pr>=0.3),fog=/fog/.test(symBase(W.now.s));
 const kind=storm?'storm':snow?'snow':rain?'rain':fog?'fog':max>=20?'hot':max>=14?'warm':max>=7?'mild':max>=0?'cold':'freezing';
 const sunny=/clearsky|fair/.test(syms)&&!/cloudy/.test(syms.replace('partlycloudy',''));
 const nt=isNight(),m=parse(day).getMonth(),host=m>=7||m<=1;
 const add=[];
 if(storm)add.push('paraply, åska');else if(rain)add.push(pr>=4?'regnkläder':'paraply');
 if(snow)add.push('kängor');
 if(fog)add.push('reflex');
 if(high-low>=8&&low<14)add.push('lager på lager');
 if(sunny&&!nt&&high>=16)add.push('solglasögon');
 const tip=kladRad(low,host)+(add.length?' + '+add[0]:'');
 return{kind,night:nt,sunny,max,low,pr,tip,when:late?'i morgon':'idag'}}
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
 // solen och månen går längs samma bana som i översikten (arcHtml), ovanför hundarna
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
  arcHtml(W,'w')+'<div class="sc-fx" aria-hidden="true">'+fx+'</div>'+
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
/* Trädets lövstadier genom året. Varje nyckeldag har [dag på året, hur tät kronan är 0-1, ljus färg, skuggfärg];
   mellan nyckeldagarna glider täthet och färg över i varandra, så att trädet ändras lite varje dag. */
const TREE_K=[[1,0,'#8A6A4A','#6E5641'],[70,0,'#8A6A4A','#6E5641'],[95,.12,'#C9E58C','#A9CF6A'],[115,.34,'#BFE57A','#93CC55'],[132,.62,'#AEDF66','#82C24A'],
 [155,.95,'#98D45C','#6AAE42'],[190,1,'#7CB34A','#55913A'],[228,1,'#8EAE40','#6A8A30'],[256,1,'#AEB540','#87902F'],[272,.97,'#DDB53C','#B4892C'],
 [286,.9,'#F0922C','#CC5E24'],[297,.78,'#E9562A','#B33424'],[308,.5,'#C2462C','#8E2C22'],[320,.2,'#9A5A34','#713E26'],[332,0,'#8A6A4A','#6E5641'],[366,0,'#8A6A4A','#6E5641']];
function treeStage(t){const d=parse(t),y=d.getFullYear(),doy=Math.round((d-new Date(y,0,1))/864e5)+1;
 let i=1;while(i<TREE_K.length-1&&TREE_K[i][0]<doy)i++;const A=TREE_K[i-1],B=TREE_K[i],k=Math.max(0,Math.min(1,(doy-A[0])/((B[0]-A[0])||1)));
 const ramp=(a,b,c,e)=>doy<a||doy>e?0:doy<b?(doy-a)/(b-a):doy<=c?1:(e-doy)/(e-c);
 return{doy,d:A[1]+(B[1]-A[1])*k,c:[mixHex(A[2],B[2],k),mixHex(A[3],B[3],k)],c2:doy>280&&doy<315?'#F7C23A':null,
  bloom:ramp(108,118,128,140),fruit:ramp(225,240,262,275),fall:ramp(268,290,304,326),ground:ramp(272,300,330,350),gc:doy>300?['#A8552E','#7E4128']:null}}
/* Bakgrunden bakom gräsplätten: en mjuk kulle och ett träd efter årstiden. Inget har en hård kant mot rutan:
   kullen tonar ut med en mask och små tuvor läcker ut runt om, precis som gräset. 1 enhet = 1 px, marken ligger
   på y=175 och plätten med hundarna står i den högra delen (x 80-220). */
function backdropSvg(sc){const id='bd'+(++FIG_N),ss=grassSeason(today()),snow=snowLevel(sc),frost=!snow&&sc.T<0,f=v=>v.toFixed(1);
 const rnd=k=>{const x=Math.sin(k*57.3+1.7)*43758.5453;return x-Math.floor(x)};
 let[g1,g2]=GRASS[ss];if(frost){g1=mixHex(g1,'#E2ECF5',.42);g2=mixHex(g2,'#C6D5E4',.3)}
 const blob=(cx,cy,rx,ry,j,seed)=>{const n=14,P=[];for(let i=0;i<n;i++){const a=i/n*2*Math.PI,r=1+(rnd(i+seed)-.5)*j;P.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r])}
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];let d='M'+mid(P[n-1],P[0]).map(f).join(' ');
  P.forEach((p,i)=>{const m=mid(p,P[(i+1)%n]);d+=' Q'+f(p[0])+' '+f(p[1])+' '+f(m[0])+' '+f(m[1])});return d+'Z'};
 const far=snow>=2?'#DCE5EF':mixHex(g2,'#9FB0A0',.35),near=snow>=2?'#EEF3F8':g1;
 // masken: helt synlig nere vid plätten och tonar ut uppåt och åt vänster
 let s='<defs><radialGradient id="'+id+'f" cx="120" cy="164" r="125" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 164) scale(1 .3) translate(-120 -164)"><stop offset=".3" stop-color="#fff"/><stop offset=".75" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<mask id="'+id+'m"><rect width="230" height="190" fill="url(#'+id+'f)"/></mask>'+
  '<linearGradient id="'+id+'v" x1="0" y1="0" x2="0" y2="190" gradientUnits="userSpaceOnUse"><stop offset=".89" stop-color="#fff"/><stop offset=".985" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="'+id+'b"><rect width="230" height="190" fill="url(#'+id+'v)"/></mask>'+
  '<filter id="'+id+'n"><feColorMatrix type="matrix" values=".66 .04 0 0 .02  .02 .7 .04 0 .03  0 .06 .9 0 .07  0 0 0 1 0"/></filter></defs>';
 let g='<g mask="url(#'+id+'b)"><g mask="url(#'+id+'m)">';
 // två kullar: en avlägsen och en närmare som trädet står på
 g+='<path d="M-10 172 Q30 128 92 136 Q150 142 240 120 V190 H-10Z" fill="'+far+'" opacity=".35"/>';
 g+='<path d="M-10 182 Q20 150 64 152 Q108 154 150 164 Q190 172 240 160 V190 H-10Z" fill="'+near+'" opacity=".62"/>';
 g+='<g opacity=".7">'+[[40,160,26,3.4,mixHex(near,'#FFFFFF',.18)],[100,166,22,3,shadeHex(near,.86)],[18,170,14,2.6,shadeHex(near,.86)]].map(([x,y,rx,ry,c],i)=>'<path d="'+blob(x,y,rx,ry,.4,i*5)+'" fill="'+c+'"/>').join('')+'</g>';
 g+='</g></g>';
 // tuvor som läcker ut från kullen
 g+=[[-2,166,4,1.6],[8,160,2.5,1.1],[20,150,2.2,1],[70,148,2.5,1],[112,152,3,1.2],[190,158,2.4,1]].map(([x,y,rx,ry])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+near+'" opacity=".55"/>').join('');
 // trädet: stam och krona av runda klungor, ljus uppe till vänster och hård skugga till höger som hundarna.
 // Lövet följer året steg för steg (treeStage): knoppar, musöron, ljust försommargrönt, mörkare gröngul högsommar,
 // gulnande, brandgult och eldigt rött med fallande löv, sena bruna löv och till sist kala grenar.
 const TX=52,TY=160,T=treeStage(today()),den=T.d,bare=den<.04;
 const bark='#6E5641',barkD='#55412F',[L1,L2]=T.c;
 let t='<path d="M'+(TX-4.5)+' '+TY+' Q'+(TX-3)+' '+(TY-26)+' '+(TX-2.6)+' '+(TY-46)+' L'+(TX+2.6)+' '+(TY-46)+' Q'+(TX+3.2)+' '+(TY-26)+' '+(TX+5.5)+' '+TY+'Z" fill="'+bark+'"/>'+
  '<path d="M'+(TX+.8)+' '+TY+' Q'+(TX+1.6)+' '+(TY-26)+' '+(TX+1.2)+' '+(TY-46)+' L'+(TX+2.6)+' '+(TY-46)+' Q'+(TX+3.2)+' '+(TY-26)+' '+(TX+5.5)+' '+TY+'Z" fill="'+barkD+'"/>';
 const br=[[TX,TY-30,TX-16,TY-52],[TX,TY-38,TX+15,TY-58],[TX-1,TY-46,TX-4,TY-70],[TX-9,TY-44,TX-22,TY-60],[TX+8,TY-50,TX+20,TY-66],[TX-3,TY-60,TX-12,TY-76],[TX-3,TY-62,TX+6,TY-80]];
 const brP=br.map(([a,b,c,d],i)=>'M'+a+' '+b+' Q'+f((a+c)/2+(i%2?3:-3))+' '+f((b+d)/2)+' '+c+' '+d);
 // grenarna syns så länge kronan är gles; kvistar i spetsarna och snö som en vit kant ovanpå
 const showBr=den<.75,tw=showBr?br.map(([a,b,c,d],i)=>'M'+c+' '+d+' l'+(i%2?4:-4)+' -5 M'+f((a+c)/2)+' '+f((b+d)/2)+' l'+(i%2?-4:4)+' -4').join(' '):'';
 if(bare&&snow>=1)t+='<g stroke="#FFFFFF" stroke-linecap="round" fill="none" transform="translate(0 -1.3)">'+brP.map((d,i)=>'<path d="'+d+'" stroke-width="'+(i<3?2.8:1.9)+'"/>').join('')+'<path d="'+tw+'" stroke-width="1.4"/></g>';
 t+='<g stroke="'+bark+'" stroke-linecap="round" fill="none">'+brP.map((d,i)=>'<path d="'+d+'" stroke-width="'+(i<3?2.6:1.6)+'"/>').join('')+(tw?'<path d="'+tw+'" stroke-width="1"/>':'')+'</g>';
 // knoppar och glesa löv: små prickar vid grenspetsarna, fler ju längre lövet har kommit
 const tips=br.flatMap(([a,b,c,d],i)=>[[c,d],[(a+c)/2,(b+d)/2],[c+(i%2?4:-4),d-5],[(a+3*c)/4,(b+3*d)/4]]);
 if(!bare&&den<.62){const n=Math.round(tips.length*Math.min(1,den/.35)*1.6),r=1.2+den*4.2;
  t+=Array.from({length:n},(_,k)=>{const[x,y]=tips[k%tips.length],j=Math.floor(k/tips.length),ox=(rnd(k+70)-.5)*(6+j*6),oy=(rnd(k+90)-.5)*(5+j*5);
   return'<circle cx="'+f(x+ox)+'" cy="'+f(y+oy)+'" r="'+f(r*(.7+rnd(k+5)*.5))+'" fill="'+(k%3?L1:L2)+'"/>'}).join('')}
 // tät krona av klungor när lövet är utslaget
 if(den>=.5){const k0=Math.min(1,(den-.5)/.4),lite=mixHex(L1,'#FFFFFF',.22);
  const CL=[[TX-14,TY-58,15],[TX+12,TY-62,14],[TX-2,TY-76,17],[TX-20,TY-72,11],[TX+20,TY-76,11],[TX+2,TY-56,13],[TX-8,TY-90,11],[TX+10,TY-88,10]].map(([x,y,r])=>[x,y,r*(.55+.45*k0)]).slice(0,Math.max(3,Math.round(8*Math.min(1,den+.1))));
  t+='<g>'+CL.map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+f(r)+'" fill="'+L1+'"/>').join('')+
   '<clipPath id="'+id+'c">'+CL.map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+f(r)+'"/>').join('')+'</clipPath><g clip-path="url(#'+id+'c)"><path d="M'+(TX+2)+' '+(TY-110)+' Q'+(TX-6)+' '+(TY-70)+' '+(TX+8)+' '+(TY-40)+' H'+(TX+40)+' V'+(TY-110)+'Z" fill="'+L2+'"/></g>'+
   CL.slice(0,4).map(([x,y,r])=>'<circle cx="'+f(x-r*.35)+'" cy="'+f(y-r*.35)+'" r="'+f(r*.38)+'" fill="'+lite+'" opacity=".55"/>').join('')+'</g>'}
 // blom på våren och äpplen på sensommaren
 if(T.bloom)t+=[[TX-18,TY-66],[TX+6,TY-82],[TX+16,TY-64],[TX-6,TY-58],[TX-12,TY-84],[TX+22,TY-78],[TX-22,TY-56],[TX+2,TY-70]].slice(0,Math.round(8*T.bloom)).map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="1.9" fill="#FFFFFF"/><circle cx="'+x+'" cy="'+y+'" r=".75" fill="#F2B6C6"/>').join('');
 if(T.fruit)t+=[[TX-16,TY-62],[TX+12,TY-70],[TX+2,TY-84],[TX-6,TY-72],[TX+18,TY-60]].slice(0,Math.round(5*T.fruit)).map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="2" fill="#D94A3A"/><circle cx="'+(x-.6)+'" cy="'+(y-.7)+'" r=".6" fill="#FFB3A6"/>').join('');
 // fallande löv: fler ju mer det är höst, varje löv singlar ned i egen takt och vajar åt sidan
 if(T.fall&&!snow&&!sc.thunder){const n=Math.round(T.fall*7),src=[[TX+18,TY-60],[TX-22,TY-64],[TX+4,TY-80],[TX-10,TY-56],[TX+24,TY-74],[TX-16,TY-82],[TX+10,TY-52]];
  t+='<g class="bd-leaves">'+src.slice(0,n).map(([x,y],i)=>{const c=[L1,L2,T.c2||L1][i%3],dur=5+rnd(i+11)*4,dl=rnd(i+23)*dur,dx=-10-rnd(i+31)*26*(i%2?1:-.5),dy=TY+4-y+rnd(i+3)*6;
   return'<g style="--dx:'+f(dx)+'px;--dy:'+f(dy)+'px;animation-duration:'+f(dur)+'s;animation-delay:-'+f(dl)+'s"><path d="M'+x+' '+y+' q3.2 -2.4 6.4 0 q-3.2 2.4 -6.4 0Z" fill="'+c+'"/></g>'}).join('')+'</g>'}
 if(snow>=1&&!bare&&den>=.5)t+='<path d="M'+(TX-26)+' '+(TY-78)+' Q'+(TX-10)+' '+(TY-108)+' '+(TX+16)+' '+(TY-94)+' Q'+(TX+30)+' '+(TY-86)+' '+(TX+28)+' '+(TY-80)+' Q'+(TX+6)+' '+(TY-92)+' '+(TX-26)+' '+(TY-78)+'Z" fill="#FFFFFF" opacity=".92"/>';
 // trädets skugga på kullen och fallna löv på marken
 t='<ellipse cx="'+(TX+6)+'" cy="'+(TY+1)+'" rx="'+f(10+8*den)+'" ry="2.6" fill="'+shadeHex(near,.75)+'" opacity=".7"/>'+t;
 if(T.ground&&snow<2){const G=[[TX-20,TY+4],[TX+14,TY+6],[TX+30,TY+3],[TX-6,TY+8],[TX-30,TY+7],[TX+22,TY+9],[TX+4,TY+3],[TX-14,TY+10],[TX+38,TY+7],[TX-38,TY+3]],gc=T.gc||[L1,L2];
  t+=G.slice(0,Math.round(10*T.ground)).map(([x,y],i)=>'<path d="M'+x+' '+y+' q2 -1.4 4 0 q-2 1.4 -4 0Z" fill="'+gc[i%2]+'" transform="rotate('+Math.round(rnd(i+50)*80-40)+' '+(x+2)+' '+y+')"/>').join('')}
 g+='<g opacity=".92">'+t+'</g>';
 return'<svg class="bd" viewBox="0 0 230 190" aria-hidden="true">'+s+(sc.dark?'<g filter="url(#'+id+'n)">'+g+'</g>':g)+'</svg>'}
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
 if(arc&&gf){const hr=h.getBoundingClientRect(),fr=gf.getBoundingClientRect();const hl=[...h.querySelectorAll('.hero-wx .fn')].pop();arc.style.bottom=Math.round(hr.bottom-fr.top-34)+'px';if(hl)arc.style.top=Math.round(hl.getBoundingClientRect().bottom-hr.top+16)+'px'}
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
 const z=v==='w'?48:34;
 s+='<div class="sky-b '+(day?'sky-sun':'sky-moon')+'" style="left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%;opacity:'+(covered?.4:1)+'">'+(day?sunSvg(k.sun.alt<8,z*1.5):moonSvg(k.moon.frac,k.moon.waxing,z))+'</div>';
 return'<div class="arc '+v+'" aria-hidden="true">'+s+'</div>'}
// b (vald): bågen i högra delen av rutan bakom temperaturen; a = bågen tätt över hundarna
let BAKGRUND=lsGet('bakgrund')!=='0';
const GRASS_V=lsGet('grass')==='a'?'a':'b',grassOn=()=>NY||!wallBoardOn();
// på väggtavlan ligger solbanan inne i bilden (variant a), eftersom hörnet uppe till höger har klockan och kugghjulet
const grassV=()=>wallBoardOn()?'a':GRASS_V;
function heroHtml(){const n=new Date(),t=today(),dy=EXT.day&&EXT.day.date===t?EXT.day:null,hh=n.getHours(),W=wxModel(),P=WX_POS();
 const greet=hh<5?'God natt':hh<10?'God morgon':hh<17?'Hej':hh<22?'God kväll':'God natt';
 const sun=sunTimes(t,P.lat,P.lon);
 let wx='';
 if(W){const[ic,tx]=symInfo(W.now.s),d0=W.days[0]||{},F=wxToday(W);
  const wb=wallBoardOn(),gs='<div class="gs '+grassV()+(wb?' wb':'')+'">'+(grassV()==='a'?arcHtml(W,'a'):'')+(BAKGRUND?backdropSvg(wxScene(W)):'')+'<div class="fig-box grass" aria-hidden="true">'+figSvg(wxScene(W),{bare:1,patch:1})+'</div></div>';
  wx='<button class="hero-wx'+(wb&&grassOn()?' wbt':'')+'" data-act="nav" data-id="vader" aria-label="Väder: '+esc(tx)+', '+deg(W.now.T)+'. Öppna vädret">'+
   '<div class="wx-now"><span class="wx-ic" aria-hidden="true">'+ic+'</span><span class="wx-t num">'+deg(W.now.T)+'</span></div>'+
   '<div class="fn">'+esc(tx)+'</div><div class="fn num">H:'+deg(d0.max)+' L:'+deg(d0.min)+'</div>'+
   (grassOn()&&!wb?gs:'')+(grassOn()?'':'<div class="fig-box" aria-hidden="true">'+figSvg(wxScene(W),{bare:1})+'</div>')+'<div class="fig-tip">'+esc((F.when==='i morgon'?'I morgon: ':'')+F.tip)+'</div></button>'+
   // väggtavlan: vädret uppe till höger, bilden längst ner ovanför regnraden
   (grassOn()&&wb?'<button class="hero-pic" data-act="nav" data-id="vader" aria-label="Öppna vädret">'+gs+'</button>':'')}
 const ny=NY&&!wallBoardOn(),facts=ny?[]:['Vecka '+isoWeek(n)];
 if(dy&&dy.holiday)facts.push(dy.holiday);else if(dy&&dy.flag)facts.push('Flaggdag: '+dy.flag);
 // I nya designen står solen före namnsdagen
 const nd=dy&&dy.names.length?'Namnsdag: '+dy.names.join(', '):'',so=sun?'Sol '+hhmm(sun[0])+'–'+hhmm(sun[1]):'';
 (ny?[so,nd]:[nd,so]).filter(Boolean).forEach(f=>facts.push(f));
 return'<section class="hero'+(wx?' has-wx':'')+'">'+(W?(grassOn()?(grassV()==='b'?arcHtml(W,'b'):''):skyHtml(W)):'')+'<div class="hero-l"><div class="clock num" id="clock">'+pad(hh)+':'+pad(n.getMinutes())+'</div><div class="hero-date">'+esc(cap(dayHead(t)))+'</div>'+(ny?'<div class="hero-date">Vecka '+isoWeek(n)+'</div>':'')+
  '<div class="hero-greet">'+greet+(S.me?', '+esc(S.me):'')+'!</div><div class="hero-facts">'+facts.map(f=>'<span>'+esc(f)+'</span>').join('')+'</div></div>'+wx+'</section>'}
async function loadExt(){const t=today();let changed=await loadWx();if(await loadPast())changed=true;
 if(!EXT.day||EXT.day.date!==t){try{const[y,mo,d]=t.split('-');
  const r=await fetch('https://sholiday.faboul.se/dagar/v2.1/'+y+'/'+mo+'/'+d);const j=await r.json(),x=j.dagar&&j.dagar[0];
  if(x){EXT.day={date:t,names:x.namnsdag||[],holiday:x.helgdag||'',flag:x.flaggdag||''};changed=true}}catch(e){}}
 if(changed){lsSet('ext',JSON.stringify(EXT));if(S.view==='oversikt'||S.view==='vader')render()}}
loadExt();setInterval(loadExt,10*60000);

// Vilka hundar som visas: växlar var tredje timme, oftast båda
// a/b = fawn/svart sittande, A/B = liggande och sovande; ordningen är från vänster
let HUNDAR=['bada','brun','svart'].includes(lsGet('hundar'))?lsGet('hundar'):'vaxla';
const figVariants=sleep=>sleep?['AB','AB','BA','A','B']:['ab','ab','ab','ba','ba','a','a','b','b'];
function figVariant(sc){const L=figVariants(sc.sleep);if(S.wxVar&&L.includes(S.wxVar))return S.wxVar;
 if(HUNDAR!=='vaxla'){const v={bada:'ab',brun:'a',svart:'b'}[HUNDAR];return sc.sleep?v.toUpperCase():v}const n=new Date(),key=today()+'|'+Math.floor(n.getHours()/3)+'|'+(sc.sleep?1:0);let h=0;for(const c of key)h=(h*31+c.charCodeAt(0))>>>0;return L[h%L.length]}
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
/* Vädervyn utan hundar (val i Inställningar, ls ht.wxvy): dagens temperaturkurva i stället för bilden */
let WXVY=lsGet('wxvy')==='bild'?'bild':'kurva';
// Hur en låst rätt visas på veckosedeln: streck runt hela rätten (rad) eller runt bilden (bild). Gäller den här enheten
let LASSTIL=lsGet('lasstil')==='bild'?'bild':'rad';
// UI 2.0 med dagskurvan: ikonen står i Nu-kolumnen, så här står bara väderläget i text
function wxTopHtml(W,P,ic,tx,d0,noIc,extra){return'<div class="wx2-top"><div><div class="wx-place">'+esc(P.name)+'</div><div class="wx-big num" id="lt">'+deg(W.now.T)+'</div></div>'+
  '<div class="wx2-r"><div class="wx2-cond">'+(noIc?'':'<span aria-hidden="true">'+ic+'</span>')+esc(tx)+'</div><div class="wx-hl num">H:'+deg(d0.max)+'  L:'+deg(d0.min)+'</div>'+(extra||'')+'</div></div>'}
function wxBarHtml(W,F){return'<div class="wx2-bar"><div><b>'+esc(capS(F.when))+'</b><span>'+esc(F.tip)+'</span></div><div><b>Vind</b><span>'+esc(windText(W.now))+'</span></div></div>'}
/* Dagskurvan: temperaturkurvan överst och timmarna i tretimmarssteg under, i samma remsa som scrollar i sidled.
   Åtta steg (24 timmar) ryms i bredd. Remsan börjar vid Nu; till vänster ligger det senaste dygnet (svagare), till höger upp till 48 timmar framåt.
   Kurvan ritas timme för timme och följer med när man scrollar. Tryck på ett steg för att se dess väder under remsan.
   Raden under remsan upprepar inte det som redan syns: grader står i kolumnerna, vinden nu i Vind-rutan. */
let WXC_H=[],WXC_SW=40,WXC_NP=0;
// stegens längd: 3 timmar eller 1 timme (knappen 3 h/1 h, sparas på enheten)
let WXC_K=lsGet('wxsteg')==='1'?1:3;
function wxHours(W){const L=[];for(const x of (W.all||W.hours)){const p=L[L.length-1];if(p&&x.d-p.d>36e5*1.5)break;L.push(x);if(L.length>=48)break}return L}
// passerade timmar, en hel timme i taget bakåt från första prognostimmen, högst ett dygn och i hela tretimmarssteg
function wxPast(H0){const p=EXT.past;if(!p||!p.ts)return[];const by={};p.ts.forEach(x=>{by[Date.parse(x.t)]=x});
 const L=[];for(let k=1;k<=24;k++){const t=H0.d.getTime()-k*36e5,x=by[t];if(!x)break;L.unshift(Object.assign({},x,{d:new Date(t),past:1}))}
 return L.slice(L.length%3)}
// natt eller dag efter solens verkliga tider, inte efter prognosens symbolnamn
function wxDayNight(x,P,t){const st=sunTimes(ymd(t),P.lat,P.lon),b=symBase(x.s);if(!st||/_polartwilight$/.test(x.s||''))return x;const up=t>=st[0]&&t<=st[1];
 return Object.assign({},x,{s:b+(/^(clearsky|fair|partlycloudy)$|showers/.test(b)?(up?'_day':'_night'):'')})}
// ett steg = tre timmar (eller en): väder och temperatur från första timmen, nederbörden summerad
function wxSegs(H,k){const G=[];for(let i=0;i+k-1<H.length;i+=k){const g=H.slice(i,i+k);G.push(Object.assign({},g[0],{pr:g.reduce((a,x)=>a+(x.pr||0),0),hr:i}))}return G}
function wxHrInfo(x,k){const K=WXC_K,t=symInfo(x.s)[1],e=new Date(x.d.getTime()+K*36e5),pr=x.pr>=.1?mm(x.pr)+(x.past?' föll':' nederbörd'):'Uppehåll';
 // Nu: temperaturen, väderläget och vinden syns redan ovanför och i Vind-rutan
 if(k===WXC_NP)return'<b>Nu</b><span>Känns som '+deg(feels(x.T,x.w||0))+'</span><span>'+pr+(K===1?' den närmaste timmen':' de närmaste tre timmarna')+'</span>';
 return'<b>Kl '+pad(x.d.getHours())+(K===1?'':'–'+pad(e.getHours()))+(ymd(x.d)!==today()?' '+DAYS3[x.d.getDay()]:'')+'</b>'+(t?'<span>'+esc(t)+'</span>':'')+
  '<span>Känns som '+deg(feels(x.T,x.w||0))+'</span><span>'+esc(windText(x))+'</span><span>'+pr+'</span>'}
function wxHeroC(W,P,ic,tx,d0,F,sun){const K=WXC_K,F0=wxHours(W),PA=wxPast(F0[0]),H=PA.concat(F0),np=WXC_NP=PA.length/K,G=WXC_H=wxSegs(H,K).map(x=>wxDayNight(x,P,new Date(x.d.getTime()+K*30*6e4)));
 // åtta steg ska rymmas i kortets bredd
 const mw=(document.getElementById('main')||document.querySelector('main')||document.body).clientWidth||innerWidth;
 const cw=WXC_SW=Math.max(36,Math.floor((Math.min(mw,700)-64)/8*10)/10),hw=cw/K,n=G.length,w=n*cw,h=182,yT=24,yB=70,base=88,f=v=>v.toFixed(1);
 const HX=j=>cw/2+j*hw,lo=Math.min(...H.map(x=>x.T)),hi=Math.max(...H.map(x=>x.T)),sp=Math.max(4,hi-lo),Y=T=>yB-(T-lo)/sp*(yB-yT);
 const m=Math.min(H.length,(n-1)*K+1),pts=H.slice(0,m).map((x,j)=>[HX(j),Y(x.T)]);
 // mjuk kurva timme för timme; det som har varit ritas svagare
 const curve=(a,b)=>{let d='M'+f(pts[a][0])+' '+f(pts[a][1]);
  for(let i=a;i<b;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
   d+=' C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1])}return d};
 const nh=np*K,d=curve(0,pts.length-1),dPast=nh?curve(0,nh):'',dNow=curve(nh,pts.length-1);
 const gid='wc'+(++FIG_N),t0=H[0].d.getTime(),tX=t=>HX(0)+(t-t0)/36e5*hw,xe=pts[pts.length-1][0];
 let s='<svg width="'+f(w)+'" height="'+h+'" viewBox="0 0 '+f(w)+' '+h+'" class="wxC-svg"><defs><linearGradient id="'+gid+'" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+f(w)+'" y2="0">'+pts.map((p,j)=>'<stop offset="'+(p[0]/w).toFixed(4)+'" stop-color="'+tempCol(H[j].T)+'"/>').join('')+'</linearGradient>'+
  '<linearGradient id="'+gid+'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".10"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>';
 // natten: från solnedgången till soluppgången
 const sunM=[];
 for(let k=-2;k<3;k++){const st=sunTimes(addDays(today(),k),P.lat,P.lon),nx=sunTimes(addDays(today(),k+1),P.lat,P.lon);if(!st)continue;
  sunM.push([st[0],'↑'],[st[1],'↓']);if(nx){const a=Math.max(0,tX(st[1].getTime())),b=Math.min(w,tX(nx[0].getTime()));if(b>a)s+='<rect x="'+f(a)+'" y="0" width="'+f(b-a)+'" height="'+h+'" class="wxC-night"/>'}}
 sunM.forEach(([t,a])=>{const xx=tX(t.getTime());if(xx<4||xx>w-4)return;s+='<line x1="'+f(xx)+'" x2="'+f(xx)+'" y1="14" y2="'+base+'" class="wxC-sun"/><text x="'+f(xx)+'" y="9" class="wxC-st">'+a+' '+hhmm(t)+'</text>'});
 const sel=Math.max(0,Math.min(np+(S.wxSel||0),n-1));
 s+='<path d="'+d+' L'+f(xe)+' '+base+' L'+f(HX(0))+' '+base+'Z" fill="url(#'+gid+'f)"/><rect class="wxC-sel" x="'+f(sel*cw)+'" y="0" width="'+f(cw)+'" height="'+h+'" rx="12"/>'+
  (dPast?'<path d="'+dPast+'" fill="none" stroke="url(#'+gid+')" stroke-width="3" stroke-linecap="round" class="wxC-was"/>':'')+
  '<path d="'+dNow+'" fill="none" stroke="url(#'+gid+')" stroke-width="3" stroke-linecap="round"/><line x1="0" x2="'+f(w)+'" y1="'+base+'" y2="'+base+'" class="wxC-base"/>';
 // under kurvan: klockslag, ikon (i HTML), grader och nederbörd per steg
 G.forEach((x,i)=>{const xx=cw*i+cw/2,yy=Y(x.T),nu=i===np,was=i<np?' wxC-was':'';
  if(x.pr>=.1){const bh=Math.min(16,3+x.pr*12/K);s+='<rect x="'+f(xx-6)+'" y="'+f(base-bh)+'" width="12" height="'+f(bh)+'" rx="2.5" class="wxC-pr'+was+'"/>'}
  s+='<circle cx="'+f(xx)+'" cy="'+f(yy)+'" r="'+(nu?5:3)+'" fill="'+(nu?tempCol(x.T):'var(--surface)')+'" stroke="'+tempCol(x.T)+'" stroke-width="2"'+(was?' class="wxC-was"':'')+'/>'+
   '<text x="'+f(xx)+'" y="106" class="wxC-h'+(nu?' nu':'')+was+'">'+(nu?'Nu':pad(x.d.getHours()))+'</text>'+
   '<text x="'+f(xx)+'" y="160" class="wxC-t'+was+'">'+deg(x.T)+'</text>'+
   (x.pr>=.1?'<text x="'+f(xx)+'" y="177" class="wxC-mm'+was+'">'+String(Math.round(x.pr*10)/10).replace('.',',')+'</text>':'')});
 const cols=G.map((x,i)=>'<button class="wxC-col'+(i<np?' wxC-was':'')+'" data-act="wxHr" data-id="'+i+'" style="left:'+f(i*cw)+'px;width:'+f(cw)+'px" aria-label="'+(i===np?'Nu':(i<np?'Var klockan ':'Klockan ')+pad(x.d.getHours()))+', '+deg(x.T)+'"><span>'+symInfo(x.s)[0]+'</span></button>').join('');
 const tg='<div class="wxC-k" role="group" aria-label="Steg i grafen">'+[[3,'3 h'],[1,'1 h']].map(([k,l])=>'<button data-act="wxK" data-id="'+k+'" aria-pressed="'+(K===k)+'">'+l+'</button>').join('')+'</div>';
 return'<section class="wx2 wxC">'+wxTopHtml(W,P,ic,tx,d0,1,tg)+'<div class="wxC-sc"><div class="wxC-in" style="width:'+f(w)+'px">'+s+'</svg>'+cols+'</div></div>'+
  '<div class="wxC-info" aria-live="polite">'+wxHrInfo(G[sel],sel)+'</div>'+wxBarHtml(W,F)+'</section>'}

V.vader=function(){const W=wxModel(),P=WX_POS();
 let h='<div class="rcp-top"><button class="back" data-act="nav" data-id="oversikt">'+I.back+'Översikt</button></div>';
 NB.title='Väder';
 if(!W)return h+'<header class="head"><h1 class="lt" id="lt">Väder</h1></header>'+group(emptyCell('Prognosen kunde inte hämtas just nu.'))+'<div class="block"><button class="btn-tint" style="width:100%" data-act="wxRefresh">Försök igen</button></div>';
 const[ic,tx]=symInfo(W.now.s),d0=W.days[0],F=wxToday(W),sun=sunTimes(today(),P.lat,P.lon);
 // vädret ligger i miljöbilden: ort och temperatur uppe till vänster, väderläget uppe till höger, tips och vind i en remsa nederst
 // UI 2.0: samma bild som på Översikt i större format (träd, kulle och gräsplätt som tonar ut i rutan), råden under bilden
 if(NY&&WXVY==='kurva')h+=wxHeroC(W,P,ic,tx,d0,F,sun);
 else if(NY)h+='<section class="wx2"><div class="wx2-top"><div><div class="wx-place">'+esc(P.name)+'</div><div class="wx-big num" id="lt">'+deg(W.now.T)+'</div></div>'+
  '<div class="wx2-r"><div class="wx2-cond"><span aria-hidden="true">'+ic+'</span>'+esc(tx)+'</div><div class="wx-hl num">H:'+deg(d0.max)+'  L:'+deg(d0.min)+'</div></div></div>'+
  arcHtml(W,'w')+'<div class="gs wx2-gs">'+(BAKGRUND?backdropSvg(wxScene(W)):'')+'<button class="fig-box grass" data-act="wxVar" aria-label="Visa andra hundar">'+figSvg(wxScene(W),{bare:1,patch:1})+'</button></div>'+
  '<div class="wx2-bar"><div><b>'+esc(capS(F.when))+'</b><span>'+esc(F.tip)+'</span></div><div><b>Vind</b><span>'+esc(windText(W.now))+'</span></div></div></section>';
 else h+=wxSceneHtml(W,{h:330,g:100,inner:'<div class="sc-head"><div class="wx-place">'+esc(P.name)+'</div><div class="wx-big num" id="lt">'+deg(W.now.T)+'</div><div><div class="wx-cond">'+esc(tx)+'</div><div class="wx-hl num">H:'+deg(d0.max)+'  L:'+deg(d0.min)+'</div></div></div>'+
  '<div class="sc-bar"><div><b>'+esc(capS(F.when))+'</b><span>'+esc(F.tip)+'</span></div><div><b>Vind</b><span>'+esc(windText(W.now))+'</span></div></div>'});
 // Timmar (ingår i dagskurvan)
 if(!(NY&&WXVY==='kurva'))h+='<div class="group wx-card"><div class="wx-cap">'+I.clock+'Kommande timmar</div><div class="hours" role="list">'+W.hours.slice(0,25).map((x,k)=>{const[ii]=symInfo(x.s);
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
/* Stående överföring från ett låst konto till betalkontot. Gemensamma utgifter dras från kontot
   Våra fasta utgifter, egna utgifter från var och ens konto Mina fasta utgifter. När man bekräftar sparas
   beloppet, perioden och överföringsdagen i c.ov. Ändras något av dem måste överföringen i banken ändras
   också, och då visas utgiften som ändrad tills man bekräftar igen. */
const ovFrom=l=>l==='shared'?'Våra fasta utgifter':'Mina fasta utgifter',ovTo='Betalkontot';
const ovTday=c=>String(c.tday||'').trim()||'28';
const ovState=c=>!c.ov?'saknas':(Number(c.ov.a)!==Number(c.amount)||(c.ov.p||'månad')!==(c.period||'månad')||String(c.ov.d||'28')!==ovTday(c))?'andrad':'ok';
const ovOpen=l=>ekoList(l).filter(c=>ovState(c)!=='ok');
const ovEvery={'månad':'Varje månad','kvartal':'Var tredje månad','år':'En gång om året'};
function costRow(c,list,split){const pm=perMonth(c),meta=[c.pay,dayTxt(c.day),c.note].filter(Boolean).join(' · '),ov=ovState(c);
 return'<button class="cell link'+(ov?' ov-row':'')+'" data-act="ekoCost" data-id="'+esc(c.id)+'" data-list="'+esc(list)+'">'+
  // ett tryck på utropstecknet bekräftar att överföringen är inlagd
  (ov==='ok'?'<span class="ovs ok" aria-label="Stående överföring inlagd">'+I.tick+'</span>':'<span class="ovs tap '+ov+'" data-act="ovDone" data-id="'+esc(c.id)+'" data-list="'+esc(list)+'" role="button" tabindex="0" aria-label="'+(ov==='andrad'?'Bekräfta att överföringen är ändrad':'Bekräfta att stående överföring är inlagd')+'">!</span>')+
  '<div class="grow"><div class="title">'+esc(c.name)+'</div>'+
  (ov&&ov!=='ok'?'<div class="ovtxt">'+(ov==='andrad'?'Uppdatera överföringen':'Stående överföring saknas')+'</div>':'')+
  ((meta||c.period!=='månad')?'<div class="meta">'+(c.period!=='månad'?'<span class="num">'+kr(c.amount)+'/'+esc(c.period)+'</span>':'')+(meta?'<span>'+esc(meta)+'</span>':'')+'</div>':'')+
  (split?'<div class="meta num">'+split.map(x=>'<span class="pc pcn '+pcls(x.p)+'"><span class="pdot '+pcls(x.p)+'"></span>'+kr(pm*x.share)+'</span>').join('')+'</div>':'')+
  '</div><span class="val num">'+kr(pm)+'</span>'+chevron+'</button>'}
function splitPreview(el){const v=Number(String(el.value).replace(/\s/g,'').replace(',','.'))||0,c=ekoCalc(S.ekoMonth||thisMonth()),out=document.getElementById('split-out');
 if(out)out.innerHTML=c.per.map(x=>'<div class="pc '+pcls(x.p)+'"><span class="fn pcn"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+' '+(x.share*100).toFixed(1).replace('.',',')+' %</span><b class="num">'+kr(v*x.share)+'</b></div>').join('')}
function ovWarn(l){const n=ovOpen(l).length;if(!n)return'';
 return'<button class="ov-warn" data-act="ovNext" data-list="'+esc(l)+'"><span class="ovs saknas" aria-hidden="true">!</span><span class="grow"><b>'+(n===1?'1 utgift saknar':n+' utgifter saknar')+' stående överföring</b><span>Lägg in '+(n===1?'den':'dem')+' i banken och bocka av här</span></span>'+chevron+'</button>'}
function ovAllOk(l){const n=ekoList(l).length;return n&&!ovOpen(l).length?'<div class="foot ov-allok">'+I.tick+(n===1?'Har':'Alla '+n+' har')+' en stående överföring från '+esc(ovFrom(l))+'</div>':''}
// I väggläge och på gemensam skärm (ingen vald person) är Ekonomi låst med en kod, oavsett skärmstorlek.
// Låset går i igen när man lämnar Ekonomi. Inga gränser för antal försök.
const EKO_PIN='1912',ekoLocked=()=>(S.wall||!people().includes(S.me))&&!S.ekoOpen;
function ekoLock(){const n=(S.pin||'').length;
 return'<div class="pin'+(S.pinBad?' bad':'')+'"><div class="pin-ic">'+I.lock+'</div><h2>Ekonomi är låst</h2><div class="fn">Skriv koden för att öppna</div>'+
  '<div class="pin-dots" aria-label="'+n+' av 4 siffror">'+[0,1,2,3].map(i=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div>'+
  '<div class="pin-pad">'+['1','2','3','4','5','6','7','8','9','','0','del'].map(k=>k===''?'<span></span>':'<button class="pin-k'+(k==='del'?' del':'')+'" data-act="pin" data-id="'+k+'" aria-label="'+(k==='del'?'Radera':k)+'">'+(k==='del'?'Radera':k)+'</button>').join('')+'</div></div>'}
V.ekonomi=function(){if(ekoLocked())return ekoLock();const m=S.ekoMonth||thisMonth(),c=ekoCalc(m),o=c.o;
 let h=head('Ekonomi',{sub:'Fasta utgifter och fördelning',tools:'<button class="ib plus" data-act="ekoCost" data-list="shared" aria-label="Ny utgift">'+I.plus+'</button>'});
 h+='<div class="mswitch"><button class="ib" data-act="ekoMonth" data-d="-1" aria-label="Förra månaden">'+I.back+'</button><div class="hl">'+esc(cap(monthName(m)))+'</div><button class="ib flip" data-act="ekoMonth" data-d="1" aria-label="Nästa månad">'+I.back+'</button></div>';
 // Inkomst och fördelning
 const pct=x=>(x*100).toFixed(1).replace('.',',')+' %';
 h+=sh('Inkomst',c.own?'<button class="linkbtn" data-act="ekoIncome">Ändra</button>':'');
 if(!c.own)h+='<div class="block" style="padding-top:0"><button class="btn-fill" style="width:100%" data-act="ekoIncome">'+I.plus+'Fyll i inkomst för '+esc(monthName(m))+'</button>'+(c.src?'<div class="foot" style="padding:8px 4px 0">Tills dess räknas med inkomsten från '+esc(monthName(c.src))+'.</div>':'')+'</div>';
 h+='<div class="group"><div class="cell eko-split"><div class="splitbar" role="img" aria-label="Fördelning '+c.per.map(x=>x.p+' '+pct(x.share)).join(', ')+'">'+c.per.map(x=>'<i class="'+pcls(x.p)+'" style="flex:'+Math.max(x.share,.0001)+'"></i>').join('')+'</div>'+
  '<div class="splitleg">'+c.per.map(x=>'<div class="pc '+pcls(x.p)+'"><span class="fn pcn"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+'</span><b class="num">'+nv('e-inc-'+x.p,x.inc,'kr')+'</b><span class="fn num">'+pct(x.share)+'</span></div>').join('')+'</div></div>'+
  '<div class="cell"><span class="grow muted">Totalt</span><span class="val num" style="color:var(--ink)">'+nv('e-inc-tot',c.tot,'kr')+'</span></div></div>';
 // Per person
 h+=sh('Att sätta in varje månad')+'<div class="eko-people">'+c.per.map(x=>{const w=v=>x.inc?Math.max(0,v/x.inc*100):0;
  return'<div class="group eko-card pc '+pcls(x.p)+'"><div class="eko-name"><span class="pdot '+pcls(x.p)+'"></span>'+esc(x.p)+'</div>'+
   '<div class="eko-left"><span class="fn">Kvar efter fasta</span><b class="num'+(x.left<0?' red':'')+'">'+nv('e-left-'+x.p,x.left,'kr')+'</b></div>'+
   '<div class="stack" aria-hidden="true"><i class="'+pcls(x.p)+'" style="width:'+w(x.dep)+'%"></i><i class="'+pcls(x.p)+' soft" style="width:'+w(x.pdep)+'%"></i></div>'+
   '<div class="eko-rows"><div><span><span class="sw '+pcls(x.p)+'"></span>Gemensamma kontot</span><b class="num">'+nv('e-dep-'+x.p,x.dep,'kr')+'</b></div>'+
   '<div><span><span class="sw '+pcls(x.p)+' soft"></span>Egna fasta</span><b class="num">'+nv('e-pdep-'+x.p,x.pdep,'kr')+'</b></div>'+
   '<div class="tot"><span>Summa</span><b class="num">'+nv('e-sum-'+x.p,x.sum,'kr')+'</b></div></div></div>'}).join('')+'</div>';
 h+='<div class="foot">Avrundat uppåt till '+kr(o.round||100)+' med '+(o.buffer!=null?o.buffer:2)+' % buffert, som i kalkylen.</div>';
 // Gemensamma utgifter
 h+='<div class="split"><div class="col">';
 h+=sh('Gemensamma fasta',kr(c.shared)+'/mån')+ovWarn('shared');
 h+=group((o.shared||[]).map(x=>costRow(x,'shared',c.per)).join('')+'<button class="cell link" data-act="ekoCost" data-list="shared"><span class="grow" style="color:var(--accent)">Lägg till utgift</span></button>')+ovAllOk('shared');
 h+='</div><div class="col">';
 people().forEach(p=>{const l=(o.personal||{})[p]||[];h+='<div class="eko-pl pc '+pcls(p)+'">'+sh('<span class="pdot '+pcls(p)+'"></span>'+esc(p)+'s fasta',kr(sumMonth(l))+'/mån')+ovWarn(p)+group(l.map(x=>costRow(x,p)).join('')+'<button class="cell link" data-act="ekoCost" data-list="'+esc(p)+'"><span class="grow eko-add">Lägg till utgift</span></button>')+ovAllOk(p)+'</div>'});
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
// På väggskärmen kan tavlan bli mörk av sig själv: under nattläget och, med kameran påslagen, när rummet är mörkt
const themeNow=()=>wallDark()?'dark':S.theme;
const isDark=()=>themeNow()==='dark'||themeNow()==='system'&&matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(fade){const root=document.documentElement;
 if(fade&&!calm()){root.classList.add('theme-fade');clearTimeout(applyTheme.t);applyTheme.t=setTimeout(()=>root.classList.remove('theme-fade'),450)}
 const th=themeNow();if(th==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',th);
 document.querySelectorAll('meta[name="theme-color"]').forEach(mt=>{const dark=th==='dark'||(th==='system'&&/dark/.test(mt.media));mt.content=dark?'#000000':'#F2F2F7'})}
autoTheme();applyTheme(false);

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
function closeSheets(){S.psel=null;S.protFor=null;S.edit=null;S.rcpSheet=null;S.sheet=null;S.swap=null;S.wishFor=null;S.rate=null;S.ekoEdit=null;S.ovEdit=null;S.shopAdd=false;S.taskAdd=false}

/* ---------- actions ---------- */
function boxEdit(fn){const wall=wallBoardOn(),L=layout(wall,wall?WALL_DEF:OV_DEF());fn(L);saveLayout(wall,L);render()}
const ACT={
 smileyQuick(id,el){const v=Number(el.dataset.v)||0;A.user=Date.now();saveSmiley(id,el.dataset.date,v);markCooked(id,el.dataset.date);toast(v>0?'Vad bra! Rätten kommer tillbaka lite oftare':v<0?'Noterat. Rätten kommer tillbaka mer sällan':'Tack!')},
 smileySkip(id,el){A.user=Date.now();saveSmiley(id,el.dataset.date,'x');toast('Okej, den räknas inte som lagad')},
 wakeBoard(){render()},
 nav(id){if(id!=='oversikt')S.arrange=false;if(normView(id)!=='ekonomi'){S.ekoOpen=false;S.pin=''}try{document.activeElement&&document.activeElement.blur()}catch(e){}id=normView(id);S.shopAdd=false;S.taskAdd=false;S.view=id;S.recipe=null;S.confirm=null;lsSet('view',id);try{history.replaceState(null,'','#'+id)}catch(e){}window.scrollTo(0,0);render()},
 refresh(){refresh()},
 settings(){S.sheet='settings';render()},
 farg(){S.sheet='farg';render()},
 // dagskurvan: visa en timmes väder utan att rita om sidan, så att remsan står kvar där man scrollat
 // 3 h/1 h: alla steg byts på en gång. Det valda steget (eller det som står längst till vänster om det valda inte syns)
 // står kvar på samma plats på skärmen, och valet följer med till steget som börjar på samma timme
 wxK(id){const k=Number(id)===1?1:3,o=WXC_K;if(k===o)return;const sc=document.querySelector('.wxC-sc'),cw=WXC_SW,np=WXC_NP;
  const x=sc?sc.scrollLeft:(S.wxX!=null?S.wxX:np*cw),sel=np+(S.wxSel||0),vis=!!sc&&sel*cw>=x-cw/2&&sel*cw<=x+sc.clientWidth-cw;
  const f=vis?sel:Math.round(x/cw),off=f*cw-x,fh=(f-np)*o,sh=(S.wxSel||0)*o;
  WXC_K=k;lsSet('wxsteg',k===1?'1':null);S.wxSel=Math.floor(sh/k);
  const nnp=np*o/k;S.wxX=Math.max(0,(nnp+Math.floor(fh/k))*cw-off);render()},
 wxHr(id){const i=Number(id)||0,x=WXC_H[i];if(!x)return;S.wxSel=i-WXC_NP;const r=document.querySelector('.wxC-sel');if(r)r.setAttribute('x',(i*WXC_SW).toFixed(1));const inf=document.querySelector('.wxC-info');if(inf)inf.innerHTML=wxHrInfo(x,i)},
 lasstil(id){LASSTIL=id==='bild'?'bild':'rad';lsSet('lasstil',LASSTIL==='bild'?'bild':null);render()},
 segstil(id){SEGSTIL=['kapsel','klassisk'].includes(id)?id:'standard';lsSet('segstil',SEGSTIL==='standard'?null:SEGSTIL);applyStil();render()},
 flikrad(id){FLIKRAD=['glas','piller'].includes(id)?id:'fast';lsSet('flikrad',FLIKRAD==='fast'?null:FLIKRAD);applyStil();render()},
 wxvy(id){WXVY=id==='bild'?'bild':'kurva';lsSet('wxvy',WXVY==='bild'?'bild':null);render()},
 hundar(id){HUNDAR=['bada','brun','svart'].includes(id)?id:'vaxla';lsSet('hundar',HUNDAR==='vaxla'?null:HUNDAR);S.wxVar=null;render()},
 accMin(){ACT.accent(ACCENT==='min'?accentKey():'min')},
 accent(id){ACCENT=id==='min'||colOk(id)?id:'vinrod';lsSet('accent',ACCENT==='vinrod'?null:ACCENT);render()},
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
 flStyle(id){FL_STYLE=id==='lista'?'lista':'karusell';lsSet('forslag',FL_STYLE==='lista'?'lista':null);render()},
 calStyle(id){CAL_STYLE=['1','3'].includes(id)?id:'2';lsSet('calStyle',CAL_STYLE==='2'?null:CAL_STYLE);render()},
 theme(id){S.theme=['light','dark'].includes(id)?id:'system';lsSet('theme',S.theme==='system'?null:S.theme);applyTheme(true);render()},
 design(id){NY=id==='ny';lsSet('ny',NY?null:'0');applyNy();render()},
 dev(){DEV=!DEV;lsSet('dev',DEV?'1':null);NY=nyNu();applyNy();if(!DEV&&S.plan&&S.plan!=='auto')S.plan=null;render()},
 wall(){S.wall=!S.wall;lsSet('wall',S.wall?'1':'0');fitScrollbar();hideCursor();wake();autoTheme();applyTheme(true);render();camSample()},
 vagg(){S.sheet='vagg';render()},
 natt(){NATT.on=!NATT.on;saveNatt();autoTheme();render()},
 nattSolv(){NATT.sol=!NATT.sol;lsSet('nattSol',NATT.sol?'1':null);autoTheme();applyTheme(true);render()},
 kamera(){CAM.on=!CAM.on;lsSet('kamera',CAM.on?'1':null);if(!CAM.on){CAM.lvl=null;CAM.dark=false;CAM.err=''}autoTheme();render();camSample()},
 kamDampa(){CAM.dim=!CAM.dim;lsSet('kamDampa',CAM.dim?null:'0');autoTheme()},
 kamGrans(id){CAM.thr=Number(id)||25;lsSet('kamGrans',CAM.thr===25?null:String(CAM.thr));if(CAM.lvl!=null){CAM.dark=CAM.lvl<CAM.thr}autoTheme();render()},
 matTab(id){S.matTab=['recept','bank','efter','inkop'].includes(id)?id:'vecka';lsSet('matTab',S.matTab);S.recipe=null;render()},
 recipe(id){S.view='mat';S.recipe=id;lsSet('view','mat');try{history.replaceState(null,'','#mat')}catch(e){}window.scrollTo(0,0);render()},
 recipeBack(){if(S.recipe)S.recipe=null;else S.plan=false;window.scrollTo(0,0);render()},
 planOpen(){S.plan=true;S.planOpen=null;window.scrollTo(0,0);render()},
 planClose(){S.plan=false;S.planOpen=null;window.scrollTo(0,0);render()},
 planPick(id,el){const P=planState(),k=el.dataset.k;P.val[k]=id;if(P.port){if(el.dataset.n)P.port[k]=Number(el.dataset.n);delete P.mack[k]}planSave(P);S.planOpen=null;render()},
 planByt(id){S.planOpen=S.planOpen===id?null:id;render()},
 planUnpick(id){const P=planState();delete P.val[id];if(P.port)delete P.port[id];planSave(P);S.planOpen=null;render()},
 autoOpen(){S.plan='auto';S.planOpen=null;try{autoFranVecka(autoState())}catch(e){console.warn(e)}window.scrollTo(0,0);render()},
 autoPrio(id){const P=autoState();P.prio=AUTO_W[id]?id:'balans';autoNy(P);render()},
 autoSk(id){const P=autoState();P.skMode=['two','gem'].includes(id)?id:'auto';['sk','sv','sg'].forEach(k=>delete P.lock[k]);autoNy(P);render()},
 autoGor(){const P=autoState();P.gen++;if(P.plan)P.hist=[autoItems(P.plan).filter(x=>!P.lock[x.key]).map(x=>x.id)].concat(P.hist||[]).slice(0,2);PLANP=P;const X=autoCtx(P);P.plan=autoGen(X,P.gen);P.plan.vecka=P.vecka;autoSync(P);PLANP=null;planSave(P);render();toast('Ny vecka föreslagen')},
 autoLock(id){const P=autoState();if(P.lock[id])delete P.lock[id];else P.lock[id]=1;planSave(P);render()},
 autoNasta(id){autoNasta(id)},
 autoSend(){autoSend()},
 portOpen(){S.plan='port';S.planOpen=null;window.scrollTo(0,0);render()},
 portPort(id,el){const P=planState();P.port[id]=Math.max(2,(Number(P.port[id])||2)+Number(el.dataset.d));planSave(P);render()},
 portFler(id,el){const P=planState();P.port[id]=Number(el.dataset.n);planSave(P);render()},
 portMacka(id){const P=planState();if(P.mack[id])delete P.mack[id];else P.mack[id]=1;planSave(P);S.planOpen=null;render()},
 portSend(){portSend()},
 planMore(id){const P=planState();P.seed[id]=(P.seed[id]||0)+1;planSave(P);render()},
 planMack(id){const n=Math.max(0,Math.min(4,Number(id)||0)),P=planState();P.mack=n;VARDAG.slice(4-n).forEach(p=>delete P.val[p.id]);planSave(P);render()},
 planSend(){planSend()},
 protToggle(id){const r=recipeById(id);updJSON('frekvens',{},o=>{const x=o[id]||{};if(x.vp===false)delete x.vp;else x.vp=false;if(!x.t&&r)x.t=r.title;o[id]=x;return o});toast(protOff(id)?'Valfritt protein är avstängt för rätten':'Valfritt protein är på')},
 planProt(id){S.protFor=id;S.sheet='prot';render()},
 protPick(id){const[w,pid]=String(id).split('|'),slot=S.protFor,P=planState(),r=recipeById(P.val[slot]);if(!r)return;const cur=protVal(slot,r);if(!cur)return;
  const val={r:r.id,k:cur.k,v:cur.v};val[w]=pid;P.prot=P.prot||{};P.prot[slot]=val;planSave(P);const m=protMinne();m[r.id]={k:val.k,v:val.v};lsSet('protval',JSON.stringify(m));render()},
 planInfo(id,el){S.plInfo=S.plInfo||{};S.plInfo[id]=!S.plInfo[id];const b=el.closest('.pl-re');if(b)b.classList.toggle('open',S.plInfo[id]);el.setAttribute('aria-expanded',S.plInfo[id])},
 scale(id,el){const r=recipeById(id);const{p}=scaled(r);S.scale[id]=Math.max(1,Math.min(20,p+Number(el.dataset.d)));render()},
 cook(id){S.cook={id,step:S.step[id]||0};wake();render()},
 pickStep(id,el){S.step[id]=Number(el.dataset.i);render();setTimeout(()=>{const li=document.querySelector('.steps li.active');if(li&&li.getBoundingClientRect().top<70)li.scrollIntoView({block:'start',behavior:'smooth'})},30)},
 cookStep(id,el){A.user=Date.now();const r=recipeById(S.cook.id);S.cook.step=Math.max(0,Math.min(stegFor(r).length-1,S.cook.step+Number(el.dataset.d)));S.step[S.cook.id]=S.cook.step;render()},
 fodMode(id){S.fodMode=id;lsSet('fodMode',id);render()},
 fodMon(id){S.fodMon=Number(id);render()},
 ekoMonth(id,el){S.ekoMonth=addMonths(S.ekoMonth||thisMonth(),Number(el.dataset.d));render()},
 ekoIncome(){S.sheet='income';render()},
 ekoCost(id,el){S.ekoEdit={list:el.dataset.list,id:id||null};S.sheet='cost';render()},
 ovShow(id,el){S.ekoEdit=null;S.ovEdit={list:el&&el.dataset.list||'shared',id};S.sheet='ov';render()},
 ovNext(id,el){const l=el&&el.dataset.list||'shared',c=ovOpen(l)[0];if(c)ACT.ovShow(c.id,{dataset:{list:l}})},
 ovGo(id){const[l,cid]=String(id).split('|');ACT.nav('ekonomi');if(!ekoLocked())ACT.ovShow(cid,{dataset:{list:l}})},
 pin(k){S.pinBad=false;S.pin=k==='del'?(S.pin||'').slice(0,-1):((S.pin||'')+k).slice(0,4);
  if(S.pin.length===4){if(S.pin===EKO_PIN){S.ekoOpen=true;S.pin=''}else{S.pinBad=true;S.pin='';setTimeout(()=>{S.pinBad=false;render()},600)}}render()},
 ovLater(){closeSheets();render()},
 ovDone(id,el){const L=el.dataset.list||'shared',c=ekoList(L).find(x=>x.id===id);if(!c)return;closeSheets();A.user=Date.now();
  updJSON('ekonomi',{},o=>{ekoListIn(o,L,l=>l.map(x=>x.id===id?Object.assign({},x,{ov:{a:Number(x.amount),p:x.period||'månad',d:ovTday(x),t:today()}}):x));return o});
  toast(c.name+' är bekräftad')},
 ovUndo(){const e=S.ekoEdit;if(!e||!e.id)return;A.user=Date.now();
  updJSON('ekonomi',{},o=>{ekoListIn(o,e.list,l=>l.map(x=>{if(x.id!==e.id)return x;const y=Object.assign({},x);delete y.ov;return y}));return o})},
 ekoDel(){const e=S.ekoEdit;if(!e||!e.id)return;closeSheets();A.user=Date.now();A.flip=true;
  updJSON('ekonomi',{},o=>{ekoListIn(o,e.list,l=>l.filter(x=>x.id!==e.id));return o});toast('Utgiften är borttagen')},
 wxVar(){const W=wxModel();if(!W)return;const sc=wxScene(W),L=[...new Set(figVariants(sc.sleep))],cur=figVariant(sc);S.wxVar=L[(L.indexOf(cur)+1)%L.length];render()},
 wxRefresh(){loadWx(true).then(ok=>{if(ok){lsSet('ext',JSON.stringify(EXT))}render();if(!ok)toast('Vädret kunde inte hämtas')})},
 cookDone(id){S.cook=null;A.cookStep=null;wake();markCooked(id);ACT.rate(id)},
 rate(id){S.rate={id};S.sheet='rate';render()},
 bankFilter(id){S.bankFilter=id;render()},
 bankAdd(id){addToBank(recipeById(id));render()},
 wish(id){const r=recipeById(id);if(!r||isDessert(r))return;const on=wishes().some(x=>x.id===id);
  if(on){A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>x.id!==id));toast('Borttagen från önskelistan');return}
  S.wishFor=id;S.sheet='wish';render()},
 wishNew(){S.wishFor=null;S.sheet='wish';render()},
 // Till veckosedeln: rätten läggs på en tom plats i rätt grupp, som Lägg till en rätt
 weekAdd(id){const r=recipeById(id);if(!r)return;slotFill(isStorkok(r)?'Storkok':r.group==='Helg'?'Helg':'Vardag',id)},
 weekShow(){S.recipe=null;S.matTab='vecka';lsSet('matTab','vecka');S.view='mat';lsSet('view','mat');window.scrollTo(0,0);render()},
 wishDel(id){const w=wishes()[Number(id)];if(!w)return;A.user=Date.now();updJSON('onskelista',[],a=>a.filter(x=>!(x.t===w.t&&x.d===w.d&&x.slot===w.slot)));toast('Önskemålet är borttaget')},
 swap(id){const m=D().menu[Number(id)];if(!m)return;S.swap={m:Object.assign({},m)};S.psel=null;S.confirm=null;S.sheet='swap';render()},
 // Markera en rad i Välj rätt-bladet utan att rita om det, så att scroll och sökning ligger kvar
 pickSel(id){S.psel=S.psel===id?null:id;const k=document.getElementById('overlay').dataset.k;
  document.querySelectorAll('#overlay [data-act="pickSel"]').forEach(b=>{const on=b.dataset.id===S.psel;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  document.querySelectorAll('#overlay [data-act="pickGo"]').forEach(b=>{b.disabled=!S.psel;b.textContent=pickBtnTxt(k,S.psel)})},
 pickGo(){const id=S.psel,k=document.getElementById('overlay').dataset.k;if(!id)return;S.psel=null;
  if(k==='swap'){const r=recipeById(id);if(r)doSwap(r)}else if(k==='slot')slotFill(S.slotG||'Vardag',id);else if(k==='dess')ACT.dessSet(id)},
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
 shopDel(id){const x=D().shop.find(y=>y.id===id);if(x)delStart([x],x.name+' togs bort')},
 shopUndo(){if(!DEL.items)return;clearTimeout(DEL.t);const keep=new Set(DEL.items.map(x=>x.id)),now=new Set(D().shop.map(x=>x.id));
  S.data.shop=DEL.list.filter(x=>now.has(x.id)||keep.has(x.id)).concat(D().shop.filter(x=>!DEL.list.some(y=>y.id===x.id)));DEL.items=null;DEL.list=null;undoHide();render()},
 shopEmpty(){S.confirm='shopEmpty';render()},
 shopEmptyYes(){S.confirm=null;const all=D().shop.slice();delStart(all,all.length+(all.length===1?' vara':' varor')+' togs bort')},
 shopImport(){S.confirm='shopImport';render()},
 portStep(id,el){const m=D().menu[Number(id)];if(!m)return;const r=m.recipe&&recipeById(m.recipe),n=Math.max(1,Math.min(20,dishPort(m,r)+Number(el.dataset.d)));
  // Skickas direkt: medan ändringen väntar i utkorgen skriver ingen uppdatering från arket över den nya portionen
  m.note=portNote(m,r,n);shopImport(true)},
 wsumMini(){S.wsumOpen=!S.wsumOpen;document.querySelectorAll('.wcard').forEach(c=>{c.classList.toggle('open',S.wsumOpen);const b=c.querySelector('.wm-top');if(b)b.setAttribute('aria-expanded',S.wsumOpen)});wsPin()},
 shopMore(){S.sheet='shopMore';S.shopMoreC=false;render()},
 dessPick(){S.psel=null;S.sheet='dess';render()},
 slotPick(g){S.slotG=g;S.psel=null;S.sheet='slot';render()},
 slotSet(id){slotFill(S.slotG||'Vardag',id)},
 // En låst rätt tas bort först efter att man hållit in Bekräfta i en ruta, som Töm listan i Inköp
 weekDel(id){const m=D().menu[Number(id)];swpCloseAll();if(m&&m.recipe&&weekLocks(weekTarget().vs).has(m.recipe)){S.delAsk=Number(id);S.sheet='delLas';render();return}weekDel(id)},
 weekDelYes(id){S.delAsk=null;weekDel(id)},
 weekLock(id){weekLock(id);document.querySelectorAll('.dr-slide.open,.dr-slide.openl').forEach(x=>swpSet(x,0,true))},
 dessSet(id){closeSheets();setWeekDessert(id);toast('Efterrätten ligger på veckosedeln')},
 dessClear(){setWeekDessert('');toast('Efterrätten är borttagen')},
 dessShop(id){dessertTillInkop(id)},
 shopMoreAsk(){S.shopMoreC=true;render()},
 shopMoreImp(){closeSheets();render();shopImport()},
 shopMoreEmpty(){closeSheets();S.shopMoreC=false;ACT.shopEmptyYes()},
 shopImportYes(){S.confirm=null;shopImport()},
 // Plusknappen i snabbfältet: lägger till det som står i fältet, eller öppnar Ny vara/Ny uppgift när fältet är tomt
 quickGo(_,el){const f=el.closest('form'),v=f&&f.querySelector('.field');if(v&&v.value.trim()){f.requestSubmit?f.requestSubmit():f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return}ACT[el.dataset.alt]()},
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
 cleanDel(id){const t=D().clean.find(x=>x.id===id);if(t)cdelStart(t)},
 cleanDelUndo(){if(!CDEL.item)return;clearTimeout(CDEL.t);const t=CDEL.item,i=CDEL.list.findIndex(x=>x.id===t.id);CDEL.item=null;CDEL.list=null;
  if(!D().clean.some(x=>x.id===t.id))D().clean.splice(Math.max(0,Math.min(i,D().clean.length)),0,t);undoHide();render()},
 cleanFocus(){},
 snooze(id){const v=addDays(today(),1);mutate('clean',id,{snoozeUntil:v});apiPost({action:'cleanSet',id,fields:{snoozeUntil:v}});toast('Flyttad till i morgon')},
 planToday(id){mutate('clean',id,{plannedFor:today(),snoozeUntil:''});apiPost({action:'cleanSet',id,fields:{plannedFor:today(),snoozeUntil:''}})},
 planSat(id){const d=nextSaturday();mutate('clean',id,{plannedFor:d});apiPost({action:'cleanSet',id,fields:{plannedFor:d}});toast('Inplanerad '+dateShort(d))},
 unplan(id){mutate('clean',id,{plannedFor:''});apiPost({action:'cleanSet',id,fields:{plannedFor:''}})},
 orkPick(id){const el=document.getElementById('ork');if(el){el.value=id;orkPreview(el)}ACT.budget(String(ORK[Number(id)].min))},
 budget(id){const v=today()+'|'+id;S.data.settings.stadtid_idag=v;render();apiPost({action:'setting',k:'stadtid_idag',v})}
};
// Knappar med data-hold bekräftas genom att hållas in 1 s. Släpper man eller scrollar avbryts det
(()=>{let h=null,fired=0;const T=1000;
 const stop=()=>{if(!h)return;clearTimeout(h.t);h.el.classList.remove('holding');h=null};
 document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-hold]');if(!el||el.disabled||e.button>0)return;stop();
  el.classList.add('holding');h={el,x:e.clientX,y:e.clientY,t:setTimeout(()=>{const a=el.dataset.hold;stop();fired=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(x){}ACT[a]&&ACT[a](el.dataset.id)},T)}});
 document.addEventListener('pointermove',e=>{if(h&&Math.hypot(e.clientX-h.x,e.clientY-h.y)>12)stop()});
 ['pointerup','pointercancel','scroll'].forEach(k=>document.addEventListener(k,stop,true));
 document.addEventListener('click',e=>{const el=e.target.closest('[data-hold]');if(el&&Date.now()-fired>800)toast('Håll in knappen för att '+({shopEmptyYes:'tömma listan',weekDelYes:'bekräfta',shopImportYes:'uppdatera varorna'}[el.dataset.hold]||'bekräfta'))});
 document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-hold]'))e.preventDefault()})})();
/* Håll in en rätt på veckosedeln för att låsa den: ett streck i accentfärgen ritas runt rätten (eller bilden) på 1 s.
   Släpper man tidigt går strecket tillbaka. En låst rätt låses upp på samma sätt, då backar strecket. Rör man fingret avbryts det */
(()=>{const T=1000,WAIT=120;let h=null,fired=0;
 const rr=(w,h,r,i)=>{const a=i,b=w-i,c=i,d=h-i,m=w/2;return'M'+m+' '+c+'H'+(b-r)+'A'+r+' '+r+' 0 0 1 '+b+' '+(c+r)+'V'+(d-r)+'A'+r+' '+r+' 0 0 1 '+(b-r)+' '+d+'H'+(a+r)+'A'+r+' '+r+' 0 0 1 '+a+' '+(d-r)+'V'+(c+r)+'A'+r+' '+r+' 0 0 1 '+(a+r)+' '+c+'Z'};
 const end=back=>{if(!h)return;const x=h;h=null;clearTimeout(x.w);cancelAnimationFrame(x.raf);
  if(!x.p){return}
  // Har strecket hunnit synas räknas det inte som ett tryck, så receptet öppnas inte när man släpper
  fired=Date.now();
  if(!back){x.p.remove();x.k.classList.remove('lk-anim');return}
  // Strecket glider tillbaka till där det började
  const to=x.lst?1:0;let last=performance.now();const f=t=>{const dt=Math.max(0,t-last);last=t;x.v=x.v<to?Math.min(to,x.v+dt/250):Math.max(to,x.v-dt/250);x.p.style.strokeDasharray=x.v+' 2';x.p.style.strokeOpacity=x.v<.002?0:1;
   if(x.v!==to)requestAnimationFrame(f);else{x.p.parentNode.remove();x.k.classList.remove('lk-anim')}};requestAnimationFrame(f)};
 const start=x=>{const k=x.k,w=k.offsetWidth,ht=k.offsetHeight,rad=k.classList.contains('lk-rad');
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg'),p=document.createElementNS(NS,'path');svg.setAttribute('class','lk-svg');svg.setAttribute('aria-hidden','true');
  p.setAttribute('d',rr(w,ht,rad?12:13,rad?2:-1.5));p.setAttribute('pathLength','1');svg.appendChild(p);k.appendChild(svg);k.classList.add('lk-anim');
  x.p=p;x.v=x.lst?1:0;p.style.strokeDasharray=x.v+' 2';p.style.strokeOpacity=x.v<.002?0:1;let last=performance.now();
  const f=t=>{if(h!==x)return;const dt=Math.max(0,Math.min(50,t-last));last=t;x.v=Math.max(0,Math.min(1,x.v+(x.lst?-1:1)*dt/T));
   if(x.lst?x.v<=0:x.v>=1){p.style.strokeDasharray=x.v+' 2';fired=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}
    if(x.lst)k.classList.remove('lk-on');else k.classList.add('lk-on');end(false);if(x.row.dataset.lockAct)ACT[x.row.dataset.lockAct](x.id);else weekLock(x.id);return}
   p.style.strokeDasharray=x.v+' 2';p.style.strokeOpacity=x.v<.002?0:1;x.raf=requestAnimationFrame(f)};x.raf=requestAnimationFrame(f)};
 document.addEventListener('pointerdown',e=>{if(e.button>0)return;const row=e.target.closest('[data-hold-lock]');if(!row||e.target.closest('.pl-step,.dr-byt,.dr-act,.dr-actl,.dess-x'))return;
  if(row.classList.contains('open')||row.classList.contains('openl'))return;end(true);
  const k=row.querySelector('[data-lk]')||row;h={row,k,id:row.dataset.holdLock,lst:k.classList.contains('lk-on'),x:e.clientX,y:e.clientY};const x=h;x.w=setTimeout(()=>{if(h===x)start(x)},WAIT)});
 document.addEventListener('pointermove',e=>{if(h&&Math.hypot(e.clientX-h.x,e.clientY-h.y)>10)end(true)},{passive:true});
 ['pointerup','pointercancel'].forEach(k=>document.addEventListener(k,()=>end(true),true));document.addEventListener('scroll',()=>end(true),{capture:true,passive:true});
 // Efter en låsning ska fingret som släpps inte öppna receptet
 document.addEventListener('click',e=>{if(Date.now()-fired<700&&e.target.closest('[data-hold-lock]')){e.stopPropagation();e.preventDefault()}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-hold-lock]'))e.preventDefault()})})();
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act;if(!ACT[a])return;
 if(el.tagName==='INPUT'&&el.type==='checkbox')e.preventDefault();
 ACT[a](el.dataset.id,el,e)});
// Kom ihåg vilka hopfällbara sektioner som är öppna mellan renderingar
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.k)S.open[d.dataset.k]=d.open},true);
document.addEventListener('change',e=>{if(e.target.id==='ee-allday'){const t=document.getElementById('ee-times');if(t)t.hidden=e.target.checked}});
/* Svep på veckosedelns rader, som i iPhones listor: dra åt vänster så visas Byt bakom raden,
   dra åt höger så visas Ta bort. Drar man hela vägen (över halva raden) byter eller tar man bort direkt. Bara en rad är öppen åt gången */
const SWP={el:null,x:0,y:0,base:0,dx:0,dir:'',moved:false};const SWW=84;
const swpW=el=>Number(el.dataset.w)||SWW,swpFull=el=>Math.max(el.offsetWidth*0.5,swpW(el)+50);
const swpB=el=>el.parentElement&&el.parentElement.querySelector(':scope>.dr-act'),swpL=el=>el.parentElement&&el.parentElement.querySelector(':scope>.dr-actl');
function swpSet(el,x,anim){const b=swpB(el),l=swpL(el),t=anim?'.25s cubic-bezier(.2,.8,.2,1)':'0s';
 el.style.transition='transform '+t;el.style.transform=x?'translateX('+x+'px)':'';el.classList.toggle('open',x<0);el.classList.toggle('openl',x>0);
 if(b){b.style.transition='width '+t;b.style.width=Math.max(swpW(el),-x)+'px';b.classList.toggle('full',-x>swpFull(el))}
 if(l){l.style.transition='width '+t;l.style.width=Math.max(SWW,x)+'px';l.classList.toggle('full',x>Math.max(el.offsetWidth*0.5,SWW+50))}}
function swpCloseAll(ex){document.querySelectorAll('.dr-slide.open,.dr-slide.openl').forEach(x=>{if(x!==ex)swpSet(x,0,true)})}
document.addEventListener('touchstart',e=>{SWP.el=null;if(e.target.closest('.dr-act'))return;const el=e.target.closest('.dr-slide');if(!el){swpCloseAll();return}const t=e.touches[0];
 swpCloseAll(el);Object.assign(SWP,{el,x:t.clientX,y:t.clientY,base:el.classList.contains('open')?-swpW(el):el.classList.contains('openl')?SWW:0,dx:0,dir:'',moved:false})},{passive:true});
document.addEventListener('touchmove',e=>{const el=SWP.el;if(!el)return;const t=e.touches[0],dx=t.clientX-SWP.x,dy=t.clientY-SWP.y;
 if(!SWP.dir&&Math.abs(dx)+Math.abs(dy)>8)SWP.dir=Math.abs(dx)>Math.abs(dy)?'x':'y';if(SWP.dir!=='x')return;
 SWP.moved=true;SWP.dx=dx;swpSet(el,Math.min(swpL(el)?el.offsetWidth:0,Math.max(-el.offsetWidth,SWP.base+dx)),false)},{passive:true});
document.addEventListener('touchend',()=>{const el=SWP.el;if(!el)return;SWP.el=null;if(SWP.dir!=='x')return;
 const x=SWP.base+SWP.dx,w=el.offsetWidth,b=swpB(el),l=swpL(el);
 if(x<-swpFull(el)&&b){swpSet(el,-w,true);if(navigator.vibrate)navigator.vibrate(10);setTimeout(()=>{ACT[b.dataset.full||'swap'](b.dataset.id)},180);return}
 // Hela vägen åt höger tar bort rätten
 if(l&&x>Math.max(w*0.5,SWW+50)){if(navigator.vibrate)navigator.vibrate(10);swpSet(el,0,true);setTimeout(()=>ACT[l.dataset.act](l.dataset.id),200);return}
 const ow=swpW(el);swpSet(el,x<-ow/2?-ow:l&&x>SWW/2?SWW:0,true)});
// Planera veckan: visa den lilla budgetraden när den stora rutan har gått in under navigeringsfältet
function plPin(){const m=document.querySelector('.pl-mini'),b=document.querySelector('.pl-bud');if(!m||!b)return;const nb=document.getElementById('navbar'),top=nb?nb.getBoundingClientRect().bottom:0;m.classList.toggle('show',b.getBoundingClientRect().bottom<top+4)}
// Veckosedeln: kopian av översta raden visas när rutan når navigeringsfältet och krymper lite (--k går 0→1) ju längre man scrollar
function wsPin(){const c=document.querySelector('.ws-card'),m=document.querySelector('.ws-mini');if(!c||!m)return;const nb=document.getElementById('navbar'),top=nb?nb.getBoundingClientRect().bottom:0;
 const d=top-c.getBoundingClientRect().top,on=d>=0&&scrollY>0;m.classList.toggle('show',on);m.style.setProperty('--k',on?Math.min(1,d/90).toFixed(3):0)}
document.addEventListener('scroll',plPin,{passive:true});document.addEventListener('scroll',wsPin,{passive:true});if(window.visualViewport)visualViewport.addEventListener('resize',plPin);
// iPhone: ibland hamnar skärmen förskjuten mot sidan (oftast efter tangentbordet), och då följer flikraden och listen
// högst upp med när man scrollar. Vi mäter förskjutningen och flyttar tillbaka dem till skärmens kanter
function vvFix(){const v=window.visualViewport,r=document.documentElement;if(!v)return;
 const a=document.activeElement,typing=a&&a.matches&&a.matches('input,textarea,select,[contenteditable]');
 let t=0,b=0;
 // när sidan dras ner förbi toppen blir offsetTop negativt; då ska menyerna ligga kvar.
 // Längst ner studsar sidan förbi botten och då blir offsetTop positivt en stund; det är ingen förskjutning att rätta
 const botten=scrollY+innerHeight>=document.documentElement.scrollHeight-2;
 if(!typing&&v.scale<1.01&&scrollY>=0&&!botten){t=Math.max(0,Math.round(v.offsetTop));if(t<2)t=0;b=t}
 r.style.setProperty('--vvt',t+'px');r.style.setProperty('--vvb',b+'px')}
if(window.visualViewport){visualViewport.addEventListener('resize',vvFix);visualViewport.addEventListener('scroll',vvFix)}
document.addEventListener('scroll',vvFix,{passive:true});document.addEventListener('focusin',vvFix);document.addEventListener('touchend',()=>[0,200,600].forEach(t=>setTimeout(vvFix,t)),{passive:true});document.addEventListener('focusout',()=>[0,120,450].forEach(t=>setTimeout(vvFix,t)));
document.addEventListener('touchcancel',()=>{if(SWP.el){swpSet(SWP.el,0,true);SWP.el=null}},{passive:true});
// Ett svep ska inte räknas som ett tryck på raden, och ett tryck på en öppen rad stänger den
document.addEventListener('click',e=>{const el=e.target.closest('.dr-slide');if(!el)return;
 if(SWP.moved){SWP.moved=false;e.stopPropagation();e.preventDefault();return}
 if(el.classList.contains('open')||el.classList.contains('openl')){e.stopPropagation();e.preventDefault();swpSet(el,0,true)}},true);
// Dagraden i kalenderrutan minns var man svepte, så att den inte hoppar tillbaka när sidan ritas om
document.addEventListener('scroll',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('wk-sw')){S.wkX=t.scrollLeft;wkMonth(t)}if(t&&t.classList&&t.classList.contains('wxC-sc'))S.wxX=t.scrollLeft;},true);
// Månaden bredvid Schema följer de dagar som syns i raden
function wkMonth(w){const ds=w.querySelectorAll('.wk-d'),mo=w.closest('.calw')&&w.closest('.calw').querySelector('.wk-mo');if(!ds.length||!mo)return;
 const i=Math.min(ds.length-1,Math.round(w.scrollLeft/ds[0].offsetWidth)+3),k=ds[i].dataset.id;if(isDate(k))mo.textContent=MON[parse(k).getMonth()]}
document.addEventListener('input',e=>{if(e.target.id==='sw-q'){const q=e.target.value.trim().toLowerCase();let n=0;document.querySelectorAll('#overlay .sw-row').forEach(b=>{const ok=!q||b.dataset.q.includes(q);b.hidden=!ok;if(ok)n++});const f=document.querySelector('#overlay .sw-none');if(f)f.hidden=n>0;return}
 if(e.target.classList.contains('smc-sl')){const f=e.target.closest('.smc-r').querySelector('.smc-face');if(f)f.textContent=SMIL[Number(e.target.value)+1][1]}
 if(e.target.id==='ork')orkPreview(e.target);if(e.target.id==='split-amt')splitPreview(e.target)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(!el)return;const id=el.dataset.id;
 // färgraden: ett val fäller ut tonerna av färgen under raden
 {const sp=el.closest('[data-strip]');if(sp&&!FARG_OPEN[sp.dataset.strip]){FARG_OPEN[sp.dataset.strip]=2;FARG_X[sp.dataset.strip]=sp.scrollLeft}else if(sp)FARG_X[sp.dataset.strip]=sp.scrollLeft}
 if(el.dataset.change==='photo'){const f=el.files&&el.files[0];el.value='';if(S.rcpSheet){S.rcpSheet=null;render()}uploadPhoto(id,f);return}
 if(el.dataset.change==='ork'){el.blur();ACT.budget(String(ORK[Number(el.value)].min));return}
 if(el.dataset.change==='accent'){ACT.accent(el.value);return}
 if(el.dataset.change==='nattA'||el.dataset.change==='nattB'){// klockslaget skrivs in fritt: 22:00, 22.00, 2200 eller bara 22
 const k=el.dataset.change==='nattA'?'a':'b',v=String(el.value||'').trim(),m=/^(\d{1,2})(?:[:.,\s]?(\d{2}))?$/.exec(v);
 if(!m||+m[1]>23||+(m[2]||0)>59){el.value=nattTid(NATT[k]);toast('Skriv klockslaget som till exempel 22:00');return}
 NATT[k]=+m[1]*60+ +(m[2]||0);el.value=nattTid(NATT[k]);saveNatt();autoTheme();applyTheme(true);return}
 if(el.dataset.change==='pcol'){setPcol(Number(id),el.value);return}
 if(el.dataset.change==='planBudget'){const v=Math.round(Number(el.value));if(!(v>=200&&v<=5000)){toast('Skriv en budget mellan 200 och 5 000 kr');render();return}settings().matbudget=String(v);render();apiPost({action:'setting',k:'matbudget',v:String(v)});return}
  if(el.dataset.change==='eko'){const v=Math.max(0,Number(String(el.value).replace(',','.'))||0);updJSON('ekonomi',{},o=>{o[id]=v;return o});return}
 const f=el.dataset.change==='freq'?{freq:Number(el.value)}:el.dataset.change==='min'?{min:Number(el.value)}:{who:el.value};mutate('clean',id,f);apiPost({action:'cleanSet',id,fields:f})});
document.addEventListener('submit',async e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const d=Object.fromEntries(new FormData(f));
 if(f.dataset.form==='setup'){S.key=String(d.key||'').trim().toLowerCase();S.error='';S.sync='busy';render();
  try{const data=await apiGet();lsSet('key',S.key);setData(data);S.sync='idle';if(!S.me)S.sheet='settings'}catch(err){S.error=err.message;S.key=''}render();return}
 // Snabbfältet i Inköp (nya designen): bara namnet, avdelningen räknas fram och fältet står kvar för nästa vara
 if(f.dataset.form==='shopQuick'){const n=String(d.name||'').trim();if(!n)return;const cat=katGissa(n);
  D().shop.push({id:'tmp'+Date.now(),done:false,name:n,qty:'',cat,meals:[],price:null,offer:'',source:'egen',addedBy:S.me,order:1000});
  render();setTimeout(()=>document.querySelector('.add-row .field')?.focus(),30);apiPost({action:'shopAdd',name:n,qty:'',cat,price:''});return}
 if(f.dataset.form==='shop'){if(!d.name.trim())return;const price=parseFloat(String(d.price||'').replace(',','.'));
  const cat=d.cat||katGissa(d.name);D().shop.push({id:'tmp'+Date.now(),done:false,name:d.name.trim(),qty:d.qty.trim(),cat,meals:[],price:isNaN(price)?null:price,offer:'',source:'egen',addedBy:S.me,order:1000});
  f.reset();render();setTimeout(()=>document.getElementById('shop-name')?.focus(),30);
  apiPost({action:'shopAdd',name:d.name.trim(),qty:d.qty.trim(),cat,price:isNaN(price)?'':price});toast('Tillagd')}
 // Snabbfältet i Uppgifter (nya designen): utan datum och person, de går att lägga till genom att trycka på uppgiften
 // Ny syssla i ett rum. Id:t skapas här så att sysslan går att ändra direkt
 if(f.dataset.form==='cleanQuick'){const t=String(d.title||'').trim(),room=f.dataset.room||rumGissa(t);if(!t)return;
  const id='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  D().clean.push({id,room,title:t,freq:7,min:10,lastDone:'',prevDone:'',doneBy:'',who:'',tip:'',plannedFor:'',snoozeUntil:'',order:null});S.open.all=true;render();
  setTimeout(()=>{const x=document.querySelector('form[data-form="cleanQuick"][data-room="'+f.dataset.room+'"] .field');if(x)x.focus()},30);
  apiPost({action:'cleanAdd',id,room,title:t,freq:7,min:10});toast('Tillagd i '+room);return}
 if(f.dataset.form==='taskQuick'){const t=String(d.title||'').trim();if(!t)return;
  D().tasks.push({id:'tmp'+Date.now(),done:false,title:t,due:'',who:'',note:'',source:'egen',repeat:''});render();
  setTimeout(()=>document.querySelector('.add-row .field')?.focus(),30);apiPost({action:'taskAdd',title:t,due:'',who:'',repeat:''});return}
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
  const old=e.id?ekoList(e.list).find(x=>x.id===e.id):null;
  const c={id:e.id||('x'+Date.now().toString(36)),name:d.name.trim(),amount:amt,period:d.period||'månad',pay:d.pay||'',day:String(d.day||'').trim(),note:String(d.note||'').trim(),tday:String(d.tday||'').trim()};
  const to=d.owner||e.list||'shared',moved=e.id&&to!==e.list;
  if(old&&old.ov&&!moved)c.ov=old.ov;   // flyttas utgiften dras den från ett annat konto, så då behövs en ny överföring
  closeSheets();A.user=Date.now();A.flip=true;
  // en ny utgift, eller en vars belopp, period eller överföringsdag ändrats, behöver en stående överföring
  if(ovState(c)!=='ok'&&(!old||moved||ovState(old)==='ok')){S.ovEdit={list:to,id:c.id};S.sheet='ov'}
  updJSON('ekonomi',{},o=>{if(moved)ekoListIn(o,e.list,l=>l.filter(x=>x.id!==c.id));ekoListIn(o,to,l=>l.some(x=>x.id===c.id)?l.map(x=>x.id===c.id?c:x):l.concat([c]));return o});
  if(S.sheet!=='ov')toast(moved?'Flyttad till '+(to==='shared'?'gemensamma':to+'s')+' utgifter':e.id?'Sparat':'Utgiften är tillagd');return}
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
 if(f.dataset.form==='settings'){const p=[[d.p1.trim()||'Henrik',d.c1],[d.p2.trim()||'Cornelia',d.c2]].map(([n,c])=>n.replace(/[:,]/g,' ').trim()+(colOk(c)?':'+c:'')).join(', ');const st=settings();
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
 const ni=document.querySelector('.night-in');if(ni){const h=String(new Date().getHours());if(ni.dataset.h!==h){ni.dataset.h=h;ni.style.transform=nightPos()}}
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
