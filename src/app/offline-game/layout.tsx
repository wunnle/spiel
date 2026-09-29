import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function OfflineGameLayout({ children }: LayoutProps<"/offline-game">) {
  return children;
}
