import { bggUrl, type Entry } from "@/lib/entry";

/** The score alone, e.g. on the corner of a list card's cover. */
export function ScoreBadge({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span
      title="BoardGameGeek score"
      className={`inline-flex h-6 min-w-8 items-center justify-center rounded-md px-1 text-xs font-bold tabular-nums shadow-sm ${tone(rating)} ${className}`}
    >
      {score(rating)}
    </span>
  );
}

/** 8.5 stays 8.5; a whole number drops the ".0" — 10, not 10.0. */
const score = (r: number) => (Number.isInteger(r) ? String(r) : r.toFixed(1));

/** BGG-style colour by score: the greener, the better liked. */
function tone(r: number) {
  if (r >= 8) return "bg-emerald-600 text-white";
  if (r >= 7) return "bg-emerald-500 text-white";
  if (r >= 6) return "bg-sky-600 text-white";
  return "bg-neutral-500 text-white";
}

/**
 * The BGG score as a badge linking to the game on BGG, with the vote count beside it, smaller.
 * No score yet (or no BGG match): just the link.
 */
export function BggScore({ game, large }: { game: Entry; large?: boolean }) {
  const b = game.bgg;
  const label = b ? "BGG" : "Search BGG";
  return (
    <a
      href={bggUrl(game)}
      target="_blank"
      rel="noreferrer"
      title={b?.rating ? `BoardGameGeek score, from ${b.ratings} early ratings` : "BoardGameGeek"}
      className="group inline-flex items-center gap-2 whitespace-nowrap"
    >
      {b?.rating ? (
        <span
          className={`inline-flex items-center justify-center rounded-md font-bold tabular-nums ${tone(b.rating)} ${
            large ? "h-14 w-14 text-2xl" : "h-7 w-10 text-sm"
          }`}
        >
          {score(b.rating)}
        </span>
      ) : null}
      <span className={`flex flex-col leading-tight ${large ? "" : "text-xs"}`}>
        <span className="font-semibold text-neutral-700 group-hover:underline dark:text-neutral-200">{label} ↗</span>
        {b?.ratings ? (
          <span className="text-neutral-500 dark:text-neutral-400">{b.ratings.toLocaleString("en")} ratings</span>
        ) : b && large ? (
          <span className="text-neutral-500 dark:text-neutral-400">No score yet</span>
        ) : null}
      </span>
    </a>
  );
}

export function DemoOnly() {
  return (
    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-800 dark:text-amber-300">
      Demo only — not sold at the fair
    </span>
  );
}

/** List price from the official listing, and BGG's fair price when the publisher gave a different one. */
export function PriceLine({ game }: { game: Entry }) {
  const demo = game.bgg?.demoOnly;
  const show = demo ? undefined : game.bgg?.showPrice;
  // €149.99 listed and €150 at the fair is the same price.
  const amount = (p?: string) => Number(p?.replace(/[^\d.]/g, ""));
  const differs = show && !(Math.abs(amount(show) - amount(game.price)) < 1);
  if (!game.price && !show && !demo) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {game.price ? (
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{game.price}</span>
      ) : null}
      {differs ? (
        <span className="text-neutral-600 dark:text-neutral-300">
          <span className="font-semibold tabular-nums">{show}</span> at the fair
        </span>
      ) : null}
      {demo ? (
        <span className="text-sm">
          <DemoOnly />
        </span>
      ) : null}
    </div>
  );
}
