// V2 launcher for the existing measurement engine. No separate drawing state.
function v2Programming(){
 document.getElementById('v2-programming')?.remove();
 const host=document.createElement('section');host.id='v2-programming';
 const has=!!(PT.pdfData||PT.satBase),count=PT.polys.length+PT.trees.length;
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 host.innerHTML=`<div class="v2-program-intro"><div><small>YOUR PLAN · YOUR PROJECT</small><h1>Start with your site.</h1><p>Choose a source, confirm its scale, then trace the areas that shape your estimate.</p></div>${has?'<button class="btn primary" data-action="resume">Continue tracing →</button>':''}</div>
 <nav class="v2-program-steps" aria-label="Programming steps">${['Choose a source','Confirm scale','Define areas','Review & apply'].map((x,i)=>`<button class="v2-program-step" data-step="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${x}</span></button>`).join('')}</nav>
 <div class="v2-program-sources">
 <article><span class="v2-source-symbol">▤</span><h2>Use a PDF plan</h2><p>Upload a survey or drawing. Set the scale using a known dimension, then trace directly on the plan.</p><button class="btn" data-action="pdf">Upload PDF →</button></article>
 <article><span class="v2-source-symbol">⌖</span><h2>Use the property map</h2><p>${escape(S.pi?.address)||'Add a property address in Project info.'}</p><p class="v2-source-note">Live satellite tracing needs map services, which are disabled in this isolated preview. Upload a survey PDF to trace now.</p><button class="btn" data-action="map">Check property map →</button></article>
 <article><span class="v2-source-symbol">⌑</span><h2>Use a CAD drawing</h2><p>Upload a simple DXF drawing, then verify a known dimension in the tracer. For DWG, export a PDF from your CAD app.</p><p class="v2-source-note">DXF supports lines, straight polylines, circles and arcs. Complex drawings need a PDF export.</p><button class="btn" data-action="cad">Upload DXF / CAD PDF →</button></article></div>
 <div class="v2-program-bottom"><article><h2>${has?'Your current plan':'Your saved plan'}</h2><p>${has?escape(S.v2Programming?.name||(PT.pdfData?'PDF plan':'Property map')):'Upload a plan to begin. Your source and tracing will be saved with this V2 project.'}</p><div class="v2-plan-facts"><span>${count} traced items</span><span>${PT.ppf?'Scale set':'Scale not set'}</span></div><div class="v2-program-actions">${has?'<button class="btn" data-action="resume">Open actual tracer →</button><button class="btn" data-action="review">Review quantities</button>':''}<button class="btn" data-action="restore">Import saved trace</button></div></article>
 <article><h2>From plan to estimate</h2><ol><li><strong>Confirm scale.</strong> Check a known dimension before measuring.</li><li><strong>Define areas.</strong> Use the tracer’s drawing, line and count tools.</li><li><strong>Review & apply.</strong> Check the take-off and apply it to this project’s estimate.</li></ol></article></div><div id="v2-program-status" role="status"></div><input hidden id="v2-program-pdf" type="file" accept="application/pdf,.pdf"><input hidden id="v2-program-cad" type="file" accept=".dxf,.dwg,.pdf"><input hidden id="v2-program-trace" type="file" accept="application/json,.json">`;
 document.body.append(host);
 host.querySelectorAll('[data-step]').forEach(button=>button.onclick=async()=>{const step=Number(button.dataset.step);if(!step){host.querySelector('.v2-program-sources').scrollIntoView({behavior:'smooth'});return}if(!has){host.querySelector('#v2-program-status').textContent='Choose a plan first, then continue through the steps.';return}await ptReopen();if(PT.open&&step===1)ptOpenScale();if(PT.open&&step===3)_toast('Review the take-off, then choose Apply to estimate.');});
 host.querySelectorAll('[data-action]').forEach(button=>button.onclick=async()=>{
  const action=button.dataset.action;
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
ptClose=function(...args){const result=v2OriginalTracerClose.apply(this,args);if(document.getElementById('v2-programming')){v2Programming();_bidSchedule()}return result};
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
