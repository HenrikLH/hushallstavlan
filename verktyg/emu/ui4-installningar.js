// Regression: inställningskombinationer ska ge synliga, träffbara kontroller.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const read=s=>pg.evaluate(s=>window.__d(s),s),click=async s=>{await pg.locator(s).first().click();await h.idle(100)};
 const choose=async(a,id)=>{await click('[data-act="'+a+'"][data-id="'+id+'"]')};
 const settings=async()=>{await click('[data-act="settings"]');await h.idle(300);const sec=pg.locator('[data-k="pref-utseende"]');if(!await sec.evaluate(e=>e.open))await sec.locator('summary').click()};
 const close=async()=>{await click('.sheet [data-act="sheetClose"]');await h.idle(300)};
 const navCheck=async label=>{
  const result=await pg.locator('#nav').evaluate(n=>{const r=n.getBoundingClientRect(),vw=document.documentElement.clientWidth;return{left:r.left,right:r.right,vw,buttons:[...n.querySelectorAll(':scope>button')].map(b=>{const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{text:b.textContent.trim(),left:r.left,right:r.right,top:r.top,bottom:r.bottom,hit:!!hit&&b.contains(hit)}})}});
  assert(result.left>=0&&result.right<=result.vw+1,label+': menyn utanför skärmen '+JSON.stringify(result));
  assert.equal(result.buttons.length,5);for(const b of result.buttons)assert(b.hit&&b.left>=0&&b.right<=result.vw+1,label+': fliken går inte att trycka på '+JSON.stringify(b));
 };
 const wall=await read('S.wall'),theme=await read('S.theme');
 for(const width of [320,390,899,900,1024,1368]){
  await pg.setViewportSize({width,height:912});
  for(const form of ['standard','kapsel','klassisk'])for(const nav of ['fast','glas','piller']){
   const label=width+'/'+form+'/'+nav+'/'+wall+'/'+theme;
   await settings();await choose('segstil',form);await choose('flikrad',nav);await close();
   await pg.evaluate(()=>scrollTo(0,0));await h.idle(200);await navCheck(label);
   await click('#nav [data-id="mat"]');await click('[data-act="matTab"][data-id="vecka"]');
   const overflow=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert(overflow<=1,label+': sidledsöverströmning '+overflow);
   // Verklig scroll: Piller/Svävande ska gå att öppna igen; sidomenyn ska stanna kvar.
   await pg.evaluate(()=>scrollTo(0,Math.min(300,document.documentElement.scrollHeight-innerHeight-30)));await h.idle(650);
   if(width>=900){await navCheck(label+' scroll')}else if(nav==='glas'){
    assert(await pg.locator('.nav-mini.on').isVisible(),label+': menyknappen saknas');await click('.nav-mini.on');await h.idle(600);await navCheck(label+' återöppnad');
   }else if(nav==='piller'){
    const r=await pg.locator('#nav').boundingBox();assert(r.x>=0&&r.x+r.width<=width+1,label+': hopfällt piller utanför skärmen');
   }
   await pg.evaluate(()=>scrollTo(0,0));await h.idle(650);
  }
  await pg.reload();await h.idle(1500);assert.equal(await read('U4'),true);await navCheck(width+' omstart');
 }
 // Kontrollera alla flikar med andra inställningar än standard, efter omstart.
 for(const v of ['oversikt','mat','uppgifter','stad','ekonomi']){await click('#nav [data-id="'+v+'"]');assert.equal(await read('S.view'),v)}
 await settings();
 const colors=await pg.locator('.sheet').evaluate(e=>({back:getComputedStyle(e).backgroundColor,panel:getComputedStyle(e.querySelector('.sheet-panel')).backgroundColor}));
 assert.match(colors.back,/rgba\(/,'Dialogens bakgrund ska vara genomskinlig');assert.notEqual(colors.back,colors.panel);
 await close();
 if(wall){
  for(const pos of ['meny','knapp','rubrik']){
   await settings();const sec=pg.locator('[data-k="pref-enhet"]');if(!await sec.evaluate(e=>e.open))await sec.locator('summary').click();await choose('vaggknapp',pos);await close();await click('#nav [data-id="oversikt"]');assert(await pg.locator('[data-act="settings"]').first().isVisible());await navCheck('väggknapp '+pos);
  }
 }
 await click('[data-act="settings"]');const sec=pg.locator('[data-k="pref-oversikt"]');if(!await sec.evaluate(e=>e.open))await sec.locator('summary').click();await click('[data-act="arrange"]');await h.idle(350);
 const toolbar=await pg.locator('.arr-foot').boundingBox(),nav=await pg.locator('#nav').boundingBox();assert(toolbar.x>=nav.x+nav.width,'Ordna-verktygen ska ligga bredvid sidomenyn');
 await click('[data-act="arrangeDone"]');
 await h.shot('ui4-installningar-'+(wall?'vagg':'telefon'));
 console.log('PASS UI4 inställningar: 54 kombinationer av bredd/form/menyrad, scroll/omstart, fem flikar, dialoger, väggknappar och ordna-verktyg');
};
