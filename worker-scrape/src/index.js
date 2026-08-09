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
      if (body.type === "pricelook") return json(await priceLook(body));
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

// ── price lookup across YOUR suppliers ───────────────────────
// Free web search is not available to a Worker — Bing serves a bot page, DuckDuckGo
// a challenge, Google a consent wall. So this does not search the web at all: it
// searches the supplier sites the designer actually buys from, using each site's own
// search. Narrower on purpose, and the prices come from sources worth bidding off.
//
// It finds LIST prices only. A trade cost is an account-specific negotiated rate and
// exists on no public page — every result carries its source and nothing auto-fills.

// Most storefronts are one of a handful of platforms, so a search path usually just works.
const SEARCH_PATHS = [
  "/search?q=",                 // Shopify, many customs
  "/?s=",                       // WooCommerce / WordPress
  "/catalogsearch/result/?q=",  // Magento
  "/search?search_query=",      // BigCommerce
  "/search/?text=",
];

async function priceLook(b) {
  const name = String(b.name || "").trim();
  if (!name) return { ok: false, error: "no product name" };
  const sites = (b.sites || []).map(x => String(x || "").trim()).filter(Boolean).slice(0, 6);
  if (!sites.length) return { ok: false, error: "no supplier sites configured" };

  const terms = name.replace(/[^\w\s.\-]/g, " ").replace(/\s+/g, " ").trim();
  const cands = [], tried = [];

  for (const site of sites) {
    let origin;
    try { origin = new URL(/^https?:\/\//i.test(site) ? site : "https://" + site).origin; }
    catch (e) { continue; }

    const hit = await searchSite(origin, terms);
    tried.push({ site: origin.replace(/^https?:\/\//, ""), found: hit.length });
    for (const u of hit.slice(0, 3)) {
      const c = await priceFromPage(u);
      if (c) cands.push(c);
      if (cands.length >= 10) break;
    }
    if (cands.length >= 10) break;
  }

  // Prefer pages that publish real product data over ones we had to read prose from.
  cands.sort((a, c) => (c.hasSchema - a.hasSchema) || (a.price - c.price));
  return { ok: true, query: terms, tried, candidates: cands };
}

// Try each platform's search path until one returns product links.
async function searchSite(origin, terms) {
  const out = [], seen = new Set();
  for (const path of SEARCH_PATHS) {
    if (out.length) break;
    const url = origin + path + encodeURIComponent(terms);
    try {
      const { html } = await getHtml(url);
      const re = /href=["']([^"']*\/products?\/[^"']+)["']/gi;
      let m;
      while ((m = re.exec(html)) && out.length < 6) {
        try {
          const a = new URL(m[1], origin).href.split("#")[0].replace(/\?.*$/, "");
          if (new URL(a).origin !== origin) continue;      // stay on the supplier's own site
          if (seen.has(a)) continue;
          seen.add(a); out.push(a);
        } catch (e) {}
      }
    } catch (e) { /* wrong platform for this path — try the next */ }
  }
  return out;
}

async function priceFromPage(u) {
  try {
    const { html, finalUrl } = await getHtml(u);
    const ld = collectJsonLd(html);
    const prod = ld.find(isProduct);
    const meta = collectMeta(html);
    let price = 0, cur = "", title = "", unit = "";
    if (prod) {
      const off = [].concat(prod.offers || []).filter(Boolean)[0] || {};
      price = num(off.price || off.lowPrice);
      cur = off.priceCurrency || "";
      title = String(prod.name || "").slice(0, 140);
      unit = String(off.unitText || (off.priceSpecification && off.priceSpecification.unitText) || "").slice(0, 24);
    }
    if (!price && meta["product:price:amount"]) { price = num(meta["product:price:amount"]); cur = meta["product:price:currency"] || ""; }
    if (!title) title = decodeEntities(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)).trim().slice(0, 140);
    // Guess the unit from the page when the data does not say — the difference between
    // $14/sf and $14/piece is the whole estimate.
    if (!unit) {
      const near = html.slice(0, 200000);
      if (/per\s*(sq\.?\s*ft|square\s*foot)|\/\s*sq\.?\s*ft|\bsf\b/i.test(near)) unit = "sf";
      else if (/per\s*(piece|each)|\/\s*ea\b/i.test(near)) unit = "each";
      else if (/per\s*(ton|pallet|box|carton)/i.test(near)) unit = (near.match(/per\s*(ton|pallet|box|carton)/i) || [])[1] || "";
    }
    if (!(price > 0)) return null;
    return { price, currency: cur || "USD", unit: unit.toLowerCase(), title,
             url: finalUrl, host: new URL(finalUrl).host.replace(/^www\./, ""), hasSchema: !!prod };
  } catch (e) { return null; }
}
function num(v) { const n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.]/g, "")); return isFinite(n) ? n : 0; }

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
