// Dammsugaren: antal gånger och moppläge per rum i moppningen. Demo: LS='{"haDemo":"1"}' node verktyg/emu/run.js verktyg/emu/robot-mopp.js
// Mot väggdatorns tjänst (falsk HA): PORT=8099 HA=1 LS='{"haUrl":"http://127.0.0.1:8777"}' node verktyg/emu/run.js verktyg/emu/robot-mopp.js
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const demo=!process.env.HA;
 await pg.locator('#nav [data-id="oversikt"]').click();await h.idle(900);
 await pg.locator('main [data-act="nav"][data-id="hus"]').first().click();await h.idle(1500);
 await pg.locator('main .ha-ap[data-id="vacuum.dammsugare"]').click();await h.idle(1500);
 const [r1,r2]=JSON.parse(await pg.evaluate(()=>window.__d('JSON.stringify(haAppX().rum.slice(0,2).map(r=>r.id))')));
 await pg.evaluate(([a,b,d])=>window.__d('(()=>{const x=haAppX();if(!'+d+'){x.st="charging";x.plan=null}S.haRobRum=['+a+','+b+'];S.haRobV={'+a+':"m",'+b+':"m"};render()})()'),[r1,r2]);await h.idle(500);
 await pg.locator('main .ha-fl.fh [data-act="haRobXm"][data-id="'+r1+':=2"]').click();await h.idle(300);
 await pg.locator('main .ha-fl.fh select[data-harm="'+r2+'"]').selectOption('deep');await h.idle(400);
 const titlar=await pg.locator('main .ha-fl.fh .ha-fs.mopp .ha-ft > b').allInnerTexts();
 assert.deepEqual(titlar,['Mop','Mop · Deep'],'Två moppomgångar: ×2 och Deep för sig');
 assert.match(await pg.locator('main .ha-fl.fh').innerText(),/Tvätt av moppen/,'Moppen tvättas mellan omgångarna');
 assert.equal(await pg.locator('main .ha-fl.fh .ha-fs.mopp').first().locator('.ha-xs .on').innerText(),'×2','×2 markerat');
 await pg.evaluate(()=>scrollBy(0,document.querySelector('main .ha-fl.fh').getBoundingClientRect().top-140));await h.idle(400);await h.shot('robot-mopp');
 assert.doesNotMatch(await pg.locator('main').innerHTML(),/undefined|NaN/,'Inget odefinierat');
 if(demo)return;
 const HAU='http://127.0.0.1:18123',logg=async()=>(await(await fetch(HAU+'/logg',{headers:{Authorization:'Bearer test'}})).json()),
  vanta=async f=>{for(let i=0;i<120;i++){if(f(await logg()))return true;await h.idle(500)}return false},
  seg=(L0,n)=>x=>x[2].command==='app_segment_clean'&&JSON.stringify(x[2].params[0].segments)===JSON.stringify(L0)&&x[2].params[0].repeat===n,
  hemma=async()=>{await h.idle(7000);await fetch(HAU+'/yttre/hemma',{method:'POST'})};
 await pg.locator('main [data-act="haRob"][data-id="start"]').click();await h.idle(1200);
 assert.ok(await vanta(L=>L.some(seg([r1],2))),'Första rummet moppas två gånger');
 await hemma();assert.ok(await vanta(L=>L.some(seg([r2],1))),'Sedan rummet med Deep');
 let L=await logg();const i=L.findIndex(seg([r2],1));assert.ok(L.slice(0,i).some(x=>x[2].option==='deep'),'Deep sätts före omgången');
 await hemma();await pg.waitForFunction(()=>document.querySelector('main .ha-fslut.klar'),null,{timeout:60000});
 L=await logg();assert.equal(L.filter(x=>x[2].entity_id==='select.dammsugare_mopplage').pop()[2].option,'standard','Moppläget tillbaka efteråt');
 await h.shot('robot-mopp-klar');
};
