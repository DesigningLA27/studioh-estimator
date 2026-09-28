let sheetGeometry=null;
function scaleText(){return state.planScale?`${state.planScale===.125?'1/8':state.planScale===.25?'1/4':'1/16'}″ = 1′–0″`:'Not to scale'}
function updateTitle(){
 $('#company-name').textContent=state.project.company;$('#plan-title').textContent=state.project.title;$('#project-address').textContent=state.project.address;
 $('#title-scale').textContent=state.includePlan?scaleText():'No plan';$('#title-scale').hidden=!state.showScale||!state.includePlan;
 $('#north-symbol').hidden=!state.showNorth||!state.includePlan;$('#north-symbol svg').style.transform=`rotate(${state.northAngle}deg)`;
}
function syncProjectControls(){
 for(const [id,v] of Object.entries({'include-plan':state.includePlan,'show-scale':state.showScale,'show-north':state.showNorth,'show-grid':state.showGrid}))$('#'+id).checked=v;
 $('#north-angle').value=state.northAngle;$('#north-value').textContent=state.northAngle+'°';
 $('#project-company').value=state.project.company;$('#project-title').value=state.project.title;$('#project-address-input').value=state.project.address;
}
function overlap(a,b,gap){return a.x<b.x+b.w+gap-.1&&a.x+a.w+gap>b.x+.1&&a.y<b.y+b.h+gap-.1&&a.y+a.h+gap>b.y+.1}
function arrangeSheet(gap=state.gap){
 const area=$('#image-area'),board=$('#board'),W=area.clientWidth,H=area.clientHeight;
 const nodes=new Map([...board.querySelectorAll('[data-id]')].map(e=>[+e.dataset.id,e]));
 board.replaceChildren();board.classList.remove('free-layout');board.classList.add('snap-layout');
 Object.assign(board.style,{width:W+'px',height:H+'px',left:'0px',top:'0px',transform:'none'});
 board.classList.toggle('show-grid',state.showGrid);const unit=(W+gap)/24;board.style.setProperty('--grid-unit',unit+'px');
 const occupied=[],placed=new Map(),frame=$('#scaled-plan');frame.hidden=!state.includePlan;
 let plan=null,badPlan=false;
 if(state.includePlan){
  const px=960/sheetSize()[0],tile=state.tiles.find(t=>t.id===1),factor=tile?.size?tile.size/6:1;
  let w=state.planScale?state.extentW*state.planScale*px:Math.min(W*.44,H*.5*state.extentW/state.extentH)*factor;
  let h=state.planScale?state.extentH*state.planScale*px:w*state.extentH/state.extentW;
  plan={x:(W-w)/2,y:(H-h)/2,w,h};occupied.push(plan);
  Object.assign(frame.style,{left:plan.x+'px',top:plan.y+'px',width:w+'px',height:h+'px'});
  badPlan=w>W||h>H;frame.classList.toggle('no-fit',badPlan);$('#plan-scale-label').textContent='';
  $('#scale-status').textContent=`Centered plan frame: ${(w/px).toFixed(2)} × ${(h/px).toFixed(2)} in. ${state.planScale?'Measured scale locked.':'Illustrative fit; not to scale.'}`;
 }else $('#scale-status').textContent='No plan: images grow outward from the middle.';
 const tiles=state.tiles.filter(t=>!state.includePlan||t.id!==1).filter(t=>state.includePlan||t.id!==1);
 const rows=Math.floor((H+gap)/unit),unitY=(H+gap)/rows;
 const order=[...tiles.filter(t=>t.pin),...tiles.filter(t=>!t.pin)];let missing=[];
 for(const tile of order){
  const requested=tile.size||((tile.id===2&&state.preset==='smart')?5:4);
  const ratio=(tile.rw||tile.w)/(tile.rh||tile.h);let found=null;
  for(let cw=requested;cw>=2&&!found;cw--){
   if(tile.size&&cw!==requested)break;
   let ch=tile.gridHeight||Math.max(2,Math.round(cw/ratio));ch=Math.min(ch,rows);
   const w=cw*unit-gap,h=ch*unitY-gap,candidates=[];
   for(let row=0;row<=rows-ch;row++)for(let col=0;col<=24-cw;col++){
    let box={x:col*unit,y:row*unitY,w,h,col,row,cw,ch,id:tile.id};
    if(tile.pin&&(col!==tile.pin.col||row!==tile.pin.row))continue;if(box.y+h>H+.1||occupied.some(o=>overlap(box,o,gap)))continue;
    const dist=Math.abs(box.x+w/2-W/2);
    box.score=tile.pin?Math.hypot(col-tile.pin.col,row-tile.pin.row):state.includePlan?-(row+ch)*10000+dist:Math.hypot(box.x+w/2-W/2,box.y+h/2-H/2);
    candidates.push(box);
   }
   candidates.sort((a,b)=>a.score-b.score);found=candidates[0];
  }
  if(!found){missing.push(tile.id);continue}occupied.push(found);placed.set(tile.id,found);
  const el=nodes.get(tile.id);if(!el)continue;Object.assign(el.style,{position:'absolute',left:found.x+'px',top:found.y+'px',width:found.w+'px',height:found.h+'px'});
  el.querySelector('small').textContent='';board.append(el);
 }
 sheetGeometry={W,H,unit,unitY,rows,gap,placed,plan,missing,badPlan};
 $('#placement-status').textContent=missing.length?`${missing.length} images do not fit. Reduce image sizes or use a larger sheet. Export is blocked until all fit.`:state.includePlan?'Images fill the bottom first, then rise along the sides. Drag or use arrows to snap to open grid positions.':'Images start in the middle and work outward. Drag or use arrows to snap to open grid positions.';
 $('#export-pdf').disabled=badPlan||missing.length>0;
 $('#edge-note').textContent='Sheet placement uses one alignment grid and equal minimum gutters. Image frames snap to the grid; the centered plan stays fixed.';
 board.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move'};
 board.ondrop=e=>{e.preventDefault();e.stopPropagation();const id=Number(e.dataTransfer.getData('text/plain'));const rect=board.getBoundingClientRect();const tile=state.tiles.find(t=>t.id===id);if(!tile||!placed.has(id))return;const g=placed.get(id),col=Math.round(((e.clientX-rect.left)*W/rect.width-g.w/2)/unit),row=Math.round(((e.clientY-rect.top)*H/rect.height-g.h/2)/unit);moveTo(id,col,row)};
 // Handle drops at the board level, including drops onto other cards.
 board.querySelectorAll('.tile').forEach(el=>{el.ondrop=null;el.ondragover=null;el.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d){e.preventDefault();state.selected=+el.dataset.id;nudge(...d)}}});
}
function moveTo(id,col,row){const g=sheetGeometry,box=g?.placed.get(id);if(!box)return;col=Math.max(0,Math.min(24-box.cw,col));const bottom=row+box.ch>=g.rows-1;let choice;
for(let ch=box.ch;ch>=2;ch--){const rr=bottom?g.rows-ch:Math.max(0,Math.min(g.rows-ch,row));const candidate={x:col*g.unit,y:rr*g.unitY,w:box.w,h:ch*g.unitY-g.gap};const blocked=g.plan&&overlap(candidate,g.plan,g.gap)||state.tiles.filter(t=>t.id!==id&&t.pin).some(t=>{const r=g.placed.get(t.id);return r&&overlap(candidate,r,g.gap)});if(!blocked){choice={col,row:rr,ch};break}}
if(!choice){notify('That space is blocked by the plan or a pinned image. Try another grid cell.');return}editPresentation(()=>{const t=state.tiles.find(t=>t.id===id);if(t){t.pin={col:choice.col,row:choice.row};t.size=box.cw;t.gridHeight=choice.ch}state.selected=id});if(choice.ch<box.ch)notify('Frame height adjusted to fit below the plan. Image kept on the grid.')}

function nudge(dx,dy){if(!state.sheetView){change(()=>state.sheetView=true);notify('Sheet preview opened. Use the arrows to move the selected image.');return}const box=sheetGeometry?.placed.get(state.selected);if(!box){notify('The plan stays centered. Select a supporting image to move.');return}moveTo(state.selected,box.col+dx,box.row+dy)}
function resizeSelected(delta){const t=state.tiles.find(t=>t.id===state.selected);if(!t)return;if(t.id===1&&state.includePlan&&state.planScale){notify('The plan is scale-locked. Change Drawing scale instead.');return}change(()=>{t.size=Math.max(2,Math.min(10,(t.size||(t.id===1?6:t.id===2&&state.preset==='smart'?5:4))+delta));state.sheetView=true});notify(delta>0?'Image enlarged on grid':'Image reduced on grid')}
for(const [id,key] of [['include-plan','includePlan'],['show-scale','showScale'],['show-north','showNorth'],['show-grid','showGrid']])$('#'+id).onchange=e=>change(()=>{state[key]=e.target.checked;state.sheetView=true});
$('#north-angle').oninput=e=>change(()=>{state.northAngle=+e.target.value;state.sheetView=true});
$('#apply-project').onclick=()=>change(()=>{state.project={company:$('#project-company').value.trim(),title:$('#project-title').value.trim(),address:$('#project-address-input').value.trim()};state.sheetView=true});
$('#size-down').onclick=()=>resizeSelected(-1);$('#size-up').onclick=()=>resizeSelected(1);
$('#detail-smaller').onclick=()=>resizeSelected(-1);$('#detail-larger').onclick=()=>resizeSelected(1);
document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>nudge(...b.dataset.nudge.split(',').map(Number)));
$('#auto-arrange').onclick=()=>change(()=>{state.tiles.forEach(t=>delete t.pin);state.sheetView=true});
