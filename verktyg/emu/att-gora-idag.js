// Att göra i Idag-rutan på Översikt (Ö2/T3, UI 5.0, granskning B): bara idag (och sena) att bocka, Imorgon under, odaterat/senare syns inte.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const t=await read('today()'),tm=await read('addDays(today(),1)'),sen=await read('addDays(today(),-2)'),om3=await read('addDays(today(),3)');
 const U=h.sheet('Uppgifter');U.splice(1);
 U.push([false,'Byta däck',t,'','','a1','egen',''],[false,'Betala hyran',sen,'','','a2','egen',''],[false,'Ringa vårdcentralen',t,'','','a3','egen',''],
  [false,'Hämta paket',tm,'','','a4','egen',''],[false,'Vattna blommorna',tm,'','','a5','egen',''],[false,'Boka frisör',om3,'','','a6','egen',''],[false,'Rensa förrådet','','','','a7','egen','']);
 await pg.reload();await h.idle(1800);
 const wall=await read('wallBoardOn()');
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(800);
 const box=pg.locator('[data-box="kal"]').first();await box.evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(400);
 const txt=await box.innerText();
 for(const s of['Byta däck','Betala hyran','Ringa vårdcentralen','Imorgon','Hämta paket','Vattna blommorna'])assert.ok(txt.includes(s),'saknas: '+s);
 for(const s of['Boka frisör','Rensa förrådet'])assert.ok(!txt.includes(s),'ska inte synas: '+s);
 assert.ok(txt.indexOf('Ringa vårdcentralen')<txt.indexOf('Imorgon')&&txt.indexOf('Imorgon')<txt.indexOf('Hämta paket'),'Idag ska stå före Imorgon');
 await h.shot('att-gora');
 // bocka av dagens: raden försvinner, imorgon står kvar
 for(const id of['a1','a2','a3']){await pg.locator('[data-box="kal"] [data-act="taskToggle"][data-id="'+id+'"]').first().click();await h.idle(600)}
 await h.idle(1500);const t2=await pg.locator('[data-box="kal"]').first().innerText();
 assert.ok(!t2.includes('Byta däck')&&t2.includes('Hämta paket'),'efter bockning: '+t2);assert.equal(await read('S.view'),'oversikt','bocken ska inte öppna kalendern');assert.equal(await pg.locator('[data-box="upg"]').count(),0,'ingen egen Att göra-ruta');
 await pg.locator('[data-box="kal"]').first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.shot('klart-idag');
};
