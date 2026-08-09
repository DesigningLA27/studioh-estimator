// ─────────────────────────────────────────────────────────────
// studioh-ai — ADD THIS to the existing Worker's request switch.
//
// Why it has to live here and not in the browser: a page fetch from
// index.html is blocked by CORS on virtually every retail site. The Worker
// has no such restriction, so it fetches, strips the page down, and hands
// back structured data for the client to send to the model.
//
// Deploy: paste the two pieces marked below into the Worker, then
//   npx wrangler deploy
// ─────────────────────────────────────────────────────────────

// ── PIECE 1 · add to the request switch, alongside "fetchimage" etc. ──
//
//   if (body.type === "scrape") return await handleScrape(body, env, cors);
//

// ── PIECE 2 · paste these functions at the bottom of the Worker ──

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function handleScrape(body, env, cors) {
  const url = String(body.url || "").trim();
  if (!/^https?:\/\//i.test(url)) return json({ ok: false, error: "bad url" }, cors);

  let html = "", finalUrl = url;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    finalUrl = r.url || url;
    if (!r.ok) return json({ ok: false, error: "http " + r.status }, cors);
    const ct = r.headers.get("content-type") || "";
    if (!/html|xml/i.test(ct)) return json({ ok: false, error: "not a web page (" + ct + ")" }, cors);
    // Cap the read — some product pages ship megabytes of inlined script.
    html = (await r.text()).slice(0, 1200000);
  } catch (e) {
    return json({ ok: false, error: "fetch failed: " + (e && e.message) }, cors);
  }

  const origin = new URL(finalUrl).origin;

  // 1 · JSON-LD. This is the prize: most retail platforms (Shopify, Magento,
  //     BigCommerce, WooCommerce) publish a schema.org Product with the exact
  //     name, brand, price, currency, SKU and image list. When it is present
  //     nothing has to be inferred.
  const ld = [];
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html)) && ld.length < 25) {
    try {
      const parsed = JSON.parse(m[1].trim().replace(/^﻿/, ""));
      (Array.isArray(parsed) ? parsed : [parsed]).forEach(o => {
        if (o && o["@graph"] && Array.isArray(o["@graph"])) ld.push(...o["@graph"]);
        else if (o) ld.push(o);
      });
    } catch (e) { /* malformed block — skip it, others usually parse */ }
  }
  const isProduct = o => {
    const t = o && o["@type"];
    return t && (Array.isArray(t) ? t.some(x => /product/i.test(x)) : /product/i.test(t));
  };
  const product = ld.find(isProduct) || null;

  // 2 · Meta tags — OpenGraph / Twitter, the reliable fallback for name + image.
  const meta = {};
  const metaRe = /<meta[^>]+>/gi;
  let mm;
  while ((mm = metaRe.exec(html))) {
    const tag = mm[0];
    const k = (tag.match(/(?:property|name)=["']([^"']+)["']/i) || [])[1];
    const v = (tag.match(/content=["']([^"']*)["']/i) || [])[1];
    if (k && v && !meta[k]) meta[k] = decodeEntities(v).slice(0, 400);
  }

  // 3 · Images. Prefer the JSON-LD list, then OG, then <img> in document order.
  const abs = u => { try { return new URL(u, finalUrl).href; } catch (e) { return null; } };
  const imgs = [];
  const pushImg = u => {
    const a = abs(u);
    if (!a || imgs.includes(a)) return;
    if (/\.(svg|gif)(\?|$)/i.test(a)) return;                 // logos/spinners, not product shots
    if (/(sprite|logo|icon|placeholder|badge|payment|swatch-nav)/i.test(a)) return;
    imgs.push(a);
  };
  if (product && product.image) {
    (Array.isArray(product.image) ? product.image : [product.image])
      .forEach(x => pushImg(typeof x === "string" ? x : (x && x.url)));
  }
  ["og:image", "og:image:secure_url", "twitter:image"].forEach(k => meta[k] && pushImg(meta[k]));
  const imgRe = /<img[^>]+>/gi;
  let im;
  while ((im = imgRe.exec(html)) && imgs.length < 14) {
    const tag = im[0];
    const src = (tag.match(/(?:data-srcset|data-src|srcset|src)=["']([^"']+)["']/i) || [])[1];
    if (src) pushImg(src.split(/[,\s]/)[0]);
  }

  // 4 · Readable text. Strip everything that is not prose, then collapse. The
  //     model only needs enough to find specs the structured data missed.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const clean = decodeEntities(text)
    .replace(/[ \t ]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 14000);

  return json({
    ok: true,
    url: finalUrl,
    origin,
    title: decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").trim().slice(0, 300),
    product,                       // schema.org Product, when the site publishes one
    meta: pick(meta, [
      "og:title", "og:description", "og:site_name", "og:image",
      "product:price:amount", "product:price:currency", "product:brand",
      "description", "twitter:title", "twitter:description",
    ]),
    images: imgs.slice(0, 10),
    text: clean,
  }, cors);
}

function pick(o, keys) {
  const out = {};
  keys.forEach(k => { if (o[k]) out[k] = o[k]; });
  return out;
}

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x27;/gi, "'").replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCharCode(+d); } catch (e) { return " "; } });
}

// Match whatever json()/CORS helper the Worker already uses; this is the shape
// the rest of the endpoints return.
function json(obj, cors) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json", ...(cors || {}) },
  });
}
