// After `next build`: writes out/sw.js from scripts/sw.js with this build's precache list, and copies
// Firebase's sign-in helper into out/__/auth/ (see below).

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  );
}

// Paths relative to the service worker's scope, so they work under any base path.
const assets = walk(join(OUT, "_next/static")).map((f) => relative(OUT, f));
const precache = ["", "offline-game/", "offline-publisher/", "publishers/", "manifest.webmanifest", "icon-192.png", "icon-512.png", ...assets];

// Hashed asset names change whenever code or data does, so they make a good version.
const version = createHash("sha1").update(precache.join("\n")).digest("hex").slice(0, 10);

const sw = readFileSync(new URL("sw.js", import.meta.url), "utf8")
  .replace('"__VERSION__"', JSON.stringify(version))
  .replace("__PRECACHE__", JSON.stringify(precache));
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js ${version}: ${precache.length} files precached`);

// Google names the domain that handles sign-in ("Sign in to continue to …"). Serving Firebase's helper
// from our own domain makes that spiel.kafagoz.com instead of <project>.firebaseapp.com, and keeps
// sign-in working in browsers that block cross-site storage. Firebase supports self-hosting it:
// https://firebase.google.com/docs/auth/web/redirect-best-practices (option 4). The extensionless
// pages are saved as .html, which static hosts serve for /__/auth/handler and /__/auth/iframe.
const config = (() => {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? "");
  } catch {
    return undefined;
  }
})();
if (config?.projectId) {
  const origin = `https://${config.projectId}.firebaseapp.com/__/auth/`;
  const dir = join(OUT, "__/auth");
  mkdirSync(dir, { recursive: true });
  for (const [from, to] of [
    ["handler", "handler.html"],
    ["handler.js", "handler.js"],
    ["experiments.js", "experiments.js"],
    ["iframe", "iframe.html"],
    ["iframe.js", "iframe.js"],
  ]) {
    const res = await fetch(origin + from);
    if (!res.ok) throw new Error(`${origin}${from}: ${res.status}`);
    writeFileSync(join(dir, to), Buffer.from(await res.arrayBuffer()));
  }
  console.log(`firebase auth helper copied from ${origin}`);
}
