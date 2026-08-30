# Worker: add `cfgstamp` (3 small edits)

Cloudflare dashboard → Workers → **studioh-ai** → Edit code. Make these three edits, then Deploy.

Everything works without this — the app just polls the whole settings bundle every 20s instead of
asking a 60-byte question every 8s. On the iPad that is the difference between live sync and a data
bill.

---

## 1. Register the new message type

**Find** this line (it's in the list of `if(body && body.type===...)` handlers):

```js
    if(body && body.type==="loadconfig") return handleLoadConfig(env, origin);
```

**Add one line directly above it:**

```js
    if(body && body.type==="cfgstamp")  return handleCfgStamp(env, origin);
```

---

## 2. Add the handler

**Find:**

```js
const CFG_KEY = "config_v1";
```

**Paste this directly below it:**

```js
async function handleCfgStamp(env, origin){
  if(!env.PLANTS_KV) return json({error:"No KV bound (PLANTS_KV)"},500,origin);
  try{
    let s=await env.PLANTS_KV.get(CFG_KEY+"_stamp");
    if(!s){ const raw=await env.PLANTS_KV.get(CFG_KEY); if(raw){ try{ s=(JSON.parse(raw)||{}).savedAt||""; }catch(e){} } }
    return json({ok:true, savedAt:s||""},200,origin);
  }catch(e){ return json({error:"Stamp failed",detail:String(e)},502,origin); }
}
```

---

## 3. Write the stamp when saving

Inside `handleSaveConfig`, **find this single line:**

```js
  try{ await env.PLANTS_KV.put(CFG_KEY, str); return json({ok:true, savedAt:new Date().toISOString()},200,origin); }
```

**Replace it with:**

```js
  try{
    await env.PLANTS_KV.put(CFG_KEY, str);
    try{ await env.PLANTS_KV.put(CFG_KEY+"_stamp", String((body.config&&body.config.savedAt)||"")); }catch(e){}
    return json({ok:true, savedAt:(body.config&&body.config.savedAt)||new Date().toISOString()},200,origin);
  }
```

Leave the `catch(e){ return json({error:"Save failed"...` line that follows it exactly as it is.

**The detail that matters in edit 3:** the stamp stores the client's own `savedAt`, not a fresh
timestamp. A fresh one would never match the value inside the bundle, so every device would think
something had changed on every single poll, forever.

---

## Checking it worked

After deploying, from a terminal:

```bash
curl -s -X POST -H "Content-Type: application/json" -H "Origin: https://designingla27.github.io" -d '{"type":"cfgstamp"}' https://studioh-ai.warwick-cca.workers.dev/
```

You want `{"ok":true,"savedAt":"2026-08-30T…"}`.

If `savedAt` is empty, the stamp key does not exist yet — change any setting in the app and it will
be written on the next save. If you get an error about the type, edit 1 did not land.

Nothing to do in the app. It tries `cfgstamp` on every poll and drops to the slower path on its own
if the worker does not answer, so it starts using this the moment you deploy.

Full updated source, if you would rather paste the whole file: `worker-ai/src/index.js` in the repo.
