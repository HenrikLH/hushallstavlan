// Tavla 3 (ny översikt h): rum-bladet och växlaren Att göra/Städ. LS='{"dev":"1","ovny":"h","haDemo":"1"}'
module.exports=async(pg,h)=>{await h.idle(1800);
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 if(!await pg.locator('.ot').count())throw new Error('ingen Tavla 3');
 await h.shot('t3-start');
 await pg.locator('.ot-seg [data-id="stad"]').click();await h.idle(700);
 if(await pg.locator('.ot-seg [data-id="stad"][aria-pressed="true"]').count()!==1)throw new Error('Städ valdes inte');
 await pg.locator('.ot-seg [data-id="gora"]').click();await h.idle(500);
 const r=pg.locator('.ot-rum').first();if(await r.count()){await r.scrollIntoViewIfNeeded();await r.click();await h.idle(900);
  if(!await pg.locator('.sheet [data-form="otRum"],.sheet-panel[data-form="otRum"]').count())throw new Error('rumbladet öppnades inte');
  await h.shot('t3-rum');
  const hit=pg.locator('.sheet [data-act="otArum"]').first();if(await hit.count()){await hit.click();await h.idle(900);await h.shot('t3-rum-flytta')}}
};
