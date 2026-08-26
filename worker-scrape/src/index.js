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
           "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
// A bot filter does not read the User-Agent, it reads the SHAPE of the request. Akamai
// (fxl.com) returns 403 to a UA-plus-two-headers fetch and 200 to the same fetch
// carrying the header set a real Chrome navigation sends — measured, three for three,
// and no single one of these headers is the trigger on its own. Sending the full set
// is the difference between "0 products found" and the 434 that are actually there.
const BROWSER_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Chromium";v="126", "Not:A-Brand";v="24", "Google Chrome";v="126"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    // GET /pdf?url= — raw bytes, for pdf.js in the page. Not JSON, so it sits outside
    // the POST router above.
    if (request.method === "GET") {
      const u = new URL(request.url);
      if (u.pathname === "/pdf") return pdfProxy(u.searchParams.get("url"));
      return json({ ok: false, error: "POST only" }, 405);
    }
    if (request.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ ok: false, error: "bad JSON body" }, 400); }

    try {
      if (body.type === "scrape")   return json(await scrapeOne(body.url));
      // Same as "scrape" but for a page you actually want EVERY photo from — a
      // portfolio project page, not a single-product listing. "scrape" caps at 10
      // deliberately (one hero photo is the point there); this raises that cap without
      // touching the default so every existing caller keeps its current behavior.
      if (body.type === "scrapeall") return json(await scrapeOne(body.url, Math.min(+body.limit || 60, 100)));
      if (body.type === "discover") return json(await discover(body.url, Math.min(+body.limit || 60, 3000)));
      if (body.type === "pricelook") return json(await priceLook(body));
      // A supplier that refuses a crawler will still publish a catalogue and a price
      // list as PDFs, and those are a BETTER source than the website: a price sheet is
      // the authoritative number, not a scraped one. The browser cannot fetch them —
      // a cross-origin PDF is blocked — so proxy the bytes back with CORS and let
      // pdf.js in the page read it. Streamed straight through: base64 of a 30 MB
      // catalogue is what kills a Worker.
      if (body.type === "pdfhead") return json(await pdfHead(body.url));
      // Which pages on this site are the real products? Fetch a couple from each URL
      // shape and report only what it takes to judge richness — never the page text,
      // which would be 14 KB a page for no reason.
      // A sale is advertised, not published as data. It lives in an announcement bar, a
      // banner image's alt text, a /sale collection — so look in all of those places at
      // once and hand back only the words, which is all the model needs.
      if (body.type === "salescan") {
        let origin;
        try { origin = new URL(/^https?:/i.test(body.url) ? body.url : "https://" + body.url).origin; }
        catch (e) { return json({ ok: false, error: "bad url" }); }
        const paths = ["/", "/collections/sale", "/sale", "/collections/clearance", "/clearance", "/promotions"];
        const out = [];
        for (const p of paths) {
          if (out.length >= 5) break;                       // enough evidence; stop knocking
          try {
            const { html, finalUrl } = await getHtml(origin + p);
            const banners = collectAltText(html);
            const text = readableText(html).slice(0, 3500);
            const hit = /\b(sale|clearance|% ?off|discount|promo|save \d|markdown|closeout)\b/i.test(text + " " + banners);
            if (p === "/" || hit) out.push({ path: p, url: finalUrl, banners, text });
          } catch (e) { /* a missing /sale page is the normal case, not an error */ }
        }
        return json({ ok: true, origin, pages: out });
      }
      if (body.type === "sample") {
        const urls = (body.urls || []).slice(0, 14);
        const out = [];
        for (const u of urls) {
          try {
            const r = await scrapeOne(u);
            if (!r.ok) { out.push({ url: u, ok: false }); continue; }
            const p = r.product || {};
            const off = [].concat(p.offers || []).filter(Boolean)[0] || {};
            const price = +String(off.price || off.lowPrice || "").replace(/[^0-9.]/g, "") || 0;
            out.push({
              url: r.url, ok: true,
              images: (r.images || []).length,
              docs: (r.docs || []).length,
              textLen: (r.text || "").length,
              price,
              isProduct: r.kind === "product",
              name: (p.name || r.title || "").slice(0, 90),
              desc: (p.description || (r.meta && r.meta["og:description"]) || "").length,
            });
          } catch (e) { out.push({ url: u, ok: false }); }
        }
        return json({ ok: true, results: out });
      }
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

// ── PDF: is it really one, and how big? ─────────────────────
async function pdfHead(url) {
  url = String(url || "").trim();
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: "bad url" };
  try {
    const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow",
      signal: AbortSignal.timeout(12000) });
    if (!r.ok) return { ok: false, error: "http " + r.status, url };
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const len = +(r.headers.get("content-length") || 0) || 0;
    const lastMod = r.headers.get("last-modified") || "";
    // Some hosts serve a PDF as octet-stream, so trust the magic bytes over the header.
    // Read the first chunk only. arrayBuffer() on the clone pulled the WHOLE file
    // down to look at four bytes — 33 MB for FX's catalogue, every time it is offered.
    let magic = "";
    try {
      const rd = r.body.getReader();
      const { value } = await rd.read();
      if (value && value.length >= 4) magic = String.fromCharCode(value[0], value[1], value[2], value[3]);
      try { await rd.cancel(); } catch (e) {}
    } catch (e) {}
    const isPdf = /pdf/.test(ct) || magic === "%PDF";
    return { ok: true, url: r.url || url, isPdf, contentType: ct, bytes: len, lastMod };
  } catch (e) { return { ok: false, error: (e && e.message) || "fetch failed", url }; }
}
async function pdfProxy(url) {
  url = String(url || "").trim();
  if (!/^https?:\/\//i.test(url)) return json({ ok: false, error: "bad url" }, 400);
  try {
    const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow",
      signal: AbortSignal.timeout(25000) });
    if (!r.ok) return json({ ok: false, error: "http " + r.status }, 502);
    return new Response(r.body, { headers: Object.assign({}, CORS, {
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=86400",
    }) });
  } catch (e) { return json({ ok: false, error: (e && e.message) || "fetch failed" }, 502); }
}

// ── fetch + parse one page ───────────────────────────────────
async function getHtml(url) {
  // A slow origin must not hold the whole scan hostage — one site that never answers
  // used to stall a sale sweep across a dozen brands.
  const r = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
    signal: (typeof AbortSignal !== "undefined" && AbortSignal.timeout) ? AbortSignal.timeout(9000) : undefined,
  });
  if (!r.ok) throw new Error("http " + r.status);
  const ct = r.headers.get("content-type") || "";
  if (!/html|xml/i.test(ct)) throw new Error("not a web page (" + ct + ")");
  return { html: (await r.text()).slice(0, 1500000), finalUrl: r.url || url };
}

async function scrapeOne(url, imgLimit) {
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
  const images = collectImages(html, finalUrl, product, meta, imgLimit);
  const docs = collectDocs(html, finalUrl);

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
    docs,
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
  // "Nothing found" and "we were not allowed to look" are different answers, and
  // reporting the second as the first is how fxl.com came back as an empty catalogue
  // when it has 434 products. Akamai and friends answer 403 to a datacentre fetch
  // however browser-shaped its headers are, so the block has to be said out loud.
  let blocked = "";
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
  } catch (e) {
    const msg = String((e && e.message) || "");
    if (/^http (401|403|429|451)\b/.test(msg)) blocked = msg;   // refused, not empty
  }

  // 2 · sitemap. Shopify/Woo/BigCommerce all publish one, and it is the only way a
  //     bare domain can enumerate a catalogue.
  if (found.length < limit) {
    for (const sm of [origin + "/sitemap.xml", origin + "/sitemap_index.xml"]) {
      try {
        const r = await fetch(sm, { headers: BROWSER_HEADERS });
        if (!r.ok) continue;
        const xml = (await r.text()).slice(0, 900000);
        const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(x => decodeEntities(x[1]));
        const childSitemaps = locs.filter(u => /sitemap/i.test(u) && /product/i.test(u));
        for (const child of childSitemaps.slice(0, 3)) {
          if (found.length >= limit) break;
          try {
            const cr = await fetch(child, { headers: BROWSER_HEADERS });
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

  return { ok: true, origin, source: url, title: pageTitle, count: found.length,
           products: found.slice(0, limit), blocked: found.length ? "" : blocked };
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
function collectImages(html, finalUrl, product, meta, limit) {
  limit = limit || 10;
  const scanCap = limit + 4;   // a little slack for junk filtered out by push()
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
  // Some product pages (tuuci.com is one) put a sitewide "featured" carousel in the
  // header/nav — identical markup on every single page, regardless of product — ahead
  // of the actual product content in DOM order. A plain "first <img> on the page" scan
  // grabs that shared chrome instead of the product's own photo. <main> is the standard
  // HTML5 landmark for "the page's actual content," so when a page declares one, search
  // inside it first and only fall back to the whole page if that comes up empty — this
  // never narrows anything on a page that has no <main>, so it can't regress a supplier
  // that already worked.
  const mainMatch = html.match(/<main[\s>][\s\S]*?<\/main>/i);
  const mainHtml = mainMatch ? mainMatch[0] : "";
  // Same site: the actual per-product lifestyle photo isn't in an <img> at all — it's
  // only linked from a "download this image" / social-share anchor. Read those as image
  // candidates too, scoped to <main> so a footer's own image links (badges, social
  // icons) don't leak in — push() already filters those out by filename anyway.
  const hrefRe = /<a\b[^>]*\bhref=["']([^"']+\.(?:jpe?g|png|webp|avif)(?:\?[^"']*)?)["'][^>]*>/gi;
  let hm;
  const hrefScope = mainHtml || html;
  while ((hm = hrefRe.exec(hrefScope)) && imgs.length < scanCap) push(hm[1]);
  const re = /<img[^>]+>/gi;
  let m;
  const imgScope = mainHtml || html;
  while ((m = re.exec(imgScope)) && imgs.length < scanCap) {
    const src = (m[0].match(/(?:data-srcset|data-src|srcset|src)=["']([^"']+)["']/i) || [])[1];
    if (src) push(src.split(/[,\s]/)[0]);
  }
  // <main> came up with nothing usable (a supplier that doesn't declare one, or whose
  // real content sits outside it) — fall back to the unscoped whole-page scan exactly
  // as before, so nothing that used to work stops working.
  if (mainHtml && !imgs.length) {
    while ((hm = hrefRe.exec(html)) && imgs.length < scanCap) push(hm[1]);
    while ((m = re.exec(html)) && imgs.length < scanCap) {
      const src = (m[0].match(/(?:data-srcset|data-src|srcset|src)=["']([^"']+)["']/i) || [])[1];
      if (src) push(src.split(/[,\s]/)[0]);
    }
  }
  return imgs.slice(0, limit);
}
// Spec sheets, warranties, install guides, usage charts — the documents a designer
// actually needs at CD stage and cannot get from a product photo. Link text is kept as
// the label, because "OGT_Warranty_COC.pdf" tells you far less than "Warranty" does.
// Shopify appends a 32-char hash to uploaded files; nobody wants to read that.
function tidyDocName(key) {
  return decodeURIComponent((key.split("/").pop() || ""))
    .replace(/\.pdf$/i, "")
    .replace(/[_-][0-9a-f]{8,}(?:-[0-9a-f]{4,}){0,4}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Document";
}
function collectDocs(html, finalUrl) {
  const out = [], seen = {};
  const abs = u => { try { return new URL(u, finalUrl).href; } catch (e) { return null; } };
  const re = /<a\b[^>]*href=["']([^"']+\.pdf(?:\?[^"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 12) {
    const href = abs(m[1]); if (!href) continue;
    const key = href.replace(/\?.*$/, "");
    if (seen[key]) continue; seen[key] = 1;
    let label = decodeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    // "Download" names three different files on one page. A generic label is no label.
    if (/^(download|click here|here|view|open|pdf|link|more|read more|learn more|get it)$/i.test(label)) label = "";
    if (!label || label.length > 90) {
      // Fall back to the file name, tidied — better than an empty row in the UI.
      label = tidyDocName(key);
    }
    out.push({ url: href, label: label.slice(0, 90) });
  }
  // Bare hrefs with no anchor text (buttons, JS-driven links) still count.
  const re2 = /href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi;
  while ((m = re2.exec(html)) && out.length < 12) {
    const href = abs(m[1]); if (!href) continue;
    const key = href.replace(/\?.*$/, "");
    if (seen[key]) continue; seen[key] = 1;
    out.push({ url: href, label: tidyDocName(key) });
  }
  return out;
}
// Banner copy is usually an image, and the words are in its alt attribute or in the
// announcement bar's own markup. Both are invisible to plain text extraction.
function collectAltText(html) {
  const bits = [];
  const re = /<img[^>]*\balt=["']([^"']{3,120})["']/gi;
  let m;
  while ((m = re.exec(html)) && bits.length < 40) bits.push(decodeEntities(m[1]));
  const re2 = /<[^>]*class=["'][^"']*(announcement|banner|promo|marquee|ticker)[^"']*["'][^>]*>([\s\S]{0,300}?)<\//gi;
  while ((m = re2.exec(html)) && bits.length < 60) {
    const t = decodeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (t.length > 3) bits.push(t);
  }
  return [...new Set(bits)].join(" | ").slice(0, 2000);
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
