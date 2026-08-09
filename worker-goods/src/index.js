// studioh-goods — storage for the Materials and Furnishings libraries.
//
// Why these left the shared config bundle: everything (price book, settings,
// favourites, materials, furnishings) used to push and pull as ONE value. So a
// single settings change re-uploaded every material, and a stale price book on one
// device blocked a materials import on another — two things with nothing to do with
// each other. Each book now has its own key and syncs independently.
//
//   cd worker-goods
//   npx wrangler secret put ADMIN_KEY     (same key you use for the plant book)
//   npx wrangler deploy
//
//   {type:"loadgoods", book}                    -> {ok, book, data, savedAt, count}
//   {type:"savegoods", book, key, data, by}     -> {ok, savedAt, count}
//   {type:"statgoods"}                          -> sizes of both, no payload

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BOOKS = { materials: "materials_v1", furnishings: "furnishings_v1" };

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

    let b;
    try { b = await request.json(); }
    catch (e) { return json({ ok: false, error: "bad JSON body" }, 400); }

    const keyFor = name => BOOKS[String(name || "").toLowerCase()];

    try {
      if (b.type === "loadgoods") {
        const k = keyFor(b.book);
        if (!k) return json({ ok: false, error: "unknown book" }, 400);
        const raw = await env.GOODS.get(k);
        if (!raw) return json({ ok: true, book: b.book, found: false, data: [], savedAt: "", count: 0 });
        let rec;
        try { rec = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "stored data unreadable" }, 500); }
        const data = rec.data || [];
        return json({ ok: true, book: b.book, found: true, data, savedAt: rec.savedAt || "", by: rec.by || "", count: data.length });
      }

      if (b.type === "savegoods") {
        const k = keyFor(b.book);
        if (!k) return json({ ok: false, error: "unknown book" }, 400);
        // Same gate as the plant book: without the key this is read-only, so a link
        // shared with someone cannot overwrite the library.
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        if (!Array.isArray(b.data)) return json({ ok: false, error: "data must be an array" }, 400);

        // Refuse a write that would wipe a populated book. Nearly always a device
        // that failed to load before saving, and it is unrecoverable once written.
        const prevRaw = await env.GOODS.get(k);
        if (prevRaw && !b.force) {
          let prev = null;
          try { prev = JSON.parse(prevRaw); } catch (e) {}
          const had = (prev && prev.data && prev.data.length) || 0;
          if (had > 20 && b.data.length < had * 0.5) {
            return json({ ok: false, error: "refused: would drop " + had + " items to " + b.data.length +
                          ". Pull first, or resend with force:true if this is deliberate.", had, sending: b.data.length }, 409);
          }
          // Row counts alone do not catch the real loss: two tabs open, the stale one
          // saves its pre-edit array over the edited one and every count still matches,
          // so a rename or a price silently reverts. `base` is the savedAt the device
          // last saw; if the stored copy has moved on since, that device is writing over
          // work it never loaded.
          const stored = (prev && prev.savedAt) || "";
          if (stored && b.base !== undefined && b.base !== stored) {
            return json({ ok: false, stale: true,
              error: "refused: the server copy changed after this device loaded it. Pull first.",
              storedAt: stored, sentBase: b.base || "" }, 409);
          }
        }

        const rec = { savedAt: new Date().toISOString(), by: String(b.by || "").slice(0, 60), data: b.data };
        await env.GOODS.put(k, JSON.stringify(rec));
        return json({ ok: true, book: b.book, savedAt: rec.savedAt, count: b.data.length });
      }

      if (b.type === "statgoods") {
        const out = {};
        for (const [name, k] of Object.entries(BOOKS)) {
          const raw = await env.GOODS.get(k);
          let count = 0, savedAt = "";
          if (raw) { try { const r = JSON.parse(raw); count = (r.data || []).length; savedAt = r.savedAt || ""; } catch (e) {} }
          out[name] = { count, savedAt, bytes: raw ? raw.length : 0 };
        }
        return json({ ok: true, books: out });
      }

      return json({ ok: false, error: "unknown type" }, 400);
    } catch (e) {
      return json({ ok: false, error: (e && e.message) || "error" }, 500);
    }
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
