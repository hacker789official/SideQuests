AutoEmbed inspection note

The public AutoEmbed landing page at https://watch-v2.autoembed.app/ exposed a title search field, a GO action, and a START WATCHING link, but the extraction did not provide a documented movie/TV route template or public list of the named services shown in the reference image. The PrimeSrc public documentation exposes a TMDB embed route and a serverOrder/whitelistServers parameter. SideQuests therefore keeps provider URLs as explicit builders and avoids pretending the image labels are independently addressable endpoints until the actual templates are supplied or documented.

Additional public route finding

The public AutoEmbed search flow at https://watch-v2.autoembed.app/search?q=Inception linked the movie result to https://watch-v2.autoembed.app/movie/27205. Its public landing copy says users can switch servers in one click without restarting playback, but the page extraction still did not expose the internal server labels or a documented direct embed template. The screenshot’s named cards should therefore be treated as provider-managed labels unless their actual URL/API templates are supplied.

AutoEmbed TV route finding

The public route https://watch-v2.autoembed.app/tv/1399 loads Game of Thrones and exposes an in-page Season 1 selector with episode cards. A direct episode href was not exposed by the rendered anchor query, so SideQuests should use the base AutoEmbed TV route and let AutoEmbed handle its own season/episode selection, rather than guessing a direct path.

Implementation audit

SideQuests now renders an AutoEmbed-style responsive card grid with 8 explicitly configured provider sources: Server 1, Server 2, Server 3, Server 4, Server 5 · VidCore, Server 6 · VidFast, Server 7 · VidRock, and PrimeSrc. Server 5 · VidCore remains the default. Selecting a card updates the active source, persists it in localStorage, and rebuilds the in-player URL.

A direct AutoEmbed watch route at https://watch-v2.autoembed.app/movie/27205/watch did not expose player content in the public page extraction, so the external AutoEmbed provider was not shipped as a clickable source. This avoids a broken card and avoids fabricating server endpoint templates from the reference screenshot.

Dynamic discovery audit

A passive browser check of https://watch-v2.autoembed.app/movie/27205 did not hydrate in the sandbox browser and did not expose a server-list endpoint. The public AutoEmbed search and TV/movie pages expose navigation and provider-managed UI, but not a documented API for enumerating the internal server labels. SideQuests should not scrape private client bundles or invent server URLs. Dynamic discovery can be implemented for providers that expose documented metadata APIs, with the configured provider list as a safe fallback.

Public-player inspection checkpoint

AutoEmbed's public movie detail page at https://watch-v2.autoembed.app/movie/27205 visibly exposes a Watch tab, but the sandbox browser hydrated the page to about:blank before the tab could be opened. A stale DOM click was rejected and a refreshed view showed no interactive elements. This means the server list cannot be treated as reliably enumerable from this session without an exposed public API or a user-provided capture of the in-player network payload.
