// Skog: frostad skogsbakgrund överst på Översikt (förslag). LS='{"ovny":"h"}' (+ FROST=a|b|c via LS frost)
module.exports=async(pg,h)=>{await h.idle(1800);
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1400);
 if(!await pg.locator('.ot').count())throw new Error('ingen Skog-översikt');
 await h.shot('frost-topp');
 await pg.evaluate(()=>window.scrollTo(0,420));await h.idle(600);await h.shot('frost-scroll');
};
