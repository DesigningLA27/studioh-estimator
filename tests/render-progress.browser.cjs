// Run with PLAYWRIGHT_MODULE pointing to the installed Playwright module and a local preview on 8788.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:960}});const errors=[];let failure=false;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{
  if(r.request().url().startsWith('http://127.0.0.1:8788'))return r.continue();
  if(r.request().url()==='https://example.test/generated.jpg')return r.abort();
  let b={};try{b=r.request().postDataJSON()||{};}catch{}
  if(b.type==='genimage'){await new Promise(ok=>setTimeout(ok,400));return r.fulfill({status:failure?500:200,contentType:'application/json',body:JSON.stringify(failure?{error:'Test failure'}:{ok:true,url:'https://example.test/generated.jpg',model:'openai/gpt-image-2.5/sunburst/edit',usedRef:true})});}
  return r.fulfill({status:200,contentType:'application/json',body:'{}'});
 });
 await page.goto('http://127.0.0.1:8788');await page.waitForTimeout(2000);console.log('Page ready',await page.title(),await page.locator('body').count());
 async function setup(kind,saveFail=false){await page.evaluate(({kind,saveFail})=>{
  document.getElementById('palette-render-progress')?.remove();document.getElementById('rp-modal')?.remove();document.getElementById('rf-modal')?.remove();
  document.getElementById('_ask')?.remove();askTell=()=>{};
  const p={zones:[{id:'test',name:'Test'}]};S.planting=p;S.pi.project='Active client project';S._sample=false;CLOUD_BID_ID='client-project';CLOUD_BID_NAME='Active client project';ensurePlanting=()=>S.planting;plantRefsOn=()=>false;_adminKey=()=> 'test';_renderPrompt=()=> 'Test render';_zoneNames=()=>['Test plant'];_toast=()=>{};_plRender=()=>{};_zoneRenderAdd=(id,url)=>{(S.planting._renders||(S.planting._renders={}))[id]=[{url}];return true;};
  _uploadUrlToR2=async()=>{await new Promise(r=>setTimeout(r,150));return {ok:!saveFail,url:'https://example.test/saved.jpg'};};_imgLoads=async()=>true;
  _zoneRenders=()=>kind==='refine'?[{url:'https://example.test/original.jpg'}]:[];plantDbFind=()=>({c:'Test plant'});botName=()=>'';_refKeyText=()=>'';_bidSchedule=()=>{};
  const d=document.createElement('div');d.id=kind==='refine'?'rf-modal':'rp-modal';d.innerHTML='<p>Render options</p><div id="rp-status"></div><div id="rp-custom-status"></div><div id="rf-status"></div><input id="rf-text" value="Add planting"><input type="checkbox" class="rp-cust-pick" checked value="shrub:test"><button class="rp-gen rf-go">Generate</button>';document.body.appendChild(d);
 },{kind,saveFail});}
 for(const kind of ['install','mature','custom','refine']){
  await setup(kind);await page.evaluate(kind=>{window.renderTask=kind==='custom'?_rpCustomGenerate('test'):kind==='refine'?_refineGo('test',0):_rpGenerate('test',kind);},kind);
  await page.locator('#palette-render-progress').waitFor();
  await page.evaluate(()=>{navigator.serviceWorker.dispatchEvent(new Event('controllerchange'));_cfgStale=true;Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('#palette-render-progress progress').getAttribute('value'),null);
  if(kind==='install'){await page.screenshot({path:'/tmp/palette-progress-working.png'});console.log('Styles',await page.locator('#palette-render-progress [role="dialog"]').evaluate(e=>({background:getComputedStyle(e).backgroundColor,radius:getComputedStyle(e).borderRadius,padding:getComputedStyle(e).padding,width:e.getBoundingClientRect().width})));}
  await page.waitForFunction(()=>document.getElementById('prp-title')?.textContent==='Completed');
  if(kind==='install')await page.screenshot({path:'/tmp/palette-progress-completed.png'});
  await page.evaluate(()=>window.renderTask);assert.equal(await page.locator('#palette-render-progress,#rp-modal,#rf-modal').count(),0);assert.deepEqual(await page.evaluate(()=>[S.pi.project,CLOUD_BID_ID,S._sample]),['Active client project','client-project',false]);console.log(kind,'completed; dialogs closed; client project retained after background update events');
 }
 for(const saveFail of [false,true]){
  failure=!saveFail;await setup('install',saveFail);await page.evaluate(()=>_rpGenerate('test','install'));
  assert.equal(await page.locator('#prp-title').textContent(),'Rendering not completed');assert.equal(await page.locator('#rp-modal').count(),1);await page.locator('#palette-render-progress button').click();assert.equal(await page.locator('#rp-modal').count(),1);assert.equal(await page.locator('.rp-gen').isEnabled(),true);console.log(saveFail?'save failure':'provider failure','keeps options open and retry enabled');
 }
 failure=false;await setup('install');await page.evaluate(()=>{window.renderTask=_rpGenerate('test','install');S.planting={zones:[{id:'other'}]};CLOUD_BID_ID='other-project';_projectSession++;});await page.evaluate(()=>window.renderTask);assert.match(await page.locator('#palette-render-progress [data-message]').textContent(),/project or design phase changed/);assert.equal(await page.evaluate(()=>S.planting._renders),undefined);console.log('Switched project is not modified by late render result');
 assert.deepEqual(errors,[]);console.log('PASS: no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
