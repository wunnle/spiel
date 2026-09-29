"use client";

import { useSyncExternalStore } from "react";
import { GameView } from "@/components/game-view";
import { BY_SLUG } from "@/lib/catalog";

// The service worker serves this page for a /games/<slug>/ that was never opened while online, so the
// URL is the game's, not this page's. It rebuilds the game from the list data the app already carries.

const noop = () => () => {};
const slugFromUrl = () => location.pathname.match(/\/games\/([^/]+)/)?.[1] ?? "";

export default function OfflineGame() {
  const slug = useSyncExternalStore(noop, slugFromUrl, () => "");
  const game = BY_SLUG.get(decodeURIComponent(slug));
  if (!slug) return null;
  if (!game) {
    return (
      <p className="rounded-lg bg-black/[0.03] p-4 text-neutral-500 dark:bg-white/[0.05] dark:text-neutral-400">
        You&apos;re offline, and this game isn&apos;t in the saved list.
      </p>
    );
  }
  return <GameView game={game} />;
}
