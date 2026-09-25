/* V2 presentation adapter. Selection, pricing, wizard, palette and library actions
   remain owned by V1. View/filter/presentation are in-memory UI state only. */
(()=>{
'use strict';
const baseRender=renderMoodBoard;
let filter='all',present=false;
const rememberedView=localStorage.getItem('studioh_v2_moodboard_view');if(['grid','editorial','wall'].includes(rememberedView))MB_VIEW.disp=rememberedView;
const applyCatalog=v2ApplyCatalog;
v2ApplyCatalog=function(m){if(m.id==='elements'&&Array.isArray(m.data)){SITE_ELEMENTS=m.data;_elementsPulled=true;}else applyCatalog(m);if(S.view==='moodboard')renderMoodBoard()};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(name,action,cls='')=>`<button type="button" class="vmb-button ${cls}" ${action}>${name}</button>`;
const groups=[['all','All'],['plant','Plants'],['materials','Materials'],['furnishings','Furniture'],['products','Products'],['siteelements','Site elements'],['inspiration','Inspiration'],['palette','Color palette'],['insights','Insights']];
_mbSectionBoardHtml=function(items){
 if(!items.length)return '<p class="vmb-empty">No selections here yet. Search your library to add an item.</p>';
 return `<div class="vmb-items">${items.map(x=>`<article class="vmb-item" data-vmb-item="${escape(x.kind+':'+x.pid)}">${_mbTile(x,MB_VIEW.disp==='wall'?'wall':'card')}</article>`).join('')}</div>`;
};
window.v2MoodboardSetView=function(view){if(!['grid','editorial','wall'].includes(view))return;MB_VIEW.disp=view;localStorage.setItem('studioh_v2_moodboard_view',view);_bidSchedule();renderMoodBoard();document.querySelector(`[data-vmb-view="${view}"]`)?.focus()};
window.v2MoodboardFilter=function(group){filter=group;renderMoodBoard();document.querySelector(`[data-vmb-filter="${group}"]`)?.focus()};
window.v2MoodboardPresent=function(){present=!present;parent.postMessage({v2:'moodboard-presentation',present},'*');document.getElementById('view-moodboard')?.classList.toggle('vmb-present',present);const b=document.querySelector('[data-vmb-present]');if(b){b.textContent=present?'Exit presentation':'Present';b.setAttribute('aria-pressed',String(present))}};
window.v2MoodboardLibrary=function(){
 let dialog=document.getElementById('vmb-library');if(!dialog){dialog=document.createElement('dialog');dialog.id='vmb-library';dialog.className='vmb-dialog';document.body.append(dialog)}
 const defs=_mbSectionDefs().filter(d=>['plant','materials','furnishings','products'].includes(d.group));
 dialog.innerHTML=`<header><h2>Add from your libraries</h2><button type="button" class="vmb-button" data-close aria-label="Close library chooser">✕</button></header><p>Choose a category. Selections use the original project specification and planting tools.</p><div class="vmb-library-choices">${defs.map(d=>button(escape(d.label),`data-library-key="${escape(d.key)}"`)).join('')}</div>`;
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelectorAll('[data-library-key]').forEach(b=>b.onclick=()=>{const d=defs.find(d=>d.key===b.dataset.libraryKey);dialog.close();if(d.group==='plant')mbPlantSearchOpen();else mbGoodsSearchOpen(d.key)});dialog.showModal();
};
window.v2MoodboardRestore=function(){const mb=_mbEnsure();mb.hidden=[];try{_bidSchedule()}catch{}renderMoodBoard()};
renderMoodBoard=function(){
 baseRender();
 const host=document.getElementById('mb-body'),view=document.getElementById('view-moodboard');if(!host||!view)return;
 parent.postMessage({v2:'moodboard-presentation',present},'*');view.classList.add('vmb');view.dataset.boardView=MB_VIEW.disp;view.classList.toggle('vmb-present',present);
 const mb=_mbEnsure(),defs=_mbSectionDefs(),selected=mb.sections.map(k=>defs.find(d=>d.key===k)).filter(Boolean);
 const cards=Array.from(host.children).filter(e=>e.classList.contains('card'));const sectionCards=selected.map((d,i)=>({d,card:cards[i]})).filter(x=>x.card);const addCard=cards[selected.length];
 const oldTop=view.firstElementChild;oldTop.classList.add('vmb-top');oldTop.querySelector('.sct').childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.includes('Mood Board'))n.textContent='Your project, brought together. '});
 const wizardButton=document.getElementById('mb-wiz-togglebtn');if(wizardButton)wizardButton.textContent='Style & goals guide';
 const budget=document.getElementById('mb-budget-slot');let budgetText=budget.firstElementChild?.firstElementChild;budgetText=budgetText?budgetText.cloneNode(true):null;
 budget.replaceChildren();budget.classList.add('vmb-toolbar');
 const toggles=document.createElement('nav');toggles.className='vmb-views';toggles.setAttribute('aria-label','Moodboard view');toggles.innerHTML=[['grid','01 · Studio board'],['editorial','02 · Editorial'],['wall','03 · Visual wall']].map(([id,label])=>button(label,`data-vmb-view="${id}" onclick="v2MoodboardSetView('${id}')" aria-pressed="${MB_VIEW.disp===id}"`,MB_VIEW.disp===id?'selected':'')).join('');budget.append(toggles);
 const actions=document.createElement('div');actions.className='vmb-actions';actions.innerHTML=button(present?'Exit presentation':'Present',`data-vmb-present onclick="v2MoodboardPresent()" aria-pressed="${present}"`)+button('＋ Add from library','onclick="v2MoodboardLibrary()"','vmb-edit primary');budget.append(actions);
 const frame=document.createElement('div');frame.className='vmb-frame';
 const allItems=selected.filter(d=>!['palette','insights'].includes(d.group)).flatMap(d=>{try{return _mbItemsForSection(d).shown}catch{return []}});const lead=allItems.find(x=>x.img&&x.kind!=='elements');
 const hero=document.createElement('section');hero.className='vmb-hero';
 const project=S.pi?.project||S.pi?.client||'Your project';
 hero.innerHTML=`<div><span class="vmb-eyebrow">DESIGN / MOODBOARD</span><h2>${escape(project)}</h2><p>Plants, materials and pieces that belong in this design. Every view stays connected to the same project selections.</p>${button('Edit style & goals','onclick="mbWizardToggle()"','vmb-edit')}</div><div class="vmb-cover">${lead?`<img alt="${escape(lead.label)}" src="${escape(lead.img)}">`:'<div class="vmb-cover-empty"><span>Build your design direction.</span><small>Your first selected library photo will appear here.</small></div>'}</div>`;
 frame.append(hero);
 const tabs=document.createElement('div');tabs.className='vmb-filters';tabs.innerHTML=`<nav aria-label="Moodboard category">${groups.map(([id,label])=>button(label,`data-vmb-filter="${id}" onclick="v2MoodboardFilter('${id}')" aria-pressed="${filter===id}"`,filter===id?'selected':'')).join('')}</nav><div class="vmb-edit">${button('Sections','onclick="document.getElementById(\'vmb-add-sections\').scrollIntoView({behavior:\'smooth\'})"')}${button('Restore hidden ('+mb.hidden.length+')','onclick="v2MoodboardRestore()"')}</div>`;frame.append(tabs);
 const layout=document.createElement('div');layout.className='vmb-layout';const body=document.createElement('div');body.className='vmb-content';const side=document.createElement('aside');side.className='vmb-side';
 if(budgetText){const card=document.createElement('section');card.className='vmb-summary';card.innerHTML='<h3>Project connection</h3>';card.append(budgetText);side.append(card)}
 const wall=document.createElement('div');wall.className='vmb-wall';const seen=new Set();
 let visible=0;
 sectionCards.forEach(({d,card})=>{
 card.classList.add('vmb-section');card.dataset.section=d.key;card.dataset.group=d.group;const match=filter==='all'||filter===d.group||filter==='inspiration'&&!['palette','insights'].includes(d.group);card.hidden=!match;if(match)visible++;
 if(filter==='inspiration'){card.innerHTML='<h3>'+escape(d.label)+'</h3>'+_mbInspirationStripHtml(d.key);body.append(card);return;}
 // Original controls, suggestions and inspiration strips remain attached to their section.
 if(MB_VIEW.disp==='wall'&&!['palette','insights'].includes(d.group)){
  card.querySelectorAll('.vmb-item').forEach(tile=>{if(match&&!seen.has(tile.dataset.vmbItem)){seen.add(tile.dataset.vmbItem);wall.append(tile)}else tile.remove()});
  card.querySelectorAll('.vmb-items').forEach(e=>e.remove());
  const detail=document.createElement('details');detail.className='vmb-section-tools';detail.hidden=!match;detail.innerHTML=`<summary>${escape(d.label)} · add, suggest & organize</summary>`;detail.append(card);body.append(detail);
 }else if(filter==='all'&&['palette','insights'].includes(d.group)&&MB_VIEW.disp!=='editorial')side.append(card);else body.append(card);
 });
 if(MB_VIEW.disp==='wall')body.prepend(wall);
 if(!visible||MB_VIEW.disp==='wall'&&!wall.children.length&&filter!=='palette'&&filter!=='insights'&&filter!=='inspiration'){const empty=document.createElement('p');empty.className='vmb-empty';empty.textContent='No visible selections in this category. Add a section or search a library to begin.';body.prepend(empty)}
 layout.append(body,side);frame.append(layout);
 if(addCard){addCard.id='vmb-add-sections';addCard.classList.add('vmb-edit','vmb-add-sections');frame.append(addCard)}else{const anchor=document.createElement('div');anchor.id='vmb-add-sections';frame.append(anchor)}
 const note=document.createElement('p');note.className='vmb-footnote';note.textContent='Hide changes the board presentation only; project specifications stay selected. Project selections save to Cloudflare. Your view preference saves with this project.';frame.append(note);host.replaceChildren(frame);
 // Replace fixed light fills on legacy controls, not photos, swatches or insight graphics.
 view.querySelectorAll('button,input:not([type=color]),select,textarea').forEach(el=>{if(el.closest('.vmb-item'))return;el.classList.add('vmb-control')});
};

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
