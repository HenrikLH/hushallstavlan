// Bild av UI 5.0:s ⋯-meny i Inköp. Kör med LS={"ui":"5"}.
module.exports=async(pg,h)=>{
 await pg.click('#nav [data-act="nav"][data-id="mat"]');await h.idle(600);await pg.click('[data-act="matTab"][data-id="inkop"]');await h.idle(600);
 await h.shot('u5-inkop');await pg.click('.u5-dots');await h.idle(400);await h.shot('u5-inkop-meny');
 await pg.click('.u5-menu [data-act="shopMoreAsk"]');await h.idle(500);await h.shot('u5-inkop-tom');
};
