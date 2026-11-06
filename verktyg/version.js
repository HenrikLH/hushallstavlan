#!/usr/bin/env node
/* Höj versionen inför publicering (AGENTS.md avsnitt 4, steg 2–3) i ett kommando:
   node verktyg/version.js           hämtar och slår ihop origin/main, löser krockar som bara gäller versionsnummer,
                                     och sätter VERSION, app.js?v= och ?v= för ändrade hjälpfiler ett steg över main
   node verktyg/version.js --utan-merge   bara höjningen (om du redan slagit ihop)
   Skriptet committar inte. Kvarstår krockar i annat än versionsnummer stannar det och visar filerna. */
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const ROT=path.join(__dirname,'..');
const sh=(c,tyst)=>execSync(c,{cwd:ROT,encoding:'utf8',stdio:tyst?['ignore','pipe','ignore']:['ignore','pipe','pipe']}).trim();
const HJALP=['matvaror.js','matpoang.js','restpoang.js','kottveg.js','config.js'];
const neutral=s=>s.replace(/ht-v\d+/g,'ht-vN').replace(/\?v=\d+/g,'?v=N');

if(!process.argv.includes('--utan-merge')){
  sh('git fetch -q origin main');
  try{sh('git merge --no-edit origin/main')}catch(e){
    const krock=sh('git diff --name-only --diff-filter=U').split('\n').filter(Boolean),kvar=[];
    for(const f of krock){
      if(!['sw.js','index.html'].includes(f)){kvar.push(f);continue}
      let ok=true;const t=fs.readFileSync(path.join(ROT,f),'utf8');
      // Varje krockblock: ta vår sida om båda sidor bara skiljer sig i versionsnummer (de skrivs om nedan ändå)
      const ny=t.replace(/<<<<<<< [^\n]*\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [^\n]*\n/g,(m,a,b)=>neutral(a)===neutral(b)?a:(ok=false,m));
      if(ok){fs.writeFileSync(path.join(ROT,f),ny);sh('git add '+f)}else kvar.push(f);
    }
    if(kvar.length){console.error('Krockar som måste lösas för hand: '+kvar.join(', ')+'\nLös dem, git add, och kör sedan: node verktyg/version.js --utan-merge');process.exit(1)}
    sh('git -c core.editor=true commit --no-edit');
    console.log('Slog ihop origin/main; versionskrockar lösta automatiskt.');
  }
}

const main=f=>{try{return sh('git show origin/main:'+f,true)}catch(e){return''}};
const tal=(t,re)=>Math.max(0,...[...t.matchAll(re)].map(m=>+m[1]));
const swL=fs.readFileSync(path.join(ROT,'sw.js'),'utf8'),ixL=fs.readFileSync(path.join(ROT,'index.html'),'utf8');
const swM=main('sw.js'),ixM=main('index.html');
const nyttNr=(re)=>Math.max(tal(swL,re),tal(ixL,re),tal(swM,re),tal(ixM,re))+1;
const byt={};
byt.ver=nyttNr(/ht-v(\d+)/g);
byt['app.js']=nyttNr(/app\.js\?v=(\d+)/g);
for(const f of HJALP){
  let andrad=false;try{andrad=sh('git diff --name-only origin/main -- '+f)!==''}catch(e){}
  const re=new RegExp(f.replace('.','\\.')+'\\?v=(\\d+)','g'),har=Math.max(tal(swL,re),tal(ixL,re)),mainNr=Math.max(tal(swM,re),tal(ixM,re));
  if(andrad&&har<=mainNr)byt[f]=mainNr+1;
}
const skriv=(f,t)=>{
  t=t.replace(/ht-v\d+/g,'ht-v'+byt.ver);
  for(const k of Object.keys(byt))if(k!=='ver')t=t.replace(new RegExp(k.replace('.','\\.')+'\\?v=\\d+','g'),k+'?v='+byt[k]);
  fs.writeFileSync(path.join(ROT,f),t);
};
skriv('sw.js',swL);skriv('index.html',ixL);
console.log(`ht-v${byt.ver}  app.js?v=${byt['app.js']}`+HJALP.filter(f=>byt[f]).map(f=>`  ${f}?v=${byt[f]}`).join(''));
console.log(`Skriv (ht-v${byt.ver}) i commit-meddelandet. Kvar: committa, ångra-gren version-fore-<namn> från origin/main, slå ihop, pusha, kolla Pages.`);
