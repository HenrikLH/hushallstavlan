// Hämtar receptets foto (og:image) från källsidan för inspirationsrecept som saknar img, och skriver in adressen i inspiration.json.
// Kör där nätet når receptsidorna (inte molnmiljön): node verktyg/matbilder-hamta.js [--alla]
const fs=require('fs'),path=require('path'),F=path.join(__dirname,'../inspiration.json');
const L=JSON.parse(fs.readFileSync(F,'utf8')),alla=process.argv.includes('--alla');
const abs=(u,b)=>{try{return new URL(u.replace(/&amp;/g,'&'),b).href}catch(e){return''}};
const ogImg=h=>{const m=h.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::url)?["'][^>]*>/i)||[];const c=(m[0]||'').match(/content=["']([^"']+)["']/i);if(c)return c[1];
 const j=h.match(/"image"\s*:\s*(?:\[\s*)?(?:\{[^}]*"url"\s*:\s*)?"([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i);return j?j[1]:''};
(async()=>{let n=0,fel=[];
 for(const r of L){if(!r.src||/instagram\.com/.test(r.src)||(r.img&&!alla))continue;
  try{const res=await fetch(r.src,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36','Accept-Language':'sv-SE,sv'},signal:AbortSignal.timeout(20000)});
   const u=res.ok?abs(ogImg(await res.text()),r.src):'';if(/^https:\/\//.test(u)){r.img=u;n++}else fel.push(r.id+' ('+res.status+')')}catch(e){fel.push(r.id+' ('+e.message+')')}}
 fs.writeFileSync(F,JSON.stringify(L));console.log('foton:',n,'saknas:',fel.length);fel.forEach(x=>console.log('  -',x))})();
