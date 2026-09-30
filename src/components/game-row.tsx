import Link from "next/link";
import { gamePath, type Entry } from "@/lib/entry";
import { BggScore, DemoOnly } from "./bgg";
import { Booths } from "./booths";
import { Cover } from "./cover";
import { MarkControl, MarkStripe } from "./mark-control";
import { PlayFacts } from "./play-facts";

/** Just what you scan the list for; the rest is on the game page. */
export function GameRow({
  game,
  hideBooths,
}: {
  game: Entry;
  /** On a company's page the booths are in the header already. */
  hideBooths?: boolean;
}) {
  return (
    <li className="relative flex gap-4 border-b border-black/5 py-4 dark:border-white/10">
      <MarkStripe id={game.id} />
      <Link href={gamePath(game)} prefetch={false} className="block shrink-0">
        <Cover game={game} size="sm" className="h-32 w-28 sm:h-40 sm:w-36" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={gamePath(game)}
          prefetch={false}
          className="text-lg font-semibold leading-snug text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
        >
          {game.title}
        </Link>
        {game.buzz ? (
          <span className="ml-2 rounded bg-rose-500/15 px-1.5 py-0.5 align-middle text-xs font-semibold text-rose-700 dark:text-rose-300">
            Buzz
          </span>
        ) : null}
        <div className="mt-1">
          <PlayFacts game={game} />
        </div>
        {hideBooths ? null : <Booths game={game} className="mt-0.5 text-sm" />}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <BggScore game={game} />
          {game.bgg?.demoOnly ? <DemoOnly /> : null}
        </div>
      </div>
      <div className="-mr-1 -mt-1 shrink-0">
        <MarkControl id={game.id} title={game.title} compact />
      </div>
    </li>
  );
}
