export const known=x=>typeof x==='number'&&Number.isFinite(x);
export const sum=(rows,key)=>rows.reduce((s,r)=>s+(known(r[key])?r[key]:0),0);
export function calculate(state,entries=[],rates={}){
 const e=entries.filter(x=>!x.voided),hours=sum(e,'hours');let cost=0,missing=0;for(const row of e){const rate=known(row.costRate)?row.costRate:rates[row.user];if(known(rate))cost+=row.hours*rate;else missing+=row.hours}
 const outside=sum(state.outsideCosts,'amount'),actual=missing?null:cost+outside;
 const approved=state.changes.filter(c=>c.state==='Approved'&&!c.includedInSigned),signed=known(state.signed?.fee)?state.signed.fee:state.sample&&known(state.sampleBaseFee)?state.sampleBaseFee:null,fee=signed===null?null:signed+sum(approved,'fee');
 const forecast=actual!==null&&known(state.remainingLabor)?actual+state.remainingLabor:null;
 const earned=known(state.earnedFee)?state.earnedFee:null,gross=earned!==null&&actual!==null?earned-actual:null;
 const invoiced=sum(state.invoices,'amount'),paid=sum(state.invoices,'paid');
 return {hours,cost,missing,outside,actual,fee,forecast,earned,gross,invoiced,paid,outstanding:invoiced-paid,margin:fee>0&&forecast!==null?(fee-forecast)/fee:null,headroom:known(state.costBudget)&&forecast!==null?state.costBudget-forecast:null,remainingBudget:known(state.costBudget)&&actual!==null?state.costBudget-actual:null,grossHour:hours&&gross!==null?gross/hours:null,netHour:hours&&gross!==null&&known(state.overhead)?(gross-state.overhead)/hours:null,multiplier:actual>0&&earned!==null?earned/actual:null,effectiveRate:hours&&earned!==null?earned/hours:null};
}
export function workTotals(item,entries,rates={}){const rows=entries.filter(e=>e.workId===item.id||e.workTitle===item.name),hours=sum(rows,'hours');let cost=0,missing=0;for(const e of rows){let r=known(e.costRate)?e.costRate:rates[e.user];if(!known(r))missing+=e.hours;else cost+=e.hours*r}return {rows,hours,cost:missing?null:cost,missing}}
