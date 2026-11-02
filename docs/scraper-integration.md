# Scraper integration review

## What was reviewed

The Drive folder contained the current SideQuests source archive, `Anime_Scraper-master.zip`, and `WCO_wrapper-main.zip`. The anime archive contains an old Flask/Python scraper with HTML selectors for third-party anime-streaming sites. Its server expects an undefined `BASE_URL`, uses obsolete/deprecated endpoint assumptions, has incomplete site modules, and is marked unmaintained in its README. The WCO archive is an independent Android Java application built around JSoup and the WCO site; it is not a scraper library or service that can be linked into this Next.js/TypeScript app.

Both archives are retained under `reference-projects/` for provenance and future review. The Drive originals were not changed.

## Integration decision

The archived implementations scrape or wrap unofficial third-party streaming sites and are not reliable, authorized metadata APIs. Porting their stream extraction, page scraping, or embedded-player behavior would cross the app's existing provider boundary and add brittle third-party dependencies. Therefore, their scraping and playback code has deliberately not been copied into SideQuests or enabled at runtime.

The existing SideQuests integration remains the appropriate supported path:

- AniList supplies anime and manga discovery/catalog metadata through the current app.
- `components/anime-watch-player.tsx` and `lib/player-sources.ts` own the existing explicitly configured anime embeds.
- `lib/providers/` documents a normalized provider architecture; providers must only expose legitimate capabilities and must not return scraped playable-media URLs.
- `docs/anime-source-findings.md` records the same no-direct-stream-extraction decision for an earlier source review.

## Safe extension points

If a future integration is authorized and stable, implement a server-only metadata adapter under `lib/providers/` or a narrowly scoped route under `app/api/`. It should return catalog metadata (title, artwork, identifiers, season/episode labels), use request timeouts and caching, validate and normalize responses, and never extract or proxy media URLs. Add it only after confirming a documented, permitted upstream interface and tests with representative responses. Keep playback separate and limited to providers whose use is authorized.

## Verification notes

No runtime dependencies or player behavior changed in this review. Verify the project with `npm run typecheck` and `npm run build` after any future application-code integration. The retained ZIP files are source references, not executable dependencies.
