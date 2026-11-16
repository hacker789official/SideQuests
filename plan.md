# SideQuests Neon Arcade product overhaul

## Goal and scope

“Make SideQuests the biggest competitor to Netflix” is the product ambition. “Not just looks but everything should change” means this is an end-to-end overhaul of the existing site, not a homepage reskin. The redesign should make SideQuests a more distinctive and easier-to-use destination for movies, TV shows, anime, and cartoons. It must keep the SideQuests brand original; do not copy Netflix branding, wording, or exact layouts.

This implementation covers the existing customer-facing journey: landing/home, browse and category pages, search, movie/TV/anime/cartoon details, seasons and episodes, watch/player entry, library/watch history/watchlist, account sync/settings, and mobile navigation. Improve the information architecture, clarity of actions, responsiveness, and user journeys while preserving working routes and integrations. Do not invent a licensed catalog, new streaming provider, subscription payment system, user data store, or other external capability; new integrations require the user's provider, authorization, and rights details.

## Design options

1. **Deep-Sea Editorial Cinema — 0.066.** Art-led cinematic scale with an ink-blue base, restrained electric cyan, and clear editorial hierarchy.
2. **Neon Arcade Discovery — 0.068 (selected).** High-energy cyan discovery cues, bold labels, and playful arcade-like title shelves without copying another service’s visual identity.
3. **Minimal Glass Gallery — 0.048.** Quiet dark-blue surfaces, fine cyan outlines, and generous gallery-like spacing.

## Chosen design system: Neon Arcade Discovery

- **Design movement:** Modern arcade-inspired streaming discovery, combining cinematic artwork with electric-cyan interface energy.
- **Core principles:** Let title artwork lead; make every major destination and action easy to find; use playful “quest” cues as navigation/discovery signals rather than fake rewards; preserve readability and accessibility.
- **Color philosophy:** Deep ink-blue keeps artwork legible. Bright cyan signals active navigation, primary actions, and focus. Cool blue-gray surfaces create depth; avoid red and avoid making every element glow.
- **Layout paradigm:** Replace the conventional full-screen carousel-and-rows opening with one quiet, art-led feature title, a direct play action, and four content portals. Keep browse, search, anime/manga, cartoon, and title-detail routes in one shared editorial system with compact route labels, strong typography, and understated cyan cues. The Library is a minimal two-destination space—Continue and My List—with sync tucked into one compact control.
- **Signature elements:** Cyan quest-marker labels; illuminated rails/card edges on active, hover, and focus states; compact arcade-style category chips whose labels reflect real content.
- **Interaction philosophy:** Keep controls explicit and touch-friendly. Provide keyboard-visible focus. Search, filtering, selection, watchlist/library, episode selection, and player launch should read as coherent flows. Essential actions must never depend on hover.
- **Animation:** Restrained 160–220 ms transitions for focus, card lift, and content fades. Honor reduced-motion preferences; no perpetual flashing or distracting pulse effects.
- **Typography system:** Reuse the project’s Geist font. Use assertive display titles, compact uppercase category labels, and comfortable body text; do not add font dependencies.
- **Brand essence:** “Choose your next side quest”—for viewers who want movies, series, anime, and cartoons in one lively discovery-first place. Personality: adventurous, cinematic, welcoming.
- **Brand voice:** Short, confident headlines and direct actions. Example lines: “Pick your next play.” and “Find a new world to get lost in.”
- **Wordmark & logo:** Keep the SideQuests name with a simple cyan orbit/quest-marker glyph built from existing icon primitives; do not use Netflix marks or lookalike wordmarks.
- **Signature brand color:** Electric cyan, approximately `#13D5E6`, supported by deep ink navy and cool blue-gray.

## Implementation approach and project structure

- `app/(home)/page.tsx` remains the data-driven landing route. Retain the existing TMDB movie/TV requests while replacing the old large hero/genre/rail-first structure with a split-canvas feature, direct movie/series/anime/cartoon portals, and clear continuation/discovery lanes.
- `app/(lists)` owns browse, search, collections, trending, cartoons, movies, and TV pages. Refresh shared browse/filter/card patterns so users can move between content types and categories without losing existing route semantics or results.
- `app/(detail)` owns movie and TV details, including the existing season/episode path and player entry. Improve the detail-to-watch journey and the episode navigation presentation while preserving existing data and URLs.
- `app/(anime)` owns anime/manga discovery and detail routes. Apply the shared experience so anime remains a first-class destination, not a visually separate afterthought.
- `app/library/page.tsx` and related wrappers/components own watch history/watchlist/sync behavior. Keep only Continue Watching, My List, and one compact account-sync action; remove the collection builder, release alerts, quest utilities, and filter/sort/search toolkit from this screen. Preserve local data, removal actions, and sync behavior.
- Account sync must report the actual cloud result: show success only after the server confirms the merge/write, and make failure clear that local data remains available. Anime playback progress must not be inferred from time spent on a page; only persist progress reported by the configured player source.
- `components/site-header.tsx`, `components/site-nav.tsx`, `components/site-menu.tsx`, and `components/mobile-bottom-nav.tsx` own desktop/mobile navigation. Give the global shell a clear cyan/ink identity. Preserve search, settings, sync, and all existing destinations while making the information architecture clearer.
- `components/movie-hero.tsx` renders one featured title without rotating controls or duplicate information; media cards, episode filters/cards, watch dialog/player, and shared sections own reusable interactions. Improve focus/hover/touch behavior and consistency without removing working controls.
- `styles/globals.css` carries design tokens, surfaces, and motion preferences. Shared tokens should update list/detail/anime/cartoon views cohesively.
- Use the selected Unsplash cyan abstract light image only as a subtle decorative layer behind one featured/brand surface if it fits. Keep actual title images from existing TMDB data. The source page identifies Akif Waseem’s image and states it is free to use under the Unsplash License; the source URL is recorded in the task workspace note.
- No new package or backend is assumed. Preserve existing API routes and environment handling. Do not introduce any new scraper-based or unlicensed playback source as part of this redesign.

## Delivery approach

Implement the full user-facing overhaul, then run the project’s TypeScript check and production build where the configured TMDB environment permits. Review affected route and interaction paths. Push the source commit to the user-authorized `hacker789official/SideQuests` GitHub repository and deploy directly to the existing SideQuests Vercel project. Leave Vercel’s Git integration disconnected, as previously requested.
