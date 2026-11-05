// Körs i appens scope via window.__d. Bygger förslag P (A/B/C) för Städ av riktiga data.
(P)=>{
const cp=cleanPlan(),all=D().clean,rooms=roomHealth();
const today_=[...cp.routines,...cp.todo,...cp.doneRot];
const done=today_.filter(doneToday),left=today_.filter(t=>!doneToday(t));
const minAll=today_.reduce((s,t)=>s+t.min,0),minLeft=left.reduce((s,t)=>s+t.min,0);
const big=cp.big.filter(t=>ratio(t)>=.85);
const sv=(p,w)=>'<svg viewBox="0 0 24 24" width="'+(w||22)+'" height="'+(w||22)+'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
const RI={'Kök':sv('<path d="M5 11h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M3 11h18M9 7c0-1 1-1 1-2M14 7c0-1 1-1 1-2"/>'),
 'Vardagsrum':sv('<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a1.5 1.5 0 0 1 3 0v2h12v-2a1.5 1.5 0 0 1 3 0v5H3z"/><path d="M5 17v2M19 17v2"/>'),
 'Sovrum':sv('<path d="M3 18V7M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="11" r="1.6"/>'),
 'Hall':sv('<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16"/><circle cx="14.5" cy="12" r=".8" fill="currentColor"/>'),
 'Toalett':sv('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
 'Hundar':sv('<circle cx="7" cy="10" r="1.6"/><circle cx="10.5" cy="6.5" r="1.6"/><circle cx="14.5" cy="6.5" r="1.6"/><circle cx="18" cy="10" r="1.6"/><path d="M12 12c-3 0-5 3.5-5 5.5S9 20 12 19s5 .5 5-1.5-2-5.5-5-5.5z"/>'),
 'Alla rum':sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>')};
const hcol=s=>s>=.85?'var(--green)':s>=.6?'var(--orange)':'var(--red)';
const ork=orkSlider(cp.B).match(/<div class="ork-seg"[\s\S]*?<\/div>(?=<div class="foot">)/)[0];
const tick='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const chev='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const late=t=>t.freq>1&&ratio(t)>=2;
let css='',h='';
const H0=document.querySelector('#main .head');const H=(t,sub)=>{const e=H0.cloneNode(true);const sb=e.querySelector('.sub');if(sb){if(sub)sb.textContent=sub;else sb.remove()}return e.outerHTML};
css+='.fx-head{padding:6px 20px 4px}.fx-head h1{font-size:34px;font-weight:800;letter-spacing:-.6px;margin:0;color:var(--ink)}.fx-sub{color:var(--ink-2);font-size:15px;margin-top:2px}.fx-lab{font-size:13px;font-weight:600;color:var(--ink-2);text-transform:uppercase;letter-spacing:.4px;margin:22px 20px 8px;display:flex;justify-content:space-between}.fx-lab b{font-weight:600;color:var(--ink-3);text-transform:none;letter-spacing:0}'+
 '.fx-card{background:var(--surface);border-radius:14px;margin:0 16px;overflow:hidden}.fx-row{display:flex;align-items:center;gap:12px;min-height:48px;padding:8px 16px;position:relative}.fx-row+.fx-row:before{content:"";position:absolute;top:0;right:0;left:52px;border-top:.5px solid var(--line)}.fx-row.nl+.fx-row:before{left:16px}.fx-row .g{flex:1;min-width:0}.fx-row .t{font-size:17px;color:var(--ink);line-height:1.25}.fx-row .m{font-size:13px;color:var(--ink-3);margin-top:1px}.fx-row .v{color:var(--ink-3);font-size:17px;display:flex;align-items:center;gap:4px}.fx-row .v svg{opacity:.55}';
if(P==='A'){
 css+='.ga-sum{display:flex;align-items:center;gap:10px;margin:14px 16px 0}.ga-bar{flex:1;height:6px;border-radius:3px;background:var(--fill);overflow:hidden}.ga-bar i{display:block;height:100%;background:var(--accent);border-radius:3px}.ga-sum span{font-size:13px;font-weight:600;color:var(--ink-2)}'+
 '.ga-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 16px}.ga-t{aspect-ratio:1;background:var(--surface);border-radius:18px;padding:14px;display:flex;flex-direction:column;position:relative}.ga-ic{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}.ga-ck{position:absolute;top:14px;right:14px;width:26px;height:26px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center;color:transparent}'+
 '.ga-t .t{margin-top:auto;font-size:16px;font-weight:600;line-height:1.2;color:var(--ink);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.ga-t .m{font-size:13px;color:var(--ink-3);margin-top:4px}.ga-t.on{background:var(--fill)}.ga-t.on .ga-ck{background:var(--accent);border-color:var(--accent);color:#fff}.ga-t.on .t{color:var(--ink-3);text-decoration:line-through}.ga-t.on .ga-ic{background:transparent;color:var(--ink-3)}.ga-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:1px}'+
 '.ga-r3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 16px}.ga-r{aspect-ratio:1;background:var(--surface);border-radius:18px;padding:12px;display:flex;flex-direction:column;align-items:flex-start}.ga-r .ga-ic{width:34px;height:34px;border-radius:11px;background:var(--fill);color:var(--ink-2)}.ga-r .t{margin-top:auto;font-size:14px;font-weight:600;color:var(--ink)}.ga-r .m{font-size:12px;color:var(--ink-3)}'+
 '.ga-seg{margin:12px 0 0}';
 h+=H('Städ',minLeft+' min kvar idag');
 h+='<div class="ga-sum"><div class="ga-bar"><i style="width:'+Math.round(100*done.length/today_.length)+'%"></i></div><span>'+done.length+' av '+today_.length+'</span></div>';
 h+='<div class="ga-seg">'+ork+'</div>';
 h+='<div class="fx-lab">Idag</div><div class="ga-grid">'+[...left,...done].map(t=>'<div class="ga-t'+(doneToday(t)?' on':'')+'"><div class="ga-ic">'+RI[t.room]+'</div><div class="ga-ck">'+tick+'</div><div class="t">'+esc(t.title)+'</div><div class="m">'+(late(t)&&!doneToday(t)?'<span class="ga-dot" style="background:var(--red)"></span>':'')+t.min+' min'+(t.freq<=1?' · varje dag':'')+'</div></div>').join('')+'</div>';
 h+='<div class="fx-lab">Rummen</div><div class="ga-r3">'+rooms.map(r=>'<div class="ga-r"><div class="ga-ic">'+RI[r.room]+'</div><div class="t">'+esc(r.room)+'</div><div class="m"><span class="ga-dot" style="background:'+hcol(r.score)+'"></span>'+healthWord(r.score)+'</div></div>').join('')+
   '<div class="ga-r" style="background:transparent;border:1.5px dashed var(--line)"><div class="ga-ic" style="background:transparent;color:var(--accent)">'+I.plus+'</div><div class="t" style="color:var(--accent)">Ny syssla</div></div></div>';
 h+='<div class="fx-lab">Mer</div><div class="fx-card"><div class="fx-row nl"><div class="g"><div class="t">Storstäd som närmar sig</div></div><div class="v">'+big.length+chev+'</div></div><div class="fx-row nl"><div class="g"><div class="t">Alla sysslor och intervall</div></div><div class="v">'+all.length+chev+'</div></div></div><div style="height:30px"></div>';
}
if(P==='B'){
 const R=36,C=2*Math.PI*R,pm=minAll?(minAll-minLeft)/minAll:0;
 css+='.gb-hero{background:var(--surface);border-radius:20px;margin:14px 16px 0;padding:18px}.gb-top{display:flex;align-items:center;gap:18px}.gb-ring{position:relative;width:84px;height:84px;flex:none}.gb-ring svg{transform:rotate(-90deg)}.gb-big{font-size:34px;font-weight:700;letter-spacing:-.5px;color:var(--ink);line-height:1}.gb-big small{font-size:17px;font-weight:600;color:var(--ink-3);margin-left:3px}.gb-s{font-size:15px;color:var(--ink-2);margin-top:6px}.gb-hero .segc{margin:16px 0 0;background:var(--fill)}'+
 '.gb-c{width:24px;height:24px;border-radius:50%;border:1.6px solid var(--ink-3);flex:none;display:grid;place-items:center;color:transparent;opacity:.7}.on .gb-c{background:var(--accent);border-color:var(--accent);color:#fff;opacity:1}.on .t{color:var(--ink-3)}.gb-late{color:var(--orange)}.gb-foot{font-size:13px;color:var(--ink-3);margin:8px 32px 0;line-height:1.35}'+
 '.gb-h{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 4px;padding:16px 8px 14px}.gb-h div{text-align:center;font-size:12px;color:var(--ink-2)}.gb-h svg{display:block;margin:0 auto 5px;transform:rotate(-90deg)}.gb-ic{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;color:#fff;flex:none}.gb-ic svg{width:17px;height:17px}';
 h+=H('Städ','Söndag 18 oktober');
 h+='<div class="gb-hero"><div class="gb-top"><div class="gb-ring"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="'+R+'" fill="none" stroke="var(--fill)" stroke-width="10"/><circle cx="42" cy="42" r="'+R+'" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+(C*pm)+' '+C+'"/></svg></div><div><div class="gb-big">'+minLeft+'<small>min kvar</small></div><div class="gb-s">'+done.length+' av '+today_.length+' klart idag</div></div></div>'+ork+'</div>';
 h+='<div class="fx-lab">Idag</div><div class="fx-card">'+[...left,...done].map(t=>'<div class="fx-row'+(doneToday(t)?' on':'')+'"><div class="gb-c">'+tick+'</div><div class="g"><div class="t">'+esc(t.title)+'</div><div class="m">'+esc(t.room)+' · '+t.min+' min'+(t.freq<=1?' · ↻':'')+(late(t)&&!doneToday(t)?' · <span class="gb-late">försenat</span>':'')+'</div></div></div>').join('')+'</div><div class="gb-foot">Svep åt vänster för att skjuta till i morgon.</div>';
 const mr=s=>{const r=13,c=2*Math.PI*r;return'<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="'+r+'" fill="none" stroke="var(--fill)" stroke-width="5"/><circle cx="17" cy="17" r="'+r+'" fill="none" stroke="'+hcol(s)+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(c*Math.min(1,s))+' '+c+'"/></svg>'};
 h+='<div class="fx-lab">Hemmet</div><div class="fx-card"><div class="gb-h">'+rooms.map(r=>'<div>'+mr(r.score)+esc(r.room)+'</div>').join('')+'</div></div>';
 const row=(ic,bg,t,v)=>'<div class="fx-row"><div class="gb-ic" style="background:'+bg+'">'+ic+'</div><div class="g"><div class="t">'+t+'</div></div><div class="v">'+v+chev+'</div></div>';
 h+='<div style="height:22px"></div><div class="fx-card">'+row(I.sparkles,'var(--orange)','Storstäd',big.length)+row(I.list,'var(--gray,#8e8e93)','Alla sysslor',all.length)+'</div><div style="height:30px"></div>';
}
if(P==='C'){
 css+='.gc-sum{display:flex;justify-content:space-between;align-items:baseline;padding:14px 16px 10px}.gc-sum b{font-size:17px;color:var(--ink)}.gc-sum span{font-size:13px;color:var(--ink-3)}.gc-bar{height:4px;background:var(--fill);margin:0 16px 4px;border-radius:2px;overflow:hidden}.gc-bar i{display:block;height:100%;background:var(--accent)}'+
 '.gc-ck{width:24px;height:24px;border-radius:50%;border:1.6px solid var(--line);flex:none;display:grid;place-items:center;color:transparent}.gc-done{color:var(--ink-3);font-size:15px}.gc-dots{display:flex;gap:5px}.gc-dots i{width:9px;height:9px;border-radius:50%}.gc-ork{margin:12px 0 0}';
 h+=H('Städ');
 h+='<div class="gc-ork">'+ork+'</div><div style="height:12px"></div>';
 h+='<div class="fx-card"><div class="gc-sum"><b>Idag</b><span>'+minLeft+' min kvar</span></div><div class="gc-bar"><i style="width:'+Math.round(100*done.length/today_.length)+'%"></i></div>'+left.map(t=>'<div class="fx-row"><div class="gc-ck"></div><div class="g"><div class="t">'+esc(t.title)+'</div><div class="m">'+esc(t.room)+' · '+t.min+' min</div></div></div>').join('')+
  '<div class="fx-row"><div class="gc-ck" style="background:var(--accent);border-color:var(--accent);color:#fff">'+tick+'</div><div class="g gc-done">'+done.length+' klara · visa</div></div></div>';
 h+='<div style="height:22px"></div><div class="fx-card">'+
  '<div class="fx-row nl"><div class="g"><div class="t">Hemmet</div></div><div class="v"><span class="gc-dots">'+rooms.map(r=>'<i style="background:'+hcol(r.score)+'"></i>').join('')+'</span>'+chev+'</div></div>'+
  '<div class="fx-row nl"><div class="g"><div class="t">Har ni mer tid?</div></div><div class="v">'+cp.later.length+chev+'</div></div>'+
  '<div class="fx-row nl"><div class="g"><div class="t">Storstäd</div></div><div class="v">'+big.length+chev+'</div></div>'+
  '<div class="fx-row nl"><div class="g"><div class="t">Alla sysslor</div></div><div class="v">'+all.length+chev+'</div></div></div><div style="height:30px"></div>';
}
document.querySelector('#main').innerHTML='<style>'+css+'</style>'+h;window.scrollTo(0,0);
}
