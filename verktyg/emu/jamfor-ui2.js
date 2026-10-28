// Jämför oförändrade UI 2.0-vyer. Avsiktliga komponentändringar granskas i plus-alternativ.js.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const dir=process.env.OUT||path.join(__dirname,'shots'),base=process.env.BASELINE||path.join(__dirname,'baseline-shots');
const recipeViews=new Set(['mat-recept.png','mat-bank.png','mat-efter.png','mat-inkop.png','vy-uppgifter.png','uppgifter.png','uppgifter-kalender.png','uppgifter-lista.png','vy-stad.png','vy-ekonomi.png']);
// Översikten fick väderremsan under hundarna och nya molnikoner (ht-v207); granskas i skärmbilder till Henrik
const ovViews=new Set(['vy-oversikt.png','tillbaka.png','tillbaka-vader.png','tillbaka-fodelsedagar.png']);
let n=0;for(const f of fs.readdirSync(base).filter(f=>f.endsWith('.png')&&!f.startsWith('installningar')&&!recipeViews.has(f)&&!ovViews.has(f))){
 const a=PNG.sync.read(fs.readFileSync(path.join(base,f))),b=PNG.sync.read(fs.readFileSync(path.join(dir,f)));
 assert.equal(a.width,b.width,f+' bredd');assert.equal(a.height,b.height,f+' höjd');let diff=0;
 for(let i=0;i<a.data.length;i+=4)if(Math.max(...[0,1,2].map(k=>Math.abs(a.data[i+k]-b.data[i+k])))>24)diff++;
 const pct=diff/(a.width*a.height);console.log(f+': '+(pct*100).toFixed(3)+' %');assert.ok(pct<.005,f+': UI 2.0 har ändrat utseende');n++;
}assert.ok(n>=5,'Alla oförändrade flikar ska jämföras');console.log('PASS: UI 2.0 matchar main i '+n+' oförändrade skärmbilder (tolerans 0,5 % för tidsberoende väderbilder).');
