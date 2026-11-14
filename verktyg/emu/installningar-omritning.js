// Inställningar: en omritning i bakgrunden (synk, Smart hem, väder) ska inte bygga om bladet eller spela upp öppna-animationen igen
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('[data-act="settings"]').first().click();await h.idle(800);
 await pg.locator('.pref-section[data-k="pref-utseende"]>summary').click();await pg.waitForTimeout(700);
 const mat=()=>pg.evaluate(()=>{const b=document.querySelector('.pref-section[open]>.pref-body');window.__b0=b;window.__d('render()');return new Promise(r=>setTimeout(()=>{const n=document.querySelector('.pref-section[open]>.pref-body');r({samma:n===window.__b0,anim:n?n.getAnimations().filter(a=>a.playState==='running').length:-1})},60))});
 await mat();// första omritningen efter att delen öppnats tar med open-attributet
 const a=await mat();console.log('render utan ändring',JSON.stringify(a));
 // en ändring i bladet (annan text) ska ritas, men utan att delen glider in igen
 await pg.evaluate(()=>{window.__d('S.lastSync=new Date(Date.now()-60000)')});
 await pg.evaluate(()=>window.__d('S.hj.add("settings-utseende:0")'));
 const b=await mat();console.log('render med ändring',JSON.stringify(b));
 if(!process.env.FORE){assert.equal(a.samma,true,'Oförändrat blad ska inte byggas om');assert.equal(b.anim,0,'Öppen del ska inte glida in igen')}
 await h.shot('omritning-installningar');
};
