// Hemmet: Smart hem med alla reglage och kort för Födelsedagar och Ekonomi.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/hemmet.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 const st=()=>h.sheet('Inställningar'),setRow=(k,v)=>{const r=st().find(x=>x[0]===k);if(r)r[1]=v;else st().push([k,v])};
 const fod=[{namn:'Leah',datum:'10-25',ar:2014},{namn:'Morfar',datum:'10-18',ar:1946},{namn:'Anna',datum:'10-30',ar:1990},{namn:'Erik',datum:'11-05',ar:1988},{namn:'Kalle',datum:'11-14',ar:1985}];
 // FODMANGA=1: fler än fem inom tre veckor, då visas två veckor
 if(process.env.FODMANGA)fod.push({namn:'Sara',datum:'10-20',ar:1992},{namn:'Olle',datum:'10-22',ar:2019},{namn:'Mia',datum:'11-03',ar:1979});
 setRow('fodelsedagar',JSON.stringify(fod));
 setRow('ekonomi',JSON.stringify({shared:[{id:'a',name:'Hyra',amount:9800,period:'månad'},{id:'b',name:'El',amount:900,period:'månad'}],personal:{}}));
 setRow('ekonomi_inkomst',JSON.stringify({'2026-10':{Henrik:34000,Cornelia:26000}}));
 await pg.reload();await h.idle(1800);
 if(await pg.locator('#nav [data-id="ekonomi"]').count())fel('Ekonomi finns kvar i flikraden');
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('Hemmet öppnades inte');
 const t=await pg.locator('main').innerText();console.log('Hemmet:',t.replace(/\s+/g,' ').slice(0,300));
 for(const k of ['[data-ref="H1"] [data-id="ekonomi"]','[data-ref="H1"] [data-id="fod"]'])if(!await pg.locator('#main '+k).count())fel('saknas: '+k);
 const fk=await pg.locator('#main [data-ref="H1"] .hem-fr').count(),rub=await pg.locator('#main [data-ref="H1"] .wh[data-id="fod"] .r').innerText().catch(()=>'');console.log('Födelsedagar:',fk,'rader,',rub);
 if(fk>(await pg.evaluate(()=>innerWidth>=700?8:5)))fel('för många födelsedagar');
 await h.shot('hemmet');await h.shot('hemmet-hel',true);
 await pg.click('#main [data-ref="H1"] .wh[data-id="ekonomi"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='ekonomi')fel('Ekonomi öppnades inte');
 if(!await pg.locator('#nav [data-id="hemmet"][aria-current="page"]').count())fel('Hemmet är inte markerad i flikraden');
 await pg.click('#main .back[data-id="hemmet"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('Bakåt gick inte till Hemmet');
 const rum=pg.locator('#main .ha-rh-k').first();
 if(await rum.count()){await rum.click();await h.idle(700);await h.shot('hemmet-rum');
  if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('rummet lämnade Hemmet');
  await pg.click('#main .back[data-act="haRumVy"]');await h.idle(700);
  if(!await pg.locator('#main [data-ref="H3"]').count())fel('tillbaka från rummet visade inte Hemmet')}
};
