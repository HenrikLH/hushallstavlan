// Priser som går att lita på: gamla priser varnar i Inköp och i receptet, och en rätt med vara utan pris visar "minst X kr".
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const click=async s=>{await pg.locator(s).first().click();await h.idle(550)};
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 // Hämtningen i morse misslyckades (alla 503), senaste lyckade körningen var för över en vecka sedan
 const forr=await read("(()=>{const d=x=>{const t=new Date(Date.now()-x*864e5);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};S.data.settings.prislogg=JSON.stringify({tid:d(0)+' 05:28',senastOk:d(9)+' 05:28',medPris:0,varor:77,butik:'Willys Värnamo Gröndal (2204)'});return d(9)})()");
 // En rätt med en ingrediens som saknar pris
 const id='insp-rotfruktsgratang-linser';await read("(()=>{const r=recipeById('"+id+"');r.groups[0].items.push({q:1,u:'st',n:'jackfrukt'});PKR=new WeakMap();render();return 1})()");
 await click('#nav [data-id="mat"]');await click('[data-act="matTab"][data-id="inkop"]');
 const v=await pg.locator('.pris-gammal').first().innerText();console.log('Inköp:',v);assert.ok(v.includes(forr),v);
 await h.shot(process.env.SHOT||'priser-inkop');
 assert.equal(await read("portHel(recipeById('"+id+"'))"),false);assert.match(await read("portTxt(recipeById('"+id+"'),1)"),/^Minst /);
 assert.equal(await read("portHel(recipeById('linssoppa'))"),true);
 await click('[data-act="matTab"][data-id="vecka"]');
 if(await pg.locator('[data-act="recipe"][data-id="'+id+'"]').count())await click('[data-act="recipe"][data-id="'+id+'"]');
 const t=await pg.locator('.rc-price,.rcp-prisfot').first().innerText().catch(()=>'');console.log('Recept:',t.replace(/\n+/g,' | '));
 assert.match(t,/Minst/);assert.match(t,/kan vara inaktuella/);
 await pg.locator('.rc-price,.rcp-prisfot').first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(300);
 await h.shot((process.env.SHOT||'priser')+'-recept');
 console.log('PASS priser-tillit');
};
