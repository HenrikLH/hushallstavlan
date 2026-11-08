// Födelsedagar: familjer (skapa, färg, medlemmar), filter (Alla/Present/familj), Familjer-visningen och present-märkningen (jämna år och barn till och med 18).
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const st=()=>h.sheet('Inställningar'),row=k=>st().find(x=>x[0]===k);
 const setRow=(k,v)=>{const r=row(k);if(r)r[1]=v;else st().push([k,v])};
 const P=[['Ingrid','01-12',1946],['Bengt','03-02',1951],['Karin','05-20',1976],['Johan','08-30',1974],['Elsa','11-24',2016],['Viggo','12-03',2021],
  ['Maria','02-14',1981],['Anders','06-07',1979],['Leah','10-15',2014],['Noah','04-22',2009],['Sven','09-09',1953],['Gun','11-30',1956],['Lisa','07-18',1990],['Oskar','11-12',1987],['Moa','03-28',2024],['Tomas','12-19',1965]];
 setRow('fodelsedagar',JSON.stringify(P.map(([namn,d,ar])=>({namn,datum:d,ar}))));
 const k=n=>{const x=P.find(p=>p[0]===n);return n+'|'+x[1]},fm={},F=[['f1','Mormor och morfar','teal',['Ingrid','Bengt']],['f2','Lunds','indigo',['Karin','Johan','Elsa','Viggo']],['f3','Hellstrands','plommon',['Maria','Anders','Leah','Noah']],['f4','Kusinerna','gron',['Lisa','Oskar','Moa']]];
 F.forEach(([id,,,m])=>m.forEach(n=>fm[k(n)]=id));
 setRow('onskelista',JSON.stringify([{fod:1,add:[],del:[],col:{},fam:F.map(([id,n,c])=>({id,n,c})),fm,pr:{}}]));
 await pg.reload();await h.idle(1800);
 const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 const main=()=>pg.locator('main').innerText();
 await click('#nav [data-act="nav"][data-id="oversikt"]');
 await click('[data-act="nav"][data-id="fod"]');
 await click('[data-act="fodMode"][data-id="hjul"]');
 await click('[data-act="fodMon"][data-id="10"]');
 // UI 5.0: filtret ligger i en meny bakom en rund knapp i rubriken, annars en knapprad
 const U5=await pg.evaluate(()=>window.__d('U5')),meny=async()=>{if(U5)await click('.fod-menu summary')};
 const filt=async id=>{await meny();await click('[data-act="fodFilt"][data-id="'+id+'"]')};
 assert.ok(await pg.locator('[data-act="fodFilt"][data-id="f2"]').count(),'Familjeknapp ska finnas');
 await h.shot('famA-1-hjul');
 if(U5){await meny();await h.shot('famA-0-meny');await pg.mouse.click(5,300);await h.idle(300)}
 // Present: Elsa fyller 10, Gun 70, Oskar 39 (nej)
 const gifts=await pg.evaluate(()=>window.__d('JSON.stringify(bdays().filter(b=>b.gift).map(b=>b.name))'));
 console.log('present:',gifts);
 assert.ok(gifts.includes('Elsa')&&gifts.includes('Gun')&&!gifts.includes('Oskar')&&gifts.includes('Noah'),'Presentregeln');
 await filt('pres');
 await click('[data-act="fodMode"][data-id="lista"]');
 assert.ok(!(await main()).includes('Oskar'),'Oskar ska inte få present');
 await h.shot('famA-2-present-tidslinje');
 await filt('alla');
 await click('[data-act="fodMode"][data-id="fam"]');
 assert.ok((await main()).includes('Utan familj'));
 await h.shot('famB-1-familjer');
 // Ny familj med Sven och Gun
 await meny();await click('[data-act="fodFam"]');
 assert.equal(await pg.locator('form[data-form="fodFam"]').count(),1);
 await click('form[data-form="fodFam"] [data-act="fodFamEdit"][data-id="ny"]');
 await pg.fill('#fam-name','Farmor och farfar');
 await pg.locator('input[name="c"][value="orange"]').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}))});await h.idle(300);await h.shot('famC-0-ny-familj-topp');
 await pg.locator('label.ff-m').filter({hasText:'Sven'}).click();await pg.locator('label.ff-m').filter({hasText:'Gun'}).click();
 await pg.locator('input[name="c"][value="orange"]').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}))});
 await h.shot('famC-1-ny-familj');
 await click('form[data-form="fodFam"] .tb.strong');await h.waitFlush();
 assert.ok((await pg.locator('form[data-form="fodFam"]').innerText()).includes('Farmor och farfar'),'Ny familj i listan');
 await h.idle(2600);await h.shot('famC-1b-familjelista');
 await click('form[data-form="fodFam"] [data-act="sheetClose"]');
 assert.ok((await main()).includes('Farmor och farfar'));
 // Personens blad: Familj och Present
 await pg.locator('.cell.bd').filter({hasText:'Lisa'}).first().evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(300);
 await h.hold('.cell.bd[data-hold-lift="fodEdit"]:has-text("Lisa")');
 assert.equal(await pg.locator('select[name="fam"]').count(),1);
 await pg.selectOption('select[name="pr"]','1');
 await h.shot('famC-2-person');
 await click('form[data-form="fodAdd"] .tb.strong');await h.waitFlush();
 assert.equal(await pg.evaluate(()=>window.__d('bdays().find(b=>b.name==="Lisa").gift')),true,'Alltid present');
 const ok=JSON.parse(row('onskelista')[1]).find(x=>x.fod);assert.ok(ok.fam.length===5&&ok.pr[k('Lisa')]===1,'Sparat i arket');
 await click('[data-act="fodMode"][data-id="hjul"]');
};
