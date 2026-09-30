import Link from "next/link";
import { gamePath, type Entry } from "@/lib/entry";
import { DemoOnly, ScoreBadge } from "./bgg";
import { Booths } from "./booths";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";
import { PlayFacts } from "./play-facts";

/**
 * Just what you scan the list for; the rest is on the game page. In order of weight: the title, then
 * players and time, then where to find it; the BGG score sits on the cover's corner.
 */
export function GameRow({
  game,
  hideBooths,
}: {
  game: Entry;
  /** On a company's page the booths are in the header already. */
  hideBooths?: boolean;
}) {
  return (
    <li className="flex gap-3 rounded-xl bg-neutral-500/[0.06] p-3 sm:gap-5 sm:p-4 dark:bg-white/[0.04]">
      <Link href={gamePath(game)} prefetch={false} className="relative block shrink-0">
        <Cover game={game} size="sm" className="h-28 w-24 sm:h-36 sm:w-32" />
        {game.bgg?.rating ? <ScoreBadge rating={game.bgg.rating} className="absolute -bottom-1.5 -left-1.5" /> : null}
      </Link>
      <div className="min-w-0 flex-1 py-0.5">
        <Link
          href={gamePath(game)}
          prefetch={false}
          className="font-semibold leading-snug text-neutral-900 underline-offset-4 hover:underline sm:text-lg dark:text-neutral-50"
        >
          {game.title}
        </Link>
        {game.buzz ? (
          <span className="ml-2 rounded bg-rose-500/15 px-1.5 py-0.5 align-middle text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            Buzz
          </span>
        ) : null}
        <div className="mt-1">
          <PlayFacts game={game} />
        </div>
        {hideBooths ? null : <Booths game={game} className="mt-3 text-xs" />}
        {game.bgg?.demoOnly ? (
          <div className="mt-2 text-xs">
            <DemoOnly />
          </div>
        ) : null}
      </div>
      <div className="-mr-1 -mt-1 shrink-0">
        <MarkControl id={game.id} title={game.title} compact />
      </div>
    </li>
  );
}
