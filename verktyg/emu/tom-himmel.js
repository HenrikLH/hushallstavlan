// Skog-telefonens topp med vädret bredvid klockan. LS='{"ovny":"h"}'
module.exports=async(pg,h)=>{await h.idle(1800);
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1400);
 if(!await pg.locator('.ot-t').count())throw new Error('ingen Skog-översikt');
 await h.shot('himmel-'+(process.env.TOPP||'nu'));
};
