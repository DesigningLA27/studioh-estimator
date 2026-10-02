// Single private clock; all transitions and review commits use the ledger's CAS revision.
export const elapsed=(timer,at=Date.now())=>Math.max(0,Number(timer?.elapsedSeconds)||0)+(!timer||timer.paused?0:Math.max(0,(Math.min(at,timer.leaseUntil?Date.parse(timer.leaseUntil):at)-Date.parse(timer.runningSince||timer.startedAt))/1000));
export function settle(timer,at=Date.now()){
 if(!timer)return;const before=Number(timer.elapsedSeconds)||0;let seconds=elapsed(timer,at);if(timer.limitSeconds!=null)seconds=Math.min(seconds,timer.limitSeconds);let left=Math.max(0,seconds-before),start=Date.parse(timer.runningSince||timer.startedAt),offset=Number(timer.offsetMinutes)||0;
 timer.days||={};if(before&&!Object.keys(timer.days).length)timer.days[timer.date]=before;
 while(left>.001){const date=new Date(start-offset*60000).toISOString().slice(0,10),midnight=Date.parse(date+'T00:00:00Z')+86400000+offset*60000,n=Math.min(left,(midnight-start)/1000);if(n<=0)break;timer.days[date]=(timer.days[date]||0)+n;left-=n;start=midnight}
 timer.elapsedSeconds=seconds;timer.runningSince=new Date(at).toISOString();if(timer.limitSeconds!=null&&seconds>=timer.limitSeconds){timer.paused=true;timer.reason='Budget reached'}else if(!timer.paused&&timer.leaseUntil&&Date.parse(timer.leaseUntil)<=at){timer.paused=true;timer.reason='Session inactive'}
}
export async function sessionAction(path,d,ledger,{clean,editWeek,now,budgets}){
 ledger.drafts||=[];ledger.preferences||={smart:false,idleMinutes:5,pauseHidden:true};
 const at=Date.parse(now),timer=ledger.timer;
 const stop=()=>{if(!ledger.timer)return;settle(ledger.timer,at);const t=ledger.timer;for(const [date,seconds] of Object.entries(t.days||{}))if(seconds>.001)ledger.drafts.push({...t,id:crypto.randomUUID(),date,hours:Math.min(seconds/3600,24)});ledger.timer=null};
 const start=async()=>{const e=await clean({...d,hours:1});if(!editWeek(ledger,e.date))throw Error('That week is locked.');const key=e.workType+':'+e.workId,cap=budgets?.[e.projectId]?.[key];let limitSeconds=null;if(d.mode==='countdown'){if(!Number.isFinite(cap)||cap<=0)throw Error('Ask an administrator to set a time allowance for this work.');const used=ledger.entries.concat(ledger.drafts).filter(x=>!x.voided&&x.projectId===e.projectId&&x.workType===e.workType&&x.workId===e.workId).reduce((n,x)=>n+x.hours,0);limitSeconds=Math.max(0,(cap-used)*3600);if(limitSeconds<1)throw Error('This time allowance is used. Choose a stopwatch or ask for a larger allowance.')}ledger.timer={...e,controller:String(d.controller||'').slice(0,100),id:crypto.randomUUID(),startedAt:now,runningSince:now,elapsedSeconds:0,paused:false,mode:d.mode==='countdown'?'countdown':'stopwatch',capSeconds:cap?cap*3600:null,limitSeconds,leaseUntil:new Date(at+90000).toISOString(),offsetMinutes:Math.max(-840,Math.min(840,Number(d.offsetMinutes)||0))}};
 if(path==='preferences'){if(typeof d.smart!=='boolean'||![2,5,10,15].includes(d.idleMinutes)||typeof d.pauseHidden!=='boolean')throw Error('Choose valid tracking preferences.');ledger.preferences={smart:d.smart,idleMinutes:d.idleMinutes,pauseHidden:d.pauseHidden};}
 else if(path==='start'||path==='switch'){
  if(path==='start'&&timer)throw Error('A timer is already active. Finish it or switch work.');
  if(path==='switch'&&!ledger.preferences.smart)throw Error('Turn on smart switching first.');
  if(path==='switch'&&timer?.controller&&timer.controller!==d.controller)throw Error('This timer is active in another tab. Resume it here before switching.');
  if(path==='switch'&&timer?.paused)throw Error('Resume your paused session before switching.');
  if(path==='switch'&&timer?.workType===d.workType&&timer?.workId===d.workId&&timer?.projectId===d.projectId)return;
  stop();try{await start()}catch(e){if(path!=='switch')throw e;return {warning:e.message+' Previous work has stopped; review recorded time.'}}
 }else if(['pause','resume','pulse','finish'].includes(path)){
  if(['pulse','pause'].includes(path)&&timer?.controller&&timer.controller!==d.controller)throw Error('This timer is controlled by another tab.');
  if(!timer||timer.id!==d.timerId)throw Error('The active timer changed. Refresh and try again.');settle(timer,at);
  if(path==='pause'){timer.paused=true;timer.reason=String(d.reason||'Paused').slice(0,80)}
  if(path==='resume'){if(timer.limitSeconds!=null&&timer.elapsedSeconds>=timer.limitSeconds)throw Error('Time allowance reached. Finish and review this session.');timer.controller=String(d.controller||'').slice(0,100);timer.paused=false;timer.reason='';timer.runningSince=now;timer.leaseUntil=new Date(at+90000).toISOString()}
  if(path==='pulse'&&!timer.paused)timer.leaseUntil=new Date(at+90000).toISOString();
  if(path==='finish')stop();
 }else if(path==='review'){
  if(!Array.isArray(d.items)||d.items.length>200)throw Error('Choose the time entries to review.');const seen=new Set();for(const x of d.items){if(seen.has(x.id))throw Error('Duplicate review entry.');seen.add(x.id);const draft=ledger.drafts.find(t=>t.id===x.id);if(!draft)throw Error('This draft has already been reviewed.');if(!x.discard){const e=await clean({...draft,...x,projectId:draft.projectId});if(!editWeek(ledger,e.date))throw Error('That week is locked.');if(ledger.entries.filter(t=>!t.voided&&t.date===e.date).reduce((n,t)=>n+t.hours,0)+e.hours>24)throw Error('Total time cannot exceed 24 hours in a day.');ledger.entries.push({...e,id:draft.id,createdAt:now,updatedAt:now,history:[]})}}ledger.drafts=ledger.drafts.filter(x=>!seen.has(x.id));
 }else throw Error('Unknown timer action.');
}
