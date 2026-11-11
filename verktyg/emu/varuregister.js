// Varuregistret: Inställningar → Mat → Varor och priser. Koppla en ingrediens utan vara, välj produkt bland Willys förslag
// och godkänn alla förval. Valen sparas i onskelista ({vreg:1}) och finns kvar efter omladdning.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 // Förslagen som Kod.gs skriver i prisforslag finns i emulatorns data (fixtures/prisforslag.json). En rätt med en ingrediens som saknar vara
 await read(`(()=>{recipeById('insp-rotfruktsgratang-linser').groups[0].items.push({q:200,u:'g',n:'jackfrukt'});prisLadda(settings());PKR=new WeakMap();render();return 1})()`);
 assert.equal(await read("portHel(recipeById('insp-rotfruktsgratang-linser'))"),false);
 await click('[data-act="settings"]');
 const sum=pg.locator('details[data-k="pref-vardag"] > summary').first();await sum.evaluate(e=>e.scrollIntoView({block:'center'}));await sum.click();await h.idle(400);
 const lank=pg.locator('[data-act="varor"]').first();await lank.evaluate(e=>e.scrollIntoView({block:'center'}));console.log('Länk:',(await lank.innerText()).replace(/\n+/g,' '));await lank.click();await h.idle(600);
 assert.equal(await read('S.view'),'varor');assert.equal(await read('S.sheet'),null);
 assert.ok(await pg.locator('[data-act="varaOpen"][data-id="jackfrukt"][data-typ="ing"]').count(),'jackfrukt ska stå under Ingredienser utan vara');
 await h.shot(process.env.SHOT||'varuregister');
 // Vilken vara är det här?
 await click('[data-act="varaOpen"][data-id="jackfrukt"]');
 assert.equal(await read('S.sheet'),'vara');
 await pg.selectOption('[data-form="vara"] select[name="bas"]','frysta grönsaker');
 await h.shot((process.env.SHOT||'varuregister')+'-ingrediens');
 await click('[data-form="vara"] .tb.strong');
 assert.equal(await read("regGet().ing.jackfrukt"),'frysta grönsaker');
 assert.equal(await read("portHel(recipeById('insp-rotfruktsgratang-linser'))"),true);
 assert.equal(await pg.locator('[data-act="varaOpen"][data-id="jackfrukt"]').count(),0);
 // Välj produkt för gul lök
 const rad=pg.locator('[data-act="varaOpen"][data-id="gul lök"]').first();await rad.evaluate(e=>e.scrollIntoView({block:'center'}));await rad.click();await h.idle(500);
 assert.equal(await pg.locator('[data-form="vara"] input[name="val"]').count(),4);
 await pg.locator('[data-form="vara"] .vval').nth(2).click();await h.idle(200);
 await h.shot((process.env.SHOT||'varuregister')+'-produkt');
 await click('[data-form="vara"] .tb.strong');
 assert.equal(await read("regGet().v['gul lök'].c"),'101205796_ST');
 assert.equal(await read("Math.round(MV.vara('gul lök').kr*10)"),169);
 // Godkänn alla förval
 const fore=await read("varorBas().filter(k=>!regGet().v[k]).length");
 const alla=pg.locator('[data-act="varaAlla"]').first();await alla.evaluate(e=>e.scrollIntoView({block:'center'}));await alla.click();await h.idle(500);
 const efter=await read("varorBas().filter(k=>!regGet().v[k]).length");console.log('Utan vald produkt före/efter:',fore,efter);assert.ok(efter<fore);
 assert.equal(await read("regGet().v['gul lök'].c"),'101205796_ST','Godkänn alla ändrar inte ett eget val');
 assert.ok(!(await read("wishes().some(x=>x.vreg)")),'Registret räknas inte som önskemål');
 // Sparat i arket
 await h.waitFlush();await h.idle(500);
 await pg.reload();await h.idle(1500);
 assert.equal(await read("regGet().ing.jackfrukt"),'frysta grönsaker');assert.equal(await read("regGet().v['gul lök'].c"),'101205796_ST');
 console.log('PASS varuregister');
};
