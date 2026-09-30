/**
 * A colour per hall, so a booth reads at a glance and a walking route groups visually. Class strings
 * are spelled out in full so Tailwind finds them. Unknown halls fall back to grey.
 */
const TONES: Record<string, { dot: string; pill: string; solid: string }> = {
  "1": { dot: "bg-rose-500", pill: "bg-rose-500/12 text-rose-800 dark:text-rose-200", solid: "bg-rose-500 text-white" },
  "2": { dot: "bg-orange-500", pill: "bg-orange-500/12 text-orange-800 dark:text-orange-200", solid: "bg-orange-500 text-white" },
  "3": { dot: "bg-amber-500", pill: "bg-amber-500/15 text-amber-900 dark:text-amber-200", solid: "bg-amber-500 text-neutral-950" },
  "4": { dot: "bg-lime-500", pill: "bg-lime-500/15 text-lime-900 dark:text-lime-200", solid: "bg-lime-500 text-neutral-950" },
  "5": { dot: "bg-emerald-500", pill: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200", solid: "bg-emerald-500 text-white" },
  "6": { dot: "bg-cyan-500", pill: "bg-cyan-500/12 text-cyan-800 dark:text-cyan-200", solid: "bg-cyan-500 text-neutral-950" },
  "7": { dot: "bg-blue-500", pill: "bg-blue-500/12 text-blue-800 dark:text-blue-200", solid: "bg-blue-500 text-white" },
  "8": { dot: "bg-violet-500", pill: "bg-violet-500/12 text-violet-800 dark:text-violet-200", solid: "bg-violet-500 text-white" },
  GA: { dot: "bg-fuchsia-500", pill: "bg-fuchsia-500/12 text-fuchsia-800 dark:text-fuchsia-200", solid: "bg-fuchsia-500 text-white" },
};
const GREY = { dot: "bg-neutral-400", pill: "bg-neutral-500/12 text-neutral-800 dark:text-neutral-200", solid: "bg-neutral-500 text-white" };

export function hallTone(hall: string) {
  return TONES[hall] ?? GREY;
}
