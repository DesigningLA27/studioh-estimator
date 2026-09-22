// Run with the private PROJECT_FIXTURE; external requests are intercepted, no paid renders or writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage({viewport:{width:1280,height:960}});const fixture=JSON.parse(fs.readFileSync(process.env.PROJECT_FIXTURE)).bid;const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async r=>{if(r.request().url().startsWith('http://127.0.0.1:8788'))return r.continue();let b={};try{b=r.request().postDataJSON()||{};}catch{}if(b.type==='genimage'){await new Promise(ok=>setTimeout(ok,400));return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,url:'https://example.test/generated.jpg',usedRef:true,model:'openai/gpt-image-2.5/sunburst/edit'})});}return r.fulfill({status:200,contentType:'application/json',body:'{}'});});
await page.goto('http://127.0.0.1:8788');await page.waitForTimeout(1800);
await page.evaluate(()=>{localStorage.setItem('studioh_admin_key','test-only');_adminKey=()=> 'test-only';plantRefsOn=()=>false;});
for(const kind of ['install','mature','custom','refine','switch']){
 await page.evaluate(({fixture,kind})=>{document.getElementById('_ask')?.remove();document.getElementById('rp-modal')?.remove();document.getElementById('rf-modal')?.remove();document.getElementById('palette-render-progress')?.remove();restoreBid(fixture);CLOUD_BID_ID='client-project';CLOUD_BID_NAME='Garibay Residence';
 const z=ensurePlanting().zones.find(x=>x.id==='zv2pxx');window.zoneId=z.id;const d=document.createElement('div');d.id=kind==='refine'?'rf-modal':'rp-modal';const row=z.shrubRows[0];d.innerHTML='<div id="rp-status"></div><div id="rp-custom-status"></div><div id="rf-status"></div><input id="rf-text" value="Add planting"><input class="rp-cust-pick" type="checkbox" checked value="shrub:'+row.pid+'"><button class="rp-gen rf-go">Generate</button>';document.body.appendChild(d);
 _uploadUrlToR2=async()=>{_phaseRestore(_phaseCapture());return {ok:true,url:'https://example.test/saved.jpg'};};_imgLoads=async()=>true;window.startCount=_zoneRenders(z.id).length;window.previousPlanting=S.planting;
 window.renderTask=kind==='custom'?_rpCustomGenerate(z.id):kind==='refine'?_refineGo(z.id,0):_rpGenerate(z.id,kind==='mature'?'mature':'install');
 // The real phase refresh clones planting data while the request is in flight.
 _phaseRestore(_phaseCapture());window.oldGuardWouldFail=S.planting!==window.previousPlanting;
 if(kind==='switch'){restoreBid(fixture);CLOUD_BID_ID='different-project';}
 },{fixture,kind});
 assert.equal(await page.evaluate(()=>window.oldGuardWouldFail),true);
 await page.evaluate(()=>window.renderTask);
 if(kind==='switch'){assert.match(await page.locator('#palette-render-progress [data-message]').textContent(),/project or design phase changed/);assert.equal(await page.evaluate(()=>_zoneRenders(window.zoneId).length),3);console.log('Actual project replacement rejected; no cross-project write');}
 else {assert.equal(await page.locator('#palette-render-progress,#rp-modal,#rf-modal').count(),0);const result=await page.evaluate(kind=>({name:S.pi.project,id:CLOUD_BID_ID,count:_zoneRenders(window.zoneId).length,url:kind==='refine'?_zoneRenders(window.zoneId)[0].url:_zoneRenders(window.zoneId).at(-1).url}),kind);assert.equal(result.name,fixture.S.pi.project);assert.equal(result.id,'client-project');assert.equal(result.count,kind==='refine'?3:4);assert.equal(result.url,'https://example.test/saved.jpg');console.log(kind,'saved to live project after two real phase refreshes');}
}
assert.deepEqual(errors,[]);console.log('PASS: actual project fixture, real phase refresh and render storage, no remote writes');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
