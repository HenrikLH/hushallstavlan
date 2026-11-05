// Bilder av UI 5.0 (Apple): kör med LS={"ui":"5","stadVy":"ring"} och P=prefix. CSS=<fil> lägger extra prov-CSS under html.ui5.
require('./stad-data');const fs=require('fs');
module.exports=async(pg,h)=>{const P=process.env.P||'';
 const css=process.env.CSS?fs.readFileSync(process.env.CSS,'utf8'):'';
 const on=async()=>{if(css)await pg.evaluate(c=>{document.documentElement.classList.add('ui5');let s=document.getElementById('ui5css');if(!s){s=document.createElement('style');s.id='ui5css';document.head.appendChild(s)}s.textContent=c},css);await h.idle(300)};
 const go=async v=>{await pg.click('#nav [data-act="nav"][data-id="'+v+'"]');await h.idle(700);await on()};
 await on();
 await go('oversikt');await h.shot(P+'oversikt');
 await go('mat');await pg.click('[data-act="matTab"][data-id="vecka"]');await h.idle(600);await on();await h.shot(P+'mat');
 await go('stad');await h.shot(P+'stad');
 await go('uppgifter');await h.shot(P+'uppgifter');
 await go('ekonomi');await h.shot(P+'ekonomi');
 await pg.click('[data-act="settings"]');await h.idle(800);await on();await h.shot(P+'installningar');
};
