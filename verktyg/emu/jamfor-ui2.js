// Jämför oförändrade UI 2.0-vyer. Avsiktliga komponentändringar granskas i plus-alternativ.js.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const dir=process.env.OUT||path.join(__dirname,'shots'),base=process.env.BASELINE||path.join(__dirname,'baseline-shots');
const recipeViews=new Set(['mat-recept.png','mat-bank.png','mat-efter.png','mat-inkop.png','vy-uppgifter.png','uppgifter.png','uppgifter-kalender.png','uppgifter-lista.png','vy-stad.png','vy-ekonomi.png']);
// Översikten fick väderremsan under hundarna (ht-v207) och vädergrafen en temperaturskala (ht-v208); granskas i skärmbilder till Henrik
// Veckokostnaden har ett nytt draghandtag: jämför oförändrad rubrik/meny ovanför det. Själva kortet täcks av animationer.js.
const motionViews=new Set(['mat.png','mat-vecka.png','mat-vecka-igen.png','vy-mat.png']);
const ovViews=new Set(['vy-oversikt.png','tillbaka.png','tillbaka-vader.png','tillbaka-fodelsedagar.png','vader.png']);
let n=0;for(const f of fs.readdirSync(base).filter(f=>f.endsWith('.png')&&!f.startsWith('installningar')&&!recipeViews.has(f)&&!ovViews.has(f))){
 const a=PNG.sync.read(fs.readFileSync(path.join(base,f))),b=PNG.sync.read(fs.readFileSync(path.join(dir,f)));
 assert.equal(a.width,b.width,f+' bredd');assert.equal(a.height,b.height,f+' höjd');let diff=0;
 const height=motionViews.has(f)?Math.min(a.height,Math.round(140*a.width/(process.env.SCREEN==='vagg'?1368:390))):a.height;
 for(let i=0;i<a.width*height*4;i+=4)if(Math.max(...[0,1,2].map(k=>Math.abs(a.data[i+k]-b.data[i+k])))>24)diff++;
 const pct=diff/(a.width*height);console.log(f+': '+(pct*100).toFixed(3)+' %');assert.ok(pct<.005,f+': UI 2.0 har ändrat utseende');n++;
}assert.ok(n>=4,'Alla oförändrade flikar ska jämföras');console.log('PASS: UI 2.0 matchar main i '+n+' oförändrade skärmbilder (tolerans 0,5 % för tidsberoende väderbilder).');
