"use client";

import { useMemo, useSyncExternalStore } from "react";

/** What you mean to do about a game. One at a time; clearing it forgets the game. */
export type Mark = "star" | "buy" | "bought";

export const MARKS: { id: Mark; label: string; short: string }[] = [
  { id: "star", label: "Interested", short: "Interested" },
  { id: "buy", label: "Want to buy", short: "Buy" },
  { id: "bought", label: "Bought", short: "Bought" },
];

/**
 * A game's mark and when it was last changed. A cleared mark is kept as `null` with its time, so a
 * device that syncs later can tell "cleared since" from "never had one" — newest change wins.
 */
export type Stamped = { mark: Mark | null; at: number };

const KEY = "spiel26:marks:v2";
/** v1 stored { [id]: Mark } without times; read once and carried over as "changed long ago". */
const V1_KEY = "spiel26:marks";

// Marks live in localStorage, so they work offline and without an account; lib/sync.ts mirrors them
// to the database when you're signed in. This store keeps every tab in sync.
const listeners = new Set<() => void>();
const changeHandlers = new Set<(id: string, entry: Stamped) => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw() {
  try {
    const v2 = localStorage.getItem(KEY);
    if (v2 !== null) return v2;
    const v1 = JSON.parse(localStorage.getItem(V1_KEY) ?? "{}") as Record<string, Mark>;
    return JSON.stringify(Object.fromEntries(Object.entries(v1).map(([id, mark]) => [id, { mark, at: 0 }])));
  } catch {
    return "{}";
  }
}

function parse(raw: string): Record<string, Stamped> {
  try {
    const saved = JSON.parse(raw);
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, Stamped>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage blocked (some private modes): nothing to save to.
  }
  listeners.forEach((l) => l());
}

/** Every game's mark and time, cleared ones included — what sync compares. */
export function readStamped() {
  return parse(readRaw());
}

/** Current marks, { [game id]: Mark }, for rendering. */
export function useMarks() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  return useMemo(() => {
    const marks: Record<string, Mark> = {};
    for (const [id, e] of Object.entries(parse(raw))) if (e.mark) marks[id] = e.mark;
    return marks;
  }, [raw]);
}

/** Sets a game's mark; setting the mark it already has clears it. */
export function toggleMark(id: string, mark: Mark) {
  const all = readStamped();
  const entry: Stamped = { mark: all[id]?.mark === mark ? null : mark, at: Date.now() };
  all[id] = entry;
  write(all);
  changeHandlers.forEach((h) => h(id, entry));
}

/** Lets the sync layer hear about each change as it's made. */
export function onMarkChange(handler: (id: string, entry: Stamped) => void) {
  changeHandlers.add(handler);
  return () => changeHandlers.delete(handler);
}

/**
 * Folds in marks from elsewhere, keeping whichever side changed each game last. Returns the local
 * entries that are newer than what came in — the ones to send back.
 */
export function mergeMarks(remote: Record<string, Stamped>) {
  const all = readStamped();
  let changed = false;
  for (const [id, r] of Object.entries(remote)) {
    if (!all[id] || r.at > all[id].at) {
      all[id] = r;
      changed = true;
    }
  }
  if (changed) write(all);
  return Object.entries(all).filter(([id, e]) => !remote[id] || e.at > remote[id].at);
}
