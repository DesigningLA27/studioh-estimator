const SAMPLES=[['bid_mtwdtffcwmjk','DEMO — San Marino Estate'],['bid_mud4b9im3h3z','Sample — San Marino']];
const CONFIG_KEYS=['studioh_prefs_v1','studioh_pricebook_v5','studioh_assemblies_v1','studioh_settings_v1','studioh_reprice_v1','studioh_lightprice_v2','studioh_tree_reprice_v1','studioh_water_v1'];
export async function importSamples(req,env,{session,reply,hash}){
 if(new URL(req.url).pathname!=='/legacy/import-samples')return null;
 const s=await session(req,env);if(s?.owner!=='studioh'||s.role!=='admin')return reply(403,{error:'Only the studio owner can import the original samples.'});
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 const result=[];let config;
 async function read(body){const r=await env.LEGACY.fetch('https://studioh-ai.warwick-cca.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Original sample service unavailable');return r.json()}
 for(const [sourceId,fallback]of SAMPLES){const id='v1-'+sourceId,key='accounts/studioh/projects/'+id+'/state.json';if(await env.PROJECTS.head(key)){result.push({id,existing:true});continue}
  const d=await read({type:'loadbid',id:sourceId});if(!d.found||!d.bid?.S)throw Error('Original sample missing');
  if(config===undefined){const c=await read({type:'loadconfig'});if(!c.config?.data)throw Error('Original calculation settings missing');config=c.config.data}
  const engine={};for(const k of CONFIG_KEYS){if(typeof config[k]!=='string')continue;try{engine[k]={json:JSON.parse(config[k])}}catch{engine[k]={text:config[k]}}}
  const name=d.bid.S.pi?.project||fallback,state={schema:1,projectId:id,name,bid:d.bid,engine,workspace:{},updated:new Date().toISOString(),importedFrom:{version:1,id:sourceId,checksum:await hash(JSON.stringify(d.bid))}};
  const saved=await env.PROJECTS.put(key,JSON.stringify(state),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{name}});result.push({id,existing:!saved});
 }
 return reply(200,{projects:result});
}
