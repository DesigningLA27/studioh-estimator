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

const BOOKS = { materials: "materials_v1", furnishings: "furnishings_v1", hoa: "hoa_v1" };
// Every saved project also leaves a small digest here — address, phase, totals, the
// plant palette, the pool and pergola specs. Whole projects are megabytes and live in
// the bid store; this is the ~2KB summary that makes them searchable and answerable
// without reading them all.
const IDX_KEY = "project_index_v1";
// Contributions from anyone holding the link. Submitting needs no key — that is the
// point of a community library — but reading the queue and acting on it does, so a
// contributor never sees anyone else's pending work and nothing reaches the master
// book unreviewed.
const QUEUE_KEY = "contrib_queue_v1";
const QUEUE_MAX = 500;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);

    // Read a stored document. No key: a community's design guidelines are the thing
    // the library exists to share, and the id is unguessable.
    if (request.method === "GET" && url.searchParams.get("doc")) {
      if (!env.DOCS) return json({ ok: false, error: "document storage not bound" }, 500);
      const id = url.searchParams.get("doc");
      const obj = await env.DOCS.get("hoa/" + id);
      if (!obj) return json({ ok: false, error: "not found" }, 404);
      const h = new Headers(CORS);
      h.set("Content-Type", obj.httpMetadata?.contentType || "application/pdf");
      h.set("Content-Disposition", "inline");
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(obj.body, { headers: h });
    }

    if (request.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

    // Upload a document — RAW BYTES, never base64. A scanned CC&R runs to tens of
    // megabytes and base64 in JSON blows the worker's memory budget outright.
    if (url.searchParams.get("docup")) {
      if (!env.ADMIN_KEY || url.searchParams.get("key") !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
      if (!env.DOCS) return json({ ok: false, error: "document storage not bound" }, 500);
      const id = url.searchParams.get("docup");
      const ct = request.headers.get("Content-Type") || "application/pdf";
      await env.DOCS.put("hoa/" + id, request.body, { httpMetadata: { contentType: ct } });
      const head = await env.DOCS.head("hoa/" + id);
      return json({ ok: true, id, size: head ? head.size : 0 });
    }

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

        // KEEP WHAT IS BEING REPLACED. Every guard above can be walked past with
        // force:true, and a client bug that forces a stale array over a good one is
        // unrecoverable the moment it lands. So the previous copy is kept, always,
        // before the new one is written. Ten of them, rolling. This is the difference
        // between a bad write being an annoyance and being a disaster.
        if (prevRaw) {
          try {
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            await env.GOODS.put(k + "__bak__" + stamp, prevRaw, { expirationTtl: 60 * 60 * 24 * 30 });
            const idxRaw = await env.GOODS.get(k + "__baks");
            let idx = [];
            try { idx = JSON.parse(idxRaw || "[]"); } catch (e) {}
            let prevCount = 0;
            try { const pj = JSON.parse(prevRaw); prevCount = (pj && pj.data && pj.data.length) || 0; } catch (e) {}
            idx.unshift({ stamp, count: prevCount, savedAt: (JSON.parse(prevRaw) || {}).savedAt || "" });
            idx = idx.slice(0, 10);
            await env.GOODS.put(k + "__baks", JSON.stringify(idx));
          } catch (e) { /* a backup that fails must not block the save */ }
        }
        const rec = { savedAt: new Date().toISOString(), by: String(b.by || "").slice(0, 60), data: b.data };
        await env.GOODS.put(k, JSON.stringify(rec));
        return json({ ok: true, book: b.book, savedAt: rec.savedAt, count: b.data.length });
      }

      // What previous copies are still available, newest first.
      if (b.type === "listbaks") {
        const k = keyFor(b.book);
        if (!k) return json({ ok: false, error: "unknown book" }, 400);
        const idxRaw = await env.GOODS.get(k + "__baks");
        let idx = []; try { idx = JSON.parse(idxRaw || "[]"); } catch (e) {}
        return json({ ok: true, book: b.book, backups: idx });
      }

      // Put one back. Needs the key, like any other write.
      if (b.type === "restorebak") {
        const k = keyFor(b.book);
        if (!k) return json({ ok: false, error: "unknown book" }, 400);
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        const raw = await env.GOODS.get(k + "__bak__" + String(b.stamp || ""));
        if (!raw) return json({ ok: false, error: "that copy is no longer held" }, 404);
        let rec = null; try { rec = JSON.parse(raw); } catch (e) {}
        if (!rec || !Array.isArray(rec.data)) return json({ ok: false, error: "that copy is unreadable" }, 500);
        return json({ ok: true, book: b.book, data: rec.data, count: rec.data.length, savedAt: rec.savedAt || "" });
      }

      // Verify a link before it is ever offered as a tap target. Cloudflare validates
      // TLS on fetch, so a site with a broken or expired certificate fails here rather
      // than in front of the user as a browser security warning.
      if (b.type === "checkurl") {
        const u = String(b.url || "");
        if (!/^https?:\/\//i.test(u)) return json({ ok: true, safe: false, reason: "not a web address" });
        if (!/^https:\/\//i.test(u)) return json({ ok: true, safe: false, reason: "not encrypted (http)" });
        let r = null, method = "HEAD";
        try {
          r = await fetch(u, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(9000) });
          // Plenty of document servers refuse HEAD; a GET settles it.
          if (r.status === 405 || r.status === 501) { method = "GET"; r = await fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(9000) }); }
        } catch (e) {
          const m = String((e && e.message) || e);
          return json({ ok: true, safe: false,
            reason: /certificat|SSL|TLS/i.test(m) ? "the site's security certificate is not valid" : "the site could not be reached" });
        }
        const ct = (r.headers.get("Content-Type") || "").toLowerCase();
        const len = +(r.headers.get("Content-Length") || 0);
        const finalUrl = r.url || u;
        if (!r.ok) return json({ ok: true, safe: false, status: r.status, reason: "the page returned " + r.status, finalUrl });
        // A file is a document. Anything serving HTML is a page you still have to
        // navigate — a portal, a search form, a management company's site.
        const isFile = /pdf|msword|officedocument|octet-stream/.test(ct) || /\.pdf(\?|$)/i.test(finalUrl);
        return json({ ok: true, safe: true, status: r.status, ct, bytes: len, isFile, method,
                      https: /^https:/i.test(finalUrl), finalUrl });
      }

      // Take a copy of a document the association publishes. Associations reorganise
      // their sites and delete superseded CC&Rs — and a superseded CC&R is exactly the
      // one you need when an approval was granted under it. Streamed straight to R2:
      // these run to tens of megabytes and must never pass through JSON.
      if (b.type === "archive") {
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        if (!env.DOCS) return json({ ok: false, error: "document storage not bound" }, 500);
        const u = String(b.url || "");
        if (!/^https:\/\//i.test(u)) return json({ ok: false, error: "only https can be archived" }, 400);
        let r;
        try { r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(25000) }); }
        catch (e) { return json({ ok: false, error: "could not fetch: " + ((e && e.message) || "failed") }, 502); }
        if (!r.ok) return json({ ok: false, error: "the site returned " + r.status }, 502);
        const ct = (r.headers.get("Content-Type") || "application/pdf").toLowerCase();
        const len = +(r.headers.get("Content-Length") || 0);
        if (len && len > 100 * 1024 * 1024) return json({ ok: false, error: "too large to archive (" + Math.round(len / 1048576) + "MB)" }, 413);
        if (/text\/html/.test(ct)) return json({ ok: false, error: "that address serves a web page, not a document" }, 415);
        const id = String(b.id || ("arch" + Date.now().toString(36)));
        await env.DOCS.put("hoa/" + id, r.body, { httpMetadata: { contentType: ct } });
        const head = await env.DOCS.head("hoa/" + id);
        return json({ ok: true, id, size: head ? head.size : len, ct });
      }

      // Read the whole index. Small enough to send in one go, which is the point.
      if (b.type === "loadindex") {
        const raw = await env.GOODS.get(IDX_KEY);
        if (!raw) return json({ ok: true, found: false, projects: [], savedAt: "" });
        let rec; try { rec = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "index unreadable" }, 500); }
        return json({ ok: true, found: true, projects: rec.projects || [], savedAt: rec.savedAt || "" });
      }

      // Upsert one project's digest, or replace the lot during a backfill.
      if (b.type === "saveindex") {
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        let rec = { savedAt: "", projects: [] };
        const raw = await env.GOODS.get(IDX_KEY);
        if (raw) { try { rec = JSON.parse(raw); } catch (e) {} }
        let list = Array.isArray(rec.projects) ? rec.projects : [];

        if (b.replaceAll && Array.isArray(b.projects)) {
          list = b.projects;
        } else if (b.project && b.project.id) {
          const i = list.findIndex(p => p && p.id === b.project.id);
          // A project keeps its first-seen date and its running count of saves — that
          // count is the honest answer to "which job had the most revisions".
          const prev = i >= 0 ? list[i] : null;
          const merged = Object.assign({}, b.project, {
            firstSeen: (prev && prev.firstSeen) || b.project.savedAt || "",
            saves: ((prev && +prev.saves) || 0) + 1,
          });
          if (i >= 0) list[i] = merged; else list.push(merged);
        } else if (b.removeId) {
          list = list.filter(p => p && p.id !== b.removeId);
        } else {
          return json({ ok: false, error: "nothing to save" }, 400);
        }

        rec = { savedAt: new Date().toISOString(), projects: list.slice(0, 500) };
        await env.GOODS.put(IDX_KEY, JSON.stringify(rec));
        return json({ ok: true, count: rec.projects.length, savedAt: rec.savedAt });
      }

      // Submit — no key. Deliberately open.
      if (b.type === "submit") {
        const book = String(b.book || "").toLowerCase();
        if (["materials", "furnishings", "plants", "hoa"].indexOf(book) < 0) return json({ ok: false, error: "unknown book" }, 400);
        if (!b.item || typeof b.item !== "object") return json({ ok: false, error: "nothing submitted" }, 400);
        const kind = (b.kind === "fix") ? "fix" : "add";

        let rec = { savedAt: "", items: [] };
        const raw = await env.GOODS.get(QUEUE_KEY);
        if (raw) { try { rec = JSON.parse(raw); } catch (e) {} }
        const items = Array.isArray(rec.items) ? rec.items : [];
        const pending = items.filter(x => x && x.status === "pending").length;
        if (pending >= QUEUE_MAX) return json({ ok: false, error: "the review queue is full — try again later" }, 429);

        const entry = {
          id: "sub" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          book, kind, status: "pending",
          by: String(b.by || "").slice(0, 60),
          note: String(b.note || "").slice(0, 600),
          targetId: String(b.targetId || "").slice(0, 80),
          at: new Date().toISOString(),
          item: b.item,
        };
        items.push(entry);
        await env.GOODS.put(QUEUE_KEY, JSON.stringify({ savedAt: entry.at, items: items.slice(-QUEUE_MAX * 3) }));
        return json({ ok: true, id: entry.id });
      }

      // Read the queue — key required, so it is one reviewer's queue, not a forum.
      if (b.type === "loadqueue") {
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        const raw = await env.GOODS.get(QUEUE_KEY);
        if (!raw) return json({ ok: true, items: [] });
        let rec; try { rec = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "queue unreadable" }, 500); }
        return json({ ok: true, items: rec.items || [], savedAt: rec.savedAt || "" });
      }

      // Accept or reject. The decision and who made it stay on the record, so an
      // accepted contribution can be traced back and undone.
      if (b.type === "queueact") {
        if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return json({ ok: false, error: "not authorised" }, 403);
        if (["accept", "reject", "pending"].indexOf(b.action) < 0) return json({ ok: false, error: "unknown action" }, 400);
        const raw = await env.GOODS.get(QUEUE_KEY);
        if (!raw) return json({ ok: false, error: "queue empty" }, 404);
        let rec; try { rec = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "queue unreadable" }, 500); }
        const items = rec.items || [];
        const i = items.findIndex(x => x && x.id === b.id);
        if (i < 0) return json({ ok: false, error: "not in the queue" }, 404);
        items[i].status = b.action;
        items[i].decidedAt = new Date().toISOString();
        if (b.reason) items[i].reason = String(b.reason).slice(0, 300);
        await env.GOODS.put(QUEUE_KEY, JSON.stringify({ savedAt: items[i].decidedAt, items }));
        return json({ ok: true, item: items[i] });
      }

      // A contributor checks on their own submissions and nobody else's.
      if (b.type === "mysubs") {
        const by = String(b.by || "").trim().toLowerCase();
        if (!by) return json({ ok: true, items: [] });
        const raw = await env.GOODS.get(QUEUE_KEY);
        if (!raw) return json({ ok: true, items: [] });
        let rec; try { rec = JSON.parse(raw); } catch (e) { return json({ ok: true, items: [] }); }
        const mine = (rec.items || []).filter(x => x && String(x.by || "").trim().toLowerCase() === by)
          .map(x => ({ id: x.id, book: x.book, kind: x.kind, status: x.status, at: x.at,
                       name: (x.item && (x.item.nm || x.item.name)) || "", reason: x.reason || "" }));
        return json({ ok: true, items: mine });
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
