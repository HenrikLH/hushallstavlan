// Översikt och Att göra: bocken ritas och raderna under glider (inget hopp > 30 px mellan bildrutor). Mäter om saker under en avbockad rad hoppar (>10 px mellan två bildrutor à 40 ms).
module.exports=async(pg,h)=>{
 await pg.emulateMedia({reducedMotion:'no-preference'});
 const read=s=>pg.evaluate(s=>window.__d(s),s);
 const t=await read('today()'),y=await read('addDays(today(),-3)'),y9=await read('addDays(today(),-9)');
 const U=h.sheet('Uppgifter');U.splice(1);U.push([false,'Betala elräkningen',t,'','','a1','egen',''],[false,'Ringa vårdcentralen',t,'','','a2','egen',''],[false,'Köpa present',t,'','','a3','egen','']);
 const C=h.sheet('Städ'),col=C[0];C.splice(1);[['c1','Kök','Torka bänkar',2,10,y],['c2','Badrum','Städa toalett',7,15,y9],['c3','Vardagsrum','Dammsuga',7,20,y9]].forEach(r=>{const row=Array(col.length).fill('');Object.assign(row,{[col.indexOf('id')]:r[0],[col.indexOf('room')]:r[1],[col.indexOf('title')]:r[2],[col.indexOf('freq')]:r[3],[col.indexOf('min')]:r[4],[col.indexOf('lastDone')]:r[5]});C.push(row)});
 await pg.reload();await h.idle(1800);
 const nav=async v=>{await pg.evaluate(()=>scrollTo(0,0));await h.idle(200);if(await pg.locator('.nav-mini.on').isVisible()){await pg.locator('.nav-mini.on').click();await h.idle(400)}await pg.locator('#nav [data-act="nav"][data-id="'+v+'"]').first().click();await h.idle(900)};
 const mat=async(sel,watch,label)=>{const b=pg.locator(sel).first();await b.evaluate(e=>e.scrollIntoView({block:'center'}));await h.idle(400);
  const ys=[];const pos=()=>pg.evaluate(w=>{const e=document.querySelector(w);return e?Math.round(e.getBoundingClientRect().y):null},watch);
  ys.push(await pos());await b.click();for(let i=0;i<30;i++){await pg.waitForTimeout(40);ys.push(await pos())}
  let maxHopp=0;for(let i=1;i<ys.length;i++)if(ys[i]!=null&&ys[i-1]!=null)maxHopp=Math.max(maxHopp,Math.abs(ys[i]-ys[i-1]));
  console.log('HOPP',label,'max',maxHopp,'px',ys.join(','));if(maxHopp>30)throw new Error(label+': raden hoppar '+maxHopp+' px');return maxHopp};
 const wall=await read('wallBoardOn()');
 await nav('oversikt');
 const r1=await mat('[data-box="upg"] [data-act="taskToggle"][data-id="a1"]','[data-box="upg"] [data-id="a2"]','Översikt Att göra');
 await h.shot('hopp-oversikt');
 if(!wall){await nav('uppgifter');
  const cnt=await pg.locator('#main [data-act="taskToggle"][data-id="a2"]').count();if(cnt)await mat('#main [data-act="taskToggle"][data-id="a2"]','#main [data-act="taskToggle"][data-id="a3"]','Att göra-fliken');
  await h.shot('hopp-attgora');}
};
