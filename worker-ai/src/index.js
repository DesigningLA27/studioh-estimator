/**
 * Studio H Estimator — Cloudflare Worker
 *   1) AI proxy            -> {model,messages,...}                 (adds secret Anthropic key)
 *   2) Plant image lookup  -> {type:"plantimage", name, licenses}  (Wikimedia + iNaturalist)
 *   3) Master plant book   -> {type:"loadbook"} (public read)
 *                             {type:"savebook", key, book} (admin write, needs ADMIN_KEY)
 *
 * Requires (for the master book): a KV namespace bound as  PLANTS_KV
 * and a secret  ADMIN_KEY  (only someone with it can publish the master book).
 */

const ALLOWED_ORIGINS = ["https://designingla27.github.io"];
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const SAFE_INAT = { "cc0":"CC0", "cc-by":"CC BY", "cc-by-sa":"CC BY-SA", "pd":"Public domain" };
const BOOK_KEY = "masterbook_v1";
const MAX_BOOK_BYTES = 20 * 1024 * 1024; // 20 MB safety cap

function corsHeaders(origin){ const allow=ALLOWED_ORIGINS.includes(origin)?origin:ALLOWED_ORIGINS[0];
  return { "Access-Control-Allow-Origin":allow, "Access-Control-Allow-Methods":"GET, POST, OPTIONS", "Access-Control-Allow-Headers":"Content-Type", "Access-Control-Max-Age":"86400", "Vary":"Origin" }; }
function json(obj,status,origin){ return new Response(JSON.stringify(obj),{status:status||200,headers:{"Content-Type":"application/json",...corsHeaders(origin)}}); }

export default {
  async fetch(request, env){
    const _u=new URL(request.url);
    const _o=request.headers.get("Origin")||"";
    if(request.method==="POST" && _u.searchParams.get("pdfup")) return handleSavePdfRaw(request, env, _o, _u);
    if(request.method==="GET"  && _u.searchParams.get("pdfget")) return handleLoadPdf({id:_u.searchParams.get("pdfget")}, env, _o);
    if(request.method==="GET"  && _u.searchParams.get("imgget")) return handleLoadImg(_u.searchParams.get("imgget"), env, _o);
    const origin=request.headers.get("Origin")||"";
    if(request.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders(origin)});
    if(request.method!=="POST") return json({error:"POST only"},405,origin);
    if(origin && !ALLOWED_ORIGINS.includes(origin)) return json({error:"Origin not allowed"},403,origin);
    let body; try{ body=await request.json(); }catch(e){ return json({error:"Invalid JSON body"},400,origin); }

    if(body && body.type==="plantimage") return handlePlantImage(body, origin);
    if(body && body.type==="loadbook")  return handleLoadBook(env, origin);
    if(body && body.type==="savebook")  return handleSaveBook(body, env, origin);
    if(body && body.type==="loadconfig") return handleLoadConfig(env, origin);
    if(body && body.type==="saveconfig") return handleSaveConfig(body, env, origin);
    if(body && body.type==="verifyimage") return handleVerifyImage(body, origin);
    if(body && body.type==="listbackups") return handleListBackups(env, origin);
    if(body && body.type==="restorebackup") return handleRestoreBackup(body, env, origin);
    if(body && body.type==="genimage")   return handleGenImage(body, env, origin);
    if(body && body.type==="saveimage")  return handleSaveImg(body, env, origin, _u.origin+_u.pathname);
    if(body && body.type==="fetchimage") return handleFetchImg(body, env, origin, _u.origin+_u.pathname);
    if(body && body.type==="imgproxy")   return handleImgProxy(body, origin);
    if(body && body.type==="savepdf")    return handleSavePdf(body, env, origin);
    if(body && body.type==="loadpdf")    return handleLoadPdf(body, env, origin);
    if(body && body.type==="savebid")    return handleSaveBid(body, env, origin);
    if(body && body.type==="loadbid")    return handleLoadBid(body, env, origin);
    if(body && body.type==="listbids")   return handleListBids(env, origin);
    if(body && body.type==="deletebid")  return handleDeleteBid(body, env, origin);

    // default: AI proxy
    if(!env.ANTHROPIC_API_KEY) return json({error:"Server not configured: missing ANTHROPIC_API_KEY secret."},500,origin);
    if(typeof body.max_tokens!=="number" || body.max_tokens>8000) body.max_tokens=1000;
    try{
      const upstream=await fetch(ANTHROPIC_URL,{ method:"POST", headers:{"Content-Type":"application/json","x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":ANTHROPIC_VERSION}, body:JSON.stringify(body) });
      const text=await upstream.text();
      return new Response(text,{status:upstream.status,headers:{"Content-Type":"application/json",...corsHeaders(origin)}});
    }catch(e){ return json({error:"Upstream request failed",detail:String(e)},502,origin); }
  }
};

// ---- Fetch an image URL server-side and return it base64 (for AI vision) ----
// Lets Claude read a Google satellite tile the browser can't hand over
// (cross-origin) and that Anthropic can't fetch directly (robots.txt / referrer).
async function handleImgProxy(body, origin){
  const url=(""+(body.url||"")).trim();
  if(!/^https?:\/\//i.test(url)) return json({ok:false, err:"Not a valid http(s) URL."},200,origin);
  try{
    const r=await fetch(url,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool; studioh-inc.com)"}});
    if(!r.ok) return json({ok:false, err:"fetch "+r.status},200,origin);
    const ct=(r.headers.get("content-type")||"image/png").toLowerCase();
    if(ct.indexOf("image/")!==0) return json({ok:false, err:"not an image ("+ct+")"},200,origin);
    const buf=new Uint8Array(await r.arrayBuffer());
    if(buf.length > 8*1024*1024) return json({ok:false, err:"image too large"},200,origin);
    let bin=""; const CH=0x8000;
    for(let i=0;i<buf.length;i+=CH) bin+=String.fromCharCode.apply(null, buf.subarray(i,i+CH));
    return json({ok:true, media_type:ct.split(";")[0], data:btoa(bin)},200,origin);
  }catch(e){ return json({ok:false, err:String(e)},200,origin); }
}

// ---- Master plant book (KV) ----
async function handleLoadBook(env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  try{
    const raw = await env.PLANTS_KV.get(BOOK_KEY);
    if(!raw) return json({found:false},200,origin);
    const meta = await env.PLANTS_KV.get(BOOK_KEY+"_meta");
    return new Response(JSON.stringify({ found:true, book: JSON.parse(raw), meta: meta?JSON.parse(meta):null }), {status:200, headers:{"Content-Type":"application/json",...corsHeaders(origin)}});
  }catch(e){ return json({error:"Load failed",detail:String(e)},502,origin); }
}
async function handleSaveBook(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  if(!env.ADMIN_KEY) return json({error:"No ADMIN_KEY secret set"},500,origin);
  if(!body.key || body.key !== env.ADMIN_KEY) return json({error:"Not authorized to publish"},403,origin);
  if(!body.book || typeof body.book!=="object") return json({error:"No book provided"},400,origin);
  const str = JSON.stringify(body.book);
  if(str.length > MAX_BOOK_BYTES) return json({error:"Book too large for KV ("+Math.round(str.length/1024/1024)+"MB). Move images to R2."},413,origin);
  try{
    const counts={}; ["shrub","tree","gc","palm"].forEach(k=>{ counts[k]=Array.isArray(body.book[k])?body.book[k].length:0; });
    const now=new Date().toISOString();
    // 1) back up the CURRENT master before overwriting it
    try{
      const prev=await env.PLANTS_KV.get(BOOK_KEY);
      if(prev){
        const prevMeta=await env.PLANTS_KV.get(BOOK_KEY+"_meta");
        const stamp=now.replace(/[:.]/g,"-");
        await env.PLANTS_KV.put("backup_"+stamp, prev, { expirationTtl: 60*60*24*90 }); // keep 90 days
        let idx=[]; try{ idx=JSON.parse(await env.PLANTS_KV.get("backup_index")||"[]"); }catch(e2){ idx=[]; }
        idx.unshift({ key:"backup_"+stamp, at:now, meta: prevMeta?JSON.parse(prevMeta):null, by: body.by||"admin" });
        // keep last 10 entries in the index
        const keep=idx.slice(0,10); const drop=idx.slice(10);
        for(const d of drop){ try{ await env.PLANTS_KV.delete(d.key); }catch(e3){} }
        await env.PLANTS_KV.put("backup_index", JSON.stringify(keep));
      }
    }catch(eBk){ /* backup failure must not block the save */ }
    // 2) write the new master
    await env.PLANTS_KV.put(BOOK_KEY, str);
    await env.PLANTS_KV.put(BOOK_KEY+"_meta", JSON.stringify({ savedAt:now, counts, by: body.by||"admin" }));
    return json({ ok:true, savedAt:now, counts },200,origin);
  }catch(e){ return json({error:"Save failed",detail:String(e)},502,origin); }
}

// ---- AI image generation (fal.ai) ----
// Secret: FAL_KEY.
const IMG_MODELS={
  // text-to-image
  "flux-pro":   { t2i:"fal-ai/flux-2-pro",   i2i:"fal-ai/flux-2-pro/edit",   note:"Flux 2 Pro — photoreal, ~$0.03" },
  "flux-klein": { t2i:"fal-ai/flux-2-klein", i2i:"fal-ai/flux-2-klein/edit", note:"Flux 2 Klein — fast, ~$0.014" },
  "nano-2":     { t2i:"fal-ai/nano-banana-2", i2i:"fal-ai/nano-banana-2/edit", note:"Nano Banana 2 (Google), ~$0.08 — best at holding scene structure" },
  // ADDED: for Studio H product visualizations. Pro takes up to 14 reference images;
  // GPT Image 2 is cheaper than nano-2 at medium quality and stronger at following
  // instructions, which is where camera direction keeps failing.
  "nano-banana-pro": { t2i:"fal-ai/nano-banana-pro", i2i:"fal-ai/nano-banana-pro/edit", note:"Nano Banana Pro (Google), ~$0.15" },
  "gpt-image-2":     { t2i:"fal-ai/gpt-image-2",     i2i:"fal-ai/gpt-image-2/edit",     note:"GPT Image 2 (OpenAI), ~$0.053 at medium quality" }
};
async function handleGenImage(body, env, origin){
  if(!env.FAL_KEY) return json({error:"No FAL_KEY secret set on the worker."},500,origin);
  if(!env.ADMIN_KEY || !body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const prompt=(""+(body.prompt||"")).trim(); if(!prompt) return json({error:"No prompt"},400,origin);
  // CHANGED: an unknown model name used to fall through to Flux silently, so the app
  // could ask for gpt-image-2, be given a different model, and be billed for it — which
  // is exactly what happened, and it made two models look like they had been tested when
  // they never ran. Refuse instead of substituting.
  const want=(""+(body.model||"nano-2"));
  if(!IMG_MODELS[want]) return json({error:"Unknown model: "+want, known:Object.keys(IMG_MODELS)},400,origin);
  const m=IMG_MODELS[want];
  const ar=(""+(body.aspect||"3:2"));
  // Optional site photo: data URL or https URL. When present we use the model's
  // edit/image-to-image endpoint so the render keeps the real site's structure.
  const refs=[].concat(body.refs||body.ref||[]).filter(Boolean);
  const useI2I = refs.length>0 && m.i2i;
  const path = useI2I ? m.i2i : m.t2i;
  const payload = { prompt, num_images:1, output_format:"jpeg" };
  // CHANGED: aspect_ratio used to be set ONLY when NOT doing image-to-image. Every
  // Studio H product render supplies reference photos, so it was never sent — which is
  // why all six views came back 1376x768 including the ones requested as 1:1. Sent on
  // both paths now; an endpoint that does not understand it ignores it.
  payload.aspect_ratio = ar;
  if(useI2I){
    payload.image_urls = refs;                    // Flux 2 / Nano Banana multi-ref
    payload.image_url  = refs[0];                 // single-ref fallback field
    if(body.strength!=null) payload.strength = Math.min(1, Math.max(0, +body.strength));
  }
  // GPT Image 2 is priced by quality tier: low $0.006, medium $0.053, high $0.211.
  // Pin it to medium rather than accepting whatever the endpoint defaults to.
  if(path.indexOf("gpt-image-2")>=0) payload.quality = (""+(body.quality||"medium"));
  try{
    const r=await fetch("https://fal.run/"+path,{
      method:"POST",
      headers:{ "Authorization":"Key "+env.FAL_KEY, "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const d=await r.json();
    if(!r.ok) return json({error:"Image generation failed", detail:(d&&(d.detail||d.error))||("HTTP "+r.status), path},502,origin);
    const img=(d.images&&d.images[0])||(d.image)||null;
    const url=img&&(img.url||img);
    if(!url) return json({error:"No image returned", detail:JSON.stringify(d).slice(0,300)},502,origin);
    return json({ok:true, url, model:path, usedRef:useI2I},200,origin);
  }catch(e){ return json({error:"Image generation failed", detail:String(e)},502,origin); }
}

// ---- Plan PDFs (R2 blob storage) ----
// Bound as PDFS in wrangler/dashboard. PDFs are far too big for KV's 25MB/value cap.
async function handleSavePdf(body, env, origin){
  if(!env.PDFS) return json({error:"No R2 bucket bound (PDFS)"},500,origin);
  if(!env.ADMIN_KEY || !body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const id=(""+(body.id||"")).trim(); if(!id) return json({error:"No id"},400,origin);
  const data=(""+(body.pdf||"")); if(!data) return json({error:"No pdf"},400,origin);
  try{
    const b64=data.indexOf(",")>=0 && data.slice(0,5)==="data:" ? data.slice(data.indexOf(",")+1) : data;
    const bin=atob(b64); const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    await env.PDFS.put("pdf_"+id, bytes, { httpMetadata:{ contentType:"application/pdf" } });
    return json({ok:true, id, bytes:bytes.length},200,origin);
  }catch(e){ return json({error:"PDF save failed",detail:String(e)},502,origin); }
}
// Raw-binary PDF upload: POST bytes directly (no base64), far lighter on worker memory.
// Route: ?pdfup=<id>&key=<adminkey>
async function handleSavePdfRaw(request, env, origin, url){
  if(!env.PDFS) return json({error:"No R2 bucket bound (PDFS)"},500,origin);
  const key=url.searchParams.get("key")||"";
  if(!env.ADMIN_KEY || key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const id=(url.searchParams.get("pdfup")||"").trim(); if(!id) return json({error:"No id"},400,origin);
  try{
    await env.PDFS.put("pdf_"+id, request.body, { httpMetadata:{ contentType:"application/pdf" } });
    return json({ok:true, id},200,origin);
  }catch(e){ return json({error:"PDF save failed",detail:String(e)},502,origin); }
}
async function handleLoadPdf(body, env, origin){
  if(!env.PDFS) return json({error:"No R2 bucket bound (PDFS)"},500,origin);
  const id=(""+(body.id||"")).trim(); if(!id) return json({error:"No id"},400,origin);
  try{
    const obj=await env.PDFS.get("pdf_"+id);
    if(!obj) return json({found:false},404,origin);
    // Stream the raw bytes straight through. Base64-encoding a 45MB PDF in the
    // worker blows past Cloudflare's 128MB memory cap and kills the request.
    return new Response(obj.body, { status:200, headers:{
      "Content-Type":"application/pdf",
      "Content-Length": String(obj.size||""),
      ...corsHeaders(origin)
    }});
  }catch(e){ return json({error:"PDF load failed",detail:String(e)},502,origin); }
}
async function deletePdf(env,id){ try{ if(env.PDFS) await env.PDFS.delete("pdf_"+id); }catch(e){} }

// ---- AI plant images (R2 blob storage) ----
// Bound as IMAGES. AI images are stored as their own R2 objects so the plant book stays a
// lightweight list of URLs — never base64 in KV.
async function handleSaveImg(body, env, origin, base){
  if(!env.IMAGES) return json({error:"No R2 bucket bound (IMAGES)"},500,origin);
  if(!env.ADMIN_KEY || !body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const id=(""+(body.id||"")).trim().replace(/[^a-zA-Z0-9_\-]/g,""); if(!id) return json({error:"No id"},400,origin);
  const data=(""+(body.image||"")); if(!data) return json({error:"No image"},400,origin);
  try{
    const b64=data.indexOf(",")>=0 && data.slice(0,5)==="data:" ? data.slice(data.indexOf(",")+1) : data;
    // CHANGED: the content type used to be hardcoded to image/jpeg, so a transparent PNG
    // cut-out was stored and served labelled as a JPEG. Browsers sniff past it, but the
    // header was simply wrong. Read it off the data URL instead.
    let ct="image/jpeg";
    const mm=data.match(/^data:([a-z]+\/[a-z0-9.+-]+)[;,]/i);
    if(mm) ct=mm[1].toLowerCase();
    const bin=atob(b64); const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    await env.IMAGES.put("img_"+id, bytes, { httpMetadata:{ contentType:ct } });
    return json({ok:true, id, url: base+"?imgget="+id, bytes:bytes.length, contentType:ct},200,origin);
  }catch(e){ return json({error:"Image save failed",detail:String(e)},502,origin); }
}
// Fetch any image URL server-side (no browser CORS limits) and self-host it on R2.
async function handleFetchImg(body, env, origin, base){
  if(!env.IMAGES) return json({error:"No R2 bucket bound (IMAGES)"},500,origin);
  if(!env.ADMIN_KEY || !body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const url=(""+(body.url||"")).trim();
  if(!/^https?:\/\//i.test(url)) return json({error:"Not a valid http(s) image URL."},400,origin);
  const id=(""+(body.id||("paste_"+Date.now().toString(36)))).replace(/[^a-zA-Z0-9_\-]/g,"");
  try{
    const r=await fetch(url,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool; studioh-inc.com)"}});
    if(!r.ok) return json({error:"Couldn't fetch that URL (HTTP "+r.status+")."},502,origin);
    const ct=(r.headers.get("content-type")||"").toLowerCase();
    if(ct.indexOf("image/")!==0) return json({error:"That link isn't a direct image (got "+(ct||"unknown")+"). Right-click the image and Copy Image Address."},415,origin);
    const buf=await r.arrayBuffer();
    if(buf.byteLength > 8*1024*1024) return json({error:"Image is too large (over 8MB)."},413,origin);
    await env.IMAGES.put("img_"+id, buf, { httpMetadata:{ contentType: ct } });
    return json({ok:true, id, url: base+"?imgget="+id, bytes: buf.byteLength},200,origin);
  }catch(e){ return json({error:"Fetch failed",detail:String(e)},502,origin); }
}
async function handleLoadImg(id, env, origin){
  if(!env.IMAGES) return new Response("No IMAGES bucket",{status:500,headers:corsHeaders(origin)});
  id=(""+(id||"")).trim().replace(/[^a-zA-Z0-9_\-]/g,""); if(!id) return new Response("No id",{status:400,headers:corsHeaders(origin)});
  try{
    const obj=await env.IMAGES.get("img_"+id);
    if(!obj) return new Response("Not found",{status:404,headers:corsHeaders(origin)});
    return new Response(obj.body,{status:200,headers:{
      "Content-Type":(obj.httpMetadata&&obj.httpMetadata.contentType)||"image/jpeg",
      "Cache-Control":"public, max-age=31536000, immutable",
      "Content-Length":String(obj.size||""),
      ...corsHeaders(origin)
    }});
  }catch(e){ return new Response("Image load failed",{status:502,headers:corsHeaders(origin)}); }
}

// ---- Project bids (KV) ----
async function handleSaveBid(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  if(!env.ADMIN_KEY) return json({error:"No ADMIN_KEY secret set"},500,origin);
  if(!body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const name=(""+(body.name||"")).trim(); if(!name) return json({error:"No project name"},400,origin);
  const id=(""+(body.id||"")).trim() || ("bid_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
  if(!body.bid) return json({error:"No bid data"},400,origin);
  const str=JSON.stringify(body.bid);
  if(str.length > MAX_BOOK_BYTES) return json({error:"Bid too large ("+Math.round(str.length/1024/1024)+"MB)"},413,origin);
  try{
    const now=new Date().toISOString();
    await env.PLANTS_KV.put("bid_"+id, str);
    let idx=[]; try{ idx=JSON.parse(await env.PLANTS_KV.get("bid_index")||"[]"); }catch(e){ idx=[]; }
    idx=idx.filter(b=>b.id!==id);
    idx.unshift({ id, name, at:now, addr:(body.addr||"") });
    await env.PLANTS_KV.put("bid_index", JSON.stringify(idx.slice(0,200)));
    return json({ok:true, id, savedAt:now},200,origin);
  }catch(e){ return json({error:"Save failed",detail:String(e)},502,origin); }
}
async function handleLoadBid(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound"},500,origin);
  const id=(""+(body.id||"")).trim(); if(!id) return json({error:"No id"},400,origin);
  try{ const raw=await env.PLANTS_KV.get("bid_"+id); if(!raw) return json({found:false},200,origin);
    return new Response(JSON.stringify({found:true, bid:JSON.parse(raw)}), {status:200, headers:{"Content-Type":"application/json",...corsHeaders(origin)}});
  }catch(e){ return json({error:"Load failed"},502,origin); }
}
async function handleListBids(env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound"},500,origin);
  try{ const idx=JSON.parse(await env.PLANTS_KV.get("bid_index")||"[]"); return json({ok:true, bids:idx},200,origin); }
  catch(e){ return json({ok:true, bids:[]},200,origin); }
}
async function handleDeleteBid(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound"},500,origin);
  if(!env.ADMIN_KEY || !body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const id=(""+(body.id||"")).trim(); if(!id) return json({error:"No id"},400,origin);
  try{ await env.PLANTS_KV.delete("bid_"+id);
    await deletePdf(env,id);
    let idx=[]; try{ idx=JSON.parse(await env.PLANTS_KV.get("bid_index")||"[]"); }catch(e){}
    await env.PLANTS_KV.put("bid_index", JSON.stringify(idx.filter(b=>b.id!==id)));
    return json({ok:true},200,origin);
  }catch(e){ return json({error:"Delete failed"},502,origin); }
}

// ---- Master book backups ----
async function handleListBackups(env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  try{ const idx=JSON.parse(await env.PLANTS_KV.get("backup_index")||"[]"); return json({ok:true, backups:idx},200,origin); }
  catch(e){ return json({ok:true, backups:[]},200,origin); }
}
async function handleRestoreBackup(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  if(!env.ADMIN_KEY) return json({error:"No ADMIN_KEY secret set"},500,origin);
  if(!body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized"},403,origin);
  const bkey=(""+(body.backup||"")).trim(); if(!bkey.startsWith("backup_")) return json({error:"Bad backup key"},400,origin);
  try{
    const raw=await env.PLANTS_KV.get(bkey); if(!raw) return json({error:"Backup not found"},404,origin);
    // back up the current one before restoring (so a restore is also undoable)
    const now=new Date().toISOString();
    try{ const cur=await env.PLANTS_KV.get(BOOK_KEY);
      if(cur){ const stamp=now.replace(/[:.]/g,"-"); await env.PLANTS_KV.put("backup_"+stamp, cur, { expirationTtl: 60*60*24*90 });
        let idx=[]; try{ idx=JSON.parse(await env.PLANTS_KV.get("backup_index")||"[]"); }catch(e2){ idx=[]; }
        idx.unshift({ key:"backup_"+stamp, at:now, meta:null, by:"pre-restore" });
        await env.PLANTS_KV.put("backup_index", JSON.stringify(idx.slice(0,10))); } }catch(e3){}
    await env.PLANTS_KV.put(BOOK_KEY, raw);
    const book=JSON.parse(raw); const counts={}; ["shrub","tree","gc","palm"].forEach(k=>{ counts[k]=Array.isArray(book[k])?book[k].length:0; });
    await env.PLANTS_KV.put(BOOK_KEY+"_meta", JSON.stringify({ savedAt:now, counts, by:"restored from "+bkey }));
    return json({ok:true, counts, book},200,origin);
  }catch(e){ return json({error:"Restore failed",detail:String(e)},502,origin); }
}

// ---- Shared pricing/config (KV) ----
const CFG_KEY = "config_v1";
async function handleLoadConfig(env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  try{ const raw=await env.PLANTS_KV.get(CFG_KEY); if(!raw) return json({found:false},200,origin);
    return new Response(JSON.stringify({found:true, config:JSON.parse(raw)}), {status:200, headers:{"Content-Type":"application/json",...corsHeaders(origin)}});
  }catch(e){ return json({error:"Load failed",detail:String(e)},502,origin); }
}
async function handleSaveConfig(body, env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  if(!env.ADMIN_KEY) return json({error:"No ADMIN_KEY secret set"},500,origin);
  if(!body.key || body.key!==env.ADMIN_KEY) return json({error:"Not authorized to publish"},403,origin);
  if(!body.config || typeof body.config!=="object") return json({error:"No config provided"},400,origin);
  const str=JSON.stringify(body.config);
  if(str.length > MAX_BOOK_BYTES) return json({error:"Config too large"},413,origin);
  try{ await env.PLANTS_KV.put(CFG_KEY, str); return json({ok:true, savedAt:new Date().toISOString()},200,origin); }
  catch(e){ return json({error:"Save failed",detail:String(e)},502,origin); }
}

// ---- Verify a pasted Wikimedia Commons image (commercial-safe only) ----
async function handleVerifyImage(body, origin){
  const url=(""+(body.url||"")).trim();
  if(!url) return json({ok:false, error:"No URL"},200,origin);
  // must be a Wikimedia Commons image URL
  let fname="";
  if(/commons\.wikimedia\.org\/wiki\/File:/i.test(url)){ fname=decodeURIComponent(url.split(/File:/i)[1]||""); }
  else if(/\/commons\//.test(url)){ let path=url.split("/commons/")[1]||""; path=path.replace(/^thumb\//,""); const segs=path.split("/"); fname=(segs.length>=4&&/px-/.test(segs[segs.length-1]))?segs[2]:segs[segs.length-1]; try{fname=decodeURIComponent(fname);}catch(e){} }
  if(!fname) return json({ok:false, error:"Not a Wikimedia Commons image link. Copy the image from commons.wikimedia.org."},200,origin);
  const out=[];
  try{ await commonsInfo(["File:"+fname], fname, "", false, true, out, "high"); }catch(e){}
  if(!out.length) return json({ok:false, error:"That Commons image isn't commercially licensed (or not found). Pick a CC0/CC BY image."},200,origin);
  const o=out[0];
  return json({ ok:true, image:o.image, full:o.full, license:o.license, licenseLabel:o.licenseLabel, attribution:o.attribution, source:"Wikimedia" },200,origin);
}

// ---- Plant image lookup (Wikimedia primary, iNaturalist fallback) ----
async function handlePlantImage(body, origin){
  const name=(""+(body.name||"")).trim();
  if(!name) return json({error:"No plant name"},400,origin);
  const allowBY = Array.isArray(body.licenses) && (body.licenses.indexOf("cc-by")>=0 || body.licenses.indexOf("cc-by-sa")>=0);
  const want = body.licenses && body.licenses.length ? body.licenses : ["cc0"];
  const reqLc=name.toLowerCase(); const reqWords=reqLc.split(/\s+/).filter(Boolean);
  const reqSpecies=reqWords.slice(0,2).join(" "); const reqGenus=reqWords[0]||""; const hadCultivar=reqWords.length>2||/['"]/.test(name);
  const out=[];
  const speciesTwo = reqWords.slice(0,2).join(" ");
  // Build ordered variants with a confidence tag: exact -> species -> genus
  const variants=[];
  if(name) variants.push({term:name, conf:(hadCultivar?"species":"high")});
  if(speciesTwo && speciesTwo!==reqLc) variants.push({term:speciesTwo, conf:(hadCultivar?"species":"high")});
  if(reqGenus && reqGenus!==speciesTwo) variants.push({term:reqGenus, conf:"low"});
  // Wikipedia REST lead image for each variant (stop once we have a few)
  for(const v of variants){ if(out.length>=3) break; try{ await fromWikipedia(v.term, reqSpecies, hadCultivar, allowBY, out, v.conf); }catch(e){} }
  // Commons text search (species) for extra options
  if(out.length<5){ try{ await fromWikimedia(speciesTwo||name, reqSpecies, hadCultivar, allowBY, out); }catch(e){} }
  // GBIF species media (broad coverage) as another source
  if(out.length<3){ try{ await fromGBIF(name, speciesTwo, reqGenus, hadCultivar, out); }catch(e){} }
  // iNaturalist last
  if(out.length<3){ try{ await fromINat(name, reqLc, reqSpecies, reqGenus, hadCultivar, want, out); }catch(e){} }
  const seen={}; const dedup=[]; for(const o of out){ if(o.image && !seen[o.image]){ seen[o.image]=1; dedup.push(o); } }
  out.length=0; for(const o of dedup) out.push(o);
  if(!out.length) return json({found:false, images:[], reason:"no commercial-safe image"},200,origin);
  const images=out.slice(0,5); const best=images[0];
  return json({ found:true, images, image:best.image, license:best.license, licenseLabel:best.licenseLabel, attribution:best.attribution, matchedName:best.matchedName, confidence:best.confidence, flag:best.flag, source:best.source },200,origin);
}
async function fromWikipedia(term, reqSpecies, hadCultivar, allowBY, out, conf){
  // Wikipedia REST summary -> lead image (very high coverage, follows redirects)
  const u="https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(term.replace(/ /g,"_"));
  const r=await fetch(u,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool; studioh-inc.com)","accept":"application/json"}}); if(!r.ok) return;
  const d=await r.json();
  const src=(d.originalimage&&d.originalimage.source)||(d.thumbnail&&d.thumbnail.source)||"";
  if(!src || src.indexOf("/commons/")<0) return; // must be a Commons image (has a license we can check)
  let path=src.split("/commons/")[1]||""; path=path.replace(/^thumb\//,""); const segs=path.split("/");
  let fname = (segs.length>=4 && /px-/.test(segs[segs.length-1])) ? segs[2] : segs[segs.length-1];
  try{ fname=decodeURIComponent(fname); }catch(e){}
  if(fname){ await commonsInfo(["File:"+fname], term, reqSpecies, hadCultivar, allowBY, out, conf||"high"); }
}
async function commonsInfo(titles, term, reqSpecies, hadCultivar, allowBY, out, baseConf){
  const infoUrl="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=600&titles="+encodeURIComponent(titles.join("|"));
  const r=await fetch(infoUrl,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool)"}}); if(!r.ok) return;
  const d=await r.json(); const pg=(d.query&&d.query.pages)?Object.values(d.query.pages):[];
  for(const p of pg){ const ii=p.imageinfo&&p.imageinfo[0]; if(!ii) continue; const meta=ii.extmetadata||{};
    const licLc=(((meta.LicenseShortName&&meta.LicenseShortName.value)||"")+"").toLowerCase();
    if(/nc|nd|non-?commercial|no deri/.test(licLc)) continue;
    const isPD=/public domain|^pd|cc0/.test(licLc); const isBY=/cc[ -]by/.test(licLc);
    if(!isPD && !isBY) continue; if(isBY && !allowBY && !isPD) continue;
    const artist=(((meta.Artist&&meta.Artist.value)||"")+"").replace(/<[^>]+>/g,"").trim();
    const conf = baseConf||"high";
    out.push({ image: ii.thumburl||ii.url, full: ii.url, license: isPD?"pd":"cc-by", licenseLabel:((meta.LicenseShortName&&meta.LicenseShortName.value)||(isPD?"Public domain":"CC BY")), attribution:(artist?artist+" ":"")+"/ Wikimedia Commons", matchedName:term, confidence:conf, flag:conf!=="high", source:"Wikimedia" });
    if(out.length>=5) break;
  }
}
async function fromWikimedia(name, reqSpecies, hadCultivar, allowBY, out){
  const searchUrl="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch="+encodeURIComponent(name);
  const r=await fetch(searchUrl,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool)"}}); if(!r.ok) return;
  const data=await r.json(); const pages=(data.query&&data.query.pages)?Object.values(data.query.pages):[]; if(!pages.length) return;
  const titles=pages.map(p=>p.title).filter(Boolean).slice(0,8); if(!titles.length) return;
  const infoUrl="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=500&titles="+encodeURIComponent(titles.join("|"));
  const r2=await fetch(infoUrl,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool)"}}); if(!r2.ok) return;
  const d2=await r2.json(); const pg2=(d2.query&&d2.query.pages)?Object.values(d2.query.pages):[];
  for(const p of pg2){ const ii=p.imageinfo&&p.imageinfo[0]; if(!ii) continue; const meta=ii.extmetadata||{};
    const licLc=(((meta.LicenseShortName&&meta.LicenseShortName.value)||"")+"").toLowerCase();
    if(/nc|nd|non-?commercial|no deri/.test(licLc)) continue;
    const isPD=/public domain|^pd|cc0/.test(licLc); const isBY=/cc[ -]by/.test(licLc);
    if(!isPD && !isBY) continue; if(isBY && !allowBY && !isPD) continue;
    const title=(p.title||"").replace(/^File:/,""); const tLc=(title+" "+(((meta.ObjectName&&meta.ObjectName.value)||"")+"")).toLowerCase();
    let conf="low"; if(tLc.indexOf(reqSpecies)>=0) conf=hadCultivar?"species":"high";
    const artist=(((meta.Artist&&meta.Artist.value)||"")+"").replace(/<[^>]+>/g,"").trim();
    out.push({ image: ii.thumburl||ii.url, full: ii.url, license: isPD?"pd":"cc-by", licenseLabel:((meta.LicenseShortName&&meta.LicenseShortName.value)||(isPD?"Public domain":"CC BY")), attribution:(artist?artist+" ":"")+"/ Wikimedia Commons", matchedName:title, confidence:conf, flag:conf!=="high", source:"Wikimedia" });
    if(out.length>=5) break;
  }
}
async function fromGBIF(name, speciesTwo, genus, hadCultivar, out){
  // GBIF: match name -> usageKey -> media (photos). License field per image.
  const mu="https://api.gbif.org/v1/species/match?name="+encodeURIComponent(speciesTwo||name);
  const mr=await fetch(mu,{headers:{"User-Agent":"StudioH-Estimator/1.0"}}); if(!mr.ok) return;
  const md=await mr.json(); const key=md.usageKey||md.speciesKey; if(!key) return;
  const ok = (md.matchType && md.matchType!=="NONE");
  if(!ok) return;
  const gu="https://api.gbif.org/v1/occurrence/search?taxonKey="+key+"&mediaType=StillImage&limit=20";
  const gr=await fetch(gu,{headers:{"User-Agent":"StudioH-Estimator/1.0"}}); if(!gr.ok) return;
  const gd=await gr.json(); const recs=gd.results||[];
  for(const rec of recs){ const media=rec.media||[]; for(const m of media){
    const lic=((m.license||"")+"").toLowerCase();
    if(/nc|nd|non-?commercial|no deri|all rights|©/.test(lic)) continue;
    const isPD=/cc0|public|zero/.test(lic); const isBY=/cc[ -/]by/.test(lic);
    if(!isPD && !isBY) continue;
    const url=m.identifier; if(!url) continue;
    const who=(m.rightsHolder||m.creator||"").toString();
    const conf = hadCultivar?"species":( (rec.species&&speciesTwo&&rec.species.toLowerCase()===speciesTwo)?"high":"species");
    out.push({ image:url, full:url, license:isPD?"pd":"cc-by", licenseLabel:(m.license||"").toString(), attribution:(who?who+" ":"")+"/ GBIF"+(m.license?" ("+m.license+")":""), matchedName:rec.scientificName||speciesTwo||name, confidence:conf, flag:conf!=="high", source:"GBIF" });
    if(out.length>=5) break;
  } if(out.length>=5) break; }
}
async function fromINat(name, reqLc, reqSpecies, reqGenus, hadCultivar, want, out){
  const url="https://api.inaturalist.org/v1/taxa?per_page=10&q="+encodeURIComponent(name);
  const r=await fetch(url,{headers:{"User-Agent":"StudioH-Estimator/1.0 (landscape tool)"}}); if(!r.ok) return;
  const data=await r.json(); const results=(data.results||[]).filter(t=>t&&t.default_photo); const scored=[];
  for(const t of results){ const ph=t.default_photo; const lc=(ph.license_code||"").toLowerCase(); if(!SAFE_INAT[lc]) continue; if(want.indexOf(lc)<0) continue;
    const tn=(""+(t.name||"")).toLowerCase(); let rank=0,conf="low";
    if(tn===reqLc){rank=3;conf="high";} else if(tn===reqSpecies){rank=2;conf=hadCultivar?"species":"high";} else if(tn.split(" ")[0]===reqGenus){rank=1;conf="low";}
    scored.push({t,ph,lc,rank,conf}); }
  scored.sort((a,b)=>b.rank-a.rank);
  for(const s of scored){ const ph=s.ph; const img=(ph.medium_url||ph.url||"").replace("square","medium");
    out.push({ image:img, full:img, license:s.lc, licenseLabel:SAFE_INAT[s.lc], attribution:(ph.attribution||"")+" / iNaturalist", matchedName:s.t.name||"", confidence:s.conf, flag:s.conf!=="high", source:"iNaturalist" });
    if(out.length>=5) break; }
}
