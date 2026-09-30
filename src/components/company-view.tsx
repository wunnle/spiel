import Link from "next/link";
import type { Company, Entry } from "@/lib/entry";
import { hallTone } from "@/lib/halls";
import { boothMap, splitBooth } from "@/lib/site";
import { GameRow } from "./game-row";

// Most wanted first: shortlist picks, then 👍 on BGG's preview — same as the main list's default.
const byInterest = (a: Entry, b: Entry) =>
  Number(!!b.buzz) - Number(!!a.buzz) || (b.bgg?.thumbs ?? 0) - (a.bgg?.thumbs ?? 0) || a.title.localeCompare(b.title);

/** A company's page: its booths and every game it shows. Rendered from list data, so it works offline. */
export function CompanyView({ company }: { company: Company }) {
  const games = [...company.games].sort(byInterest);
  return (
    <article className="max-w-4xl">
      <Link
        href="/publishers/"
        className="text-sm font-medium text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        ← All publishers
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
        {company.name}
      </h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        {games.length} {games.length === 1 ? "game" : "games"} at SPIEL ’26
      </p>

      {company.booths.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {company.booths.map((id) => {
            const { hall, stand } = splitBooth(id);
            return (
              <a
                key={id}
                href={boothMap(id)}
                target="_blank"
                rel="noreferrer"
                title="Open the hall plan"
                className={`rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums hover:brightness-95 dark:hover:brightness-125 ${hallTone(hall).pill}`}
              >
                Hall {hall} · {stand}
              </a>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Booth not announced yet</p>
      )}

      {company.publishers.length ? (
        <p className="mt-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          <span className="text-neutral-500 dark:text-neutral-400">Also showing games from </span>
          {company.publishers.join(", ")}
        </p>
      ) : null}

      <ul className="mt-6 border-t border-black/5 dark:border-white/10">
        {games.map((g) => (
          <GameRow key={g.id} game={g} hideBooths />
        ))}
      </ul>
    </article>
  );
}
