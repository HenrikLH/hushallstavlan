// Kalender: ny händelse som tidsblock. Håll in och dra i dagvyn, tryck på tom tid, plus med Börjar/Slutar, byt till Uppgift.
// node verktyg/emu/run.js verktyg/emu/kalender-tidsblock.js (fungerar med och utan NOW)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const g=h.gas.ctx,C=require('vm').runInContext('CALENDARS',g),cal=g.CalendarApp.getCalendarById(C[1].id),k=await pg.evaluate(()=>window.__d('today()'));
 // Kod.gs räknar "i dag" från datorns klocka; låt servern ha samma dag som appen (NOW) så att synken inte hoppar över händelserna
 require('vm').runInContext('today_=function(){return '+JSON.stringify(k)+'}',g);
 const at=t=>g.Utilities.parseDate(k+' '+t,'Europe/Stockholm','yyyy-MM-dd HH:mm');
 g.CalendarApp.getCalendarById(C[0].id).createEvent('Tandläkare',at('08:00'),at('09:00'));
 cal.createEvent('Yoga',at('18:00'),at('19:15'),{description:'Vem: Cornelia'});g.kalenderSynk_();
 await pg.reload();await h.idle(1500);
 const click=async s=>{await pg.locator(s).first().click();await h.idle(400)};
 if(await pg.locator('.nav-mini.on').isVisible())await click('.nav-mini.on');
 await click('#nav [data-act="nav"][data-id="kalender"]');await click('[data-act="calVy"][data-id="dag"]');
 const col=pg.locator('.cv-col[data-ny]');assert.equal(await col.count(),1,'dagvyn ska ha en kolumn för nya block');
 const y=async m=>{const b=await col.boundingBox(),lo=+await col.getAttribute('data-lo'),px=+await col.getAttribute('data-px');return b.y+(m-lo)/60*px};
 const x=(await col.boundingBox()).x+120;
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('1-dagvy');
 // håll in vid 13.05 och dra till 15.00
 await pg.evaluate(async y=>scrollTo(0,Math.max(0,y-300)),await y(13*60));await h.idle(300);
 await pg.mouse.move(x,await y(13*60+5));await pg.mouse.down();await h.idle(550);
 assert.equal(await pg.locator('.cv-ny').count(),1,'blocket ska synas efter håll in');
 for(const m of [13*60+40,14*60+20,15*60])await pg.mouse.move(x,await y(m),{steps:4});
 assert.equal((await pg.locator('.cv-ny span').innerText()).replace(/\s/g,''),'13.00–15.00');await h.shot('2-drar');
 await pg.mouse.up();await h.idle(500);
 assert(await pg.locator('#en-title').isVisible(),'bladet Ny händelse ska öppnas');
 assert.equal(await pg.inputValue('form[data-form="evNew"] [name=start]'),'13:00');assert.equal(await pg.inputValue('form[data-form="evNew"] [name=end]'),'15:00');
 await pg.fill('#en-title','Frisör');await h.shot('3-blad');
 await click('form[data-form="evNew"] .tb.strong');await h.waitFlush();await h.idle(600);
 const rad=h.sheet('Händelser').find(r=>r[2]==='Frisör');assert(rad,'händelsen ska hamna i kalendern');assert.equal(rad[1],'13.00–15.00');assert.equal(rad[3],'Henrik');assert(rad[5],'ska få id från kalendern');
 const yoga=h.sheet('Händelser').find(r=>r[2]==='Yoga');assert.equal(yoga[3],'Cornelia','Vem ur beskrivningen');
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('4-dagvy-efter',true);
 // tryck på en tom tid: halvtimmen man tryckte på, en timme lång. Flyttad start drar med sig slutet
 await pg.evaluate(async y=>scrollTo(0,Math.max(0,y-300)),await y(10*60));await h.idle(300);
 await pg.mouse.click(x,await y(10*60+40));await h.idle(500);
 assert.equal(await pg.inputValue('form[data-form="evNew"] [name=start]'),'10:30');assert.equal(await pg.inputValue('form[data-form="evNew"] [name=end]'),'11:30');
 await pg.fill('#en-title','Ring');const st=pg.locator('form[data-form="evNew"] [name=start]');await st.focus();await st.fill('12:00');await st.dispatchEvent('change');
 assert.equal(await pg.inputValue('form[data-form="evNew"] [name=end]'),'13:00','längden ska följa med');
 await click('[data-act="evNewTyp"][data-id="task"]');assert.equal(await pg.inputValue('#task-title'),'Ring','titeln följer med till Uppgift');
 await click('[data-act="evNewTyp"][data-id="ev"]');assert.equal(await pg.inputValue('#en-title'),'Ring');await click('[data-act="sheetClose"]');
 // plus: nästa hela timme; heldag döljer tiderna
 await click('[data-act="evNew"]');assert.equal(await pg.inputValue('form[data-form="evNew"] [name=start]'),await pg.evaluate(()=>window.__d('tidInp(Math.min(23,new Date().getHours()+1)*60)')));
 await click('#en-allday');assert(!await pg.locator('#en-times').isVisible());await pg.fill('#en-title','Ledig');await click('form[data-form="evNew"] .tb.strong');await h.waitFlush();
 const hd=h.sheet('Händelser').find(r=>r[2]==='Ledig');assert(hd&&hd[1]===''&&hd[6].includes('a'),'heldag');
 // månadsvyn: Lägg till öppnar samma blad
 await click('[data-act="calVy"][data-id="manad"]');await click('.sh [data-act="evNew"]');assert(await pg.locator('#en-title').isVisible());await click('[data-act="sheetClose"]');
 console.log('PASS kalender-tidsblock: håll in och dra, tryck, plus, heldag, byt till uppgift, Vem i beskrivningen');
};
