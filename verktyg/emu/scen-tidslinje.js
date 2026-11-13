// Scenens tidslinje: lägg till ett steg, flytta en lampa dit, spara; scenen kör steget senare (demo: på enheten).
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/scen-tidslinje.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 await pg.click('#main .hus-ny>summary');await h.idle(300);await pg.click('#main .hus-ny [data-act="habScNy"]');await h.idle(600);
 const wall=await pg.evaluate(()=>document.body.classList.contains('wall'));if(!wall)await pg.fill('#overlay input[name="habn"]','Läggdags');
 // alla av utom sovrum: slå av allt i Direkt, lägg sovrummet i nytt steg efter 5 min
 await pg.click('#overlay [data-act="habScStegNy"]');await h.idle(300);
 await pg.click('#overlay [data-act="habScStegM"][data-id="1|1"]');await h.idle(150);await pg.click('#overlay [data-act="habScStegM"][data-id="1|-1"]');await h.idle(150);
 const rub=await pg.locator('#overlay .hab-steg').nth(1).locator('.hab-steg-h .grow').innerText();console.log('steg',rub);if(rub!=='Efter 5 min')fel('stegets tid: '+rub);
 const sov=pg.locator('#overlay .hab-steg').first().locator('.hab-ljr',{hasText:'Sovrumslampa'});
 await sov.locator('summary').click();await h.idle(300);await h.shot('tidslinje-meny');
 await sov.locator('[data-act="habScFlytt"][data-id$="|1"]').click();await h.idle(400);
 if(!await pg.locator('#overlay .hab-steg').nth(1).locator('.hab-ljr',{hasText:'Sovrumslampa'}).count())fel('lampan flyttades inte');
 await pg.locator('#overlay .hab-steg').nth(1).scrollIntoViewIfNeeded();await h.shot('tidslinje');
 await pg.click('#overlay button[type="submit"]');await h.idle(900);
 const sc=await pg.evaluate(()=>{const o=JSON.parse(window.__d('settings().onskelista')||'[]').find(x=>x&&x.hab);return o.sc.filter(Boolean).pop()});
 console.log('sparad st',JSON.stringify(sc.st));if(!sc.st||sc.st[0].m!==5||!sc.st[0].l['light.sovrum'])fel('steget sparades inte');if(sc.l['light.sovrum'])fel('sovrummet ligger kvar i Direkt');
 // kör scenen: steget väntar (demo = enhetens timer), Ångra avbryter
 await pg.locator('#main .hus-sc .ha-st',{hasText:wall?'Scen':'Läggdags'}).last().click();await h.idle(400);
 const n=await pg.evaluate(()=>window.__d('(HA.senT||[]).length'));console.log('väntande steg',n);if(n!==1)fel('steget väntar inte');
 await pg.click('#main .hus-sc .hab-angra');await h.idle(300);
 if(await pg.evaluate(()=>window.__d('(HA.senT||[]).length')))fel('Ångra avbröt inte steget');
};
