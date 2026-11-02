# Provider grid verification

The final SideQuests production preview renders an AutoEmbed-style responsive card grid in the movie stream dialog. The grid shows Server 1, Server 2, Server 3, Server 4, Server 5 · VidCore, Server 6 · VidFast, Server 7 · VidRock, and PrimeSrc with country flags, quality labels, and a check indicator on the active card.

Server 5 · VidCore remains the default. Selecting a card updates the active source and rebuilds the iframe URL without navigating away from SideQuests. The first-time player guide now says to tap a provider card rather than referring to the removed dropdown.

The visual audit used the final rebuilt preview at https://3033-i49wjgpjcw9szlykmrsdy-550d75ad.us4.manus.computer/movie/1676318. Typecheck and production build both passed with all 29 routes generated.

The reference image’s names such as Max, Vidpro, V2, Premium, 4K, Nxsha, Rock, 2Embed, Cinemaos, Netflix, Hotstar, Vidnest, and Tongo were not added as independent endpoints because the public AutoEmbed pages did not expose documented URL/API templates for those provider-managed labels. Adding them as clickable cards without actual templates would create broken or misleading providers.

## Dynamic source API audit

The final build exposes `GET /api/player-sources`, which returns the normalized provider registry and is fetched when the player dialog opens. The client falls back to the local registry if the request fails. The live endpoint returned the configured provider records successfully, and the movie preview loaded the provider dialog without build or route errors.

The final live preview at https://3034-i49wjgpjcw9szlykmrsdy-550d75ad.us4.manus.computer/movie/1676318 opened the stream dialog and displayed the same 8 provider cards returned by `GET /api/player-sources`, with Server 5 · VidCore active. The guide text correctly describes tapping a provider card.

## Dropdown revert verification

The final preview at https://3035-i49wjgpjcw9szlykmrsdy-550d75ad.us4.manus.computer/movie/1676318 now shows a single compact dropdown selector labeled `Server 5 · VidCore · 4K` in the stream dialog. The Auto/Best-server and provider-card grid presentation has been removed. The dropdown is populated from the dynamic provider API and preserves in-player source swapping and the Server 5 default.
