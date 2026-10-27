const assert=require('node:assert/strict');
// Ekonomi: håll in en fast utgift öppnar bladet (Ändra, överföring, ny utgift, Ta bort med håll in). Kalenderns dagvy: håll in ett block öppnar händelsens blad.
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(600)};const rd=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.evaluate(()=>window.__d("settings().ekonomi=JSON.stringify({shared:[{id:'hyra',name:'Hyra',amount:9800,period:'månad',day:'28',pay:'Autogiro'},{id:'el',name:'El',amount:900,period:'månad',day:'25'}],personal:{}})"));
 await c('[data-act="nav"][data-id="ekonomi"]');
 if(await pg.locator('.pin').count())for(const k of '1912')await c('[data-act="pin"][data-id="'+k+'"]');
 const row=pg.locator('.cell[data-act="ekoCost"][data-hold-lift]').first();const id=await row.getAttribute('data-id'),name=await row.locator('.title').textContent();
 await row.evaluate(el=>el.scrollIntoView({block:'center'}));await h.hold('.cell[data-act="ekoCost"][data-id="'+id+'"]');
 assert.equal(await rd('S.sheet'),'ekoMenu');assert.equal(await pg.locator('.sheet .dm-t').count(),4);
 console.log('meny för',name,'| markering',await pg.evaluate(()=>getComputedStyle(document.body).userSelect||getComputedStyle(document.body).webkitUserSelect));
 await c('.sheet .dm-t[data-a="ekoCost"]');assert.equal(await rd('S.sheet'),'cost');await c('.sheet [data-act="sheetClose"]');
 await h.hold('.cell[data-act="ekoCost"][data-id="'+id+'"]');await h.hold('.sheet .dm-t[data-hold="ekoDelHold"]');await h.waitFlush();await h.idle(500);
 assert.equal(await rd('ekoList("shared").concat(...people().map(p=>ekoList(p))).some(x=>x.id==='+JSON.stringify(id)+')'),false);
 // Kalenderns dagvy: håll in ett block
 await c('[data-act="nav"][data-id="uppgifter"]');await c('[data-act="taskTab"][data-id="kalender"]');
 await pg.evaluate(()=>window.__d("D().events.push({date:today(),time:'08.00–16.00',title:'Henrik jobbar',who:people()[0]});render()"));await h.idle(400);
 await c('[data-act="calVy"][data-id="dag"]');const blk='.cv-ev[data-act="evEdit"]';await pg.locator(blk).first().evaluate(el=>el.scrollIntoView({block:'center'}));
 await h.hold(blk);assert.equal(await rd('S.sheet'),'evMenu');
 console.log('PASS eko + kalender');
};
