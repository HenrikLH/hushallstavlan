const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await require('./alla-flikar')(pg,h);
 await pg.locator('[data-act="sheetClose"]').first().click();
 await pg.locator('#nav [data-act="nav"][data-id="mat"]').click();await h.idle(200);
 await pg.locator('[data-act="matTab"][data-id="recept"]').first().click();await h.idle(200);
 if(await pg.locator('.create-menu>summary').count())await pg.locator('.create-menu>summary').click();await pg.locator('[data-rc="new"]').click();await h.idle(400);
 assert(await pg.locator('[data-rc="save"]').isDisabled());assert(await pg.getByText(/Receptredigering kräver uppdaterad Kod.gs/).isVisible());
 await h.shot('recept-gammal-server',true);
 console.log('PASS: existing tabs on old workbook, new saves disabled until server setup.');
};
