// Molnen i himlen: öppna Översikt genom att klicka, mät molnens höjd och ta bilder (väder via WXSYM/WXCF, namn via NAMN)
module.exports=async(pg,h)=>{const n=process.env.NAMN||'moln';
 await pg.locator('[data-act="nav"][data-id="oversikt"]').first().click();await h.idle(900);
 const mat=async()=>pg.evaluate(()=>{const f=document.querySelector('.skyfx');if(!f)return null;const b=f.getBoundingClientRect();return[...f.querySelectorAll('.cl')].map(c=>{const r=c.getBoundingClientRect();return Math.round(r.top-b.top)+'/'+Math.round(r.bottom-b.top)}).join(' ')});
 console.log('översikt moln',await mat());await h.shot(n+'-hel',0);
 const e=pg.locator('.hero').first();if(await e.count())await e.screenshot({path:require('path').join(process.env.OUT||__dirname+'/shots',n+'-oversikt.png')});
};
