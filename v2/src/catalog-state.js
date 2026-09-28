/* Preserve private edits made through original library tools without copying an
   unchanged shared master into each project. Publishing a shared master is separate. */
(()=>{
const key='v2_private_catalog_edits';let edits={};try{edits=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const baseline=new Map();
const lists=()=>({tree:PLANT_DB.tree,shrub:PLANT_DB.shrub,gc:PLANT_DB.gc,palm:PLANT_DB.palm,materials:MATERIALS,furnishings:FURNISHINGS});
const signature=p=>JSON.stringify(p,(k,v)=>['specQty','specSF','_calcQty'].includes(k)?undefined:v);
function remember(kind,rows){baseline.set(kind,new Map((rows||[]).map(p=>[p.id,signature(p)])))}
function overlay(kind,rows){const delta=edits[kind]||{};const ids=new Set(rows.map(p=>p.id));for(let i=rows.length-1;i>=0;i--){const change=delta[rows[i].id];if(change===null)rows.splice(i,1);else if(change)Object.assign(rows[i],change)}for(const [id,value]of Object.entries(delta))if(value&&!ids.has(id))rows.push(structuredClone(value))}
for(const [kind,rows]of Object.entries(lists())){remember(kind,rows);overlay(kind,rows)}
function capture(kinds){const all=lists();for(const kind of kinds){const rows=all[kind]||[],original=baseline.get(kind)||new Map(),delta={},ids=new Set();for(const p of rows){ids.add(p.id);if(original.get(p.id)!==signature(p))delta[p.id]=p}for(const id of original.keys())if(!ids.has(id))delta[id]=null;edits[kind]=delta}localStorage.setItem(key,JSON.stringify(edits));try{_bidSchedule()}catch{}}
for(const [name,kinds]of [['plantBookSave',['tree','shrub','gc','palm']],['matSave',['materials']],['furSave',['furnishings']]]){const original=window[name];if(typeof original==='function')window[name]=function(...args){capture(kinds);return original.apply(this,args)}}
const apply=v2ApplyCatalog;v2ApplyCatalog=function(m){apply(m);const kinds=m.id==='plantbook'?['tree','shrub','gc','palm']:[m.id];const all=lists();for(const kind of kinds)if(all[kind]){remember(kind,all[kind]);overlay(kind,all[kind])}};
})();
