// Smart hem-rutan är adaptiv: när högtalare spelar ersätter ett gemensamt volymreglage de nedersta favoriterna.
// Kör med LS='{"haDemo":"1"}' (vägg: lägg till "wall":"1","me":"" och VP=1368x912). Demodatan har Stor spelande.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=/"wall":"1"/.test(process.env.LS||'');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 const box=pg.locator('section.ha'),kort=box.locator('.hab-med');
 const plats=async()=>(await box.locator('.hab-g > .ha-t:not(.hab-med)').evaluateAll(L=>L.map(e=>e.classList.contains('ha-ap')?2:1))).reduce((a,b)=>a+b,0);
 assert.equal(await kort.count(),1,'Volymkortet visas när Stor spelar');
 assert.ok(await plats()<=4,'Högst fyra favoritplatser när något spelar');
 assert.equal(await box.locator('.hab-g .ha-ap.on').count(),1,'Dammsugaren som städar är kvar');
 assert.match(await kort.innerText(),/Stor[\s\S]*Mix Megapol[\s\S]*35 %/,'Namn, kanal och volym');
 if(!vagg)await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));
 await h.idle(300);await h.shot('volym-1-en');
 await kort.locator('[data-act="habVol"][data-id="5"]').click();await h.idle(300);
 assert.match(await kort.locator('.ham-pct').innerText(),/40 %/,'Plus höjer till 40 %');
 // dra i reglaget till 80 %
 const b=await kort.locator('.ham-bar').boundingBox();await pg.mouse.click(b.x+b.width*.8,b.y+b.height/2);await h.idle(500);
 assert.match(await box.locator('.hab-med .ham-pct').innerText(),/80 %/,'Dra/tryck sätter 80 %');
 // två högtalare spelar (via Musik-bladet från kortet): ett reglage för båda
 const F='form[data-form="haMedia"]';
 await kort.locator('.ha-tx[data-act="habMedOpen"]').click();await h.idle(700);
 assert.equal(await pg.locator(F+' .ham-h[aria-pressed="true"]').count(),1,'Stor vald');
 await pg.locator(F+' .ham-h[data-id="media_player.liten"]').click();await pg.locator(F+' .ham-k:has-text("P3")').click();
 await pg.locator(F+' [data-act="haMedSpela"]').click();await h.idle(900);
 assert.equal(await kort.count(),1,'Fortfarande ett reglage');
 assert.match(await kort.innerText(),/Stor och Liten/,'Båda namnen');
 assert.match(await kort.locator('.ham-pct').innerText(),/80 %/,'Gemensam volym');
 await kort.locator('[data-act="habVol"][data-id="-5"]').click();await h.idle(300);
 assert.match(await kort.locator('.ham-pct').innerText(),/75 %/,'Minus sänker båda');
 await h.shot('volym-2-tva');
 // paus behåller kortet, tryck på namnet öppnar Musik med båda valda
 await kort.locator('[data-act="habMedTog"]').click();await h.idle(300);
 assert.equal(await kort.count(),1,'Kortet kvar när pausad');assert.match(await kort.innerText(),/Pausad/,'Pausad');
 await kort.locator('.ha-tx[data-act="habMedOpen"]').click();await h.idle(700);
 assert.equal(await pg.locator(F+' .ham-h[aria-pressed="true"]').count(),2,'Båda högtalarna valda');
 await pg.locator(F+' [data-act="haMedStopp"]').click();await h.idle(800);
 if(await pg.locator(F).count())await pg.keyboard.press('Escape'),await h.idle(500);
 assert.equal(await box.locator('.hab-med').count(),0,'Inget spelar: vanlig layout');
 assert.ok(await plats()>4,'Alla favoriter tillbaka');
 await h.shot('volym-3-inget');
};
