// Kör den riktiga klienttransporten med en deterministisk klocka och riktiga Kod.gs-kvittenser.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),gas=require('./gas');
const source=fs.readFileSync(require('path').join(process.env.APP||require('path').join(__dirname,'../..'),'app.js'),'utf8');
const rpc=source.slice(source.indexOf('async function recipeRpc(body)'),source.indexOf('\nasync function recipeSave()'));
async function run(body,handler,change){
 let now=0,next=0,calls=[],timers=new Map(),done=false,value,error;
 const state={key:'x',me:'Henrik'},online={onLine:true};
 const timeout=(fn,ms)=>{const id=++next;timers.set(id,{at:now+ms,fn});return id};
 const ctx={S:state,CFG:{api:'https://example.test'},navigator:online,AbortController,Date:{now:()=>now},setTimeout:timeout,clearTimeout:id=>timers.delete(id),fetch:async(url,options)=>{calls.push(options.body);return handler({index:calls.length,request:JSON.parse(options.body),signal:options.signal,wait:ms=>new Promise((resolve,reject)=>{const id=timeout(resolve,ms);options.signal.addEventListener('abort',()=>{timers.delete(id);reject(Object.assign(new Error('aborted'),{name:'AbortError'}))},{once:true})}),state,online})}};
 vm.createContext(ctx);vm.runInContext(rpc,ctx);if(change)change(ctx);
 ctx.recipeRpc(body).then(x=>{done=true;value=x},e=>{done=true;error=e});
 for(let i=0;i<50&&!done;i++){await new Promise(setImmediate);if(done)break;const first=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];assert(first,'RPC fastnade utan timer');now=first[1].at;timers.delete(first[0]);first[1].fn()}
 assert(done,'RPC slutar efter begränsat antal försök');assert.equal(timers.size,0,'inga kvarglömda timers');return{value,error,calls,now};
}
const response=j=>({ok:true,json:async()=>j});
(async()=>{
 for(const action of ['recipeSave','recipeImport']){const r=await run({action,...action==='recipeSave'?{op:'slow-save'}:{}},async({wait})=>{await wait(26000);return response({ok:true})});assert.ifError(r.error);assert.equal(r.value.ok,true,action+' ska tåla över 25 sekunder');assert.equal(r.calls.length,1)}
 let r=await run({action:'recipeImport'},async({index})=>response(index===1?{ok:false,error:'Exception: Lock timeout'}:{ok:true,candidates:[]}));assert(r.value.ok);assert.equal(r.calls.length,2);
 r=await run({action:'recipeSave',op:'locked'},async()=>response({ok:false,error:'Låset är upptaget'}));assert.equal(r.calls.length,3);assert.equal(r.value.ok,false);
 for(const code of ['duplicate','conflict','validation']){r=await run({action:'recipeSave',op:'error'},async()=>response({ok:false,code,error:'Fel uppgift'}));assert.equal(r.calls.length,1);assert.equal(r.value.code,code)}
 gas.ctx.setupRecipes();const recipe={title:'Tacos transporttest',portions:4,min:20,group:'Vardag',who:'Kött',groups:[{title:'',items:[{q:500,u:'g',n:'köttfärs'}]}],steps:[{t:'Stek färsen och fyll bröden.'}],src:'',img:''};
 r=await run({action:'recipeSave',root:'rpc-tacos',expectedRev:0,recipe,op:'rpc-tacos-lost-response'},async({index,request})=>{const result=JSON.parse(gas.handle('POST',JSON.stringify(request),{}));assert(result.ok,result.error);if(index===1)throw new TypeError('Failed to fetch');return response(result)});
 assert(r.value.ok);assert.equal(r.calls.length,2);assert.equal(r.calls[0],r.calls[1],'återförsök har identisk kropp och operations-id');assert.equal(gas.ctx.recipeStore_().versions.filter(x=>x._root==='rpc-tacos').length,1,'tappat svar skapar ingen dubblett');
 r=await run({action:'recipeImport'},async({wait})=>{await wait(95000);return response({ok:true})});assert.equal(r.error.name,'AbortError');assert.equal(r.calls.length,1);assert.equal(r.now,90000);
 r=await run({action:'recipeSave',op:'unreachable'},async({wait})=>{await wait(95000);return response({ok:true})});assert.equal(r.error.name,'AbortError');assert.equal(r.now,120000,'total väntan är begränsad');
 r=await run({action:'recipeSave',op:'household'},async({state})=>{state.key='other';return response({ok:true})});assert.match(r.error.message,/Hushållet ändrades/);assert.equal(r.calls.length,1);
 r=await run({action:'recipeSave',op:'offline'},async({online})=>{online.onLine=false;throw new TypeError('Offline')});assert.equal(r.calls.length,1);assert(r.error);
 console.log('PASS RECEPT RPC: långsam import/sparning, låsåterförsök, oförändrade konflikter/validering, tappat svar utan dubblett, 90/120 s tidsgräns, hushållsbyte/offline och timerstädning.');
})().catch(e=>{console.error(e);process.exitCode=1});
