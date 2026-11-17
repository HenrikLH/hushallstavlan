// Automationer i Hemmet: solljuset (soluppgång/solnedgång) och Home Assistants automationer med brytare, bladet där tiden ändras.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/solljus.js   (väggen: LS='{"haDemo":"1","wall":"1","me":""}' VP=1368x912)
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 const rader=async()=>(await pg.locator('#main .ha-aug .ha-au').allInnerTexts()).map(s=>s.replace(/\s+/g,' ').trim());
 const R=await rader();console.log('rader',JSON.stringify(R));
 if(R.length!==4)fel('väntade fyra rader (två solljus, två automationer), fick '+R.length);
 if(!/Soluppgång 1 tim efter soluppgången, \d\d\.\d\d/.test(R[0]||''))fel('soluppgångens rad: '+R[0]);
 if(!/Solnedgång 1 tim 15 min före solnedgången$/.test(R[1]||''))fel('solnedgångens rad (av): '+R[1]);
 if(!/Morgonljus i hallen Senast i går/.test(R[2]||''))fel('automationens rad: '+R[2]);
 await pg.locator('#main .ha-aug').first().scrollIntoViewIfNeeded();await h.idle(300);await h.shot('solljus-lista');
 // brytaren på en automation
 await pg.locator('#main .ha-aug [data-act="haAutoPa"]').nth(1).click();await h.idle(300);
 if(!await pg.evaluate(()=>__d('haData().auto[1].on')))fel('automationens brytare slog inte på');
 if(!/Robot städar tisdagar Har inte körts/.test((await rader())[3]))fel('raden ändrades inte: '+(await rader())[3]);
 // solnedgångens brytare
 await pg.locator('#main .ha-aug [data-act="haSolPa"][data-id="ned"]').click();await h.idle(300);
 if(!/Solnedgång 1 tim 15 min före solnedgången, \d\d\.\d\d/.test((await rader())[1]))fel('solnedgången slogs inte på: '+(await rader())[1]);
 // bladet: ändra tid, längd och kvällsljus
 await pg.click('#main .ha-aug [data-act="haSolOpen"][data-id="ned"]');await h.idle(700);
 if(await pg.evaluate(()=>(document.querySelector('#overlay form')||{}).dataset?.form)!=='haSol')return fel('bladet öppnades inte');
 const plus=id=>pg.click('#overlay [data-act="haSolSteg"][data-id="'+id+'"][data-d="1"]'),minus=id=>pg.click('#overlay [data-act="haSolSteg"][data-id="'+id+'"][data-d="-1"]');
 await plus('off');await plus('off');await h.idle(200);
 let t=await pg.locator('#overlay .ha-sol-r').first().innerText();console.log('tid',t.replace(/\s+/g,' '));
 if(!/45 min före solnedgången/i.test(t)||!/−0:45/.test(t))fel('förskjutningen blev inte 45 min före: '+t);
 for(let i=0;i<4;i++)await plus('off');await h.idle(200);t=await pg.locator('#overlay .ha-sol-r').first().innerText();
 if(!/15 min efter solnedgången/i.test(t)||!/\+0:15/.test(t))fel('kunde inte gå över till efter: '+t);
 await minus('min');await minus('slut');await plus('k');await plus('k');await h.idle(200);
 const x=JSON.parse(await pg.evaluate(()=>__d('JSON.stringify(haSolX("ned"))')));console.log('sparat lokalt',JSON.stringify(x));
 if(x.off!==15||x.min!==45||x.slut!==30||x.k!==2700)fel('värdena blev fel');
 const f=await pg.locator('#overlay .ha-sol-r').nth(2).innerText();if(!/Varmt och mysigt/.test(f)||!/2\s?700 K/.test(f))fel('färgraden: '+f);
 if(!await pg.locator('#overlay [data-act="haSolLampa"]').count())fel('inga lampor att välja');
 await h.shot('solljus-blad');
 await pg.click('#overlay [data-act="haSolNu"]');await h.idle(300);
 if(!await pg.locator('#overlay [data-act="haSolStopp"]').count())fel('Starta nu blev inte Stoppa');
 await pg.click('#overlay [data-act="sheetClose"]');await h.idle(600);
 if(!/Solnedgång Tonar nu, klart \d\d\.\d\d/.test((await rader())[1]))fel('raden visar inte att den tonar: '+(await rader())[1]);
};
