// Samma emulerade innehåll i varje alternativ, för en rättvis bildjämförelse.
const gas=require('./gas');gas.ctx.setupRecipes();
gas.book.sheets.Uppgifter.rows.push([false,'Rensa kylen inför nästa veckoplan','2026-10-21','','','visuell-1','egen',''],[false,'Boka tandläkartid','2026-10-22','Henrik','','visuell-2','egen',''],[false,'Följ upp veckoplanen','2026-10-24','Cornelia','','visuell-3','egen','']);
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(400)},nav=async id=>{if(await pg.locator('.nav-mini.on').isVisible())await click('.nav-mini.on');await click('#nav [data-act="nav"][data-id="'+id+'"]')};
 for(const mode of ['flytande','profil','rad']){
  await click('[data-act="settings"]');await h.idle(400);const d=pg.locator('[data-k="pref-utseende"]');if(!await d.evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');await click('[data-act="addPlace"][data-id="'+mode+'"]');
  if(mode==='flytande'){await pg.locator('[data-act="addPlace"]').first().scrollIntoViewIfNeeded();await h.shot('installningar')}
  await click('[data-act="sheetClose"]');await nav('mat');await click('[data-act="matTab"][data-id="recept"]');await click('[data-act="matTab"][data-id="bank"]');await h.shot(mode+'-recept');await click('.create-menu>summary');await h.shot(mode+'-meny');await pg.keyboard.press('Escape');
  await nav('uppgifter');await click('[data-act="taskTab"][data-id="lista"]');await h.shot(mode+'-uppgifter');
  if(mode==='rad'){await click('[data-act="taskTab"][data-id="kalender"]');await h.shot('rad-kalender');await nav('mat');await click('[data-act="matTab"][data-id="inkop"]');await h.shot('rad-inkop')}
 }
 console.log('PASS: jämförbara skärmbilder, inga skrivningar av hushållsdata.');
};
