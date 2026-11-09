// Översiktens topp i UI 5.0 med iPhones statusfält (--sat 59 px): "Hej <namn>" och profilcirkeln ska inte ligga under den suddiga rubrikraden högst upp, och sidan ska inte ha någon synlig scrollist
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{await h.idle(800);await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 await pg.evaluate(()=>{document.documentElement.style.setProperty('--sat','59px');scrollTo(0,0)});await h.idle(400);
 const r=await pg.evaluate(()=>{const nb=document.getElementById('navbar'),c=getComputedStyle(nb),lt=document.getElementById('lt'),me=document.querySelector('.top-me,.me-av');
  return{cls:nb.className,vis:c.visibility,op:c.opacity,bf:c.backdropFilter,nbB:nb.getBoundingClientRect().bottom,lt:lt&&lt.getBoundingClientRect().top,me:me&&me.className+' '+me.getBoundingClientRect().top,sbw:getComputedStyle(document.documentElement).scrollbarWidth,iw:innerWidth-document.documentElement.clientWidth}});
 console.log(JSON.stringify(r));await h.shot('topp-0');
 assert.equal(r.vis,'hidden','rubrikraden ska vara dold högst upp');assert.equal(r.iw,0,'ingen scrollist');
 await pg.evaluate(()=>scrollTo(0,500));await h.idle(500);
 const v=await pg.evaluate(()=>getComputedStyle(document.getElementById('navbar')).visibility);console.log('scrollad',v);await h.shot('topp-500');
 console.log('PASS topp-skarp');
};
