// Cloudflare verifies email delivery. Validate its signed identity again at the origin.
const encoder = new TextEncoder();
const random = () => [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
const hex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const keysCache = new Map();
export const managedReady = env => /^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER || '') && hex(env.ACCESS_AUD);
const decode = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
async function signingKeys(issuer) {
 const cached=keysCache.get(issuer);if(cached && cached.until>Date.now())return cached.keys;
 const r=await fetch(issuer+'/cdn-cgi/access/certs',{signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('Identity service unavailable');
 const {keys}=await r.json();if(!Array.isArray(keys))throw Error('Invalid signing keys');
 keysCache.set(issuer,{keys,until:Date.now()+300000});return keys;
}
export async function verifyIdentity(token,env,getKeys=signingKeys) {
 if(!managedReady(env)||typeof token!=='string'||token.length>20000)throw Error('Invalid identity');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid identity');
 const h=JSON.parse(new TextDecoder().decode(decode(parts[0]))),p=JSON.parse(new TextDecoder().decode(decode(parts[1]))),now=Date.now()/1000;
 if(h.alg!=='RS256'||!h.kid||p.iss!==env.ACCESS_ISSUER||!Array.isArray(p.aud)||!p.aud.includes(env.ACCESS_AUD)||!Number.isFinite(p.exp)||p.exp<=now||!Number.isFinite(p.iat)||p.iat>now+30||(p.nbf!==undefined&&(!Number.isFinite(p.nbf)||p.nbf>now+30))||typeof p.email!=='string'||!p.sub)throw Error('Invalid identity');
 const keys=await getKeys(env.ACCESS_ISSUER),jwk=keys.find(k=>k.kid===h.kid&&k.kty==='RSA');if(!jwk)throw Error('Unknown signing key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),encoder.encode(parts[0]+'.'+parts[1])))throw Error('Invalid signature');
 return p.email.trim().toLowerCase();
}
export async function managedLogin(req,env,{hash,reply,body,headers,member}) {
 const url=new URL(req.url),path=url.pathname;
 if(path!=='/login'&&path!=='/auth/exchange')return null;
 if(!managedReady(env))return reply(503,{error:'Email login is not configured yet.'});
 if(path==='/login'&&req.method==='GET') {
  const state=url.searchParams.get('state'),challenge=url.searchParams.get('challenge');
  if(!hex(state)||!hex(challenge))return new Response(null,{status:302,headers:{...headers(),Location:'https://designingla27.github.io/studioh-estimator/v2/?release=V2.057&signin=1'}});
  let email;try{email=await verifyIdentity(req.headers.get('Cf-Access-Jwt-Assertion'),env)}catch{return reply(401,{error:'Your email could not be verified. Please sign in again.'})}
  if(!await member(env,email,hash))return reply(403,{error:'This email has not been invited to a Studio H project.'});
  const code=random();await env.PROJECTS.put('login-grants/'+await hash(code),JSON.stringify({email,state,challenge,expires:Date.now()+120000,used:false}));
  return new Response(null,{status:302,headers:{...headers(),Location:'https://designingla27.github.io/studioh-estimator/v2/?release=V2.057&login-code='+code+'&state='+state}});
 }
 if(path==='/auth/exchange'&&req.method==='POST') {
  const d=JSON.parse(new TextDecoder().decode(await body(req,10000)));
  if(!hex(d.code)||!hex(d.verifier)||!hex(d.state))return reply(400,{error:'Please start sign-in again.'});
  const name='login-grants/'+await hash(d.code),row=await env.PROJECTS.get(name),grant=row?await row.json():null;
  if(!grant||grant.used||grant.expires<=Date.now()||grant.state!==d.state||grant.challenge!==await hash(d.verifier))return reply(401,{error:'Sign-in expired. Please sign in again.'});
  if(!await member(env,grant.email,hash))return reply(403,{error:'Your project access has changed.'});
  const consumed=await env.PROJECTS.put(name,JSON.stringify({...grant,used:true}),{onlyIf:{etagMatches:row.etag}});if(!consumed)return reply(401,{error:'Sign-in has already been used.'});
  const token=random(),admin=grant.email===env.OWNER_EMAIL?.trim().toLowerCase(),ttl=30*86400;
  await env.PROJECTS.put('sessions/'+await hash(token),JSON.stringify({owner:'studioh',user:admin?'studio-admin':await hash(grant.email),email:grant.email,role:admin?'admin':'member',expires:Date.now()+ttl*1000}));
  return reply(200,{token},{'Set-Cookie':`studioh_v2_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${ttl}`});
 }
 return reply(405,{error:'Method not allowed'});
}
