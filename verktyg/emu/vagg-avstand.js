// Skog på väggen: mät luften mellan rutorna, skärmkanterna och sidomenyn på Översikt, och storleken på rumsknapparna i Smart hem.
// LS='{"wall":"1","me":"","ovny":"h","haDemo":"1"}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/vagg-avstand.js
module.exports=async(pg,h)=>{await h.idle(1800);
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1500);
 if(!await pg.locator('.ot-v').count())throw new Error('ingen Skog på väggen');
 if(process.env.PLAY==='0'){await pg.evaluate(()=>window.__d('(haMedia().forEach(m=>m.st="off"),render(),1)'));await h.idle(600)}
 const m=await pg.evaluate(()=>{const W=innerWidth,H=innerHeight,q=s=>document.querySelector(s),b=s=>{const e=q(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:Math.round(r.left),y:Math.round(r.top),R:Math.round(r.right),B:Math.round(r.bottom)}};
  const nav=b('#nav'),sch=b('.ot-v>.ot-sch'),hus=b('.ot-v>.ot-hus'),gora=b('.ot-v>.ot-gora'),stad=b('.ot-v>.ot-stad'),wx=b('.ot-v>.ot-wxk');
  const nu=b('.ot-v>.ot-nu'),tit=b('.ot-v .ot-brand b');const sido=q('#nav').classList.contains('sido'),tile=b('.ot-hus .ot-ti3');
  return{nav,wx,vänster:sch.x-(sido?nav.R:0),höger:W-hus.R,mellanrum:gora.y-sch.B,mellanrumX:hus.x-sch.R,nedre:sido?H-gora.B:nav.y-gora.B,navNedre:sido?null:H-nav.B,vaderTopp:wx&&wx.y,vaderHoger:wx&&W-wx.R,justNu:nu&&wx&&{tillVader:wx.x-nu.R,titel:tit&&nu.x-tit.R},rumsruta:tile&&(tile.R-tile.x)+'x'+(tile.B-tile.y),zoom:getComputedStyle(document.body).zoom}});
 console.log('MÅTT',JSON.stringify(m));
 await h.shot('vagg-avstand');
};
