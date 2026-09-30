import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Account } from "@/components/account";
import { OfflineBadge, ServiceWorker } from "@/components/offline";
import { SiteNav } from "@/components/site-nav";
import { FETCHED } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — every new game at SPIEL Essen`, template: `%s · ${SITE_NAME}` },
  description:
    "Every new release and expansion at SPIEL Essen, 22–25 Oct 2026: booths, BoardGameGeek links, a shopping list, and it works offline in the halls.",
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f5",
};

const LINKS = [
  { name: "Official novelties list", href: "https://www.spiel-essen.de/en/the-spiel/novelties" },
  { name: "BGG SPIEL ’26 preview", href: "https://boardgamegeek.com/geekpreview/93/spiel-essen-2026" },
  { name: "Hall plan", href: "https://maps.eyeled-services.de/maps/en/spiel26" },
  { name: "SPIEL app", href: "https://play.google.com/store/apps/details?id=com.eyeled.spiel&hl=en" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Light only for now. The dark: styles stay in place (they key off a "dark" class on <html>, which
    // nothing sets any more), so a theme switch can come back without restyling.
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ServiceWorker />
        <div className="mx-auto w-full max-w-5xl px-5 pt-6 pb-12 font-sans text-neutral-800 dark:text-neutral-200">
          {/* Logo, nav, account in one row; on phones the nav drops below the other two. On desktop it
              shares the list page's columns, so the nav lines up with the game list. */}
          <header className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 lg:grid lg:grid-cols-[14.5rem_1fr_auto] lg:gap-x-10">
            <Link href="/" className="flex items-center gap-2.5">
              <svg viewBox="0 0 64 64" aria-hidden className="h-8 w-8 shrink-0">
                <path
                  fill="#f97316"
                  d="M32 11a7.5 7.5 0 0 1 7.5 7.5c0 2.3-1 4.3-2.6 5.7 6.9 1.2 14.1 3.6 14.1 7.8 0 3.2-4.3 4.3-8.8 4.6L48 51.5c.4 1-.4 1.5-1.4 1.5H37.4c-.8 0-1.4-.4-1.8-1.1L32 45.4l-3.6 6.5c-.4.7-1 1.1-1.8 1.1h-9.2c-1 0-1.8-.5-1.4-1.5l5.8-14.9c-4.5-.3-8.8-1.4-8.8-4.6 0-4.2 7.2-6.6 14.1-7.8a7.5 7.5 0 0 1 4.7-13.2z"
                />
              </svg>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{SITE_NAME}</span>
                <span className="text-[11px] font-medium tracking-wide text-neutral-400">SPIEL Essen · 22–25 Oct</span>
              </span>
            </Link>
            <SiteNav className="order-last w-full sm:order-none sm:w-auto" />
            <div className="ml-auto flex items-center gap-4 lg:ml-0">
              <OfflineBadge />
              <Account />
            </div>
          </header>

          <main>{children}</main>

          {/* Full page width: the credits at a readable measure on the left, the source links on the right. */}
          <footer className="mt-16 flex flex-col gap-4 border-t border-black/10 pt-6 text-sm leading-relaxed text-neutral-500 lg:flex-row lg:justify-between lg:gap-12 dark:border-white/10 dark:text-neutral-400">
            <p className="max-w-2xl">
              An unofficial fan guide, not affiliated with SPIEL Essen or its organiser. Games, booths, box art
              and details come from the official novelties list, which exhibitors fill in themselves and keep
              editing up to the fair; this site refreshes it daily (last {FETCHED}). A game can sit at a
              distributor&apos;s booth rather than its publisher&apos;s — that&apos;s what &ldquo;at …&rdquo;
              means. Games matched to BGG&apos;s SPIEL preview link straight to their BoardGameGeek page, and
              &ldquo;Most wanted&rdquo; sorts by thumbs-up there. <strong>Buzz</strong> marks the games press and
              community &ldquo;most anticipated&rdquo; lists keep naming. Your marks stay on this device.
            </p>
            <p className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:items-end">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {l.name}
                </a>
              ))}
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
