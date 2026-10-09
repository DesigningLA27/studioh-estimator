/* Extend the existing engine request bridge with validated settings groups. */
(()=>{
const original=v2PlantRequest;
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function read(){return {...original({action:'studio-settings'}),margin:GSET.margin,marketAdj:GSET.marketAdj,spacingPct:spacingPct(),phases:PHASES_ALL.map(p=>({id:p.id,name:p.nm,on:!(PREFS.phasesOff||{dd:1,co:1})[p.id],lo:CONF_DEFAULT.scope[p.id]?_confDisplayVal('default','scopeLo',p.id):0,hi:CONF_DEFAULT.scope[p.id]?_confDisplayVal('default','scopeHi',p.id):0})),render:{...SHVIZ_CFG},lights:Object.entries(SHVIZ_LIGHT_PRESET).map(([id,p])=>({id,name:p.nm})),railUpkeep:PREFS.railUpkeep!==false,railRenameMode:!!PREFS.railRenameMode};}
v2PlantRequest=function(m){
 if(m.action==='settings-workspace-read')return read();
 if(m.action!=='settings-workspace-save')return original(m);
 const d=m.values||{},g=m.group;
 if(g==='studio'){
  for(const k of ['company','contact','addr','phone','email','web','license'])if(typeof d[k]!=='string'||d[k].length>500)throw Error('Check studio details.');
  if(d.logo!==undefined&&d.logo!==''&&(!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(d.logo)||d.logo.length>560000))throw Error('Use a PNG or JPEG logo under 400 KB.');
  for(const k of ['company','contact','addr','phone','email','web','license','logo'])if(d[k]!==undefined)PREFS.profile[k]=d[k];prefsSave();_applyProfileText();
 }else if(g==='defaults'){
  if(!Number.isInteger(d.ql)||!QL[d.ql]||!finite(d.markup,0,100)||!finite(d.margin,0,200)||!finite(d.marketAdj,-50,200)||!finite(d.spacingPct,40,100)||!['commission','resale','fee'].includes(d.goodsModel)||typeof d.location!=='string'||d.location.length>500)throw Error('Check pricing values.');
  if(!Array.isArray(d.phases)||d.phases.length!==PHASES_ALL.length||new Set(d.phases.map(p=>p.id)).size!==PHASES_ALL.length||!d.phases.some(p=>p.on)||d.phases.some(p=>!PHASES_ALL.some(x=>x.id===p.id)||typeof p.on!=='boolean'||!finite(p.lo,0,100)||!finite(p.hi,0,100)))throw Error('Keep at least one phase and valid confidence ranges.');
  Object.assign(PREFS.defaults,{ql:d.ql,markup:d.markup,goodsModel:d.goodsModel,location:d.location,spacingPct:d.spacingPct});
  PREFS.phasesOff={};PREFS.defaults.confidence||={};PREFS.defaults.confidence.scope||={};
  d.phases.forEach(p=>{if(!p.on)PREFS.phasesOff[p.id]=1;PREFS.defaults.confidence.scope[p.id]={lo:p.lo,hi:p.hi}});
  Object.assign(GSET,{margin:d.margin,marketAdj:d.marketAdj});gsetSave();prefsSave();rebuildPhases();applyPriceBook();renderPhaseBar();
 }else if(g==='tools'){
  for(const k of ['traceHints','infoIcons','showHydroseed','showEarnings'])if(typeof d[k]!=='boolean')throw Error('Invalid tool setting.');
  for(const k of ['traceHints','infoIcons','showHydroseed','showEarnings'])PREFS[k]=d[k];prefsSave();
 }else if(g==='libraries'){
  const x=d.render;if(!x||typeof x.bgWord!=='string'||x.bgWord.length>200||!/^#[0-9a-f]{6}$/i.test(x.bgHex)||!finite(x.padPct,4,30)||!finite(x.heroUp,0,60)||!finite(x.heroRound,0,80)||!finite(x.keyDeg,10,80)||!finite(x.maxPx,512,2400)||!SHVIZ_LIGHT_PRESET[x.lightPreset]||!['soft','minimal','none'].includes(x.shadow))throw Error('Check the render-style values.');
  for(const k of ['bgWord','bgHex','padPct','heroUp','heroRound','keyDeg','maxPx','lightPreset','shadow'])SHVIZ_CFG[k]=x[k];shvizCfgSave();PREFS.railUpkeep=!!d.railUpkeep;PREFS.railRenameMode=!!d.railRenameMode;prefsSave();
 }else throw Error('Unknown settings group.');
 return read();
};
})();
