require('./stad-data');const fs=require('fs');
module.exports=async(pg,h)=>{await pg.locator('#nav [data-act="nav"][data-id="stad"]').first().click();await h.idle(800);
 const src=fs.readFileSync(__dirname+'/stad-forslag-bygg.js','utf8');const P=process.env.P||'A';
 await pg.evaluate(([src,P])=>{window.__render=window.__d('render');window.__d('render=()=>{};doRender=()=>{}');window.__d('('+src+')('+JSON.stringify(P)+')')},[src,P]);await h.idle(500);
 const H=await pg.evaluate(()=>Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));console.log('H',H);await pg.setViewportSize({width:390,height:Math.max(844,H)});await h.idle(300);await h.shot('stad-forslag-'+P+(process.env.THEME||''));};
