// Hemmet: flikraden utan Ekonomi och sidan Hemmet med brickor.
// Kör: node verktyg/emu/run.js verktyg/emu/hemmet.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 if(await pg.locator('#nav [data-id="ekonomi"]').count())fel('Ekonomi finns kvar i flikraden');
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('Hemmet öppnades inte');
 const rader=await pg.$$eval('#main [data-ref="H1"] [data-id]',x=>x.map(y=>y.dataset.id));console.log('Hemmet:',rader.join(', '));
 if(!rader.includes('ekonomi'))fel('Ekonomi saknas i Hemmet');
 await h.shot('hemmet');
 await pg.click('#main [data-act="nav"][data-id="ekonomi"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='ekonomi')fel('Ekonomi öppnades inte');
 if(!await pg.locator('#nav [data-id="hemmet"][aria-current="page"]').count())fel('Hemmet är inte markerad i flikraden');
 await h.shot('hemmet-ekonomi');
 await pg.click('#main .back[data-id="hemmet"]');await h.idle(900);
 if(await pg.evaluate(()=>document.body.dataset.view)!=='hemmet')fel('Bakåt gick inte till Hemmet');
};
