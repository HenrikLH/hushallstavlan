// Väggen: allt ska synas utan att rutor hamnar utanför skärmen (Henrik 2026-11-13). Mäter rutor nedanför skärmen och tar en bild.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const t=await read('today()'),tm=await read('addDays(today(),1)'),sen=await read('addDays(today(),-1)');
 const g=h.gas.ctx,C=require('vm').runInContext('CALENDARS',g);require('vm').runInContext('today_=function(){return '+JSON.stringify(t)+'}',g);
 const at=(k,x)=>g.Utilities.parseDate(k+' '+x,'Europe/Stockholm','yyyy-MM-dd HH:mm');
 const c0=g.CalendarApp.getCalendarById(C[0].id);c0.createEvent('Tandläkare',at(t,'08:00'),at(t,'09:00'));c0.createEvent('Yoga',at(t,'18:00'),at(t,'19:15'));g.kalenderSynk_();
 const U=h.sheet('Uppgifter');U.splice(1);U.push([false,'Byt filter i fläkten',sen,'Henrik','','a1','egen',''],[false,'Ring vårdcentralen',t,'','','a2','egen',''],[false,'Vattna blommorna',t,'','','a3','egen',''],[false,'Hämta paket',tm,'','','a4','egen','']);
 await pg.reload();await h.idle(2500);
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1500);
 const ut=await pg.evaluate(()=>{const nav=document.getElementById('nav').getBoundingClientRect().top;return[...document.querySelectorAll('.board .bcol[data-col] section[data-box]')].map(e=>{const r=e.getBoundingClientRect();return{id:e.dataset.box,top:Math.round(r.top),bottom:Math.round(r.bottom),klipp:e.scrollHeight>e.clientHeight+2}}).concat([{id:'nav',top:Math.round(nav)}])});
 console.log('RUTOR',JSON.stringify(ut));
 await h.shot(process.env.NAMN||'vagg-plats');
 const navTop=ut.find(x=>x.id==='nav').top,ute=ut.filter(x=>x.id!=='nav'&&x.bottom>innerHeightOr(navTop));
 function innerHeightOr(n){return 912}
 if(process.env.KRAV)assert.equal(ute.length,0,'rutor utanför skärmen: '+ute.map(x=>x.id).join(','));
};
