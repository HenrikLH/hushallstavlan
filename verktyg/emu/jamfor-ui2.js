// Jämför UI 2.0 med PR:ens main-bas. Inställningarnas nya struktur är avsiktlig; övriga vyer och temat jämförs.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const dir=path.join(__dirname,'shots'),base=path.join(__dirname,'baseline-shots');
let n=0;for(const f of fs.readdirSync(base).filter(f=>f.endsWith('.png')&&!f.startsWith('installningar'))){
 const a=PNG.sync.read(fs.readFileSync(path.join(base,f))),b=PNG.sync.read(fs.readFileSync(path.join(dir,f)));
 assert.equal(a.width,b.width,f+' bredd');assert.equal(a.height,b.height,f+' höjd');let diff=0;
 for(let i=0;i<a.data.length;i+=4)if(Math.max(...[0,1,2].map(k=>Math.abs(a.data[i+k]-b.data[i+k])))>24)diff++;
 const pct=diff/(a.width*a.height);console.log(f+': '+(pct*100).toFixed(3)+' %');assert.ok(pct<.005,f+': UI 2.0 har ändrat utseende');n++;
}assert.ok(n>=15,'Alla flikar ska jämföras');console.log('PASS: UI 2.0 matchar main i '+n+' skärmbilder (tolerans 0,5 % för tidsberoende väderbilder).');
