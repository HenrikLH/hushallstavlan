// När ett blad (Inställningar m.fl.) öppnas och stängs ritas sidan under inte om: samma element, scroll och animationer behålls,
// och bladet glider ner i stället för att försvinna tvärt. Kör: node verktyg/emu/run.js verktyg/emu/meny-stang.js  (även LS='{"ui":"2"}' och väggläge)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const wall=await read('S.wall');
 const vyer=wall?['oversikt']:['oversikt','mat','ekonomi','uppgifter'];
 for(const v of vyer){
  await pg.locator('#nav [data-id="'+v+'"]').first().click();await h.idle(800);
  await read(`window.scrollTo(0,Math.min(300,document.documentElement.scrollHeight-innerHeight));0`);await h.idle(200);
  const y0=await read('scrollY');
  await read(`document.querySelectorAll('#main *').forEach(e=>e.__m=1);0`);
  await read(`ACT.settings();0`);await h.idle(700);
  assert.equal(await read(`document.getElementById('overlay').dataset.k`),'settings');
  await pg.locator('#overlay [data-act="sheetClose"]').first().click();
  await pg.waitForTimeout(120);
  const mitt=await read(`(()=>{const p=document.querySelector('#overlay .sheet-panel');return p?Math.round(p.getBoundingClientRect().top):null})()`);
  await h.idle(500);
  const tom=await read(`document.getElementById('overlay').innerHTML===''`);
  const [kvar,alla]=await read(`(()=>{const a=[...document.querySelectorAll('#main *')].filter(e=>!e.closest('#split-out'));/* Dela en kostnad räknas av fältet, inte av omritningen */return [a.filter(e=>e.__m).length,a.length]})()`);
  const y1=await read('scrollY');
  console.log(v,'glider ner, panelens topp efter 120 ms:',mitt,'| borta:',tom,'| element kvar',kvar+'/'+alla,'| scroll',y0,'->',y1);
  assert(mitt!=null,'bladet syns under utgången');assert(tom,'bladet tas bort efteråt');assert.equal(y1,y0,'scrollen står kvar');
  assert(kvar/alla>(v==='oversikt'?.5:.99),'sidan under behålls');
  // Stäng genom att trycka utanför bladet
  await read(`ACT.settings();0`);await h.idle(600);
  await pg.mouse.click(200,30);await h.idle(600);
  assert(await read(`document.getElementById('overlay').innerHTML===''`),'tryck utanför stänger');
 }
 // Öppna nytt blad medan det gamla glider ut: det nya ska gå att trycka i
 await read(`ACT.settings();0`);await h.idle(600);
 await pg.locator('#overlay [data-act="sheetClose"]').first().click();await pg.waitForTimeout(60);
 await read(`ACT.settings();0`);await h.idle(500);
 assert.equal(await read(`getComputedStyle(document.getElementById('overlay')).pointerEvents`),'auto','nytt blad tar emot tryck');
 assert(await read(`!!document.querySelector('#overlay .sheet-panel')`),'nytt blad syns');
 await h.shot('meny-stang');
};
