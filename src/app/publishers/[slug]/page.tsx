import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyView } from "@/components/company-view";
import { COMPANIES, COMPANY_BY_SLUG, companyPath } from "@/lib/catalog";
import { SITE_URL, splitBooth } from "@/lib/site";

// Every company is prerendered; there's no server to render an unknown one.
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/publishers/[slug]">): Promise<Metadata> {
  const company = COMPANY_BY_SLUG.get((await params).slug);
  if (!company) return {};
  const halls = [...new Set(company.booths.map((b) => splitBooth(b).hall))];
  const description = [
    `${company.games.length} ${company.games.length === 1 ? "game" : "games"} at SPIEL Essen 2026`,
    halls.length ? `Hall ${halls.join(", ")}` : undefined,
    company.games
      .slice(0, 5)
      .map((g) => g.title)
      .join(", "),
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    title: company.name,
    description,
    alternates: { canonical: `${SITE_URL}${companyPath(company)}` },
  };
}

export default async function CompanyPage({ params }: PageProps<"/publishers/[slug]">) {
  const company = COMPANY_BY_SLUG.get((await params).slug);
  if (!company) notFound();
  return <CompanyView company={company} />;
}
