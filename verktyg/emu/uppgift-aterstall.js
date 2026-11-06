// Borttagen uppgift: Ångra direkt, och "Nyligen borttagna" under Klara återställer den senare (sparas i arket i 30 dagar, syns på alla enheter).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const hold=async s=>{await pg.locator(s).first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(300);await h.hold(s);await h.idle(300)};
 const t=await read('today()');
 h.sheet('Uppgifter').push([false,'Byta däck',t,'','','tu1','egen',''],[false,'Ringa vårdcentralen',t,'','','tu2','egen',''],[true,'Köpa present','','','','tu3','egen','']);
 await pg.reload();await h.idle(1800);
 await click('#nav [data-act="nav"][data-id="uppgifter"]');await click('[data-act="taskTab"][data-id="lista"]');
 const ta=async namn=>{await hold('.cell.ck[data-hold-lift="taskMenu"]:has-text("'+namn+'")');await click('.sheet [data-act="taskDelAsk"]');await click('.sheet [data-act="taskDel"]')};
 // 1. Ta bort och ångra direkt
 await ta('Byta däck');
 assert.equal(await pg.locator('#undo').isVisible(),true,'Ångra ska visas');
 assert.ok((await pg.locator('#undo .ud-t').innerText()).includes('Byta däck'));
 await h.shot('angra');
 await click('#undo .ud-b');await h.waitFlush();
 assert.ok(await read('D().tasks.some(x=>x.title==="Byta däck"&&!x.done)'),'Ångra ska ge tillbaka uppgiften');
 assert.equal(await pg.locator('details[data-k="bort"]').count(),0,'Återställd uppgift ska inte ligga kvar i listan');
 await h.waitFlush();assert.ok(!/"bort"/.test(h.sheet('Inställningar').find(r=>r[0]==='onskelista')[1]||''),'Tom lista ska inte ligga kvar i arket');
 // 2. Ta bort, låt Ångra försvinna, återställ från Nyligen borttagna
 await ta('Ringa vårdcentralen');await h.idle(5600);
 assert.equal(await pg.locator('#undo').isVisible(),false,'Ångra ska försvinna efter 5 s');
 await h.waitFlush();assert.ok(!h.sheet('Uppgifter').some(r=>r[1]==='Ringa vårdcentralen'),'Uppgiften ska vara borttagen i arket');
 assert.ok(/Ringa vårdcentralen/.test(h.sheet('Inställningar').find(r=>r[0]==='onskelista')[1]),'Borttagningen ska sparas i arket');
 await click('details[data-k="bort"] summary');
 assert.ok((await pg.locator('details[data-k="bort"]').innerText()).includes('Ringa vårdcentralen'));
 await pg.locator('details[data-k="bort"]').evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(300);
 await h.shot('nyligen-borttagna');
 await click('details[data-k="bort"] [data-act="taskBortUndo"]');await h.waitFlush();
 assert.ok(h.sheet('Uppgifter').some(r=>r[1]==='Ringa vårdcentralen'&&r[2]===t),'Återställd uppgift ska finnas i arket med samma datum');
 assert.equal(await pg.locator('details[data-k="bort"]').count(),0);
 // 3. Klar uppgift sparas inte (som Rensa klara)
 await click('details[data-k="done"] summary');await ta('Köpa present');
 assert.equal(await pg.locator('details[data-k="bort"]').count(),0);
 // 4. Listan ligger i kalkylarket (synkas mellan enheter): en annan enhets borttagning syns efter omladdning, äldre än 30 dagar visas inte
 const ins=h.sheet('Inställningar'),rad=ins.find(r=>r[0]==='onskelista');
 const v=JSON.stringify(JSON.parse(rad[1]||'[]').filter(x=>!x.bort).concat([{bort:1,l:[{k:'b1',title:'Från andra telefonen',due:'',who:'',repeat:'',at:t,by:'Cornelia'},{k:'b2',title:'För gammal',due:'',who:'',repeat:'',at:'2000-01-01'}]}]));rad[1]=v;
 await pg.evaluate(()=>{localStorage.removeItem('ht.cache')});await pg.reload();await h.idle(2200);
 const sum=await pg.locator('details[data-k="bort"] summary').innerText();assert.ok(sum.includes('(1)'),'En borttagning från arket ska synas, äldre än 30 dagar inte: '+sum);
 await click('details[data-k="bort"] summary');assert.ok((await pg.locator('details[data-k="bort"]').innerText()).includes('Från andra telefonen'));await h.shot('fran-annan');
 console.log('uppgift-aterstall OK');
};
