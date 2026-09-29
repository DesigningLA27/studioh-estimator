import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{hash} from '../src/index.js';
import {verifyIdentity} from '../src/managed-login.js';
import {environment} from './fixture.mjs';
const enc=new TextEncoder(),b64=v=>Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64url');
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key'};
const env=environment();env.OWNER_EMAIL='owner@example.com';env.ACCESS_ISSUER='https://test-team.cloudflareaccess.com';env.ACCESS_AUD='a'.repeat(64);
async function signed(changes={}){const h=b64({alg:'RS256',kid:'test-key'}),p=b64({iss:env.ACCESS_ISSUER,aud:[env.ACCESS_AUD],sub:'owner',email:env.OWNER_EMAIL,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300,...changes}),input=h+'.'+p;return input+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,enc.encode(input))).toString('base64url')}
test('managed identity rejects forged signatures, wrong issuer/audience and expired identities',async()=>{
 const keys=async()=>[jwk];assert.equal(await verifyIdentity(await signed(),env,keys),env.OWNER_EMAIL);
 for(const c of [{iss:'https://evil.cloudflareaccess.com'},{aud:['wrong']},{exp:0},{iat:Date.now()/1000+100},{email:null}])await assert.rejects(()=>signed(c).then(t=>verifyIdentity(t,env,keys)));
 const parts=(await signed()).split('.');parts[1]=b64({email:'attacker@example.com'});await assert.rejects(()=>verifyIdentity(parts.join('.'),env,keys));
 const valid=(await signed()).split('.');valid[2]=Buffer.alloc(256).toString('base64url');await assert.rejects(()=>verifyIdentity(valid.join('.'),env,keys));
});
test('managed login binds single-use handoff to originating browser, opens existing owner and keeps API private',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async u=>{assert.equal(u,env.ACCESS_ISSUER+'/cdn-cgi/access/certs');return Response.json({keys:[jwk]})};
 try{
 const state='b'.repeat(64),verifier='c'.repeat(64),challenge=await hash(verifier),base='https://studioh-v2-storage.warwick-cca.workers.dev';
 const login=async jwt=>worker.fetch(new Request(base+'/login?state='+state+'&challenge='+challenge,{headers:jwt?{'Cf-Access-Jwt-Assertion':jwt}:{}}),env);
 assert.equal((await login()).status,401);assert.equal((await login(await signed({email:'stranger@example.com'}))).status,403);
 const r=await login(await signed());assert.equal(r.status,302);const loc=new URL(r.headers.get('Location'));assert.equal(loc.origin,'https://designingla27.github.io');
 const code=loc.searchParams.get('login-code'),exchange=async(v,s=state)=>worker.fetch(new Request(base+'/auth/exchange',{method:'POST',body:JSON.stringify({code,state:s,verifier:v})}),env);
 assert.equal((await exchange('d'.repeat(64))).status,401);assert.equal((await exchange(verifier,'e'.repeat(64))).status,401);
 const result=await exchange(verifier);assert.equal(result.status,200);const {token}=await result.json();assert.equal((await exchange(verifier)).status,401);
 const saved=await(await env.PROJECTS.get('sessions/'+await hash(token))).json();assert.equal(saved.owner,'studioh');assert.equal(saved.user,'studio-admin');assert.equal(saved.role,'admin');
 assert.equal((await worker.fetch(new Request(base+'/projects'),env)).status,401);
 const expired='f'.repeat(64);await env.PROJECTS.put('login-grants/'+await hash(expired),JSON.stringify({email:env.OWNER_EMAIL,state,challenge,expires:0}));assert.equal((await worker.fetch(new Request(base+'/auth/exchange',{method:'POST',body:JSON.stringify({code:expired,state,verifier})}),env)).status,401);
 }finally{globalThis.fetch=original}
});
