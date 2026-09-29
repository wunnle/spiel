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
    <ToolRow
      icon={<DownloadIcon className="h-5 w-5" />}
      title="Save for offline"
      note={
        state.phase === "done"
          ? "All covers are saved on this device ✓"
          : state.phase === "saving"
            ? `Saving covers… ${state.saved.toLocaleString("en")} / ${total.toLocaleString("en")}`
            : `Downloads every cover (~${Math.round((total * 14) / 1000)} MB) so the list works with no signal in the halls. Pages you open are saved anyway.`
      }
      action={
        state.phase === "idle" && online ? (
          <button type="button" onClick={save} className={TOOL_BUTTON}>
            Save
          </button>
        ) : null
      }
    />
  );
}

function DownloadIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
    </svg>
  );
}

/** Shown in the header only while there's no connection: status, not an action. */
export function OfflineBadge() {
  const online = useOnline();
  if (online) return null;
  return (
    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
      Offline
    </span>
  );
}

export const TOOL_BUTTON =
  "shrink-0 rounded-md border border-black/10 px-2.5 py-1 text-sm font-medium text-neutral-700 hover:border-black/25 disabled:opacity-40 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/30";

/** One tool in the account menu: name, a line of explanation, and its button. */
export function ToolRow({
  icon,
  title,
  note,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-2 py-2.5">
      <span className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-800 dark:text-neutral-200">{title}</p>
        <p className="text-xs leading-snug text-neutral-500 dark:text-neutral-400">{note}</p>
      </div>
      {action}
    </div>
  );
}
