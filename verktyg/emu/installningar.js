// Personval, utfällning, formulärutkast och namnbyte med befintliga personkopplingar.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{const el=pg.locator(s).first();if(!await el.isVisible()){const d=pg.locator('.pref-section').filter({has:el});if(await d.count())await d.locator('summary').click()}await el.click();await h.idle(400)};
 const orig=await read('({people:personList(),me:S.me,accent:ACCENT,theme:S.theme})'),ids=orig.people.map(x=>x.n),label='Alex, Test: 🧪';
 assert.deepEqual(await pg.locator('.pref-section>summary span').allTextContents(),['Personer','Utseende','Mat och städ','Översikt och väder','Enheten','Avancerat']);
 for(const [name,section] of [['budget','vardag'],['p1','personer']])assert.equal(await pg.locator('[name="'+name+'"]').evaluate(x=>x.closest('.pref-section').dataset.k),'pref-'+section);
 await click('.pref-section[data-k="pref-personer"]>summary');await h.shot('personer-lista');
 await click('[data-act="personFold"][data-id="0"]');assert.equal(await read('S.me'),orig.me);
 await pg.locator('[name="p1"]').fill('Utkast');
 await pg.locator('label').filter({has:pg.locator('input[data-change="personColor"][data-id="0"][value="gron"]')}).first().click();await h.idle(500);
 assert.equal(await pg.locator('[name="p1"]').inputValue(),'Utkast');assert.equal(await pg.locator('[name="c1"]').inputValue(),'gron');assert.ok(await pg.locator('[data-strip="pc0"]').evaluate(x=>x.scrollLeft>0),'Färgraden ska behålla scrollpositionen');assert.equal(await read('personLabel(people()[0])'),orig.people[0].label);
 await click('.person-select[data-id="'+ids[0]+'"]');assert.equal(await read('S.me'),ids[0]);
 await click('[data-act="personFold"][data-id="0"]');await click('[data-act="personFold"][data-id="0"]');assert.equal(await pg.locator('[name="p1"]').inputValue(),'Utkast');
 await click('[data-act="sheetClose"]');await click('[data-act="settings"]');assert.equal(await pg.locator('[name="p1"]').inputValue(),orig.people[0].label);assert.equal(await read('personColor(0)'),orig.people[0].c||'indigo');
 // All fixtures live in the emulator. Existing records must never be renamed or reassigned.
 const st=h.sheet('Inställningar'),put=(k,v)=>{const r=st.find(r=>r[0]===k);if(r)r[1]=JSON.stringify(v);else st.push([k,JSON.stringify(v)])};
 put('ekonomi',{personal:{[ids[0]]:[{id:'person-cost',name:'Testkostnad',amount:100,period:'månad'}]}});put('ekonomi_inkomst',{'2026-10':{[ids[0]]:20000,[ids[1]]:10000}});put('betyg',{'person-recipe':{p:{[ids[0]]:{s:4,v:'igen'}}}});
 h.sheet('Uppgifter').push([false,'Gammal uppgift','2026-10-19',ids[0],'','person-task','egen','']);
 h.sheet('Städ').push(['person-clean','Kök','Gammal syssla',1,5,'','','',ids[0],'','','','']);
 h.sheet('Händelser').push(['2026-10-19','09:00','Möte',ids[0],'kalender','person-event','']);
 await pg.reload();await h.idle(1400);await click('[data-act="settings"]');await click('[data-act="personFold"][data-id="0"]');
 await pg.locator('[name="p1"]').fill(orig.people[0].label);
 await pg.locator('label').filter({has:pg.locator('input[data-change="personColor"][data-id="0"][value="gron"]')}).first().click();await h.idle(400);await h.shot('personer-andra');
 await pg.locator('[name="p1"]').fill(label);
 await click('form[data-form="settings"] .sheet-head .strong');await h.idle(1300);await h.waitFlush();
 assert.deepEqual(await read('people()'),ids);assert.equal(await read('personLabel(people()[0])'),label);assert.equal(await read('personColor(0)'),'gron');assert.equal(await read('S.me'),ids[0]);
 assert.equal(await read('D().tasks.find(x=>x.id==="person-task").who'),ids[0]);assert.equal(await read('D().clean.find(x=>x.id==="person-clean").who'),ids[0]);assert.equal(await read('D().events.find(x=>x.id==="person-event").who'),ids[0]);
 assert.equal(await read('ekoCalc("2026-10").per.find(x=>x.p===people()[0]).inc'),20000);assert.equal(await read('ekoData().personal[people()[0]][0].id'),'person-cost');assert.equal(await read('ratings()["person-recipe"].p[people()[0]].s'),4);
 assert.deepEqual(await read('({accent:ACCENT,theme:S.theme})'),{accent:orig.accent,theme:orig.theme});
 await click('#nav [data-act="nav"][data-id="uppgifter"]');await click('[data-act="taskTab"][data-id="lista"]');assert.ok((await pg.locator('main').innerText()).includes(label));
 await click('[data-act="taskEdit"][data-id="person-task"]');assert.equal(await pg.locator('[name="who"]').inputValue(),ids[0]);assert.equal(await pg.locator('[name="who"] option:checked').innerText(),label);await click('[data-act="sheetClose"]');
 await click('[data-act="taskTab"][data-id="kalender"]');await click('.cal-grid [data-act="calDay"][data-id="2026-10-19"]');assert.ok((await pg.locator('main').innerText()).includes(label));
 await pg.reload();await h.idle(1400);assert.equal(await read('personLabel(people()[0])'),label);assert.equal(await read('S.me'),ids[0]);
 await click('[data-act="settings"]');await click('[data-act="personFold"][data-id="0"]');
 await pg.locator('[name="p1"]').fill(orig.people[1].label);await click('form[data-form="settings"] .sheet-head .strong');assert.ok(await pg.locator('form[data-form="settings"]').isVisible());assert.equal(await read('personLabel(people()[0])'),label);
 // Restore display choices before the general scenario; IDs/fixtures deliberately remain for coverage.
 await pg.locator('[name="p1"]').fill(orig.people[0].label);
 const c='indigo';await pg.locator('label').filter({has:pg.locator('input[data-change="personColor"][data-id="0"][value="'+c+'"]')}).first().click();await h.idle(400);
 await click('form[data-form="settings"] .sheet-head .strong');await h.idle(1200);await h.waitFlush();assert.equal(await read('personLabel(people()[0])'),orig.people[0].label);
 await click('[data-act="settings"]');await click('[data-act="me"][data-id="'+orig.me+'"]');
 await click('[data-act="farg"]');assert.equal(await pg.locator('[data-change="pcol"]').count(),0);await click('#overlay [data-act="settings"]');
 assert.ok(await pg.locator('form[data-form="settings"]').isVisible());console.log('PASS: inställningskategorier, separat användarval/pil, färg/namnutkast, Avbryt, namnbyte/omstart, stabila uppgifts-/kalender-/ekonomi-/betygskopplingar och oförändrat tema');
};
