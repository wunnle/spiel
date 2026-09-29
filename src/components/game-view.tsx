import Link from "next/link";
import { bggUrl, type Entry } from "@/lib/catalog";
import { Booths } from "./booths";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";

/** The long-form bits that only the prerendered game page carries (see src/data/details.json). */
export type Details = {
  description: string[];
  illustrators?: string;
  release?: string;
  theme?: string;
  mechanisms?: string[];
  languages?: string[];
  /** BGG's name for the game, when it differs from the listing's. */
  bggName?: string;
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="border-t border-black/5 py-2 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-4 dark:border-white/10">
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-neutral-800 dark:text-neutral-200">{children}</dd>
    </div>
  );
}

/**
 * A game's page. Rendered at build time with `details`; offline, for a page that was never opened,
 * the /offline-game/ shell renders it from the list data alone.
 */
export function GameView({ game, details }: { game: Entry; details?: Details }) {
  const names = [game.en, game.de].filter(Boolean);
  const description = details?.description.length ? details.description : game.blurb ? [game.blurb] : [];
  return (
    <article>
      <Link
        href="/"
        className="text-sm font-medium text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        ← All games
      </Link>

      <div className="mt-6 grid gap-6 sm:grid-cols-[18rem_1fr] sm:gap-8">
        {/* Offline, only the list-size covers are saved. */}
        <Cover game={game} size={details ? "lg" : "sm"} className="aspect-square w-full max-w-sm sm:max-w-none" />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
            {game.title}
          </h1>
          {names.length ? <p className="mt-1 text-neutral-500 dark:text-neutral-400">{names.join(" · ")}</p> : null}
          {game.publisher ? (
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">{game.publisher}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
            {game.buzz ? (
              <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-700 dark:text-rose-300">Buzz</span>
            ) : null}
            {game.kind ? (
              <span
                className={`rounded px-1.5 py-0.5 ${
                  game.kind === "New"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                }`}
              >
                {game.kind}
              </span>
            ) : null}
            {game.level ? (
              <span className="rounded bg-neutral-500/15 px-1.5 py-0.5 text-neutral-700 dark:text-neutral-300">
                {game.level}
              </span>
            ) : null}
          </div>

          <Booths game={game} className="mt-4 text-lg" />

          <div className="mt-5">
            <MarkControl id={game.id} title={game.title} />
          </div>

          <a
            href={bggUrl(game)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
          >
            {game.bgg
              ? `${details?.bggName ?? "This game"} on BoardGameGeek${game.thumbs ? ` · ${game.thumbs} 👍` : ""} ↗`
              : "Search BoardGameGeek ↗"}
          </a>
        </div>
      </div>

      {description.length ? (
        <div className="mt-10 max-w-2xl space-y-4 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
          {description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      {!details ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          You&apos;re offline — the full description loads when you&apos;re back online.
        </p>
      ) : null}

      <dl className="mt-10 max-w-2xl">
        <Fact label="Players">{game.players}</Fact>
        <Fact label="Playing time">{game.time}</Fact>
        <Fact label="Age">{game.age}</Fact>
        <Fact label="Price">{game.price}</Fact>
        <Fact label="Release">{details?.release}</Fact>
        <Fact label="Designers">{game.authors}</Fact>
        <Fact label="Illustrators">{details?.illustrators}</Fact>
        <Fact label="Shown by">{game.exhibitor !== game.publisher ? game.exhibitor : undefined}</Fact>
        <Fact label="Categories">{game.categories.join(", ")}</Fact>
        <Fact label="Mechanisms">{details?.mechanisms?.join(", ")}</Fact>
        <Fact label="Theme">{details?.theme}</Fact>
        <Fact label="Languages">{details?.languages?.join(", ")}</Fact>
      </dl>
    </article>
  );
}
