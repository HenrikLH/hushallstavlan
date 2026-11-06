#!/usr/bin/env node
// Rutnummer: kontrollerar att varje nummer i app.js finns en gång och står i verktyg/rutor.json, och visar nästa lediga.
// Kör: node verktyg/rutor.js            lista + kontroll (kod 1 vid fel)
//      node verktyg/rutor.js M          nästa lediga nummer för Mat
//      node verktyg/rutor.js M2         var M2 finns i koden
// Ny ruta: ta nästa lediga, sätt RF('M28') / rgroup('M28',…) / refAdd(html,'M28') och skriv namnet i rutor.json.
// Tar du bort en ruta: flytta numret till "borttagna" så att det aldrig används igen.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),reg=JSON.parse(fs.readFileSync(path.join(__dirname,'rutor.json'),'utf8'));
const pre=Object.keys(reg.delar),re=new RegExp("'(["+pre.join('')+"])(\\d+)'",'g');
const src=fs.readFileSync(path.join(root,'app.js'),'utf8').split('\n'),hits={};
src.forEach((l,i)=>{for(const m of l.matchAll(re)){const id=m[1]+m[2];(hits[id]=hits[id]||[]).push(i+1)}});
const nr=id=>Number(id.slice(1)),alla=new Set([...Object.keys(hits),...Object.keys(reg.rutor),...reg.borttagna]);
const nasta=p=>p+(Math.max(0,...[...alla].filter(x=>x[0]===p).map(nr))+1);
const arg=process.argv[2];
if(arg&&pre.includes(arg)){console.log(nasta(arg));process.exit(0)}
if(arg){console.log(arg+' '+(reg.rutor[arg]||'(saknar namn)')+': app.js rad '+((hits[arg]||[]).join(', ')||'finns inte'));process.exit(0)}
const fel=[];
for(const [id,r] of Object.entries(hits)){if(r.length>1)fel.push(id+' står på flera ställen i app.js (rad '+r.join(', ')+'). Ett nummer ska finnas en gång.');
 if(reg.borttagna.includes(id))fel.push(id+' är borttaget och får inte användas igen. Ta '+nasta(id[0])+'.');
 else if(!reg.rutor[id])fel.push(id+' saknar namn i verktyg/rutor.json.')}
for(const id of Object.keys(reg.rutor))if(!hits[id])fel.push(id+' ('+reg.rutor[id]+') finns inte i app.js. Flytta det till "borttagna" om rutan är borttagen.');
for(const p of pre){const L=Object.keys(reg.rutor).filter(x=>x[0]===p).sort((a,b)=>nr(a)-nr(b));
 console.log(p+'  '+reg.delar[p]+'  (nästa: '+nasta(p)+')');L.forEach(id=>console.log('   '+id.padEnd(4)+' '+reg.rutor[id]+'  · rad '+(hits[id]||['?']).join(', ')))}
if(fel.length){console.log('\nFEL:\n'+fel.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('\nAlla '+Object.keys(hits).length+' rutnummer är unika och har namn.');
