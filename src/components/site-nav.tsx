"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  // Games covers the list and every game page (and the offline stand-in for one).
  { href: "/", label: "Games", match: (p: string) => p === "/" || p.startsWith("/games/") || p.startsWith("/offline-game") },
  { href: "/publishers/", label: "Publishers", match: (p: string) => p.startsWith("/publishers") || p.startsWith("/offline-publisher") },
];

/** Games · Publishers, with the current section underlined in the accent like the list's tabs. */
export function SiteNav({ className = "" }: { className?: string }) {
  const path = usePathname() ?? "/";
  return (
    <nav className={`flex gap-4 text-sm font-medium ${className}`}>
      {LINKS.map((l) => {
        const active = l.match(path);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-neutral-900 underline decoration-orange-500 decoration-2 underline-offset-[6px] dark:text-neutral-50"
                : "text-neutral-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
