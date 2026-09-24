// V2 launcher for the existing measurement engine. No separate drawing state.
function v2Programming(){
 document.getElementById('v2-programming')?.remove();
 const host=document.createElement('section');host.id='v2-programming';
 const has=!!(PT.pdfData||PT.satBase),count=PT.polys.length+PT.trees.length;
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 host.innerHTML=`<section class="v2-trace-hero"><div><small>THIS PROJECT’S TRACE</small><h1>${has?escape(S.v2Programming?.name||S.pi?.project||'Your saved plan'):'Start with your site.'}</h1><p>${has?'Open your project’s current plan and continue tracing.':'Choose a PDF, satellite view or CAD drawing to begin. Your tracing stays with this project.'}</p><div class="v2-plan-facts"><span>${count} traced items</span><span>${has?(PT.pdfData?'PDF plan':'Satellite View'):'No plan yet'}</span><span>${PT.ppf?'Scale set':'Scale not set'}</span></div><div class="v2-program-actions">${has?'<button class="btn primary" data-action="resume">Open existing trace →</button>':'<button class="btn primary" data-action="pdf">Upload PDF →</button>'}<button class="btn" data-action="demo">Open Sample Demo</button></div><details><summary>Restore from backup</summary><p>Open a Studio H trace backup (.json) containing shapes, scale and usually the original PDF. A project backup replaces the whole project; export your current work first.</p><button class="btn" data-action="restore">Choose backup file</button></details></div><div class="v2-trace-preview" id="v2-trace-preview"><span>${has?'Preparing plan preview…':'Your plan preview will appear here.'}</span></div></section>
 <nav class="v2-program-steps" aria-label="Programming steps">${['Choose a source','Confirm scale','Define areas','Review & apply'].map((x,i)=>`<button class="v2-program-step" data-step="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${x}</span></button>`).join('')}</nav>
 <div class="v2-program-sources">
 <article><span class="v2-source-symbol"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 5h25l12 12v38a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"/><path class="cut" d="M38 5v14h14"/><path class="cut-line" d="M20 29h23v20H20Zm0 10h13V29m0 10v10"/></svg></span><h2>Use a PDF plan</h2><p>Upload a survey or drawing. Set the scale using a known dimension, then trace directly on the plan.</p><button class="btn" data-action="pdf">Upload PDF →</button></article>
 <article><span class="v2-source-symbol"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m5 18 17-5 19 5 18-5v37l-18 5-19-5-17 5Z"/><path class="cut-line" d="M22 17v30m19-24v28"/><path d="M32 3c-9 0-15 6-15 14 0 10 15 23 15 23s15-13 15-23C47 9 41 3 32 3Z" stroke="var(--bg)" stroke-width="3"/><circle class="cut" cx="32" cy="17" r="5"/></svg></span><h2>Satellite View</h2><p>${escape(S.pi?.address)||'Add a property address in Project info.'}</p><p class="v2-source-note">Live satellite tracing needs map services, which are disabled in this isolated preview. Upload a survey PDF to trace now.</p><button class="btn" data-action="map">Open Satellite View →</button></article>
 <article><span class="v2-source-symbol"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m14 14 34 5-7 33-29-9Z"/><path class="cut-line" d="m20 21 20 4-5 20-16-6Z"/><g stroke="var(--bg)" stroke-width="3"><rect x="7" y="7" width="13" height="13" rx="3"/><rect x="42" y="12" width="13" height="13" rx="3"/><rect x="35" y="46" width="13" height="13" rx="3"/><rect x="5" y="37" width="13" height="13" rx="3"/></g></svg></span><h2>Use a CAD drawing</h2><p>Upload a simple DXF drawing, then verify a known dimension in the tracer. For DWG, export a PDF from your CAD app.</p><p class="v2-source-note">DXF supports lines, straight polylines, circles and arcs. Complex drawings need a PDF export.</p><button class="btn" data-action="cad">Upload DXF / CAD PDF →</button></article></div>
 <div id="v2-program-status" role="status"></div><input hidden id="v2-program-pdf" type="file" accept="application/pdf,.pdf"><input hidden id="v2-program-cad" type="file" accept=".dxf,.dwg,.pdf"><input hidden id="v2-program-trace" type="file" accept="application/json,.json">`;
 document.body.append(host);v2TraceThumbnail(host);
 host.querySelectorAll('[data-step]').forEach(button=>button.onclick=async()=>{const step=Number(button.dataset.step);if(!step){host.querySelector('.v2-program-sources').scrollIntoView({behavior:'smooth'});return}if(!has){host.querySelector('#v2-program-status').textContent='Choose a plan first, then continue through the steps.';return}await ptReopen();if(PT.open&&step===1)ptOpenScale();if(PT.open&&step===3)_toast('Review the take-off, then choose Apply to estimate.');});
 host.querySelectorAll('[data-action]').forEach(button=>button.onclick=async()=>{
  const action=button.dataset.action;if(action==='demo'){parent.postMessage({v2:'open-demo'},'*');return}
  if(action==='pdf')host.querySelector('#v2-program-pdf').click();if(action==='cad')host.querySelector('#v2-program-cad').click();
  if(action==='restore')host.querySelector('#v2-program-trace').click();
  if(action==='resume'||action==='review'){await ptReopen();if(action==='review'&&PT.open)_toast('Review the take-off in the tracer, then choose Apply to estimate.');}
  if(action==='map'&&window.google?.maps&&typeof map!=='undefined'&&map){if(!has||confirm('Replace the current plan and tracing with the property map?'))ptOpenSatellite(false);return;}
  if(action==='map')host.querySelector('#v2-program-status').textContent='Satellite tracing uses the existing tracer, but online map services are not enabled in V2 yet. A PDF plan works now; no existing drawing has been changed.';
 });
 const importPlan=async e=>{
  const file=e.target.files[0];if(!file)return;
  if(has&&!confirm('Replace this project’s current plan and tracing? Export your project first if you want to keep a separate copy.')){e.target.value='';return;}
  const status=host.querySelector('#v2-program-status');status.textContent='Opening your plan…';
  try{if(/\.dwg$/i.test(file.name))throw Error('DWG requires conversion. Export a PDF from your CAD app, then upload that PDF here.');const data=/\.dxf$/i.test(file.name)?await v2DxfPdf(await file.text()):await file.arrayBuffer();const ok=await _ptOpenDocBuf(data,false);if(ok){S.v2Programming={name:file.name};_bidSchedule();status.textContent='Plan opened in the tracer.'}else status.textContent='The plan could not be opened. Please try another PDF.';}catch(err){status.textContent='Could not open this plan: '+err.message}finally{e.target.value=''}
 };
 host.querySelector('#v2-program-pdf').onchange=importPlan;host.querySelector('#v2-program-cad').onchange=importPlan;
 host.querySelector('#v2-program-trace').onchange=e=>{if(has&&!confirm('Replace the current tracing with this saved trace?')){e.target.value='';return}ptLoadSaved(e.target)};
}
const v2OriginalTracerClose=ptClose;
ptClose=function(...args){document.getElementById('pt-scale-pop')?.remove();const result=v2OriginalTracerClose.apply(this,args);if(document.getElementById('v2-programming')){v2Programming();_bidSchedule()}return result};
// Import basic, model-space ASCII DXF geometry without silently dropping entities.
async function v2DxfPdf(text){
 if(text.startsWith('AutoCAD Binary'))throw Error('Binary DXF needs to be exported to PDF.');
 const lines=text.replace(/\r/g,'').split('\n'),pairs=[];for(let i=0;i+1<lines.length;i+=2)pairs.push([lines[i].trim(),lines[i+1].trim()]);
 let inside=false,entities=[],current=null;
 for(let i=0;i<pairs.length;i++){const [code,value]=pairs[i];if(code==='0'&&value==='SECTION'){inside=pairs[i+1]?.[1]==='ENTITIES';continue}if(code==='0'&&value==='ENDSEC'){if(inside&&current)entities.push(current);inside=false;current=null;continue}if(!inside)continue;if(code==='0'){if(current)entities.push(current);current={type:value,data:[]}}else if(current)current.data.push([code,value]);}
 if(!entities.length)throw Error('No drawing geometry found. Export a PDF from your CAD app.');
 const supported=new Set(['LINE','LWPOLYLINE','CIRCLE','ARC']);const unsupported=[...new Set(entities.filter(e=>!supported.has(e.type)).map(e=>e.type))];if(unsupported.length)throw Error('This drawing uses '+unsupported.join(', ')+'. Export it to PDF to preserve the complete drawing.');
 const paths=[];
 for(const e of entities){const get=c=>Number(e.data.find(p=>p[0]===c)?.[1]||0);let pts=[];
 if(e.data.some(p=>['30','31','38','210','220'].includes(p[0])&&Number(p[1])!==0)||e.data.some(p=>p[0]==='230'&&Number(p[1])!==1))throw Error('3D drawings need to be exported to PDF.');
 if(get('67')===1)throw Error('Paper-space drawings need to be exported to PDF.');
 if(e.data.some(p=>p[0]==='42'&&Number(p[1])!==0))throw Error('Curved polylines need to be exported to PDF.');
 if(e.type==='LINE')pts=[[get('10'),get('20')],[get('11'),get('21')]];
 else if(e.type==='LWPOLYLINE'){for(let i=0;i<e.data.length;i++)if(e.data[i][0]==='10'){const y=e.data.slice(i+1).find(p=>p[0]==='20');if(!y)throw Error('Incomplete polyline. Export a PDF instead.');pts.push([Number(e.data[i][1]),Number(y[1])])}if(get('70')&1)pts.push(pts[0]);}
 else {const start=e.type==='ARC'?get('50'):0;let end=e.type==='ARC'?get('51'):360;if(end<=start)end+=360;for(let i=0;i<=120;i++){const a=(start+(end-start)*i/120)*Math.PI/180;pts.push([get('10')+get('40')*Math.cos(a),get('20')+get('40')*Math.sin(a)])}}
 if(pts.length>1)paths.push(pts);
 }
 const points=paths.flat();if(!points.length||points.some(p=>p.some(x=>!Number.isFinite(x))))throw Error('Invalid drawing coordinates.');
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const [x,y] of points){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 const span=Math.max(maxX-minX,maxY-minY);if(!span)throw Error('Drawing has no measurable extent.');const scale=720/span;
 const J=await _ptLoadJsPDF(),doc=new J({unit:'pt',format:[792,792]});doc.setLineWidth(.6);doc.setDrawColor(45,65,45);
 for(const pts of paths)for(let i=1;i<pts.length;i++)doc.line(36+(pts[i-1][0]-minX)*scale,756-(pts[i-1][1]-minY)*scale,36+(pts[i][0]-minX)*scale,756-(pts[i][1]-minY)*scale);
 return doc.output('arraybuffer');
}

async function v2TraceThumbnail(host){
 const box=host.querySelector('#v2-trace-preview');if(!PT.pdfData){if(PT.satBase)box.textContent='Satellite trace · open to view';return}
 const source=PT.pdfData;
 try{const lib=await _ptLoadLib(),doc=await lib.getDocument({data:new Uint8Array(_b642ab(source))}).promise;const page=await doc.getPage(PT.page||1),base=page.getViewport({scale:1}),scale=650/base.width,viewport=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;const ctx=canvas.getContext('2d');await page.render({canvasContext:ctx,viewport}).promise;
 const ratio=scale;ctx.lineWidth=2;ctx.strokeStyle='#50793e';ctx.fillStyle='#50793e22';for(const p of PT.polys.filter(p=>(p.page||1)===(PT.page||1))){if(!p.pts?.length)continue;ctx.beginPath();p.pts.forEach((q,i)=>ctx[i?'lineTo':'moveTo'](q.x*ratio,q.y*ratio));if(p.kind!=='linear'){ctx.closePath();ctx.fill()}ctx.stroke()}
 await doc.destroy();if(!host.isConnected||PT.pdfData!==source)return;canvas.setAttribute('aria-label','Current project plan and traced areas');canvas.setAttribute('role','img');box.replaceChildren(canvas);
 }catch{if(host.isConnected)box.textContent='Preview unavailable. Open the existing trace to view your plan.'}
}
