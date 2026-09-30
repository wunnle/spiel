import Link from "next/link";
import { COMPANY_BY_NAME, companyPath, type Entry } from "@/lib/catalog";
import { categoryLabel } from "@/lib/categories";
import { BggScore, PriceLine } from "./bgg";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";
import { ReadMore } from "./read-more";
import { CARD_QUIET, CARD_RAISED } from "@/lib/ui";
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
    <div className="border-t border-black/[0.06] py-1.5 first:border-t-0 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4 dark:border-white/[0.08]">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-neutral-700 dark:text-neutral-300">{children}</dd>
    </div>
  );
}

/** Mechanisms as small chips; they speak for themselves, so no heading. */
function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <ul aria-label="Mechanisms" className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <li
            key={i}
            className="rounded-md border border-black/10 px-1.5 py-0.5 text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-400"
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
    <article className="space-y-4">
      <Link
        href="/"
        className="inline-block text-sm font-medium text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        ← All games
      </Link>

      {/* Two cards, stretched to the same height. */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* The essentials: what it is, how good, where, and your mark. */}
        <section className={`flex flex-col ${CARD_RAISED}`}>
          <div className="grid gap-5 p-4 sm:grid-cols-[12rem_1fr] sm:p-6 lg:grid-cols-1">
            {/* Offline, only the list-size covers are saved. */}
            {/* Natural shape, up to 320px tall: wide art fills the width, a tall box shrinks and centres. */}
            <Cover
              game={game}
              size={details ? "lg" : "sm"}
              plain
              className="flex w-full max-w-xs justify-center sm:max-w-none"
              imgClassName="max-h-80 w-auto max-w-full object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
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
                {(game.categories.length ? game.categories.map(categoryLabel) : (game.bggCategories ?? [])).map((c) => (
                  <Tag key={c} tone="bg-neutral-500/10 text-neutral-700 dark:text-neutral-300">
                    {c}
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
            </div>
          </div>
          {/* Footer: what you'll do about it. */}
          <footer className="mt-auto rounded-b-xl border-t border-black/[0.06] bg-neutral-50 p-4 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <MarkControl id={game.id} title={game.title} stretch />
          </footer>
        </section>

        {/* Secondary: the facts and the description, in smaller, quieter type. */}
        <div className={`flex flex-col text-sm ${CARD_QUIET}`}>
          <section className="shrink-0 p-4 sm:p-6">
            <Chips items={details?.mechanisms} />
            <dl className={details?.mechanisms?.length ? "mt-5" : ""}>
              <Fact label="Release">{details?.release}</Fact>
              <Fact label="Publisher">
                {company && !game.at ? (
                  <Link
                    href={companyPath(company)}
                    className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
                  >
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
          </section>

          {description.length ? (
            // Divider runs edge to edge, like the primary card's footer.
            <section className="flex min-h-0 flex-1 flex-col border-t border-black/[0.06] p-4 leading-relaxed text-neutral-600 sm:p-6 dark:border-white/[0.08] dark:text-neutral-400">
              <ReadMore paragraphs={description} title={game.title} />
              {!details ? (
                <p className="mt-2 text-neutral-500">
                  You&apos;re offline — the full description loads when you&apos;re back online.
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
