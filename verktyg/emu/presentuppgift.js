// Presentuppgift 14 dagar innan (Skog). T3DEMO=1 NOW=2026-10-18T12:10:00+02:00 LS='{"ovny":"h","haDemo":"1"}'
module.exports=async(pg,h)=>{await h.idle(1800);
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1000);
 const f=pg.locator('.ot-gora .ot-ti').first();const t=await f.innerText();console.log('överst i Att göra:',t.replace(/\n/g,' '));
 if(!/Köp present – /.test(t))throw new Error('presenten ligger inte överst');
 await pg.locator('.ot-gora').evaluate(e=>e.scrollIntoView({block:'center'}));await h.shot('pres-oversikt');
 await pg.locator('#nav [data-act="nav"][data-id="uppgifter"]').first().click();await h.idle(1000);
 const n=await pg.locator('.cell.pres').count();if(!n)throw new Error('ingen present i Att göra-fliken');await h.shot('pres-uppgifter');
 const k=await pg.locator('.cell.pres').first().innerText();console.log('första:',k.replace(/\n/g,' '));
 await pg.locator('.cell.pres input').first().click({force:true});await h.idle(1200);
 if(await pg.locator('.cell.pres').count()!==n-1)throw new Error('bockad present försvann inte');
 console.log('PASS presentuppgift')};
