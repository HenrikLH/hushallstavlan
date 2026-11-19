// Skog: Högtalare-scenen är en ruta bland rummen, inte bland scenerna. LS='{"wall":"1","me":"","ovny":"h","haDemo":"1"}' VP=1368x912 (eller telefon utan wall)
module.exports=async(pg,h)=>{await h.idle(1800);
 if(await pg.locator('.nav-mini.on').isVisible().catch(()=>false))await pg.locator('.nav-mini.on').click();
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(1200);
 const sc=await pg.locator('.ot-hus .ot-sc').innerText();if(/Högtalare|Stäng av/.test(sc))throw new Error('Högtalare ligger kvar bland scenerna: '+sc);
 const r=pg.locator('.ot-hus :is(.ot-tb,.ot-ik)[aria-label^="Högtalare"]');if(await r.count()!==1)throw new Error('ingen Högtalare-ruta bland rummen');
 console.log('Rutan:',await r.getAttribute('aria-label'));await h.shot('hogtalare-rum');
 await r.click();await h.idle(900);console.log('Efter tryck:',await r.getAttribute('aria-label'));
};
