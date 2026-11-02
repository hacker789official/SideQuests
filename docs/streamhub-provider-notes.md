# StreamHub Provider Integration

StreamHub's `src/data/providers.js` defines three movie/TV iframe providers:

| SideQuests entry | Provider URL | Media |
|---|---|---|
| Server 5 · VidCore | `https://vidcore.io/movie/{tmdbId}?autoPlay=true` and `https://vidcore.io/tv/{tmdbId}/{season}/{episode}?autoPlay=true` | Movies and TV |
| Server 6 · VidFast | `https://vidfast.vc/movie/{tmdbId}?autoPlay=true` and `https://vidfast.vc/tv/{tmdbId}/{season}/{episode}?autoPlay=true` | Movies and TV |
| Server 7 · VidRock | `https://vidrock.net/movie/{tmdbId}?autoplay=true` and `https://vidrock.net/tv/{tmdbId}/{season}/{episode}?autoplay=true` | Movies and TV |

The original StreamHub source listed VidCore at `vidcore.net`; a live request redirected that hostname to `vidcore.io`, so SideQuests uses the canonical redirected host.

The three providers were added to `lib/player-sources.ts` and are automatically rendered by the existing movie/TV server selector in `components/media-watch-dialog.tsx`. Anime remains isolated in its own anime-only selector and is not mixed with these TMDB-based providers.

Validation: all three sample movie endpoints returned HTTP 200 during the integration check. SideQuests typecheck and production build passed, with 29/29 routes generated. Existing Tailwind class-order and image optimization messages remain non-blocking warnings.
