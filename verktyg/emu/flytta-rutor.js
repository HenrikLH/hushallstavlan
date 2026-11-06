// Flytta rutor på Översikt: håll in en ruta med finger, dra den nedåt, släpp och kontrollera att ordningen sparats.
// Kör: node verktyg/emu/run.js verktyg/emu/flytta-rutor.js   (väggen: LS='{"wall":"1","me":""}' VP=1368x912)
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const cdp=await pg.context().newCDPSession(pg);
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 const ordning=()=>pg.evaluate(()=>[...document.querySelectorAll('[data-box]')].map(b=>b.dataset.box).join(','));
 const nyckel=()=>pg.evaluate(()=>Object.keys(localStorage).filter(k=>/Layout/.test(k)).map(k=>k+'='+localStorage.getItem(k)).join(' | '));
 const wall=await pg.evaluate(()=>localStorage.getItem('ht.wall')==='1');
 {await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(800)}
 console.log('före: '+await ordning());
 // dra ruta a till platsen under ruta b
 const dra=async(a,b,steg=14)=>{const A=await pg.$('[data-box="'+a+'"]');await A.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-120));await h.idle(300);
  const ra=await A.boundingBox();const x=ra.x+ra.width/2,y=ra.y+Math.min(40,ra.height/2);
  await touch('touchStart',x,y);await pg.waitForTimeout(900);console.log('  arrange efter håll: '+await pg.evaluate(()=>document.querySelector('.arranging')?'ja':'nej')+', lyft: '+await pg.evaluate(()=>!!document.querySelector('.lift-root')));
  const rb=await (await pg.$('[data-box="'+b+'"]')).boundingBox();const vh=pg.viewportSize().height,tx=rb.x+rb.width*.75,ty=Math.min(rb.y+rb.height*.8,vh-200);
  for(let i=1;i<=steg;i++){await touch('touchMove',x+(tx-x)*i/steg,y+(ty-y)*i/steg);await pg.waitForTimeout(40)}
  console.log('  kopian: '+await pg.evaluate(()=>{const r=document.querySelector('.lift-root .lift');return r?JSON.stringify(r.getBoundingClientRect()):'saknas'}));if(!await pg.$('.lift-root'))fel('ingen kopia följer fingret');
  await h.shot((wall?'vagg':'tel')+'-drar-'+a);
  await touch('touchEnd');await h.idle(600)};
 const forsta=(await ordning()).split(',');
 await dra(forsta[0],forsta[1]);
 const efter=await ordning();console.log('efter: '+efter);console.log('sparat: '+await nyckel());
 if(efter.split(',')[0]===forsta[0])fel('rutan flyttades inte');
 await h.shot((wall?'vagg':'tel')+'-efter-flytt');
 // hörnknappen och dölj
 const s=await pg.$('.arr-s');if(s){await s.click({force:true});await h.idle(500);console.log('storlek: '+await nyckel())}else console.log('ingen storleksknapp');
 const x=await pg.$('.arr-x');if(x){await x.click({force:true});await h.idle(500);console.log('dold: '+await nyckel())}
 const k=await pg.$('[data-act="arrangeDone"]');if(k){await k.click({force:true});await h.idle(500)}else fel('Klar saknas');
 // ladda om: sparad ordning ska finnas kvar
 await pg.reload();await h.idle(2000);{await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(800)}
 const sparad=await ordning();console.log('efter omladdning: '+sparad);
 // Avbryt: flytta igen men ångra, då ska den sparade ordningen vara kvar
 const f2=sparad.split(',');await dra(f2[0],f2[1]);const mitt=await ordning();console.log('utkast: '+mitt+' · '+await pg.evaluate(()=>(document.querySelector('.arr-st')||{}).textContent));
 if(mitt===sparad)fel('andra flytten gick inte');const av=await pg.$('[data-act="arrangeCancel"]');if(!av)return fel('Avbryt saknas');await av.evaluate(e=>e.click());await h.idle(500);
 const ef=await ordning();console.log('efter Avbryt: '+ef);if(ef!==sparad)fel('Avbryt lade inte tillbaka ordningen');
 await pg.reload();await h.idle(2000);await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(800);if(await ordning()!==sparad)fel('utkastet sparades trots Avbryt');
};
