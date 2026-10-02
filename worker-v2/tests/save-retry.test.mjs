import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../../v2/src/cloud.js',import.meta.url),'utf8');
test('failed asset packing keeps project dirty, then retry saves it',async()=>{
 let fail=true,writes=0;const box={structuredClone,clearTimeout,Event,console,window:{dispatchEvent(){},v2Preview:{notice(){}}},pack:async x=>{if(fail)throw new TypeError('Load failed');return x},jsonPut:async()=>{writes++;return {headers:new Headers({'X-StudioH-Revision':'next'})}},parseValues:x=>x,prefsObject:()=>({}),status(){},showGate(){}};vm.createContext(box);
 vm.runInContext(`let demoMode=false,projectAccess='owner',timer,saving=null,loading=false,token='test',dirty=true,prefsDirty=false,conflict=false,lastBid={S:{pi:{project:'Test'}}},engineStore={},studioKeys=[],projectId='p1',etag='prior',current,prefsTag='',shellKey='workspace',memory=new Map();${source.slice(source.indexOf('async function flush(){'),source.indexOf('async function readProject('))}globalThis.flush=flush;globalThis.isDirty=()=>dirty;`,box);
 await assert.rejects(box.flush(),/Load failed/);assert.equal(box.isDirty(),true);assert.equal(writes,0);fail=false;await box.flush();assert.equal(box.isDirty(),false);assert.equal(writes,2);
});

function putFixture(api){const box={api,Map,JSON,Error,TypeError};vm.createContext(box);vm.runInContext(source.slice(source.indexOf('const pendingWrites='),source.indexOf('async function sha'))+'globalThis.put=jsonPut;',box);return box.put}
test('lost save response reconciles identical server content without an overwrite',async()=>{
 let writes=0;const data={workspace:{hours:4},updated:'now'},put=putFixture(async(p,o)=>{if(o){writes++;throw new TypeError('Load failed')}return new Response(JSON.stringify(data),{headers:{'X-StudioH-Revision':'saved'}})});
 const r=await put('/projects/p',data,'old');assert.equal(r.headers.get('X-StudioH-Revision'),'saved');assert.equal(writes,1);
});
test('another device changes content: conflict remains and is never overwritten',async()=>{
 let writes=0;const put=putFixture(async(p,o)=>{if(o){writes++;const e=new Error('Conflict');e.status=409;throw e}return new Response(JSON.stringify({workspace:{hours:7}}),{headers:{'X-StudioH-Revision':'other'}})});
 await assert.rejects(put('/projects/p',{workspace:{hours:4}},'old'),/Conflict/);assert.equal(writes,1);
});
test('temporary network failure retries the same conditional write',async()=>{
 let writes=0;const put=putFixture(async(p,o)=>{if(o){writes++;assert.equal(o.headers['If-Match'],'old');if(writes===1)throw new TypeError('Load failed');return new Response('{}',{headers:{'X-StudioH-Revision':'saved'}})}return new Response('{}',{headers:{'X-StudioH-Revision':'old'}})});
 await put('/projects/p',{workspace:{hours:4}},'old');assert.equal(writes,2);
});
