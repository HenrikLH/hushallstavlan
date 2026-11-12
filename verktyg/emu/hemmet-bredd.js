// Hemmet fyller bredden: statusbrickorna delar raden, 1–3 scener jämnt fördelade, varningen på apparatens ikon.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/hemmet-bredd.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 // tre scener: Högtalare (HA), Morgon och Släck allt, som hos Henrik; diskmaskinen saknar salt
 await pg.evaluate(()=>window.__d(`habSet({sc:[{n:'Morgon',ik:'sun',ha:'scene.morgon'},{n:'Släck allt',ik:'off',av:1}]});const D=haData();D.scener=D.scener.filter(s=>s.id!=='scene.kvall'&&s.id!=='scene.film');const d=D.apparater.find(a=>a.typ==='disk');if(d){d.salt=1;d.st='ready'}render()`));await h.idle(800);
 const m=await pg.evaluate(()=>{const w=e=>e&&e.getBoundingClientRect();const c=document.querySelector('#main .ha-chips-v'),cs=[...c.children].map(w),sg=document.querySelector('#main .hus-sc'),ss=[...sg.children].map(w);
  return{chipsHo:Math.round(cs[cs.length-1].right),rad:Math.round(w(c).right),scHo:Math.round(ss[ss.length-1].right),scRad:Math.round(w(sg).right),n:ss.length,top:new Set(ss.map(r=>Math.round(r.top))).size}});
 console.log(JSON.stringify(m));
 if(Math.abs(m.chipsHo-m.rad)>2)fel('statusbrickorna fyller inte bredden');if(m.n<=4&&(Math.abs(m.scHo-m.scRad)>2||m.top!==1))fel('scenerna fyller inte bredden');
 const tr=await pg.evaluate(()=>[...document.querySelectorAll('#main .ha-ap .ha-n')].map(e=>e.scrollWidth>e.clientWidth+1));if(tr.some(Boolean))fel('apparatens namn klipps');
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('hemmet-bredd');
};
