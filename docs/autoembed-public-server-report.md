# AutoEmbed public server inspection

## Scope

This report records provider URL templates that appeared as plain-text references in the JavaScript delivered by AutoEmbed’s public movie watch page. It does not claim that every provider is available, reliable, licensed, or embeddable, and it does not execute those third-party streams.

## Publicly exposed URL references

| Provider/domain reference | Movie pattern | TV pattern | Status in SideQuests |
|---|---|---|---|
| VidCore | `https://vidcore.net/movie/{id}` | `https://vidcore.net/tv/{id}/...` | Configured as Server 5/default |
| VidFast | `https://vidfast.vc/movie/{id}` | `https://vidfast.vc/tv/{id}/...` | Configured as Server 6 |
| VidRock | `https://vidrock.net/embed/movie/{id}` | `https://vidrock.net/embed/tv/{id}/...` | Configured as Server 7 |
| VidLink | `https://vidlink.pro/movie/{id}` | `https://vidlink.pro/tv/{id}/...` | Configured as Server 1 |
| PrimeSrc | `https://primesrc.me/embed/movie?imdb={id}` | `https://primesrc.me/embed/tv?tmdb={id}/...` | Configured as PrimeSrc |
| 2Embed | `https://2embed.stream/embed/movie/{id}` | `https://www.2embed.stream/embed/tv/...` | Not configured |
| Nxsha | `https://nxsha.space/embed/movie/{id}` | `https://nxsha.space/embed/tv/...` | Not configured |
| Peachify | `https://peachify.top/embed/movie/{id}` | `https://peachify.top/embed/tv/...` | Not configured |
| VidPlus | `https://player.vidplus.pro/embed/movie/{id}` | `https://player.vidplus.pro/embed/tv/...` | Not configured |
| Videoasy | `https://player.videasy.to/movie/{id}` | `https://player.videasy.to/tv/...` | Not configured |
| VidNest | `https://vidnest.fun/movie/{id}` | `https://vidnest.fun/tv/...` | Not configured |
| VidSuper | `https://vidsuper.net/movie/{id}` | `https://vidsuper.net/tv/...` | Not configured |
| VidKing | `https://www.vidking.net/embed/movie/{id}` | `https://www.vidking.net/embed/tv/...` | Not configured |
| NontonGo | `https://www.NontonGo.win/embed/movie/{id}` | `https://www.NontonGo.win/embed/tv/...` | Not configured |
| Flicky | `https://flicky.host/embed/movie/?id={id}` | `https://flicky.host/embed/tv/?id=...` | Not configured |
| Freembed | `https://frembed.hair/api/film.php?id={id}` | `https://frembed.hair/api/serie.php?id=...` | Not configured |
| NHDApi | `https://nhdapi.com/embed/movie/{id}` | `https://nhdapi.com/embed/tv/...` | Not configured |
| RiverStream | `https://www.rivestream.app/embed?type=movie&id={id}` | `https://www.rivestream.app/embed?type=tv&id=...` | Not configured |
| Rozgarlelo/Modiplay | `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id={id}` | `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=...` | Not configured |
| YTHD | `https://ythd.org/embed/{id}` | Not clearly exposed | Not configured |

## Important finding

The exact labels in the supplied screenshot—Max, Vidpro, V2, Premium, 4K, Nxsha, Super, Vidcore, Rock, PrimeSrc, 2Embed, Cinemaos, Prime, Netflix, Hotstar, Vidnest, and Tongo—are not all represented as independent documented endpoints. Several are likely internal labels for provider-managed routes, quality modes, or alternate hosts. AutoEmbed’s own server choices are controlled by its player page rather than exposed as a stable public server-list API.

SideQuests therefore uses the safe automatic model: the player fetches `/api/player-sources` when opened, receives only providers with explicit URL builders in the SideQuests registry, and falls back to the local registry if the API is unavailable. It does not scrape private runtime state, guess hidden routes, or present non-working labels as selectable servers.

## Verification

The AutoEmbed public movie page loaded successfully over HTTPS, and its delivered watch-page bundle contained the domain references above. A direct attempt to hydrate the watch page in the sandbox browser did not expose a stable server-list interaction or a public server-discovery endpoint. The SideQuests source list was verified through its own `GET /api/player-sources` endpoint and the provider picker preview.
