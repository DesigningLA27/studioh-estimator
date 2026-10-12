// Studio-scoped assignment directory. This grants no account or project access.
export async function processPeopleRoute(req,env,s,{reply,body}){
 if(new URL(req.url).pathname!=='/process/people')return null;
 const base=`accounts/${s.owner}/`,key=base+'process/people.json',old=await env.PROJECTS.get(key),saved=old?await old.json():{people:[]};
 if(req.method==='GET'){
  const people=[...saved.people];let cursor;do{const page=await env.PROJECTS.list({prefix:base+'time/people/',cursor});for(const row of page.objects||[]){const obj=await env.PROJECTS.get(row.key);if(!obj)continue;const p=await obj.json();if(p.user)people.push({id:'staff:'+p.user,user:p.user,name:p.name||p.user,type:'staff'})}cursor=page.truncated?page.cursor:null;}while(cursor);
  if(!people.some(p=>p.user===s.user))people.push({id:'staff:'+s.user,user:s.user,name:s.name||s.user,type:'staff'});
  return reply(200,{people,revision:old?.etag||null});
 }
 if(req.method!=='POST')return reply(405,{error:'Method not allowed.'});
 if(s.role!=='admin')return reply(403,{error:'An administrator adds people to the studio directory.'});
 let d;try{d=JSON.parse(new TextDecoder().decode(await body(req,4000)))}catch{return reply(400,{error:'Invalid person record.'})}
 if(d.revision!==(old?.etag||null))return reply(409,{error:'The people directory changed. Try again.'});
 const name=String(d.name||'').trim();if(!name||name.length>120||!['staff','consultant'].includes(d.type)||saved.people.length>=300)return reply(400,{error:'Enter a name and choose staff or consultant.'});
 const person={id:'person:'+crypto.randomUUID(),name,type:d.type};
 if(old)await env.PROJECTS.put(base+'process/people-history/'+Date.now()+'-'+crypto.randomUUID()+'.json',JSON.stringify(saved));
 const out=await env.PROJECTS.put(key,JSON.stringify({people:[...saved.people,person]}),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 return out?reply(200,{person,revision:out.etag}):reply(409,{error:'The people directory changed. Try again.'});
}
