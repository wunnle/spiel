"use client";

import { useMemo, useSyncExternalStore } from "react";

/** What you mean to do about a game. One at a time; clearing it forgets the game. */
export type Mark = "star" | "buy" | "bought";

export const MARKS: { id: Mark; label: string; short: string }[] = [
  { id: "star", label: "Interested", short: "Interested" },
  { id: "buy", label: "Want to buy", short: "Buy" },
  { id: "bought", label: "Bought", short: "Bought" },
];

const KEY = "spiel26:marks";

// Marks live in localStorage as { [game id]: Mark }; this store keeps every tab in sync.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function read() {
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return "{}";
  }
}
function parse(raw: string): Record<string, Mark> {
  try {
    const saved = JSON.parse(raw);
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

export function useMarks() {
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  return useMemo(() => parse(raw), [raw]);
}

/** Sets a game's mark; setting the mark it already has clears it. */
export function toggleMark(id: string, mark: Mark) {
  const marks = parse(read());
  if (marks[id] === mark) delete marks[id];
  else marks[id] = mark;
  try {
    localStorage.setItem(KEY, JSON.stringify(marks));
  } catch {
    // Storage blocked (some private modes): nothing to save to.
  }
  listeners.forEach((l) => l());
}
