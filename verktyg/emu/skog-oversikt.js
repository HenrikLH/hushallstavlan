// Skog-översikten (ovny=h): helsidesbild, dagväljaren och Städ-fliken (sträckanimationen). LS='{"ovny":"h","haDemo":"1"}' T3DEMO=1 NOW=2026-10-18T12:10:00+02:00
module.exports=async(pg,h)=>{await h.idle(1800);const N=process.env.NAMN||'skog';
 if(await pg.locator('.nav-mini.on').isVisible())await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 if(!await pg.locator('.ot').count())throw new Error('ingen Skog-översikt');
 for(const k of['.ot-sch','.ot-gora','.ot-fod'])if(!await pg.locator(k).count())throw new Error('saknas '+k);
 if(await pg.locator('.ot-sch .ot-lnk').innerText()!=='')throw new Error('"Visa alla" står kvar');
 if(!await pg.locator('.ot-te.nu .ot-pb').count())throw new Error('ingen förloppsstapel på pågående händelse');
 await h.shot(N+'-start',true);
 const dg=pg.locator('.ot-dseg [data-id="2"]');if(await dg.count()){
  await dg.click();await h.idle(80);await h.shot(N+'-sträck');
  const w=await pg.locator('.ot-dseg>i').evaluate(e=>e.getBoundingClientRect().width/e.parentNode.getBoundingClientRect().width);console.log('tummens bredd mitt i',w.toFixed(2));
  await h.idle(700);if(await pg.locator('.ot-dseg [data-id="2"][aria-pressed="true"]').count()!==1)throw new Error('dag 3 valdes inte');
  const fl=pg.locator('.ot-flik [data-id="stad"]');await fl.click();await h.idle(800);
  if(await pg.locator('.ot-flik [data-id="stad"][aria-selected="true"]').count()!==1)throw new Error('Städ valdes inte')}
};
