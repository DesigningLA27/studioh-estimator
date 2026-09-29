import {managedReady} from './managed-login.js';
// Email verification and project access. Never grant access from an unverified address.
const TTL=30*86400;
const normalize=value=>typeof value==='string'?value.trim().toLowerCase():'';
const valid=email=>email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export function emailReady(env){return !!(env.OWNER_EMAIL&&env.AUTH_FROM&&(env.RESEND_API_KEY||env.MAILER))}
async function send(env,to,subject,text,id){
 const payload={from:env.AUTH_FROM,to:[to],subject,text};
 const response=env.MAILER?await env.MAILER.fetch('https://mail.internal/send',{method:'POST',body:JSON.stringify(payload)}):await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Object.assign(Error('Email could not be sent. Please try again shortly.'),{status:503});
}
async function rate(env,key,limit,windowMs,hash){const name='auth-rate/'+await hash(key)+'/'+Math.floor(Date.now()/windowMs),old=await env.PROJECTS.get(name),n=old?Number(await old.text()):0;if(n>=limit)throw Object.assign(Error('Please wait before trying again.'),{status:429});const saved=await env.PROJECTS.put(name,String(n+1),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});if(!saved)throw Object.assign(Error('Please wait a moment and try again.'),{status:429})}
export async function member(env,email,hash){if(email===normalize(env.OWNER_EMAIL))return true;let cursor;do{const page=await env.PROJECTS.list({prefix:'access/'+await hash(email)+'/',cursor});for(const o of page.objects||[]){const row=await env.PROJECTS.get(o.key);if((await row?.json())?.active)return true}cursor=page.truncated?page.cursor:null}while(cursor);return false}
export async function permission(env,s,id,hash){if(s.role==='admin')return 'owner';if(!s.email)return null;const row=await env.PROJECTS.get('access/'+await hash(s.email)+'/'+id+'.json'),d=row?await row.json():null;return d?.active?d.role:null}
export async function emailRoute(req,env,{hash,reply,body,session}){
 const path=new URL(req.url).pathname;
 if(path==='/auth/config'&&req.method==='GET')return reply(200,{emailEnabled:emailReady(env),managedLogin:managedReady(env)});
 if(path==='/auth/request'&&req.method==='POST'){
  if(!emailReady(env))return reply(503,{error:'Email sign-in is being set up. You can explore the public demo now.'});
  const d=JSON.parse(new TextDecoder().decode(await body(req,10000))),email=normalize(d.email);if(!valid(email))return reply(400,{error:'Enter a valid email address.'});
  await rate(env,'request-ip:'+(req.headers.get('CF-Connecting-IP')||'unknown'),20,3600000,hash);await rate(env,'request-email:'+email,5,3600000,hash);
  const challenge=random();
  if(await member(env,email,hash)){const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');await env.PROJECTS.put('codes/'+challenge,JSON.stringify({email,proof:await hash(challenge+':'+code),expires:Date.now()+600000,attempts:0,used:false}));try{await send(env,email,'Your Studio H sign-in code',`Your Studio H verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,challenge)}catch(e){await env.PROJECTS.delete('codes/'+challenge);throw e}}
  return reply(200,{challenge,message:'If this email has access, a verification code is on its way.'});
 }
 if(path==='/auth/verify'&&req.method==='POST'){
  const d=JSON.parse(new TextDecoder().decode(await body(req,10000)));if(!/^[a-f0-9]{64}$/.test(d.challenge||'')||!/^\d{6}$/.test(d.code||''))return reply(400,{error:'Enter the six-digit code from your email.'});
  await rate(env,'verify-ip:'+(req.headers.get('CF-Connecting-IP')||'unknown'),30,60000,hash);
  const key='codes/'+d.challenge,row=await env.PROJECTS.get(key),record=row?await row.json():null;if(!record||record.used||record.expires<Date.now()||record.attempts>=5)return reply(401,{error:'This code is invalid or expired. Request a new code.'});
  const correct=await hash(d.challenge+':'+d.code)===record.proof;record.attempts++;record.used=correct;const consumed=await env.PROJECTS.put(key,JSON.stringify(record),{onlyIf:{etagMatches:row.etag}});if(!consumed||!correct)return reply(401,{error:'This code is invalid or already used.'});
  if(!await member(env,record.email,hash))return reply(403,{error:'This email no longer has project access.'});
  const admin=record.email===normalize(env.OWNER_EMAIL),token=random();await env.PROJECTS.put('sessions/'+await hash(token),JSON.stringify({owner:'studioh',user:admin?'studio-admin':await hash(record.email),email:record.email,role:admin?'admin':'member',expires:Date.now()+TTL*1000}));
  return reply(200,{token},{'Set-Cookie':`studioh_v2_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TTL}`});
 }
 const m=path.match(/^\/projects\/([a-zA-Z0-9_-]{1,100})\/sharing$/);if(!m)return null;
 const s=await session(req,env);if(!s||s.role!=='admin')return reply(403,{error:'Only the workspace owner can manage invitations.'});
 if(!await env.PROJECTS.head('accounts/'+s.owner+'/projects/'+m[1]+'/state.json'))return reply(404,{error:'Project not found'});
 if(req.method==='GET'){let cursor;const invitations=[];do{const page=await env.PROJECTS.list({prefix:'access/',cursor});for(const o of page.objects||[]){if(!o.key.endsWith('/'+m[1]+'.json'))continue;const row=await env.PROJECTS.get(o.key),d=await row.json();if(d.active)invitations.push({email:d.email,role:d.role})}cursor=page.truncated?page.cursor:null}while(cursor);return reply(200,{invitations})}
 if(req.method==='POST'){
  const d=JSON.parse(new TextDecoder().decode(await body(req,10000))),email=normalize(d.email);if(!valid(email)||!['viewer','editor','revoke'].includes(d.role))return reply(400,{error:'Choose an email address and access level.'});if(email===normalize(env.OWNER_EMAIL))return reply(400,{error:'The workspace owner already has access.'});
  if(d.role!=='revoke'&&!emailReady(env))return reply(503,{error:'Email delivery must be connected before sending invitations.'});
  const key='access/'+await hash(email)+'/'+m[1]+'.json',old=await env.PROJECTS.get(key),previous=old?await old.text():null;
  await env.PROJECTS.put(key,JSON.stringify({email,projectId:m[1],role:d.role,active:d.role!=='revoke',updated:new Date().toISOString()}));
  if(d.role!=='revoke')try{await send(env,email,'You are invited to Studio H',`You have been invited to ${d.role==='editor'?'edit':'view'} a Studio H project. Open https://designingla27.github.io/studioh-estimator/v2/ and sign in with this email address.`,crypto.randomUUID())}catch(e){if(previous)await env.PROJECTS.put(key,previous);else await env.PROJECTS.delete(key);throw e}
  return reply(200,{saved:true});
 }
 return reply(405,{error:'Method not allowed'});
}
