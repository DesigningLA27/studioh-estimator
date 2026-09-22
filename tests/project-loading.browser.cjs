// PROJECT_FIXTURE and PROJECT_PDF are private, read-only local test inputs; never commit them.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:960}});let mode='success';const errors=[];const fixture=fs.readFileSync(process.env.PROJECT_FIXTURE);const pdf=fs.readFileSync(process.env.PROJECT_PDF);const expected=JSON.parse(fixture).bid.S;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{if(r.request().url().startsWith('http://127.0.0.1:8788'))return r.continue();let b={};try{b=r.request().postDataJSON()||{};}catch{}
  if(b.type==='loadbid'){await new Promise(ok=>setTimeout(ok,mode==='cancel'?2000:300));return r.fulfill({status:mode==='error'?503:200,contentType:'application/json',body:mode==='error'?'{}':fixture});}
  if(r.request().url().includes('pdfget='))return r.fulfill({status:200,contentType:'application/pdf',body:pdf});
  return r.fulfill({status:200,contentType:'application/json',body:'{}'});
 });
 await page.goto('http://127.0.0.1:8788');await page.waitForTimeout(2000);
 await page.evaluate(()=>{document.getElementById('_ask')?.remove();localStorage.setItem('studioh_admin_key','test-only-no-real-credentials');askDlg=async()=>1;askTell=(title,message)=>{window.loadError=message;};});
 const before=await page.evaluate(()=>({id:CLOUD_BID_ID,name:CLOUD_BID_NAME,project:S.pi.project}));
 mode='error';await page.evaluate(()=>cloudLoadBid('test-id','Client project'));assert.deepEqual(await page.evaluate(()=>({id:CLOUD_BID_ID,name:CLOUD_BID_NAME,project:S.pi.project})),before);assert.match(await page.evaluate(()=>window.loadError),/503/);assert.equal(await page.locator('#cb-busy').count(),0);console.log('HTTP failure: previous project retained, overlay cleared');
 mode='cancel';await page.evaluate(()=>{window.loadTask=cloudLoadBid('test-id','Client project');});await page.locator('#cb-busy button').click();await page.evaluate(()=>window.loadTask);assert.deepEqual(await page.evaluate(()=>({id:CLOUD_BID_ID,name:CLOUD_BID_NAME,project:S.pi.project})),before);assert.equal(await page.locator('#cb-busy').count(),0);console.log('Cancel: previous project retained, overlay cleared');
 mode='cancel';await page.evaluate(()=>{window.loadTask=cloudLoadBid('test-id','Client project');});await page.locator('#cb-busy').waitFor();await page.evaluate(()=>{window.originalNow=Date.now;Date.now=()=>window.originalNow()+50000;});await page.evaluate(()=>window.loadTask);await page.evaluate(()=>{Date.now=window.originalNow;});assert.match(await page.evaluate(()=>window.loadError),/stopped responding/);assert.deepEqual(await page.evaluate(()=>({id:CLOUD_BID_ID,name:CLOUD_BID_NAME,project:S.pi.project})),before);assert.equal(await page.locator('#cb-busy').count(),0);console.log('Timeout: previous project retained, retry available');
 mode='success';await page.evaluate(()=>{window.loadTask=cloudLoadBid('test-id','Client project');});await page.locator('#cb-busy').waitFor();console.log('Loader styles',await page.locator('#cb-busy [role=dialog]').evaluate(e=>({background:getComputedStyle(e).backgroundColor,radius:getComputedStyle(e).borderRadius,padding:getComputedStyle(e).padding})));await page.screenshot({path:'/tmp/project-loading.png'});await page.evaluate(()=>window.loadTask);
 const actual=await page.evaluate(()=>({project:S.pi.project,id:CLOUD_BID_ID,zones:S.planting.zones.length,renders:Object.values(S.planting._renders||{}).reduce((a,x)=>a+x.length,0),busy:!!document.getElementById('cb-busy'),opening:_cloudOpening}));
 assert.equal(actual.project,expected.pi.project);assert.equal(actual.id,'test-id');assert.equal(actual.zones,expected.planting.zones.length);assert.equal(actual.renders,Object.values(expected.planting._renders).reduce((a,x)=>a+x.length,0));assert.equal(actual.busy,false);assert.equal(actual.opening,false);assert.deepEqual(errors,[]);
 await page.screenshot({path:'/tmp/project-opened.png'});console.log('Actual saved project restored:',actual);console.log('PASS: no browser errors; all remote writes intercepted');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
