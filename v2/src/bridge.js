function v2PlantRequest(m){
 if(m.action==='record'){
 const [kind,...rest]=m.key.split(':'),p=plantDbFind(kind,rest.join(':'));if(!p)throw Error('Plant not found');
 return {fields:_pbFieldsFor(kind).map(f=>({k:f.k,sec:f.sec,lab:f.lab,type:f.type,a:f.a,b:f.b,aLab:f.aLab,bLab:f.bLab,opts:f.opts,value:f.read(p)})).concat([{k:'estimatedWater',sec:'Water',lab:'Estimated annual use',type:'readonly',value:Math.round(plantAnnualGal(p,kind,1)).toLocaleString()+' gal/yr each'}]),lights:lightSetOf(p),fire:dsZoneOf(p)};
 }
 if(m.action==='filter'){
 const prior=PB_BOOK,zone=S.pi?.sunsetZone;
 try{PB_BOOK={...prior,q:'',tags:[],photo:'all',sizev:'all',nursery:null,fav:false,avail:'all',imgstate:'all',detstate:'all',colors:[],seasons:[],dorm:'all',dszone:'all',sunset:'all',water:[],sun:[],szband:'all',priced:'all',tox:'all',recent:false,...m.filters};
 let keys=[];for(const k of ['tree','shrub','gc','palm']){PB_BOOK.kind=k;for(const p of PLANT_DB[k]||[])if(_pbkPass(p,null,{q:'',ftags:PB_BOOK.tags}))keys.push(k+':'+p.id)}return {keys,projectZone:projSunsetZone()};
 }finally{PB_BOOK=prior}
 }
 throw Error('Unknown plant request');
}
// Catalogs arrive as copies from the shell's fixed read-only loader. Never publish them.
function v2ApplyCatalog(m){
 if(m.id==='plantbook'&&m.data){if(m.nurseries&&Array.isArray(m.nurseries.nurseries))NURSERY_DB=m.nurseries;for(const k of ['tree','shrub','gc','palm'])if(Array.isArray(m.data[k]))PLANT_DB[k]=m.data[k];_imgNameIdx=null;if(Array.isArray(m.favorites))FAVS=new Set(m.favorites);}
 else if(m.id==='materials'&&Array.isArray(m.data))MATERIALS=m.data.map(p=>({...p,specSF:0}));
 else if(m.id==='furnishings'&&Array.isArray(m.data))FURNISHINGS=m.data.map(p=>({...p,specQty:0}));
 else if(m.id==='colorlibrary'&&Array.isArray(m.data)){COLOR_PALETTES=m.data;_colorPalettesPulled=true;}
}
function v2QThemeCSS(){const s=getComputedStyle(document.documentElement);const val=k=>s.getPropertyValue(k).trim();return (window.v2ExperienceRole==='customer'?'.q-roles{display:none!important}':'')+ ':root{'+Object.entries({'--qp-bg':val('--bg'),'--qp-panel':val('--surface2'),'--qp-text':val('--tx'),'--qp-muted':val('--tm'),'--qp-green':val('--gm'),'--qp-selected':val('--brand-soft'),'--qp-pill':val('--card'),'--qp-light':val('--tm'),'--qp-well':val('--brand-soft'),'--qp-font':'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}).map(([k,v])=>k+':'+v+'!important').join(';')+'}body,button,input,textarea,select{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important}header .brand,header .topname{display:none!important}';}
function v2CompactQuestionnaireHeader(){
 const header=document.querySelector('header');if(!header)return;
 header.classList.add('v2-compact-header');
 [...header.children].forEach(el=>{if(!el.matches('.right,.q-progress'))el.classList.add('v2-old-heading')});
 const back=document.createElement('button');back.id='v2-q-back';back.textContent='← Workspace';back.onclick=()=>parent.postMessage({type:'v2-q-workspace'},'*');
 const title=document.createElement('strong');title.className='v2-q-title';title.textContent='Questionnaire';
 header.prepend(back,title);
}
const v2CompactQuestionnaireCSS=`
html,body{margin:0!important;padding:0!important;background:var(--qp-bg)!important}
header.v2-compact-header{padding:18px 24px 12px!important;min-height:0!important;gap:12px!important;border:0!important;border-radius:0!important;max-width:none!important;display:flex!important;flex-wrap:wrap!important;position:static!important}
header .v2-old-heading{display:none!important}
header .v2-q-title{font-size:17px;flex:1}
header #v2-q-back{background:var(--qp-pill);color:var(--qp-text);min-height:44px;white-space:nowrap}
header .right{margin-left:auto!important;width:auto!important;gap:10px!important}
header .right button.primary,header #designer-save{display:inline-flex!important;align-items:center;min-height:44px;background:var(--qp-green);color:white}
header .q-progress{margin:2px 0 0!important;min-height:18px;flex-basis:100%;font-size:11px!important}
header .q-progress [role=progressbar]{max-width:160px!important;height:5px!important}
.shell{padding:8px 24px 24px!important;max-width:none!important;align-items:start!important;background:var(--qp-bg)!important}
.shell nav{top:12px!important;max-height:calc(100vh - 24px)!important}
@media(max-width:760px){header.v2-compact-header{padding:14px 14px 10px!important}.shell{padding:4px 14px 14px!important}header .right{flex-basis:100%;justify-content:space-between}.q-roles{flex:1}header .q-roles button{padding:10px 8px;font-size:11px}header .v2-q-title{flex:1}.shell nav{max-height:none!important}}
`;
// Normalize stylesheet colors, including the newer questionnaire section styles.
// Photo pixels, SVG artwork, palette swatches and inline user colors are untouched.
function v2QuestionnaireStyles(html){return html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi,(all,attrs,css)=>'<style'+attrs+'>'+css.replace(/(background(?:-color)?|color|border-color)\s*:\s*(#[0-9a-f]{3,8}|white|black)(?=\s*[;!}])/gi,(decl,prop,color)=>{
 let hex=color.toLowerCase();if(hex==='white')hex='#ffffff';if(hex==='black')hex='#000000';hex=hex.slice(1);if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');if(hex.length!==6)return decl;
 const rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)),[r,g,b]=rgb,lo=Math.min(...rgb),hi=Math.max(...rgb),avg=(r+g+b)/3;
 let token;if(prop==='border-color')token='--qp-selected';else if(prop==='color'){if(lo>230)return decl;token=g>r+8&&g>b+8?'--qp-green':avg>90?'--qp-muted':'--qp-text'}else{if(lo>250)token='--qp-pill';else if(lo>230)token='--qp-panel';else if(avg>175)token='--qp-selected';else if(g>=r&&g>b)token='--qp-green';else return decl}
 return prop+':var('+token+')';})+'</style>')}
function v2QuestionnaireHTML(html){
 html=v2QuestionnaireStyles(html);
 const assets=JSON.stringify(qSelectionAssets()).replaceAll('<','\\u003c');
 const css=v2QThemeCSS();
 html += '<style>'+v2CompactQuestionnaireCSS+v2QuestionnaireSurfaces+'</style><script>window.addEventListener("DOMContentLoaded",'+v2CompactQuestionnaireHeader.toString()+');<\/script>';
 return '<style id="v2-qtheme">'+css+'</style><script>window.V2_Q_ASSETS='+assets+';window.addEventListener("message",e=>{if(e.source===parent&&e.data.type==="v2-theme")document.getElementById("v2-qtheme").textContent=e.data.css});<\/script>'+html;
}
(()=>{
 const send=(type,data)=>parent.postMessage({v2:type,...data},'*');
 window.addEventListener('message',e=>{if(e.source===_qFrame?.contentWindow&&e.data?.type==='v2-q-workspace')send('workspace',{})});
 const snapshot=()=>{try{return _bidPayload()}catch{return null}};
 function save(){const bid=snapshot();if(!bid)throw Error('Project not ready');localStorage.setItem('v2_project',JSON.stringify(bid));send('saved',{name:bid.S?.pi?.project||bid.S?.pi?.client||'Preview project'});return bid}
 function theme(t){const d=document.documentElement;d.dataset.v2theme=t;d.dataset.theme=['Dusk','Night'].includes(t)?'dark':'light';const colors=t==='Night'?['#11151C','#161B24','#1E2531','#EAEEF4','#A2AAB8','#6FA855','#1C2C1B']:t==='Dusk'?['#20251f','#292f28','#30382d','#edf0e8','#adb7a5','#82a96b','#354531']:t==='Day'?['#E1E9DC','#fff','#E1E9DC','#202b21','#42503f','#365D29','#D4E3C9']:t==='Afternoon'?['#E8ECE6','#fff','#E8ECE6','#202b21','#42503f','#3C622E','#DBE8D1']:['#faf9f6','#fff','#faf9f6','#263026','#65705e','#50793e','#eaf1e5'];['--bg','--card','--surface2','--tx','--tm','--gm','--brand-soft'].forEach((k,i)=>d.style.setProperty(k,colors[i]));d.style.setProperty('--outer',colors[0]);try{qPost('v2-theme',{css:v2QThemeCSS()})}catch{}}
 const routes={insights:()=>v2Insights(),homeinsights:()=>v2Insights(true),trace:()=>v2Programming(),reports:()=>openReports(),checklist:()=>openChecklist(),dashboard:()=>goEstimate(),settings:()=>openSettings(),clientbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('client')},designerbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('designer')},cities:()=>sbGoBook(),photos:()=>v2Photos()};
 window.addEventListener('message',e=>{if(e.source!==parent||!e.data?.v2cmd)return;const m=e.data;try{if(m.v2cmd==='plant-request'){try{send('plant-response',{requestId:m.requestId,result:v2PlantRequest(m)})}catch(err){send('plant-response',{requestId:m.requestId,error:err.message})}}else if(m.v2cmd==='catalog'){v2ApplyCatalog(m)}else if(m.v2cmd==='route'){insDetClose();document.querySelectorAll('#tk-start,.reports-modal,#v2-programming,#v2-photos,#v2-photo-editor,#v2-insights,#vi-customize').forEach(el=>el.remove());if(routes[m.route])routes[m.route]();else{const b=document.querySelector('.tab[data-view="'+m.route+'"]');if(!b)throw Error('This workspace is not connected yet');b.click()}setTimeout(()=>send('route',{route:m.route}),0)}else if(m.v2cmd==='experience'){window.v2ExperienceRole=['developer','designer','customer'].includes(m.role)?m.role:'developer';v2InsightRole=window.v2ExperienceRole;document.documentElement.dataset.experience=v2InsightRole;if(document.getElementById('v2-insights'))v2InsightRender();if(v2InsightRole==='customer'&&typeof _qMode!=='undefined'&&_qMode==='designer')qSwitchMode('client');try{qPost('v2-theme',{css:v2QThemeCSS()})}catch{}}else if(m.v2cmd==='theme')theme(m.theme);else if(m.v2cmd==='save')save();else if(m.v2cmd==='export'){save();saveBid()}else if(m.v2cmd==='import'){if(!m.bid?.S)throw Error('Choose a Studio H project JSON file');restoreBid(m.bid);CLOUD_BID_ID=null;CLOUD_BID_NAME=null;save();if(document.getElementById('v2-insights'))v2InsightRender()}else if(m.v2cmd==='sample'){loadSampleProject();setTimeout(()=>{save();if(document.getElementById('v2-insights'))v2InsightRender()},200)}else if(m.v2cmd==='snapshot')send('snapshot',{bid:snapshot()});}catch(err){send('error',{message:err.message})}});
 window.addEventListener('load',()=>{setTimeout(()=>{
 // Keep save actions meaningful and local, including questionnaire Save progress.
 window.cloudSaveBid=()=>{try{save();_toast('Saved in V2 on this device')}catch(e){send('error',{message:e.message})}};
 window.cloudOpenBids=()=>send('open-projects',{});
 window._bidAutoSave=async()=>{};
 window._bidSchedule=()=>{clearTimeout(window._v2Auto);window._v2Auto=setTimeout(()=>{try{save()}catch{}},700)};
 window._adminKey=()=>'';
 window.hoaPull=async()=>{_hoaPulled=true;return HOA};_hoaPulled=true;
 try{const bid=JSON.parse(localStorage.getItem('v2_project')||'null');if(bid?.S)restoreBid(bid)}catch(e){send('error',{message:'Saved preview could not reopen: '+e.message})}
 const questionnaireView=document.getElementById('view-questionnaire');
 if(questionnaireView)new MutationObserver(()=>send('questionnaire-state',{visible:questionnaireView.classList.contains('active')})).observe(questionnaireView,{attributes:true,attributeFilter:['class']});
 if(!localStorage.getItem('v2_project')&&!localStorage.getItem('studioh_bid_last')&&!S._sample&&!_projectHasWork())_buildSampleProject();
 theme('Day');send('ready',{});send('snapshot',{bid:snapshot()});
 document.addEventListener('change',()=>{clearTimeout(window._v2Save);window._v2Save=setTimeout(()=>{try{save()}catch{}},800)});
 },2000);});
})();

// Preserve existing form nodes and handlers while arranging the approved Clear cards layout.
function v2ClearProjectCards(){
 const card=document.querySelector('#view-projectinfo .pinfo-card'),basics=card?.querySelector('.pinfo-block'),style=document.getElementById('pinfo-style-slot');
 if(basics&&style&&!card.querySelector('.v2-project-top')){const row=document.createElement('div');row.className='v2-project-top';basics.before(row);row.append(basics,style)}
 const mapEl=document.getElementById('site-map');
 if(mapEl&&!document.getElementById('v2-fit-property')){const button=document.createElement('button');button.id='v2-fit-property';button.className='btn v2-fit-property';button.textContent='⤢ Fit property';button.onclick=()=>v2FitProperty(true);document.getElementById('map-wrap').before(button);const status=document.createElement('div');status.id='v2-fit-status';status.className='v2-fit-status';status.setAttribute('role','status');button.after(status);let lastWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width&&Math.abs(width-lastWidth)>1){lastWidth=width;v2FitProperty()}}).observe(mapEl)}
}
function v2FitProperty(manual=false){
 const el=document.getElementById('site-map'),status=document.getElementById('v2-fit-status');
 if(!el||!el.clientWidth||typeof map==='undefined'||!map||typeof google==='undefined'||!google.maps||typeof parcelOutline==='undefined'||!parcelOutline){if(manual&&status)status.textContent='A loaded map and property boundary are needed to fit the view.';return false}
 const points=[];parcelOutline.getPaths().forEach(path=>path.forEach(p=>points.push(p)));if(!points.length)return false;
 const bounds=new google.maps.LatLngBounds();points.forEach(p=>bounds.extend(p));const ne=bounds.getNorthEast(),sw=bounds.getSouthWest();
 const lat=Math.max(.000001,ne.lat()-sw.lat()),lng=Math.max(.000001,(ne.lng()-sw.lng())*Math.cos((ne.lat()+sw.lat())*Math.PI/360));
 el.style.height=Math.min(850,Math.max(340,(el.clientWidth-72)*lat/lng+72))+'px';
 google.maps.event.trigger(map,'resize');map.setTilt?.(0);map.setHeading?.(0);map.fitBounds(bounds,36);if(status)status.textContent='Full property boundary fitted with padding.';return true;
}
for(const name of ['drawParcelGeoJSON','handleParcelResponse','initMap']){const original=window[name];if(typeof original==='function')window[name]=function(...args){const result=original.apply(this,args);if(result?.then)result.then(()=>requestAnimationFrame(()=>v2FitProperty()));else requestAnimationFrame(()=>v2FitProperty());return result}}
window.addEventListener('load',v2ClearProjectCards);
const v2OriginalStyleRenderer=_piRenderStyle;
_piRenderStyle=function(...args){const result=v2OriginalStyleRenderer.apply(this,args);const host=document.getElementById('pinfo-style-slot');if(host){const title=host.querySelector('b');if(title)title.textContent='Questionnaire';const button=host.querySelector('button');if(button)button.textContent='Open questionnaire →'}return result};

// Use rounded V2 controls instead of the map provider's square buttons.
function v2MapZoom(delta){if(typeof map==='undefined'||!map)return;const zoom=map.getZoom();if(Number.isFinite(zoom))map.setZoom(Math.max(0,Math.min(22,zoom+delta)))}
const v2OriginalBuildMap=buildMap;
buildMap=function(...args){const result=v2OriginalBuildMap.apply(this,args);map.setOptions({zoomControl:false});const host=document.getElementById('map-wrap');if(host&&!document.getElementById('v2-map-zoom')){const controls=document.createElement('div');controls.id='v2-map-zoom';controls.setAttribute('aria-label','Map zoom');for(const [label,delta] of [['Zoom in',1],['Zoom out',-1]]){const button=document.createElement('button');button.type='button';button.textContent=delta>0?'+':'−';button.setAttribute('aria-label',label);button.onclick=()=>v2MapZoom(delta);controls.append(button)}host.append(controls)}return result};

// Next-step card reads the same review state as the client questionnaire.
const v2QuestionnaireSteps=['Property & goals','People & activities','Elements & priorities','Furniture & space','Style & inspiration','Planting & materials','Budget & timing','Photos & references','Review your brief'];
_piRenderStyle=function(){
 const host=document.getElementById('pinfo-style-slot');if(!host)return;qMigrateProjectInfo();
 const brief=S.designBrief||{},reviewed=[...new Set((brief.completed||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<8))];
 if(brief.confirmed)reviewed.push(8);const count=reviewed.length,next=v2QuestionnaireSteps.findIndex((_,i)=>!reviewed.includes(i)),target=next<0?8:next,last=reviewed.at(-1);
 host.innerHTML=`<div class="v2-next-card"><h2>Questionnaire</h2><p>Client priorities, design direction and how the garden will be used.</p><strong>${count} of 9 sections reviewed</strong><div class="v2-brief-progress" role="progressbar" aria-label="Questionnaire review progress" aria-valuemin="0" aria-valuemax="9" aria-valuenow="${count}"><i style="width:${count/9*100}%"></i></div><div class="v2-next-focus"><small>${next<0?'READY TO REVIEW':'UP NEXT · '+String(target+1).padStart(2,'0')}</small><h3>${v2QuestionnaireSteps[target]}</h3><p>${next<0?'All sections have been reviewed. Revisit your brief whenever you need to.':['Choose the project areas and describe what you have in mind.','Tell us who uses the garden and how they spend time outdoors.','Choose your garden elements and set their priorities.','Choose furniture types and quantities, then tell us what you already own.','Choose the styles and inspiration that feel right to you.','Set your planting, materials and color preferences.','Share your budget priorities and preferred timing.','Collect site photos, inspiration and product references.','Check the complete brief and confirm your selections.'][target]}</p></div><dl><div><dt>Last reviewed</dt><dd>${last===undefined?'No sections reviewed yet':v2QuestionnaireSteps[last]}</dd></div><div><dt>Still to review</dt><dd>${9-count} sections</dd></div></dl><button class="btn" onclick="piOpenBrief('client',${target})">${next<0?'Review your brief':count?'Continue where you left off':'Start questionnaire'} →</button></div>`;
};
function v2ArrangeRequirements(){
 const host=document.getElementById('pinfo-refcards');if(!host||host.querySelector('.v2-requirement-column'))return;
 const cards=[...host.children].filter(x=>x.classList.contains('pinfo-sub'));if(cards.length!==5)return;
 const [setbacks,hoa,fire,water,climate]=cards;
 function group(parent,title,nodes){if(!nodes.length)return;const d=document.createElement('details');d.className='v2-requirement-details';const summary=document.createElement('summary');summary.textContent=title;d.append(summary);nodes[0].before(d);nodes.forEach(n=>d.append(n));return d}
 const items=setbacks.querySelector('.sb-items');if(items){const rows=[...items.children],pool=rows.filter(r=>/^(pool|spa)/i.test(r.querySelector('span')?.textContent.trim()||'')),other=rows.filter(r=>!pool.includes(r));group(items,'Pool & spa · '+pool.length+' requirements',pool);group(items,'Structures & equipment · '+other.length+' requirements',other)}
 const notes=[...setbacks.children].filter(n=>n.classList.contains('pinfo-note'));
 // Preserve a visible warning even when the full verification/source controls are collapsed.
 const warning=setbacks.querySelector('.sb-warn');if(warning){const status=document.createElement('p');status.className='v2-source-warning';status.textContent='Source-code verification needed. Review sources before relying on these figures.';setbacks.querySelector('.pinfo-sub-h').after(status)}
 group(setbacks,'Sources & verification',notes);
 const guidance=[...fire.children].filter(n=>n.classList.contains('pinfo-note')&&n.textContent.includes('Defensible space'));group(fire,'Defensible-space guidance',guidance);
 for(const list of [[setbacks],[hoa,water],[fire,climate]]){const column=document.createElement('div');column.className='v2-requirement-column';host.append(column);list.forEach(card=>column.append(card))}
}
const v2OriginalRequirementRenderer=_renderPInfoCards;
_renderPInfoCards=function(...args){const result=v2OriginalRequirementRenderer.apply(this,args);v2ArrangeRequirements();return result};
window.addEventListener('load',()=>{_piRenderStyle();v2ArrangeRequirements()});

const v2QuestionnaireSurfaces=`
.p7 .card,.p7 .overview,.s3-gallery article,.q-dialog{background:var(--qp-pill)!important;color:var(--qp-text)!important}
.p7 .scope-card,.p7 .area-entry input,.p7 .specific,.p7 textarea{background:var(--qp-panel)!important;color:var(--qp-text)!important}
.p7 .scope-card.picked{background:var(--qp-selected)!important}
.p7 .scope-card b,.p7 .facts b,.p7 h2,.budget-total{color:var(--qp-text)!important}
.p7 .hint,.p7 .facts small,.p7 .scope-card small,.p7 .explain,.reviewline small,.sliderends,.mini,.status{color:var(--qp-muted)!important}
.p7 .choice-mark{background:var(--qp-pill)!important;color:var(--qp-green)!important}
.p7 .picked .choice-mark{background:var(--qp-green)!important;color:var(--qp-pill)!important}
.tile,.readonly,.card,.empty{background:var(--qp-pill)!important;color:var(--qp-text)!important}
.upload-card,.q-drop,.q-notes,.callout{background:var(--qp-selected)!important;color:var(--qp-text)!important}
a,.q-quiet{color:var(--qp-green)!important}
dialog{position:fixed;inset:0;margin:auto;max-height:90vh;overflow:auto;background:var(--qp-pill);color:var(--qp-text)}
`;
