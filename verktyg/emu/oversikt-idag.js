// Granskning B: Översikt med händelser och uppgifter idag (före/efter Idag-rutan). Telefon och vägg.
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const t=await read('today()'),tm=await read('addDays(today(),1)'),sen=await read('addDays(today(),-1)');
 const g=h.gas.ctx,C=require('vm').runInContext('CALENDARS',g);require('vm').runInContext('today_=function(){return '+JSON.stringify(t)+'}',g);
 const at=(k,x)=>g.Utilities.parseDate(k+' '+x,'Europe/Stockholm','yyyy-MM-dd HH:mm');
 const c0=g.CalendarApp.getCalendarById(C[0].id),c1=g.CalendarApp.getCalendarById(C[1].id);
 c0.createEvent('Tandläkare',at(t,'08:00'),at(t,'09:00'));c1.createEvent('Yoga',at(t,'18:00'),at(t,'19:15'),{description:'Vem: Cornelia'});
 c0.createEvent('Middag hos Anna',at(tm,'18:30'),at(tm,'21:00'));g.kalenderSynk_();
 const U=h.sheet('Uppgifter');U.splice(1);
 U.push([false,'Byt filter i fläkten',sen,'Henrik','','a1','egen',''],[false,'Ring vårdcentralen',t,'Cornelia','','a2','egen',''],[false,'Vattna blommorna',t,'','','a3','egen',''],[false,'Hämta paket',tm,'','','a4','egen','']);
 await pg.reload();await h.idle(1800);
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1000);
 await h.shot(process.env.NAMN||'idag-1');
 if(!await read('wallBoardOn()')){await pg.evaluate(()=>scrollTo(0,innerHeight*0.8));await h.idle(400);await h.shot((process.env.NAMN||'idag')+'-2')}
};
