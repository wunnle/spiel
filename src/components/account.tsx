"use client";

import { useEffect, useRef, useState } from "react";
import { SYNC_ENABLED, signIn, signOut, startSync, useSync } from "@/lib/sync";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

const MENU_ITEM =
  "block w-full rounded-md px-2 py-1.5 text-left font-medium text-neutral-700 hover:bg-black/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.06]";

/** Sign in with Google, or once signed in your avatar with sync status and sign-out. */
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
  const note = { idle: "", syncing: "Syncing…", synced: "Marks synced", error: "Will sync when back online" }[status];

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {SYNC_ENABLED && sync.ready && !user ? (
        <button
          type="button"
          onClick={() => void signIn()}
          title="Keep your marks on every device"
          className="flex items-center gap-2 rounded-md border border-black/10 px-2.5 py-1 text-sm font-medium text-neutral-700 hover:border-black/25 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/30"
        >
          <GoogleIcon />
          Sign in
        </button>
      ) : null}

      {user ? (
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-label="Account"
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
          {note ? <span className="hidden sm:inline">{note}</span> : null}
        </button>
      ) : null}

      {menu && user ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-black/10 bg-white p-2 text-sm shadow-lg dark:border-white/15 dark:bg-neutral-900">
          <div className="border-b border-black/5 px-2 pb-2 dark:border-white/10">
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name ?? user.email}</p>
            {user.name ? <p className="text-neutral-500 dark:text-neutral-400">{user.email}</p> : null}
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Your marks sync to every device you sign in on.{note ? ` ${note}.` : ""}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                void signOut();
              }}
              className={MENU_ITEM}
            >
              Sign out
              <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400">
                Your marks stay on this device
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
