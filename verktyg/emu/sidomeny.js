// Väggskärmens sidomeny (LS vaggmeny=vanster; vaggsidolage=skjut för utfällt som flyttar innehållet): LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/sidomeny.js
module.exports=async(pg,h)=>{await h.idle(2000);
 const kol=async n=>{const r=await pg.evaluate(()=>{const n=document.getElementById('nav'),b=n.getBoundingClientRect(),m=document.getElementById('main').getBoundingClientRect();return{sido:n.classList.contains('sido'),ut:n.classList.contains('sido-ut'),nav:[b.x,b.y,b.width,b.height].map(Math.round),mainX:Math.round(m.x),btn:[...n.querySelectorAll('button[data-act="nav"]')].map(x=>x.getAttribute('aria-current')?'*'+x.textContent:x.textContent).join(',')}});console.log(n,JSON.stringify(r));return r};
 let r=await kol('start');if(!r.sido)throw new Error('ingen sidomeny');
 await h.act('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(1500);await kol('oversikt');await h.shot('sido-in');
 await h.act('#nav .nav-tog');await h.idle(800);r=await kol('ut');if(!r.ut)throw new Error('fälldes inte ut');await h.shot('sido-ut');
 const sk=await pg.evaluate(()=>document.body.classList.contains('sido-over'))?0:1;
 await h.act('#nav [data-act="nav"][data-id="kalender"]');await h.idle(1200);r=await kol('kalender');await h.shot('sido-kalender');
 if(sk){await h.act('#nav .nav-tog');await h.idle(600);r=await kol('in')}else{if(r.ut)throw new Error('över: fälldes inte ihop vid flikval');
  await h.act('#nav .nav-tog');await h.idle(500);await pg.mouse.click(900,500);await h.idle(600);r=await kol('utanför')}
 if(r.ut)throw new Error('fälldes inte in');
 await h.act('#nav [data-act="nav"][data-id="mat"]');await h.idle(1200);await h.shot('sido-mat');
 // Längst ner igen
 await h.pref('[data-act="vaggmeny"]');await pg.locator('[data-act="vaggmeny"][data-id="nere"]').first().click();await h.idle(600);r=await kol('nere');if(r.sido)throw new Error('sidomenyn kvar');
}
