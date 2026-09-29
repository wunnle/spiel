// Pulls every SPIEL '26 novelty from the official list (the same Eyeled backend the SPIEL app and
// spiel-essen.de/en/the-spiel/novelties read), joins BoardGameGeek's SPIEL preview for direct BGG
// links, and writes:
//
//   src/data/catalog.json   what the list needs — shipped to the browser, so kept lean
//   src/data/details.json   full descriptions etc., read only when prerendering game pages
//   public/covers/{sm,lg}/  box art, resized to webp (not committed; see .gitignore)
//
//   npm run update                  everything
//   npm run update -- --skip-covers data only; keeps whatever covers are already on disk
//
// Exhibitors keep editing until the fair; CI runs this before every build.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const EYELED = "https://maps.eyeled-services.de/en/spiel26";
const IMAGES = "https://assets.eyeled-services.de/pics/spiel26/products/";
const BGG_PREVIEW = 93; // boardgamegeek.com/geekpreview/93/spiel-essen-2026
const DATA = new URL("../src/data/", import.meta.url);
const COVERS = new URL("../public/covers/", import.meta.url);
/** Widths: the list thumbnail (also what "save for offline" caches) and the game page. */
const SIZES = { sm: 240, lg: 720 };
const skipCovers = process.argv.includes("--skip-covers");

async function eyeled(path, columns, lang = "en") {
  const url = `${EYELED.replace("/en/", `/${lang}/`)}/${path}?columns=${encodeURIComponent(JSON.stringify(columns))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

/** BGG now and then cuts a page short; a retry gets the whole thing. */
async function getJson(url, tries = 3) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.json();
  } catch (err) {
    if (tries <= 1) throw err;
    await new Promise((r) => setTimeout(r, 1000));
    return getJson(url, tries - 1);
  }
}

async function bggPreview() {
  const items = [];
  for (let page = 1; ; page++) {
    const url = `https://api.geekdo.com/api/geekpreviewitems?nosession=1&previewid=${BGG_PREVIEW}&pageid=${page}`;
    const batch = await getJson(url);
    if (!batch.length) return items;
    items.push(...batch);
  }
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const text = (html) => decode(html.replace(/<br\s*\/?>/g, "\n").replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "")).trim();

/** The INFO html starts with a key/value table, then free text. */
function parseInfo(html) {
  const fields = {};
  const table = html.match(/<table[\s\S]*?<\/table>/)?.[0] ?? "";
  for (const [, k, v] of table.matchAll(/<tr><td>(.*?):?\s*<\/td><td>(.*?)<\/td><\/tr>/g)) {
    fields[text(k).replace(/:$/, "")] = text(v);
  }
  const paragraphs = text(html.replace(table, ""))
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return { fields, paragraphs, body: paragraphs.join(" ") };
}

function clip(s, n) {
  if (!s || s.length <= n) return s || undefined;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

const norm = (s) =>
  decode(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** Similarity of two normalised names, 0–1 (Sørensen–Dice over bigrams). */
function similarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const grams = new Map();
  for (let i = 0; i < a.length - 1; i++) grams.set(a.slice(i, i + 2), (grams.get(a.slice(i, i + 2)) ?? 0) + 1);
  let hits = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const g = b.slice(i, i + 2);
    if (grams.get(g) > 0) {
      grams.set(g, grams.get(g) - 1);
      hits++;
    }
  }
  return (2 * hits) / (a.length + b.length - 2);
}

/** "Hall 3-A400", "3U115 - PERRO LOKO", "3-R400" → ["3A400"] */
const bggStands = (loc) => [...(loc ?? "").toUpperCase().matchAll(/(\d)\s*-?\s*([A-Z])\s*(\d{3})/g)].map((m) => m.slice(1).join(""));

const [{ products, productThemes }, { products: german }, { exhibitors }, preview] = await Promise.all([
  eyeled("products", ["ID", "INFO", "S_ORDER", "TITEL", "FIRMA_ID", "UNTERTITEL", "BILDER", "BILDER_TEXTE"]),
  eyeled("products", ["ID", "TITEL"], "de"),
  eyeled("exhibitors", ["ID", "NAME", "S_ORDER", "STAND", "HALLE"]),
  bggPreview(),
]);

const themeTitle = new Map(productThemes.map((t) => [t.ID, t.TITEL]));
const germanTitle = new Map(german.map((p) => [p.ID, decode(p.TITEL).trim()]));
const exhibitorById = new Map(exhibitors.map((e) => [e.ID, e]));

const CURRENCY = { EUR: "€", USD: "$", GBP: "£" };
const money = (amount, currency) =>
  amount > 0 ? `${CURRENCY[currency] ?? `${currency} `}${Number.isInteger(amount) ? amount : amount.toFixed(2)}` : undefined;
const num = (v) => Number(v ?? 0) || 0;
/** 2, 4 → "2–4"; 2, 2 → "2"; nothing → undefined. */
const span = (min, max) => (min ? (max > min ? `${min}–${max}` : `${min}`) : undefined);

/** Early ratings come from playtesters and preview copies; below this many they're noise. */
const MIN_RATINGS = 5;

const bgg = preview.map((p) => {
  const item = p.geekitem.item;
  const info = item.dynamicinfo?.item ?? {};
  const stats = info.stats ?? {};
  return {
    id: Number(p.objectid),
    name: item.primaryname.name,
    key: norm(item.primaryname.name),
    stands: bggStands(p.location),
    short: item.short_description || undefined,
    // What the list shows.
    summary: {
      id: Number(p.objectid),
      thumbs: p.reactions?.thumbs || undefined,
      rating: num(stats.usersrated) >= MIN_RATINGS ? Math.round(num(stats.average) * 10) / 10 : undefined,
      ratings: num(stats.usersrated) >= MIN_RATINGS ? num(stats.usersrated) : undefined,
      demoOnly: p.availability_status === "demo" || undefined,
      showPrice: money(p.showprice, p.showprice_currency),
    },
    // What only the game page shows.
    expands: (item.links?.expandsboardgame ?? []).map((l) => ({ id: Number(l.objectid), name: l.name })),
    // BGG's community-kept facts, preferred over what exhibitors typed into the official form.
    facts: {
      players: span(num(item.minplayers), num(item.maxplayers)),
      time: span(num(item.minplaytime), num(item.maxplaytime)),
      age: num(item.minage) || undefined,
      designers: (item.links?.boardgamedesigner ?? []).map((l) => l.name).filter((n) => n !== "(Uncredited)"),
      mechanisms: (item.links?.boardgamemechanic ?? []).map((l) => l.name),
      msrp: p.msrp_currency === "EUR" && p.msrp > 0 ? p.msrp : undefined,
    },
  };
});
const bggByName = Map.groupBy(bgg, (b) => b.key);

/**
 * Exact name first; otherwise a near-identical name (typos, "–" vs ":", plurals), preferring games
 * listed at the same booth. A sequel or expansion that merely starts with the base game's name
 * ("ANTgravity: Ice" vs "ANTgravity") is not a match — a search link beats a wrong direct link.
 */
function matchBgg(title, stands) {
  const key = norm(title);
  const exact = bggByName.get(key);
  if (exact) return exact.find((b) => b.stands.some((s) => stands.includes(s))) ?? exact[0];
  const atBooth = bgg.filter((b) => b.stands.some((s) => stands.includes(s)));
  for (const [pool, min] of [[atBooth, 0.85], [bgg, 0.92]]) {
    let best;
    let score = 0;
    for (const b of pool) {
      if (key.startsWith(b.key) || b.key.startsWith(key)) {
        // Only tolerate a one- or two-letter tail ("Railway" / "Railways").
        if (Math.abs(key.length - b.key.length) > 2) continue;
      }
      const s = similarity(key, b.key);
      if (s > score) [best, score] = [b, s];
    }
    if (best && score >= min) return best;
  }
}

/** "Queen Alice" → "queen-alice"; the id breaks ties, so a game keeps its URL between runs. */
const slugify = (s) =>
  decode(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "game";

const KIND = { "TYPE.1": "New", "TYPE.2": "Expansion" };

/*
 * The official form is filled in by exhibitors and it shows: ages of 0+ or 70+, playing times of a
 * minute or 999999999, every language ticked, the publisher entered as the designer, "Board Game" as a
 * category. For games matched on BGG its values win; the rest pass through these sanity checks, and
 * anything implausible is left out rather than shown.
 */
const plausible = {
  players: (s) => {
    const [min, max = min] = (s ?? "").split(/\s*-\s*/).map(Number);
    return min >= 1 && max >= min && max <= 30 ? span(min, max) : undefined;
  },
  time: (s) => {
    const [min, max = min] = (s ?? "").replace(/minutes?/, "").split(/\s*-\s*/).map(Number);
    return min >= 5 && max >= min && max <= 480 ? span(min, max) : undefined;
  },
  age: (s) => {
    const age = parseInt(s ?? "", 10);
    return age >= 2 && age <= 21 ? age : undefined;
  },
  // A company name in the designer field.
  authors: (s, publisher) =>
    s && !/\b(verlag|gmbh|games|spiele|edition|studio|publishing|ltd|inc|kg)\b/i.test(s) && norm(s) !== norm(publisher ?? "")
      ? s
      : undefined,
  // Every box ticked says nothing.
  languages: (list) => (list && list.length <= 6 ? list.filter((l) => l !== "Other") : undefined),
  mechanisms: (list) => (list && list.length <= 6 ? list.filter((m) => m !== "Others") : undefined),
  categories: (list) => (list.length <= 6 ? list.filter((c) => c !== "Board Game" && c !== "Other") : []),
};

/** "49.99 €"; a price a hundred times BGG's (1499 for 14.99) was a missing decimal point. */
function price(raw, msrp) {
  const value = Number((raw ?? "").replace(/[^\d.,]/g, "").replace(",", "."));
  if (!(value >= 1)) return msrp ? `${msrp} €` : undefined;
  if (msrp && value / msrp > 20) return `${msrp} €`;
  return `${Number.isInteger(value) ? value : value.toFixed(2)} €`;
}

const details = {};
const catalog = products.map((p) => {
  const { fields, paragraphs, body } = parseInfo(p.INFO ?? "");
  const title = decode(p.TITEL).trim();
  const de = germanTitle.get(p.ID);
  const exhibitor = exhibitorById.get(p.FIRMA_ID);
  const booths = (exhibitor?.STAENDE ?? []).map((s) => s.ID);
  const match = matchBgg(title, booths.map((b) => b.split(".")[1]));
  const bggFacts = match?.facts ?? {};
  const themes = p.THEMEN ?? [];
  const pick = (root) => themes.filter((t) => t.startsWith(`${root}.`)).map((t) => themeTitle.get(t)).filter(Boolean);
  const list = (s) => s?.split("\n").map((x) => x.trim()).filter(Boolean);
  const publisher = fields.Publisher || p.UNTERTITEL || undefined;
  const age = bggFacts.age ?? plausible.age(fields["Playing Age"]);
  const time = bggFacts.time ?? plausible.time(fields["Playing time"]);
  details[p.ID] = {
    description: paragraphs,
    illustrators: fields.Illustrator,
    release: /^\d{2}\/\d{4}$/.test(fields["Release date"] ?? "") ? fields["Release date"] : undefined,
    mechanisms: bggFacts.mechanisms?.length ? bggFacts.mechanisms : plausible.mechanisms(list(fields.Mechanisms)),
    languages: plausible.languages(list(fields.Languages)),
    bggName: match && norm(match.name) !== norm(title) ? match.name : undefined,
    expands: match?.expands.length ? match.expands : undefined,
  };
  return {
    id: p.ID,
    slug: slugify(title),
    title,
    de: de && norm(de) !== norm(title) ? de : undefined,
    publisher,
    exhibitor: exhibitor?.NAME,
    authors: bggFacts.designers?.length
      ? bggFacts.designers.join(", ")
      : plausible.authors(fields.Author, publisher),
    players: bggFacts.players ?? plausible.players(fields["Number of players"]),
    time, // minutes, e.g. "30–120"
    age: age ? `${age}+` : undefined,
    price: price(fields["Retail price"], bggFacts.msrp),
    kind: KIND[themes.find((t) => t.startsWith("TYPE."))],
    level: pick("LEVEL").filter((l) => l !== "N/A")[0],
    categories: plausible.categories(pick("CATEGORIES")),
    image: p.BILDER?.split("|")[0] || undefined,
    booths,
    bgg: match?.summary,
    blurb: match?.short ?? clip(body, 260),
  };
});

// Oldest id keeps the bare slug; later duplicates get their id appended.
const taken = new Set();
for (const g of [...catalog].sort((a, b) => Number(a.id) - Number(b.id))) {
  if (taken.has(g.slug)) g.slug = `${g.slug}-${g.id}`;
  taken.add(g.slug);
}

/** Downloads and resizes one cover; true when both sizes are on disk afterwards. */
async function cover(image) {
  const name = image.replace(/\.[^.]+$/, "");
  const files = Object.keys(SIZES).map((size) => new URL(`${size}/${name}.webp`, COVERS));
  if (files.every((f) => existsSync(f))) return name;
  if (skipCovers) return undefined;
  try {
    const res = await fetch(IMAGES + encodeURIComponent(image));
    if (!res.ok) throw new Error(`${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    for (const [size, width] of Object.entries(SIZES)) {
      await sharp(buf)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .webp({ quality: 74 })
        .toFile(fileURLToPath(new URL(`${size}/${name}.webp`, COVERS)));
    }
    return name;
  } catch (err) {
    console.warn(`cover ${image}: ${err.message}`);
    return undefined;
  }
}

for (const size of Object.keys(SIZES)) mkdirSync(new URL(`${size}/`, COVERS), { recursive: true });
const queue = catalog.filter((g) => g.image);
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let g; (g = queue.shift()); ) g.cover = await cover(g.image);
  }),
);
for (const g of catalog) delete g.image;

catalog.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
const fetched = new Date().toISOString().slice(0, 10);
writeFileSync(new URL("catalog.json", DATA), JSON.stringify({ fetched, games: catalog }));
writeFileSync(new URL("details.json", DATA), JSON.stringify(details));
const count = (f) => catalog.filter(f).length;
console.log(
  `${catalog.length} games from ${exhibitors.length} exhibitors: ${count((g) => g.bgg)} with a BGG page ` +
    `(${count((g) => g.bgg?.rating)} with a score, ${count((g) => g.bgg?.demoOnly)} demo only), ` +
    `${count((g) => g.cover)} with a cover`,
);
