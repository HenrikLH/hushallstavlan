// Smart hem: rörelserna som i Hem-appen (fjäder vid tryck, våg vid scen, bladet växer ur brickan, gummiband i reglaget).
//   LS='{"haDemo":"1"}' [VIDEO=mapp] node verktyg/emu/run.js verktyg/emu/smart-hem-rorelse.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-act="nav"][data-id="oversikt"]').first().click();await h.idle(500);
 await pg.locator('section.ha .wh').click();await h.idle(900);
 const t=id=>pg.locator('main .ha-t[data-id="'+id+'"]');
 await t('light.hall').locator('.ha-i').click();await h.idle(120);
 assert.equal(await t('light.hall').evaluate(e=>e.classList.contains('ha-ny')),true,'Tänd brickan animeras');
 await h.idle(900);
 await pg.locator('main [data-act="haScen"][data-id="av"]').click();await h.idle(1200);
 await pg.locator('main [data-act="haScen"][data-id="scene.kvall"]').click();await h.idle(60);
 const d=await pg.locator('main .ha-t.ha-ny').evaluateAll(a=>a.map(e=>parseFloat(e.style.getPropertyValue('--ha-d'))));
 assert.ok(d.length>=3&&new Set(d.map(Math.round)).size>1,'Scenen tänder i en våg: '+d);
 await h.idle(1200);
 // uttag är brytare: hela brickan växlar och har en brytare
 const fo=t('switch.fonster');assert.equal(await fo.locator('.ha-sw').count(),1,'Uttaget visar en brytare');
 const fore=await fo.evaluate(e=>e.classList.contains('on'));await fo.locator('.ha-n').click();await h.idle(700);
 assert.equal(await fo.evaluate(e=>e.classList.contains('on')),!fore,'Tryck på uttaget växlar');
 assert.equal(await pg.locator('#overlay form').count(),0,'Uttaget öppnar inget blad');
 // eget namn med textfältet
 await t('light.kok').locator('.ha-n').click();await h.idle(1100);
 await pg.locator('form[data-form="haLampa"] .ha-gear').click();await h.idle(500);
 await pg.locator('[name="hanamn"]').fill('Taklampa kök');await pg.locator('[name="hanamn"]').press('Enter');await h.idle(700);
 await h.shot('rorelse-namn');
 await pg.locator('form[data-form="haEdit"] [data-act="sheetClose"]').click();await h.idle(600);
 assert.match(await t('light.kok').innerText(),/Taklampa kök/,'Nytt namn från textfältet');
 // rumssidan
 await pg.locator('main [data-act="haRumVy"][data-id="Vardagsrum"]').click();await h.idle(700);
 assert.equal(await pg.locator('main .ha-t').count(),2,'Rummets sida visar bara rummets enheter');
 await h.shot('rorelse-rum');
 await pg.locator('main .back').click();await h.idle(700);
 assert.ok(await pg.locator('main .ha-t').count()>3,'Tillbaka till alla');
 // håll in: bladet växer ur brickan
 const tile=t('light.vardagsrum');await tile.scrollIntoViewIfNeeded();const r0=await tile.boundingBox();
 await pg.mouse.move(r0.x+r0.width/2,r0.y+r0.height/2);await pg.mouse.down();await pg.waitForTimeout(650);
 const P='form[data-form="haLampa"]',r1=await pg.locator(P).boundingBox();
 assert.ok(r1.width<300,'Bladet börjar nära brickans storlek ('+Math.round(r1.width)+' px)');
 await pg.waitForTimeout(1100);await pg.mouse.up();await h.idle(300);const r2=await pg.locator(P).boundingBox();
 assert.ok(r2.width>360,'Bladet har vuxit ut ('+Math.round(r2.width)+' px)');
 // gummiband: dra långt förbi toppen
 const vs=pg.locator(P+' .ha-vs'),b=await vs.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
 await pg.mouse.move(cx,cy);await pg.mouse.down();for(let i=1;i<=16;i++){await pg.mouse.move(cx,cy-i*40);await h.idle(16)}
 const tr=await vs.evaluate(e=>e.style.transform);assert.match(tr,/scale\(/,'Reglaget sträcks förbi toppen');
 await h.shot('rorelse-gummiband');
 await pg.mouse.up();await h.idle(900);
 assert.match(await pg.locator(P+' [data-hav="s"]').innerText(),/100 %/,'Full styrka');
 await pg.mouse.click(cx,cy);await h.idle(100);
 const mid=await vs.evaluate(e=>e.querySelector('i').getBoundingClientRect().height);await h.idle(900);
 const slut=await vs.evaluate(e=>e.querySelector('i').getBoundingClientRect().height);
 assert.ok(mid>slut,'Fyllningen glider ned när lampan släcks ('+Math.round(mid)+' → '+Math.round(slut)+')');
 // Klar: krymper tillbaka in i brickan
 await pg.locator(P+' [data-act="sheetClose"]').click();await h.idle(120);
 assert.equal(await pg.locator(P).count(),1,'Bladet står kvar under krympningen');
 await h.idle(800);assert.equal(await pg.locator(P).count(),0,'Bladet stängt');
 assert.equal(await tile.evaluate(e=>e.style.visibility),'','Brickan syns igen');
};
