// Sätt samman oförändrade appskärmbilder till jämförelsebilder för granskning.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
(async()=>{
 const root=process.env.PLUS_BILDER||path.join(__dirname,'../../outputs/plus-alternativ'),browser=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{}),page=await browser.newPage({viewport:{width:1234,height:960},deviceScaleFactor:1});
 for(const theme of ['dark','light'])for(const [view,label]of [['recept','Recept'],['uppgifter','Uppgifter']]){
  const cols=[['flytande','A · Flytande'],['profil','B · Vid profilen'],['rad','C · Vid raden']].map(([mode,title])=>'<section><h2>'+title+'</h2><img src="data:image/png;base64,'+fs.readFileSync(path.join(root,'telefon-'+theme,mode+'-'+view+'.png')).toString('base64')+'"></section>').join('');
  await page.setContent('<!doctype html><html lang="sv"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:'+(theme==='dark'?'#222;color:#f3f2ef':'#e7e5e0;color:#222')+';font:16px Arial,sans-serif}h1{font-size:22px;margin:0 0 8px}p{margin:0 0 14px;font-size:14px;opacity:.7}.grid{display:flex;gap:12px}section{width:390px;flex:none}h2{font-size:17px;margin:0 0 10px}img{display:block;width:390px;height:844px;border-radius:12px}</style><h1>'+label+' · Tre valbara placeringar</h1><p>Genomförd implementation · Riktiga skärmbilder från appen · '+(theme==='dark'?'Mörkt':'Ljust')+' läge</p><div class="grid">'+cols+'</div></html>');
  await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await page.screenshot({path:path.join(root,view+'-'+theme+'.png'),fullPage:true});
 }
 await browser.close();
})();
