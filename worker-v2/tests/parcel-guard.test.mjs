import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../../v2/src/guard.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../../v2/engine.html',import.meta.url),'utf8');
const base='https://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Parcel/MapServer/0/query';
test('V2 permits exact read-only parcel queries without cookies, and keeps unrelated requests blocked',async()=>{
 const calls=[],window={addEventListener(){},fetch:async(...args)=>{calls.push(args);return Response.json({features:[]})}};
 vm.runInNewContext(source,{window,navigator:{},parent:{},location:{href:'https://app.warwick.design/app/'},URL,Response,Map,Promise,Error,setTimeout,clearTimeout});
 await window.fetch(base+'?f=json&geometry=fixture',{mode:'cors',credentials:'include'});
 assert.equal(calls.length,1);assert.equal(calls[0][1].credentials,'omit');assert.equal(calls[0][1].redirect,'error');
 await assert.rejects(window.fetch(base,{method:'POST',body:'private'}),/not connected/);
 await assert.rejects(window.fetch(base+'/other'),/not connected/);
 await assert.rejects(window.fetch('https://example.com/query'),/not connected/);
 await assert.rejects(window.fetch(base.replace('https:','http:')),/not connected/);
 assert.equal(calls.length,1);
 assert(engine.includes('<script>'+source+'</script>'));assert(engine.slice(0,engine.indexOf('<script>')).includes(base));
});
