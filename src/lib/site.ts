/** Path prefix the site is served under ("" at a domain root). Plain <img> and fetch URLs need it. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Absolute origin + base, for canonical URLs and Open Graph images. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Essen ’26 Novelties";

/** Deep link into the official hall plan with the booth circled. */
export function boothMap(id: string) {
  return `https://maps.eyeled-services.de/maps/en/spiel26/stand/${id}`;
}

/** "3.3U210" → { hall: "3", stand: "3U210" } */
export function splitBooth(id: string) {
  const [hall, stand] = id.split(".");
  return { hall, stand };
}
