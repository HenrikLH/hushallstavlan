// Röda dagar i månadsvyn: RODVAR=ljus|accent, visar oktober och december (jul, helgdagar på vardagar)
module.exports=async(pg,h)=>{
 const v=process.env.RODVAR||'accent',col=v==='ljus'?'color-mix(in srgb,var(--red) 70%,var(--surface))':'var(--accent)';
 await pg.addStyleTag({content:'html.ny.ui5 .cal-d.rod:not(.out):not(.today):not(.sel) .n{color:'+col+'}html.ny.ui5 .cal-wd span:nth-child(n+6){color:'+col+'}'});
 const click=async s=>{await pg.locator(s).first().click();await h.idle(500)};
 if(await pg.locator('.nav-mini.on').isVisible())await click('.nav-mini.on');
 await click('#nav [data-act="nav"][data-id="kalender"]');await click('[data-act="calVy"][data-id="manad"]');
 await h.shot('rod-'+v+'-okt');
 await click('[data-act="calMonth"][data-d="1"]');await click('[data-act="calMonth"][data-d="1"]');
 if(!(await pg.locator('.cal-d.rod').count()))throw new Error('inga röda dagar');
 await h.shot('rod-'+v+'-dec');
};
