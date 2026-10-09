import {allocateDiscount} from './package-discounts.mjs';
import {validateBook,priceFromBook,suggestedAllowance,autoPhaseFees,discounts} from './fee-book.mjs';
export const packageKey=p=>p.id||p.name;
export function packageContext(book,mode,group,budget){
 if(mode==='bands'){const index=book.caps.findIndex(cap=>Number.isFinite(budget)&&budget>0&&budget<=cap);if(index<0)throw Error('Enter a construction budget covered by your fee ranges.');return {key:'range:'+book.caps[index],label:'$'+(index?book.caps[index-1]:0).toLocaleString()+'–$'+book.caps[index].toLocaleString(),index};}
 return {key:mode==='groups'?'group:'+group:'fixed',label:mode==='groups'?book.fixedGroups.find(g=>g.id===group)?.name||'Pricing group':'Fixed fees'};
}
export function quotePackage(book,key,{mode='fixed',group='standard',budget,overrides={}}={}){
 const p=book.packages.find(p=>packageKey(p)===key);if(!p)throw Error('Choose a saved package.');const context=packageContext(book,mode,group,budget);
 const rows=p.ids.map(id=>{const s=book.services.find(s=>s.id===id);if(!s)throw Error('A package service is missing. Edit this package.');const base=priceFromBook(book,id,budget,mode==='bands',mode==='groups'?group:'standard');const value={...base,...p.prices?.[context.key]?.[id],...overrides[id]},plan=suggestedAllowance(book,value.fee);const cost=Number.isFinite(value.cost)?value.cost:plan.cost;return {id,name:s.name,phase:s.phase,fee:value.fee,cost,hours:Number.isFinite(value.hours)?value.hours:Number.isFinite(cost)&&plan.average?Math.floor(cost/plan.average*100)/100:'',average:plan.average};});
 const complete=rows.length>=2&&rows.every(r=>Number.isFinite(r.fee)&&r.fee>=0);const gross=complete?Math.round(rows.reduce((n,r)=>n+r.fee,0)*100)/100:null,discount=complete?allocateDiscount(p,context.key,rows.map(r=>({...r,phaseName:r.phase}))).amount:null,cost=rows.every(r=>Number.isFinite(r.cost))?Math.round(rows.reduce((n,r)=>n+r.cost,0)*100)/100:null,hours=rows.every(r=>Number.isFinite(r.hours))?Math.round(rows.reduce((n,r)=>n+r.hours,0)*100)/100:null;
 return {package:p,context,rows,complete,gross,discount,net:complete?Math.round((gross-discount)*100)/100:null,cost,hours,multiplier:complete&&cost>0?(gross-discount)/cost:null};
}
export function addPackage(agreement,book,key,options){
 validateBook(book);
 if(agreement.basis==='Percentage of construction budget'||agreement.pricing==='Hourly')throw Error('Choose fixed service fees or budget-range pricing before adding a design package.');
 if(!agreement.autoPhaseFees&&agreement.basis==='Fees by phase'){
  const ds=discounts(agreement);
  for(const [n,p] of agreement.phases.entries())if(p.method==='Fixed fee'&&Number.isFinite(p.fee)){
   const rows=agreement.items.filter(i=>i.on&&!i.optional&&i.phase===n),sum=rows.reduce((v,i)=>v+(Number.isFinite(i.fee)?i.fee:0)-(ds.find(d=>d.ids.includes(i.id))?.allocations[i.id]||0),0);
   if(rows.some(i=>!Number.isFinite(i.fee))||Math.abs(sum-p.fee)>.01)throw Error('Review '+p.name+' first: its manual phase fee differs from its deliverable prices. Set service prices and enable calculated phase fees before adding a package.');
  }
 }
 const q=quotePackage(book,key,options);if(!q.complete)throw Error('Set a design fee for every package service first.');
 // Work on a copy: a missing rate or hourly-phase conflict must not partially change a draft.
 const a=structuredClone(agreement),oldActive=a.activePackageIds??discounts(a).map(p=>p.key);
 for(const row of q.rows){let phase=a.phases.findIndex(p=>p.name===row.phase);if(phase<0){a.phases.push({id:crypto.randomUUID(),name:row.phase||'Package services',method:'Fixed fee',fee:'',duration:'',unit:'weeks',range:false,end:'',trigger:'Before commencement',net:15});phase=a.phases.length-1;}if(a.phases[phase].method==='Hourly')throw Error('Move '+row.name+' to a fixed-fee phase before adding this package.');
 let item=a.items.find(i=>(i.catalogueId||i.id)===row.id);if(!item){item={id:row.id,catalogueId:row.id,duration:'',unit:'weeks',range:false,end:'',trigger:'With phase invoice',net:15};a.items.push(item)}Object.assign(item,{name:row.name,on:true,optional:false,phase,group:q.package.name,fee:row.fee,cost:row.cost,hours:row.hours,fromFeeBook:false});}
 if(q.package.includeObservation&&!a.phases.some(p=>/observation/i.test(p.name)))a.phases.push({id:crypto.randomUUID(),name:'Construction Observation Phase',method:'Hourly',fee:'',duration:'',unit:'weeks',range:false,end:'',trigger:'Monthly',net:15});
 a.feeBook=structuredClone(book);if(options.mode==='bands')a.budget=options.budget;a.activePackageIds=[...oldActive.filter(k=>k!==key&&book.packages.some(p=>packageKey(p)===k&&!p.ids.some(id=>q.package.ids.includes(id)))),key];a.autoPhaseFees=true;a.basis='Fees by phase';a.pricing='Combination';a.feeMethod=options.mode==='bands'?'Fee by construction budget band':'Fixed design fee';if(options.mode!=='bands')a.fixedGroup=options.mode==='groups'?options.group:'standard';autoPhaseFees(a);return a;
}
