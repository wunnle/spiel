"use client";

import { setTheme, useTheme, type Theme } from "@/lib/theme";

const OPTIONS: { id: Theme; label: string; icon: React.ReactNode }[] = [
  {
    id: "system",
    label: "System",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    id: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </>
    ),
  },
  { id: "dark", label: "Dark", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /> },
];

/** System / Light / Dark, as a small segmented control for the header menu. */
export function ThemeSwitch() {
  const theme = useTheme();
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-1.5">
      <span className="text-neutral-800 dark:text-neutral-200">Appearance</span>
      <div role="radiogroup" aria-label="Appearance" className="flex rounded-md bg-black/[0.05] p-0.5 dark:bg-white/[0.08]">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={theme === o.id}
            title={o.label}
            aria-label={o.label}
            onClick={() => setTheme(o.id)}
            className={`rounded px-1.5 py-1 transition-colors ${
              theme === o.id
                ? "bg-white text-orange-600 shadow-sm dark:bg-neutral-700 dark:text-orange-400"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {o.icon}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
