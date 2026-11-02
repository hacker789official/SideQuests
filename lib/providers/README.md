# SideQuests Provider Architecture

A small, normalized abstraction so SideQuests can eventually support Movies, TV
Shows, Anime, Manga, and Music from different backends without every
component needing to know which backend it's talking to.

This is intentionally minimal: a shared `MediaProvider` interface
(`types.ts`) and an in-memory registry (`registry.ts`). No plugin runtime,
no dependency injection, no dynamic loading.

## What exists today

- `tmdb-provider.ts` — wraps the existing `@/tmdb/api` client for
  `movie` and `tv`. It normalizes TMDB's shapes into the shared types and
  adds one legitimate capability the app did not expose before:
  `getAvailability`, which surfaces TMDB's official watch-provider data
  (e.g. "streaming on Netflix", with a link to the title on that
  service). It does **not** produce a playable stream — that remains the job of the local VidLink player
  (`components/media-watch-dialog.tsx`).

This layer is additive. Nothing in the existing app currently imports
from `lib/providers` — pages continue to call `@/tmdb/api` directly, and
the watch dialog uses `lib/vidlink.ts` to build deterministic movie
  and TV player URLs. `lib/providers` is scaffolding for the next features
  (anime/manga/music), not a replacement for the current TMDB browsing API.

## Adding a new provider

1. Create `lib/providers/<name>-provider.ts` exporting an object that
   satisfies `MediaProvider` from `types.ts`. Implement only the
   capabilities the backend actually and legitimately supports:

   ```ts
   import { MediaProvider } from "./types"

   export const someAnimeProvider: MediaProvider = {
     id: "some-anime-api",
     name: "Some Anime API",
     supports: ["anime"],
     search: async (query, kind) => {
       /* call the real API, map results to SearchResultItem[] */
     },
     getDetails: async (id, kind) => {
       /* map to MediaDetails */
     },
     getSeasons: async (id) => {
       /* map to Season[] / Episode[] for episodic anime */
     },
   }
   ```

2. Register it in `lib/providers/index.ts`:

   ```ts
   import { someAnimeProvider } from "./some-anime-provider"
   registerProvider(someAnimeProvider)
   ```

3. Consume it from server components/actions via `getProvidersFor("anime")`
   or `getProvider("some-anime-api")`.

## Capability guide by media kind

| Kind    | Typical capabilities                                    |
| ------- | --------------------------------------------------------- |
| movie   | `search`, `getDetails`, `getArtwork`, `getAvailability`   |
| tv      | + `getSeasons` (episodes nested under seasons)            |
| anime   | same shape as `tv` — reuse `getSeasons`/`Episode`          |
| manga   | `search`, `getDetails`, `getArtwork`, `getChapters`        |
| music   | `search`, `getDetails` (artist/album), `getDiscography`    |

## Ground rules

- `getAvailability` must only return **legitimate** legal watch/listen
  sources (subscription/rental/purchase/free-with-ads services and a
  link to the title on that service) — never a scraped, proxied, or
  otherwise unauthorized playable media URL.
- Don't add a provider for a source you haven't verified is authorized
  to serve that content (no reverse-engineered/anti-protection scraping
  — see `movie-scraper` in project history for why that's out of scope).
- Don't add placeholder/fake providers "for later." Only register
  providers that are actually implemented and working.
- Use `externalIds` on `MediaDetails` (e.g. `{ tmdb: "603" }`) so a
  future feature can map between a provider's own ID scheme and TMDB's,
  rather than assuming every provider shares TMDB's numeric IDs.
