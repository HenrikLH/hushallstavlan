// Väggtavlans översikt: vädret i övre högra hörnet bredvid klockan och stjärnbildens namn innanför kortet (natt: NOW=…T22:00, WXSYM=clearsky_night)
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(900);
 if(process.env.STIL)await pg.addStyleTag({content:process.env.STIL}),await h.idle(300);
 const k=await pg.evaluate(()=>{const q=s=>document.querySelector(s),c=q('.hero .clock'),g=document.createRange();g.selectNodeContents(c);
  const C=g.getBoundingClientRect(),H=q('.hero').getBoundingClientRect(),W=q('.hero .hero-wx').getBoundingClientRect(),N=q('.hero .stjn');
  // en del av vädret (ikon, text eller tips) som står i höjd med klockan får inte gå in i den
  const kr=[...q('.hero .hero-wx').children].some(e=>{const b=e.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect();return t.left<C.right+4&&t.top<C.top+C.height*.8});
  return{d:[...q('.hero .hero-wx').children].map(e=>{const r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect();return e.className+':'+Math.round(t.left)+','+Math.round(t.top)}).join(' ')+' C'+Math.round(C.right)+','+Math.round(C.bottom),krock:kr,iHorn:W.top-H.top<40,namn:N?(()=>{const b=N.getBoundingClientRect();return b.right<=H.right&&b.left>=H.left?N.textContent:'utanför kortet'})():null}});
 console.log('VAGG',JSON.stringify(k));
 if(k.krock)throw new Error('vädret krockar med klockan');if(!k.iHorn)throw new Error('vädret står inte i hörnet');if(k.namn==='utanför kortet')throw new Error('stjärnbildens namn syns inte');
 await h.shot(process.env.NAMN||'vagg-hero',0);
};
