// Ändra befintliga scener: håll in en scen i Hemmet (egen, från Home Assistant eller Släck allt) öppnar scenbladet.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/scen-andra.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 const sel='#main .hus-sc .ha-st',wall=await pg.evaluate(()=>document.body.classList.contains('wall'));
 const hall=async txt=>{const t=pg.locator(sel,{hasText:txt}).first();await t.evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);const b=await t.boundingBox();
  await pg.mouse.move(b.x+b.width/2,b.y+b.height/2);await pg.mouse.down();await h.idle(1300);await pg.mouse.up();await h.idle(600)};
 const blad=()=>pg.evaluate(()=>{const o=document.querySelector('#overlay form');return o?o.dataset.form:''});
 const L=(await pg.locator(sel).allInnerTexts()).map(s=>s.trim());console.log('scener',L.join(', '));
 for(const n of L){await hall(n);const f=await blad();console.log(n,'=>',f);if(f!=='habSc')fel(n+' öppnade inte scenbladet');
  if(await pg.locator('#overlay [data-act=habScTill]').count())await pg.click('#overlay [data-act=habScTill]');else await pg.evaluate(()=>__d('closeSheets();render()'));await h.idle(500)}
 // Avbryt ska inte ändra något
 const fore=await pg.evaluate(()=>__d('JSON.stringify(habGet())'));
 const ha=L.find(n=>!['Morgon','Kväll','Film','Släck allt'].includes(n));if(!ha)return fel('ingen scen från Home Assistant i demon');
 await hall(ha);await pg.click('#overlay [data-act=habScTill]');await h.idle(500);
 if(await pg.evaluate(()=>__d('JSON.stringify(habGet())'))!==fore)fel('Avbryt ändrade scenerna');
 // byt namn och färg på scenen från Home Assistant, spara
 await hall(ha);await h.shot('scen-andra-ha');
 if(!wall)await pg.fill('#overlay input[name="habn"]','Hemma ensam');
 await pg.locator('#overlay [data-act="habScF"]').nth(2).click();await h.idle(300);
 await pg.click('#overlay button[type="submit"]');await h.idle(900);
 const efter=(await pg.locator(sel).allInnerTexts()).map(s=>s.trim());console.log('efter',efter.join(', '));
 const sp=JSON.parse(await pg.evaluate(()=>__d('JSON.stringify(habScLista(haData()).map(e=>e.s))')));console.log('sparat',JSON.stringify(sp));const k=sp.findIndex(s=>s.ha&&s.f);
 if(k<0)fel('scenen sparades inte med ny färg');if(!wall&&sp[k]&&sp[k].n!=='Hemma ensam')fel('nya namnet sparades inte');
 if(efter.length!==L.length)fel('antalet scener ändrades: '+L.length+' → '+efter.length);if(k!==L.indexOf(ha))fel('scenen bytte plats');
 // Ändra scener i plusmenyn: tryck på en rad öppnar bladet
 await pg.evaluate(()=>scrollTo(0,0));await h.idle(300);await pg.click('#main .hus-ny>summary');await h.idle(300);await h.shot('scen-andra-meny');
 await pg.click('#main .hus-ny [data-act="habOrdOpen"]');await h.idle(600);await h.shot('scen-andra-lista');
 await pg.locator('#overlay .hab-ordn').first().click();await h.idle(600);if(await blad()!=='habSc')fel('raden öppnade inte scenbladet');
};
