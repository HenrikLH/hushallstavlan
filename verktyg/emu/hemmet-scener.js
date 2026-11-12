// Hemmet: apparater i halv bredd, mest ändrade lampor först, plus = Ny scen eller enhet, scener fyra i rad.
// Kör: LS='{"haDemo":"1","me":"Henrik"}' node verktyg/emu/run.js verktyg/emu/hemmet-scener.js
module.exports=async(pg,h)=>{
 const fel=m=>{console.log('SCENARIO FAIL '+m);process.exitCode=1};
 await pg.click('#nav [data-act="nav"][data-id="hemmet"]');await h.idle(900);
 // apparaterna ska ha samma bredd som lamporna
 const bw=await pg.evaluate(()=>[...document.querySelectorAll('#main .ha-g-v .ha-ap, #main .ha-g-v .ha-t:not(.ha-ap)')].map(e=>[e.classList.contains('ha-ap'),Math.round(e.getBoundingClientRect().width)]));
 const ap=bw.filter(x=>x[0]).map(x=>x[1]),la=bw.filter(x=>!x[0]).map(x=>x[1]);console.log('bredd apparat',ap,'lampa',la[0]);
 if(!ap.length||ap.some(w=>Math.abs(w-la[0])>2))fel('apparaterna har inte samma bredd som övriga');
 // fyra scener i rad
 const sc=await pg.evaluate(()=>[...document.querySelectorAll('#main .hus-sc .ha-st')].map(e=>Math.round(e.getBoundingClientRect().top)));
 const rad1=sc.filter(t=>t===sc[0]).length;console.log('scener',sc.length,'första raden',rad1);if(await pg.evaluate(()=>innerWidth<700)&&rad1!==Math.min(4,sc.length))fel('inte fyra scener i rad');
 // mest ändrade lampan först: tryck tre gånger på en lampa längre ner, rita om
 const forst=async()=>pg.evaluate(()=>[...document.querySelectorAll('#main .ha-rh-k')].map(e=>e.textContent.trim()));
 const fore=await forst();console.log('rum före',fore.join(', '));
 const sista=pg.locator('#main .ha-g-v').last().locator('.ha-t .ha-i').first();const namn=await pg.locator('#main .ha-g-v').last().locator('.ha-n').first().innerText();
 await sista.click();await h.idle(300);
 const n1=await pg.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('ht.haAnv')||'{}')).length);if(!n1)fel('ändringen räknades inte');
 await pg.evaluate(()=>{const o=JSON.parse(localStorage.getItem('ht.haAnv')||'{}');for(const k in o)o[k][0]=5;localStorage.setItem('ht.haAnv',JSON.stringify(o))});
 const flik=async id=>{await pg.evaluate(()=>scrollTo(0,0));await h.idle(300);if(await pg.locator('.nav-mini.on').count())await pg.click('.nav-mini.on');await h.idle(300);await pg.click('#nav [data-act="nav"][data-id="'+id+'"]')};
 await flik('oversikt');await h.idle(500);await flik('hemmet');await h.idle(800);
 const efter=await forst();console.log('rum efter',efter.join(', '),'ändrad lampa',namn);
 if(fore.length>1&&efter[0]===fore[0])fel('mest ändrade rummet kom inte först');
 if(await pg.locator('#main .hus-sc .hab-tom').count())fel('tom plats för ny scen finns kvar');
 // plus: meny med Ny scen
 await pg.click('#main .hus-ny>summary');await h.idle(300);await h.shot('hemmet-plus');
 await pg.click('#main .hus-ny [data-act="habScNy"]');await h.idle(600);
 const wall=await pg.evaluate(()=>document.body.classList.contains('wall'));if(!await pg.locator('#overlay form[data-form="habSc"]').count())fel('scenbladet öppnades inte');
 if(!wall)await pg.fill('#overlay input[name="habn"]','Läsa');await pg.click('#overlay button[type="submit"]');await h.idle(900);
 const nya=await pg.locator('#main .hus-sc .ha-st').allInnerTexts();console.log('scener nu',nya.map(s=>s.trim()).join(', '));
 if(!nya.some(s=>s.includes(wall?'Scen 5':'Läsa')))fel('nya scenen syns inte');
 // fyll rutans platser och lägg till en scen till: den ska hamna efter de fyra
 for(let i=0;i<3;i++){await pg.click('#main .hus-ny>summary');await h.idle(300);await pg.click('#main .hus-ny [data-act="habScNy"]');await h.idle(500);if(!wall)await pg.fill('#overlay input[name="habn"]','Extra '+i);await pg.click('#overlay button[type="submit"]');await h.idle(700)}
 const alla=await pg.locator('#main .hus-sc .ha-st').allInnerTexts();console.log('alla',alla.map(s=>s.trim()).join(', '));
 if(!alla.some(s=>s.includes(wall?'Scen 8':'Extra 2')))fel('scen nummer fem+ syns inte i Hemmet');
 await pg.evaluate(()=>scrollTo(0,0));await h.shot('hemmet-scener');
};
