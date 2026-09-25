const ORIGIN='http://127.0.0.1:51844';
const TTL=14*86400;
const enc=new TextEncoder();
export async function hash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?enc.encode(value):value))].map(b=>b.toString(16).padStart(2,'0')).join('')}
function headers(){return {'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,If-Match,If-None-Match','Access-Control-Expose-Headers':'ETag, X-StudioH-Revision','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}}
const reply=(s,d,h={})=>new Response(JSON.stringify(d),{status:s,headers:{...headers(),'Content-Type':'application/json',...h}});
async function body(req,max=2e6){if(Number(req.headers.get('Content-Length'))>max)throw Object.assign(Error('Request too large'),{status:413});const b=await req.arrayBuffer();if(b.byteLength>max)throw Object.assign(Error('Request too large'),{status:413});return b}
function fail(status,message){throw Object.assign(Error(message),{status})}
function cookie(req){return (req.headers.get('Cookie')||'').match(/(?:^|;\s*)studioh_v2_session=([a-f0-9]{64})(?:;|$)/)?.[1]||''}
async function session(req,env,allowCookie=false){const token=(req.headers.get('Authorization')||'').replace(/^Bearer /,'')||(allowCookie?cookie(req):'');if(!/^[a-f0-9]{64}$/.test(token))return null;const record=await env.PROJECTS.get('sessions/'+await hash(token));if(!record)return null;const s=await record.json();return s.expires>Date.now()?{...s,token}:null}
function authPage(state,token=''){const safe=JSON.stringify({state,token}).replaceAll('<','\\u003c');return new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Studio H</title><style>body{font:16px system-ui;background:#faf9f6;color:#263026;margin:0;padding:32px}main{max-width:390px;margin:7vh auto}input,button{box-sizing:border-box;width:100%;padding:14px;border:1px solid #ccd5c5;border-radius:12px;margin:12px 0;font:inherit}button{background:#50793e;color:white}small{color:#65705e}</style><main><h1>Studio H</h1><h2>Connect your studio</h2><p>Your projects and files save privately to Cloudflare.</p><form><label>Studio H publishing key<input type="password" required autocomplete="current-password" name="key"></label><button>Sign in</button></form><p id="status" role="status"></p><small>Use your existing Studio H admin publishing key. A secure sign-in cookie remembers this browser. Project data stays on the server.</small></main><script>const cfg=${safe};function done(token){if(window.opener){opener.postMessage({studiohCloudSession:token,state:cfg.state},${JSON.stringify(ORIGIN)});window.close()}else document.getElementById('status').textContent='Signed in. Return to Studio H and choose Connect.'}if(cfg.token)done(cfg.token);document.querySelector('form').onsubmit=async e=>{e.preventDefault();const key=new FormData(e.target).get('key');document.getElementById('status').textContent='Connecting…';try{const r=await fetch('/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});const d=await r.json();if(!r.ok)throw Error(d.error);e.target.reset();done(d.token)}catch(e){document.getElementById('status').textContent=e.message}};</script>`,{headers:{...headers(),'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'"}})}
export default {async fetch(req,env){try{
 const url=new URL(req.url),path=url.pathname,origin=req.headers.get('Origin');if(origin&&origin!==ORIGIN&&origin!==url.origin)return reply(403,{error:'Origin denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers()});
 if(path==='/authorize'&&req.method==='GET'){const s=await session(req,env,true);return authPage((url.searchParams.get('state')||'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,100),s?.token)}
 if(path==='/session'&&req.method==='POST'){
  if(!env.LEGACY)return reply(503,{error:'Individual account sign-in is not connected in this isolated test yet.'});
  const ip=await hash(req.headers.get('CF-Connecting-IP')||'unknown'),minute=Math.floor(Date.now()/60000),rk=`rate/${ip}/${minute}`;
  const prior=await env.PROJECTS.get(rk),count=prior?Number(await prior.text()):0;if(count>=8)return reply(429,{error:'Too many attempts. Please wait a minute.'});
  const reserved=await env.PROJECTS.put(rk,String(count+1),{onlyIf:prior?{etagMatches:prior.etag}:{etagDoesNotMatch:'*'}});if(!reserved)return reply(429,{error:'Please wait a moment and try again.'});
  const d=JSON.parse(new TextDecoder().decode(await body(req,10000)));if(typeof d.key!=='string'||!d.key)return reply(401,{error:'Enter your Studio H publishing key.'});
  const verify=await env.LEGACY.fetch('https://studioh-ai.warwick-cca.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'savepdf',key:d.key})});
  // ADMIN_KEY is checked before the required PDF id. No id or PDF is supplied, so this cannot write. Fail closed if the V1 contract changes.
  const verified=await verify.json();if(verify.status!==400||verified.error!=='No id')return reply(401,{error:'That publishing key was not accepted.'});
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');await env.PROJECTS.put('sessions/'+await hash(token),JSON.stringify({owner:'studioh',user:'studio-admin',role:'admin',expires:Date.now()+TTL*1000}));
  return reply(200,{token},{'Set-Cookie':`studioh_v2_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TTL}`});
 }
 const s=await session(req,env);if(!s)return reply(401,{error:'Sign in to save and open private projects.'});const base=`accounts/${s.owner}/`;
 if(path==='/session'&&req.method==='GET')return reply(200,{user:s.user,role:s.role});
 if(path==='/logout'&&req.method==='POST'){await env.PROJECTS.delete('sessions/'+await hash(s.token));return reply(200,{ok:true},{'Set-Cookie':'studioh_v2_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'})}
 if(path==='/projects'&&req.method==='GET'){let cursor;const projects=[];do{const page=await env.PROJECTS.list({prefix:base+'projects/',delimiter:'/',cursor});for(const p of page.delimitedPrefixes||[]){const o=await env.PROJECTS.head(p+'state.json');if(o)projects.push({id:p.split('/').at(-2),name:o.customMetadata?.name||'Project',updated:o.uploaded})}cursor=page.truncated?page.cursor:null}while(cursor);return reply(200,{projects})}
 const asset=path.match(/^\/projects\/([a-zA-Z0-9_-]{1,100})\/assets\/([a-f0-9]{64})$/);
 if(asset){const key=base+`projects/${asset[1]}/assets/${asset[2]}`;
  if(req.method==='PUT'){const bytes=await body(req,50*1024*1024);if(await hash(bytes)!==asset[2])return reply(400,{error:'Upload checksum mismatch'});const type=(req.headers.get('Content-Type')||'application/octet-stream').split(';')[0];await env.PROJECTS.put(key,bytes,{httpMetadata:{contentType:type}});return reply(200,{saved:true})}
  if(req.method==='GET'){const o=await env.PROJECTS.get(key);return o?new Response(o.body,{headers:{...headers(),'Content-Type':o.httpMetadata?.contentType||'application/octet-stream','Content-Disposition':'attachment'}}):reply(404,{error:'File not found'})}
 }
 const project=path.match(/^\/projects\/([a-zA-Z0-9_-]{1,100})$/),prefs=path==='/preferences';
 if(project||prefs){const key=prefs?base+`users/${s.user}/preferences.json`:base+`projects/${project[1]}/state.json`;
  if(req.method==='GET'){const o=await env.PROJECTS.get(key);return o?new Response(o.body,{headers:{...headers(),'Content-Type':'application/json',ETag:o.httpEtag,'X-StudioH-Revision':o.httpEtag}}):reply(404,{error:'Not found'})}
  if(req.method==='PUT'){
   const match=req.headers.get('If-Match'),create=req.headers.get('If-None-Match')==='*';if(!match&&!create)return reply(428,{error:'A saved revision is required'});
   const text=new TextDecoder().decode(await body(req,24*1024*1024));let d;try{d=JSON.parse(text)}catch{return reply(400,{error:'Invalid project data'})}
   if(!d||Array.isArray(d)||typeof d!=='object'||(!prefs&&(!d.bid?.S||!d.name)))return reply(400,{error:'Invalid project data'});
   if(!prefs&&(d.projectId!==project[1]||d.schema!==1))return reply(400,{error:'Project identity mismatch'});
   if(text.includes('data:image/')||text.includes('data:application/pdf;base64,'))return reply(400,{error:'Upload media separately before saving'});
   const prior=await env.PROJECTS.get(key),expected=match?.replace(/^"|"$/g,'');if((create&&prior)||(!create&&prior?.etag!==expected))return reply(409,{error:'Another device saved changes. Reopen the server version or save your edits as a new project.'});if(prior){await env.PROJECTS.put(base+`history/${prefs?'preferences':project[1]}/${Date.now()}-${crypto.randomUUID()}.json`,prior.body,{httpMetadata:{contentType:'application/json'}})}
   let result;try{result=await env.PROJECTS.put(key,text,{onlyIf:create?{etagDoesNotMatch:'*'}:{etagMatches:expected},httpMetadata:{contentType:'application/json'},customMetadata:{name:String(d.name||'Preferences').slice(0,200)}})}catch(error){const latest=await env.PROJECTS.head(key);if((create&&latest)||(!create&&latest?.etag!==expected))return reply(409,{error:'Another device saved changes. Save your edits as a new project.'});throw error}
   if(!result)return reply(409,{error:'Another device saved changes. Reopen the server version or save your edits as a new project.'});
   return reply(200,{saved:true,updated:new Date().toISOString()},{ETag:result.httpEtag,'X-StudioH-Revision':result.httpEtag});
  }
 }
 return reply(404,{error:'Not found'});
}catch(e){return reply(e.status||500,{error:e.status?e.message:'Server could not complete the request. Your previous saved data is unchanged.'})}}};
