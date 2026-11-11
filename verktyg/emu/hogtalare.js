// Högtalare och radio i Smart hem: brickor för högtalarna, bladet Spela (mediatyp, kanal, volym, högtalare), egna kanaler/Spotify och
// skriptet Ensam hemma med kanalfält. Kör med LS='{"haDemo":"1"}' (vägg: lägg till "wall":"1","me":"" och VP=1368x912).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const vagg=/"wall":"1"/.test(process.env.LS||'');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(600);
 await pg.locator('section.ha [data-act="nav"][data-id="hus"]').first().click();await h.idle(700);
 const t=pg.locator('.ha-med');assert.equal(await t.count(),2,'Två högtalare');
 assert.match(await t.first().innerText(),/Dancing Queen – ABBA/,'Stor spelar Spotify från mobilen');
 await t.first().evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-200));await h.idle(300);await h.shot('hog-1-brickor');
 // tryck på den tysta högtalaren: bladet öppnas med den vald
 await t.nth(1).locator('.ha-n').click();await h.idle(800);
 const F='form[data-form="haMedia"]';assert.equal(await pg.locator(F).count(),1,'Bladet öppnas');
 assert.equal(await pg.locator(F+' .ham-h[aria-pressed="true"]').count(),1,'Bara Liten vald');
 await pg.locator(F+' .ham-k:has-text("P3")').click();await h.idle(300);
 await pg.locator(F+' [data-act="haMedVol"][data-id="-5"]').click();await h.idle(300);
 assert.match(await pg.locator(F+' .ham-pct').innerText(),/30 %/,'Volym 35 → 30');
 if(!vagg){
  await h.shot('hog-2-blad');
  // egen Spotify-lista med ny mediatyp
  await pg.locator(F+' [data-act="hamNy"]').click();await h.idle(500);
  assert.equal(await pg.locator(F+' [data-act="hamNyKalla"][data-id="sp"]').count(),0,'Spotify startas från mobilen');
  await pg.locator(F+' [name="hamn"]').fill('Hundmusik');await pg.locator(F+' [name="hamt"]').fill('Lugnt');
  await pg.locator(F+' [name="hamq"]').fill('Lugna Favoriter');
  await h.shot('hog-3-lagg-till');
  await pg.locator(F+' [data-act="hamNySpara"]').click();await h.idle(700);
  assert.equal(await pg.locator(F+' .segc[data-seg="haMedTyp"]').count(),1,'Mediatyp-väljare visas med två typer');
  assert.match(await pg.locator(F+' .ham-k[aria-pressed="true"]').innerText(),/Hundmusik/,'Nya listan vald');
  await h.shot('hog-3b-spotify');
  await h.hold(F+' .ham-k[aria-pressed="true"]');await h.idle(600);
  assert.equal(await pg.locator(F+' [name="hamq"]').inputValue(),'Lugna Favoriter','Kanalen sparad');
  await pg.locator(F+' [data-act="hamNyAvbryt"]').click();await h.idle(400);
  await pg.locator(F+' [data-act="haMedTyp"][data-id="Radio"]').click();await h.idle(300);
  await pg.locator(F+' .ham-k:has-text("P3")').click();await h.idle(200);
 }
 await pg.locator(F+' [data-act="haMedSpela"]').click();await h.idle(900);
 assert.equal(await pg.locator(F).count(),0,'Bladet stängs');
 assert.match(await t.nth(1).innerText(),/P3/,'Liten spelar P3');
 // Översikten: två olika spelningar (Spotify på Stor, P3 på Liten) blir två kort med egna knappar
 await pg.locator('.rcp-top .back').click();await h.idle(700);
 const K=pg.locator('section.ha .hab-med');assert.equal(await K.count(),2,'Två kort');
 assert.match(await K.first().innerText(),/Dancing Queen/,'Spotify-kortet');assert.equal(await K.first().locator('.hab-steg').count(),2,'Föregående och nästa');
 assert.equal(await K.nth(1).locator('.hab-steg').count(),0,'Radio utan nästa');
 await K.first().evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-300));await h.idle(300);await h.shot('hog-8-tva-kort');
 assert.ok((await pg.locator('section.ha .hab-g > .ha-t:not(.hab-med)').count())>=2,'Lamporna får plats bredvid');
 const r=await K.nth(1).boundingBox(),y=r.y+r.height/2,x=r.x+r.width*.45;
 await pg.mouse.move(x,y);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(x+i*r.width*.02,y);await h.idle(16)}await pg.mouse.up();await h.idle(700);
 assert.ok(+(await K.nth(1).innerText()).match(/(\d+) %/)[1]>=40,'Dra åt höger höjer Litens volym');assert.match(await K.first().innerText(),/35 %/,'Stor orörd');
 await K.first().locator('[data-act="habMedSteg"][data-id="nasta"]').click();await h.idle(300);
 await pg.locator('section.ha [data-act="nav"][data-id="hus"]').first().click();await h.idle(700);
 // ikonen pausar
 await t.first().locator('.ha-i').click();await h.idle(500);assert.match(await t.first().innerText(),/Pausad/,'Pausad');
 // Ensam hemma visas som knappen Högtalare: Stäng av högtalare medan något spelar, annars öppnar den bladet i skriptläge
 const hk=pg.locator('[data-act="haScen"][data-id="script.ensam_hemma"]').first();
 assert.match(await hk.innerText(),/Stäng av/,'Knappen stänger av när något spelar');
 await hk.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-200));await h.idle(300);await h.shot('hog-5-stang-av');
 await hk.click();await h.idle(700);
 assert.equal(await pg.locator('.ha-med.on').count(),0,'Alla högtalare stoppade');
 assert.match(await hk.innerText(),/^Högtalare$/,'Knappen heter Högtalare igen');
 await hk.click();await h.idle(800);
 assert.match(await pg.locator(F+' h2').innerText(),/Högtalare/,'Skriptets blad');
 assert.match(await pg.locator(F+' [data-act="haMedSpela"]').innerText(),/Starta/,'Starta-knapp');
 await h.shot('hog-4-ensam-hemma');
 await pg.locator(F+' [data-act="haMedSpela"]').click();await h.idle(600);
 assert.equal(await pg.locator(F).count(),0,'Startat');
 assert.match(await hk.innerText(),/Stäng av/,'Samma knapp stänger av efter start');
};
