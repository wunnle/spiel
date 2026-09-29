import { boothMap, splitBooth } from "@/lib/site";
import type { Entry } from "@/lib/catalog";

/** "Hall 3 · 3U210, Hall 7 · 7E100", each opening the official hall plan with the stand circled. */
export function Booths({ game, className = "" }: { game: Entry; className?: string }) {
  if (!game.booths.length) {
    return <p className={`text-neutral-400 dark:text-neutral-500 ${className}`}>Booth not announced yet</p>;
  }
  return (
    <p className={`text-neutral-600 dark:text-neutral-300 ${className}`}>
      {game.booths.map((id, i) => {
        const { hall, stand } = splitBooth(id);
        return (
          <span key={id}>
            {i > 0 ? ", " : null}
            <a
              href={boothMap(id)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold tabular-nums text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
            >
              {i === 0 || splitBooth(game.booths[i - 1]).hall !== hall ? `Hall ${hall} · ` : ""}
              {stand}
            </a>
          </span>
        );
      })}
      {game.at ? <span className="text-neutral-500 dark:text-neutral-400"> · at {game.at}</span> : null}
      {game.unlisted ? (
        <span className="block text-neutral-400 dark:text-neutral-500">
          Publisher&apos;s booth — this game isn&apos;t in the official novelties list yet
        </span>
      ) : null}
    </p>
  );
}
