// Inställningarna uppdelade per huvudflik: Personer · Mat, Hemmet, Översikt, Kalender, Att göra, Ekonomi, Födelsedagar · Utseende, Enheten, Utvecklarläge.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const open=async()=>{if(!await pg.locator('form[data-form="settings"]').isVisible()){await pg.locator('[data-act="settings"]').first().click();await h.idle(600)}};
 await open();
 assert.deepEqual(await pg.locator('.pref-section>summary span').allTextContents(),['Personer','Mat','Hemmet','Översikt','Kalender','Att göra','Ekonomi','Födelsedagar','Utseende','Enheten','Utvecklarläge']);
 assert.equal(await pg.locator('form[data-form="settings"] .pref-gap').count(),2);
 const where=async n=>pg.locator(n).first().evaluate(x=>x.closest('.pref-section').dataset.k.slice(5));
 for(const [s,k] of [['[name="budget"]','mat'],['[data-act="varor"]','mat'],['[data-act="lasstil"]','mat'],['[data-act="ekoMat"]','ekonomi'],['[data-act="presBud"]','fodelsedagar'],['[data-act="calVy"]','kalender'],['[data-act="fodMode"]','fodelsedagar'],['[name="haurl"]','hemmet'],['[data-act="arrange"]','oversikt'],['[data-act="wxvy"]','oversikt'],['[name="wd"]','attgora'],['[data-act="stadVy"]','attgora'],['[data-act="motion"]','utseende'],['[data-act="addPlace"]','utseende'],['[data-act="wall"]','enhet'],['[data-act="dev"]','avancerat']])assert.equal(await where(s),k,s);
 await h.shot('installningar-lista');
 for(const k of ['mat','hemmet','ekonomi','kalender','attgora','fodelsedagar']){await pg.locator('[data-k="pref-'+k+'"]>summary').click();await h.idle(700);await h.shot('installningar-'+k);await pg.locator('.pref-bk').click();await h.idle(500)}
 await pg.locator('[data-k="pref-kalender"]>summary').click();await pg.locator('[data-act="calVy"][data-id="vecka"]').click();await h.idle(400);assert.equal(await pg.evaluate(()=>window.__d('S.calVy')),'vecka');assert.equal(await pg.evaluate(()=>window.__d('lsGet("calVy")')),'vecka');await pg.locator('.pref-bk').click();
 // Ändrad städtid och budget sparas fortfarande från sina nya platser.
 await pg.locator('[data-k="pref-attgora"]>summary').click();await pg.locator('[name="wd"]').fill('25');await pg.locator('.pref-bk').click();
 await pg.locator('[data-k="pref-mat"]>summary').click();await pg.locator('[name="budget"]').fill('900');
 await pg.locator('form[data-form="settings"] .sheet-head .strong').click();await h.idle(1300);await h.waitFlush();
 assert.equal(String(await pg.evaluate(()=>window.__d('settings().stadtid_vardag'))),'25');assert.equal(String(await pg.evaluate(()=>window.__d('settings().matbudget'))),'900');
 console.log('PASS installningar-delar: elva delar i tre grupper, rätt plats för varje inställning, sparar städtid och budget');
};
