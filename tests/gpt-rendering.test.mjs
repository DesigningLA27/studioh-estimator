import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const src=readFileSync(new URL('../worker-ai/src/index.js',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'))).default;
const env={ADMIN_KEY:'test-admin',FAL_KEY:'test-fal'};
const req=b=>new Request('https://worker.test',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://designingla27.github.io'},body:JSON.stringify({type:'genimage',key:'test-admin',prompt:'Modern landscape',...b})});
test('GPT generation/edit routing, dimensions, reference order and medium quality',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,opts)=>{calls.push({url,body:JSON.parse(opts.body)});return Response.json({images:[{url:'https://example.com/render.jpg'}]});};
 try{
  for(const refs of [[],['site-photo','plant-photo']]){
   const r=await worker.fetch(req({model:'gpt-image-2',aspect:'3:2',refs}),env); const d=await r.json();
   assert.equal(r.status,200);assert.equal(d.usedRef,refs.length>0);assert.equal(d.model,'openai/gpt-image-2'+(refs.length?'/edit':''));
   const c=calls.at(-1); assert.equal(c.url,'https://fal.run/'+d.model);assert.equal(c.body.quality,'medium');assert.deepEqual(c.body.image_size,{width:1536,height:1024});assert.equal(c.body.aspect_ratio,undefined);
   if(refs.length)assert.deepEqual(c.body.image_urls,refs);
  }
  await worker.fetch(req({model:'nano-2',aspect:'4:3'}),env);assert.equal(calls.at(-1).url,'https://fal.run/fal-ai/nano-banana-2');assert.equal(calls.at(-1).body.aspect_ratio,'4:3');
 }finally{globalThis.fetch=original;}
});
test('rejects unauthorized, unknown, unsupported aspect and too many refs without paid calls',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw Error('Must not call upstream');};
 try{for(const [body,status] of [[{key:'wrong'},403],[{model:'unknown'},400],[{model:'gpt-image-2',aspect:'99:1'},400],[{model:'gpt-image-2',refs:Array(17).fill('photo')},400]])assert.equal((await worker.fetch(req(body),env)).status,status);}
 finally{globalThis.fetch=original;}
});
test('provider failures remain errors, never fall back to another model',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({detail:'Balance exhausted'},{status:402});
 try{const r=await worker.fetch(req({model:'gpt-image-2'}),env);assert.equal(r.status,502);assert.match((await r.json()).detail,/Balance/);}finally{globalThis.fetch=original;}
});
test('GPT is second in all catalogs and remains selected with plant photos',()=>{
 const catalog=html.slice(html.indexOf('const IMAGE_MODELS='),html.indexOf('function shvizModel()'));
 const helpers=html.slice(html.indexOf('const IMG_MODEL_KEY='),html.indexOf('async function _rpGenerate'));
 let saved='';const controls=[{},{}];
 const ctx=vm.createContext({localStorage:{getItem:()=>saved,setItem:(_,v)=>saved=v},document:{querySelectorAll:()=>controls}});
 vm.runInContext(catalog+helpers,ctx);
 assert.equal(vm.runInContext('Object.keys(IMAGE_MODELS)[1]',ctx),'gpt-image-2.5-sunburst');assert.equal(vm.runInContext('Object.keys(SHVIZ_MODELS)[1]',ctx),'gpt-image-2.5-sunburst');
 vm.runInContext('setImgModel("gpt-image-2.5-sunburst")',ctx);assert.equal(saved,'gpt-image-2.5-sunburst');assert.ok(controls.every(x=>x.value===saved));
 assert.equal(vm.runInContext('plantingImageModel(12)',ctx),'gpt-image-2.5-sunburst');assert.equal(vm.runInContext('plantingImageModel(12,"nano-2")',ctx),'nano-banana-pro');
 assert.match(vm.runInContext('imageModelOptions(imgModel())',ctx),/value="gpt-image-2.5-sunburst" selected/);
 vm.runInContext('setImgModel("invalid")',ctx);assert.equal(saved,'gpt-image-2.5-sunburst');
});
test('all render workflows offer a picker and no planting call forces Nano',()=>{
 for(const id of ['paimg-model','aiimg-model','rp-model','rp-custom-model','rf-model','elem-model','pl-fill-model'])assert.ok(html.includes('"'+id+'"'),id);
 assert.equal((html.match(/model:plantingImageModel\(_refPlants.length\)/g)||[]).length,2);
 assert.ok(html.includes('const _model=plantingImageModel(_refPlants.length)'));
 assert.ok(!html.includes('model:_refPlants.length?"nano-banana-pro":"nano-2"'));
});
test('Sunburst uses maximum quality for generation and editing',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,opts)=>{calls.push({url,body:JSON.parse(opts.body)});return Response.json({images:[{url:'https://example.com/render.jpg'}]});};
 try{for(const refs of [[],['site-photo','plant-photo']]){
  const r=await worker.fetch(req({model:'gpt-image-2.5-sunburst',refs,aspect:'3:2'}),env);const d=await r.json();
  assert.equal(r.status,200);assert.equal(d.quality,'max');assert.equal(calls.at(-1).url,'https://fal.run/openai/gpt-image-2.5/sunburst/'+(refs.length?'edit':'text-to-image'));assert.equal(calls.at(-1).body.quality,'max');
  if(refs.length)assert.deepEqual(calls.at(-1).body.image_urls,refs);
 }}finally{globalThis.fetch=original;}
});
test('Astra authenticates, requires separate credentials, and sends only supported Responses parameters',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,opts)=>{calls++;const b=JSON.parse(opts.body);assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(opts.headers.Authorization,'Bearer test-openai');assert.equal(b.model,'gpt-6-astra');assert.equal(b.reasoning.effort,'high');assert.equal(b.temperature,undefined);assert.equal(b.key,undefined);assert.equal(b.store,false);return Response.json({status:'completed',model:'gpt-6-astra',output:[{type:'message',content:[{type:'output_text',text:'Review complete'}]}]});};
 try{
  assert.equal((await worker.fetch(req({type:'designreason',input:'Review supplied plan',key:'wrong'}),env)).status,403);
  assert.equal((await worker.fetch(req({type:'designreason',input:'Review supplied plan'}),env)).status,503);assert.equal(calls,0);
  const r=await worker.fetch(req({type:'designreason',input:'Review supplied plan'}),{...env,OPENAI_API_KEY:'test-openai'});assert.equal(r.status,200);assert.equal((await r.json()).content[0].text,'Review complete');assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('Astra incomplete responses never become successful reviews',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({status:'incomplete',output:[{type:'message',content:[{type:'output_text',text:'Partial'}]}]});
 try{assert.equal((await worker.fetch(req({type:'designreason',input:'Review'}),{...env,OPENAI_API_KEY:'test-openai'})).status,502);}finally{globalThis.fetch=original;}
});
test('design-engine adapter carries supplied rules, geometry, evidence and locks without mutating them',async()=>{
 const {createDesignAI}=await import('../design-engine/ai-client.mjs');const sent=[];
 const client=createDesignAI({endpoint:'https://worker.test',adminKey:'test-admin',fetchImpl:async(_,o)=>{sent.push(JSON.parse(o.body));return Response.json({ok:true});}});
 const context={question:'Review alignment',questionnaire:{pool:true},site:{units:'feet'},rules:[{id:'alignment'}],evidence:[{id:'project-1'}],locks:['residence']};const before=JSON.stringify(context);
 await client.review(context);assert.deepEqual(JSON.parse(sent[0].input),context);assert.equal(sent[0].type,'designreason');assert.equal(JSON.stringify(context),before);
 await client.render({prompt:'Modern garden',refs:['photo']});assert.equal(sent[1].model,'gpt-image-2.5-sunburst');assert.equal(sent[1].quality,'max');assert.deepEqual(sent[1].refs,['photo']);
 assert.throws(()=>client.review({question:'No base'}),/Supply/);
});
