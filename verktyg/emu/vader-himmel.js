// Vädervyns himmel: öppna Väder genom att klicka och ta en bild (väderläget styrs med WXSYM/WXT/WXPR/NOW)
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(700);await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(900);
 if(!await pg.locator('.wx2').count())throw new Error('ingen vädervy');
 await h.shot(process.env.NAMN||'vader',0);
};
