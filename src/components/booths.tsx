import { hallTone } from "@/lib/halls";
import { boothMap, splitBooth } from "@/lib/site";
import type { Entry } from "@/lib/entry";

/** A pill per booth, tinted by hall, each opening the official hall plan with the stand circled. */
export function Booths({ game, className = "" }: { game: Entry; className?: string }) {
  if (!game.booths.length) {
    return <p className={`text-neutral-400 dark:text-neutral-500 ${className}`}>Booth not announced yet</p>;
  }
  return (
    <div className={`flex flex-wrap items-center gap-1 text-neutral-600 dark:text-neutral-300 ${className}`}>
      {game.booths.map((id) => {
        const { hall, stand } = splitBooth(id);
        return (
          <a
            key={id}
            href={boothMap(id)}
            target="_blank"
            rel="noreferrer"
            title="Open the hall plan"
            className={`rounded px-1.5 py-px font-semibold tabular-nums hover:brightness-95 dark:hover:brightness-125 ${hallTone(hall).pill}`}
          >
            Hall {hall} · {stand}
          </a>
        );
      })}
      {game.at ? <span className="text-neutral-500 dark:text-neutral-400">at {game.at}</span> : null}
      {game.unlisted ? (
        <span className="basis-full text-neutral-400 dark:text-neutral-500">
          Publisher&apos;s booth — this game isn&apos;t in the official novelties list yet
        </span>
      ) : null}
    </div>
  );
}
