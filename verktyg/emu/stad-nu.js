require('./stad-data');
module.exports=async(pg,h)=>{await pg.locator('#nav [data-act="nav"][data-id="stad"]').first().click();await h.idle(800);
 const H=await pg.evaluate(()=>Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));console.log('H',H);await pg.setViewportSize({width:390,height:Math.min(H,4000)});await h.idle(400);await h.shot('stad-nu-hel');};
