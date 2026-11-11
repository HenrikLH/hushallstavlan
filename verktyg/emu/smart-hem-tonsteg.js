// −/+ i tonen med snabba tryck mot en långsam lampa: värdet får inte hoppa tillbaka och sista trycket ska gälla i lampan.
// Favorittonerna står från kall till varm och går att byta namn på från Ändra-bladet (⋯).
// Kör: LS='{"haUrl":"http://ha.test"}' node verktyg/emu/run.js verktyg/emu/smart-hem-tonsteg.js (telefon)
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 let v=1,srvK=2700;const posts=[],lamp=()=>({id:'light.golv',n:'Golvlampa',t:'light',rum:'Vardagsrum',on:true,b:50,lagen:['color_temp'],lage:'color_temp',k:srvK,kmin:2200,kmax:4000});
 await pg.route('http://ha.test/**',async r=>{const q=r.request();const ok=b=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(b)});
  if(q.method()==='POST'){const b=JSON.parse(q.postData()||'{}');posts.push(b.k);await new Promise(x=>setTimeout(x,posts.length===1?900:120));// första svaret långsamt
   setTimeout(()=>{if(b.k!=null)srvK=b.k;v++},700);return ok({ok:true,v})}// lampan rapporterar först efter en stund
  await new Promise(x=>setTimeout(x,250));v++;return ok({v,fel:null,lampor:[lamp()],scener:[],givare:[],apparater:[],media:[]})});
 await pg.evaluate(()=>__d('HA.retry=0,HA.fel=null,HA.nf=0'));
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(2500);
 await pg.locator('section.ha .wh').click();await h.idle(1000);
 await pg.locator('main .ha-t[data-id="light.golv"] .ha-n').click();await h.idle(1200);
 const P='form[data-form="haLampa"] ';await pg.locator(P+'[data-act="haSub"][data-id="ton"]').click();await h.idle(700);
 const k=async()=>parseInt((await pg.locator(P+'[data-hav="k"]').innerText()).replace(/\D/g,''));
 const k0=await k();assert.equal(k0,2700,'Start 2 700 K');const sett=[];
 for(let i=1;i<=5;i++){await pg.locator(P+'[data-act="haTonSteg"][data-id="50"]').click();await pg.waitForTimeout(260);const n=await k();sett.push(n);assert.equal(n,k0+50*i,'Tryck '+i+' visar '+(k0+50*i)+', inte '+n+' ('+sett.join(', ')+')')}
 for(let i=0;i<12;i++){await pg.waitForTimeout(500);assert.equal(await k(),k0+250,'Hoppar inte tillbaka medan lampan hinner ikapp ('+i+')')}
 assert.equal(srvK,k0+250,'Lampan hamnar på sista trycket, skickat: '+posts.join(', '));
 console.log('Skickat i ordning:',posts.join(', '));
 // favoriter: kall till varm, byt namn via ⋯
 await pg.locator(P+'.ha-tbk').click();await h.idle(700);
 const namn=async()=>pg.locator(P+'.ha-fpb[data-act="haFavV"] span').allInnerTexts();
 assert.deepEqual(await namn(),['Vitt','Mys','Stearin'],'Grundfavoriterna kall till varm');
 await pg.locator(P+'[data-act="haEdit"]').click();await h.idle(700);
 const E='form[data-form="haEdit"] ';assert.equal(await pg.locator(E+'.ha-fvr').count(),3,'Favorittonerna i Ändra-bladet');
 await pg.locator(E+'.ha-fvr').filter({hasText:'Mys'}).click();await h.idle(700);
 if(await pg.locator('[name="hafn"]').count()){await pg.locator('[name="hafn"]').fill('Kväll');await pg.locator('[name="hafn"]').press('Enter');await h.idle(900);
  assert.equal(await pg.locator(E+'.ha-fvr').filter({hasText:'Kväll'}).count(),1,'Nytt namn, tillbaka i Ändra-bladet');await h.shot('tonsteg-andra')}
 else{assert.equal(await pg.locator('form[data-form="haFav"]').count(),1,'Favoriten öppnas på väggen');await pg.locator('form[data-form="haFav"] [data-act="haFavTill"]').click();await h.idle(700)}
 await pg.locator(E+'[data-act="sheetClose"]').click();await h.idle(700);
 // ny favorit varmare än Vitt men kallare än Mys hamnar mellan dem
 await pg.locator('main .ha-t[data-id="light.golv"] .ha-n').click();await h.idle(1000);
 await pg.locator(P+'[data-act="haSub"][data-id="ton"]').click();await h.idle(700);
 await pg.locator(P+'.ha-radc[data-act="haFavNy"]').click();await h.idle(800);
 if(await pg.locator('[name="hafn"]').count()){await pg.locator('[name="hafn"]').fill('Mitt');await pg.locator('[name="hafn"]').press('Enter')}else await pg.locator('form[data-form="haFav"] button[type="submit"]').click();await h.idle(900);
 await pg.locator(P+'.ha-tbk').click();await h.idle(700);
 const L=await namn();assert.equal(L.length,4,L.join(', '));assert.equal(L[0],'Vitt');assert.equal(L[3],'Stearin');assert.ok(/Mitt|Favorit/.test(L[1]),'Ny ton 2 950 K hamnar efter Vitt: '+L.join(', '));
 await h.shot('tonsteg-favoriter');
};
