/* Runs before every application script. The frame is also sandboxed without
   allow-same-origin and has connect-src 'none': production APIs are unreachable. */
(()=>{
 const seed=/*V2_STORAGE_SEED*/{};const stores={localStorage:new Map(Object.entries(seed)),sessionStorage:new Map()};
 for(const [name,map] of Object.entries(stores)){
 const api={getItem:k=>map.has(String(k))?map.get(String(k)):null,setItem(k,v){map.set(String(k),String(v));flush()},removeItem(k){map.delete(String(k));flush()},clear(){map.clear();flush()},key:i=>[...map.keys()][i]??null,get length(){return map.size}};
 function flush(){if(name==='localStorage')parent.postMessage({v2:'storage',data:Object.fromEntries(map)},'*')}
 Object.defineProperty(window,name,{value:api,configurable:false});
 }
 window.__V2_PREVIEW__=true;
 const blocked=()=>Promise.reject(new Error('Online services are disabled in the isolated V2 preview.'));
 window.fetch=blocked;
 try{navigator.sendBeacon=()=>false}catch{}
 try{Object.defineProperty(navigator,'serviceWorker',{value:{register:blocked,addEventListener(){},controller:null},configurable:false})}catch{}
})();
