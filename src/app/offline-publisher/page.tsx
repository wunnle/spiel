"use client";

import { useSyncExternalStore } from "react";
import { CompanyView } from "@/components/company-view";
import { COMPANY_BY_SLUG } from "@/lib/catalog";

// The service worker serves this page for a /publishers/<slug>/ that was never opened while online,
// so the URL is the company's, not this page's. It rebuilds the page from the list data.

const noop = () => () => {};
const slugFromUrl = () => location.pathname.match(/\/publishers\/([^/]+)/)?.[1] ?? "";

export default function OfflinePublisher() {
  const slug = useSyncExternalStore(noop, slugFromUrl, () => "");
  const company = COMPANY_BY_SLUG.get(decodeURIComponent(slug));
  if (!slug) return null;
  if (!company) {
    return (
      <p className="rounded-lg bg-black/[0.03] p-4 text-neutral-500 dark:bg-white/[0.05] dark:text-neutral-400">
        You&apos;re offline, and this publisher isn&apos;t in the saved list.
      </p>
    );
  }
  return <CompanyView company={company} />;
}
