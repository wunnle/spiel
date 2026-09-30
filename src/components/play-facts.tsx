import Link from "next/link";
import type { Entry } from "@/lib/entry";
import { hallTone } from "@/lib/halls";
import { boothMap, splitBooth } from "@/lib/site";

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

function PinIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

const PILL =
  "flex items-center gap-1.5 rounded-md bg-black/[0.04] px-2.5 py-1 font-semibold tabular-nums text-neutral-900 dark:bg-white/[0.06] dark:text-neutral-50";
const PILL_ICON = "h-4 w-4 text-neutral-500 dark:text-neutral-400";

/**
 * The game page's pills: players, playing time, and a pin per booth that opens the hall plan with
 * the stand circled. "at …" (a distributor's booth) and the not-yet-listed note go underneath.
 */
export function FactPills({ game, atHref }: { game: Entry; /** The distributor's page, for "At …'s booth". */ atHref?: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {game.players ? (
          <span className={PILL} aria-label={`${game.players} players`} title={`${game.players} players`}>
            <PlayersIcon className={PILL_ICON} />
            {game.players}
          </span>
        ) : null}
        {game.time ? (
          <span className={PILL} aria-label={`${game.time} minutes`} title={`${game.time} minutes`}>
            <ClockIcon className={PILL_ICON} />
            {game.time}m
          </span>
        ) : null}
        {game.booths.map((id) => {
          const { hall, stand } = splitBooth(id);
          return (
            <a
              key={id}
              href={boothMap(id)}
              target="_blank"
              rel="noreferrer"
              title="Open the hall plan"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold tabular-nums hover:brightness-95 dark:hover:brightness-125 ${hallTone(hall).pill}`}
            >
              <PinIcon className="h-4 w-4 opacity-70" />
              Hall {hall} · {stand}
            </a>
          );
        })}
      </div>
      {!game.booths.length || game.at || game.unlisted ? (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {!game.booths.length ? (
            "Booth not announced yet"
          ) : game.at ? (
            <>
              At{" "}
              {atHref ? (
                <Link href={atHref} className="font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300">
                  {game.at}
                </Link>
              ) : (
                game.at
              )}
              &apos;s booth
            </>
          ) : null}
          {game.unlisted ? (
            <span className="block">Publisher&apos;s booth — this game isn&apos;t in the official novelties list yet</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/** Player count and playing time for a list row, each behind an icon instead of a label. */
export function PlayFacts({ game }: { game: Entry }) {
  const facts = [
    game.players && { Icon: PlayersIcon, value: game.players, label: `${game.players} players` },
    game.time && { Icon: ClockIcon, value: `${game.time}m`, label: `${game.time} minutes` },
  ].filter((f) => !!f);
  if (!facts.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 text-sm text-neutral-600 dark:text-neutral-400">
      {facts.map(({ Icon, value, label }) => (
        <span
          key={label}
          aria-label={label}
          title={label}
          className="flex items-center gap-1.5 tabular-nums"
        >
          <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          {value}
        </span>
      ))}
    </div>
  );
}
