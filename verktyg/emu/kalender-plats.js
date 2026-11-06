// Förslag på var kalendern ska ligga. Kör med LS='{"ui":"5","navf":"a"}' (a/b/c) och P=prefix.
require('./stad-data');
module.exports=async(pg,h)=>{const P=process.env.P||'',F=JSON.parse(process.env.LS||'{}').navf||'';
 const t=await pg.evaluate(()=>window.__d('today()')),dd=n=>pg.evaluate(n=>window.__d('addDays(today(),'+n+')'),n);
 const E=h.sheet('Händelser'),T=h.sheet('Uppgifter');
 E.push([t,'08.00–16.30','Jobb','Henrik','egen','',''],[t,'17.30–18.30','Yoga','Cornelia','egen','',''],[await dd(1),'10.00','Tandläkare','Cornelia','egen','',''],[await dd(3),'19.00','Middag hos Ebba','','egen','',''],[await dd(5),'','Frasse veterinär','Henrik','egen','','']);
 T.push([false,'Byta däck på bilen',t,'','Henrik','tu1','egen',''],[false,'Skicka in deklaration',await dd(2),'','','tu2','egen',''],[false,'Köpa present till Leah',await dd(4),'','Cornelia','tu3','egen',''],[false,'Rensa förrådet','','','','tu4','egen','']);
 await pg.reload();await h.idle(1800);
 const go=async v=>{await pg.click('#nav [data-act="nav"][data-id="'+v+'"]');await h.idle(700)};
 const tabs=await pg.$$eval('#nav [data-act="nav"] span',x=>x.map(e=>e.textContent));console.log('FLIKAR',tabs.join(' | '));
 if(F==='a'){await go('uppgifter');await h.shot(P+'kalender');await pg.click('[data-act="taskTab"][data-id="lista"]');await h.idle(600);await h.shot(P+'attgora')}
 else if(F==='b'){await go('kalender');await h.shot(P+'kalender');await go('uppgifter');await h.shot(P+'attgora');await pg.click('[data-act="taskTab"][data-id="stad"]');await h.idle(700);await h.shot(P+'stad')}
 else if(F==='c'){await go('oversikt');await pg.evaluate(()=>document.querySelector('.calw').scrollIntoView({block:'center'}));await h.idle(400);await h.shot(P+'oversikt');await pg.click('.calw .wh');await h.idle(700);await h.shot(P+'kalender');await go('uppgifter');await h.shot(P+'attgora')}
 else{await go('uppgifter');await pg.click('[data-act="taskTab"][data-id="kalender"]');await h.idle(600);await h.shot(P+'kalender')}
 console.log('RUBRIK',await pg.$eval('#lt',e=>e.textContent));
};
