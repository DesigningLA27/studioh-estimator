import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={document:{addEventListener(){}},window:{addEventListener(){}},sessionStorage:{getItem(){return null}},console};
vm.createContext(context);vm.runInContext(fs.readFileSync('v2/src/project-home.js','utf8'),context);
const project={phase:'cd',phases:[{id:'pre',t:'Programming'},{id:'dd',t:'Development',applicable:false},{id:'cd',t:'Documents'}],steps:[{id:'base',ph:'pre',kind:'deliverable',t:'Base plan',sub:[{id:'trace',done:true},{id:'excluded',applicable:false,done:false}]},{id:'skip',ph:'dd',kind:'deliverable',t:'Out of scope'},{id:'layout',ph:'cd',kind:'deliverable',t:'Layout',sub:[{id:'dimension',done:true}]},{id:'planting',ph:'cd',kind:'deliverable',t:'Planting',sub:[{id:'palette',done:false},{id:'zones',sub:[{id:'zone',done:true}]}]},{id:'review',ph:'cd',kind:'task',t:'Internal review',done:false},{id:'city',ph:'cd',kind:'task',track:'permitting',done:false},{id:'received',ph:'cd',kind:'inbound',status:'requested'}]};
const data=context.window.v2HomeJourney.journeyData(project);
assert.deepEqual(Array.from(data.nodes,n=>n.id),['base','layout','planting','review']);
assert.equal(data.nodes[data.active].id,'planting');assert.equal(data.nodes[0].total,1);assert.equal(data.nodes[2].total,2);assert.equal(data.nodes[2].done,1);assert.equal(data.nodes[3].total,1);
assert.equal(context.window.v2HomeJourney.journeyData({phases:[],steps:[]}).nodes.length,0);
assert.equal(context.window.v2HomeJourney.journeyData({phase:'only',phases:[{id:'only',t:'Only'}],steps:[{id:'work',ph:'only',kind:'deliverable',t:'Only deliverable',sub:[{done:false}]}]}).active,0);
console.log('PASS: scope filtering, recursive task totals, independent work, inbound/permit exclusion, current deliverable, empty and single-node journeys');

const phases=context.window.v2HomeJourney.journeyData(project,"phases");assert.equal(phases.nodes.length,2);assert.equal(phases.nodes[phases.active].phase,"cd");assert.equal(phases.nodes[1].total,4);
