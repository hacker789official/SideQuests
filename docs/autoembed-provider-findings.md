# AutoEmbed Provider Findings

Inspection date: 2026-08-24.

The public site `https://watch-v2.autoembed.app/` presents itself as a streaming catalog for movies, TV shows, anime, live TV, and sports. Its public search routes use TMDB-style paths such as `/movie/{tmdbId}` and `/tv/{tmdbId}`. The One Piece TV detail route inspected was `/tv/37854`, with a dedicated watch route at `/tv/37854/watch`.

The public watch page did not expose a playable iframe source or named third-party streaming domains in its server-rendered HTML. Instead, it rendered a provider-information/watch page with episode and season navigation. The loaded public route and chunk data exposed no verifiable `vidsrc`, `vidlink`, `2embed`, `multiembed`, `vidplay`, `megacloud`, or similar provider URL.

The public site does list resource/domain links to `https://autoembed.net` and `https://vidbox.website`, but those are site/resource links, not verified player endpoints. Candidate paths such as `https://watch-v2.autoembed.app/embed/movie/{id}` and `https://watch-v2.autoembed.app/embed/tv/{id}/{season}/{episode}` returned 404. Candidate `player.autoembed.cc` and `autoembed.cc` endpoints did not resolve during the check.

Conclusion: AutoEmbed’s actual playback providers appear to be selected dynamically or hidden behind runtime/API logic. It is not safe to add guessed URLs as SideQuests embedded servers. A provider endpoint or official API documentation is required before integration. The existing SideQuests anime servers remain the verified Gogoanime/MegaVid and VidLink Anime routes.
