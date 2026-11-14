// Tavla 3 (Skog) på väggen: det aktuella syns. Högtalare som spelar ger volym i Smart hem, SMHI-varning går före regnet i väderkortet.
// LS='{"wall":"1","me":"","ovny":"h","haDemo":"1"}' VP=1368x912 WXSYM=rain WXPR=0.8 [WXPLUS=1]
module.exports=async(pg,h)=>{await h.idle(1800);
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 if(!await pg.locator('.ot-v').count())throw new Error('ingen Tavla 3 på väggen');
 if(await pg.locator('.ot-hus .ot-med .hab-bar').count()!==1)throw new Error('volymen saknas när högtalaren spelar');
 const t=await pg.locator('.ot-mh').innerText();if(!/Spelar på Stor/.test(t))throw new Error('rubriken: '+t);
 const w=await pg.locator('.ot-wxk').innerText();console.log('Väderkortet:',w.replace(/\s+/g,' ').slice(0,90));
 await h.shot('t3-spelar');
 // dra volymen till 70 %
 const b=await pg.locator('.ot-med .hab-bar').boundingBox();await pg.mouse.click(b.x+b.width*.7,b.y+b.height/2);await h.idle(600);
 const p=await pg.locator('.ot-med .hab-bar').getAttribute('aria-valuenow');if(+p!==70)throw new Error('volymen blev '+p);
 // pausa: kortet stannar med Pausad
 await pg.locator('.ot-med [data-act="habMedTog"]').click();await h.idle(600);
 if(!/Pausad/.test(await pg.locator('.ot-mh').innerText()))throw new Error('Pausad syns inte');
 await pg.locator('.ot-med [data-act="habMedTog"]').click();await h.idle(400);
 // WXPLUS=1 ger en gul SMHI-varning (halka) som ska gå före regnet; annars ska regnet synas (WXSYM=rain WXPR=0.8)
 const w2=(await pg.locator('.ot-wxk').innerText()).replace(/\s+/g,' ');
 if(process.env.WXPLUS==='1'){if(!/Gul varning: halka/.test(w2))throw new Error('varningen syns inte: '+w2);await h.shot('t3-varning')}
 else if(+process.env.WXPR&&!/Regn nu|Regn resten|Regn väntas|Regn kl|paraply/i.test(w2))throw new Error('regnet syns inte: '+w2);
 // Just nu: diskmaskinen klar (Klar tar bort raden), robotdammsugaren städar (demo), läggdags efter 22 med tända lampor
 const rd=x=>pg.evaluate(x=>window.__d(x),x);
 if(await rd("new Date().getHours()")<22&&!/Dammsugaren: städar/.test(await pg.locator('.ot-nts').innerText()))throw new Error('robotraden saknas');
 await rd('(haData().apparater.find(a=>a.typ==="disk").st="finished",render(),1)');await h.idle(500);
 if(!/Diskmaskinen är klar/.test(await pg.locator('.ot-nts').innerText()))throw new Error('disk klar saknas');
 await h.shot('t3-notis');
 await pg.locator('.ot-nt.klar [data-act="otKvitt"]').click();await h.idle(500);
 if(/Diskmaskinen är klar/.test(await pg.locator('.ot-nts').innerText()))throw new Error('Klar tog inte bort raden');
 if(await rd("new Date().getHours()")>=22){const t=await pg.locator('.ot-nts').innerText();if(!/tänd/.test(t))throw new Error('läggdags saknas: '+t);await h.shot('t3-laggdags')}
 // WXT=-2 utan regn: frost i väderkortet
 if(+process.env.WXT<=0&&!+process.env.WXPR){const w=await pg.locator('.ot-wxk').innerText();if(!/Frost i natt|Minusgrader/.test(w))throw new Error('frosten syns inte: '+w)}
};
