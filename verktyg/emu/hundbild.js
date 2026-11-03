// Hundbilden (Geometrisk) i Översikt och Väder: skärmbilder hb-*.png, och närbilder av hundarna vid olika tidpunkter i animationen.
// Kör: LS='{"wxart":"geo","wxvy":"bild","hundar":"bada"}' NOW=2026-10-19T12:00:00+02:00 node verktyg/emu/run.js verktyg/emu/hundbild.js
// TIDER=ms,ms,… väljer tidpunkterna (standard 0,4200,7000,11000).
const path=require('node:path');
module.exports=async(pg,h)=>{
 const still=t=>pg.evaluate(async t=>{await Promise.all([...document.querySelectorAll('image')].map(e=>new Promise(ok=>{const im=new Image();im.onload=im.onerror=ok;im.src=e.getAttribute('href')})));document.getAnimations().forEach(a=>{a.pause();a.currentTime=t})},t);
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(400);await still(43750);
 if(await pg.locator('.hero').evaluate(e=>/NaN|undefined/.test(e.innerHTML)))throw new Error('NaN i översikten');
 const b=await pg.locator('.hero').boundingBox();
 await pg.screenshot({path:path.join(h.OUT,'hb-oversikt.png'),clip:{x:0,y:0,width:390,height:Math.min(844,b.y+b.height+8)}});
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(400);
 const T=(process.env.TIDER||'2000,4200,7000,11000').split(',').map(Number);
 for(const t of T){await still(t);const d=await pg.locator('.wx2 .fig-box').first().boundingBox();
  await pg.screenshot({path:path.join(h.OUT,'hb-hundar-'+t+'.png'),clip:{x:d.x+d.width*.12,y:d.y,width:d.width*.88,height:d.height*.95}})}
 await still(43750);await pg.locator('.wx2').screenshot({path:path.join(h.OUT,'hb-vader.png')});
};
