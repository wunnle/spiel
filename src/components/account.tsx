"use client";

import { useEffect, useState } from "react";
import { SYNC_ENABLED, signIn, signOut, startSync, useSync } from "@/lib/sync";

/** Sign in with Google to keep your marks on every device. Hidden when sync isn't configured. */
export function Account() {
  const sync = useSync();
  const [menu, setMenu] = useState(false);

  useEffect(() => startSync(), []);

  if (!SYNC_ENABLED || !sync.ready) return null;

  if (!sync.user) {
    return (
      <button
        type="button"
        onClick={() => void signIn()}
        title="Keep your marks on every device"
        className="flex items-center gap-2 rounded-md border border-black/10 px-2.5 py-1 text-sm font-medium text-neutral-700 hover:border-black/25 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/30"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
          <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
        </svg>
        Sign in
      </button>
    );
  }

  const { user, status } = sync;
  const note = { idle: "", syncing: "Syncing…", synced: "Marks synced", error: "Will sync when back online" }[status];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-expanded={menu}
        className="flex items-center gap-2 rounded-full text-sm text-neutral-600 dark:text-neutral-300"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline">{note}</span>
      </button>
      {menu ? (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-black/10 bg-white p-3 text-sm shadow-lg dark:border-white/15 dark:bg-neutral-900">
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name ?? user.email}</p>
          {user.name ? <p className="text-neutral-500 dark:text-neutral-400">{user.email}</p> : null}
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Your marks sync to every device you sign in on.{note ? ` ${note}.` : ""}
          </p>
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              void signOut();
            }}
            className="mt-3 font-medium text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
          >
            Sign out
          </button>
          <p className="mt-1 text-xs text-neutral-400">Signing out keeps your marks on this device.</p>
        </div>
      ) : null}
    </div>
  );
}
