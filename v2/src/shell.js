/* V2 shell: the original tool engine stays mounted while navigation changes. */
(()=>{
 const root=document.getElementById('sh-v2'),body=root.querySelector('.body'),main=root.querySelector('main');
 const pane=document.createElement('section');pane.id='v2-engine-pane';pane.hidden=true;pane.innerHTML='<div class="v2-toolhead"><button id="v2-back">← Workspace</button><strong id="v2-tooltitle"></strong><button id="v2-tool-save">Save progress</button></div><div id="v2-tooltabs"></div><iframe id="v2-engine" title="Studio H project workspace" sandbox="allow-scripts allow-downloads allow-modals"></iframe>';body.appendChild(pane);
 const frame=pane.querySelector('iframe');let ready=false,pending=null,current=null,project=null,lastName="";
 const keys={store:'studioh_v2_preview_store_v1',theme:'studioh_v2_theme_v1'};
 if(!localStorage.getItem('studioh_v2_theme_mapping_v2')){if(localStorage.getItem(keys.theme)==='Afternoon')localStorage.setItem(keys.theme,'Morning');localStorage.setItem('studioh_v2_theme_mapping_v2','1')}
 const plantRequests=new Map();let plantSeq=0;
 const routes={
 '01 · Project info':['projectinfo','Project info'], '02 · Questionnaires':['clientbrief','Client questionnaire'],'03 · Site trace':['trace','Site trace'],'04 · Project Insights':['insights','Project Insights'],'05 · Photos & references':['photos','Photos & references'],
 'Project insights':['insights','Project insights'],'Plan & builders':['trace','Design & take-offs'],'Mood board':['moodboard','Mood board'],'Plants & materials':['plantbook','Plant Book'],'Furniture & products':['furnishings','Furnishings'],
 'Estimate':['estimate','Estimate'],'Savings Center':['ve','Savings Center'],'Bid comparison':['bidcompare','Bid comparison'],'Cost insights':['insights','Project insights'],'Checklist & to-dos':['checklist','Checklist'],'Reports & presentations':['reports','Reports'],
 'Plant Book':['plantbook','Plant Book'],'Materials':['materials','Materials'],'Furnishings':['furnishings','Furnishings'],'Products':['products','Products'],'Color Library':['colorlibrary','Color Library'],'Price Book':['pricebook','Price Book'],'HOA & DRC':['hoa','HOA & DRC'],'Cities & codes':['cities','Cities & codes'],'Nurseries':['nurseries','Nurseries'],
 'Pricing rules & algorithms':['algos','Algorithms'],'Appearance & preferences':['settings','Settings'],
 };
 const command=m=>{if(ready)frame.contentWindow.postMessage(m,'*');else pending=m};
 function notice(message){const n=document.getElementById('v2-notice');n.textContent=message;n.hidden=false;clearTimeout(n.timer);n.timer=setTimeout(()=>n.hidden=true,6500)}
 function show(route,label,projectTools=false){if(window.v2Experience&&!v2Experience.allowsTool(route)){notice("This tool is available in Developer or Designer mode.");return}if(!projectTools&&window.v2Libraries?.supports(route)){workspace();window.v2Libraries.open(route,main);return}window.v2Libraries?.close();current={route,label};document.getElementById('v2-back').hidden=route==='homeinsights';frame.style.visibility="hidden";pane.setAttribute("aria-busy","true");root.classList.toggle('brief-open',['projectfiles','projectinfo','clientbrief','designerbrief','photos','trace','insights','homeinsights'].includes(route));root.classList.toggle('questionnaire-open',['clientbrief','designerbrief'].includes(route));main.hidden=true;pane.hidden=false;document.getElementById('v2-tooltitle').textContent=({projectinfo:/intelligence/i.test(label)?'Site Intelligence':'Project info',trace:'Programming',clientbrief:'Questionnaire',designerbrief:'Questionnaire',photos:'Photos & references'})[route]||label;let tabs=route.includes('brief')||route==='photos'?[]:['plantbook','materials','furnishings','products','colorlibrary','pricebook','hoa','cities','nurseries'].includes(route)?Object.values(routes).filter(x=>['plantbook','materials','furnishings','products','colorlibrary','pricebook','hoa','cities','nurseries'].includes(x[0])).filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i):[];const bar=document.getElementById('v2-tooltabs');bar.replaceChildren(...tabs.map(([id,name])=>{const b=document.createElement('button');b.textContent=name;b.className=id===route?'on':'';b.onclick=()=>show(id,name);return b}));command({v2cmd:'route',route});}
 function workspace(){window.v2Libraries?.close();pane.hidden=true;main.hidden=false;current=null;root.classList.remove('questionnaire-open','brief-open')}
 document.getElementById('v2-back').onclick=workspace;
 document.getElementById('v2-tool-save').onclick=()=>command({v2cmd:'save'});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.detail&&routes[b.dataset.detail]){e.stopImmediatePropagation();show(...routes[b.dataset.detail]);return}
 if(b.dataset.go)workspace();
 if(b.dataset.theme){localStorage.setItem(keys.theme,b.dataset.theme);command({v2cmd:'theme',theme:b.dataset.theme})}
 },true);
 window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||!e.data?.v2)return;const m=e.data;
 if(m.v2==='route'&&m.route===current?.route){frame.style.visibility='visible';pane.removeAttribute('aria-busy')}
 if(m.v2==='open-demo'){location.href='mockups/brief-workflow/#demo';return}
 if(m.v2==='insights-open'){window.v2Workspace.open('insights');return}
 if(m.v2==='workspace-page'&&['brief','design'].includes(m.page)){window.v2Workspace.open(m.page);return}
 if(m.v2==='workspace'){workspace();return}
 if(m.v2==='questionnaire-state'){root.classList.toggle('questionnaire-open',m.visible&&['clientbrief','designerbrief'].includes(current?.route));return}
 if(m.v2==='plant-response'){const task=plantRequests.get(m.requestId);if(task){clearTimeout(task.timer);plantRequests.delete(m.requestId);m.error?task.reject(Error(m.error)):task.resolve(m.result)}return}
 if(m.v2==='storage'){try{localStorage.setItem(keys.store,JSON.stringify(m.data))}catch{notice('Device storage is full. Export this preview to keep your work.')}}
 if(m.v2==='ready'){ready=true;window.v2Libraries?.sync();command({v2cmd:'experience',role:window.v2Experience?.role||'developer'});command({v2cmd:'theme',theme:localStorage.getItem(keys.theme)||'Day'});if(pending){const m=pending;pending=null;command(m)}document.getElementById('v2-state').textContent='Local preview · Cloud writes blocked'}
 if(m.v2==='saved'){document.getElementById('v2-state').textContent='Saved on this device';updateName(m.name)}
 if(m.v2==='identity')window.v2Workspace?.identity(m.photo);
 if(m.v2==='open-project-info')show('projectinfo','Project info');
 if(m.v2==='open-photos')show('photos','Photos & references');
 if(m.v2==='snapshot'){project=m.bid;updateName(project?.S?.pi?.project||project?.S?.pi?.client||'Preview project')}
 if(m.v2==='error'){frame.style.visibility='visible';pane.removeAttribute('aria-busy');notice(m.message)};if(m.v2==='open-projects')document.getElementById('v2-projects').showModal();
 });
 function updateName(name){lastName=name;const p=root.querySelector('.project strong');if(p)p.textContent=name}
 root.addEventListener('click',()=>setTimeout(()=>{if(lastName)updateName(lastName)},0));
 document.getElementById('v2-save').onclick=()=>command({v2cmd:'save'});
 document.getElementById('v2-export').onclick=()=>command({v2cmd:'export'});
 document.getElementById('v2-project-button').onclick=()=>document.getElementById('v2-projects').showModal();
 document.getElementById('v2-sample').onclick=()=>{command({v2cmd:'sample'});document.getElementById('v2-projects').close();notice('Sample opened in V2 only.')};
 document.getElementById('v2-import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>30*1024*1024)throw Error('Choose a project file under 30 MB');const bid=JSON.parse(await f.text());if(!bid?.S)throw Error('Choose an exported Studio H project JSON file');command({v2cmd:'import',bid});document.getElementById('v2-projects').close();show('projectinfo','Project info')}catch(err){notice(err.message)}e.target.value=''};
 const theme=localStorage.getItem(keys.theme);if(theme)root.querySelector('button[data-theme="'+theme+'"]')?.click();
 fetch('engine.html?v='+encodeURIComponent(document.querySelector('meta[name="studioh-version"]')?.content||'7')).then(r=>{if(!r.ok)throw Error('Engine could not load');return r.text()}).then(html=>{let seed={};try{seed=JSON.parse(localStorage.getItem(keys.store)||'{}')}catch{}const json=JSON.stringify(seed).replaceAll('<','\\u003c');frame.srcdoc=html.replace('/*V2_STORAGE_SEED*/{}',json)}).catch(e=>notice(e.message));
 window.v2Preview={show,workspace,command,plantRequest(action,data={}){return new Promise((resolve,reject)=>{if(!ready){reject(Error('Project tools are still loading. Try again in a moment.'));return}const requestId=++plantSeq;const timer=setTimeout(()=>{plantRequests.delete(requestId);reject(Error('Plant data took too long to load'))},10000);plantRequests.set(requestId,{resolve,reject,timer});command({v2cmd:'plant-request',requestId,action,...data})})},get ready(){return ready}};
})();
