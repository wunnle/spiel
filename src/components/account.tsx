"use client";

import { useEffect, useRef, useState } from "react";
import { SYNC_ENABLED, signIn, signOut, startSync, useSync } from "@/lib/sync";
import { MenuItem } from "./offline";
import { Tools } from "./tools";

function SignOutIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H4" />
    </svg>
  );
}

function SyncIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
    </svg>
  );
}

/**
 * The header's menu: your avatar when signed in (a person icon otherwise). Holds sign-in or your
 * account, the occasional tools (Send to SPIEL app, Save for offline) and sign-out.
 */
export function Account() {
  const sync = useSync();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => startSync(), []);

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const { user, status } = sync;
  // Synced is the normal state and says nothing; only a change still waiting to go up is worth a word.
  const pending = status === "error";

  const avatar = (size: string) =>
    user?.avatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.avatar} alt="" referrerPolicy="no-referrer" className={`${size} shrink-0 rounded-full`} />
    ) : user ? (
      <span
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900`}
      >
        {(user.name ?? user.email ?? "?")[0].toUpperCase()}
      </span>
    ) : (
      <span
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-neutral-500 dark:bg-white/[0.1] dark:text-neutral-400`}
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </span>
    );

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-expanded={menu}
        aria-label="Menu"
        className="flex items-center gap-2 rounded-full text-sm"
      >
        {user && pending ? (
          <span className="text-xs text-amber-700 dark:text-amber-300" title="Saved on this device; syncs when you're back online">
            Not synced yet
          </span>
        ) : null}
        {avatar("h-7 w-7")}
      </button>

      {/* Hidden rather than unmounted, so a cover download carries on when the menu closes. */}
      <div
        className={`${menu ? "" : "hidden"} absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-black/10 bg-white text-sm shadow-lg dark:border-white/15 dark:bg-neutral-900`}
      >
        {/* Who you are, or how to become someone. */}
        {user ? (
          <div className="flex items-center gap-3 bg-black/[0.02] px-3 py-3 dark:bg-white/[0.03]">
            {avatar("h-9 w-9")}
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{user.name ?? user.email}</p>
              {user.name ? <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p> : null}
              {pending ? <p className="text-xs text-amber-700 dark:text-amber-300">Some changes not synced yet</p> : null}
            </div>
          </div>
        ) : SYNC_ENABLED && sync.ready ? (
          <div className="bg-black/[0.02] p-1.5 dark:bg-white/[0.03]">
            <MenuItem
              icon={<SyncIcon className="h-4 w-4" />}
              label="Sign in with Google"
              sub="Sync your marks across devices"
              onClick={() => {
                setMenu(false);
                void signIn();
              }}
            />
          </div>
        ) : null}

        <div className="border-t border-black/5 p-1.5 first:border-t-0 dark:border-white/10">
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            At the fair
          </p>
          <Tools />
        </div>

        {user ? (
          <div className="border-t border-black/5 p-1.5 dark:border-white/10">
            <MenuItem
              icon={<SignOutIcon className="h-4 w-4" />}
              label="Sign out"
              title="Your marks stay on this device"
              onClick={() => {
                setMenu(false);
                void signOut();
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
