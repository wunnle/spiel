import type { Metadata } from "next";
import { notFound } from "next/navigation";
import details from "@/data/details.json";
import { GameView, type Details } from "@/components/game-view";
import { BY_SLUG, CATALOG, coverUrl, gamePath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

// Every game is prerendered; there's no server to render an unknown one.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOG.map((g) => ({ slug: g.slug }));
}

const DETAILS = details as Record<string, Details>;
const NONE: Details = { description: [] };

export async function generateMetadata({ params }: PageProps<"/games/[slug]">): Promise<Metadata> {
  const game = BY_SLUG.get((await params).slug);
  if (!game) return {};
  const where = game.booths.length ? `Hall ${game.booths.map((b) => b.split(".")[1]).join(", ")}` : undefined;
  const description = [game.publisher, where, game.blurb].filter(Boolean).join(" · ");
  // Absolute, because metadataBase doesn't add the base path and coverUrl already has it.
  const image = coverUrl(game, "lg");
  const origin = new URL(SITE_URL).origin;
  return {
    title: game.title,
    description,
    alternates: { canonical: `${SITE_URL}${gamePath(game)}` },
    openGraph: { title: game.title, description, images: image ? [origin + image] : undefined },
  };
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const game = BY_SLUG.get((await params).slug);
  if (!game) notFound();
  return <GameView game={game} details={DETAILS[game.id] ?? NONE} />;
}
