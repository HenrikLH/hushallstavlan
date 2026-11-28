// Rumsringarna i Städ med hushållets riktiga sysslor 27/11: ringarna räknar alla sysslor viktat, tryck på en ring öppnar rummets blad, "Allt är redan fint här" fyller ringen.
// NOW=2026-11-27T21:30:00+01:00 THEME=dark node verktyg/emu/run.js verktyg/emu/stad-ringar.js
const assert=require('node:assert/strict');
const R=`c01|Kök|Diska, eller töm och fyll diskmaskinen|1|10|2026-11-27
c02|Kök|Torka av bänkar, spis och diskho|1|5|2026-11-27
c03|Hundar|Diska hundskålarna och byt vatten|1|3|2026-11-27
c04|Hall|Torka tassar och tassavtryck vid dörren|1|3|2026-11-27
c05|Vardagsrum|Tio minuters plock: allt tillbaka på sin plats|1|10|2026-11-19
c10|Hall|Dammsug hallen (grus och hundhår)|2|5|2026-11-27
c11|Vardagsrum|Dammsug vardagsrummet (hundhår)|2|10|2026-11-22
c12|Toalett|Snabbtorka handfat, kran och spegel|2|3|2026-11-10
c13|Kök|Töm sopor, kompost och återvinning|3|5|2026-11-14
c14|Toalett|Rengör toalettstolen|3|5|2026-11-09
c15|Sovrum|Dammsug sovrummet|4|8|2026-11-06
c16|Hundar|Skaka ur eller dammsug hundbäddar och filtar|4|5|2026-10-30
c17|Kök|Våttorka köksgolvet|7|10|2026-10-20
c18|Hall|Våttorka hallgolvet|5|8|2026-11-17
c19|Toalett|Storstäda toaletten: golv, dusch och handfat|7|20|2026-11-08
c20|Sovrum|Byt sängkläder|7|15|2026-10-27
c21|Hundar|Tvätta hundfiltar och överdrag till bäddarna|7|5|2026-11-06
c22|Vardagsrum|Damma ytor och tv-bänk|7|10|2026-10-18
c23|Vardagsrum|Dammsug soffan eller ta bort hundhår med luddrulle|7|10|2026-10-19
c24|Kök|Rensa kylskåpet inför handlingen|7|10|2026-11-08
c25|Kök|Torka av mikron och handtagen på kyl och ugn|7|5|2026-11-15
c26|Vardagsrum|Våttorka vardagsrumsgolvet|14|15|2026-10-01
c27|Sovrum|Våttorka sovrumsgolvet|14|10|2026-09-27
c28|Sovrum|Dammsug under sängen|14|10|2026-09-25
c29|Hall|Torka dörrhandtag och strömbrytare|14|5|2026-10-04
c30|Hall|Skaka ut dörrmattan och torka skohyllan|14|8|2026-10-01
c31|Hundar|Tvätta koppel, selar och hundleksaker|30|15|2026-09-10
c32|Kök|Rengör kylskåpet invändigt|30|20|2026-09-20
c33|Kök|Rengör ugnen och mikron|30|25|2026-10-14
c34|Kök|Rengör diskmaskinsfiltret och avloppet i diskhon|30|10|2026-09-25
c35|Toalett|Rengör golvbrunnen och skrubba fogarna|30|20|2026-09-15
c36|Vardagsrum|Damma lister, lampor och tavlor|30|20|2026-09-01
c37|Kök|Torka av köksluckor och kakel|30|20|2026-09-20
c38|Sovrum|Tvätta täcken och kuddar|90|20|2026-08-01
c39|Alla rum|Putsa fönster|90|60|2026-06-15
c40|Kök|Frosta av frysen|90|30|2026-08-20
c41|Alla rum|Flytta möbler och dammsug bakom dem|90|40|2026-07-20`.split('\n').map(l=>{const[id,room,title,freq,min,lastDone]=l.split('|');return{id,room,title,freq:+freq,min:+min,lastDone,prevDone:'',doneBy:'',who:'',tip:'',plannedFor:'',snoozeUntil:'',order:0}});
module.exports=async(pg,h)=>{
 await pg.locator('#nav [data-id="uppgifter"]').click();await h.idle(800);
 await pg.locator('[data-act="taskTab"][data-id="stad"]').click();await h.idle(800);
 await pg.evaluate(c=>window.__d("S.data.clean="+JSON.stringify(c)+";settings().stadtid_vardag='20';settings().stadtid_helg='40';render()"),R);await h.idle(800);
 const ringar=pg.locator('main .sx-ringar button');assert.ok(await ringar.count()>=6,'Ringarna är knappar');
 const last=await pg.locator('main .sx-last').innerText();assert.match(last,/39 min om dagen.*26/);console.log('Rad:',last);
 await pg.locator('main .sx-ringar').scrollIntoViewIfNeeded();await h.idle(400);
 const sc=await pg.evaluate(()=>window.__d("JSON.stringify(roomHealth().map(r=>r.room+' '+Math.round(r.score*100)))"));console.log('Ringar:',sc);
 await h.shot('ringar');
 await pg.locator('main .sx-ringar button',{hasText:'Vardagsrum'}).click();await h.idle(900);
 const sh=pg.locator('.sheet[data-k], .sheet').last();assert.match(await pg.locator('.sheet h2').innerText(),/Vardagsrum/);
 await h.shot('vardagsrum');
 await pg.evaluate(()=>window.__d("apiPost=()=>{};apiGet=async()=>{throw new Error('av')}"));await pg.locator('.sheet [data-act="stadRumFint"]').click();await h.idle(900);
 const v=await pg.evaluate(()=>window.__d("Math.round(roomHealth().find(r=>r.room==='Vardagsrum').score*100)"));assert.equal(+v,100,'Vardagsrum fullt efter Allt är fint');
 await pg.locator('main .sx-ringar').scrollIntoViewIfNeeded();await h.shot('efter');
};
