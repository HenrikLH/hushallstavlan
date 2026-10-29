// Verkliga formulärklick och serverkod; nätets svar fördröjs över den gamla 25 s-gränsen.
const assert=require('node:assert/strict'),gas=require('./gas');
gas.ctx.setupRecipes();
module.exports=async(pg,h)=>{
 const click=async s=>{if(/\[data-rc="(?:new|import)"\]/.test(s)&&!await pg.locator(s).first().isVisible()&&await pg.locator('.create-menu>summary').count())await pg.locator('.create-menu>summary').click();await pg.locator(s).first().click();await h.idle(400)};
 const unchanged=JSON.stringify([h.sheet('Matsedel'),h.sheet('Inköp')]);let imports=0,saves=0,lose=false;const requests=[];
 h.gas.ctx.UrlFetchApp.fetch=()=>({getResponseCode:()=>200,getContentText:()=>'<script type="application/ld+json">'+JSON.stringify(require('./fixtures/recept.json'))+'</script>',getAllHeaders:()=>({})});
 await pg.route('**/script.google.com/**',async route=>{const req=route.request();if(req.method()!=='POST')return route.fallback();const text=req.postData(),body=JSON.parse(text);if(!['recipeSave','recipeImport'].includes(body.action))return route.fallback();
  if(body.action==='recipeImport'&&++imports===1)return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:false,error:'Exception: Lock timeout'})});
  if(body.action==='recipeSave'){saves++;requests.push(text)}const out=h.gas.handle('POST',text,{});
  if(lose&&body.action==='recipeSave'){lose=false;return route.abort('failed')}
  if(body.action==='recipeImport'||saves===1)await new Promise(resolve=>setTimeout(resolve,26000));
  try{await route.fulfill({contentType:'application/json',body:out})}catch(e){if(!/closed|disposed/i.test(e.message))throw e}
 });
 await click('[data-act="matTab"][data-id="recept"]');await click('[data-rc="new"]');
 await pg.locator('[data-rf="title"]').fill('Tacos');await pg.locator('[data-rf="portions"]').fill('4');await pg.locator('[data-ri="0:0:amount"]').fill('500');await pg.locator('[data-ri="0:0:u"]').fill('g');await pg.locator('[data-ri="0:0:n"]').fill('köttfärs');await pg.locator('[data-rstep="0:t"]').fill('Stek färsen och fyll bröden.');await click('[data-rc="save"]');
 const saved=pg.getByText('Receptet är sparat. Planerade måltider är oförändrade.',{exact:true});await saved.waitFor({timeout:40000});assert.equal(saves,1);assert.equal(await pg.evaluate(()=>localStorage.getItem('ht.recipeDraft')),null);
 await click('[data-rc="finish"]');await pg.locator('h1').filter({hasText:'Tacos'}).waitFor();await click('[data-rc="edit"]');await pg.locator('[data-rf="title"]').fill('Tacos med grönsaker');lose=true;await click('[data-rc="save"]');await saved.waitFor({timeout:15000});assert.equal(saves,3);assert.equal(requests[1],requests[2]);
 const root=JSON.parse(requests[0]).root;assert.equal(h.gas.ctx.recipeStore_().versions.filter(x=>x._root===root).length,2,'en ny version per sparning trots tappat svar');
 await click('[data-rc="finish"]');await click('#main [data-act="recipeBack"]');await click('[data-rc="import"]');await pg.locator('#rc-url').fill('https://www.ica.se/recept/test/');await click('[data-rc="fetch"]');await pg.locator('[data-rf="title"]').waitFor({timeout:40000});assert.equal(imports,2);assert.equal(await pg.locator('[data-rf="title"]').inputValue(),'Importerad testgryta');
 const draft=JSON.parse(await pg.evaluate(()=>localStorage.getItem('ht.recipeDraft')));assert.equal(draft.edit.recipe.title,'Importerad testgryta');assert.equal(draft.edit.pending,false);assert.equal(JSON.stringify([h.sheet('Matsedel'),h.sheet('Inköp')]),unchanged);
 await click('[data-rc="leave"]');await click('[data-rc="keep"]');await pg.reload();await pg.locator('[data-rc="resume"]').waitFor();await click('[data-rc="resume"]');assert.equal(await pg.locator('[data-rf="title"]').inputValue(),'Importerad testgryta');
 console.log('PASS RECEPT TIMEOUT: Tacos sparas efter 26 s; tappat sparsvar återförsöks utan extra version; import efter låsfel + 26 s öppnar utkast; utkast överlever omladdning; matsedel/inköp oförändrade.');
};
