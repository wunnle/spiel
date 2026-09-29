// After `next build`: writes out/sw.js from scripts/sw.js with this build's precache list.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  );
}

// Paths relative to the service worker's scope, so they work under any base path.
const assets = walk(join(OUT, "_next/static")).map((f) => relative(OUT, f));
const precache = ["", "offline-game/", "manifest.webmanifest", "icon-192.png", "icon-512.png", ...assets];

// Hashed asset names change whenever code or data does, so they make a good version.
const version = createHash("sha1").update(precache.join("\n")).digest("hex").slice(0, 10);

const sw = readFileSync(new URL("sw.js", import.meta.url), "utf8")
  .replace('"__VERSION__"', JSON.stringify(version))
  .replace("__PRECACHE__", JSON.stringify(precache));
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js ${version}: ${precache.length} files precached`);
