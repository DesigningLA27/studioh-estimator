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
 const nativeFetch=window.fetch.bind(window);
 window.fetch=(input,options)=>{let u;try{u=new URL(typeof input==='string'?input:input.url,location.href)}catch{return blocked()}
 // Direct requests are limited to Maps. The parent owns authenticated project storage.
 if(u.protocol==='https:'&&['maps.googleapis.com','maps.gstatic.com','khms0.googleapis.com','khms1.googleapis.com'].includes(u.hostname))return nativeFetch(input,options);
 return blocked();};
 try{navigator.sendBeacon=()=>false}catch{}
 try{Object.defineProperty(navigator,'serviceWorker',{value:{register:blocked,addEventListener(){},controller:null},configurable:false})}catch{}
})();
