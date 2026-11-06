// Listar rutor och knappar med hörnrundning per vy, för att hitta de som inte följer Kantiga/Runda/Raka (UI 2/4) eller --r5 (UI 5).
// Kör: ST=kapsel LS='{"ui":"2"}' node verktyg/emu/run.js verktyg/emu/radie-koll.js   (ST = standard|kapsel|klassisk; utan LS = UI 5)
module.exports=async(pg,h)=>{
 const vyer=[['_start',null],['nav','oversikt'],['nav','mat'],['matTab','vecka'],['matTab','inkop'],['matTab','recept'],['matTab','bank'],['matTab','efter'],['nav','kalender'],['nav','uppgifter'],['taskTab','stad'],['taskTab','lista'],['nav','ekonomi'],['settings',null]];
 const st=process.env.ST||'standard';await pg.evaluate(s=>{const c=document.documentElement.classList;c.remove('seg-kapsel','seg-klassisk');if(s!=='standard')c.add('seg-'+s)},st);
 const tot={};
 for(const [a,id] of vyer){const el=await pg.$('[data-act="'+a+'"]'+(id?'[data-id="'+id+'"]':''));if(!el&&a!=='_start')continue;if(el)try{await el.click({timeout:2000})}catch(e){await el.evaluate(x=>x.click())}await h.idle(700);
  const r=await pg.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);if(b.width<40||b.height<28||s.display==='none'||s.visibility==='hidden')return null;
   const syns=(s.backgroundColor!=='rgba(0, 0, 0, 0)')||parseFloat(s.borderTopWidth)>0||s.boxShadow!=='none';if(!syns)return null;
   const rad=s.borderTopLeftRadius,rb=s.borderBottomRightRadius;if(rad==='0px'&&rb==='0px')return null;if(parseFloat(rad)>=b.height/2-1)return null;
   return (e.parentElement.className?String(e.parentElement.className).split(' ')[0]+'>':'')+e.tagName.toLowerCase()+'.'+String(e.className).trim().split(/\s+/).slice(0,2).join('.')+' '+rad+(rb!==rad?'/'+rb:'')+' '+(b.width>200?'bred':'smal')+' h'+Math.round(b.height)}).filter(Boolean));
  r.forEach(x=>{const k=x.replace(/ h\d+$/,'');if(!tot[k])tot[k]=a+':'+(id||'')+' '+x.match(/h\d+$/)[0]})}
 Object.keys(tot).sort((a,b)=>parseFloat(a.split(' ')[1])-parseFloat(b.split(' ')[1])).forEach(k=>console.log(k+'   '+tot[k]));
};
