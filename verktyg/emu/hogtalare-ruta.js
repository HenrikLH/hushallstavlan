// Högtalare-knappen som scenplats i Översiktens Smart hem-ruta (skriptet Ensam hemma). Kör med LS='{"haDemo":"1"}'.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 const box=pg.locator('section.ha');await box.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-90));await h.idle(300);
 await h.hold('section.ha [data-act="habScen"][data-id="2"]');await h.idle(700);
 const F='form[data-form="habSc"]';assert.equal(await pg.locator(F).count(),1,'Scenbladet');
 await pg.locator(F+' [data-act="habScTyp"][data-id="ha"]').click();await h.idle(300);
 await pg.locator(F+' [data-act="habScHa"][data-id="script.ensam_hemma"]').click();await h.idle(300);
 await pg.locator(F+' button[type="submit"]').click();await h.idle(900);
 const b=box.locator('[data-act="habScen"][data-id="2"]');
 assert.match(await b.innerText(),/Stäng av/,'Platsen visar Stäng av när något spelar');await h.shot('hog-6-ruta-stang');
 await b.click();await h.idle(700);assert.match(await b.innerText(),/^Högtalare$/,'Högtalare efter stopp');await h.shot('hog-7-ruta');
 await b.click();await h.idle(800);assert.equal(await pg.locator('form[data-form="haMedia"]').count(),1,'Bladet öppnas');
};
