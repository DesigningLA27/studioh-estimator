export const cardIds=['pricing','profit','work','target','expenses','breakdown','projects','comparison','business-break-even','full-break-even'];
export const defaultCards=cardIds.slice(0,7);
export const finite=n=>typeof n==='number'&&Number.isFinite(n);
export function validLayout(value){if(!Array.isArray(value)||value.length>cardIds.length||new Set(value).size!==value.length||value.some(id=>!cardIds.includes(id)))throw Error('Choose each dashboard card only once.');return [...value]}
export function monthRange(values,year){const a=[...new Set(values)].filter(m=>Number.isInteger(m)&&m>=1&&m<=12).sort((a,b)=>a-b),names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];let ranges=[];for(let i=0;i<a.length;i++){const start=a[i];while(i+1<a.length&&a[i+1]===a[i]+1)i++;ranges.push(names[start-1]+(a[i]!==start?'–'+names[a[i]-1]:''))}return ranges.length?ranges.join(', ')+' '+year:'No reviewed months'}
export function dashboardFigures(data){
 const o=data.overhead,sameYear=!!o&&o.year===data.plan?.year,ready=sameYear&&o.complete===true;
 const current=ready&&finite(data.multiplier)&&o.direct>0&&o.directBase>0?data.multiplier*o.directBase/o.direct:null;
 const projects=(data.projects||[]).map(p=>{const signed=finite(p.fee),remaining=signed&&finite(p.earned)&&p.earned<=p.fee?Math.max(0,p.fee-p.earned):null;
 const direct=finite(p.forecast)&&finite(p.actual)&&p.forecast>=p.actual?p.forecast-p.actual:null;
 const validStaff=finite(p.remainingStaffCost)&&p.remainingStaffCost>=0&&finite(direct)&&p.remainingStaffCost<=direct+.01;
 const overhead=ready&&p.burden==='Included'&&!p.missing&&validStaff?p.remainingStaffCost*o.allocationRate:null;
 const profit=[remaining,direct,overhead].every(finite)?remaining-direct-overhead:null;
 return {...p,signed,remaining,directRemaining:direct,overheadRemaining:overhead,profitRemaining:profit,remainingMargin:remaining>0&&finite(profit)?profit/remaining:null};});
 const signed=projects.filter(p=>p.signed),sum=k=>signed.length&&signed.every(p=>finite(p[k]))?signed.reduce((n,p)=>n+p[k],0):null;
 const remaining=sum('remaining'),profit=sum('profitRemaining');
 return {o,ready,sameYear,current,projects,signed,remaining,profit,direct:sum('directRemaining'),allocated:sum('overheadRemaining'),fee:sum('fee'),earned:sum('earned'),margin:remaining>0&&finite(profit)?profit/remaining:null,coverage:signed.filter(p=>finite(p.profitRemaining)).length,missingLedgers:data.missingLedgers||0,target:ready?o.multiplier:null,floor:ready?o.floor:null,breakEven:ready?o.breakEven:null};
}
// Fill each row without changing the user's chosen reading order.
export function layoutSpans(ids){const sizes={pricing:7,profit:5,breakdown:7,projects:5,comparison:7};const result={};let row=[],used=0;const finish=()=>{if(!row.length)return;let allocated=0;row.forEach((id,i)=>{const span=i===row.length-1?12-allocated:Math.round((sizes[id]||4)/used*12);result[id]=span;allocated+=span});row=[];used=0};for(const id of ids){const size=sizes[id]||4;if(used+size>12)finish();row.push(id);used+=size;if(used===12)finish()}finish();return result}
