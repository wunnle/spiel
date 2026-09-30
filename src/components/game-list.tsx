"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import { CATALOG, CATEGORIES, MECHANICS, priceEuros, type Entry } from "@/lib/catalog";
import { categoryLabel, groupByFamily } from "@/lib/categories";
import { hallTone } from "@/lib/halls";
import { MARK_TONE, MARKS, useMarks, type Mark } from "@/lib/marks";
import { GameRow } from "./game-row";
import { splitBooth } from "@/lib/site";

const PAGE = 60;

type Kind = "New" | "Expansion";
type Sort = "popular" | "score" | "az" | "hall";
const KINDS: { id: Kind; label: string }[] = [
  { id: "New", label: "New" },
  { id: "Expansion", label: "Expansions" },
];
const SORTS: { id: Sort; label: string }[] = [
  { id: "popular", label: "Most wanted" },
  { id: "score", label: "BGG score" },
  { id: "az", label: "A–Z" },
  { id: "hall", label: "Hall" },
];
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

const SORTERS: Record<Exclude<Sort, "hall">, (a: Entry, b: Entry) => number> = {
  // Shortlist picks first, then by 👍 on BGG's preview.
  popular: (a, b) => Number(!!b.buzz) - Number(!!a.buzz) || (b.bgg?.thumbs ?? 0) - (a.bgg?.thumbs ?? 0),
  score: (a, b) => weighted(b) - weighted(a),
  az: (a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
};

const CATEGORY_COUNTS = new Map(CATEGORIES.map((c) => [c, CATALOG.filter((g) => g.categories.includes(c)).length]));
const CATEGORY_GROUPS = groupByFamily(CATEGORIES);
/** Lower case, accents off: "Gaudí" and "gaudi" match. */
const fold = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Everything search looks at, per game, folded once up front. */
const HAYSTACK = new Map(
  CATALOG.map((g) => [
    g.id,
    fold(
      [
        g.title,
        g.de,
        g.en,
        g.publisher,
        g.exhibitor,
        g.at,
        g.authors,
        g.blurb,
        g.kind,
        g.level,
        ...g.categories,
        ...g.mechanics,
        // "hall_3" so a search for "hall 3" means that hall, not any stand with a 3 in it.
        ...g.booths.map((b) => `hall_${fold(splitBooth(b).hall)} ${splitBooth(b).stand}`),
        g.search,
      ]
        .filter(Boolean)
        .join(" \n "),
    ),
  ]),
);

const MECHANIC_COUNTS = new Map(MECHANICS.map((m) => [m, CATALOG.filter((g) => g.mechanics.includes(m)).length]));

/** Adds the item if it's missing, removes it if it's there. */
function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const euros = (n: number) => n.toLocaleString("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** The sidebar's quieter version of chip(). */
function smallChip(active: boolean) {
  return `whitespace-nowrap rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
    active
      ? "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-500 dark:text-neutral-950"
      : "border-black/10 text-neutral-600 hover:border-black/25 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/25"
  }`;
}

function chip(active: boolean) {
  return `whitespace-nowrap rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
    active
      ? "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-500 dark:text-neutral-950"
      : "border-black/10 bg-white text-neutral-700 hover:border-black/25 dark:border-white/15 dark:bg-transparent dark:text-neutral-300 dark:hover:border-white/30"
  }`;
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

// Which collapsible sections are open, remembered on this device (a convenience; fine if it's lost).
const OPEN_KEY = "spiel26:open-sections";
const openListeners = new Set<() => void>();
function readOpen() {
  try {
    return localStorage.getItem(OPEN_KEY) ?? "";
  } catch {
    return "";
  }
}
function useSectionOpen(id: string, defaultOpen: boolean): [boolean, () => void] {
  const raw = useSyncExternalStore(
    (l) => {
      openListeners.add(l);
      return () => openListeners.delete(l);
    },
    readOpen,
    () => "",
  );
  let saved: Record<string, boolean> = {};
  try {
    saved = raw ? JSON.parse(raw) : {};
  } catch {
    // Unreadable: fall back to the defaults.
  }
  const open = saved[id] ?? defaultOpen;
  const toggleOpen = () => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify({ ...saved, [id]: !open }));
    } catch {
      // Storage blocked: the section just won't remember.
    }
    openListeners.forEach((l) => l());
  };
  return [open, toggleOpen];
}

function Section({
  title,
  action,
  collapsible,
  defaultOpen = true,
  picked = 0,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  /** Long lists fold away; the header then shows how many are ticked. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  picked?: number;
  children: React.ReactNode;
}) {
  const [storedOpen, toggleOpen] = useSectionOpen(title, defaultOpen);
  const open = !collapsible || storedOpen;
  const heading = (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{title}</h2>
  );
  return (
    <section className="py-3 first:pt-0">
      <div className={`flex items-center justify-between ${open ? "mb-2" : ""}`}>
        {collapsible ? (
          <button
            type="button"
            onClick={toggleOpen}
            aria-expanded={open}
            className="-mx-1 flex items-center gap-1.5 rounded px-1 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
            {heading}
            {picked ? (
              <span className="rounded-full bg-neutral-900 px-1.5 text-[11px] font-semibold tabular-nums text-white dark:bg-neutral-100 dark:text-neutral-900">
                {picked}
              </span>
            ) : null}
          </button>
        ) : (
          heading
        )}
        {action}
      </div>
      {open ? children : null}
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
          ? "bg-orange-500/15 font-medium text-orange-900 dark:text-orange-200"
          : "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      {count !== undefined ? (
        <span className={`text-xs tabular-nums ${active ? "opacity-80" : "text-neutral-400 dark:text-neutral-600"}`}>{count}</span>
      ) : null}
    </button>
  );
}

export function GameList() {
  const [query, setQuery] = useState("");
  // Nothing ticked means no filter, like categories.
  const [kinds, setKinds] = useState<Kind[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [mechanics, setMechanics] = useState<string[]>([]);
  const [buzzOnly, setBuzzOnly] = useState(false);
  const [mine, setMine] = useState<Mark | null>(null);
  const [halls, setHalls] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const marks = useMarks();

  const counts = useMemo(() => {
    const c: Record<Mark, number> = { star: 0, buy: 0, bought: 0 };
    for (const m of Object.values(marks)) c[m]++;
    return c;
  }, [marks]);

  // The games to show, and (sorted by hall) which hall each is filed under.
  const { shown, hallOf } = useMemo(() => {
    const hallOf = new Map<string, string | null>();
    // Every word has to turn up somewhere in the game.
    const words = fold(query)
      .replace(/\bhall\s+(\w+)/g, "hall_$1")
      .split(/\s+/)
      .filter(Boolean);
    const matches = CATALOG.filter((g) => {
      if (kinds.length && !(g.kind && kinds.includes(g.kind))) return false;
      if (buzzOnly && !g.buzz) return false;
      if (mine && marks[g.id] !== mine) return false;
      // Any of the ticked categories.
      if (categories.length && !g.categories.some((c) => categories.includes(c))) return false;
      if (mechanics.length && !g.mechanics.some((m) => mechanics.includes(m))) return false;
      if (halls.length && !g.booths.some((b) => halls.includes(splitBooth(b).hall))) return false;
      if (!words.length) return true;
      const hay = HAYSTACK.get(g.id)!;
      return words.every((w) => hay.includes(w));
    });
    if (sort !== "hall") return { shown: matches.sort(SORTERS[sort]), hallOf };
    // By hall, then stand: a walking order. A game at several booths goes under the first one in the
    // halls you've picked (or its first booth); games without a booth come last.
    const where = (g: Entry) => g.booths.find((b) => !halls.length || halls.includes(splitBooth(b).hall)) ?? g.booths[0];
    const shown = matches
      .map((g) => ({ g, at: where(g) }))
      .sort((a, b) => (!a.at || !b.at ? Number(!a.at) - Number(!b.at) : a.at.localeCompare(b.at, "en", { numeric: true })))
      .map(({ g, at }) => {
        hallOf.set(g.id, at ? splitBooth(at).hall : null);
        return g;
      });
    return { shown, hallOf };
  }, [query, kinds, categories, mechanics, buzzOnly, mine, marks, halls, sort]);

  // Show a page at a time; any filter change starts again from the top.
  const filterKey = [query, kinds.join(","), categories.join(","), mechanics.join(","), buzzOnly, mine, halls.join(","), sort].join("|");
  const [page, setPage] = useState({ key: filterKey, count: PAGE });
  const count = page.key === filterKey ? page.count : PAGE;

  const active = kinds.length + halls.length + categories.length + mechanics.length + Number(buzzOnly);
  function clearFilters() {
    setKinds([]);
    setBuzzOnly(false);
    setHalls([]);
    setCategories([]);
    setMechanics([]);
  }
  function toggleCategory(c: string) {
    setCategories((prev) => toggle(prev, c));
  }

  // All / your three lists, as tabs over the list.
  const tabs = (className: string) => (
    <div className={`items-center justify-between gap-4 border-b border-black/10 dark:border-white/15 ${className}`}>
      <div role="tablist" aria-label="Your games" className="-mb-px flex overflow-x-auto [scrollbar-width:none]">
        {[{ id: null, label: "All", count: undefined }, ...MARKS.map((m) => ({ id: m.id, label: m.label, count: counts[m.id] }))].map(
          (t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={mine === t.id}
              onClick={() => setMine(t.id)}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors first:pl-0 sm:gap-1.5 sm:px-3 sm:first:pl-3 ${
                mine === t.id
                  ? "border-orange-600 text-neutral-900 dark:border-orange-500 dark:text-neutral-50"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {t.label}
              {t.count ? (
                <span className={`rounded-full px-1 text-xs font-semibold tabular-nums sm:px-1.5 ${t.id ? MARK_TONE[t.id].badge : ""}`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          ),
        )}
      </div>
    </div>
  );

  const filters = (
    <div>
      <Section title="Type">
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={kinds.includes(k.id)}
              onClick={() => setKinds((v) => toggle(v, k.id))}
              className={smallChip(kinds.includes(k.id))}
            >
              {k.label}
            </button>
          ))}
          <button type="button" onClick={() => setBuzzOnly((v) => !v)} className={smallChip(buzzOnly)}>
            Buzz
          </button>
        </div>
      </Section>

      <Section title="Hall">
        <div className="flex flex-wrap gap-1.5">
          {HALLS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={halls.includes(h)}
              onClick={() => setHalls((v) => toggle(v, h))}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
                halls.includes(h)
                  ? `border-transparent ${hallTone(h).solid}`
                  : "border-black/10 text-neutral-600 hover:border-black/25 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/25"
              }`}
            >
              {halls.includes(h) ? null : <span aria-hidden className={`h-2 w-2 rounded-full ${hallTone(h).dot}`} />}
              {h}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Categories"
        collapsible
        picked={categories.length}
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
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.name} className="mt-2 first:mt-0">
            <p className="px-2 pb-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">{group.name}</p>
            {group.categories.map((c) => (
              <Row key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)} count={CATEGORY_COUNTS.get(c)}>
                <span className="truncate">{categoryLabel(c)}</span>
              </Row>
            ))}
          </div>
        ))}
      </Section>

      <Section
        title="Mechanisms"
        collapsible
        defaultOpen={false}
        picked={mechanics.length}
        action={
          mechanics.length ? (
            <button
              type="button"
              onClick={() => setMechanics([])}
              className="text-xs font-medium text-neutral-500 underline underline-offset-4 dark:text-neutral-400"
            >
              Clear
            </button>
          ) : null
        }
      >
        {MECHANICS.map((m) => (
          <Row key={m} active={mechanics.includes(m)} onClick={() => setMechanics((v) => toggle(v, m))} count={MECHANIC_COUNTS.get(m)}>
            <span className="truncate">{m}</span>
          </Row>
        ))}
      </Section>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[14.5rem_1fr] lg:gap-10">
      {tabs("mb-4 flex lg:hidden")}
      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:thin] lg:[scrollbar-color:rgb(128_128_128/0.35)_transparent]">
        <div className="mb-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={chip(filtersOpen)}
          >
            Filters{active ? ` (${active})` : ""}
          </button>
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
        {tabs("mb-4 hidden lg:flex")}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, publisher, designer, booth…"
          className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-base outline-none dark:bg-neutral-900 placeholder:text-neutral-400 focus:border-black/30 dark:border-white/15 dark:focus:border-white/35"
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
            <ul className="mt-3 space-y-3">
              {shown.slice(0, count).map((g, i, page) => {
                // Sorted by hall: a heading wherever the hall changes.
                const hall = sort === "hall" ? hallOf.get(g.id) : undefined;
                const heading = sort === "hall" && (i === 0 || hallOf.get(page[i - 1].id) !== hall);
                return (
                  <Fragment key={g.id}>
                    {heading ? (
                      <li className="flex items-center gap-2 pb-1 pt-5 text-sm font-bold text-neutral-900 first:pt-1 dark:text-neutral-50">
                        <span aria-hidden className={`h-3 w-3 rounded-full ${hall ? hallTone(hall).dot : "bg-neutral-400"}`} />
                        {hall ? `Hall ${hall}` : "Booth not announced yet"}
                      </li>
                    ) : null}
                    <GameRow game={g} />
                  </Fragment>
                );
              })}
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

    </div>
  );
}
