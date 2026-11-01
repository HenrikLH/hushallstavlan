// Granska större översiktsbild och klickvägen till vädret med riktiga komponenter.
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(400);
 if(process.env.WX_EMOJI_CSS){await pg.addStyleTag({path:process.env.WX_EMOJI_CSS});await pg.evaluate(()=>document.fonts.ready)}
 const freeze=async()=>pg.evaluate(async()=>{await Promise.all([...document.querySelectorAll('main image')].map(e=>new Promise((ok,no)=>{const im=new Image();im.onload=ok;im.onerror=no;im.src=e.getAttribute('href')})));document.getAnimations().forEach(a=>{a.pause();a.currentTime=43750})});
 await freeze();const hero=pg.locator('.hero.art-geo').first();assert.equal(await hero.count(),1);
 assert.equal(await hero.locator('.geo-hills').count(),3);
 assert.equal(await hero.evaluate(e=>/NaN|undefined/.test(e.innerHTML)),false);
 assert.equal(await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Ingen horisontell överrinning');
 await hero.screenshot({path:path.join(h.OUT,'oversikt-landskap.png')});
 await hero.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(350);await freeze();
 assert.equal(await read('S.view'),'vader');await pg.locator('.wx2').screenshot({path:path.join(h.OUT,'vader-landskap.png')});
 console.log('PASS större översiktsbild, landskapslager och väderlänk');
};
