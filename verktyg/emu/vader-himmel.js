// Vädervyns himmel: öppna Väder genom att klicka och ta en bild (väderläget styrs med WXSYM/WXT/WXPR/NOW)
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(700);await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(900);
 if(!await pg.locator('.wx2').count())throw new Error('ingen vädervy');
 await h.shot(process.env.NAMN||'vader',0);
 const k=await pg.evaluate(()=>{const p=document.querySelector('.skyfx .pole'),m=document.querySelector('.wx2>.arc .sky-b');if(!p||!m)return null;const a=p.getBoundingClientRect(),b=m.getBoundingClientRect(),rc=parseFloat(p.style.getPropertyValue('--rc'));return{d:Math.hypot(a.left-b.left-b.width/2,a.top-b.top-b.height/2),rc}});
 if(k){console.log('stjärnbild',JSON.stringify(k));if(!(k.d>k.rc+34+22||k.d<k.rc-34-22))throw new Error('stjärnbilden kan hamna under månen')}
};
