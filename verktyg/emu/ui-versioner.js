// UI 2.0/3.0: riktiga användarhandlingar, emulerat kalkylark. Inga ACT-anrop.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await require('./alla-flikar')(pg,h);
 const click=async(s)=>{await pg.locator(s).first().click();await h.idle(450)};
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const start=await read('U3');
 const klass=()=>pg.locator('html').evaluate(x=>x.classList.contains('ui3'));
 assert.equal(await klass(),start);
 // Osparade hushållsfält och UI 2.0:s egna stilval överlever byte mellan versioner.
 const prefs=await pg.evaluate(()=>['segstil','flikrad','ovLayoutNy','wallLayoutNy'].map(k=>localStorage.getItem('ht.'+k)));
 const field=pg.locator('[name="budget"]');
 if(!(await field.isVisible()))await pg.locator('.u3-pref').filter({has:field}).locator('summary').click();
 const original=await field.inputValue();await field.fill('1234');
 await click('[data-act="uiVersion"][data-id="'+(start?'2':'3')+'"]');assert.equal(await klass(),!start);
 assert.equal(await pg.locator('[name="budget"]').inputValue(),'1234');
 await click('[data-act="uiVersion"][data-id="'+(start?'3':'2')+'"]');assert.equal(await klass(),start);
 assert.deepEqual(await pg.evaluate(()=>['segstil','flikrad','ovLayoutNy','wallLayoutNy'].map(k=>localStorage.getItem('ht.'+k))),prefs);
 // Avbryt lämnar hushållsdata orörda; gränssnittsvalet sparas per enhet direkt.
 await click('[data-act="sheetClose"]');await pg.reload();await h.idle(1600);assert.equal(await klass(),start);
 assert.equal(String(await read('settings().matbudget')||''),original);
 await click('#nav [data-act="nav"][data-id="uppgifter"]');
 await click('[data-act="taskTab"][data-id="lista"]');
 const task='UI-test uppgift';await pg.locator('form[data-form="taskQuick"] input').fill(task);await pg.locator('form[data-form="taskQuick"] input').press('Enter');await h.idle(1800);await h.waitFlush();
 let t=await read('D().tasks.find(x=>x.title==="'+task+'")');assert.ok(t,'Ny uppgift ska sparas');
 await click('[data-act="taskEdit"][data-id="'+t.id+'"]');
 await pg.locator('form[data-form="taskEdit"] [name="due"]').fill('2026-10-19');
 await pg.locator('form[data-form="taskEdit"] button').filter({hasText:'Spara'}).click();await h.idle(1500);await h.waitFlush();
 assert.equal(await read('D().tasks.find(x=>x.title==="'+task+'").due'),'2026-10-19');
 await click('[data-act="taskTab"][data-id="kalender"]');
 await click('[data-act="calMonth"][data-d="1"]');assert.equal(await read('S.calMonth'),'2026-11');
 await click('[data-act="calToday"]');
 await click('.cal-grid [data-act="calDay"][data-id="2026-10-19"]');
 assert.ok((await pg.locator('main').innerText()).includes(task),'Uppgiften ska finnas på rätt kalenderdag');await h.shot('uppgifter-kalender-vald');
 await click('[data-act="taskTab"][data-id="lista"]');await click('input[data-act="taskToggle"][data-id="'+t.id+'"]');await h.idle(1200);await h.waitFlush();
 assert.equal(await read('D().tasks.find(x=>x.title==="'+task+'").done'),true);
 await click('#nav [data-act="nav"][data-id="mat"]');await click('[data-act="matTab"][data-id="inkop"]');
 await pg.locator('form[data-form="shopQuick"] input').fill('UI-test äpplen');await pg.locator('form[data-form="shopQuick"] input').press('Enter');await h.idle(1600);await h.waitFlush();
 const item=await read('D().shop.find(x=>x.name==="UI-test äpplen")');assert.ok(item);
 await click('input[data-act="shopToggle"][data-id="'+item.id+'"]');await h.idle(1200);await h.waitFlush();assert.equal(await read('D().shop.find(x=>x.name==="UI-test äpplen").done'),true);
 if(start){await click('[data-act="shopMore"]');assert.ok(await pg.locator('[data-act="shopMoreImp"]').isVisible());await click('[data-act="sheetClose"]')}
 await click('[data-act="matTab"][data-id="recept"]');
 if(start){await pg.locator('form[data-form="recipeSearch"] input').fill('finnsinte123');await pg.locator('form[data-form="recipeSearch"] input').press('Enter');await h.idle(500);assert.equal(await pg.locator('.bank [data-act="recipe"]').count(),0);await h.shot('receptsok-tomt');await click('[data-act="recipeSearchClear"]');assert.equal(await pg.locator('form[data-form="recipeSearch"] input').inputValue(),'')}
 await click('main [data-act="recipe"]');await h.shot('recept');
 await click('[data-act="cook"]');assert.ok(await pg.locator('[aria-label="Matlagningsläge"]').isVisible());await h.shot('matlagningslage');
 if(await pg.locator('[data-act="cookStep"][data-d="1"]').count())await click('[data-act="cookStep"][data-d="1"]');
 await click('[data-act="cookClose"]');
 await click('#nav [data-act="nav"][data-id="oversikt"]');
 await click('[data-act="settings"]');
 if(start){for(const s of await pg.locator('.u3-pref:not([open])>summary').all())await s.click();await h.shot('installningar-oppna',true)}
 console.log('PASS: alla vyer, UI-byte/omstart, oförändrade UI2-val, uppgift skapa/ändra/kalender/avbocka, inköp och matlagning');
};
