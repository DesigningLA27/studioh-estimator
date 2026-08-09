// studioh-scrape — reads supplier product pages for the Materials and Furnishings
// libraries. Deliberately a SEPARATE worker from studioh-ai: it holds no keys and
// touches no storage, so nothing here can break the plant book, projects or images.
//
//   cd worker-scrape && npx wrangler deploy
//
// Three request shapes, matching the three ways a supplier hands you a link:
//   {type:"scrape",   url}            one product page
//   {type:"discover", url, limit}     a collection page or a bare domain -> product URLs
//   {type:"batch",    urls[]}         several product pages at once

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ ok: false, error: "bad JSON body" }, 400); }

    try {
      if (body.type === "scrape")   return json(await scrapeOne(body.url));
      if (body.type === "discover") return json(await discover(body.url, +body.limit || 60));
      if (body.type === "batch") {
        const urls = (body.urls || []).slice(0, 12);          // keep inside the CPU budget
        const out = [];
        for (const u of urls) out.push(await scrapeOne(u));    // serial: politer to the origin
        return json({ ok: true, results: out });
      }
      return json({ ok: false, error: "unknown type" }, 400);
    } catch (e) {
      return json({ ok: false, error: (e && e.message) || "error" }, 500);
    }
  },
};

// ── fetch + parse one page ───────────────────────────────────
async function getHtml(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    redirect: "follow",
  });
  if (!r.ok) throw new Error("http " + r.status);
  const ct = r.headers.get("content-type") || "";
  if (!/html|xml/i.test(ct)) throw new Error("not a web page (" + ct + ")");
  return { html: (await r.text()).slice(0, 1500000), finalUrl: r.url || url };
}

async function scrapeOne(url) {
  url = String(url || "").trim();
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: "bad url", url };

  let html, finalUrl;
  try { ({ html, finalUrl } = await getHtml(url)); }
  catch (e) { return { ok: false, error: (e && e.message) || "fetch failed", url }; }

  // schema.org Product is the prize — when a site publishes it, name, brand, price,
  // SKU and images are exact and nothing has to be inferred from prose.
  const ld = collectJsonLd(html);
  const product = ld.find(isProduct) || null;

  const meta = collectMeta(html);
  const images = collectImages(html, finalUrl, product, meta);

  return {
    ok: true,
    url: finalUrl,
    origin: new URL(finalUrl).origin,
    kind: product ? "product" : "page",
    title: decodeEntities(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)).trim().slice(0, 300),
    product,
    meta: pick(meta, ["og:title","og:description","og:site_name","og:image","og:type",
                      "product:price:amount","product:price:currency","product:brand","description"]),
    images,
    text: readableText(html),
  };
}

// ── discovery: collection page, or a bare domain via sitemap ──
async function discover(url, limit) {
  url = String(url || "").trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url.replace(/^\/+/, "");
  let origin;
  try { origin = new URL(url).origin; } catch (e) { return { ok: false, error: "bad url" }; }

  const found = [];   // {url, title}
  const seen = new Set();
  const add = (u, title) => {
    try {
      const a = new URL(u, origin).href.split("#")[0].replace(/\?.*$/, "");
      if (!seen.has(a) && /\/products?\//i.test(a)) { seen.add(a); found.push({ url: a, title: title || "" }); }
    } catch (e) {}
  };

  // 1 · the page itself, if it is a collection listing
  let pageTitle = "";
  try {
    const { html, finalUrl } = await getHtml(url);
    pageTitle = decodeEntities(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)).trim().slice(0, 200);
    const re = /href=["']([^"']*\/products?\/[^"']+)["']/gi;
    let m;
    while ((m = re.exec(html)) && found.length < limit) add(m[1]);
  } catch (e) { /* not fatal — the sitemap may still work */ }

  // 2 · sitemap. Shopify/Woo/BigCommerce all publish one, and it is the only way a
  //     bare domain can enumerate a catalogue.
  if (found.length < limit) {
    for (const sm of [origin + "/sitemap.xml", origin + "/sitemap_index.xml"]) {
      try {
        const r = await fetch(sm, { headers: { "User-Agent": UA } });
        if (!r.ok) continue;
        const xml = (await r.text()).slice(0, 900000);
        const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(x => decodeEntities(x[1]));
        const childSitemaps = locs.filter(u => /sitemap/i.test(u) && /product/i.test(u));
        for (const child of childSitemaps.slice(0, 3)) {
          if (found.length >= limit) break;
          try {
            const cr = await fetch(child, { headers: { "User-Agent": UA } });
            if (!cr.ok) continue;
            const cx = (await cr.text()).slice(0, 1500000);
            for (const mm of cx.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
              if (found.length >= limit) break;
              add(decodeEntities(mm[1]));
            }
          } catch (e) {}
        }
        if (!childSitemaps.length) locs.forEach(u => { if (found.length < limit) add(u); });
        if (found.length) break;
      } catch (e) {}
    }
  }

  return { ok: true, origin, source: url, title: pageTitle, count: found.length, products: found.slice(0, limit) };
}

// ── parsing helpers ──────────────────────────────────────────
function collectJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 30) {
    try {
      const parsed = JSON.parse(m[1].trim().replace(/^﻿/, ""));
      (Array.isArray(parsed) ? parsed : [parsed]).forEach(o => {
        if (o && Array.isArray(o["@graph"])) out.push(...o["@graph"]);
        else if (o) out.push(o);
      });
    } catch (e) { /* one malformed block should not lose the others */ }
  }
  return out;
}
function isProduct(o) {
  const t = o && o["@type"];
  return !!t && (Array.isArray(t) ? t.some(x => /product/i.test(x)) : /product/i.test(t));
}
function collectMeta(html) {
  const meta = {};
  const re = /<meta[^>]+>/gi;
  let m;
  while ((m = re.exec(html))) {
    const k = (m[0].match(/(?:property|name)=["']([^"']+)["']/i) || [])[1];
    const v = (m[0].match(/content=["']([^"']*)["']/i) || [])[1];
    if (k && v && !meta[k]) meta[k] = decodeEntities(v).slice(0, 500);
  }
  return meta;
}
function collectImages(html, finalUrl, product, meta) {
  const imgs = [];
  const abs = u => { try { return new URL(u, finalUrl).href; } catch (e) { return null; } };
  const push = u => {
    const a = abs(u);
    if (!a || imgs.includes(a)) return;
    if (/\.(svg|gif)(\?|$)/i.test(a)) return;                                  // logos, spinners
    if (/(sprite|logo|icon|placeholder|badge|payment|loading)/i.test(a)) return;
    imgs.push(a);
  };
  if (product && product.image) {
    (Array.isArray(product.image) ? product.image : [product.image])
      .forEach(x => push(typeof x === "string" ? x : (x && x.url)));
  }
  ["og:image", "og:image:secure_url", "twitter:image"].forEach(k => meta[k] && push(meta[k]));
  const re = /<img[^>]+>/gi;
  let m;
  while ((m = re.exec(html)) && imgs.length < 14) {
    const src = (m[0].match(/(?:data-srcset|data-src|srcset|src)=["']([^"']+)["']/i) || [])[1];
    if (src) push(src.split(/[,\s]/)[0]);
  }
  return imgs.slice(0, 10);
}
function readableText(html) {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(t).replace(/[ \t ]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, 14000);
}
function firstMatch(s, re) { const m = s.match(re); return m ? m[1] : ""; }
function pick(o, keys) { const out = {}; keys.forEach(k => { if (o[k]) out[k] = o[k]; }); return out; }
function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/gi, "'").replace(/&#x2F;/gi, "/")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCharCode(+d); } catch (e) { return " "; } });
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
