let toolsOpen=false,skipClickUntil=0;
function selectedTile(){return state.tiles.find(t=>t.id===state.selected)}
function baseSize(t){return t.id===1?6:t.id===2&&state.preset==='smart'?5:4}
function syncImageTools(){const t=selectedTile();if(!t)return;$('#tools-title').textContent=name(t.id);const locked=t.id===1&&state.includePlan&&state.planScale;$('#image-size').value=t.size||baseSize(t);$('#size-value').textContent=(t.size||baseSize(t))+' grid steps';$('#image-size').disabled=!!locked;$('#live-w').value=t.rw||t.w;$('#live-h').value=t.rh||t.h;$('#live-apply').disabled=t.id===1;document.querySelectorAll('[data-live-ratio]').forEach(b=>{b.disabled=t.id===1;b.setAttribute('aria-pressed',b.dataset.liveRatio===`${t.rw||t.w}:${t.rh||t.h}`)});$('#tools-hint').textContent=locked?'Plan scale is locked. Use Drawing scale to change its physical size.':t.id===1?'The plan stays centered. Its proportions follow the plan dimensions.':'Drag with a mouse, or hold an image briefly and drag with your finger. Arrow buttons also snap to the grid.';}
function selectImage(id){state.selected=id;toolsOpen=true;$('#image-tools').hidden=false;document.body.classList.add('editing-image');document.querySelectorAll('[data-id]').forEach(e=>e.setAttribute('aria-pressed',+e.dataset.id===id));syncImageTools();const canvas=$('.canvas');if(canvas.getBoundingClientRect().top<0||canvas.getBoundingClientRect().top>100)canvas.scrollIntoView({block:'start',behavior:'instant'});}
function editPresentation(fn){const before=structuredClone(state);checkpoint();fn();state.sheetView=true;draw();arrange();if(sheetGeometry?.missing.length||sheetGeometry?.badPlan){state=before;history.pop();draw();arrange();notify('That grid position or size is blocked. Kept the previous arrangement. Move or remove a card to free space.');}syncImageTools();wirePointerEditing();}
$('#image-size').oninput=e=>{const value=+e.target.value;editPresentation(()=>{selectedTile().size=value;delete selectedTile().gridHeight})};
document.querySelectorAll('[data-live-ratio]').forEach(b=>b.onclick=()=>editPresentation(()=>{[selectedTile().rw,selectedTile().rh]=b.dataset.liveRatio.split(':').map(Number)}));
$('#live-apply').onclick=()=>{const w=+$('#live-w').value,h=+$('#live-h').value;if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0||w>100||h>100){notify('Enter proportions between 0.1 and 100.');return}editPresentation(()=>{selectedTile().rw=w;selectedTile().rh=h})};
$('#image-details').onclick=()=>openDetails(state.selected);
$('#reset-smart').onclick=()=>editPresentation(()=>{const t=selectedTile();delete t.size;delete t.rw;delete t.rh;delete t.pin});
$('#close-tools').onclick=()=>{toolsOpen=false;$('#image-tools').hidden=true;document.body.classList.remove('editing-image')};
document.querySelectorAll('[data-live-nudge]').forEach(b=>b.onclick=()=>nudge(...b.dataset.liveNudge.split(',').map(Number)));
function wirePointerEditing(){renderAddedImages();
 document.querySelectorAll('#board .tile').forEach(el=>{
  el.draggable=false;el.onclick=e=>{if(Date.now()<skipClickUntil)return;selectImage(+el.dataset.id)};
  el.onpointerdown=e=>{
   if(e.button!==0)return;const id=+el.dataset.id,box=sheetGeometry?.placed.get(id);if(!box)return;
   const sx=e.clientX,sy=e.clientY;let active=false,timer,ghost;
   const begin=()=>{active=true;state.selected=id;const r=el.getBoundingClientRect();ghost=el.cloneNode(true);ghost.removeAttribute('data-id');ghost.className='drag-preview';Object.assign(ghost.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:10000,pointerEvents:'none',opacity:.75});document.body.append(ghost);el.classList.add('pointer-dragging');};
   el.setPointerCapture(e.pointerId);if(e.pointerType==='touch')timer=setTimeout(begin,350);
   el.onpointermove=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(!active&&e.pointerType!=='touch'&&Math.hypot(dx,dy)>5)begin();if(active){ev.preventDefault();ghost.style.transform=`translate(${dx}px,${dy}px)`}};
   const finish=ev=>{clearTimeout(timer);el.classList.remove('pointer-dragging');if(active&&ev.type!=='pointercancel'){skipClickUntil=Date.now()+400;const r=$('#board').getBoundingClientRect(),g=sheetGeometry;const col=Math.round((box.x+(ev.clientX-sx)*g.W/r.width)/g.unit),row=Math.round((box.y+(ev.clientY-sy)*g.H/r.height)/g.unitY);moveTo(id,col,row);selectImage(id)}ghost?.remove();el.onpointermove=null;el.onpointerup=null;el.onpointercancel=null;};
   el.onpointerup=finish;el.onpointercancel=finish;
  };
 });
}
// Rewire only when the layout has changed, never while a pointer is dragging.
const originalArrangeSheet=arrangeSheet;
arrangeSheet=function(...args){originalArrangeSheet(...args);wirePointerEditing();if(toolsOpen)syncImageTools()};
window.addEventListener('resize',()=>{arrange()});
const oldPanel=$('#selected-name').closest('.panel');oldPanel.classList.add('legacy-tile-editor');
