import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { gamePath, type Entry } from "@/lib/entry";
import { CARD } from "@/lib/ui";
import { BggScore, DemoOnly } from "./bgg";
import { Booths } from "./booths";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";
import { PlayFacts } from "./play-facts";

/** How many category tags a card shows before "+n". */
const MAX_TAGS = 4;

/**
 * What you scan the list for, in that order: the cover and name; what kind of game it is (tags) and
 * how good (BGG score); then, quieter, players, time and where to find it.
 */
export function GameRow({
  game,
  hideBooths,
}: {
  game: Entry;
  /** On a company's page the booths are in the header already. */
  hideBooths?: boolean;
}) {
  const kinds = game.categories.length ? game.categories.map(categoryLabel) : (game.bggCategories ?? []);
  const tags = [...(game.kind === "Expansion" ? ["Expansion"] : []), ...kinds];
  return (
    <li className={`flex gap-3 p-3 sm:gap-5 sm:p-4 ${CARD}`}>
      <Link href={gamePath(game)} prefetch={false} className="block shrink-0">
        <Cover game={game} size="sm" plain className="h-28 w-28 sm:h-36 sm:w-36" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div>
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
        </div>

        {tags.length ? (
          <ul className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, MAX_TAGS).map((t) => (
              <li
                key={t}
                className="rounded-md bg-neutral-500/10 px-1.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300"
              >
                {t}
              </li>
            ))}
            {tags.length > MAX_TAGS ? (
              <li className="px-1 py-0.5 text-xs text-neutral-500 dark:text-neutral-400">+{tags.length - MAX_TAGS}</li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <BggScore game={game} />
          {game.bgg?.demoOnly ? <DemoOnly /> : null}
        </div>

        {/* Small print: how long, how many, where. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-neutral-500 dark:text-neutral-400">
          <PlayFacts game={game} small />
          {hideBooths ? null : <Booths game={game} />}
        </div>
      </div>
      <div className="-mr-1 -mt-1 shrink-0">
        <MarkControl id={game.id} title={game.title} compact />
      </div>
    </li>
  );
}
