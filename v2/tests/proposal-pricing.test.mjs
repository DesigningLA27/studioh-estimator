import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogue,bandFor,feeFor,validateSelection} from '../assets/financials/pricing.mjs';
test('all 136 fees match the approved source table',()=>{
 const text=readFileSync(new URL('../PROPOSAL-BUILDER.md',import.meta.url),'utf8');
 const rows=text.split('\n').filter(x=>/^\| [^|]+ \| \d+ \|/.test(x)).map(x=>x.split('|').slice(1,-1).map(x=>x.trim())).filter(x=>x.length===9);
 assert.equal(rows.length,17);assert.deepEqual(catalogue.services.map(x=>[x.name,...x.fees]),rows.map(x=>[x[0],...x.slice(1).map(Number)]));
 assert.deepEqual(catalogue.rates.map(x=>x.rate),[295,250,195,100]);
});
test('budget boundaries and missing budgets never silently select a fee',()=>{
 assert.equal(bandFor(175000),3);assert.equal(bandFor(175001),4);assert.equal(bandFor(214000),4);
 for(const v of [null,undefined,'214000',0,-1,NaN,Infinity,750001])assert.equal(bandFor(v),-1);
 assert.equal(feeFor('construction-plan',214000),2695);assert.equal(feeFor('construction-plan',800000),null);
});
test('package dependencies prevent duplicate component charging',()=>{
 const ids=['construction-plan','construction-details','rough-grading-drainage-plan','planting-plan-details-specs','lighting-plan'];
 assert.equal(ids.reduce((s,id)=>s+feeFor(id,214000),0)-feeFor('full-cd-set-lc-1-lg-lp-ll',214000),880);
 assert.ok(validateSelection(['enhanced-concept-cd-upgrade']).length);
 assert.ok(validateSelection(['full-cd-set-lc-1-lg-lp-ll','construction-plan']).length);
 assert.deepEqual(validateSelection(['enhanced-concept-cd-upgrade','enhanced-conceptual-plan']),[]);
});
test('proposal text preserves all 11 source sections verbatim',()=>{
 const text=readFileSync(new URL('../PROPOSAL-BUILDER.md',import.meta.url),'utf8');
 const template=JSON.parse(readFileSync(new URL('../assets/financials/proposal-template.json',import.meta.url),'utf8'));
 assert.equal(template.sections.length,11);
 for(const x of template.sections)assert.ok(text.includes(x.markdown));
 assert.match(template.sections.find(x=>x.id==='K').markdown,/> 24\./);
});
