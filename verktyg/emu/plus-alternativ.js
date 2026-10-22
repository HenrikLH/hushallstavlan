// Riktiga vyer och klick; endast emulatorns kalkylark ändras.
const assert=require('node:assert/strict');
require('./gas').ctx.setupRecipes();
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(400)},tab=async t=>{if(['bank','efter'].includes(t)&&!await pg.locator('[data-act="matTab"][data-id="'+t+'"]').count())await click('[data-act="matTab"][data-id="recept"]');await click('[data-act="matTab"][data-id="'+t+'"]')},nav=async v=>{if(await pg.locator('.nav-mini.on').isVisible())await click('.nav-mini.on');await click('#nav [data-act="nav"][data-id="'+v+'"]')};
 const original={menu:JSON.stringify(h.sheet('Matsedel')),shop:JSON.stringify(h.sheet('Inköp'))};
 const choose=async mode=>{await click('[data-act="settings"]');await h.idle(500);const details=pg.locator('[data-k="pref-utseende"]');if(!await details.evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');await click('[data-act="addPlace"][data-id="'+mode+'"]');assert.equal(await read('addPlace()'),mode);await click('[data-act="sheetClose"]')};
 const menu=async()=>{await click('.create-menu>summary');assert(await pg.locator('.create-options [data-rc="new"]').isVisible());assert(await pg.locator('.create-options [data-rc="import"]').isVisible())};
 for(const mode of ['flytande','profil','rad']){
  await choose(mode);await pg.reload();await h.idle(1300);assert.equal(await read('addPlace()'),mode);
  await nav('mat');await tab('bank');
  assert.equal(await pg.locator('.create-control').count(),1);
  const search=pg.locator('[data-rcform="search"] .rc-search');const colors=await search.evaluate(x=>[getComputedStyle(x).color,getComputedStyle(x.form.querySelector('input'),'::placeholder').color]);assert.equal(colors[0],colors[1]);
  await h.shot(mode+'-recept');await menu();await h.shot(mode+'-meny');await pg.keyboard.press('Escape');assert.equal(await pg.locator('.create-menu[open]').count(),0);
  await pg.locator('.create-menu>summary').focus();await pg.keyboard.press('Enter');assert.equal(await pg.locator('.create-menu[open]').count(),1);await click('#lt');assert.equal(await pg.locator('.create-menu[open]').count(),0);
  await menu();await click('[data-rc="import"]');assert(await pg.locator('#rc-import-text').isVisible());await h.shot(mode+'-import');await click('[data-rc="leave"]');
  await menu();await click('[data-rc="new"]');assert(await pg.locator('[data-rf="title"]').isVisible());await click('[data-rc="leave"]');
  await nav('uppgifter');await click('[data-act="taskTab"][data-id="lista"]');await h.shot(mode+'-uppgifter');
  if(mode==='rad'){await click('[data-form="taskQuick"] .add-go')}else await click('.create-control [data-act="taskAdd"]');
  assert(await pg.locator('#task-title').isVisible());await pg.locator('#task-title').fill('Test '+mode);await pg.locator('#task-title').press('Enter');await h.idle(300);await h.waitFlush();assert(h.sheet('Uppgifter').some(r=>r.includes('Test '+mode)));
  if(mode==='rad'){await pg.locator('[data-form="taskQuick"] input').fill('Snabb uppgift');await click('[data-form="taskQuick"] .add-go');await h.waitFlush();assert(h.sheet('Uppgifter').some(r=>r.includes('Snabb uppgift')))}
  await click('[data-act="taskTab"][data-id="kalender"]');await h.shot(mode+'-kalender');await click('.create-control [data-act="taskAdd"]');assert(await pg.locator('#task-title').isVisible());await click('[data-act="sheetClose"]');
  await nav('mat');await tab('inkop');await h.shot(mode+'-inkop');assert.equal(await pg.locator('[data-hold="shopImportYes"]').count(),1);
  if(mode==='rad')await click('[data-form="shopQuick"] .add-go');else await click('.create-control [data-act="shopAdd"]');assert(await pg.locator('form[data-form="shop"]').isVisible());await click('[data-act="sheetClose"]');
  if(mode==='flytande'){await tab('bank');await pg.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await h.idle(250);const b=await pg.locator('.create-flytande').boundingBox(),n=await pg.locator('#nav').boundingBox();assert(b.y+b.height<=n.y-8);assert(b.x>=0&&b.x+b.width<=pg.viewportSize().width);await h.shot('flytande-scroll');await pg.evaluate(()=>scrollTo(0,0))}
 }
 await tab('bank');const originalCount=await pg.locator('.bcard').count();assert(originalCount>0);
 await click('[data-rc="type"][data-id="v"]');await click('[data-rc="fav"]');await click('[data-rc="quick"]');assert.equal(await read('recipeFilterCount()'),3);await h.shot('filterkombination');
 await pg.locator('[data-rcform="search"] input').fill('finnsinte123');await pg.locator('[data-rcform="search"] input').press('Enter');await h.idle(250);assert.equal(await pg.locator('.bcard').count(),0);assert(await pg.getByText('Inga recept matchar dina val.',{exact:false}).isVisible());await h.shot('tomt-resultat');
 await tab('recept');assert.equal(await read('recipeFilterCount()'),0);await tab('bank');assert.equal(await read('recipeFilterCount()'),4);await click('[data-rc="clear"]');assert.equal(await read('recipeFilterCount()'),0);assert.equal(await pg.locator('.bcard').count(),originalCount);
 await pg.locator('[data-rcform="search"] input').fill('kikärtor');await click('.rc-search');assert((await pg.locator('.bcard').count())>0);await click('[data-rc="clear"]');
 const card=pg.locator('.bcard').first(),fav=card.locator('[data-act="favToggle"]');await fav.click();await h.idle(350);await h.waitFlush();await click('[data-rc="fav"]');assert(await pg.locator('.bcard').count()>0);await click('[data-rc="clear"]');
 await click('[data-rc="archived"]');assert((await pg.locator('main').innerText()).includes('Arkiverade'));await h.shot('arkiv');await click('[data-rc="leave"]');
 for(const t of ['recept','efter']){await tab(t);await click('[data-rc="quick"]');await h.shot(t+'-filter');assert.equal(await read('recipeFilterCount()'),1);await click('[data-rc="clear"]')}
 await menu();await click('[data-rc="new"]');assert.equal(await read('RC.edit.recipe.course'),'efterrätt');await click('[data-rc="leave"]');assert.equal(await pg.locator('[data-rc="resume"]').count(),0);
 assert.equal(JSON.stringify(h.sheet('Matsedel')),original.menu);assert.equal(JSON.stringify(h.sheet('Inköp')),original.shop);
 await choose('flytande');await click('[data-act="settings"]');const details=pg.locator('[data-k="pref-utseende"]');if(!await details.evaluate(x=>x.open))await details.locator('summary').click();await pg.locator('[data-act="addPlace"]').first().scrollIntoViewIfNeeded();await h.shot('installningar');await click('[data-act="sheetClose"]');
 // Befintlig editor/import/utkast/versionering och synk körs med samma verkliga meny.
 console.log('PASS PLUS: tre sparade/startade lägen; meny, tangentbord, sök/filter, lista/kalender, API-sparning och oförändrad matsedel/inköp.');
};
