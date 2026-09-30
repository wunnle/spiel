import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function OfflinePublisherLayout({ children }: LayoutProps<"/offline-publisher">) {
  return children;
}
