import data from "@/data/catalog.json";
import { PICKS, type Pick } from "@/data/picks";
import { BASE } from "./site";

/** BoardGameGeek's side of a game, from its SPIEL preview. */
export type BggSummary = {
  id: number;
  /** 👍 on the preview; "Most wanted" sorts by it. */
  thumbs?: number;
  /** Average user rating, 1–10 — only with enough votes. Early ratings come from preview copies. */
  rating?: number;
  ratings?: number;
  /** Only demoed at the fair, not sold there. */
  demoOnly?: boolean;
  /** Price at the fair, in the publisher's currency, e.g. "€60". */
  showPrice?: string;
};

/** One game from the official novelties list, as scripts/update.mjs writes it. */
type Listed = {
  /** Product id in the official list — what the SPIEL app's favourites import expects. */
  id: string;
  slug: string;
  title: string;
  /** Title in the German listing, when it differs. */
  de?: string;
  publisher?: string;
  exhibitor?: string;
  authors?: string;
  players?: string;
  time?: string;
  age?: string;
  price?: string;
  kind?: "New" | "Expansion";
  level?: string;
  categories: string[];
  /** Mechanism groups for filtering (both vocabularies folded together; see scripts/update.mjs). */
  mechanics: string[];
  /** File name (no extension) under public/covers/{sm,lg}/. */
  cover?: string;
  /** "<hall>.<stand>", e.g. "3.3U210". */
  booths: string[];
  bgg?: BggSummary;
  blurb?: string;
};

export type Entry = Listed & {
  /** English name for a German listing, from the shortlist. */
  en?: string;
  buzz?: boolean;
  /** Not in the official list: only on the shortlist, shown at its publisher's booth. */
  unlisted?: boolean;
  /** Exhibitor showing the game, when that isn't the publisher. */
  at?: string;
};

export const FETCHED: string = data.fetched;

const norm = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const listed = data.games as Listed[];
const byTitle = new Map(
  listed.flatMap((g) => [[norm(g.title), g] as const, ...(g.de ? [[norm(g.de), g] as const] : [])]),
);
const findListed = (p: Pick) =>
  [p.listing, p.title, p.en].flatMap((t) => (t ? [byTitle.get(norm(t))] : [])).find(Boolean);

/** A distributor's booth rather than the publisher's own, e.g. Kalypso at Pegasus. */
function showsElsewhere(g: Listed) {
  if (!g.exhibitor || !g.publisher) return false;
  const [a, b] = [norm(g.exhibitor), norm(g.publisher)];
  return !a.includes(b.slice(0, 6)) && !b.includes(a.slice(0, 6));
}

const picks = new Map<string, Pick>();
const slugs = new Set(listed.map((g) => g.slug));
const unlisted: Entry[] = [];
for (const p of PICKS) {
  const match = findListed(p);
  if (match) {
    picks.set(match.id, p);
    continue;
  }
  let slug = slugify(p.title);
  if (slugs.has(slug)) slug += "-pick";
  slugs.add(slug);
  unlisted.push({
    id: `pick:${p.title}`,
    slug,
    title: p.title,
    en: p.en,
    publisher: p.publisher,
    authors: p.designers,
    kind: p.kind === "Expansion" ? "Expansion" : "New",
    categories: [],
    mechanics: [],
    booths: p.booths ?? [],
    buzz: p.buzz,
    blurb: p.blurb,
    unlisted: true,
  });
}

export const CATALOG: Entry[] = [
  ...listed.map((g) => {
    const pick = picks.get(g.id);
    const at = pick?.at ?? (showsElsewhere(g) ? g.exhibitor : undefined);
    if (!pick) return { ...g, at };
    return {
      ...g,
      en: pick.en && norm(pick.en) !== norm(g.title) ? pick.en : undefined,
      buzz: pick.buzz,
      blurb: pick.blurb ?? g.blurb,
      at,
    };
  }),
  ...unlisted,
];

export const BY_SLUG = new Map(CATALOG.map((g) => [g.slug, g]));

export const CATEGORIES = [...new Set(CATALOG.flatMap((g) => g.categories))].sort();
export const MECHANICS = [...new Set(CATALOG.flatMap((g) => g.mechanics))].sort();

export function coverUrl(g: Entry, size: "sm" | "lg") {
  return g.cover ? `${BASE}/covers/${size}/${g.cover}.webp` : undefined;
}

export function gamePath(g: Entry) {
  return `/games/${g.slug}/`;
}

export function bggUrl(g: Entry) {
  if (g.bgg) return `https://boardgamegeek.com/boardgame/${g.bgg.id}`;
  const q = encodeURIComponent(g.en ?? g.title);
  return `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${q}`;
}

/** "49.99 €" → 49.99 */
export function priceEuros(g: Entry) {
  const n = Number(g.price?.replace(/[^\d.,]/g, "").replace(",", "."));
  // Some exhibitors enter 0.01 as a placeholder.
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}
