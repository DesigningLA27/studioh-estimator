/* Runs before every application script. The frame is also sandboxed without
   allow-same-origin. Only map connections are permitted; production writes remain blocked. */
(()=>{
 const seed=/*V2_STORAGE_SEED*/{};const stores={localStorage:new Map(Object.entries(seed)),sessionStorage:new Map()};
 for(const [name,map] of Object.entries(stores)){
 const api={getItem:k=>map.has(String(k))?map.get(String(k)):null,setItem(k,v){map.set(String(k),String(v));flush()},removeItem(k){map.delete(String(k));flush()},clear(){map.clear();flush()},key:i=>[...map.keys()][i]??null,get length(){return map.size}};
 function flush(){if(name==='localStorage')parent.postMessage({v2:'storage',data:Object.fromEntries(map)},'*')}
 Object.defineProperty(window,name,{value:api,configurable:false});
 }
 window.__V2_PREVIEW__=true;
 const blocked=()=>Promise.reject(new Error('Online services are disabled in the isolated V2 preview.'));
 const nativeFetch=window.fetch.bind(window);
 window.fetch=(input,options)=>{let u;try{u=new URL(typeof input==='string'?input:input.url,location.href)}catch{return blocked()}
 // Only Google map service requests are enabled here. Project writes remain blocked.
 if(u.protocol==='https:'&&['maps.googleapis.com','maps.gstatic.com','khms0.googleapis.com','khms1.googleapis.com'].includes(u.hostname))return nativeFetch(input,options);
 return blocked();};
 try{navigator.sendBeacon=()=>false}catch{}
 try{Object.defineProperty(navigator,'serviceWorker',{value:{register:blocked,addEventListener(){},controller:null},configurable:false})}catch{}
})();
