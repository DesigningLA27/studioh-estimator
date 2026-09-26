/* V2 presentation adapter. Selection, pricing, wizard, palette and library actions
   remain owned by V1. View/filter/presentation are in-memory UI state only. */
(()=>{
'use strict';
const baseRender=renderMoodBoard;
let filter='all',present=false,builderOpen=false;const builderGroups=new Set();
const applyCatalog=v2ApplyCatalog;
v2ApplyCatalog=function(m){if(m.id==='elements'&&Array.isArray(m.data)){SITE_ELEMENTS=m.data;_elementsPulled=true;}else applyCatalog(m);if(S.view==='moodboard')renderMoodBoard()};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(name,action,cls='')=>`<button type="button" class="vmb-button ${cls}" ${action}>${name}</button>`;
// Project reference photos form a real selectable Inspiration section.
const nativeSectionDefs=_mbSectionDefs,nativeSectionItems=_mbItemsForSection,nativePhotoInner=_mbPhotoInner;
_mbSectionDefs=function(){return [...nativeSectionDefs(),{key:'v2_inspiration',label:'Inspiration',group:'inspiration'}]};
_mbItemsForSection=function(d){if(d.group!=='inspiration')return nativeSectionItems(d);const all=v2PhotoItems().filter(p=>v2PhotoCategory(p)==='Inspiration'&&v2PhotoURL(p.url,true)).map(p=>({kind:'references',pid:p.id,label:p.name||'Inspiration',sub:p.caption||'Project reference',img:p.url,obj:p}));return {shown:all.filter(x=>!_mbEnsure().hidden.includes(_mbHiddenKey(x.kind,x.pid))),hiddenCount:all.filter(x=>_mbEnsure().hidden.includes(_mbHiddenKey(x.kind,x.pid))).length}};
_mbPhotoInner=function(x){return x.kind==='references'?`<img src="${escape(x.img)}" alt="${escape(x.label)}" style="width:100%;height:100%;object-fit:cover;display:block">`:nativePhotoInner(x)};
const groups=[['all','All'],['plant','Plants'],['materials','Materials'],['furnishings','Furniture'],['products','Products'],['siteelements','Site elements'],['inspiration','Inspiration'],['palette','Color palette'],['insights','Insights']];
_mbSectionBoardHtml=function(items){
 const visible=items.filter(x=>typeof x.img==='string'&&x.img.trim()),missing=items.filter(x=>!visible.includes(x));
 const counts=new Map();missing.forEach(x=>{const label=x.kind==='plants'?({shrub:'shrub',tree:'tree',palm:'palm',gc:'groundcover'}[x.kind0]||'plant'):'item';counts.set(label,(counts.get(label)||0)+1)});
 const summary=[...counts].map(([label,n])=>`${n} ${label}${n===1?'':'s'}`).join(', ');
 const note=missing.length?`<details class="vmb-missing"><summary>${escape(summary)} excluded due to no image</summary><p>Still included in your project and estimate. Add a library image to show them here.</p><ul>${missing.map(x=>`<li>${escape(x.label)}</li>`).join('')}</ul></details>`:'';
 return (visible.length?`<div class="vmb-items">${visible.map(x=>`<article class="vmb-item" data-vmb-item="${escape(x.kind+':'+x.pid)}">${_mbTile(x,'card')}</article>`).join('')}</div>`:items.length?'':'<p class="vmb-empty">Add a library selection to build this section.</p>')+note;
};
window.v2MoodboardSetView=function(view){if(!['grid','editorial','wall'].includes(view))return;MB_VIEW.disp=view;_mbEnsure().view=view;try{_bidSchedule()}catch{}renderMoodBoard();document.querySelector(`[data-vmb-view="${view}"]`)?.focus()};
window.v2MoodboardFilter=function(group){filter=group;renderMoodBoard();document.querySelector(`[data-vmb-filter="${group}"]`)?.focus()};
window.v2MoodboardPresent=function(){present=!present;parent.postMessage({v2:'moodboard-presentation',present},'*');document.getElementById('view-moodboard')?.classList.toggle('vmb-present',present);const b=document.querySelector('[data-vmb-present]');if(b){b.textContent=present?'Exit presentation':'Present';b.setAttribute('aria-pressed',String(present))}};
window.v2MoodboardLibrary=function(){
 let dialog=document.getElementById('vmb-library');if(!dialog){dialog=document.createElement('dialog');dialog.id='vmb-library';dialog.className='vmb-dialog';document.body.append(dialog)}
 const defs=_mbSectionDefs().filter(d=>['plant','materials','furnishings','products','inspiration'].includes(d.group));
 dialog.innerHTML=`<header><h2>Add from your libraries</h2><button type="button" class="vmb-button" data-close aria-label="Close library chooser">✕</button></header><p>Choose a category. Selections use the original project specification and planting tools.</p><div class="vmb-library-choices">${defs.map(d=>button(escape(d.label),`data-library-key="${escape(d.key)}"`)).join('')}</div>`;
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelectorAll('[data-library-key]').forEach(b=>b.onclick=()=>{const d=defs.find(d=>d.key===b.dataset.libraryKey);dialog.close();if(d.group==='plant')mbPlantSearchOpen();else if(d.group==='inspiration'){const mb=_mbEnsure();if(!mb.sections.includes(d.key))mb.sections.push(d.key);_bidSchedule();parent.postMessage({v2:'open-photos'},'*')}else mbGoodsSearchOpen(d.key)});dialog.showModal();
};
window.v2MoodboardRestore=function(){const mb=_mbEnsure();mb.hidden=[];try{_bidSchedule()}catch{}renderMoodBoard()};
renderMoodBoard=function(){
 const storedView=_mbEnsure().view;if(['grid','editorial','wall'].includes(storedView))MB_VIEW.disp=storedView;
 const wizardPreference=MB_WIZ_OPEN;
 baseRender();
 MB_WIZ_OPEN=wizardPreference;_mbWizardPanelRender();
 const host=document.getElementById('mb-body'),view=document.getElementById('view-moodboard');if(!host||!view)return;
 parent.postMessage({v2:'moodboard-presentation',present},'*');view.classList.add('vmb');view.dataset.boardView=MB_VIEW.disp;view.classList.toggle('vmb-present',present);
 const mb=_mbEnsure(),defs=_mbSectionDefs(),selected=mb.sections.map(k=>defs.find(d=>d.key===k)).filter(Boolean);
 const cards=Array.from(host.children).filter(e=>e.classList.contains('card'));const sectionCards=selected.map((d,i)=>({d,card:cards[i]})).filter(x=>x.card);const addCard=cards[selected.length];
 const oldTop=view.firstElementChild;oldTop.classList.add('vmb-top');oldTop.querySelector('.sct').childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.includes('Mood Board'))n.textContent='Your project, brought together. '});
 const wizardButton=document.getElementById('mb-wiz-togglebtn');if(wizardButton)wizardButton.textContent='Style & goals guide';
 const budget=document.getElementById('mb-budget-slot');let budgetText=budget.firstElementChild?.firstElementChild;budgetText=budgetText?budgetText.cloneNode(true):null;
 budget.replaceChildren();budget.classList.add('vmb-toolbar');
 const toggles=document.createElement('nav');toggles.className='vmb-views';toggles.setAttribute('aria-label','Moodboard view');toggles.innerHTML=[['grid','01 · Studio board'],['editorial','02 · Editorial'],['wall','03 · Visual wall']].map(([id,label])=>button(label,`data-vmb-view="${id}" onclick="v2MoodboardSetView('${id}')" aria-pressed="${MB_VIEW.disp===id}"`,MB_VIEW.disp===id?'selected':'')).join('');budget.append(toggles);
 const actions=document.createElement('div');actions.className='vmb-actions';actions.innerHTML=button(builderOpen?'Close builder':'Build board',`data-vmb-builder-toggle onclick="v2MoodboardBuilder()" aria-expanded="${builderOpen}"`,'vmb-edit')+button(present?'Exit presentation':'Present',`data-vmb-present onclick="v2MoodboardPresent()" aria-pressed="${present}"`)+button('＋ Add from library','onclick="v2MoodboardLibrary()"','vmb-edit primary');budget.append(actions);
 const frame=document.createElement('div');frame.className='vmb-frame';
 const heading=document.createElement('header');heading.className='vmb-heading';heading.innerHTML='<div><span class="vmb-eyebrow">DESIGN / MOODBOARD</span><h1>Your project, <span>brought together.</span></h1><p>Plants, materials and pieces that belong in this design.</p></div>';heading.append(actions);frame.append(heading);
 const allItems=selected.filter(d=>!['palette','insights'].includes(d.group)).flatMap(d=>{try{return _mbItemsForSection(d).shown}catch{return []}});const lead=allItems.find(x=>x.img&&x.kind!=='elements');
 const hero=document.createElement('section');hero.className='vmb-hero';
 const project=S.pi?.project||S.pi?.client||'Your project';
 const isSample=/sample|demo/i.test(project),photo=v2PrimaryPhoto()||v2PhotoItems().find(p=>v2PhotoCategory(p)==='Inspiration'&&v2PhotoURL(p.url,true));
 const title=mb.directionTitle||(isSample?'Quiet geometry. Warm materials.':'Your design direction.');
 const description=mb.directionNotes||'A shared direction, built from your actual project selections.';
 const scene=photo?`<img alt="${escape(photo.name||'Project inspiration')}" src="${escape(photo.url)}">`:isSample?'<div class="vmb-sample-scene" role="img" aria-label="Sample garden inspiration"></div>':lead?`<img alt="${escape(lead.label)}" src="${escape(lead.img)}">`:'<div class="vmb-cover-empty">Choose a project photo in Photos & references.</div>';
 const palette=mb.themePaletteId?colorPaletteFind(mb.themePaletteId):null;
 const colors=palette?CANON_KEYS.map(k=>palette.sw?.[k]?.[1]).filter(c=>/^#[0-9a-f]{3,8}$/i.test(c)):isSample?['#798668','#b6bca5','#e3ddce','#b99878','#454b42']:[];
 const swatches=`<div class="vmb-swatches">${colors.map(c=>`<span style="background:${c}" aria-label="${c}"></span>`).join('')}</div>`;
 hero.innerHTML=`<div class="vmb-story"><span class="vmb-eyebrow">${MB_VIEW.disp==='editorial'?'01 / Design story':'Concept direction'}${isSample?' · sample':''}</span><h2>${escape(title)}</h2><p>${escape(description)}</p>${MB_VIEW.disp==='editorial'?swatches:''}${button('Edit style & goals','onclick="mbWizardToggle()"','vmb-edit')}${button('Edit direction','onclick="v2MoodboardDirection()"','vmb-edit vmb-direction-edit')}</div><div class="vmb-cover">${scene}</div>`;
 if(MB_VIEW.disp==='grid')frame.append(hero);
 const tabs=document.createElement('div');tabs.className='vmb-filters';tabs.innerHTML=`<nav aria-label="Moodboard category">${groups.map(([id,label])=>button(label,`data-vmb-filter="${id}" onclick="v2MoodboardFilter('${id}')" aria-pressed="${filter===id}"`,filter===id?'selected':'')).join('')}</nav><div class="vmb-edit">${button('Sections','onclick="v2MoodboardBuilder(true)"')}${button('Restore hidden ('+mb.hidden.length+')','onclick="v2MoodboardRestore()"')}</div>`;frame.append(tabs);if(MB_VIEW.disp==='editorial')frame.append(hero);
 if(MB_VIEW.disp==='wall'){const intro=document.createElement('section');intro.className='vmb-wall-intro';intro.innerHTML='<div><span class="vmb-eyebrow">Visual collection</span><h2>One direction. Every detail.</h2></div>'+swatches;frame.append(intro);}
 const layout=document.createElement('div');layout.className='vmb-layout';const body=document.createElement('div');body.className='vmb-content';const side=document.createElement('aside');side.className='vmb-side';
 const colorCard=document.createElement('section');colorCard.className='vmb-summary';colorCard.innerHTML=`<span class="vmb-eyebrow">Color direction</span><h3>${escape(palette?.name||(isSample?'Warm neutrals. Soft greens.':'Choose your project palette'))}</h3>${swatches}${!palette&&isSample?'<small>Sample color direction</small>':''}${button('Edit palette',"onclick=\"v2MoodboardPalette()\"",'vmb-edit')}`;colorCard.dataset.support='palette';colorCard.hidden=mb.supportCards?.palette===false;side.append(colorCard);
 if(budgetText){const card=document.createElement('section');card.className='vmb-summary';card.innerHTML='<span class="vmb-eyebrow">Project connection</span><h3>'+allItems.filter(x=>x.img?.trim()).length+' visual selections</h3>';card.append(budgetText);card.dataset.support='connection';card.hidden=mb.supportCards?.connection===false;side.append(card)}
 const brief=document.createElement('section');brief.className='vmb-summary vmb-brief';brief.innerHTML=`<span class="vmb-eyebrow">Design brief</span><h3>${escape(title)}</h3><p>${escape(description)}</p>${button('Style & goals guide','onclick="mbWizardToggle()"','vmb-edit')}`;brief.dataset.support='brief';brief.hidden=mb.supportCards?.brief===false;side.append(brief);
 const wall=document.createElement('div');wall.className='vmb-wall';const seen=new Set();
 if(filter==='all'&&(photo||isSample)){const leadTile=document.createElement('article');leadTile.className='vmb-wall-lead';leadTile.innerHTML=`<div class="vmb-cover">${scene}</div><h3>${escape(title)}</h3><small>${isSample&&!photo?'Sample inspiration':'Project reference'} · design direction</small>`;wall.append(leadTile);}
 let visible=0;
 sectionCards.forEach(({d,card})=>{
 if(d.group==='inspiration')card.innerHTML='<div style="display:flex;justify-content:space-between"><h3>Inspiration</h3>'+button('Add references',"onclick=\"parent.postMessage({v2:'open-photos'},'*')\"",'vmb-edit')+'</div>'+_mbSectionBoardHtml(_mbItemsForSection(d).shown);
 card.classList.add('vmb-section');card.dataset.section=d.key;const shownCount=card.querySelector('div:first-child>div:first-child>span');if(shownCount&&!['palette','insights'].includes(d.group))shownCount.textContent=card.querySelectorAll('.vmb-item').length+' shown';card.dataset.group=d.group;const match=filter==='all'||filter===d.group||filter==='inspiration'&&!['palette','insights'].includes(d.group);card.hidden=!match;if(match)visible++;
 if(filter==='inspiration'&&d.group!=='inspiration'){card.innerHTML='<h3>'+escape(d.label)+'</h3>'+_mbInspirationStripHtml(d.key);body.append(card);return;}
 const query=card.querySelector('input[oninput*=mbSetQuery]')?.parentElement;if(query){const tools=document.createElement('details');tools.className='vmb-query vmb-edit';tools.innerHTML='<summary>Ask for a suggestion</summary>';query.before(tools);tools.append(query);}
 // Original controls, suggestions and inspiration strips remain attached to their section.
 if(MB_VIEW.disp==='wall'&&!['palette','insights'].includes(d.group)){
  card.querySelectorAll('.vmb-item').forEach(tile=>{if(match&&!seen.has(tile.dataset.vmbItem)){seen.add(tile.dataset.vmbItem);wall.append(tile)}else tile.remove()});
  card.querySelectorAll('.vmb-items').forEach(e=>e.remove());
  const detail=document.createElement('details');detail.className='vmb-section-tools';detail.hidden=!match;detail.innerHTML=`<summary>${escape(d.label)} · add, suggest & organize</summary>`;detail.append(card);body.append(detail);
 }else if(filter==='all'&&d.group==='palette'){card.hidden=true;body.append(card);}else body.append(card);
 });
 if(MB_VIEW.disp==='wall'){body.prepend(wall);const omitted=new Map();selected.filter(d=>filter==='all'||filter===d.group).forEach(d=>{try{_mbItemsForSection(d).shown.filter(x=>!x.img?.trim()).forEach(x=>omitted.set(x.kind+':'+x.pid,x))}catch{}});if(omitted.size){const note=document.createElement('p');note.className='vmb-missing';note.textContent=omitted.size+' selections excluded due to no image. They remain in your project and estimate.';body.prepend(note);}}
 if(!visible||MB_VIEW.disp==='wall'&&!wall.children.length&&filter!=='palette'&&filter!=='insights'&&filter!=='inspiration'){const empty=document.createElement('p');empty.className='vmb-empty';empty.textContent='No visible selections in this category. Add a section or search a library to begin.';body.prepend(empty)}
 layout.append(body,side);layout.classList.toggle('vmb-no-side',!Array.from(side.children).some(x=>!x.hidden));frame.append(layout);
 const inline=document.createElement('section');inline.id='vmb-add-sections';inline.className='vmb-inline-builder vmb-edit';
 const addable=defs.filter(d=>!mb.sections.includes(d.key));
 inline.innerHTML='<h3>＋ Build out your board</h3><p>Add a section, or add an item from a library to create its section automatically.</p><div class="vmb-inline-choices">'+addable.slice(0,8).map(d=>button('＋ '+escape(d.label),`data-vmb-section="${escape(d.key)}"`)).join('')+'</div>'+button('Arrange sections & supporting cards','onclick="v2MoodboardBuilder(true)"');
 frame.append(inline);
 if(builderOpen&&!present){const planner=document.createElement('aside');planner.className='vmb-builder vmb-edit';planner.setAttribute('aria-label','Moodboard builder');planner.innerHTML=builderHTML(mb,defs);const wrap=document.createElement('div');wrap.className='vmb-build-layout';layout.before(wrap);wrap.append(planner,layout);}
 const note=document.createElement('p');note.className='vmb-footnote';note.textContent='Hide changes the board presentation only; project specifications stay selected. Sections, card settings and view choice stay with this project. V2 project edits are not yet synced to Cloudflare.';frame.append(note);host.replaceChildren(frame);
 frame.querySelectorAll('[data-vmb-group]').forEach(d=>d.ontoggle=()=>{if(d.open)builderGroups.add(d.dataset.vmbGroup);else builderGroups.delete(d.dataset.vmbGroup)});
 frame.querySelectorAll('[data-vmb-section]').forEach(b=>b.onclick=()=>v2MoodboardSection(b.dataset.vmbSection));
 frame.querySelectorAll('[data-vmb-move]').forEach(b=>b.onclick=()=>v2MoodboardMove(b.dataset.vmbMove,Number(b.dataset.delta)));
 frame.querySelectorAll('[data-vmb-support]').forEach(b=>b.onchange=()=>{const mb=_mbEnsure();mb.supportCards={...mb.supportCards,[b.dataset.vmbSupport]:b.checked};_bidSchedule();renderMoodBoard()});
 // Replace fixed light fills on legacy controls, not photos, swatches or insight graphics.
 view.querySelectorAll('button,input:not([type=color]):not([type=checkbox]),select,textarea').forEach(el=>{if(el.closest('.vmb-item'))return;el.classList.add('vmb-control')});
};

function builderHTML(mb,defs){
 const sections=mb.sections.map(k=>defs.find(d=>d.key===k)).filter(Boolean);
 const family=[['plant','Plants'],['materials','Materials'],['furnishings','Furniture'],['products','Products'],['siteelements','Site elements'],['inspiration','Inspiration'],['palette','Color palette'],['insights','Insights']];
 return `<header><div><span class="vmb-eyebrow">Board builder</span><h2>Make room for your ideas.</h2></div>${button('✕','onclick="v2MoodboardBuilder(false)" aria-label="Close builder"')}</header><p>Choose sections below. Removing a section keeps its project selections.</p><div class="vmb-build-choices">${family.map(([group,label])=>{const rows=defs.filter(d=>d.group===group);const choices=rows.map(d=>button(`<span>${escape(d.label)}</span><b>${mb.sections.includes(d.key)?'✓':'＋'}</b>`,`data-vmb-section="${escape(d.key)}" aria-pressed="${mb.sections.includes(d.key)}"`,'vmb-section-choice')).join('');return rows.length>1?`<details data-vmb-group="${group}" ${builderGroups.has(group)?'open':''}><summary>${label}<small>${rows.filter(d=>mb.sections.includes(d.key)).length} selected</small></summary>${choices}</details>`:choices}).join('')}</div><section class="vmb-build-order"><h3>Section order</h3>${sections.length?sections.map((d,i)=>`<div><span>${escape(d.label)}</span>${button('↑',`data-vmb-move="${escape(d.key)}" data-delta="-1" aria-label="Move ${escape(d.label)} up" ${i===0?'disabled':''}`)}${button('↓',`data-vmb-move="${escape(d.key)}" data-delta="1" aria-label="Move ${escape(d.label)} down" ${i===sections.length-1?'disabled':''}`)}</div>`).join(''):'<p>Choose your first section above.</p>'}</section><section class="vmb-build-support"><h3>Supporting cards</h3>${[['palette','Color palette'],['connection','Project snapshot'],['brief','Design intention']].map(([key,label])=>`<label><input type="checkbox" data-vmb-support="${key}" ${mb.supportCards?.[key]===false?'':'checked'}> ${label}</label>`).join('')}</section><p class="vmb-builder-hint">All three views use this same board. Items without images remain in the project.</p>`;
}
window.v2MoodboardBuilder=function(open){if(window.v2ExperienceRole==='customer')return;builderOpen=typeof open==='boolean'?open:!builderOpen;renderMoodBoard();if(builderOpen)document.querySelector('.vmb-builder')?.scrollIntoView({behavior:'smooth',block:'nearest'})};
window.v2MoodboardSection=function(key){if(window.v2ExperienceRole==='customer'||!_mbSectionDefs().some(d=>d.key===key))return;const mb=_mbEnsure();mb._seeded=true;mb.sections=mb.sections.includes(key)?mb.sections.filter(k=>k!==key):[...mb.sections,key];filter='all';_bidSchedule();renderMoodBoard()};
window.v2MoodboardMove=function(key,delta){if(window.v2ExperienceRole==='customer'||![-1,1].includes(delta))return;const mb=_mbEnsure(),i=mb.sections.indexOf(key),j=i+delta;if(i<0||j<0||j>=mb.sections.length)return;[mb.sections[i],mb.sections[j]]=[mb.sections[j],mb.sections[i]];_bidSchedule();renderMoodBoard()};

window.v2MoodboardPalette=function(){if(!_mbEnsure().sections.includes('palette'))mbAddSection('palette');filter='palette';renderMoodBoard()};
window.v2MoodboardDirection=function(){let d=document.getElementById('vmb-direction');if(!d){d=document.createElement('dialog');d.id='vmb-direction';d.className='vmb-dialog';document.body.append(d)}const mb=_mbEnsure();d.innerHTML=`<form method="dialog"><header><h2>Design direction</h2><button type="button" class="vmb-button" data-cancel>Close</button></header><label>Headline<input name="title" maxlength="120" value="${escape(mb.directionTitle||'')}" placeholder="Quiet geometry. Warm materials."></label><label>Design story<textarea name="notes" rows="4" maxlength="1000">${escape(mb.directionNotes||'')}</textarea></label><button type="button" class="vmb-button" data-save>Save direction</button></form>`;d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-save]').onclick=()=>{const data=new FormData(d.querySelector('form')),current=_mbEnsure();current.directionTitle=data.get('title').trim();current.directionNotes=data.get('notes').trim();_bidSchedule();d.close();renderMoodBoard()};d.showModal()};

const originalPlantAdd=mbAddExistingPlant;
mbAddExistingPlant=function(kind,pid){
 const exists=_mbGather().plants.some(x=>x.kind===kind&&x.p.id===pid);
 if(!exists)originalPlantAdd(kind,pid);
 const mb=_mbEnsure();if(!mb.sections.includes('plants'))mb.sections.push('plants');mb.hidden=mb.hidden.filter(k=>k!==_mbHiddenKey('plants',pid));try{_bidSchedule()}catch{}renderMoodBoard();
};
const originalGoodsAdd=mbAddExistingGoods;
mbAddExistingGoods=async function(book,gid){
 if(!specIsOn(gid))await originalGoodsAdd(book,gid);
 if(!specIsOn(gid))return;
 const mb=_mbEnsure(),g=specGoods(book,gid),type=book==='materials'?'materials':goodsLibOf(g)==='prod'?'products':'furnishings';
 const section=book==='materials'?'materials':g.cat;if(!mb.sections.includes(section))mb.sections.push(section);
 mb.hidden=mb.hidden.filter(k=>k!==_mbHiddenKey(type,gid));try{_bidSchedule()}catch{}renderMoodBoard();
};
window.addEventListener('message',async e=>{
 if(e.source!==parent||e.data?.v2cmd!=='moodboard-add')return;
 if(window.v2ExperienceRole==='customer')return;
 const {library,key}=e.data;
 try{
  if(library==='plantbook'){const [kind,...id]=String(key).split(':');if(!plantDbFind(kind,id.join(':')))throw Error('Plant record not found');mbAddExistingPlant(kind,id.join(':'));}
  else if(['materials','furnishings'].includes(library)){const id=String(key).replace(/^[^:]+:/,'');if(!specGoods(library,id))throw Error('Library record not found');await mbAddExistingGoods(library,id);}
  else if(library==='colorlibrary'){const id=String(key).replace(/^[^:]+:/,'');if(!colorPaletteFind(id))throw Error('Palette not found');const mb=_mbEnsure();if(!mb.sections.includes('palette'))mb.sections.push('palette');mbSetThemePalette(id);}
 }catch(err){parent.postMessage({v2:'error',message:err.message},'*')}
});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&present)v2MoodboardPresent()});
})();
