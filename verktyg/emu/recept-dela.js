// Dela en länk till appen (TikTok via oEmbed): ?delat_text=… öppnar Importera recept och gör ett utkast av bildtexten.
// Klistra in länk läser urklippet. Kör: node verktyg/emu/run.js verktyg/emu/recept-dela.js
const assert=require('node:assert/strict');
const CAP='Krämig pasta med svamp 🍄 Super enkel vardagsmiddag! 4 portioner Ingredienser: • 250 g pasta • 2 dl havregrädde • 200 g champinjoner • 1 gul lök • salt och peppar Gör så här: 1. Koka pastan. 2. Stek svamp och lök i smör. 3. Häll i grädden och låt puttra 5 min. #pasta #recept';
module.exports=async(pg,h)=>{h.gas.ctx.setupRecipes();
 const svar=(b,c=200,hd={})=>({getResponseCode:()=>c,getContentText:()=>b,getAllHeaders:()=>hd});
 h.gas.ctx.UrlFetchApp.fetch=u=>{h.gas.ctx.props_().setProperty('RECIPE_IMPORT_AT','0');if(/vm\.tiktok/.test(u))return svar('',301,{Location:'https://www.tiktok.com/@kocken/video/7311'});if(/oembed/.test(u))return svar(JSON.stringify({title:/7311/.test(decodeURIComponent(u))?CAP:'Recept i bio! #fyp',thumbnail_url:''}));return svar('<html></html>')};
 const bas=pg.url().split(/[?#]/)[0];
 // Android: TikTok delar texten med länken i
 await pg.goto(bas+'?delat_text='+encodeURIComponent('Kolla in den här videon! https://vm.tiktok.com/ZMabc/ #fyp'));await pg.waitForTimeout(2500);await h.idle(800);
 assert.equal(await pg.evaluate(()=>location.search),'','Delningen tas bort ur adressen');
 assert.equal(await pg.locator('[data-rf="title"]').inputValue(),'Krämig pasta med svamp');assert.equal(await pg.locator('[data-rf="portions"]').inputValue(),'4');
 assert.equal(await pg.locator('[data-ri="0:2:n"]').inputValue(),'champinjoner');assert.equal(await pg.locator('[data-rstep="2:t"]').inputValue(),'Häll i grädden och låt puttra 5 min.');
 await h.shot('recept-dela-utkast',true);
 // Importsidan med Klistra in länk: video utan recept i bildtexten ger tydligt fel och texten finns kvar
 await pg.locator('[data-rc="leave"]').first().click();await h.idle(300);await pg.locator('[data-rc="discard"]').first().click();await h.idle(300);
 await pg.evaluate(()=>window.__d("(RC.screen='import',S.view='mat',render())"));await h.idle(300);
 await pg.evaluate(()=>{navigator.clipboard.readText=async()=>'https://www.tiktok.com/@kocken/video/1'});
 await pg.locator('[data-rc="paste"]').click();await h.idle(800);
 assert.equal(await pg.locator('#rc-url').inputValue(),'https://www.tiktok.com/@kocken/video/1');assert(await pg.getByText(/Hittade inget recept i texten/).isVisible());assert.equal(await pg.locator('#rc-import-text').inputValue(),'Recept i bio! #fyp');
 await pg.evaluate(()=>window.__d("(RC.error='',RC.importText='',RC.importUrl='',render())"));await h.idle(200);await h.shot('recept-dela-import');
 console.log('SCENARIO OK: delad TikTok-länk blir utkast, Klistra in länk, video utan recept');
};
