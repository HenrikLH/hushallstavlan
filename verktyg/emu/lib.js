module.exports=(pg,h)=>({
 A:async(a,id)=>{const s='[data-act="'+a+'"]'+(id!=null?'[data-id="'+id+'"]':'');const el=await pg.$(s);if(!el){console.log('MISSING '+s);return}
   try{await el.scrollIntoViewIfNeeded({timeout:1000});await el.click({timeout:1500})}catch(e){await el.evaluate(x=>x.click())}await pg.waitForTimeout(500)},
 tab:async t=>{await pg.click('[data-act="matTab"][data-id="'+t+'"]');await pg.waitForTimeout(700)},
 menu:()=>h.sheet('Matsedel').slice(1).map(r=>r[0]+' '+r[1]+' '+r[2]+' ['+r[3]+'] '+r[5]).join('\n'),
});
