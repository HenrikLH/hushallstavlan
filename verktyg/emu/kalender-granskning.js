// Granskning E: Kalenderns månadsvy. KALVAR=B visar Apple-varianten (gråa helger, andra månaders dagar dolda)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const g=h.gas.ctx,C=require('vm').runInContext('CALENDARS',g),k=await pg.evaluate(()=>window.__d('today()'));
 require('vm').runInContext('today_=function(){return '+JSON.stringify(k)+'}',g);
 const at=t=>g.Utilities.parseDate(k+' '+t,'Europe/Stockholm','yyyy-MM-dd HH:mm');
 g.CalendarApp.getCalendarById(C[0].id).createEvent('Middag hos Anna',at('18:30'),at('21:00'));g.kalenderSynk_();
 await pg.reload();await h.idle(1500);
 if(process.env.KALVAR==='B')await pg.addStyleTag({content:'html.ny.ui5 .cal-d.we:not(.out):not(.today):not(.sel) .n{color:var(--ink-2)}html.ny.ui5 .cal-d.out{visibility:hidden}'});
 const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 if(await pg.locator('.nav-mini.on').isVisible())await click('.nav-mini.on');
 await click('#nav [data-act="nav"][data-id="kalender"]');
 if(await pg.locator('[data-act="calVy"][data-id="manad"]').count())await click('[data-act="calVy"][data-id="manad"]');
 assert.equal(await pg.locator('.linkbtn[data-act="evNew"]').count(),0,'ingen Lägg till-länk, plus räcker');
 assert.equal(await pg.locator('[data-ref="U6"] .meta, #U6 .meta').filter({hasText:/^Sön/}).count(),0,'ingen veckodag på maten');
 await h.shot('kal-'+(process.env.KALVAR||'A'));
 await pg.evaluate(()=>scrollTo(0,document.body.scrollHeight));await h.idle(400);await h.shot('kal-'+(process.env.KALVAR||'A')+'-nere');
};
