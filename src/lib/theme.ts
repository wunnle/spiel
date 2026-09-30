"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export type Theme = "system" | "light" | "dark";

const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

const systemDark = () => matchMedia("(prefers-color-scheme: dark)").matches;

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark()));
}

export function useTheme() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      // "System" follows the OS if it switches while the page is open.
      const media = matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => apply(read());
      media.addEventListener("change", onChange);
      return () => {
        listeners.delete(l);
        media.removeEventListener("change", onChange);
      };
    },
    read,
    () => "system" as Theme,
  );
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: it applies for this page only.
  }
  apply(theme);
  listeners.forEach((l) => l());
}
