"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore/lite";
import { useSyncExternalStore } from "react";
import { mergeMarks, onMarkChange, type Mark, type Stamped } from "./marks";

// Signing in with Google mirrors your marks to Firestore (users/{uid}/marks/{game id}; rules in
// firestore.rules), so they follow you between phone and laptop. The device stays the source of
// truth: marks work offline and signed out, and sync whenever there's a user and a connection —
// newest change per game wins.
//
// NEXT_PUBLIC_FIREBASE_CONFIG is the web app's config object as JSON (Firebase console → Project
// settings → Your apps). Without it there's no sign-in at all.

type Config = { apiKey: string; authDomain: string; projectId: string; appId: string };

function readConfig(): Config | undefined {
  try {
    const c = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? "");
    return c?.apiKey && c?.projectId ? c : undefined;
  } catch {
    return undefined;
  }
}
const CONFIG = readConfig();
export const SYNC_ENABLED = !!CONFIG;

type Doc = { mark: Mark | null; at: number };

export type SyncState = {
  /** false until the stored sign-in (if any) has been read. */
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

// Firebase loads only when sync is configured, and only in the browser. Firestore Lite: plain reads
// and writes, a fraction of the full SDK — local storage already covers offline.
type Services = { app: FirebaseApp; auth: Auth; db: Firestore };
let services: Promise<Services> | undefined;
function firebase() {
  services ??= Promise.all([import("firebase/app"), import("firebase/auth"), import("firebase/firestore/lite")]).then(
    ([{ initializeApp }, { getAuth }, { getFirestore }]) => {
      const app = initializeApp(CONFIG!);
      return { app, auth: getAuth(app), db: getFirestore(app) };
    },
  );
  return services;
}

let user: User | null = null;

// Game ids can hold characters Firestore doesn't allow in a document id ("pick:<title>").
const docId = (id: string) => encodeURIComponent(id);

/** Pulls everything, keeps the newest side of each game, and pushes back what the device had newer. */
async function syncAll() {
  if (!user || !navigator.onLine) return;
  const uid = user.uid;
  set({ status: "syncing" });
  try {
    const { db } = await firebase();
    const { collection, getDocs, writeBatch, doc } = await import("firebase/firestore/lite");
    const snap = await getDocs(collection(db, "users", uid, "marks"));
    const remote: Record<string, Stamped> = {};
    snap.forEach((d) => {
      const { mark, at } = d.data() as Doc;
      remote[decodeURIComponent(d.id)] = { mark, at };
    });
    const newer = mergeMarks(remote);
    // A batch takes up to 500 writes.
    for (let i = 0; i < newer.length; i += 500) {
      const batch = writeBatch(db);
      for (const [id, e] of newer.slice(i, i + 500)) {
        batch.set(doc(db, "users", uid, "marks", docId(id)), { mark: e.mark, at: e.at } satisfies Doc);
      }
      await batch.commit();
    }
    set({ status: "synced" });
  } catch {
    // Left for the next sync: the device still has everything, and newer local changes win then.
    set({ status: "error" });
  }
}

async function pushOne(id: string, entry: Stamped) {
  if (!user || !navigator.onLine) return;
  try {
    const { db } = await firebase();
    const { doc, setDoc } = await import("firebase/firestore/lite");
    await setDoc(doc(db, "users", user.uid, "marks", docId(id)), { mark: entry.mark, at: entry.at } satisfies Doc);
    set({ status: "synced" });
  } catch {
    set({ status: "error" });
  }
}

let started = false;
/** Wires everything up once per page load. */
export function startSync() {
  if (!SYNC_ENABLED || started) return;
  started = true;
  onMarkChange(pushOne);
  window.addEventListener("online", () => void syncAll());
  void firebase().then(async ({ auth }) => {
    const { onAuthStateChanged, getRedirectResult } = await import("firebase/auth");
    // Finishes a redirect sign-in (the fallback when a popup was blocked).
    getRedirectResult(auth).catch(() => {});
    onAuthStateChanged(auth, (u) => {
      const signedIn = !user && u;
      user = u;
      set({
        ready: true,
        user: u ? { email: u.email ?? undefined, name: u.displayName ?? undefined, avatar: u.photoURL ?? undefined } : undefined,
        status: u ? state.status : "idle",
      });
      if (signedIn) void syncAll();
    });
  });
}

export async function signIn() {
  const { auth } = await firebase();
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    // Popup blocked (some in-app browsers): go the long way round.
    if ((err as { code?: string }).code === "auth/popup-blocked") await signInWithRedirect(auth, provider);
  }
}

/** Signs out; your marks stay on this device. */
export async function signOut() {
  const { auth } = await firebase();
  const { signOut: out } = await import("firebase/auth");
  await out(auth);
}
