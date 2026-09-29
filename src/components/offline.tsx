"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BASE } from "@/lib/site";

/** Shared with scripts/sw.js, which serves covers cache-first from here. */
const COVERS_CACHE = "covers";

/**
 * Loaded on demand: this sits in the layout, and game pages shouldn't have to carry the whole
 * catalogue just for a button. (The service worker precaches it either way.)
 */
async function coverUrls() {
  const { CATALOG, coverUrl } = await import("@/lib/catalog");
  return CATALOG.flatMap((g) => coverUrl(g, "sm") ?? []);
}

/** Registers the service worker (production builds only — it would cache dev's hot-reloaded chunks). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
  }, []);
  return null;
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

const noop = () => () => {};
const cacheSupported = () => "caches" in window && "serviceWorker" in navigator;

type State = { phase: "idle" | "saving" | "done"; saved: number; total: number };

/**
 * Downloads every list-size cover into the cache, so the whole list shows its box art in the halls
 * without signal. The list data and your marks are already on the device; pages you open are cached
 * as you go, and the rest fall back to a page built from the list data.
 */
export function SaveOffline() {
  const online = useOnline();
  const supported = useSyncExternalStore(noop, cacheSupported, () => false);
  const [state, setState] = useState<State>({ phase: "idle", saved: 0, total: 0 });

  useEffect(() => {
    if (!supported) return;
    Promise.all([coverUrls(), caches.open(COVERS_CACHE).then((c) => c.keys())])
      .then(([urls, keys]) => {
        const have = new Set(keys.map((k) => new URL(k.url).pathname));
        const saved = urls.filter((u) => have.has(u)).length;
        setState({ phase: saved >= urls.length ? "done" : "idle", saved, total: urls.length });
      })
      .catch(() => {});
  }, [supported]);

  async function save() {
    setState((s) => ({ ...s, phase: "saving" }));
    const urls = await coverUrls();
    const total = urls.length;
    const cache = await caches.open(COVERS_CACHE);
    const have = new Set((await cache.keys()).map((k) => new URL(k.url).pathname));
    const todo = urls.filter((u) => !have.has(u));
    let saved = total - todo.length;
    // A few at a time: fast on fair wifi, gentle on a phone.
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        for (let url; (url = todo.shift()); ) {
          try {
            await cache.add(url);
            saved++;
            if (saved % 25 === 0) setState({ phase: "saving", saved, total });
          } catch {
            // Offline mid-way or a missing file; the next run picks it up.
          }
        }
      }),
    );
    setState({ phase: saved >= total ? "done" : "idle", saved, total });
  }

  if (!supported || !state.total) return null;
  const { total } = state;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
      {!online ? (
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
          Offline
        </span>
      ) : null}
      {state.phase === "done" ? (
        <span>Saved for offline ✓</span>
      ) : state.phase === "saving" ? (
        <span className="tabular-nums">
          Saving covers… {state.saved.toLocaleString("en")} / {total.toLocaleString("en")}
        </span>
      ) : online ? (
        <button
          type="button"
          onClick={save}
          className="font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
        >
          Save for offline (~{Math.round((total * 14) / 1000)} MB)
        </button>
      ) : null}
    </div>
  );
}
