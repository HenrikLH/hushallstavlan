#!/usr/bin/env node
/* Kodkarta: hitta rätt ställe i app.js, index.html och Kod.gs utan att läsa hela filerna.
   node verktyg/karta.js             avsnitten med radintervall (app.js, CSS i index.html, Kod.gs)
   node verktyg/karta.js <sökord>    var funktioner, konstanter, vyer (V.x) och handlingar (ACT.x) som matchar definieras
   node verktyg/karta.js -r <sökord> som ovan, plus raderna som använder namnet (data-act="…", anrop)
   Sökordet är ett reguljärt uttryck utan skiftlägeskänslighet. Läs sedan bara intervallet: Read med offset/limit. */
const fs=require('fs'),path=require('path');
const ROT=path.join(__dirname,'..');
const FILER=[['app.js',/^\/\* -{6,} *(.*?)(?: *-{6,} *\*\/|$)/],['index.html',/^\/\* ={3,} *(.*?)(?: *={3,} *\*\/|$)/],['apps-script/Kod.gs',/^\/\/ *(?:-{3,}|={3,}) *(.*?) *(?:-{3,}|={3,})?$|^\/\* -{3,} *(.*?) *-{3,}/]];
const las=f=>fs.readFileSync(path.join(ROT,f),'utf8').split('\n');
const kort=(s,n=110)=>{s=s.trim();return s.length>n?s.slice(0,n)+'…':s};

function avsnitt(){
  for(const [f,re] of FILER){
    const rader=las(f),hit=[];
    rader.forEach((r,i)=>{const m=r.match(re);if(m){const namn=(m[1]||m[2]||'').replace(/\*\/$/,'').replace(/[-=\s]+$/,'').trim();if(namn&&!(hit.length&&hit[hit.length-1].namn===namn))hit.push({rad:i+1,namn})}});
    console.log(`\n${f} (${rader.length} rader)`);
    hit.forEach((h,i)=>{const slut=(hit[i+1]?hit[i+1].rad:rader.length+1)-1;console.log(`  ${String(h.rad).padStart(5)}–${String(slut).padEnd(5)} ${kort(h.namn,80)}`)});
    if(f==='app.js'){
      const vy=[];rader.forEach((r,i)=>{const m=r.match(/^V\.(\w+)\s*=/);if(m)vy.push(`V.${m[1]}:${i+1}`);if(/^const ACT\s*=/.test(r))vy.push(`ACT:${i+1}`)});
      console.log('  vyer/handlingar: '+vy.join('  '));
    }
    if(f==='index.html'){const u=rader.findIndex(r=>/^html\.ui3\b/.test(r));if(u>=0)console.log(`  UI 3.0 (html.ui3) börjar på rad ${u+1}`)}
  }
}

// Definitioner: function x(, const/let/var x=, V.x=, ACT-nycklar ( x(…){ på egen rad inne i ACT), x:function
function definitioner(sok,medRef){
  const re=new RegExp(sok,'i');
  for(const [f] of FILER){
    const rader=las(f);let iAct=false;const ut=[],ref=[];
    rader.forEach((r,i)=>{
      if(/^const ACT\s*=/.test(r))iAct=true;
      const namn=[];let m;
      const defRe=/(?:^|[;{}\s(,])(?:function\s+([\w$]+)|(?:const|let|var)\s+([\w$]+)\s*=|V\.([\w$]+)\s*=|ACT\.([\w$]+)\s*=)/g;
      while((m=defRe.exec(r)))namn.push(m[1]||m[2]||(m[3]&&'V.'+m[3])||(m[4]&&'ACT.'+m[4]));
      if(iAct&&f==='app.js'){const a=r.match(/^ ([\w$]+)\s*\([^)]*\)\s*\{/);if(a)namn.push('ACT.'+a[1]);if(/^\};?\s*$/.test(r))iAct=false}
      const traff=namn.filter(n=>re.test(n));
      if(traff.length)ut.push(`  ${f}:${i+1}  [${traff.join(', ')}]  ${kort(r)}`);
      else if(medRef&&re.test(r))ref.push(`  ${f}:${i+1}  ${kort(r)}`);
    });
    if(ut.length||ref.length){console.log(`\n${f}`);ut.forEach(x=>console.log(x));if(ref.length){console.log(`  — används (${ref.length} rader${ref.length>40?', de 40 första':''}):`);ref.slice(0,40).forEach(x=>console.log(x))}}
  }
}

const arg=process.argv.slice(2);
if(!arg.length)avsnitt();
else if(arg[0]==='-r')definitioner(arg[1]||'.',true);
else definitioner(arg[0],false);
