// Röktest: öppnar varje flik och undersida en gång och tar en bild av varje.
// Kör: node verktyg/emu/run.js verktyg/emu/alla-flikar.js   (avslutas med kod 1 om sidan kraschar)
// Med väggläge: LS='{"wall":"1"}' node verktyg/emu/run.js verktyg/emu/alla-flikar.js
module.exports=async(pg,h)=>{
 const kor=async(js,namn)=>{await pg.evaluate(s=>window.__d(s),js);await h.idle(700);
  const fel=await pg.evaluate(()=>{const b=[...document.querySelectorAll('.banner')].find(x=>/Något gick fel/.test(x.textContent));return b?b.textContent:''});
  if(fel){console.log('PAGEERROR (banner) '+namn+': '+fel);process.exitCode=1}await h.shot(namn)};
 for(const v of ['oversikt','mat','uppgifter','stad','ekonomi'])await kor("ACT.nav('"+v+"')",'vy-'+v);
 await kor("ACT.nav('mat')",'mat');
 for(const t of ['vecka','recept','bank','efter','inkop'])await kor("ACT.matTab('"+t+"')",'mat-'+t);
 await kor("ACT.nav('oversikt')",'tillbaka');
 const inst=await pg.$('[data-act="settings"]');if(inst){await inst.click();await h.idle(700);await h.shot('installningar')}else console.log('Hittade ingen inställningsknapp');
};
