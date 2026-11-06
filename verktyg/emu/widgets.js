// Widgets i tre storlekar (Experimentellt): fyller på exempeldata, slår på brytaren i Inställningar → Avancerat,
// visar Översikt, byter storlek via hörnknappen i Ändra ordning och tar bilder av alla storlekar.
// Kör: node verktyg/emu/run.js verktyg/emu/widgets.js     Vägg: LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/widgets.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('PAGEERROR '+m);process.exitCode=1};
 const wall=await pg.evaluate(()=>localStorage.getItem('ht.wall')==='1'),V=wall?'vagg':'tel';
 const t='2026-10-18',tm='2026-10-19',d=n=>'2026-10-'+n;
 [['Byt till vinterdäck',t],['Ring elektrikern',t],['Betala fakturan för bredband',tm],['Boka tandläkare',d(23)],['Lämna paket på Posten',d(24)],['Rensa förrådet',d(28)],['Köp present till mamma','']].forEach(([x,du],i)=>h.sheet('Uppgifter').push([false,x,du,'','','wt'+i,'egen','']));
 [[t,'07.45','Lämna bilen på service','Henrik'],[t,'12.00','Lunch med Sara','Cornelia'],[t,'17.30','Padel','Henrik'],[t,'19.00','Bokcirkel','Cornelia'],[tm,'08.15','Tandläkare','Cornelia'],[tm,'18.00','Simning','Henrik'],[d(21),'18.00','Middag hos Anna',''],[d(22),'','Föräldramöte','']].forEach(e=>h.sheet('Händelser').push([e[0],e[1],e[2],e[3],'egen','','']));
 [['Kök','Torka av köksbänkar',1,5],['Kök','Diska',1,15],['Vardagsrum','Dammsuga vardagsrum',7,15],['Hall','Torka golv i hallen',7,10],['Toalett','Rengöra handfat',7,5],['Sovrum','Byta lakan',14,15],['Vardagsrum','Vattna blommor',4,5],['Kök','Torka ur kylen',30,20]].forEach((c,i)=>h.sheet('Städ').push(['wc'+i,c[0],c[1],c[2],c[3],i%3?d(10+i):'','','','','','','',i]));
 [['Purjolök','2 st','Frukt och grönt',18],['Citron','1 st','Frukt och grönt',6],['Babyspenat','65 g','Frukt och grönt',22],['Mellanmjölk','1,5 l','Mejeri',19],['Grekisk yoghurt','1 kg','Mejeri',39],['Vita bönor','2 frp','Skafferi',24],['Pumpafrön','1 påse','Skafferi',29]].forEach((x,i)=>h.sheet('Inköp').push([false,x[0],x[1],x[2],'',x[3],'','','ws'+i,'egen','',900+i]));
 const st=h.sheet('Inställningar').find(r=>r[0]==='fodelsedagar');st[1]=JSON.stringify([{namn:'Mamma',datum:'10-23',ar:1964},{namn:'Erik',datum:'11-02',ar:1992},{namn:'Moster Lena',datum:'11-14',ar:1968},{namn:'Alva',datum:'12-03',ar:2021},{namn:'Pappa',datum:'12-19',ar:1962}]);
 await pg.reload();await h.idle(2200);
 // widgets är standard sedan ht-v272 (brytaren under Inställningar → Översikten stänger av dem)
 await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(1200);
 const boxes=()=>pg.evaluate(()=>[...document.querySelectorAll('.xw')].map(b=>b.dataset.box+':'+(b.className.match(/xw-(\w)/)||[])[1]+(b.querySelector('.xin')&&b.querySelector('.xin').scrollHeight>b.querySelector('.xin').clientHeight+2?'(klipps)':'')).join(' '));
 console.log('standard: '+await boxes());if(!await pg.$('.xgrid'))fel('rutnätet saknas');
 // helsidesbilderna utan den fasta menyraden och meddelandet, annars hamnar de mitt i bilden
 const ren=()=>pg.evaluate(()=>{if(!document.getElementById('xw-ren'))document.head.insertAdjacentHTML('beforeend','<style id="xw-ren">body:not(.wall) .nav,#toast{display:none!important}</style>')});
 const smut=()=>pg.evaluate(()=>{const x=document.getElementById('xw-ren');if(x)x.remove()});
 await ren();await h.shot(V+'-xw-standard',!wall);await smut();
 // storleksvalet: håll in en ruta, tryck hörnknappen, välj Stor
 const id=wall?'inkop':'mat';const b=await pg.$('[data-box="'+id+'"]');await b.scrollIntoViewIfNeeded();
 const bb=await b.boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(900);await pg.mouse.up();await h.idle(500);
 const s=await pg.$('[data-box="'+id+'"] .arr-s');if(!s){fel('hörnknappen saknas');return}await s.evaluate(e=>e.click());await h.idle(400);await pg.evaluate(i=>{const b=document.querySelector('[data-box="'+i+'"]');scrollTo(0,b.getBoundingClientRect().top+scrollY-200)},id);await h.idle(300);
 if(!await pg.$('.xsz'))fel('storleksmenyn öppnades inte');await h.shot(V+'-xw-meny');
 const o=await pg.$('.xsz [data-id="'+id+':l"]');if(!o){fel('valet Stor saknas');return}await o.evaluate(e=>e.click());await h.idle(500);
 const z=await pg.evaluate(i=>document.querySelector('[data-box="'+i+'"]').className,id);console.log('efter val: '+z);if(!/xw-l/.test(z))fel('storleken ändrades inte');
 await h.shot(V+'-xw-andra');await (await pg.$('[data-act="arrangeDone"]')).evaluate(e=>e.click());await h.idle(400);
 // alla rutor i samma storlek, för en översikt över innehållet
 for(const zz of ['s','m','l']){await pg.evaluate(([zz,w])=>{const ids=['kal','upg','mat','stad','inkop','hem','imorgon','fod'];const size={};ids.forEach(i=>size[i]=zz);
   localStorage.setItem(w?'ht.wallLayoutX':'ht.ovLayoutX',JSON.stringify({cols:[ids],hidden:w&&zz!=='s'?ids.slice(zz==='m'?8:4):[],size}))},[zz,wall]);
  await pg.click('[data-act="nav"][data-id="mat"]');await h.idle(500);await pg.click('[data-act="nav"][data-id="oversikt"]');await h.idle(900);
  console.log(zz+': '+await boxes());await ren();await h.shot(V+'-xw-alla-'+zz,!wall);await smut()}
};
