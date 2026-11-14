// Tavla 3 (ny översikt h): rummet zoomar ut och tillbaka, växlaren Att göra/Städ på telefonen, dagväljaren. LS='{"dev":"1","ovny":"h","haDemo":"1"}'
module.exports=async(pg,h)=>{await h.idle(1800);
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 if(!await pg.locator('.ot').count())throw new Error('ingen Tavla 3');
 for(const k of['.ot-head','.ot-sch','.ot-gora'])if(!await pg.locator(k).count())throw new Error('saknas '+k);
 await h.shot('t3-start');
 const dg=pg.locator('.ot-dseg [data-id="1"]');if(await dg.count()){await dg.click();await h.idle(500);if(await pg.locator('.ot-dseg [data-id="1"][aria-pressed="true"]').count()!==1)throw new Error('Imorgon valdes inte')}
 const fl=pg.locator('.ot-flik [data-id="stad"]');if(await fl.count()){await fl.scrollIntoViewIfNeeded();await fl.click();await h.idle(800);if(await pg.locator('.ot-flik [data-id="stad"][aria-selected="true"]').count()!==1)throw new Error('Städ valdes inte');await pg.locator('.ot-gora').evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);await h.shot('t3-stad')}
 const r=pg.locator('.ot-ti3 [data-act="otRum"],.ot-ik[data-act="otRum"]').nth(1);if(await r.count()){await r.scrollIntoViewIfNeeded();await r.click();await h.idle(250);await h.shot('t3-rum-zoom');await h.idle(900);
  if(!await pg.locator('.sheet.ot-zoom [data-form="otRum"]').count())throw new Error('rummet zoomade inte ut');
  await h.shot('t3-rum');
  await pg.mouse.click(30,30);await h.idle(1200);
  if(await pg.locator('.sheet [data-form="otRum"]').count())throw new Error('rummet stängdes inte vid tryck utanför')}
};
