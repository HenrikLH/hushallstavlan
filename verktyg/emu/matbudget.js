const assert=require('node:assert/strict');
// Ekonomi: ange matbudget i bladet och se var och ens del till Matkontot efter inkomstfördelningen.
module.exports=async(pg,h)=>{const c=async s=>{await pg.locator(s).first().click();await h.idle(600)};const rd=s=>pg.evaluate(s=>window.__d(s),s);
 // Sparas i arket (inte bara i telefonen), annars skriver nästa hämtning över det
 await pg.evaluate(()=>window.__d("updJSON('ekonomi_inkomst',{},o=>{o[thisMonth()]={[people()[0]]:34000,[people()[1]]:26000};return o});updJSON('ekonomi',{},o=>{delete o.matM;return o})"));await h.waitFlush();await h.idle(500);
 await c('[data-act="nav"][data-id="ekonomi"]');
 if(await pg.locator('.pin').count())for(const k of '1912')await c('[data-act="pin"][data-id="'+k+'"]');
 const btn=pg.locator('[data-act="ekoMat"]').first();await btn.evaluate(el=>el.scrollIntoView({block:'center'}));await btn.click();await h.idle(500);
 assert.equal(await rd('S.sheet'),'matb');
 await pg.fill('.sheet input[name="b"]','8000');await c('.sheet .tb.strong');await h.waitFlush();await h.idle(500);
 assert.equal(await rd('matBudget(thisMonth()).b'),8000);
 const t=await pg.locator('[data-ref="E10"]').innerText();
 console.log(t.replace(/\n+/g,' | '));
 assert.match(t,/4\s?540/);assert.match(t,/3\s?470/);
 await pg.locator('.foot',{hasText:'Matkontot'}).first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(300);
 await h.shot(process.env.SHOT||'matbudget');
 // Nästa månad ärver budgeten
 await c('[data-act="ekoMonth"][data-d="1"]');assert.ok(await pg.locator('.foot',{hasText:'Samma budget som'}).count());
 console.log('PASS matbudget');
};
