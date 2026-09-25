// Experience previews control navigation; authenticated permissions remain server-owned.
(()=>{
const root=document.getElementById('sh-v2'),key='studioh_v2_experience';
let role=localStorage.getItem(key)||'developer';if(!['developer','designer','customer'].includes(role))role='developer';
const customerPages=new Set(['home','brief','design','client','mood','insights']);
const customerTools=new Set(['clientbrief','photos','insights','moodboard']);
const developerTools=new Set(['algos','settings','pricebook']);
const allowsPage=id=>role==='developer'||(role==='designer'?!['pricebook','roadmap','watch'].includes(id):customerPages.has(id));
const allowsTool=id=>role==='developer'||(role==='designer'?!developerTools.has(id):customerTools.has(id));
const control=document.createElement('div');control.className='experience-switch';control.setAttribute('aria-label','Preview site experience');control.title='Preview an experience. This does not sign in as another user.';
control.innerHTML=['developer','designer','customer'].map(r=>`<button data-experience="${r}" aria-pressed="${r===role}">${r[0].toUpperCase()+r.slice(1)}</button>`).join('');root.querySelector('.themebar').before(control);
function filter(){root.querySelectorAll('.library-preview-thumb img').forEach(img=>{const original=img.dataset.originalIcon||(img.dataset.originalIcon=img.getAttribute('src'));const theme=root.dataset.theme?.toLowerCase();if(!/assets\/(brief|library)-icons\//.test(original))return;const src=['night','dusk'].includes(theme)?original.replace(/\/([^/]+)$/, '/'+theme+'/$1'):original;if(img.getAttribute('src')!==src)img.setAttribute('src',src)});root.querySelectorAll('[data-page]').forEach(b=>{b.hidden=!allowsPage(b.dataset.page)});root.querySelectorAll('[data-tool]').forEach(b=>{const hide=!allowsTool(b.dataset.tool);b.hidden=hide;const card=b.closest('.library-preview-card');if(card)card.hidden=hide});root.querySelectorAll('.library-preview-card [data-page]').forEach(b=>{b.closest('.library-preview-card').hidden=b.hidden});root.querySelectorAll('[data-tab]').forEach(b=>{if(['Calculation rules','Library admin'].includes(b.dataset.tab))b.hidden=role!=='developer'});root.querySelectorAll('[data-image-tools],[data-frame-toggle],[data-catalog-tools]').forEach(b=>b.hidden=role!=='developer');
// The existing Home has illustrative studio fee information; keep that designer-only.
root.querySelectorAll('.w-metrics>div').forEach(el=>{if(el.querySelector('span')?.textContent==='Design fee')el.hidden=role==='customer'});
}
function apply(){root.dataset.experience=role;document.getElementById('v2-export').hidden=role==='customer';control.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.experience===role));if(v2Preview.ready)v2Preview.command({v2cmd:'experience',role});filter()}
control.onclick=e=>{const b=e.target.closest('[data-experience]');if(!b||b.dataset.experience===role)return;role=b.dataset.experience;localStorage.setItem(key,role);apply();v2Workspace.open('home')};
window.v2Experience={get role(){return role},allowsPage,allowsTool};
new MutationObserver(filter).observe(root,{attributes:true,attributeFilter:['data-theme']});
new MutationObserver(filter).observe(document.getElementById('sh-content'),{childList:true,subtree:true});apply();
})();
