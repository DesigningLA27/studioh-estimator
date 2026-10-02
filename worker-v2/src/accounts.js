import {scryptAsync} from '@noble/hashes/scrypt.js';
const random=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
const normalize=v=>typeof v==='string'?v.trim().toLowerCase():'';
export const credentialKey=async(email,hash)=>'credentials/'+await hash(normalize(email));
export async function identity(env,email,hash,member){
 const owner=email===normalize(env.OWNER_EMAIL),shared=!owner&&await member(env,email,hash);
 const row=await env.PROJECTS.get(await credentialKey(email,hash)),record=row?await row.json():null;
 if(record?.kind==='demo')return {owner:record.owner,user:record.owner,email,role:'demo',name:record.name,credentialVersion:record.version,demo:true};
 return {owner:owner||shared?'studioh':'user-'+await hash(email),user:owner?'studio-admin':await hash(email),email,role:shared?'member':'admin',name:record?.name||'',credentialVersion:record?.version||null};
}
export async function issue(env,account,hash,reply,verifiedAt){
 const token=random(),ttl=30*86400;
 await env.PROJECTS.put('sessions/'+await hash(token),JSON.stringify({...account,...(verifiedAt?{verifiedAt}:{}),expires:Date.now()+ttl*1000}));
 return reply(200,{token},{'Set-Cookie':`studioh_v2_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${ttl}`});
}
async function derive(password,salt){return [...await scryptAsync(password,salt,{N:16384,r:8,p:5,dkLen:32,maxmem:32*1024*1024})].map(b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a,b){if(a.length!==b.length)return false;let different=0;for(let i=0;i<a.length;i++)different|=a.charCodeAt(i)^b.charCodeAt(i);return different===0}
async function throttle(req,env,email,hash){for(const [key,limit]of [['ip:'+ (req.headers.get('CF-Connecting-IP')||'unknown'),30],['email:'+email,10]]){const name='password-rate/'+await hash(key)+'/'+Math.floor(Date.now()/600000),row=await env.PROJECTS.get(name),count=row?Number(await row.text()):0;if(count>=limit)throw Object.assign(Error('Too many attempts. Please try again in 10 minutes.'),{status:429});if(!await env.PROJECTS.put(name,String(count+1),{onlyIf:row?{etagMatches:row.etag}:{etagDoesNotMatch:'*'}}))throw Object.assign(Error('Please wait a moment and try again.'),{status:429})}}
export async function accountRoute(req,env,{hash,reply,body,session,member}){
 const path=new URL(req.url).pathname;if(!['/auth/password','/auth/password/setup','/account/profile','/auth/password/change'].includes(path))return null;
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 const d=JSON.parse(new TextDecoder().decode(await body(req,10000)));
 if(path==='/auth/password'){
  const email=normalize(d.email);if(!email||email.length>254||typeof d.password!=='string'||d.password.length>256)return reply(400,{error:'Enter your email and password.'});
  await throttle(req,env,email,hash);const row=await env.PROJECTS.get(await credentialKey(email,hash)),record=row?await row.json():null;
  const proof=await derive(d.password,record?.salt||'studioh-invalid-account-salt');
  if(!record||record.disabled||(record.expires&&record.expires<Date.now())||!equal(proof,record.proof))return reply(401,{error:'The email or password is incorrect. Try again or reset your password.'});
  // Re-read identity so a password reset during verification cannot mint a current session.
  const account=await identity(env,email,hash,member);if(account.credentialVersion!==record.version)return reply(401,{error:'Please log in again.'});
  return issue(env,account,hash,reply);
 }
 const current=await session(req,env);
 if(path==='/account/profile'||path==='/auth/password/change'){
  if(!current?.email||current.demo)return reply(403,{error:'Sign in with your own account to change account details.'});
  const key=await credentialKey(current.email,hash),row=await env.PROJECTS.get(key);
  if(!row)return reply(400,{error:'Set your password through email verification first.'});
  const record=await row.json();
  if(path==='/account/profile'){
   if(typeof d.name!=='string'||!d.name.trim()||d.name.length>100)return reply(400,{error:'Enter your name (up to 100 characters).'});
   if(!await env.PROJECTS.put(key,JSON.stringify({...record,name:d.name.trim()}),{onlyIf:{etagMatches:row.etag}}))return reply(409,{error:'Your account changed. Please try again.'});
   return reply(200,{name:d.name.trim()});
  }
  await throttle(req,env,current.email,hash);
  if(typeof d.currentPassword!=='string'||d.currentPassword.length>256||!equal(await derive(d.currentPassword,record.salt),record.proof))return reply(400,{error:'Your current password is incorrect.'});
  if(typeof d.password!=='string'||d.password.length<15||d.password.length>256)return reply(400,{error:'Use a new password of 15 to 256 characters.'});
  const salt=random(),version=random();
  if(!await env.PROJECTS.put(key,JSON.stringify({...record,salt,proof:await derive(d.password,salt),version,updated:new Date().toISOString()}),{onlyIf:{etagMatches:row.etag}}))return reply(409,{error:'Your password changed elsewhere. Please sign in again.'});
  return issue(env,{...await identity(env,current.email,hash,member),credentialVersion:version},hash,reply);
 }
 const s=await session(req,env);if(!s?.email||!s.verifiedAt||Date.now()-s.verifiedAt>600000)return reply(401,{error:'Verify your email before setting your password.'});
 if(typeof d.password!=='string'||d.password.length<15||d.password.length>256)return reply(400,{error:'Use a password of 15 to 256 characters.'});
 if(typeof d.name!=='string'||!d.name.trim()||d.name.length>100)return reply(400,{error:'Enter your name (up to 100 characters).'});
 await throttle(req,env,s.email,hash);const key=await credentialKey(s.email,hash),old=await env.PROJECTS.get(key),salt=random(),version=random();
 const record={email:s.email,name:d.name.trim(),salt,proof:await derive(d.password,salt),version,algorithm:'scrypt-N16384-r8-p5',updated:new Date().toISOString()};
 if(!await env.PROJECTS.put(key,JSON.stringify(record),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}}))return reply(409,{error:'Your account changed. Please verify your email again.'});
 return issue(env,{...await identity(env,s.email,hash,member),credentialVersion:version},hash,reply);
}

export async function demoAdminRoute(req,env,{hash,reply,body,session}){
 if(new URL(req.url).pathname!=='/admin/demo-logins')return null;
 const s=await session(req,env);if(s?.owner!=='studioh'||s?.role!=='admin')return reply(403,{error:'Only the studio owner can manage demo logins.'});
 if(req.method==='GET'){const accounts=[];let cursor;do{const page=await env.PROJECTS.list({prefix:'demo-directory/',cursor});for(const item of page.objects||[]){const row=await env.PROJECTS.get(item.key);if(row){const data=await row.json();const credential=await env.PROJECTS.get(await credentialKey(data.username,hash));if(credential){const c=await credential.json();accounts.push({username:data.username,name:c.name,disabled:!!c.disabled,expires:c.expires})}}}cursor=page.truncated?page.cursor:null}while(cursor);return reply(200,{accounts})}
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 const d=JSON.parse(new TextDecoder().decode(await body(req,10000))),username=normalize(d.username);
 if(!/^demo-[a-z0-9-]{3,40}$/.test(username))return reply(400,{error:'Use a demo username such as demo-alex (letters, numbers and hyphens).'});
 const key=await credentialKey(username,hash),old=await env.PROJECTS.get(key);
 if(d.action==='revoke'){if(!old)return reply(404,{error:'Demo login not found.'});const c=await old.json();if(c.kind!=='demo')return reply(403,{error:'This is not a demo account.'});if(!await env.PROJECTS.put(key,JSON.stringify({...c,disabled:true,version:random()}),{onlyIf:{etagMatches:old.etag}}))return reply(409,{error:'The account changed. Please try again.'});return reply(200,{saved:true})}
 if(old)return reply(409,{error:'That demo username already exists. Choose another.'});
 if(typeof d.password!=='string'||d.password.length<15||d.password.length>256||typeof d.name!=='string'||!d.name.trim()||d.name.length>100)return reply(400,{error:'Enter a name and a password of at least 15 characters.'});
 const days=Number(d.days);if(!Number.isInteger(days)||days<1||days>30)return reply(400,{error:'Choose 1 to 30 days of access.'});
 const salt=random(),c={kind:'demo',owner:'demo-'+random(),name:d.name.trim(),salt,proof:await derive(d.password,salt),version:random(),expires:Date.now()+days*86400000,algorithm:'scrypt-N16384-r8-p5'};
 if(!await env.PROJECTS.put(key,JSON.stringify(c),{onlyIf:{etagDoesNotMatch:'*'}}))return reply(409,{error:'That username already exists.'});
 await env.PROJECTS.put('demo-directory/'+await hash(username),JSON.stringify({username}));return reply(200,{saved:true,username,expires:c.expires});
}
