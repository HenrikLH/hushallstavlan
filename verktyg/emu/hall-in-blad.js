// Håll in en uppgift, en händelse eller en syssla: bladet som liknar Rätten i veckosedeln öppnas och rutorna gör det de lovar.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const hold=async s=>{await pg.locator(s).first().evaluate(el=>el.scrollIntoView({block:'center'}));await h.idle(300);await h.hold(s);await h.idle(300)};
 const t=await read('today()'),tm=await read('addDays(today(),1)');
 h.sheet('Uppgifter').push([false,'Testuppgift',t,'','','tu1','egen','']);
 h.sheet('Händelser').push([t,'14.00','Tandläkare','','egen','','']);
 const sh=h.sheet('Städ'),col=sh[0];const row=Array(col.length).fill('');Object.assign(row,{[col.indexOf('id')]:'ts1',[col.indexOf('room')]:'Vardagsrum',[col.indexOf('title')]:'Dammsuga testsoffan',[col.indexOf('freq')]:7,[col.indexOf('min')]:15});sh.push(row);
 await pg.reload();await h.idle(1800);
 // Uppgifter
 await click('#nav [data-act="nav"][data-id="uppgifter"]');await click('[data-act="taskTab"][data-id="lista"]');
 const tr='.cell.ck[data-hold-lift="taskMenu"]:has-text("Testuppgift")';
 await hold(tr);assert.equal(await read('S.sheet'),'taskMenu','Håll in uppgiften ska öppna bladet');
 assert.ok((await pg.locator('.sheet .dm-hd').innerText()).includes('Testuppgift'));
 await h.shot('blad-uppgift');
 await click('.sheet [data-a="taskMove"][data-d="1"]');assert.equal(await read('S.sheet'),null);await h.waitFlush();
 assert.equal(await read('D().tasks.find(x=>x.id==="tu1").due'),tm,'I morgon ska flytta datumet');
 await hold(tr);await click('.sheet [data-a="taskEdit"]');assert.equal(await read('S.sheet'),'taskEdit','Ändra ska öppna formuläret');await click('.sheet [data-act="sheetClose"]');
 await hold(tr);await click('.sheet [data-act="taskDelAsk"]');assert.equal(await pg.locator('.sheet [data-act="taskDel"]').count(),1);
 await click('.sheet [data-act="taskDel"]');await h.waitFlush();assert.equal(await read('D().tasks.some(x=>x.id==="tu1")'),false,'Uppgiften ska tas bort');
 // Kalendern: dagens lista i månadsvyn
 await click('[data-act="taskTab"][data-id="kalender"]');
 if(await pg.locator('[data-act="calVy"][data-id="manad"]').count())await click('[data-act="calVy"][data-id="manad"]');
 const er='.cal-ev[data-hold-lift="evMenu"]:has-text("Tandläkare")';
 await hold(er);assert.equal(await read('S.sheet'),'evMenu','Håll in händelsen ska öppna bladet');
 await h.shot('blad-handelse');
 await click('.sheet [data-a="evEdit"]');assert.equal(await read('S.sheet'),'evEdit');await click('.sheet [data-act="sheetClose"]');
 await hold(er);await click('.sheet [data-a="calDayVy"]');assert.equal(await read('S.calVy'),'dag','Visa dagen ska byta till dagvyn');
 const blk='.cv-ev[data-hold-lift="evMenu"]';if(await pg.locator(blk).count()){await hold(blk);assert.equal(await read('S.sheet'),'evMenu','Håll in i dagvyn');await click('.sheet [data-act="sheetClose"]')}
 // Städ: Alla sysslor
 await click('#nav [data-act="nav"][data-id="stad"]');
 await pg.locator('details[data-k="all"]').evaluate(d=>d.open=true);await h.idle(300);
 const cr='[data-hold-lift="cleanMenu"]:has-text("Dammsuga testsoffan")';
 await hold(cr);assert.equal(await read('S.sheet'),'cleanMenu','Håll in sysslan ska öppna bladet');
 await pg.selectOption('.sheet select[data-change="freq"]','14');await h.idle(400);
 assert.equal(await read('D().clean.find(x=>x.id==="ts1").freq'),14);
 assert.equal(await pg.locator('.sheet select[data-change="freq"]').inputValue(),'14','Bladet ska visa det nya intervallet');
 await h.shot('blad-syssla');
 await click('.sheet [data-a="planSat"]');assert.equal(await read('S.sheet'),null);
 assert.equal(await read('D().clean.find(x=>x.id==="ts1").plannedFor'),await read('nextSaturday()'));
 await hold(cr);await click('.sheet [data-a="cleanDel"]');assert.equal(await read('D().clean.some(x=>x.id==="ts1")'),false);
 assert.ok(await pg.locator('#undo').isVisible(),'Ångra ska synas');await click('#undo .ud-b');
 assert.equal(await read('D().clean.some(x=>x.id==="ts1")'),true,'Ångra ska ta tillbaka');
 await h.waitFlush();
};
