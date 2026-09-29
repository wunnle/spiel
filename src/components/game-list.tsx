"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATALOG, CATEGORIES, gamePath, priceEuros, type Entry } from "@/lib/catalog";
import { byFamily, categoryDot, categoryLabel } from "@/lib/category-tones";
import { MARKS, useMarks, type Mark } from "@/lib/marks";
import { splitBooth } from "@/lib/site";
import { BggScore, DemoOnly } from "./bgg";
import { Booths } from "./booths";
import { Cover } from "./cover";
import { MarkControl } from "./mark-control";
import { PlayFacts } from "./play-facts";
import { TransferDialog } from "./transfer-dialog";

const PAGE = 60;

type Kind = "All" | "New" | "Expansion";
type Sort = "popular" | "score" | "az" | "booth";
const KINDS: Kind[] = ["All", "New", "Expansion"];
const SORTS: { id: Sort; label: string }[] = [
  { id: "popular", label: "Most wanted" },
  { id: "score", label: "BGG score" },
  { id: "az", label: "A–Z" },
  { id: "booth", label: "Booth" },
];
const LISTED_IDS = new Set(CATALOG.filter((g) => !g.unlisted).map((g) => g.id));
// Numbered halls in order, then the named ones ("GA" is the Galeria).
const HALLS = [...new Set(CATALOG.flatMap((g) => g.booths.map((b) => splitBooth(b).hall)))].sort((a, b) =>
  a.localeCompare(b, "en", { numeric: true }),
);

/**
 * Score for sorting: the BGG average pulled toward a typical 6.5 until ~30 ratings back it up, so a
 * 10.0 from five playtesters doesn't outrank an 8.5 from hundreds. Unscored games sort last.
 */
function weighted(g: Entry) {
  const { rating, ratings = 0 } = g.bgg ?? {};
  if (!rating) return 0;
  return (rating * ratings + 6.5 * 30) / (ratings + 30);
}

const SORTERS: Record<Sort, (a: Entry, b: Entry) => number> = {
  // Shortlist picks first, then by 👍 on BGG's preview.
  popular: (a, b) => Number(!!b.buzz) - Number(!!a.buzz) || (b.bgg?.thumbs ?? 0) - (a.bgg?.thumbs ?? 0),
  score: (a, b) => weighted(b) - weighted(a),
  az: (a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
  // No booth sorts last; otherwise by first booth, which reads as a walking order.
  booth: (a, b) => (a.booths[0] ?? "~").localeCompare(b.booths[0] ?? "~", "en", { numeric: true }),
};

const CATEGORY_COUNTS = new Map(CATEGORIES.map((c) => [c, CATALOG.filter((g) => g.categories.includes(c)).length]));
const CATEGORY_ORDER = [...CATEGORIES].sort(byFamily);

const euros = (n: number) => n.toLocaleString("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function chip(active: boolean) {
  return `whitespace-nowrap rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
    active
      ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
      : "border-black/10 text-neutral-600 hover:border-black/25 dark:border-white/15 dark:text-neutral-300 dark:hover:border-white/30"
  }`;
}

/** Just what you scan the list for; the rest is on the game page. */
function GameRow({ game }: { game: Entry }) {
  return (
    <li className="flex gap-4 border-b border-black/5 py-4 dark:border-white/10">
      <Link href={gamePath(game)} prefetch={false} className="block shrink-0">
        <Cover game={game} size="sm" className="h-32 w-28 sm:h-40 sm:w-36" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={gamePath(game)}
          prefetch={false}
          className="text-lg font-medium leading-snug text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
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
        <Booths game={game} className="mt-0.5 text-sm" />
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

/** What the shopping list adds up to, from the prices exhibitors listed. */
function BuyTotal({ games }: { games: Entry[] }) {
  const priced = games.map(priceEuros).filter((p): p is number => p !== undefined);
  const total = priced.reduce((a, b) => a + b, 0);
  const missing = games.length - priced.length;
  return (
    <p className="mt-4 rounded-lg bg-sky-500/10 px-4 py-3 text-sky-900 dark:text-sky-200">
      <strong>{euros(total)}</strong> for {priced.length} {priced.length === 1 ? "game" : "games"} at list price
      {missing ? `, plus ${missing} without a listed price` : ""}.
    </p>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-black/5 py-4 first:border-t-0 first:pt-0 dark:border-white/10">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A full-width toggle row with a count, for the sidebar's lists. */
function Row({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
        active
          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "text-neutral-700 hover:bg-black/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.06]"
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      {count !== undefined ? (
        <span className={`tabular-nums ${active ? "opacity-80" : "text-neutral-400 dark:text-neutral-500"}`}>{count}</span>
      ) : null}
    </button>
  );
}

export function GameList() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [buzzOnly, setBuzzOnly] = useState(false);
  const [mine, setMine] = useState<Mark | null>(null);
  const [hall, setHall] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("popular");
  const [transfer, setTransfer] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const marks = useMarks();

  const counts = useMemo(() => {
    const c: Record<Mark, number> = { star: 0, buy: 0, bought: 0 };
    for (const m of Object.values(marks)) c[m]++;
    return c;
  }, [marks]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = CATALOG.filter((g) => {
      if (kind !== "All" && g.kind !== kind) return false;
      if (buzzOnly && !g.buzz) return false;
      if (mine && marks[g.id] !== mine) return false;
      // Any of the ticked categories.
      if (categories.length && !g.categories.some((c) => categories.includes(c))) return false;
      if (hall && !g.booths.some((b) => splitBooth(b).hall === hall)) return false;
      if (!q) return true;
      const booths = g.booths.map((b) => splitBooth(b).stand).join(" ");
      return [g.title, g.de, g.en, g.publisher, g.exhibitor, g.authors, g.blurb, booths].some((f) =>
        f?.toLowerCase().includes(q),
      );
    });
    return matches.sort(SORTERS[sort]);
  }, [query, kind, categories, buzzOnly, mine, marks, hall, sort]);

  // Show a page at a time; any filter change starts again from the top.
  const filterKey = [query, kind, categories.join(","), buzzOnly, mine, hall, sort].join("|");
  const [page, setPage] = useState({ key: filterKey, count: PAGE });
  const count = page.key === filterKey ? page.count : PAGE;

  // What the SPIEL app can take: games still to find, and only those with an official id.
  const lists = useMemo(() => {
    const of = (m: Mark) => Object.entries(marks).flatMap(([id, v]) => (v === m && LISTED_IDS.has(id) ? [id] : []));
    return { interested: of("star"), wantToBuy: of("buy") };
  }, [marks]);
  const skipped = Object.entries(marks).filter(([id, m]) => m !== "bought" && !LISTED_IDS.has(id)).length;
  const canSend = lists.interested.length + lists.wantToBuy.length > 0;

  const active = [kind !== "All", buzzOnly, !!mine, !!hall].filter(Boolean).length + categories.length;
  function clearFilters() {
    setKind("All");
    setBuzzOnly(false);
    setMine(null);
    setHall(null);
    setCategories([]);
  }
  function toggleCategory(c: string) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  const filters = (
    <div>
      <Section
        title="Your games"
        action={
          canSend ? (
            <button
              type="button"
              onClick={() => setTransfer(true)}
              className="text-xs font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
            >
              Send to SPIEL app
            </button>
          ) : null
        }
      >
        {MARKS.map((m) => (
          <Row key={m.id} active={mine === m.id} onClick={() => setMine((v) => (v === m.id ? null : m.id))} count={counts[m.id]}>
            {m.label}
          </Row>
        ))}
      </Section>

      <Section title="Type">
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={chip(kind === k)}>
              {k}
            </button>
          ))}
          <button type="button" onClick={() => setBuzzOnly((v) => !v)} className={chip(buzzOnly)}>
            Buzz
          </button>
        </div>
      </Section>

      <Section title="Hall">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setHall(null)} className={chip(hall === null)}>
            All
          </button>
          {HALLS.map((h) => (
            <button key={h} type="button" onClick={() => setHall((v) => (v === h ? null : h))} className={chip(hall === h)}>
              {h}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Categories"
        action={
          categories.length ? (
            <button
              type="button"
              onClick={() => setCategories([])}
              className="text-xs font-medium text-neutral-500 underline underline-offset-4 dark:text-neutral-400"
            >
              Clear
            </button>
          ) : null
        }
      >
        {CATEGORY_ORDER.map((c) => (
          <Row key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)} count={CATEGORY_COUNTS.get(c)}>
            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${categoryDot(c)}`} />
            <span className="truncate">{categoryLabel(c)}</span>
          </Row>
        ))}
      </Section>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:thin] lg:[scrollbar-color:rgb(128_128_128/0.35)_transparent]">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={chip(filtersOpen)}
          >
            Filters{active ? ` (${active})` : ""}
          </button>
          {canSend ? (
            <button
              type="button"
              onClick={() => setTransfer(true)}
              className="text-sm font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
            >
              Send to SPIEL app
            </button>
          ) : null}
        </div>
        <div className={`${filtersOpen ? "mb-4 block rounded-lg border border-black/10 p-4 dark:border-white/15" : "hidden"} lg:block lg:border-0 lg:p-0`}>
          {filters}
          {active ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-sm font-medium text-neutral-500 underline underline-offset-4 dark:text-neutral-400"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      </aside>

      <section className="min-w-0">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, publisher, designer, booth…"
          className="w-full rounded-lg border border-black/10 bg-transparent px-3.5 py-2.5 text-base outline-none placeholder:text-neutral-400 focus:border-black/30 dark:border-white/15 dark:focus:border-white/35"
        />

        {mine === "buy" && shown.length ? <BuyTotal games={shown} /> : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            {shown.length.toLocaleString("en")} of {CATALOG.length.toLocaleString("en")} games
          </p>
          <div className="flex gap-1">
            {SORTS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSort(s.id)} className={chip(sort === s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {shown.length ? (
          <>
            <ul className="mt-1">
              {shown.slice(0, count).map((g) => (
                <GameRow key={g.id} game={g} />
              ))}
            </ul>
            {shown.length > count ? (
              <button
                type="button"
                onClick={() => setPage({ key: filterKey, count: count + PAGE * 2 })}
                className="mt-6 w-full rounded-lg border border-black/10 py-2.5 font-medium text-neutral-700 hover:border-black/25 dark:border-white/15 dark:text-neutral-300 dark:hover:border-white/30"
              >
                Show more ({(shown.length - count).toLocaleString("en")} left)
              </button>
            ) : null}
          </>
        ) : (
          <p className="mt-6 rounded-lg bg-black/[0.03] p-4 text-neutral-500 dark:bg-white/[0.05] dark:text-neutral-400">
            {mine && !counts[mine]
              ? "Nothing here yet — use the buttons beside each game to mark it."
              : "No games match those filters."}
          </p>
        )}
      </section>

      {transfer ? (
        <TransferDialog
          interested={lists.interested}
          wantToBuy={lists.wantToBuy}
          skipped={skipped}
          onClose={() => setTransfer(false)}
        />
      ) : null}
    </div>
  );
}
