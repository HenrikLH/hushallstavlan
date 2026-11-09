// Utvecklarläge → Testa Smart hem: låtsaslampor, inget skickas till Home Assistant.
//   LS='{"dev":"1","haUrl":"https://falsk.example"}' node verktyg/emu/run.js verktyg/emu/smart-hem-test.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const ut=[];pg.on('request',r=>{if(/falsk\.example|127\.0\.0\.1:8777/.test(r.url())&&r.method()==='POST')ut.push(r.url())});
 await pg.locator('[data-act="settings"]').first().click();await h.idle(600);
 const knapp=pg.locator('[data-act="haTest"]');
 if(!await knapp.isVisible()){const av=pg.locator('#overlay').getByText('Avancerat',{exact:true}).first();await av.click();await h.idle(700)}
 await knapp.click();await h.idle(900);
 assert.match(await pg.locator('main').innerText(),/Testläge/,'Testläget syns');
 const t=pg.locator('main .ha-t[data-id="light.hall"]');
 await t.locator('.ha-i').click();await h.idle(600);
 assert.match(await t.innerText(),/På|%/,'Låtsaslampan tänds');
 await pg.locator('main [data-act="haScen"][data-id="scene.kvall"]').click();await h.idle(800);
 await h.shot('smart-hem-testlage');
 assert.equal(ut.length,0,'Inget skickat till Home Assistant: '+ut.join(' '));
 await pg.locator('main .back').click();await h.idle(800);
 assert.equal(await pg.locator('main').innerText().then(x=>/Testläge/.test(x)),false,'Testläget slutar när man lämnar vyn');
};
