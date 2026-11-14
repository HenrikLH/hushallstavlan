// Tavla 3 (ny översikt h): rum-bladet, rummets brytare, dagväljaren på telefonen. LS='{"dev":"1","ovny":"h","haDemo":"1"}'
module.exports=async(pg,h)=>{await h.idle(1800);
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 if(!await pg.locator('.ot').count())throw new Error('ingen Tavla 3');
 for(const k of['.ot-head','.ot-sch','.ot-gora'])if(!await pg.locator(k).count())throw new Error('saknas '+k);
 await h.shot('t3-start');
 const dg=pg.locator('.ot-dseg [data-id="1"]');if(await dg.count()){await dg.click();await h.idle(500);if(await pg.locator('.ot-dseg [data-id="1"][aria-pressed="true"]').count()!==1)throw new Error('Imorgon valdes inte');await h.shot('t3-imorgon')}
 const sw=pg.locator('.ot-sw').first();if(await sw.count()){const f=await sw.getAttribute('aria-checked');await sw.click();await h.idle(700);if(await pg.locator('.ot-sw').first().getAttribute('aria-checked')===f)throw new Error('brytaren ändrades inte')}
 const r=pg.locator('[data-act="otRum"]').first();if(await r.count()){await r.scrollIntoViewIfNeeded();await r.click();await h.idle(900);
  if(!await pg.locator('.sheet [data-form="otRum"],.sheet-panel[data-form="otRum"]').count())throw new Error('rumbladet öppnades inte');
  await h.shot('t3-rum')}
};
