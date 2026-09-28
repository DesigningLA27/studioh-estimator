/* Remove decorative emoji from action labels without replacing buttons or handlers. */
function v2CleanButtonIcons(){
 if(window.__v2ButtonCleanup)return;window.__v2ButtonCleanup=true;
 const emoji=/[\u{1F300}-\u{1FAFF}\u2600\u2601\u2699\u26A0\u2728\u2705\u274C][\uFE0E\uFE0F\u200D]*/gu;
 const names={'🔍':'Search','🔎':'Search','✨':'AI suggestions','🗑':'Delete','📷':'Add photo','🖼':'Images','💾':'Save','🖨':'Print','☁':'Cloud','⚙':'Settings','⚠':'Warning','✅':'Done','❌':'Close','💡':'Ideas','🎨':'Palette','📄':'Document','🔗':'Link','📋':'Checklist','📍':'Location','🌿':'Plants','🔥':'Fire safety','🛰':'Satellite','☀':'Sun','🌡':'Temperature','🎲':'Shuffle','🔧':'Tools','🩺':'Check images'};
 const clean=button=>{if(button.closest('[data-keep-icon-examples]'))return;const walker=document.createTreeWalker(button,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('svg,script,style,textarea')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const texts=[];let n;while(n=walker.nextNode())texts.push(n);const removed=[];for(const node of texts){const before=node.nodeValue;const after=before.replace(emoji,g=>{removed.push(g);return ''});if(after!==before)node.nodeValue=after.replace(/^[\s\uFE0F]+/,'').replace(/[\uFE0F]+$/,'')}
 if(removed.length&&!button.textContent.trim()&&!button.querySelector('svg,img')){const label=button.getAttribute('aria-label')||button.title||names[removed[0].replace(/[\uFE0E\uFE0F]/g,'')]||'Open';button.append(document.createTextNode(label));button.setAttribute('aria-label',label)}
 };
 const scan=root=>{if(root.nodeType===3){const b=root.parentElement?.closest('button,[role=button]');if(b)clean(b);return}if(root.nodeType!==1)return;const b=root.closest('button,[role=button]');if(b)clean(b);root.querySelectorAll('button,[role=button]').forEach(clean)};
 scan(document.body);let queue=new Set(),scheduled=false;const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')queue.add(r.target);else for(const n of r.addedNodes)queue.add(n)}if(!scheduled&&queue.size){scheduled=true;queueMicrotask(()=>{scheduled=false;const nodes=queue;queue=new Set();for(const n of nodes)if(n.isConnected)scan(n)})}});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.body)v2CleanButtonIcons();else document.addEventListener('DOMContentLoaded',v2CleanButtonIcons,{once:true});
