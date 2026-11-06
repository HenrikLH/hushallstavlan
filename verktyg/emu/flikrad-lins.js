// UI 5.0: linsen i flikraden lyfts vid tryck, följer ett snabbt drag med eftersläp och sträckning och fjädrar in i fliken vid släpp.
// Kör: node verktyg/emu/run.js verktyg/emu/flikrad-lins.js  (FILM=1 sparar bildserie av ett snabbt drag)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{const read=s=>pg.evaluate(s=>window.__d(s),s);
 assert(await read('U5'),'UI 5.0 ska vara på');
 await pg.click('#nav [data-act="nav"][data-id="oversikt"]');await h.idle(600);
 const lins=()=>pg.evaluate(()=>{const p=document.querySelector('#nav .nav-pill'),r=p.getBoundingClientRect(),n=document.getElementById('nav');return{x:r.left+r.width/2,w:r.width,h:r.height,tr:p.style.transform,sc:p.style.scale,lyft:n.classList.contains('lyft')}});
 const knapp=async id=>{const b=await pg.locator('#nav [data-act="nav"][data-id="'+id+'"]').boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2}};
 const ids=await read("VIEWS.map(v=>v[0])"),a=await knapp(ids[0]),b=await knapp(ids[ids.length-1]);
 const vila=await lins();assert(vila.tr,'linsen ska styras av fjädrarna i UI 5.0');
 // snabbt drag: hela raden på ~5 bilder
 await pg.mouse.move(a.x,a.y);await pg.mouse.down();await pg.waitForTimeout(40);
 const film=[];const bild=async()=>{if(process.env.FILM)film.push(await pg.locator('#nav').screenshot())};
 const tryck=await lins();assert(tryck.lyft,'linsen ska lyftas vid tryck');
 let maxSx=0,eft=0;
 for(let i=1;i<=5;i++){const x=a.x+(b.x-a.x)*i/5;await pg.mouse.move(x,a.y);await pg.waitForTimeout(16);const l=await lins();maxSx=Math.max(maxSx,parseFloat(l.sc));eft=Math.max(eft,x-l.x);await bild()}
 console.log('största sträckning',maxSx.toFixed(3),'eftersläp px',eft.toFixed(1));
 if(await read('motionOn()'))assert(maxSx>1.2,'linsen ska växa och sträckas vid snabbt drag');
 await pg.mouse.up();await pg.waitForTimeout(60);const slapp=await lins();assert(!slapp.lyft,'linsen ska släppas');
 for(let i=0;i<6;i++){await pg.waitForTimeout(50);await bild()}
 await h.idle(900);
 assert.equal(await read('S.view'),ids[ids.length-1],'släpp över sista fliken ska byta dit');
 const slut=await lins();assert(Math.abs(slut.x-b.x)<3,'linsen ska landa mitt på fliken');assert(['1','1 1','1.0000 1.0000'].includes(slut.sc),'linsen ska bli normal igen: '+slut.sc);
 // tryck på en flik: linsen glider dit
 await pg.click('#nav [data-act="nav"][data-id="'+ids[1]+'"]');await h.idle(900);
 const t=await lins(),k=await knapp(ids[1]);assert(Math.abs(t.x-k.x)<3,'tryck ska flytta linsen');
 if(process.env.FILM){const fs=require('fs'),dir=process.env.FILM;fs.mkdirSync(dir,{recursive:true});film.forEach((f,i)=>fs.writeFileSync(dir+'/f'+String(i).padStart(2,'0')+'.png',f))}
 console.log('PASS FLIKRAD LINS')};
