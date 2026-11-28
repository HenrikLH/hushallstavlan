// Skiss (förslag): veckan som tidslinje. Ersätter listan med statisk HTML i appens egna färger.
module.exports=async(pg,h)=>{
 await pg.click('#nav [data-act="nav"][data-id="kalender"]');await h.idle(700);
 await pg.click('[data-act="calVy"][data-id="vecka"]');await h.idle(700);
 const V=process.env.TLV;
 await pg.evaluate(V=>{
  const css=`.tl{position:relative;padding:14px 16px 8px 0;background:var(--surface);border-radius:22px;margin:0 16px}
  .tl-r{position:relative;display:flex;gap:12px;padding-left:16px;min-height:44px}
  .tl-r:before{content:'';position:absolute;left:37px;top:0;bottom:0;width:2px;background:var(--line)}
  .tl-r.first:before{top:22px}.tl-r.last:before{bottom:calc(100% - 22px)}
  .tl-r.past:before{background:color-mix(in srgb,var(--accent) 45%,transparent)}
  .tl-n{position:relative;z-index:1;flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--bg,#111);border:2px solid var(--line);font:700 16px/1 inherit;color:var(--ink)}
  .tl-n small{display:block;font-size:10px;font-weight:600;color:var(--ink-2);margin-bottom:-6px;text-transform:uppercase}
  .tl-n.done{background:color-mix(in srgb,var(--accent) 22%,var(--surface));border-color:transparent;color:var(--accent)}
  .tl-n.today{background:var(--accent);border-color:var(--accent);color:var(--on-accent,#fff)}.tl-n.today small{color:inherit;opacity:.8}
  .tl-b{flex:1;min-width:0;padding:10px 0 14px;border-bottom:.5px solid var(--line)}
  .tl-r.last .tl-b{border-bottom:0}
  .tl-h{font-size:17px;font-weight:600;color:var(--ink)}.tl-h.acc{color:var(--accent)}
  .tl-m{font-size:14px;color:var(--ink-3);margin-top:2px}
  .tl-e{display:flex;gap:10px;margin-top:10px;align-items:baseline}.tl-e .t{width:46px;flex:none;color:var(--ink-2);font-size:15px}
  .tl-e .x{font-size:16px;color:var(--ink)}.tl-e .x span{display:block;font-size:14px;color:var(--ink-2)}
  .tl-past .tl-h,.tl-past .x{color:var(--ink-2)}
  .tl-now{display:flex;align-items:center;gap:8px;margin:10px 0 0 -2px;color:var(--red);font-size:13px;font-weight:600}.tl-now:after{content:'';flex:1;height:2px;background:var(--red);border-radius:2px}
  .tl-w{display:flex;align-items:center;gap:12px;padding-left:16px;min-height:40px;position:relative}
  .tl-w:before{content:'';position:absolute;left:37px;top:0;bottom:0;width:2px;background:repeating-linear-gradient(var(--line) 0 4px,transparent 4px 8px)}
  .tl-wi{position:relative;z-index:1;width:44px;height:30px;display:grid;place-items:center}
  .tl-wi i{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,#FF9F0A 22%,var(--surface));color:#FF9F0A}
  .tl-wi svg{width:15px;height:15px}
  .tl-wt{font-size:14px;color:var(--ink-2);font-weight:500}
  .tl-fold{display:flex;align-items:center;gap:12px;padding:0 0 10px 16px}
  .tl-fold .tl-b{padding:6px 0 12px}
  .tl-stack{position:relative;width:44px;height:44px;flex:none}
  .tl-stack i{position:absolute;width:30px;height:30px;border-radius:50%;background:color-mix(in srgb,var(--accent) 22%,var(--surface));border:2px solid var(--surface);top:7px}
  .tl-stack i:nth-child(1){left:0}.tl-stack i:nth-child(2){left:7px}.tl-stack i:nth-child(3){left:14px;display:grid;place-items:center;color:var(--accent);font-size:12px;font-weight:700}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const klock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const ck='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const day=(d,n,cls,h,body,o={})=>'<div class="tl-r '+(o.c||'')+'"><div class="tl-n '+cls+'">'+(cls==='done'?ck:'<div><small>'+d+'</small>'+n+'</div>')+'</div><div class="tl-b">'+h+body+'</div></div>';
  const ev=(t,x,s)=>'<div class="tl-e"><span class="t num">'+t+'</span><span class="x">'+x+(s?'<span>'+s+'</span>':'')+'</span></div>';
  const vanta=t=>'<div class="tl-w"><div class="tl-wi"><i>'+klock+'</i></div><span class="tl-wt">'+t+'</span></div>';
  let h='';
  if(V==='a'){
   h+='<div class="tl-fold"><div class="tl-stack"><i></i><i></i><i>5</i></div><div class="tl-b" style="border:0"><div class="tl-h" style="font-size:15px;color:var(--ink-2)">Tidigare i veckan</div><div class="tl-m">Mån 23–fre 27 · 2 middagar</div></div><span class="chev" style="color:var(--ink-3);transform:rotate(90deg)">›</span></div>';
   h+=day('Lör',28,'today','<div class="tl-h acc">Idag</div>','<div class="tl-now">Nu 08.12</div>'+ev('18.00','Krämig svamppasta','Börja laga 17.25'),{c:'first'});
   h+=day('Sön',29,'','<div class="tl-h">Söndag</div>',ev('Heldag','Första advent')+ev('18.00','Linsbolognese','Börja laga 17.15'),{c:'last'});
  }else{
   h+='<div class="tl-fold"><div class="tl-stack"><i></i><i></i><i>5</i></div><div class="tl-b" style="border:0"><div class="tl-h" style="font-size:15px;color:var(--ink-2)">Tidigare i veckan</div><div class="tl-m">Mån 23–fre 27 · 2 middagar</div></div></div>';
   h+='<div class="tl-r first"><div class="tl-n today"><div><small>Lör</small>28</div></div><div class="tl-b" style="border:0;padding-bottom:6px"><div class="tl-h acc">Nu · lördag 08.12</div><div class="tl-m">Idag</div></div></div>';
   h+=vanta('Om 9 tim 13 min');
   h+='<div class="tl-r"><div class="tl-n" style="border-color:var(--accent);color:var(--accent);font-size:13px">17.25</div><div class="tl-b" style="border:0;padding-bottom:6px"><div class="tl-h">Börja laga</div><div class="tl-m">Krämig svamppasta · äta 18.00</div></div></div>';
   h+=vanta('Sedan i morgon');
   h+='<div class="tl-r"><div class="tl-n"><div><small>Sön</small>29</div></div><div class="tl-b" style="border:0;padding-bottom:6px"><div class="tl-h">Första advent</div><div class="tl-m">Heldag · 18.00 Linsbolognese</div></div></div>';
   h+=vanta('3 lediga dagar');
   h+='<div class="tl-r last"><div class="tl-n"><div><small>Tor</small>3</div></div><div class="tl-b"><div class="tl-h">Tandläkare</div><div class="tl-m">10.30 · Henrik</div></div></div>';
  }
  const g=document.querySelector('.g-one');g.outerHTML='<div class="tl">'+h+'</div>';
  const f=document.querySelector('.foot');if(f)f.remove();
  const sub=document.querySelector('.cv-sub');if(sub)sub.textContent='23–29 nov';const hh=sub&&sub.parentNode;if(hh&&hh.firstChild.nodeType===3)hh.firstChild.textContent='Vecka 48 ';
 },V);
 await h.shot('tl-'+V);
};
