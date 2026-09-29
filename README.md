# Essen ’26 Novelties

An unofficial guide to every new game at SPIEL Essen, 22–25 October 2026: booths with hall-plan links,
BoardGameGeek links, "interested / want to buy / bought" marks with a running shopping-list total, a QR
hand-off of your list to the official SPIEL app — and it works offline in the halls.

## Data

`npm run update` (`scripts/update.mjs`) pulls:

- **The official novelties list** from the Eyeled backend that both the SPIEL app and
  [spiel-essen.de/en/the-spiel/novelties](https://www.spiel-essen.de/en/the-spiel/novelties) read
  (`maps.eyeled-services.de/{en,de}/spiel26/products` and `/exhibitors`). Undocumented; be gentle.
- **BGG's [SPIEL ’26 preview](https://boardgamegeek.com/geekpreview/93/spiel-essen-2026)**
  (`api.geekdo.com/api/geekpreviewitems?previewid=93`), matched by name and booth, for direct BGG links,
  the BGG score (shown from 5 ratings up; the "BGG score" sort weights it by vote count), thumbs-up
  counts, the price at the fair, and whether a game is only demoed. Games without a confident match link
  to a BGG search instead.
- **Box art**, resized to webp in `public/covers/{sm,lg}/` (gitignored; ~85 MB).

It writes `src/data/catalog.json` (list data, shipped to the browser) and `src/data/details.json` (full
descriptions, only used to prerender game pages). Both are committed as a snapshot so the site builds
without network access; CI refreshes them before every build.

`src/data/picks.ts` is the hand-picked shortlist ("Buzz"), merged onto the official data by title.

## Offline

`scripts/sw.js` is the service worker; `scripts/postbuild.mjs` stamps it with the build's precache list
into `out/sw.js`.

- The list page and all JS (including the catalogue) are precached on first visit.
- Game pages are cached as you open them.
- "Save for offline" caches every list-size cover (~22 MB).
- A game page never opened online is served by `/offline-game/`, which rebuilds it from the list data
  (everything but the long description).

## Sign-in and synced marks

Marks live on the device (localStorage) and work signed out and offline. Signing in with Google mirrors
them to Firestore (`users/{uid}/marks/{game id}`) so they follow you between devices; `src/lib/sync.ts`
merges per game, newest change wins. Without the Firebase config the sign-in button simply doesn't
appear.

One-time setup, in the [Firebase console](https://console.firebase.google.com):

1. Add a project and register a **web app**.
2. **Authentication → Sign-in method**: enable **Google**. **Authentication → Settings → Authorized
   domains**: add `spiel.kafagoz.com`.
3. **Firestore Database → Create database** (production mode, an EU location). **Rules**: paste
   `firestore.rules` and publish.
4. **Project settings → Your apps**: copy the config object and save it as JSON in this repo's
   **Settings → Secrets and variables → Actions → Variables** as `FIREBASE_CONFIG`, e.g.
   `{"apiKey":"…","authDomain":"….firebaseapp.com","projectId":"…","appId":"…"}`. Re-run the deploy.

For local development put the same JSON in `.env.local` as `NEXT_PUBLIC_FIREBASE_CONFIG`.

## Develop

```sh
npm install
npm run update -- --skip-covers   # fresh data; add covers with a plain `npm run update`
npm run dev
```

The service worker only registers in production builds: `npm run build && npm run serve`.

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` and every
morning at 06:00 Essen time. Pages must be set to deploy from **GitHub Actions** (Settings → Pages).
The base path and site URL come from the Pages configuration, so a custom domain needs no code change.
