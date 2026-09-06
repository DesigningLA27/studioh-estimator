/* Studio H Cost Estimator — service worker.
 *
 * The whole point of this file is that a push still reaches the iPad. So the document
 * is NETWORK-FIRST: online you always get the version that was just pushed, and the
 * cache is only the fallback for when there is no signal. A cache-first worker would
 * happily serve a stale app forever, which is the one failure mode that would make
 * "updates push automatically" a lie.
 *
 * Bump CACHE when the precache list changes. The version string is only used to name
 * the cache — the app's own version banner is independent of it.
 */
const CACHE = "studioh-v1";

// The shell. index.html is ~4.8MB and is the whole app, so this is nearly everything.
const SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

// Hosts that must never be cached or intercepted. The Cloudflare worker answers AI,
// PDF and scrape calls whose replies are per-request; Google Maps tiles are huge and
// licence-restricted. Both go straight to the network, and fail honestly offline.
const PASS_THROUGH = [
  "studioh-ai.",            // the Cloudflare worker (AI, PDF proxy, goods, scrape)
  "maps.googleapis.com",
  "maps.gstatic.com",
  "fal.ai",
  "fal.media",
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // addAll fails the whole install if any one request 404s, and a failed install
    // means no offline at all — so each is added on its own and allowed to miss.
    await Promise.all(SHELL.map(u =>
      fetch(u, { cache: "reload" })
        .then(r => (r.ok ? c.put(u, r) : null))
        .catch(() => null)
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (PASS_THROUGH.some(h => url.hostname.indexOf(h) >= 0)) return;

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;

  const isDoc = req.mode === "navigate" ||
                (req.destination === "document") ||
                (sameOrigin && url.pathname.endsWith(".html"));

  if (isDoc) {
    // Network first. Cache the fresh copy, fall back to the last good one offline.
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const c = await caches.open(CACHE);
          c.put("./index.html", fresh.clone());
        }
        return fresh;
      } catch (_) {
        const cached = await caches.match("./index.html", { ignoreSearch: true });
        if (cached) return cached;
        return new Response(
          "<h1>Offline</h1><p>Studio H has not been opened online on this device yet, " +
          "so there is no saved copy to fall back to.</p>",
          { headers: { "Content-Type": "text/html" }, status: 503 }
        );
      }
    })());
    return;
  }

  // Everything else (icons, manifest, fonts): cache first, then fill in behind.
  // Only 200s are stored — the two data JSONs 404 in production and a cached 404
  // would be indistinguishable from a real answer.
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && (fresh.type === "basic" || fresh.type === "cors")) {
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone());
      }
      return fresh;
    } catch (_) {
      return cached || Response.error();
    }
  })());
});
