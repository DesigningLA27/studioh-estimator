// Fixed read-only catalog operations. Never forward a caller's URL, key or write payload.
const books=new Set(['materials','furnishings','hoa','elements','swatches','palettepresets','colorpalettes','mfgcolors']);
export async function libraryRead(req,env,{session,reply}){
 if(new URL(req.url).pathname!=='/libraries/read')return null;
 const s=await session(req,env);if(s?.owner!=='studioh'||s.role!=='admin')return reply(403,{error:'These studio libraries require owner access.'});
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 if(Number(req.headers.get('Content-Length'))>1000)return reply(413,{error:'Request too large'});
 const raw=await req.text();if(raw.length>1000)return reply(413,{error:'Request too large'});const d=JSON.parse(raw);let binding,payload,host;
 if(['loadbook','loadconfig'].includes(d.type)){binding=env.LEGACY;payload={type:d.type};host='studioh-ai'}else if(d.type==='loadgoods'&&books.has(d.book)){binding=env.GOODS;payload={type:'loadgoods',book:d.book};host='studioh-goods'}else return reply(400,{error:'Unsupported library read'});
 const r=await binding.fetch('https://'+host+'.warwick-cca.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)return reply(502,{error:'The saved library could not be reached. Please retry.'});const data=await r.json();return reply(200,data);
}
