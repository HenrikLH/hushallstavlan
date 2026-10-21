// Kontrollerar riktiga användarval mot gemensamma färgvariabler, även efter temabyte.
const assert=require('node:assert/strict'),gas=require('./gas');
const personRow=gas.book.sheets['Inställningar'].rows.find(r=>r[0]==='personer');
if(personRow)personRow[1]='Henrik:plommon, Cornelia:teal';
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(200)};
 const settings=async()=>{await click('.me-av:visible');const section=pg.locator('.pref-section[data-k="pref-personer"]');if(!await section.locator('[data-act="me"]').first().isVisible())await section.locator('summary').click()};
 const check=async cls=>{const result=await pg.locator('.me-av:visible span').first().evaluate((el,cls)=>{const probe=document.createElement('span');probe.style.backgroundColor='var(--'+(cls==='pg'?'accent':cls)+')';document.body.append(probe);const actual=getComputedStyle(el).backgroundColor,expected=getComputedStyle(probe).backgroundColor;probe.remove();return{actual,expected,cls:el.parentElement.className}},cls);assert(result.cls.includes(cls));assert.equal(result.actual,result.expected,JSON.stringify(result))};
 for(const [person,cls] of [['Henrik','p1'],['Cornelia','p2'],['','pg']]){
  await settings();await click('[data-act="me"][data-id="'+person+'"]');await click('[data-act="sheetClose"]');await click('#nav [data-act="nav"][data-id="mat"]');await check(cls);await h.shot('anvandare-'+(person||'gemensam'));
 }
 // Vald accent och Min färg följer användarbytet, utan omstart.
 await pg.evaluate(()=>window.__d("ACT.accent('teal')"));await h.idle(200);await check('pg');
 await pg.evaluate(()=>window.__d("ACT.accent('min')"));await h.idle(200);await check('pg');
 await settings();await click('[data-act="me"][data-id="Cornelia"]');await click('[data-act="sheetClose"]');await click('#nav [data-act="nav"][data-id="mat"]');await check('p2');
 await pg.evaluate(()=>window.__d("ACT.theme(S.theme==='dark'?'light':'dark')"));await h.idle(200);await check('p2');
 console.log('PASS: H/C följer personfärg, G följer accent, Min färg och temabyte fungerar.');
};
