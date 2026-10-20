// Röktest: klickar på varje flik och undersida en gång, som en människa, och tar en bild av varje.
// Kör: node verktyg/emu/run.js verktyg/emu/alla-flikar.js   (avslutas med kod 1 om något kraschar eller en knapp saknas)
// Väggtavlan: LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/alla-flikar.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const klick=async(sel,namn)=>{const el=await pg.$(sel);if(!el)return fel('knappen saknas: '+sel+' ('+namn+')');
  try{await el.scrollIntoViewIfNeeded({timeout:1000});await el.click({timeout:2000})}catch(e){return fel('gick inte att klicka: '+sel+' ('+namn+'): '+e.message)}
  await h.idle(700);
  const b=await pg.evaluate(()=>{const x=[...document.querySelectorAll('.banner')].find(y=>/Något gick fel/.test(y.textContent));return x?x.textContent:''});
  if(b)fel('(banner) '+namn+': '+b);await h.shot(namn)};
 for(const v of ['oversikt','mat','uppgifter','stad','ekonomi'])await klick('[data-act="nav"][data-id="'+v+'"]','vy-'+v);
 await klick('[data-act="nav"][data-id="mat"]','mat');
 for(const t of ['vecka','inkop','recept','bank','efter'])await klick('[data-act="matTab"][data-id="'+t+'"]','mat-'+t);
 await klick('[data-act="matTab"][data-id="vecka"]','mat-vecka-igen');
 await klick('[data-act="nav"][data-id="oversikt"]','tillbaka');
 await klick('[data-act="settings"]','installningar');
};
