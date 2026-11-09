// Smart hem: ton i kelvin (inzoomat på varma toner, Visa hela, −/+ 50 K) och egna favoriter med ton + ljusstyrka.
//   LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/smart-hem-ton.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 await pg.locator('section.ha .wh').click();await h.idle(1000);
 await pg.locator('main .ha-t[data-id="light.vardagsrum"] .ha-n').click();await h.idle(1300);
 const P='form[data-form="haLampa"] ',sub=async()=>{await pg.locator(P+'[data-act="haSub"][data-id="ton"]').click();await h.idle(700)},hem=async()=>{await pg.locator(P+'.ha-tbk').click();await h.idle(700)};
 assert.equal(await pg.locator(P+'.ha-fpb[data-act="haFavV"]').count(),3,'Favoriterna som prickar på huvudsidan');
 assert.equal(await pg.locator(P+'[data-hat]').count(),0,'Tonen ligger på undersidan');
 await sub();assert.equal(await pg.locator(P+'.ha-vs').count(),0,'Undersidan visar inte ljusreglaget'),k=async()=>parseInt((await pg.locator(P+'[data-hav="k"]').innerText()).replace(/\D/g,''));
 const k0=await k();assert.ok(k0>=1500&&k0<=2200,'Golvlampans stearin visas som varmt kelvin: '+k0);
 assert.match(await pg.locator(P+'.ha-tzb').innerText(),/Visa hela/,'Inzoomat som standard');
 assert.equal(await pg.locator(P+'input[data-hat]').getAttribute('max'),'2700','Reglaget slutar på 2 700 K');
 await pg.locator(P+'[data-act="haTonSteg"][data-id="-50"]').click();await h.idle(900);
 assert.equal(await k(),Math.round(k0/50)*50-50,'Minus = 50 K varmare');
 await h.shot('ton-1');
 await pg.locator(P+'.ha-tzb').click();await h.idle(900);
 assert.match(await pg.locator(P+'.ha-tzb').innerText(),/Visa varma/,'Hela skalan');
 assert.equal(await pg.locator(P+'input[data-hat]').getAttribute('max'),'6500','Hela skalan till 6 500 K');
 await pg.locator(P+'.ha-tzb').click();await h.idle(900);
 // spara favorit
 await pg.locator(P+'.ha-radc[data-act="haFavNy"]').click();await h.idle(900);
 const vagg=await pg.locator('[name="hafn"]').count()===0,NM=vagg?'Favorit 4':'Golvkväll';
 if(vagg)await pg.locator('form[data-form="haFav"] button[type="submit"]').click();else{await pg.locator('[name="hafn"]').fill('Golvkväll');await h.shot('ton-ny');await pg.locator('[name="hafn"]').press('Enter')}await h.idle(1100);
 assert.match(await pg.locator(P+'[data-hav="w"]').innerText(),new RegExp(NM),'Namnet visas vid tonen');await hem();
 const fav=pg.locator(P+'[data-act="haFavV"]').filter({hasText:NM});
 assert.equal(await fav.count(),1,'Favoriten finns');assert.ok(await fav.evaluate(e=>e.classList.contains('on')),'Favoriten är vald');
 assert.match(await pg.locator(P+'[data-act="haSub"]').innerText(),new RegExp(NM),'Namnet visas på raden');
 await h.shot('ton-fav');
 // använd Vitt, sedan favoriten igen
 await pg.locator(P+'[data-act="haFavV"]').filter({hasText:'Vitt'}).click();await h.idle(900);
 assert.match(await pg.locator(P+'[data-act="haSub"]').innerText(),/4\s?000 K/,'Vitt = 4 000 K');
 await pg.locator(P+'[data-act="haFavV"]').filter({hasText:NM}).click();await h.idle(900);
 assert.match(await pg.locator(P+'[data-act="haSub"]').innerText(),new RegExp(NM),'Favoriten ger tillbaka tonen');
 // håll in = blad, ta bort
 const b=await pg.locator(P+'[data-act="haFavV"]').filter({hasText:NM}).boundingBox();
 await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await pg.waitForTimeout(900);await pg.mouse.up();await h.idle(900);
 assert.equal(await pg.locator('form[data-form="haFav"]').count(),1,'Håll in öppnar favoriten');
 await h.shot('ton-red');
 await pg.locator('form[data-form="haFav"] [data-act="haFavDel"]').click();await h.idle(1100);
 assert.equal(await pg.locator(P+'[data-act="haFavV"]').filter({hasText:NM}).count(),0,'Borttagen');
 assert.equal(await pg.locator(P+'[data-act="haFavV"]').count(),3,'Vitt, Mys, Stearin kvar');
};
