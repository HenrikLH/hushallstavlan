// Scenbladet: ljusstyrka per lampa med −/+ och På/Av, sparas i scenen.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/scen-ljusstyrka.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 await pg.click('#main .hus-ny>summary');await h.idle(300);await pg.click('#main .hus-ny [data-act="habScNy"]');await h.idle(600);
 const wall=await pg.evaluate(()=>document.body.classList.contains('wall'));if(!wall)await pg.fill('#overlay input[name="habn"]','Läsa');
 const rad=pg.locator('#overlay .hab-ljr').filter({has:pg.locator('[data-act="habScB"]')}).first();
 if(!await rad.count())return fel('ingen ljusstyrka i bladet');
 const namn=(await rad.locator('.grow').innerText()).split('\n')[0];const f=await rad.locator('.hab-ljv').innerText();
 await rad.locator('[data-id$="|-10"]').click();await h.idle(200);
 const r2=pg.locator('#overlay .hab-ljr',{hasText:namn}).first();await r2.locator('[data-id$="|-10"]').click();await h.idle(200);
 const e=await r2.locator('.hab-ljv').innerText();console.log(namn,f,'→',e);if(parseInt(e)!==Math.max(10,Math.round(parseInt(f)/10)*10-20))fel('ljusstyrkan ändrades inte');
 await r2.scrollIntoViewIfNeeded();await h.shot('scen-ljusstyrka');
 // släck en annan lampa i scenen
 const r3=pg.locator('#overlay .hab-ljr').nth(1);await r3.locator('.hab-ljsw').click();await h.idle(300);
 if(await pg.locator('#overlay .hab-ljr').nth(1).locator('.hab-ljsw').isChecked())fel('brytaren slog inte av');
 await pg.click('#overlay button[type="submit"]');await h.idle(900);
 const sc=await pg.evaluate(()=>{const o=JSON.parse((window.__d('settings().onskelista'))||'[]').find(x=>x&&x.hab);return o&&o.sc.filter(Boolean).map(s=>s.l)});
 const l=sc&&sc[sc.length-1];console.log('sparad',JSON.stringify(l));
 if(!l||!Object.values(l).some(v=>v.on&&v.b===parseInt(e)))fel('ljusstyrkan sparades inte');if(!Object.values(l).some(v=>!v.on))fel('avslagen lampa sparades inte');
};
