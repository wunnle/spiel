import { BASE } from "./site";

// Types and small helpers for a single game or company. Kept apart from catalog.ts, which loads the
// whole list: components that render one game import from here, so pages that show a handful of games
// (a publisher, say) don't ship all 1,600 to the browser.

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
export type Listed = {
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
  /** BGG's categories (themes, genres), used as tags when the official form gave none. */
  bggCategories?: string[];
  /** Mechanism groups for filtering (both vocabularies folded together; see scripts/update.mjs). */
  mechanics: string[];
  /** Illustrators, detailed mechanisms, languages, theme, BGG's name — words only search uses. */
  search?: string;
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

/**
 * A company at the fair, as the official list knows it: the exhibitor that owns the booth. Cleaner
 * than the free-text publisher field ("Franckh-Kosmos Verlags-GmbH & Co. KG" is "Kosmos Verlag"), and
 * for a distributor like Asmodee it's the one place to see everything at its booths.
 */
export type Company = {
  slug: string;
  name: string;
  booths: string[];
  games: Entry[];
  /** Publishers it shows games for, when they aren't itself. */
  publishers: string[];
};

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

export function companyPath(c: Company) {
  return `/publishers/${c.slug}/`;
}
