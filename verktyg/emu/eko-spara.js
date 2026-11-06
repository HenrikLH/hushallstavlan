const assert=require('node:assert/strict');
// Ekonomi: en ny utgift ska sparas. Bladet får inte tömmas av en omritning i bakgrunden när man tryckt på ett val,
// och ändringen ska ligga i utkorgen direkt efter Spara (finns kvar om appen stängs innan den hunnit skickas).
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(400)};const rd=s=>pg.evaluate(s=>window.__d(s),s);
 await c('[data-act="nav"][data-id="ekonomi"]');
 if(await pg.locator('.pin').count())for(const k of '1912')await c('[data-act="pin"][data-id="'+k+'"]');
 await pg.evaluate(()=>window.__d("ACT.ekoCost('',{dataset:{list:'shared'}})"));await h.idle(400);
 assert.equal(await rd('S.sheet'),'cost');
 await pg.fill('#overlay input[name="name"]','Bredband');await pg.fill('#overlay input[name="amount"]','399');
 await c('#overlay input[name="period"][value="kvartal"] + span');
 // omritning som när data kommer från kalkylarket (var 30:e sekund)
 await pg.evaluate(()=>window.__d("render()"));await h.idle(300);
 const namn=await pg.inputValue('#overlay input[name="name"]'),bel=await pg.inputValue('#overlay input[name="amount"]'),per=await pg.locator('#overlay input[name="period"]:checked').getAttribute('value');
 console.log('efter omritning:',JSON.stringify({namn,bel,per}));
 assert.equal(namn,'Bredband');assert.equal(bel,'399');assert.equal(per,'kvartal');
 const ut=await pg.evaluate(()=>{document.querySelector('#overlay .tb.strong').click();return localStorage.getItem('ht.outbox')||''});
 console.log('utkorgen direkt efter Spara:',/Bredband/.test(ut)?'ja':'nej');assert.ok(/Bredband/.test(ut),'ändringen saknas i utkorgen');
 await h.waitFlush();await h.idle(500);
 assert.ok(await rd('ekoList("shared").some(x=>x.name==="Bredband"&&x.period==="kvartal")'));
 console.log('PASS eko-spara');
};
