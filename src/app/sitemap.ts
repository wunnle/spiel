import type { MetadataRoute } from "next";
import { CATALOG, FETCHED, gamePath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: FETCHED },
    ...CATALOG.map((g) => ({ url: `${SITE_URL}${gamePath(g)}`, lastModified: FETCHED })),
  ];
}
