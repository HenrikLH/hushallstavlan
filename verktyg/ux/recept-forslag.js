/* Fristående, granskbar UX-prototyp. Laddas enbart av recept-forslag.js i emulatorn.
   Återanvänder appens CSS/ikoner. Testdata och filter stannar i minnet; ingen API-skrivning. */
(()=>{
 const d=s=>window.__d(s),I=d('I'),esc=d('esc'),tabs=[['recept','Inspiration'],['bank','Mina recept'],['efter','Efterrätter']];
 const recipes=[
  {id:'kyckling',title:'Citronkyckling med bulgur',type:'k',min:25,fav:true,saved:true,ingredients:'kyckling citron bulgur'},
  {id:'linser',title:'Linsgryta med kokos',type:'v',min:30,fav:true,saved:true,ingredients:'linser kokos spenat'},
  {id:'paj',title:'Köttfärspaj',type:'k',min:55,saved:true,ingredients:'blandfärs purjolök bacon'},
  {id:'halloumi',title:'Halloumi med rotfrukter',type:'v',min:40,saved:true,ingredients:'halloumi morot rödbeta'},
  {id:'chili',title:'Chili med kött- och vegvariant',type:'kv',min:30,batch:true,ingredients:'bönor tomat färs'},
  {id:'pasta',title:'Krämig svamppasta',type:'g',min:20,ingredients:'pasta svamp grädde'},
  {id:'hallon',title:'Hallonpaj med smuldeg',type:'e',min:60,saved:true,fav:true,ingredients:'hallon havre smör'},
  {id:'apple',title:'Varma äpplen med kanel',type:'e',min:20,ingredients:'äpple kanel yoghurt'},
  {id:'arkiv',title:'Kycklinggryta med ris',type:'k',min:45,saved:true,archived:true,ingredients:'kyckling ris paprika'}
 ];
 const initial=()=>({q:'',type:'alla',fav:false,quick:false,batch:false}),filters=Object.fromEntries(tabs.map(([k])=>[k,initial()]));let tab='bank',archive=false;
 const label={k:'Kött',v:'Vegetariskt',kv:'Kött/Veg',g:'Gemensam',e:'Efterrätt'};
 const count=f=>Number(!!f.q)+Number(f.type!=='alla')+Number(f.fav)+Number(f.quick)+Number(f.batch);
 const match=r=>{const f=filters[tab];return!r.archived&&(tab==='efter'?r.type==='e':r.type!=='e')&&(tab!=='bank'||r.saved)&&(!f.q||[r.title,r.ingredients].join(' ').toLocaleLowerCase('sv').includes(f.q.toLocaleLowerCase('sv')))&&(f.type==='alla'||r.type===f.type)&&(!f.fav||r.fav)&&(!f.quick||r.min<=30)&&(!f.batch||r.batch)};
 const chip=(key,text,on,value)=>'<button type="button" data-ux="'+key+'"'+(value?' data-value="'+value+'"':'')+' aria-pressed="'+!!on+'">'+text+'</button>';
 const seg=(options,current)=>'<div class="segc" style="--n:'+options.length+';--i:'+options.findIndex(x=>x[0]===current)+'"><div class="seg-thumb" aria-hidden="true"></div>'+options.map(([k,l])=>'<button type="button" data-ux="tab" data-value="'+k+'" aria-pressed="'+(k===current)+'">'+l+'</button>').join('')+'</div>';
 const card=r=>'<article class="bcard '+r.type+'" data-recipe="'+r.id+'"><div class="bimgw"><div class="bimg"><span aria-hidden="true">'+d('foodIcon('+JSON.stringify(r.title)+', '+JSON.stringify({course:r.type==='e'?'efterrätt':''})+')')+'</span></div><button type="button" class="bc-gl rp-book'+(r.saved?' on':'')+'" data-ux="save" data-id="'+r.id+'" aria-label="Spara '+esc(r.title)+'" aria-pressed="'+!!r.saved+'">'+(r.saved?I.bookmarkOn:I.bookmark)+'</button><button type="button" class="bc-gl rp-heart'+(r.fav?' on':'')+'" data-ux="heart" data-id="'+r.id+'" aria-label="Favorit '+esc(r.title)+'" aria-pressed="'+!!r.fav+'">'+(r.fav?I.heartOn:I.heart)+'</button></div><div class="bbody"><span class="chips-row"><span class="chip">'+label[r.type]+'</span><span class="chip">'+r.min+' min</span></span><h2 class="btitle">'+esc(r.title)+'</h2></div></article>';
 const style=document.createElement('style');style.textContent=`
 .ux-recept .ux-search{margin:12px 16px 0}.ux-recept .ux-filter{margin:10px 16px 0;padding-bottom:10px;border-bottom:1px solid var(--line)}
 .ux-recept .ux-filter-head,.ux-recept .ux-result{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px;color:var(--ink-2);font-size:15px}
 .ux-recept .ux-filter-head .tb{font-size:15px;min-height:34px}.ux-recept .fchips{padding:0;margin-top:6px}.ux-recept .fchips button{min-height:36px}
 .ux-recept .ux-archive{display:flex;justify-content:flex-end;margin-top:6px}.ux-recept .ux-archive .tb{font-size:15px;display:flex;gap:6px;align-items:center;min-height:36px}.ux-recept .ux-archive svg{width:8px;height:12px}
 .ux-recept .ux-result{margin:8px 16px 0}.ux-recept .bank{margin-top:6px}.ux-recept .ux-empty{margin:8px 16px}.ux-recept .ux-empty .group{margin:0}.ux-recept .ux-empty .tb{margin-top:6px}
 .ux-recept .ux-result-note{font-size:13px}.ux-recept .sh-tools .sh-btn{min-height:44px}.ux-recept .bc-gl{min-width:40px;min-height:40px}.ux-recept .bank.mini .bc-gl.rp-book{right:54px}
 .ux-recept .ux-count{color:var(--ink-2);font-weight:400}.ux-recept .ux-return{margin:0 16px}.ux-recept .ux-archive-title{margin:10px 16px 0}
 @media(min-width:900px){.ux-recept .ux-filter{display:grid;grid-template-columns:1fr auto;gap:4px 14px}.ux-recept .ux-filter-head{grid-column:1/-1}.ux-recept .ux-filter .fchips{overflow:visible;flex-wrap:wrap}.ux-recept .ux-archive{grid-column:1/-1;margin:0}.ux-recept .bank.mini{grid-template-columns:repeat(3,minmax(0,1fr))}}
 `;document.head.append(style);
 function render(){
  const root=document.getElementById('main');root.classList.add('ux-recept');const f=filters[tab],n=count(f),list=recipes.filter(match).sort((a,b)=>Number(!!b.fav)-Number(!!a.fav));
  let html=d('head("Mat",{sub:weekSub()})')+d('segc("Visa","matTab",[["vecka","Vecka"],["inkop","Inköp"],["recept","Recept"]],"recept")')+'<div class="subseg">'+seg(tabs,tab)+'</div>';
  if(archive){const a=recipes.filter(r=>r.archived);root.innerHTML=html+'<div class="ux-return"><button class="back" data-ux="back">'+I.back+'Mina recept</button></div><div class="ux-archive-title"><h2 class="t2">Arkiverade recept <span class="ux-count">'+a.length+'</span></h2><p class="sub">Planerade måltider och historik finns kvar.</p></div><div class="group" style="margin-top:14px">'+(a.length?a.map(r=>'<div class="cell"><span class="grow">'+esc(r.title)+'</span><button type="button" class="tb" data-ux="restore" data-id="'+r.id+'">Återställ</button></div>').join(''):'<div class="cell empty">Inga arkiverade recept.</div>')+'</div>';return}
  html+='<div class="sh-tools"><button type="button" class="sh-btn" data-rc="new"><span class="sh-ic">'+I.plus+'</span><b>Nytt recept</b></button><button type="button" class="sh-btn" data-rc="import"><span class="sh-ic">'+I.imp+'</span><b>Importera</b></button></div>';
  html+='<div class="rc-tools ux-search"><form class="add-row" data-ux-form="search"><input class="field" name="q" value="'+esc(f.q)+'" placeholder="Sök recept eller ingrediens" aria-label="Sök recept eller ingrediens" enterkeyhint="search"><button type="submit" class="add-go rc-search" aria-label="Sök">'+I.search+'</button></form></div>';
  html+='<section class="ux-filter" aria-label="Filtrera recept"><div class="ux-filter-head"><span>Filtrera'+(n?' · '+n+' aktiva':'')+'</span>'+(n?'<button type="button" class="tb" data-ux="clear">Rensa allt</button>':'')+'</div>';
  if(tab!=='efter')html+='<div class="fchips" role="group" aria-label="Mattyp">'+[['alla','Alla'],['k','Kött'],['v','Vegetariskt'],['kv','Kött/Veg'],['g','Gemensam']].map(([k,l])=>chip('type',l,f.type===k,k)).join('')+'</div>';
  html+='<div class="fchips" role="group" aria-label="Fler filter">'+chip('fav','Favoriter',f.fav)+chip('quick','Högst 30 min',f.quick)+(tab!=='efter'?chip('batch','Storkok',f.batch):'')+'</div>';
  if(tab==='bank')html+='<div class="ux-archive"><button type="button" class="tb" data-ux="archive">Visa arkiverade · '+recipes.filter(r=>r.archived).length+I.chev+'</button></div>';
  html+='</section><div class="ux-result" role="status" aria-live="polite"><span>'+list.length+' recept'+(n?' matchar':'')+'</span>'+(tab==='bank'?'<span class="ux-result-note">Favoriter först</span>':'')+'</div>';
  html+=list.length?'<div class="bank mini">'+list.map(card).join('')+'</div>':'<div class="ux-empty"><div class="group"><div class="cell empty">'+(n?'Inga recept matchar dina val. Prova färre filter eller en annan sökning.':tab==='bank'?'Inga sparade recept än. Spara ett recept från Inspiration med bokmärket.':'Inga recept att visa.')+'</div></div>'+(n?'<button type="button" class="tb" data-ux="clear">Rensa sökning och filter</button>':'')+'</div>';
  root.innerHTML=html;
 }
 document.addEventListener('submit',e=>{if(!e.target.matches('[data-ux-form="search"]'))return;e.preventDefault();e.stopImmediatePropagation();filters[tab].q=new FormData(e.target).get('q').trim();document.activeElement?.blur();render()},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-ux]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.ux,f=filters[tab],r=recipes.find(x=>x.id===b.dataset.id);
  if(a==='tab'){tab=b.dataset.value;archive=false}if(a==='type')f.type=b.dataset.value;if(['fav','quick','batch'].includes(a))f[a]=!f[a];if(a==='clear')filters[tab]=initial();if(a==='archive')archive=true;if(a==='back')archive=false;if(a==='restore')r.archived=false;
  if(a==='heart'){r.fav=!r.fav;if(r.fav)r.saved=true}if(a==='save'){r.saved=!r.saved;if(!r.saved)r.fav=false}render();
 },true);
 window.__recipeProposal={render,snapshot:()=>JSON.parse(JSON.stringify({tab,archive,filters,recipes}))};render();
})();
