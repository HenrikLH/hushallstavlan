// Regression: several ancestral branches meet through partners. The tree must
// not draw connectors through person cards or merge unrelated family lines.
const assert=require('node:assert/strict');
module.exports=async(pg,h)=>{
 const rows=h.sheet('Inställningar'),set=(k,v)=>{const r=rows.find(x=>x[0]===k);if(r)r[1]=v;else rows.push([k,v])};
 const people=Array.from({length:20},(_,i)=>({namn:'Person'+i,datum:'03-'+String(i+1).padStart(2,'0')}));
 const key=i=>people[i].namn+'|'+people[i].datum,par={};
 for(const [child,parents] of [[6,[0,1]],[7,[0,1]],[8,[2,3]],[9,[2,3]],[10,[4,5]],[11,[4,5]]])par[key(child)]=parents.map(key);
 for(const [child,parents] of [[12,[6,8]],[13,[6,8]],[14,[6,8]],[15,[7,10]],[16,[7,10]],[17,[9,11]],[18,[9,11]],[19,[9,11]]])par[key(child)]=parents.map(key);
 const partners=[[0,1],[2,3],[4,5],[6,8],[7,10],[9,11]].map(p=>p.map(key));
 set('fodelsedagar',JSON.stringify(people));
 const wishes=JSON.parse(rows.find(x=>x[0]==='onskelista')?.[1]||'[]').filter(x=>!x.fod);
 wishes.push({fod:1,add:[],del:[],sr:{par,partners,siblings:[]}});
 set('onskelista',JSON.stringify(wishes));
 await pg.reload();await h.idle(1200);
 const click=async s=>{await pg.locator(s).first().click();await h.idle(320)};
 await click('[data-act="settings"]');
 if(!(await pg.locator('details[data-k="pref-avancerat"]').evaluate(x=>x.open)))await click('details[data-k="pref-avancerat"] > summary');
 await click('[data-act="dev"]');await click('[data-act="familjOpen"]');await click('[data-act="nav"][data-id="slakt"]');
 assert.equal(await pg.locator('.fam3-node').count(),20,'Alla familjemedlemmar ska finnas på trädet');
 assert.equal(await pg.locator('.fam3-edge.bus').count(),6,'Exakt en barnbuss per familj');
 assert.ok(await pg.locator('.fam3-bridge').count()>0,'Korsningar har visuella bryggor istället för falska knutpunkter');
 const issues=await pg.locator('.fam3-svg').evaluate(svg=>{
  const nodes=[...svg.querySelectorAll('.fam3-node')].map(n=>{
   const p=n.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);
   return{id:n.dataset.id,x:Number(p?.[1]),y:Number(p?.[2])};
  });
  let hits=0,diagonal=0;
  for(const edge of svg.querySelectorAll('.fam3-edge')){
   const d=edge.getAttribute('d'),part=d.match(/[MVHL]-?\d+(?:\.\d+)?(?:\s+-?\d+(?:\.\d+)?)?/g)||[];
   let point=null;
   for(const cmd of part){
    const typ=cmd[0],nums=cmd.slice(1).trim().split(/\s+/).map(Number);
    const next=typ==='M'||typ==='L'?{x:nums[0],y:nums[1]}:typ==='H'?{x:nums[0],y:point?.y}:{x:point?.x,y:nums[0]};
    if(point){if(point.x!==next.x&&point.y!==next.y)diagonal++;
     for(const n of nodes){
      const loX=Math.min(point.x,next.x),hiX=Math.max(point.x,next.x),loY=Math.min(point.y,next.y),hiY=Math.max(point.y,next.y);
      if((point.x===next.x&&point.x>n.x-72&&point.x<n.x+72&&loY<n.y+33&&hiY>n.y-33)||
       (point.y===next.y&&point.y>n.y-33&&point.y<n.y+33&&loX<n.x+72&&hiX>n.x-72))hits++;
     }
    }
    point=next;
   }
  }
  return{hits,diagonal};
 });
 assert.equal(issues.hits,0,'Ingen relationslinje får passera genom något personkort');
 assert.equal(issues.diagonal,0,'Ingen diagonal spaghettilinje i relationskartan');
 await h.shot('familj-grenar-korsningar');
 await click('.fam3-node[data-id="'+key(6)+'"]');
 await click('[data-act="slaktVy"][data-id="alla"]');
 await click('[data-act="slaktVy"][data-id="fokus"]');
 assert.ok(await pg.locator('.fam3-edge.muted').count()>0,'Orelaterade linjer tonas ned i fokus');
 await h.shot('familj-grenar-fokus');
};