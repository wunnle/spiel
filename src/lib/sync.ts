"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { mergeMarks, onMarkChange, type Mark, type Stamped } from "./marks";

// Signing in with Google mirrors your marks to a Supabase table (supabase/schema.sql), so they follow
// you between phone and laptop. The device stays the source of truth: marks work offline and signed
// out, and sync whenever there's a session and a connection — newest change per game wins.
//
// Without NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY at build time there's no sign-in at all.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SYNC_ENABLED = !!(URL && ANON_KEY);

type Row = { user_id: string; game_id: string; mark: Mark | null; updated_at: string };

export type SyncState = {
  /** false until the stored session (if any) has been read. */
  ready: boolean;
  user?: { email?: string; name?: string; avatar?: string };
  status: "idle" | "syncing" | "synced" | "error";
};

let state: SyncState = { ready: !SYNC_ENABLED, status: "idle" };
const listeners = new Set<() => void>();
function set(next: Partial<SyncState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function useSync() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

// The client library is loaded only when sync is configured, and only in the browser.
let client: Promise<SupabaseClient> | undefined;
function supabase() {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(URL!, ANON_KEY!, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } }),
  );
  return client;
}

let session: Session | null = null;

const toRow = (userId: string, id: string, e: Stamped): Row => ({
  user_id: userId,
  game_id: id,
  mark: e.mark,
  updated_at: new Date(e.at).toISOString(),
});

/** Pulls everything, keeps the newest side of each game, and pushes back what the device had newer. */
async function syncAll() {
  if (!session || !navigator.onLine) return;
  set({ status: "syncing" });
  try {
    const db = await supabase();
    const { data, error } = await db.from("marks").select("game_id, mark, updated_at");
    if (error) throw error;
    const remote: Record<string, Stamped> = {};
    for (const r of data as Row[]) remote[r.game_id] = { mark: r.mark, at: Date.parse(r.updated_at) };
    const newer = mergeMarks(remote);
    if (newer.length) {
      const { error: pushError } = await db
        .from("marks")
        .upsert(newer.map(([id, e]) => toRow(session!.user.id, id, e)), { onConflict: "user_id,game_id" });
      if (pushError) throw pushError;
    }
    set({ status: "synced" });
  } catch {
    // Left for the next sync: the device still has everything, and newer local changes win then.
    set({ status: "error" });
  }
}

async function pushOne(id: string, entry: Stamped) {
  if (!session || !navigator.onLine) return;
  try {
    const db = await supabase();
    const { error } = await db.from("marks").upsert(toRow(session.user.id, id, entry), { onConflict: "user_id,game_id" });
    if (error) throw error;
    set({ status: "synced" });
  } catch {
    set({ status: "error" });
  }
}

function userOf(s: Session | null): SyncState["user"] {
  if (!s) return undefined;
  const meta = s.user.user_metadata ?? {};
  return { email: s.user.email, name: meta.full_name ?? meta.name, avatar: meta.avatar_url ?? meta.picture };
}

let started = false;
/** Wires everything up once per page load. */
export function startSync() {
  if (!SYNC_ENABLED || started) return;
  started = true;
  onMarkChange(pushOne);
  window.addEventListener("online", () => void syncAll());
  void supabase().then((db) => {
    db.auth.onAuthStateChange((event, s) => {
      session = s;
      set({ ready: true, user: userOf(s), status: s ? state.status : "idle" });
      if (event === "SIGNED_IN" || (event === "INITIAL_SESSION" && s)) {
        // Back from Google: drop the ?code= the redirect left behind.
        if (location.search.includes("code=")) history.replaceState(null, "", location.pathname);
        void syncAll();
      }
    });
  });
}

export async function signIn() {
  const db = await supabase();
  await db.auth.signInWithOAuth({
    provider: "google",
    // Back to the page you were on. Supabase must allow it: Auth → URL Configuration → Redirect URLs.
    options: { redirectTo: `${location.origin}${location.pathname}` },
  });
}

/** Signs out; your marks stay on this device. */
export async function signOut() {
  const db = await supabase();
  await db.auth.signOut();
}
