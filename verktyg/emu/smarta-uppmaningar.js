// Smarta uppmaningar på Översikt, prov A–C. LS='{"ovny":"h","haDemo":"1","smartx":"a"}' T3DEMO=1 NOW=2026-10-18T16:10:00+02:00 NAMN=a
module.exports=async(pg,h)=>{await h.idle(1800);const N=process.env.NAMN||'smart';
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 const nv=pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first();if(await nv.isVisible())await nv.click();await h.idle(1200);
 if(!await pg.locator('.ot').count())throw new Error('ingen Skog-översikt');
 const x=JSON.parse(process.env.LS||'{}').smartx;
 if(x==='c'&&!process.env.LS.includes('wall')){if(!await pg.locator('.ot-sm .smk').count())throw new Error('inga förslagskort')}
 else if(!await pg.locator('.ot-nu').count())throw new Error('ingen Just nu');
 console.log('RADER',JSON.stringify(await pg.locator('.ot-nu .ot-ntt b, .smk b').allInnerTexts()));
 await h.shot(N,true);
};
