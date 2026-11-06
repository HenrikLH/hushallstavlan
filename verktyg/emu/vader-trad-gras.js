// Visuell granskning av riktiga komponenter, med emulerade data.
const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(250);
 await pg.locator('[data-act="nav"][data-id="vader"]').first().click();await h.idle(500);
 await pg.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=42000}));
 await pg.locator('.wx2').screenshot({path:path.join(h.OUT,'trad-gras.png')});
 const sheets=await read(`(()=>{WXART='geo';const W=wxModel(),sc=wxScene(W),cards=[],names={a:'Brun',b:'Svart',ab:'Brun + svart',ba:'Svart + brun',A:'Brun · sover',B:'Svart · sover',AB:'Brun + svart · sover',BA:'Svart + brun · sover'};
 for(const v of ['a','b','ab','ba','A','B','AB','BA'])cards.push({name:names[v],svg:figSvg({...sc,dark:false,phase:'day',fit:{},type:'none',thunder:false,T:18,sky:'clear',sleep:v===v.toUpperCase()},{bare:1,patch:1,nocl:1,variant:v})});
 const outfits=[['Utan kläder',{} ,'clear'],['Solglasögon',{shades:true},'clear'],['Svalt · tröja',{coat:'mild'},'cloudy'],['Kallt · halsduk',{coat:'cold',scarf:true},'cloudy'],['Snö',{coat:'snow',snowy:true,beanie:true},'cloudy'],['Regn',{rain:true,coat:'rain'},'cloudy'],['Minusgrader',{coat:'freezing',breath:true},'cloudy'],['Dimma',{scarf:true},'fog']],weather=[];
 for(const [name,fit,sky] of outfits)for(const sleep of [false,true])weather.push({name:name+(sleep?' · sover':' · vaken'),svg:figSvg({...sc,dark:false,phase:'day',fit,type:'none',thunder:false,T:18,sky,sleep},{bare:1,patch:1,nocl:1,variant:sleep?'AB':'ab'})});
 return{cards,weather}})()`);
 assert.equal(sheets.cards.length,8);assert.equal(sheets.weather.length,16);
 const ctx=pg.context();
 for(const [key,title,cols] of [['cards','Alla hundplaceringar och sovlägen',2],['weather','Alla 16 väder- och klädlägen',4]]){
  const p=await ctx.newPage();await p.setViewportSize({width:key==='cards'?800:1400,height:1000});await p.goto(new URL('/',pg.url()).href);
  const base=new URL('/',pg.url()).href;
  await p.setContent('<html lang="sv"><head><base href="'+base+'"><style>body{margin:0;padding:32px;background:#f5f3eb;color:#23354c;font:18px system-ui}h1{font-size:28px;margin:0 0 8px}p{margin:0 0 24px;color:#566578}.grid{display:grid;grid-template-columns:repeat('+cols+',1fr);gap:16px}.card{background:#fffdf7;border-radius:16px;padding:16px;text-align:center}.card svg{display:block;width:100%;height:210px;overflow:visible}.name{font-size:17px;font-weight:600}.card *{animation:none!important}</style></head><body><h1>'+title+'</h1><p>Geometrisk · appens befintliga hundar</p><div class="grid">'+sheets[key].map(c=>'<div class="card">'+c.svg+'<div class="name">'+c.name+'</div></div>').join('')+'</div></body></html>');
  await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(e=>new Promise((ok,no)=>{const im=new Image();im.onload=ok;im.onerror=no;im.src=e.getAttribute('href')})))});
  await p.screenshot({path:path.join(h.OUT,'hundar-'+key+'.png'),fullPage:true});await p.close();
 }
 console.log('PASS 8 hundplaceringar och 16 väder-/sovlägen');
};
