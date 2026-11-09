// Röktest: klickar på varje flik och undersida en gång, som en människa, och tar en bild av varje.
// Kör: node verktyg/emu/run.js verktyg/emu/alla-flikar.js   (avslutas med kod 1 om något kraschar eller en knapp saknas)
// Väggtavlan: LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/alla-flikar.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const klick=async(sel,namn)=>{const el=await pg.$(sel);if(!el)return fel('knappen saknas: '+sel+' ('+namn+')');
  // ritades sidan om mellan sökning och klick (knappen byttes ut) letar vi upp den igen en gång
  const tryck=async e=>{await e.scrollIntoViewIfNeeded({timeout:1000});await e.click({timeout:2000})};
  try{await tryck(el)}catch(e){const ny=/not attached/.test(e.message)&&await pg.$(sel);try{if(!ny)throw e;await h.idle(300);await tryck(ny)}catch(e2){return fel('gick inte att klicka: '+sel+' ('+namn+'): '+e2.message)}}
  await h.idle(700);
  const b=await pg.evaluate(()=>{const x=[...document.querySelectorAll('.banner')].find(y=>/Något gick fel/.test(y.textContent));return x?x.textContent:''});
  if(b)fel('(banner) '+namn+': '+b);await h.shot(namn)};
 for(const v of ['oversikt','mat','kalender','uppgifter','ekonomi'])await klick('#nav [data-act="nav"][data-id="'+v+'"]','vy-'+v);
 await klick('#nav [data-act="nav"][data-id="uppgifter"]','uppgifter');
 for(const t of ['stad','lista','stad'])await klick('[data-act="taskTab"][data-id="'+t+'"]','attgora-'+t);
 // Att göra i menyraden kommer ihåg att man senast var i Städ; ett tryck till går till Uppgifter
 await klick('#nav [data-act="nav"][data-id="oversikt"]','oversikt-igen');await klick('#nav [data-act="nav"][data-id="uppgifter"]','attgora-minns');
 if(await pg.evaluate(()=>document.body.dataset.view)!=='stad')fel('Att göra öppnade inte Städ igen');
 await klick('#nav [data-act="nav"][data-id="uppgifter"]','attgora-uppgifter');
 if(await pg.evaluate(()=>document.body.dataset.view)!=='uppgifter')fel('Att göra gick inte till Uppgifter');
 await klick('[data-act="nav"][data-id="mat"]','mat');
 for(const t of ['vecka','inkop','recept','bank','efter'])await klick('[data-act="matTab"][data-id="'+t+'"]','mat-'+t);
 await klick('[data-act="matTab"][data-id="vecka"]','mat-vecka-igen');
 await klick('[data-act="nav"][data-id="oversikt"]','tillbaka');
 await klick('[data-act="nav"][data-id="vader"]','vader');
 await klick('[data-act="nav"][data-id="oversikt"]','tillbaka-vader');
 if(await pg.locator('[data-act="nav"][data-id="fod"]').count()){await klick('[data-act="nav"][data-id="fod"]','fodelsedagar');await klick('[data-act="nav"][data-id="oversikt"]','tillbaka-fodelsedagar')}
 await klick('[data-act="settings"]','installningar');
};
