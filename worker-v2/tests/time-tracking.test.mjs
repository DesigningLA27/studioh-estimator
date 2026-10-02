import {test} from 'node:test';import assert from 'node:assert/strict';import worker,{hash} from '../src/index.js';import {Bucket} from './storage.test.mjs';import vm from 'node:vm';import fs from 'node:fs';
const env={PROJECTS:new Bucket()};const tokens={admin:'a'.repeat(64),staff:'b'.repeat(64),other:'c'.repeat(64)};
async function call(user,path,data){const r=await worker.fetch(new Request('https://example.test/time/'+path,{method:data?'POST':'GET',headers:{Authorization:'Bearer '+tokens[user]},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()}}
test('time entry: role privacy, project access, conflict protection, submission locks, settings and totals',async()=>{
 for(const user of ['admin','staff','other'])await env.PROJECTS.put('sessions/'+await hash(tokens[user]),JSON.stringify({owner:user==='other'?'other-studio':'studio',user,email:user+'@example.test',name:user,role:user==='staff'?'editor':'admin',expires:Date.now()+60000}));
 await env.PROJECTS.put('accounts/studio/projects/p/state.json','{}',{customMetadata:{name:'Garden'}});await env.PROJECTS.put('access/'+await hash('staff@example.test')+'/p.json',JSON.stringify({active:true,role:'editor'}));
 const entry={revision:null,id:'entry-1',projectId:'p',date:'2026-10-01',hours:2.5,workType:'task',workId:'t1',workTitle:'Proposal',milestoneId:'m1',note:'Private note'};
 assert.equal((await call('staff','entry',entry)).status,200);assert.equal((await call('staff','entry',{...entry,id:'entry-2'})).status,409);
 assert.equal((await call('staff','team')).status,403);assert.equal((await call('staff','settings')).status,403);assert.equal((await call('other','project?id=p')).status,403);
 const totals=await call('staff','project?id=p');assert.equal(totals.data.total,2.5);assert.equal(JSON.stringify(totals).includes('Private note'),false);assert.equal(totals.data.finance,undefined);assert.deepEqual(totals.data.work,[]);
 let mine=(await call('staff','me')).data;assert.equal((await call('staff','entry',{...entry,id:'bad',revision:mine.revision,projectId:'not-owned'})).status,403);
 assert.equal((await call('staff','entry',{...entry,id:'bad',revision:mine.revision,date:'2026-02-30'})).status,400);
 assert.equal((await call('staff','week',{revision:mine.revision,week:'2026-09-28',state:'submitted'})).status,200);mine=(await call('staff','me')).data;
 assert.equal((await call('staff','entry',{...entry,revision:mine.revision,hours:4})).status,409);
 assert.equal((await call('staff','review',{user:'staff',revision:mine.revision,week:'2026-09-28',state:'approved'})).status,403);
 assert.equal((await call('admin','review',{user:'staff',revision:mine.revision,week:'2026-09-28',state:'approved'})).status,200);mine=(await call('staff','me')).data;
 assert.equal((await call('admin','review',{user:'staff',revision:mine.revision,week:'2026-09-28',state:'returned'})).status,200);mine=(await call('staff','me')).data;
 assert.equal((await call('staff','entry',{...entry,revision:mine.revision,hours:3})).status,200);
 assert.equal((await call('admin','settings',{revision:null,enabled:true,visibility:'work',rates:{staff:60},projects:{p:{fee:1000,budgetHours:10}}})).status,200);
 const adminTotals=(await call('admin','project?id=p')).data;assert.equal(adminTotals.finance.laborCost,180);assert.equal(adminTotals.total,3);assert.equal(adminTotals.work[0].hours,3);
 mine=(await call('staff','me')).data;assert.equal((await call('staff','timer/start',{...entry,revision:mine.revision})).status,200);
 let cfg=(await call('admin','settings')).data;assert.equal((await call('admin','settings',{...cfg,enabled:false})).status,409);
 mine=(await call('staff','me')).data;assert.equal((await call('staff','entry',{...entry,id:'timer-entry',revision:mine.revision,timerId:mine.timer.id,hours:1})).status,200);
 cfg=(await call('admin','settings')).data;assert.equal((await call('admin','settings',{...cfg,enabled:false})).status,200);mine=(await call('staff','me')).data;
 assert.equal((await call('staff','entry',{...entry,id:'off',revision:mine.revision})).status,403);assert.equal((await call('staff','me')).data.entries.length,2);
});
test('plain language duration, relative dates, and ambiguous work are reviewable',()=>{const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../../v2/src/time-entry-parser.js',import.meta.url),'utf8'),ctx);const parse=ctx.window.v2TimeParse,work=[{key:'1',title:'Prepare proposal'},{key:'2',title:'Review planting'}];let p=parse('I spent 2.5hrs working on the proposal today',work,'2026-10-01');assert.equal(p.hours,2.5);assert.equal(p.matches[0],'1');assert.equal(p.date,'2026-10-01');p=parse('1 hour 30 minutes planting yesterday',work,'2026-10-01');assert.equal(p.hours,1.5);assert.equal(p.date,'2026-09-30');p=parse('proposal 2 hours',work.concat({key:'3',title:'Check proposal'}),'2026-10-01');assert.equal(p.matches.length,2);assert.equal(p.dateCertain,false)});
test('AI time drafts use bounded context, validate work references, and never save automatically',async()=>{
 const cfg=(await call('admin','settings')).data;await call('admin','settings',{...cfg,enabled:true});let payload;
 env.LEGACY={fetch:async(u,o)=>{payload=JSON.parse(o.body);return Response.json({content:[{type:'text',text:JSON.stringify({hours:2.5,date:'2026-10-01',matches:['t1']})}],stop_reason:'end_turn'})}};
 const draft={projectId:'p',text:'I spent two and a half hours on the proposal today',today:'2026-10-01',work:[{key:'t1',title:'Proposal'}]},before=(await call('staff','me')).data;
 let r=await call('staff','suggest',draft);assert.equal(r.data.ai,true);assert.equal(r.data.hours,2.5);assert.equal(payload.max_tokens,400);assert.match(payload.system,/untrusted/);assert.equal((await call('staff','me')).data.revision,before.revision);
 env.LEGACY={fetch:async()=>Response.json({content:[{type:'text',text:'{"hours":2,"date":"2026-10-01","matches":["invented"]}'}]})};r=await call('staff','suggest',draft);assert.equal(r.data.ai,false);
 assert.equal((await call('other','suggest',draft)).status,403);assert.equal((await call('staff','suggest',{...draft,text:'x'.repeat(1001)})).status,400);
});
test('session API keeps drafts private, requires opt-in, protects budgets, and preserves them when changing settings',async()=>{
 let mine=(await call('staff','me')).data;let cfg=(await call('admin','settings')).data;
 assert.equal((await call('staff','budgets',{revision:cfg.revision,projectId:'p',budgets:{'task:t1':5}})).status,403);
 assert.equal((await call('admin','budgets',{revision:cfg.revision,projectId:'p',budgets:{'task:t1':5}})).status,200);
 cfg=(await call('admin','settings')).data;assert.equal((await call('admin','settings',{...cfg,visibility:'total'})).status,200);
 assert.equal((await call('staff','me')).data.budgets.p['task:t1'],5);assert.deepEqual((await call('other','me')).data.budgets,{});
 const start={revision:mine.revision,projectId:'p',date:'2026-10-01',workType:'task',workId:'t1',workTitle:'Proposal',mode:'countdown'};
 assert.equal((await call('staff','session/start',start)).status,200);mine=(await call('staff','me')).data;assert.equal(mine.timer.mode,'countdown');
 assert.equal((await call('staff','session/switch',{...start,revision:mine.revision,workId:'t2'})).status,400);
 assert.equal((await call('staff','session/preferences',{revision:mine.revision,smart:true,idleMinutes:5,pauseHidden:true})).status,200);mine=(await call('staff','me')).data;
 const oldRev=mine.revision;assert.equal((await call('staff','session/switch',{...start,revision:mine.revision,workId:'t2',mode:'stopwatch'})).status,200);
 assert.equal((await call('staff','session/pause',{revision:oldRev,timerId:mine.timer.id})).status,409);mine=(await call('staff','me')).data;
 assert.equal((await call('staff','session/finish',{revision:mine.revision,timerId:mine.timer.id})).status,200);
 const totals=(await call('staff','project?id=p')).data;assert.equal(totals.drafts,undefined);assert.equal(totals.total,4);assert.equal((await call('staff','team')).status,403);
});
test('studio work stays non-billable, costs are private and rates stay fixed; forecasts replace covered periods',async()=>{
 let cfg=(await call('admin','settings')).data;
 assert.equal((await call('admin','settings',{...cfg,rates:{staff:70},categories:['Administration','Training']})).status,200);
 let mine=(await call('staff','me')).data;
 assert.equal((await call('staff','entry',{revision:mine.revision,id:'studio-entry',projectId:'not-a-project',date:'2026-10-02',hours:2,workType:'studio',workId:'Administration',workTitle:'Fake title',billable:true,costRate:999})).status,200);
 mine=(await call('staff','me')).data;const studio=mine.entries.find(e=>e.id==='studio-entry');assert.equal(studio.projectId,'studio');assert.equal(studio.billable,false);assert.equal(studio.workTitle,'Administration');assert.equal(studio.costRate,undefined);
 assert.equal((await call('staff','entry',{revision:mine.revision,id:'bad-category',date:'2026-10-02',hours:1,workType:'studio',workId:'Unknown'})).status,400);
 assert.equal((await call('staff','entry',{revision:mine.revision,id:'snapshot-entry',projectId:'p',date:'2026-10-02',hours:1,workType:'task',workId:'t1',workTitle:'Proposal'})).status,200);
 cfg=(await call('admin','settings')).data;await call('admin','settings',{...cfg,rates:{staff:90}});
 mine=(await call('staff','me')).data;assert.equal((await call('staff','entry',{...mine.entries.find(e=>e.id==='snapshot-entry'),revision:mine.revision,hours:2,costRate:1})).status,200);
 let team=(await call('admin','team')).data;assert.equal(team.people.find(p=>p.user==='staff').entries.find(e=>e.id==='snapshot-entry').costRate,70);
 assert.equal((await call('staff','project?id=p')).data.total,6);
 cfg=(await call('admin','settings')).data;const forecast={revision:cfg.revision,projectId:'p',values:{costBudget:2000,remainingLabor:200,consultantFees:300,expenses:50,laborSummaries:[{from:'2026-10-01',to:'2026-10-02',amount:500}]}};
 assert.equal((await call('staff','forecast',forecast)).status,403);assert.equal((await call('other','forecast',{...forecast,revision:null})).status,403);
 assert.equal((await call('admin','forecast',forecast)).status,200);assert.equal((await call('admin','forecast',forecast)).status,409);
 let totals=(await call('admin','project?id=p')).data;assert.equal(totals.finance.laborCost,500);assert.equal(totals.finance.coveredHours,6);assert.equal(totals.finance.forecast,1050);assert.equal(totals.finance.complete,true);
 cfg=(await call('admin','settings')).data;assert.equal((await call('admin','forecast',{...forecast,revision:cfg.revision,values:{laborSummaries:[{from:'2026-10-01',to:'2026-10-02',amount:500},{from:'2026-10-02',to:'2026-10-03',amount:20}]}})).status,400);
 assert.equal((await call('admin','forecast',{revision:cfg.revision,projectId:'p',replace:true,values:{costBudget:2000}})).status,200);totals=(await call('admin','project?id=p')).data;assert.equal(totals.finance.forecast,null);assert.equal(totals.finance.complete,false);
});

test('studio admin phrase maps to Administration rather than Studio meetings',()=>{const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../../v2/src/time-entry-parser.js',import.meta.url),'utf8'),ctx);const result=ctx.window.v2TimeParse('I spent 30 minutes on studio admin today',[{key:'admin',title:'Administration'},{key:'meeting',title:'Studio meetings'}],'2026-10-01');assert.equal(result.hours,.5);assert.equal(result.matches.join(','),'admin')});
test('admin AI brief is grounded, access-controlled and honest on provider failure',async()=>{
 let sent;env.LEGACY={fetch:async(u,o)=>{sent=JSON.parse(o.body);return Response.json({content:[{type:'text',text:'Overview: 12 recorded hours.\nBudget: remaining costs need review.'}],stop_reason:'end_turn'})}};
 const data={projectId:'p',context:{hours:12,demo:true}};
 assert.equal((await call('staff','report',data)).status,403);assert.equal((await call('other','report',data)).status,403);
 const r=await call('admin','report',data);assert.equal(r.status,200);assert.equal(r.data.ai,true);assert.match(sent.system,/Never infer productivity/);assert.match(r.data.summary,/12 recorded hours/);
 env.LEGACY={fetch:async()=>new Response('',{status:503})};assert.equal((await call('admin','report',data)).status,503);
});
