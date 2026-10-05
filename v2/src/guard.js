/* Runs before every application script. The frame is also sandboxed without
   allow-same-origin. Direct map connections are permitted. Private project saves go through the authenticated parent service. */
(()=>{
 const seed=/*V2_STORAGE_SEED*/{};const stores={localStorage:new Map(Object.entries(seed)),sessionStorage:new Map()};
 for(const [name,map] of Object.entries(stores)){
 const api={getItem:k=>map.has(String(k))?map.get(String(k)):null,setItem(k,v){k=String(k);v=String(v);if(map.get(k)===v)return;map.set(k,v);flush()},removeItem(k){if(map.delete(String(k)))flush()},clear(){map.clear();flush()},key:i=>[...map.keys()][i]??null,get length(){return map.size}};
 let timer;function flush(){if(name==='localStorage'){clearTimeout(timer);timer=setTimeout(()=>parent.postMessage({v2:'storage',data:Object.fromEntries(map)},'*'),100)}}
 Object.defineProperty(window,name,{value:api,configurable:false});
 }
 window.__V2_PREVIEW__=true;
 const blocked=()=>Promise.reject(new Error('This service is not connected in V2.'));
 const requests=new Map();
 window.addEventListener('message',e=>{if(e.source!==parent||!e.data?.v2library)return;const q=requests.get(e.data.v2library);if(!q)return;requests.delete(e.data.v2library);clearTimeout(q.timer);e.data.error?q.reject(Error(e.data.error)):q.resolve(new Response(JSON.stringify(e.data.data),{headers:{'Content-Type':'application/json'}}))});
 function retainEdits(data,payload){
 if(payload.type==='loadconfig'&&data.config?.data){for(const k of Object.keys(data.config.data)){const own=localStorage.getItem(k);if(own!==null){if(k==='studioh_pricebook_v5'){try{const local=JSON.parse(own),server=JSON.parse(data.config.data[k]);if(Array.isArray(local)&&Array.isArray(server)){const merged=structuredClone(local);for(const section of server){const found=merged.find(x=>x.id===section.id);if(!found)merged.push(section);else {const ids=new Set((found.items||[]).map(x=>x.id||x.n));found.items=[...(found.items||[]),...(section.items||[]).filter(x=>!ids.has(x.id||x.n))]}}data.config.data[k]=JSON.stringify(merged);continue}}catch{}}data.config.data[k]=own}}}
 let edits={};try{edits=JSON.parse(localStorage.getItem('v2_private_catalog_edits')||'{}')}catch{}
 const overlay=(rows,kind)=>{const delta=edits[kind]||{},seen=new Set();const out=(rows||[]).filter(p=>delta[p.id]!==null).map(p=>{seen.add(p.id);return {...p,...delta[p.id]}});for(const[id,p]of Object.entries(delta))if(p&&!seen.has(id))out.push(p);return out};
 if(payload.type==='loadbook'&&data.book)for(const kind of ['tree','shrub','gc','palm'])data.book[kind]=overlay(data.book[kind],kind);
 if(payload.type==='loadgoods'&&Array.isArray(data.data))data.data=overlay(data.data,payload.book);
 return data;
 }
 function catalog(payload){return new Promise((resolve,reject)=>{const id=crypto.randomUUID(),timer=setTimeout(()=>{requests.delete(id);reject(Error('Library request timed out'))},45000);requests.set(id,{resolve:async response=>{try{const data=retainEdits(await response.json(),payload);resolve(new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}))}catch(e){reject(e)}},reject,timer});parent.postMessage({v2:'library-read',id,payload},'*')})}
 const nativeFetch=window.fetch.bind(window);
 window.fetch=(input,options)=>{let u;try{u=new URL(typeof input==='string'?input:input.url,location.href)}catch{return blocked()}
 // Public, read-only parcel queries used by the existing property-boundary map.
 // Exact paths only; do not send studio cookies or enable arbitrary county requests.
 const parcelQueries=['https://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Parcel/MapServer/0/query', 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/LA_County_Parcels/FeatureServer/0/query', 'https://www.ocgis.com/arcpub/rest/services/Map_Layers/Parcels/MapServer/0/query', 'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/CA_Statewide_Parcels/FeatureServer/0/query', 'https://services.arcgis.com/ue9rwulIoeLEI9bj/arcgis/rest/services/CA_Parcels/FeatureServer/0/query'];
 if(parcelQueries.includes(u.origin+u.pathname)&&(options?.method||input?.method||'GET').toUpperCase()==='GET')return nativeFetch(u.href,{method:'GET',mode:'cors',credentials:'omit',redirect:'error',signal:options?.signal});
 // The parent continues to own authenticated project storage.
 if(u.protocol==='https:'&&['maps.googleapis.com','maps.gstatic.com','khms0.googleapis.com','khms1.googleapis.com'].includes(u.hostname))return nativeFetch(input,options);
 if(u.protocol==='https:'&&['studioh-ai.warwick-cca.workers.dev','studioh-goods.warwick-cca.workers.dev'].includes(u.hostname)&&options?.method==='POST'){
 try{const d=JSON.parse(options.body);if(['loadbook','loadconfig','loadgoods'].includes(d.type))return catalog(d)}catch{}
 }
 return blocked();};
 try{navigator.sendBeacon=()=>false}catch{}
 try{Object.defineProperty(navigator,'serviceWorker',{value:{register:blocked,addEventListener(){},controller:null},configurable:false})}catch{}
})();
