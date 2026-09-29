// Service worker template. scripts/postbuild.mjs fills in VERSION and PRECACHE and writes it to out/sw.js.
//
//   static-<version>  the app itself: list page, offline game shell, JS/CSS — precached on install
//   pages-<version>   game pages as you open them — dropped on the next deploy, since they point at
//                     that build's JS
//   covers            box art; names never change, so it survives deploys (see SaveOffline)

const VERSION = "__VERSION__";
const PRECACHE = __PRECACHE__;
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const COVERS = "covers";
const SCOPE = self.registration.scope;
/** How long to wait on a slow connection (hall wifi) before answering from the cache instead. */
const PATIENCE = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new URL(p, SCOPE).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES, COVERS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Cached responses are keyed without the query string: Next adds a per-request `_rsc` param. */
const keyOf = (url) => url.origin + url.pathname;

async function cacheFirst(request, cacheName) {
  const key = keyOf(new URL(request.url));
  const hit = await caches.match(key);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) (await caches.open(cacheName)).put(key, res.clone());
  return res;
}

/** Network first so pages stay fresh, but a cached copy wins if the network is slow or gone. */
async function networkFirst(request, fallback) {
  const url = new URL(request.url);
  const key = keyOf(url);
  const pages = await caches.open(PAGES);
  const network = fetch(request).then((res) => {
    if (res.ok) pages.put(key, res.clone());
    return res;
  });
  const cached = await caches.match(key);
  if (cached) {
    return Promise.race([network.catch(() => cached), new Promise((r) => setTimeout(() => r(cached), PATIENCE))]);
  }
  try {
    return await network;
  } catch (err) {
    const other = await fallback(url);
    if (other) return other;
    throw err;
  }
}

/** A game page never opened while online: the shell rebuilds it from the list data. */
async function pageFallback(url) {
  const path = url.pathname.slice(new URL(SCOPE).pathname.length);
  if (path.startsWith("games/")) return caches.match(new URL("offline-game/", SCOPE).href);
  return caches.match(SCOPE);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Firebase's sign-in helper must always come fresh from the network.
  if (url.pathname.includes("/__/")) return;

  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (url.pathname.includes("/covers/")) {
    event.respondWith(cacheFirst(request, COVERS));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, pageFallback));
  } else {
    // RSC payloads for client-side navigation, the manifest, icons. With nothing cached offline this
    // fails, and Next falls back to a full page load, which the navigate branch above handles.
    event.respondWith(networkFirst(request, async () => undefined));
  }
});
