import data from "@/data/catalog.json";
import { PICKS, type Pick } from "@/data/picks";
import { type Company, type Entry, type Listed } from "./entry";

export * from "./entry";

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

export const COMPANIES: Company[] = (() => {
  const byName = new Map<string, Entry[]>();
  for (const g of CATALOG) if (g.exhibitor) byName.set(g.exhibitor, [...(byName.get(g.exhibitor) ?? []), g]);
  const taken = new Set<string>();
  return [...byName.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en", { sensitivity: "base" }))
    .map(([name, games]) => {
      let slug = slugify(name) || "company";
      while (taken.has(slug)) slug += "-2";
      taken.add(slug);
      const own = norm(name).slice(0, 6);
      return {
        slug,
        name,
        booths: [...new Set(games.flatMap((g) => g.booths))].sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
        games,
        publishers: [
          ...new Set(games.flatMap((g) => (g.publisher && !norm(g.publisher).includes(own) ? [g.publisher] : []))),
        ].sort(),
      };
    });
})();

export const COMPANY_BY_NAME = new Map(COMPANIES.map((c) => [c.name, c]));
export const COMPANY_BY_SLUG = new Map(COMPANIES.map((c) => [c.slug, c]));
