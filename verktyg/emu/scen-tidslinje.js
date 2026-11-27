// Scenens tidslinje: Direkt → Vänta → Sedan → Vänta → Sedan. Samma lampa i flera steg (hallen tänds efter 5 min, släcks 10 min senare).
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/scen-tidslinje.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 await pg.click('#main .hus-ny>summary');await h.idle(300);await pg.click('#main .hus-ny [data-act="habScNy"]');await h.idle(600);
 const wall=await pg.evaluate(()=>document.body.classList.contains('wall'));if(!wall)await pg.fill('#overlay input[name="habn"]','Läggdags');
 // Direkt: släck hallen (den ska tändas i nästa steg)
 const steg=k=>pg.locator('#overlay .hab-fs:not(.vanta):not(.slut)').nth(k);
 const lagg=async(k,namn)=>{await steg(k).locator('.hab-add>summary').click();await h.idle(250);await steg(k).locator('.hab-add [data-act="habScIn"]',{hasText:namn}).click();await h.idle(300)};
 {const r=steg(0).locator('.hab-ljr',{hasText:'Hallen'});await r.locator('summary').click();await h.idle(300);await r.locator('[data-act="habScUt"]').click();await h.idle(400)}
 const kvar=await pg.evaluate(()=>window.__d("!!S.habSc.d.l['light.hall']"));const syns=await steg(0).locator('.hab-flytt-n',{hasText:/^Hallen$/}).count();console.log('hallen i Direkt',kvar,syns);if(kvar||syns)fel('hallen togs inte bort ur Direkt');
 // Vänta 5 min → tänd hallen
 await pg.click('#overlay [data-act="habScStegNy"]');await h.idle(400);
 const v1=await pg.locator('#overlay .hab-fs.vanta b').first().innerText();console.log('väntan',v1);if(v1!=='Vänta 5 min')fel('väntan: '+v1);
 await lagg(1,'Hallen');
 // Vänta 10 min → hallen (ska föreslå Släcks) + sovrummet släcks
 await pg.click('#overlay [data-act="habScStegNy"]');await h.idle(400);
 await pg.click('#overlay [data-act="habScStegM"][data-id="2|1"]');await h.idle(200);
 await steg(2).locator('.hab-add>summary').click();await h.idle(250);
 const forslag=await steg(2).locator('.hab-add [data-act="habScIn"]',{hasText:'Hallen'}).locator('.meta').innerText();console.log('hallen i steg 3:',forslag);if(forslag!=='Släcks')fel('hallen borde släckas i steg 3');
 await steg(2).locator('.hab-add [data-act="habScIn"]',{hasText:'Hallen'}).click();await h.idle(300);
 const slut=await pg.locator('#overlay .hab-fs.slut .grow>span').innerText();console.log('klart',slut);if(slut!=='Efter 15 min')fel('total tid: '+slut);
 await pg.locator('#overlay .hab-fl').scrollIntoViewIfNeeded();await pg.evaluate(()=>{const e=document.querySelector('#overlay .hab-fs.vanta');e&&e.scrollIntoView({block:'start'})});await h.idle(200);await h.shot('tidslinje');await pg.evaluate(()=>{const e=document.querySelector('#overlay .hab-fl');e&&e.scrollIntoView({block:'start'})});await h.idle(200);await h.shot('tidslinje-topp');
 if(process.env.MENY){await steg(2).locator('.hab-add>summary').click();await h.idle(300);await h.shot('tidslinje-meny')}
 await pg.click('#overlay button[type="submit"]');await h.idle(900);
 const sc=await pg.evaluate(()=>{const o=JSON.parse(window.__d('settings().onskelista')||'[]').find(x=>x&&x.hab);return o.sc.filter(Boolean).pop()});
 console.log('sparad st',JSON.stringify(sc.st));
 if(!sc.st||sc.st.length!==2||sc.st[0].m!==5||sc.st[1].m!==15||!sc.st[0].l['light.hall']||!sc.st[0].l['light.hall'].on||!sc.st[1].l['light.hall']||sc.st[1].l['light.hall'].on)fel('stegen sparades fel');
 if(sc.l['light.hall'])fel('hallen ligger kvar i Direkt');
 // öppna igen: samma tidslinje
 await pg.locator('#main .hus-sc .ha-st',{hasText:wall?'Scen':'Läggdags'}).last().dispatchEvent('pointerdown');await h.idle(1300);await pg.mouse.up();await h.idle(600);
 const n0=await pg.locator('#overlay .hab-fs.vanta').count();console.log('väntor efter omöppning',n0);
 if(n0){if(n0!==2)fel('tidslinjen lästes inte in igen');await pg.click('#overlay [data-act="habScTill"]');await h.idle(500)}
 // kör scenen: två steg väntar (demo = enhetens timer), Ångra avbryter
 await pg.locator('#main .hus-sc .ha-st',{hasText:wall?'Scen':'Läggdags'}).last().click();await h.idle(400);
 const n=await pg.evaluate(()=>window.__d('(HA.senT||[]).length'));console.log('väntande steg',n);if(n!==2)fel('stegen väntar inte');
 await pg.click('#main .hus-sc .hab-angra');await h.idle(300);
 if(await pg.evaluate(()=>window.__d('(HA.senT||[]).length')))fel('Ångra avbröt inte stegen');
};
