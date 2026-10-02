// Versioned demo content. No real staff ledger is seeded or changed.
(()=>{
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const add=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const diff=(a,b)=>Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);
const known=/^(Brief & site agreed|Concept & budget approved|Design development delivery|Construction documents ready|Contractor handoff|Confirm material palette|Finish planting plan|Coordinate lighting|Update the estimate|Assemble the review set|Concept direction|Planting plan|Material palette|Lighting plan|Review set)$/i;
function roll(project,today=iso(new Date())){
 if(!project.sampleVersion)return false;const time=project.sampleTime;
 const oldAnchor=project.demoCalendar?.date||time?.entries?.find(x=>x.id==='demo-time-7')?.date||today;
 const delta=diff(today,oldAnchor);let changed=false;
 const move=(row,key,eligible)=>{if(!row[key])return;let m=row.demoDates?.[key];if(!m&&eligible){row.demoDates||={};m=row.demoDates[key]={last:row[key],fixed:false};changed=true}if(!m)return;if(row[key]!==m.last&&!m.fixed){m.fixed=true;changed=true}if(delta&&!m.fixed){row[key]=add(row[key].slice(0,10),delta)+(row[key].length>10?row[key].slice(10):'');m.last=row[key];changed=true}};
 for(const k of ['milestones','tasks','deliverables','approvals'])for(const r of project[k]||[]) {const eligible=r.demo||String(r.id||'').startsWith('demo-')||known.test(r.title||'');move(r,k==='milestones'?'date':'dueDate',eligible);move(r,'proposalDate',eligible)}
 for(const e of time?.entries||[])move(e,'date',e.id.startsWith('demo-time-'));
 for(const l of Object.values(time?.ledgers||{})){for(const e of l.entries)move(e,'date',e.id.startsWith('demo-time-'));if(delta)for(const [key,value] of Object.entries(l.weeks||{}))if(value.demo&&value.date){value.date=add(value.date,delta);const d=new Date(value.date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);const newKey=iso(d);if(newKey!==key&&!l.weeks[newKey]){delete l.weeks[key];l.weeks[newKey]=value}}}
 for(const u of project.updates||[])move(u,'date',/^(Material palette refined|Outdoor lounge selection added|Concept reference updated|Estimate ready for review)$/.test(u.title));
 if(project.demoCalendar?.date!==today){project.demoCalendar={...project.demoCalendar,date:today,enabled:true};changed=true}
 const m=(project.milestones||[]).filter(x=>x.state!=='Complete').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'))[0];if(m&&project.milestone?.id===m.id&&project.milestone.date!==m.date){project.milestone={...m};changed=true}
 return changed;
}
function seed(project){
 if(!project.sampleVersion)return false;let changed=roll(project);const date=iso(new Date());
 project.sampleTime||={version:0,illustrative:true,entries:[],budgetHours:120,fee:project.fee?.agreed||36000,rates:{Alex:65,Maya:60,'Studio principal':100}};
 const t=project.sampleTime;if(t.version>=3)return sync(project)||changed;if(t.fee===18000&&project.fee?.agreed)t.fee=project.fee.agreed;
 const addEntry=(id,owner,type,pattern,hours,offset,note,billable=true)=>{if(t.entries.some(e=>e.id===id))return;const key=type==='task'?'tasks':type==='deliverable'?'deliverables':'milestones',r=(project[key]||[]).find(x=>pattern.test(x.title));if(!r)return;t.entries.push({id,owner,type,workId:r.id,title:r.title,milestoneId:type==='milestone'?r.id:r.milestoneId,date:add(date,offset),hours,note,billable,demoDates:{date:{last:add(date,offset),fixed:false}}})};
 const rows=[
 ['1','Alex','task',/survey/i,2,-14,'Measured site dimensions and reviewed existing conditions.'],
 ['2','Maya','task',/priorities/i,1.5,-13,'Prepared client priorities for the brief.'],
 ['3','Alex','deliverable',/approved project brief/i,2,-12,'Assembled the agreed project brief.'],
 ['4','Maya','deliverable',/concept plan/i,5,-7,'Developed concept options and preliminary estimate.'],
 ['5','Alex','task',/material palette/i,1,-2,'Reviewed paving and pool coping options.'],
 ['6','Maya','task',/planting plan/i,3.5,-1,'Refined planting layout and quantities.'],
 ['7','Maya','task',/lighting/i,2,0,'Coordinated fixture locations with the planting plan.'],
 ['8','Alex','task',/estimate/i,2.5,0,'Updated quantities and preliminary costs.'],
 ['9','Studio principal','milestone',/design development/i,1,0,'Reviewed the design and upcoming client delivery.'],
 ['10','Alex','deliverable',/concept plan/i,2.75,-4,'Compared the concept estimate to the agreed scope.'],
 ['11','Alex','task',/material palette/i,1.5,-3,'Compared durable paving finishes.'],
 ['12','Alex','task',/estimate/i,2,-1,'Checked supplier allowances and quantity takeoffs.'],
 ['13','Alex','task',/material palette/i,.75,0,'Client call about the stone and coping selection.'],
 ['14','Maya','task',/planting plan/i,2,-3,'Reviewed shade, screening and seasonal planting.'],
 ['15','Maya','deliverable',/review set/i,1.5,0,'Prepared presentation sheets for internal review.'],
 ['16','Studio principal','milestone',/concept.*approved/i,1,-7,'Signed off the concept direction and budget.'],
 ['17','Alex','milestone',/design development/i,.5,0,'Internal coordination and team planning.',false]
 ];for(const args of rows)addEntry('demo-time-'+args[0],...args.slice(1));
 // Additions are applied once to already-explored demo ledgers without replacing edited entries.
 if(t.ledgers)for(const [person,l] of Object.entries(t.ledgers))for(const e of t.entries.filter(x=>x.owner===person))if(!l.entries.some(x=>x.id===e.id))l.entries.push({...e,projectId:l.entries[0]?.projectId||window.v2Cloud?.projectId,projectName:'Sample — San Marino',workType:e.type,workTitle:e.title,billable:e.billable!==false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),illustrative:true});
 t.allowances=['tasks','deliverables','milestones'].flatMap(k=>(project[k]||[]).map(x=>{const used=t.entries.filter(e=>e.workId===x.id).reduce((n,e)=>n+e.hours,0);return {workId:x.id,type:k.slice(0,-1),title:x.title,used,hours:Math.max(k==='milestones'?3:k==='deliverables'?10:6,Math.ceil(used)+2)}}));
 t.version=3;sync(project);t.note='Fictional demonstration records. Editable in the normal timesheet screens; separate from actual staff accounting.';
 return true;
}
function sync(project){const t=project?.sampleTime;if(!t)return false;const rows=t.ledgers?Object.values(t.ledgers).flatMap(l=>l.entries.filter(e=>!e.voided&&e.workType!=='studio')):t.entries;const totals={Discovery:0,Concept:0,Development:0,Documentation:0,Handoff:0};for(const e of rows){const m=(project.milestones||[]).find(m=>m.id===e.milestoneId),name=m?.title||'';const k=/brief|site/i.test(name)?'Discovery':/concept/i.test(name)?'Concept':/document/i.test(name)?'Documentation':/handoff/i.test(name)?'Handoff':'Development';totals[k]+=e.hours}const hours=Object.entries(totals).map(([phase,logged])=>({phase,logged,planned:{Discovery:20,Concept:35,Development:40,Documentation:20,Handoff:5}[phase]}));const current=JSON.stringify(project.hours),next=JSON.stringify(hours),original=JSON.stringify([{phase:'Discovery',logged:18,planned:20},{phase:'Concept',logged:40,planned:48},{phase:'Development',logged:34,planned:60}]);if(!project.hours||current===original||current===t.homeHoursLast){if(current!==next){project.hours=hours;t.homeHoursLast=next;return true}t.homeHoursLast=next}return false}
window.v2SampleTime={seed,roll,sync};
})();
