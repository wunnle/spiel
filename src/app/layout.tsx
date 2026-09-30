import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Account } from "@/components/account";
import { OfflineBadge, ServiceWorker } from "@/components/offline";
import { FETCHED } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — every new game at SPIEL Essen`, template: `%s · ${SITE_NAME}` },
  description:
    "Every new release and expansion at SPIEL Essen, 22–25 Oct 2026: booths, BoardGameGeek links, a shopping list, and it works offline in the halls.",
  appleWebApp: { capable: true, title: "Essen ’26", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const LINKS = [
  { name: "Official novelties list", href: "https://www.spiel-essen.de/en/the-spiel/novelties" },
  { name: "BGG SPIEL ’26 preview", href: "https://boardgamegeek.com/geekpreview/93/spiel-essen-2026" },
  { name: "Hall plan", href: "https://maps.eyeled-services.de/maps/en/spiel26" },
  { name: "SPIEL app", href: "https://play.google.com/store/apps/details?id=com.eyeled.spiel&hl=en" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ServiceWorker />
        <div className="mx-auto w-full max-w-6xl px-5 pt-6 pb-12 font-sans text-neutral-800 dark:text-neutral-200">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {SITE_NAME}
                <span className="ml-2 text-sm font-medium text-neutral-400">SPIEL Essen · 22–25 Oct</span>
              </Link>
              <nav className="flex gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                  Games
                </Link>
                <Link href="/publishers/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                  Publishers
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <OfflineBadge />
              <Account />
            </div>
          </header>

          <main>{children}</main>

          <footer className="mt-16 max-w-3xl space-y-3 border-t border-black/10 pt-6 text-sm leading-relaxed text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            <p>
              An unofficial fan guide, not affiliated with SPIEL Essen or its organiser. Games, booths, box art
              and details come from the official novelties list, which exhibitors fill in themselves and keep
              editing up to the fair; this site refreshes it daily (last {FETCHED}). A game can sit at a
              distributor&apos;s booth rather than its publisher&apos;s — that&apos;s what &ldquo;at …&rdquo;
              means. Games matched to BGG&apos;s SPIEL preview link straight to their BoardGameGeek page, and
              &ldquo;Most wanted&rdquo; sorts by thumbs-up there. <strong>Buzz</strong> marks the games press and
              community &ldquo;most anticipated&rdquo; lists keep naming. Your marks stay on this device.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
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
