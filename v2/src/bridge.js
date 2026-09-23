function v2QThemeCSS(){const s=getComputedStyle(document.documentElement);const val=k=>s.getPropertyValue(k).trim();return ':root{'+Object.entries({'--qp-bg':val('--bg'),'--qp-panel':val('--surface2'),'--qp-text':val('--tx'),'--qp-muted':val('--tm'),'--qp-green':val('--gm'),'--qp-selected':val('--brand-soft'),'--qp-pill':val('--card'),'--qp-font':'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}).map(([k,v])=>k+':'+v+'!important').join(';')+'}body,button,input,textarea,select{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important}header .brand,header .topname,header button.primary,#designer-save{display:none!important}';}
function v2QuestionnaireHTML(html){
 const assets=JSON.stringify(qSelectionAssets()).replaceAll('<','\\u003c');
 const css=v2QThemeCSS()+'body,button,input,textarea,select{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important}header .brand,header .topname,header button.primary,#designer-save{display:none!important}';
 return '<style id="v2-qtheme">'+css+'</style><script>window.V2_Q_ASSETS='+assets+';window.addEventListener("message",e=>{if(e.source===parent&&e.data.type==="v2-theme")document.getElementById("v2-qtheme").textContent=e.data.css});<\/script>'+html;
}
(()=>{
 const send=(type,data)=>parent.postMessage({v2:type,...data},'*');
 const snapshot=()=>{try{return _bidPayload()}catch{return null}};
 function save(){const bid=snapshot();if(!bid)throw Error('Project not ready');localStorage.setItem('v2_project',JSON.stringify(bid));send('saved',{name:bid.S?.pi?.project||bid.S?.pi?.client||'Preview project'});return bid}
 function theme(t){const d=document.documentElement;d.dataset.theme=['Dusk','Night'].includes(t)?'dark':'light';const colors=t==='Night'?['#11151C','#161B24','#1E2531','#EAEEF4','#A2AAB8','#6FA855','#1C2C1B']:t==='Dusk'?['#20251f','#292f28','#30382d','#edf0e8','#adb7a5','#82a96b','#354531']:t==='Day'?['#f4f6f4','#fff','#f5f7f3','#263026','#65705e','#50793e','#eef4ec']:['#faf9f6','#fff','#faf9f6','#263026','#65705e','#50793e','#eaf1e5'];['--bg','--card','--surface2','--tx','--tm','--gm','--brand-soft'].forEach((k,i)=>d.style.setProperty(k,colors[i]));d.style.setProperty('--outer',colors[0]);try{qPost('v2-theme',{css:v2QThemeCSS()})}catch{}}
 const routes={trace:()=>tkStart(),reports:()=>openReports(),checklist:()=>openChecklist(),dashboard:()=>goEstimate(),settings:()=>openSettings(),clientbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('client')},designerbrief:()=>{document.querySelector('[data-view="questionnaire"]').click();qSwitchMode('designer')},cities:()=>sbGoBook(),photos:()=>piOpenBrief('client',7)};
 window.addEventListener('message',e=>{if(e.source!==parent||!e.data?.v2cmd)return;const m=e.data;try{if(m.v2cmd==='route'){document.querySelectorAll('#tk-start,.reports-modal').forEach(el=>el.remove());if(routes[m.route])routes[m.route]();else{const b=document.querySelector('.tab[data-view="'+m.route+'"]');if(!b)throw Error('This workspace is not connected yet');b.click()}send('route',{route:m.route})}else if(m.v2cmd==='theme')theme(m.theme);else if(m.v2cmd==='save')save();else if(m.v2cmd==='export'){save();saveBid()}else if(m.v2cmd==='import'){if(!m.bid?.S)throw Error('Choose a Studio H project JSON file');restoreBid(m.bid);CLOUD_BID_ID=null;CLOUD_BID_NAME=null;save()}else if(m.v2cmd==='sample'){loadSampleProject();setTimeout(save,200)}else if(m.v2cmd==='snapshot')send('snapshot',{bid:snapshot()});}catch(err){send('error',{message:err.message})}});
 window.addEventListener('load',()=>{setTimeout(()=>{
 // Keep save actions meaningful and local, including questionnaire Save progress.
 window.cloudSaveBid=()=>{try{save();_toast('Saved in V2 on this device')}catch(e){send('error',{message:e.message})}};
 window.cloudOpenBids=()=>send('open-projects',{});
 window._bidAutoSave=async()=>{};
 window._bidSchedule=()=>{clearTimeout(window._v2Auto);window._v2Auto=setTimeout(()=>{try{save()}catch{}},700)};
 window._adminKey=()=>'';
 window.hoaPull=async()=>{_hoaPulled=true;return HOA};_hoaPulled=true;
 try{const bid=JSON.parse(localStorage.getItem('v2_project')||'null');if(bid?.S)restoreBid(bid)}catch(e){send('error',{message:'Saved preview could not reopen: '+e.message})}
 theme('Afternoon');send('ready',{});send('snapshot',{bid:snapshot()});
 document.addEventListener('change',()=>{clearTimeout(window._v2Save);window._v2Save=setTimeout(()=>{try{save()}catch{}},800)});
 },2000);});
})();
