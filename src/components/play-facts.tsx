import type { Entry } from "@/lib/catalog";

function PlayersIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.5a6.5 6.5 0 0 1 3 5.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/**
 * Player count and playing time, each behind an icon instead of a label. `large` is the game page's
 * version; the list uses the inline one.
 */
export function PlayFacts({ game, large }: { game: Entry; large?: boolean }) {
  const facts = [
    game.players && { Icon: PlayersIcon, value: game.players, label: `${game.players} players` },
    game.time && { Icon: ClockIcon, value: `${game.time}m`, label: `${game.time} minutes` },
  ].filter((f) => !!f);
  if (!facts.length) return null;
  return (
    <div
      className={
        large
          ? "flex flex-wrap gap-2"
          : "flex flex-wrap items-center gap-x-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100"
      }
    >
      {facts.map(({ Icon, value, label }) => (
        <span
          key={label}
          aria-label={label}
          title={label}
          className={
            large
              ? "flex items-center gap-2 rounded-lg bg-black/[0.04] px-3 py-1.5 text-lg font-semibold tabular-nums text-neutral-900 dark:bg-white/[0.06] dark:text-neutral-50"
              : "flex items-center gap-1.5 tabular-nums"
          }
        >
          <Icon className={large ? "h-5 w-5 text-neutral-500 dark:text-neutral-400" : "h-4 w-4 text-neutral-500 dark:text-neutral-400"} />
          {value}
        </span>
      ))}
    </div>
  );
}
