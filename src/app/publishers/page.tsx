import type { Metadata } from "next";
import Link from "next/link";
import { COMPANIES, companyPath } from "@/lib/catalog";
import { splitBooth } from "@/lib/site";

export const metadata: Metadata = {
  title: "Publishers",
  description: "Every publisher and exhibitor with new games at SPIEL Essen 2026, with their halls.",
};

/** First letter for grouping; digits and symbols share "#". */
const initial = (name: string) => {
  const c = name.normalize("NFKD").charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

export default function Publishers() {
  const groups = new Map<string, typeof COMPANIES>();
  for (const c of COMPANIES) groups.set(initial(c.name), [...(groups.get(initial(c.name)) ?? []), c]);
  const letters = [...groups.keys()].sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)));
  return (
    <article className="max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Publishers</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        {COMPANIES.length} companies showing new games. Distributors list everything at their booths.
      </p>

      <nav aria-label="Jump to letter" className="mt-5 flex flex-wrap gap-1 text-sm">
        {letters.map((l) => (
          <a
            key={l}
            href={`#letter-${l}`}
            className="w-7 rounded py-0.5 text-center font-medium text-neutral-600 hover:bg-black/[0.05] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
          >
            {l}
          </a>
        ))}
      </nav>

      {letters.map((l) => (
        <section key={l} id={`letter-${l}`} className="mt-8 scroll-mt-4">
          <h2 className="border-b border-black/10 pb-1 text-sm font-semibold text-neutral-500 dark:border-white/15 dark:text-neutral-400">
            {l}
          </h2>
          <ul className="mt-1 grid gap-x-8 sm:grid-cols-2">
            {groups.get(l)!.map((c) => {
              const halls = [...new Set(c.booths.map((b) => splitBooth(b).hall))];
              return (
                <li key={c.slug}>
                  <Link
                    href={companyPath(c)}
                    prefetch={false}
                    className="flex items-baseline justify-between gap-3 rounded px-1 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">{c.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
                      {halls.length ? `Hall ${halls.join(", ")} · ` : ""}
                      {c.games.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </article>
  );
}
