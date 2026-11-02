# AniDB Public Catalog Findings

Source inspected: https://anidb.app/browse?q=one%20piece

The browser-accessible AniDB browse page exposes public catalog search, filters for type/status/season/year/genre/sort, and results such as One Piece with AniDB titles, media type, score, and links. The page also exposes public browse routes for airing schedule, popular, latest updates, TV series, movies, OVA, ONA, specials, genres, A–Z, themes, demographics, and studios.

The ani-cli archive references these endpoints:

- `https://anidb.app/browse?q={query}`
- `https://anidb.app/anime/{slug}`
- `https://anidb.app/api/frontend/anime/{id}/episodes`
- `https://anidb.app/api/frontend/episode/{episodeId}/languages`

Direct server-side requests from the sandbox to these AniDB paths returned Cloudflare challenge HTML, while the browser could render the public browse page. The integration should therefore prefer browser-safe public metadata access and avoid bypassing Cloudflare or extracting protected provider streams. The current SideQuests embedded player providers remain separate.

## Detail-page observation

Browser inspection of `https://anidb.app/anime/one-piece-3880` showed a public `Watch Now` anchor to `#player`, English/Japanese audio buttons, an episode input and episode buttons, and 1,175 listed episodes. The page rendered a loading stream player in the browser, but no stable iframe URL was exposed in the extracted content. The page links the One Piece record to MAL ID 21 and AniList ID 21, which can help map AniDB catalog records to existing SideQuests anime details.
