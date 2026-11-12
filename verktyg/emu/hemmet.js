// Hemmet: Smart hem med alla reglage och kort för Födelsedagar och Ekonomi. LS hemStil=B ger små kort överst.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/hemmet.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 const st=()=>h.sheet('Inställningar'),setRow=(k,v)=>{const r=st().find(x=>x[0]===k);if(r)r[1]=v;else st().push([k,v])};
 setRow('fodelsedagar',JSON.stringify([{namn:'Leah',datum:'10-25',ar:2014},{namn:'Morfar',datum:'10-02'},{namn:'Anna',datum:'10-30',ar:1990},{namn:'Erik',datum:'11-14',ar:1988}]));
 setRow('ekonomi',JSON.stringify({shared:[{id:'a',name:'Hyra',amount:9800,period:'månad'},{id:'b',name:'El',amount:900,period:'månad'}],personal:{}}));
 setRow('ekonomi_inkomst',JSON.stringify({'2026-10':{Henrik:34000,Cornelia:26000}}));
 await pg.reload();await h.idle(1800);
 if(await pg.locator('#nav [data-id="ekonomi"]').count())fel('Ekonomi finns kvar i flikraden');
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('Hemmet öppnades inte');
 const t=await pg.locator('main').innerText();console.log('Hemmet:',t.replace(/\s+/g,' ').slice(0,300));
 for(const k of ['[data-ref="H1"] [data-id="ekonomi"]','[data-ref="H1"] [data-id="fod"]'])if(!await pg.locator('#main '+k).count())fel('saknas: '+k);
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
