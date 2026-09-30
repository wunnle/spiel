import Link from "next/link";
import { COMPANY_BY_NAME, companyPath, type Entry } from "@/lib/catalog";
import { categoryLabel } from "@/lib/categories";
import { BggScore, PriceLine } from "./bgg";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";
import { FactPills } from "./play-facts";

/** The long-form bits that only the prerendered game page carries (see src/data/details.json). */
export type Details = {
  description: string[];
  illustrators?: string;
  release?: string;
  mechanisms?: string[];
  languages?: string[];
  /** BGG's name for the game, when it differs from the listing's. */
  bggName?: string;
  /** For an expansion: the base game(s) on BGG. */
  expands?: { id: number; name: string }[];
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

function Chips({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="text-sm text-neutral-500 dark:text-neutral-400">{label}</h2>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <li
            key={i}
            className="rounded-md border border-black/10 px-2 py-0.5 text-sm text-neutral-700 dark:border-white/15 dark:text-neutral-300"
          >
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tag({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`rounded px-1.5 py-0.5 ${tone}`}>{children}</span>;
}

/**
 * A game's page. Rendered at build time with `details`; offline, for a page that was never opened,
 * the /offline-game/ shell renders it from the list data alone.
 */
export function GameView({ game, details }: { game: Entry; details?: Details }) {
  // The company whose booth it's at; its page lists everything shown there.
  const company = game.exhibitor ? COMPANY_BY_NAME.get(game.exhibitor) : undefined;
  const names = [game.en, game.de, details?.bggName && `BGG: ${details.bggName}`].filter(Boolean);
  const description = details?.description.length ? details.description : game.blurb ? [game.blurb] : [];
  const expands = details?.expands?.map((e, i) => (
    <span key={e.id}>
      {i > 0 ? ", " : null}
      <a
        href={`https://boardgamegeek.com/boardgame/${e.id}`}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4"
      >
        {e.name}
      </a>
    </span>
  ));
  return (
    <article className="max-w-4xl">
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
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
            {game.buzz ? <Tag tone="bg-rose-500/10 text-rose-800/90 dark:text-rose-200/80">Buzz</Tag> : null}
            {game.kind ? (
              <Tag
                tone={
                  game.kind === "New"
                    ? "bg-emerald-500/10 text-emerald-800/90 dark:text-emerald-200/80"
                    : "bg-sky-500/10 text-sky-800/90 dark:text-sky-200/80"
                }
              >
                {game.kind}
              </Tag>
            ) : null}
            {game.level ? (
              <Tag tone="bg-neutral-500/10 text-neutral-700 dark:text-neutral-300">{game.level}</Tag>
            ) : null}
            {game.categories.map((c) => (
              <Tag key={c} tone="bg-neutral-500/10 text-neutral-700 dark:text-neutral-300">
                {categoryLabel(c)}
              </Tag>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            <BggScore game={game} large />
            <PriceLine game={game} />
          </div>

          <div className="mt-5">
            <FactPills game={game} atHref={company && game.at ? companyPath(company) : undefined} />
          </div>


          <div className="mt-5">
            <MarkControl id={game.id} title={game.title} />
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-2xl space-y-4">
        <Chips label="Mechanisms" items={details?.mechanisms} />
      </div>

      <dl className="mt-8 max-w-2xl">
        <Fact label="Release">{details?.release}</Fact>
        <Fact label="Publisher">
          {company && !game.at ? (
            <Link href={companyPath(company)} className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 dark:decoration-neutral-600 dark:hover:decoration-neutral-100">
              {game.publisher ?? company.name}
            </Link>
          ) : (
            game.publisher
          )}
        </Fact>
        <Fact label="Designers">{game.authors}</Fact>
        <Fact label="Languages">{details?.languages?.join(", ")}</Fact>
        <Fact label="Age">{game.age}</Fact>
        <Fact label="Expansion for">{expands?.length ? expands : undefined}</Fact>
        <Fact label="Illustrators">{details?.illustrators}</Fact>
      </dl>

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
    </article>
  );
}
