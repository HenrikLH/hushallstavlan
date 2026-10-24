const assert=require('node:assert/strict');
const gas=require('./gas');
gas.book.sheets['Städ'].rows.push(
 ['stad-bild-1','Kök','Diska eller töm och fyll diskmaskinen',1,10,'','','','','','','',''],
 ['stad-bild-2','Kök','Torka av bänkar, spis och diskho',1,5,'','','','','','','',''],
 ['stad-bild-3','Hundar','Diska hundskålarna och byt vatten',1,3,'','','','','','','',''],
 ['stad-bild-4','Vardagsrum','Dammsug vardagsrummet',7,10,'2026-10-10','','','','','','','']);
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(400)},read=s=>pg.evaluate(s=>window.__d(s),s),quick='form[data-form="cleanQuick"][data-room=""]';
 await click('#nav [data-act="nav"][data-id="stad"]');
 const original=await read('JSON.stringify(D().clean)'),choose=async mode=>{await click('[data-act="settings"]');if(!await pg.locator('[data-k="pref-utseende"]').evaluate(x=>x.open))await click('[data-k="pref-utseende"]>summary');await click('[data-act="addPlace"][data-id="'+mode+'"]');await click('[data-act="sheetClose"]')};
 for(const mode of ['profil','flytande','rad']){
  await choose(mode);await pg.reload();await h.idle(1300);assert.equal(await read('addPlace()'),mode);
  assert.equal(await pg.locator(quick).count(),mode==='profil'?0:1);assert.equal(await pg.locator('.head [data-act="cleanAdd"]').count(),mode==='profil'?1:0);assert.equal(await read('JSON.stringify(D().clean)'),original);
  await h.shot('stad-'+mode);
  if(mode==='profil'){const p=await pg.locator('.head .create-plus').boundingBox(),tools=await pg.locator('.head .tools').boundingBox();assert(p.width>=44&&p.height>=44);assert(Math.abs(p.y-tools.y)<16);await click('.head [data-act="cleanAdd"]');assert(await pg.locator('#clean-title').isVisible());await h.shot('stad-ny-syssla');await pg.locator('#clean-title').fill('Avbryt detta utkast');await click('[data-act="sheetClose"]');assert.equal(await read('JSON.stringify(D().clean)'),original)}
  else{await click(quick+' .add-go');assert(await pg.locator(quick+' input').evaluate(x=>x===document.activeElement));await pg.locator(quick+' input').blur()}
 }
 await choose('profil');await click('.head [data-act="cleanAdd"]');await pg.locator('#clean-title').fill('Dammtorka testhyllan');await pg.locator('form[data-form="cleanQuick"] .sheet-head button.strong').click();await h.idle(600);await h.waitFlush();
 assert.equal(await pg.locator('#clean-title').count(),0);assert.equal(await read('D().clean.filter(x=>x.title==="Dammtorka testhyllan").length'),1);assert(h.sheet('Städ').some(r=>r.includes('Dammtorka testhyllan')));
 // Befintliga snabbfält och rumsspecifika fält behåller sin sparning.
 await choose('rad');await pg.locator(quick+' input').fill('Dammtorka snabbhyllan');await pg.locator(quick+' input').press('Enter');await h.idle(600);await h.waitFlush();assert(h.sheet('Städ').some(r=>r.includes('Dammtorka snabbhyllan')));
 await choose('profil');await h.shot('stad-profil-sparad');console.log('PASS STÄD: profilplus/inget snabbfält; övriga två behåller fältet; omstart, Avbryt, tomt plus och två sparvägar till emulerad server.');
};
