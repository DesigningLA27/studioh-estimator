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
function v2QThemeCSS(){const s=getComputedStyle(document.documentElement);const val=k=>s.getPropertyValue(k).trim();return ':root{'+Object.entries({'--qp-bg':val('--bg'),'--qp-panel':val('--surface2'),'--qp-text':val('--tx'),'--qp-muted':val('--tm'),'--qp-green':val('--gm'),'--qp-selected':val('--brand-soft'),'--qp-pill':val('--card'),'--qp-font':'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}).map(([k,v])=>k+':'+v+'!important').join(';')+'}body,button,input,textarea,select{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important}header .brand,header .topname{display:none!important}';}
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
function v2QuestionnaireHTML(html){
 const assets=JSON.stringify(qSelectionAssets()).replaceAll('<','\\u003c');
 const css=v2QThemeCSS();
 html += '<style>'+v2CompactQuestionnaireCSS+'</style><script>window.addEventListener("DOMContentLoaded",'+v2CompactQuestionnaireHeader.toString()+');<\/script>';
 return '<style id="v2-qtheme">'+css+'</style><script>window.V2_Q_ASSETS='+assets+';window.addEventListener("message",e=>{if(e.source===parent&&e.data.type==="v2-theme")document.getElementById("v2-qtheme").textContent=e.data.css});<\/script>'+html;
}
(()=>{
 const send=(type,data)=>parent.postMessage({v2:type,...data},'*');
 window.addEventListener('message',e=>{if(e.source===_qFrame?.contentWindow&&e.data?.type==='v2-q-workspace')send('workspace',{})});
 const snapshot=()=>{try{return _bidPayload()}catch{return null}};
 function save(){const bid=snapshot();if(!bid)throw Error('Project not ready');localStorage.setItem('v2_project',JSON.stringify(bid));send('saved',{name:bid.S?.pi?.project||bid.S?.pi?.client||'Preview project'});return bid}
 function theme(t){const d=document.documentElement;d.dataset.v2theme=t;d.dataset.theme=['Dusk','Night'].includes(t)?'dark':'light';const colors=t==='Night'?['#11151C','#161B24','#1E2531','#EAEEF4','#A2AAB8','#6FA855','#1C2C1B']:t==='Dusk'?['#20251f','#292f28','#30382d','#edf0e8','#adb7a5','#82a96b','#354531']:t==='Day'?['#E1E9DC','#fff','#E1E9DC','#202b21','#42503f','#365D29','#D4E3C9']:t==='Afternoon'?['#E8ECE6','#fff','#E8ECE6','#202b21','#42503f','#3C622E','#DBE8D1']:['#faf9f6','#fff','#faf9f6','#263026','#65705e','#50793e','#eaf1e5'];['--bg','--card','--surface2','--tx','--tm','--gm','--brand-soft'].forEach((k,i)=>d.style.setProperty(k,colors[i]));d.style.setProperty('--outer',colors[0]);try{qPost('v2-theme',{css:v2QThemeCSS()})}catch{}}
 const routes={trace:()=>tkStart(),reports:()=>openReports(),checklist:()=>openChecklist(),dashboard:()=>goEstimate(),settings:()=>openSettings(),clientbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('client')},designerbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('designer')},cities:()=>sbGoBook(),photos:()=>piOpenBrief('client',7)};
 window.addEventListener('message',e=>{if(e.source!==parent||!e.data?.v2cmd)return;const m=e.data;try{if(m.v2cmd==='plant-request'){try{send('plant-response',{requestId:m.requestId,result:v2PlantRequest(m)})}catch(err){send('plant-response',{requestId:m.requestId,error:err.message})}}else if(m.v2cmd==='catalog'){v2ApplyCatalog(m)}else if(m.v2cmd==='route'){document.querySelectorAll('#tk-start,.reports-modal').forEach(el=>el.remove());if(routes[m.route])routes[m.route]();else{const b=document.querySelector('.tab[data-view="'+m.route+'"]');if(!b)throw Error('This workspace is not connected yet');b.click()}send('route',{route:m.route})}else if(m.v2cmd==='theme')theme(m.theme);else if(m.v2cmd==='save')save();else if(m.v2cmd==='export'){save();saveBid()}else if(m.v2cmd==='import'){if(!m.bid?.S)throw Error('Choose a Studio H project JSON file');restoreBid(m.bid);CLOUD_BID_ID=null;CLOUD_BID_NAME=null;save()}else if(m.v2cmd==='sample'){loadSampleProject();setTimeout(save,200)}else if(m.v2cmd==='snapshot')send('snapshot',{bid:snapshot()});}catch(err){send('error',{message:err.message})}});
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
 theme('Day');send('ready',{});send('snapshot',{bid:snapshot()});
 document.addEventListener('change',()=>{clearTimeout(window._v2Save);window._v2Save=setTimeout(()=>{try{save()}catch{}},800)});
 },2000);});
})();
