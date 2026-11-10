// Mobilens släktträd med många barn: förhandsvisningen får inte bli bred eller klottrig.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const rows=h.sheet('Inställningar'),set=(k,v)=>{const r=rows.find(x=>x[0]===k);if(r)r[1]=v;else rows.push([k,v])};
 const roots=[['Farmor','01-01'],['Farfar','01-02'],['FörälderA','01-03'],['FörälderB','01-04']];
 const children=Array.from({length:24},(_,i)=>['Barn'+String(i+1).padStart(2,'0'),'02-'+String(i+1).padStart(2,'0')]);
 const ids=roots.concat(children),key=x=>x[0]+'|'+x[1],par={};
 par[key(roots[2])]=[key(roots[0]),key(roots[1])];
 children.forEach(c=>par[key(c)]=[key(roots[2]),key(roots[3])]);
 set('fodelsedagar',JSON.stringify(ids.map(([namn,datum])=>({namn,datum}))));
 const wishes=JSON.parse(rows.find(x=>x[0]==='onskelista')?.[1]||'[]').filter(x=>!x.fod);
 wishes.push({fod:1,add:[],del:[],col:{},fam:[],fm:{},pr:{},pb:{},sr:{par,partners:[[key(roots[2]),key(roots[3])]],siblings:[]}});
 set('onskelista',JSON.stringify(wishes));
 await pg.reload();await h.idle(1300);
 const click=async s=>{await pg.locator(s).first().click();await h.idle(300)};
 await click('[data-act="settings"]');
 if(!(await pg.locator('details[data-k="pref-avancerat"]').evaluate(x=>x.open)))await click('details[data-k="pref-avancerat"] > summary');
 await click('[data-act="dev"]');
 await click('[data-act="familjOpen"]');
 await click('[data-act="nav"][data-id="slakt"]');

 assert.equal(await pg.locator('.fam3-node').count(),28,'Alla 28 personer på samma canvas');
 const world=await pg.locator('.fam3-viewport').getAttribute('data-width');
 assert.ok(Number(world)>2000,'Trädet blir bredare, inte mindre läsbart');
 assert.ok(await pg.locator('.fam3-edge').count()>20,'Gemensamma familjekopplingar ritas');
 await h.shot('familj-stor-trad-v3');
 await click('[data-act="slaktV3Fit"]');
 const fit=await pg.locator('.fam3-scale').innerText();
 await click('[data-act="slaktV3Zoom"][data-id="plus"]');
 assert.notEqual(await pg.locator('.fam3-scale').innerText(),fit,'Zoom fungerar med 28 personer');
 await click('.fam3-node[data-id="FörälderA|01-03"]');
 assert.ok((await pg.locator('.fam3-detail').innerText()).includes('FörälderA'),'Alla personer kan väljas');
 assert.equal(await pg.locator('.fam3-node').count(),28,'Fokus tar inte bort övriga personer');
 await h.shot('familj-stor-v3-fokus');
};
