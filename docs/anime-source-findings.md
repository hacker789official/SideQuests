# AnimeScraper and ani-cli Findings

## AnimeScraper

The public `AnimeScraper` package is a GPL-3.0 Python library that scrapes MyAnimeList metadata. It supports anime and character search, detailed anime records, asynchronous requests, caching, and an optional FastAPI server. It does not provide video playback servers, iframe routes, episode stream URLs, or subtitles.

Because SideQuests already uses AniList for anime discovery and metadata, AnimeScraper would be a metadata fallback rather than a playback-server integration. Adding it to the Next.js deployment would also require a separate Python runtime or a third-party service, which is not necessary for the current anime player.

## ani-cli

The supplied ani-cli 5.0.2 shell script uses `https://anidb.app` for search, anime detail pages, episode lists, language selection, and episode-language API requests. Its relevant endpoints are:

- `https://anidb.app/browse?q={query}`
- `https://anidb.app/anime/{slug}`
- `https://anidb.app/api/frontend/anime/{id}/episodes`
- `https://anidb.app/api/frontend/episode/{episodeId}/languages`

The script then extracts an `embed_url`, fetches the embed page, extracts an HLS `.m3u8` master URL, chooses a quality, and passes the direct stream to a local player. This is a command-line stream-extraction workflow, not a stable browser iframe server contract.

## SideQuests decision

No new ani-cli playback server was added. Porting the direct HLS extraction would create a brittle provider scraper, expose changing stream URLs, and potentially bypass provider access controls. SideQuests keeps its verified embedded anime sources—Gogoanime/MegaVid and VidLink Anime—and uses AniList for catalog metadata. AnimeScraper can be considered later as a metadata-only fallback if a Python service is intentionally added.
