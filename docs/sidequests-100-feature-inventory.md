# SideQuests: 100-feature inventory

**Status note:** This is an honest implementation inventory, not a claim that 100 new features have already been built. Items marked **Implemented** are present in the current source, including the MangaYi metadata/search rail, Random SideQuest, Daily Featured Quest, curated collections, local user collections with share links, watched/unwatched episode filters, anime audio preference persistence, HD source preference persistence, player shortcuts, picture-in-picture support, and accessibility preferences. MangaYi reader links open on the original source, while SideQuests does not mirror chapter images. Items marked **Planned** remain future roadmap work.

| # | Feature or idea | Status |
|---:|---|---|
| 1 | MangaYi public-catalog metadata extraction with attribution and rate limiting | Implemented (metadata only) |
| 2 | MangaDex manga search | Implemented |
| 3 | MangaDex manga detail pages | Implemented |
| 4 | MangaDex chapter lists | Implemented |
| 5 | In-site MangaDex chapter reader | Implemented |
| 6 | MangaDex image proxy for CORS-safe reading | Implemented |
| 7 | Manga reading progress persistence | Implemented |
| 8 | Manga reading progress cloud sync hooks | Implemented |
| 9 | Anime discovery pages | Implemented |
| 10 | Anime trending list | Implemented |
| 11 | Anime popular list | Implemented |
| 12 | Anime top-rated list | Implemented |
| 13 | Anime detail pages | Implemented |
| 14 | Anime episode player | Implemented |
| 15 | Anime-specific server registry | Implemented |
| 16 | Gogoanime anime playback source | Implemented |
| 17 | VidLink anime playback source | Implemented |
| 18 | Anime fallback source handling | Implemented |
| 19 | Movie discovery pages | Implemented |
| 20 | TV discovery pages | Implemented |
| 21 | Trending movie and TV lists | Implemented |
| 22 | Popular and top-rated movie lists | Implemented |
| 23 | Now-playing movie list | Implemented |
| 24 | Movie detail pages | Implemented |
| 25 | TV detail pages | Implemented |
| 26 | Movie cast, images, videos, recommendations, and similar tabs | Implemented |
| 27 | TV cast, images, videos, recommendations, similar, and seasons tabs | Implemented |
| 28 | Movie and TV multi-server player | Implemented |
| 29 | Compact dropdown server selector | Implemented |
| 30 | Server 5 as primary provider | Implemented |
| 31 | VidLink movie URL builder | Implemented |
| 32 | VidLink TV season/episode URL builder | Implemented |
| 33 | Dynamic player-source API | Implemented |
| 34 | Player failure fallback UI | Implemented |
| 35 | Episode and season selection | Implemented |
| 36 | Search across the catalog | Implemented |
| 37 | Genre filtering | Implemented |
| 38 | Release-date filtering | Implemented |
| 39 | Language filtering | Implemented |
| 40 | Provider filtering | Implemented |
| 41 | Vote-average and vote-count filtering | Implemented |
| 42 | Local watch progress tracking | Implemented |
| 43 | Unified Continue Watching section | Implemented |
| 44 | Watchlist storage and cards | Implemented |
| 45 | Watchlist removal and deleted-item tracking | Implemented |
| 46 | First-party signup with email, display name, username, and four-digit PIN | Implemented |
| 47 | First-party username/PIN login | Implemented |
| 48 | Session cookie and logout flow | Implemented |
| 49 | Cloud watch-data synchronization | Implemented |
| 50 | Automatic periodic sync coordinator | Implemented |
| 51 | Mobile-first responsive layout | Implemented |
| 52 | Mobile bottom navigation | Implemented |
| 53 | PWA manifest and install metadata | Implemented |
| 54 | PWA icon and splash assets | Implemented |
| 55 | Android/Meta Quest Capacitor packaging documentation | Implemented |
| 56 | Third-party player pop-up/ad-blocker notice | Implemented |
| 57 | SideQuests disclaimer page | Implemented |
| 58 | Contact and credits page | Implemented |
| 59 | Ocean cyan/blue visual theme | Implemented (fixed default) |
| 60 | Glassmorphism visual theme | Removed from active app |
| 61 | Neumorphism visual theme | Removed from active app |
| 62 | Aurora visual theme | Removed from active app |
| 63 | Office visual theme | Removed from active app |
| 64 | Paper editorial visual theme | Removed from active app |
| 65 | Persistent theme switching with next-themes | Removed from active app |
| 66 | MangaYi metadata adapter with schema normalization | Implemented |
| 67 | MangaYi latest-release rail | Implemented |
| 68 | MangaYi title search fallback | Implemented |
| 69 | MangaYi source badges and attribution links | Implemented |
| 70 | Unified cross-media search results | Implemented (TMDB + MangaDex + MangaYi) |
| 71 | Personal recommendation engine | Implemented (local history + TMDB recommendations) |
| 72 | Mood-based discovery filters | Implemented |
| 73 | Random SideQuest button | Implemented |
| 74 | Daily featured quest | Implemented |
| 75 | Curated staff collections | Implemented |
| 76 | User-created collections | Implemented (local) |
| 77 | Shareable collection links | Implemented (local) |
| 78 | Spoiler-safe social reactions | Planned |
| 79 | Public profile pages | Planned |
| 80 | Friend activity feed | Planned |
| 81 | Collaborative watchlists | Planned |
| 82 | Continue Watching resume-time display | Implemented |
| 83 | Watched/unwatched episode filters | Implemented (local) |
| 84 | Skip-intro and skip-outro markers | Planned |
| 85 | Subtitle language preferences | Implemented (anime sub/dub preference) |
| 86 | Audio-language preferences | Implemented (anime sub/dub preference) |
| 87 | Playback quality preference | Implemented (HD source preference) |
| 88 | Playback keyboard shortcuts | Implemented |
| 89 | Picture-in-picture controls | Implemented |
| 90 | Fullscreen guidance for Quest | Implemented |
| 91 | Cross-device QR pairing | Planned |
| 92 | Offline-free bandwidth saver mode | Implemented (tap-to-load embeds and conservative preload) |
| 93 | Accessible high-contrast mode | Implemented |
| 94 | Reduced-motion mode | Implemented |
| 95 | Font-size and reading-width controls | Implemented |
| 96 | Manga panel reading mode | Implemented |
| 97 | Chapter release notifications | Implemented (online Release Radar with browser permission) |
| 98 | Saved search alerts | Implemented (local saved queries) |
| 99 | Provider health dashboard | Implemented (public diagnostics) |
| 100 | Automated provider availability monitoring | Planned |

## Final batch: features 101–120
| # | Feature or idea | Status |
|---:|---|---|
| 101 | Unified library dashboard | Implemented |
| 102 | Library title totals | Implemented |
| 103 | Movie versus TV counters | Implemented |
| 104 | Rated-title counter | Implemented |
| 105 | Last-added date summary | Implemented |
| 106 | Library title search | Implemented |
| 107 | Media-type filter chips | Implemented |
| 108 | Recently watched sorting | Implemented |
| 109 | Recently added sorting | Implemented |
| 110 | Alphabetical sorting | Implemented |
| 111 | Top-rated sorting | Implemented |
| 112 | Keyboard slash-to-search shortcut | Implemented |
| 113 | Compact library card preference | Implemented |
| 114 | JSON library export backup | Implemented |
| 115 | JSON library import restore | Implemented |
| 116 | Duplicate watchlist cleanup | Implemented |
| 117 | One-tap Continue Watching cleanup | Implemented |
| 118 | Local-first privacy status indicator | Implemented |
| 119 | Accessible live status feedback for library actions | Implemented |
| 120 | Fixed Ocean visual palette with theme selector removed | Implemented |

**Theme change:** alternate theme switching has been removed from the active app shell and settings. SideQuests now uses one fixed Ocean/cyan presentation only.

## Quest Utilities batch: features 121–140
| # | Feature or idea | Status |
|---:|---|---|
| 121 | Weekly saved-title quest goal | Implemented |
| 122 | Visual goal progress meter | Implemented |
| 123 | Copyable library summary | Implemented |
| 124 | Native share-sheet library summary | Implemented with clipboard fallback |
| 125 | One-tap clear library search | Implemented |
| 126 | One-tap reset library filters and sort | Implemented |
| 127 | Local focus-session timer | Implemented |
| 128 | Spoiler-label visibility preference | Implemented (local) |
| 129 | Reduced-motion utility preference | Implemented (local) |
| 130 | Remember-library-tab preference | Implemented (local) |
| 131 | Library-stat visibility preference | Implemented (local) |
| 132 | Reset utility preferences | Implemented |
| 133 | Accessible live feedback for utility actions | Implemented |
| 134 | Keyboard-friendly utility controls | Implemented |
| 135 | Range-slider goal adjustment | Implemented |
| 136 | Session elapsed-time display | Implemented |
| 137 | Browser-local preference persistence | Implemented |
| 138 | No-background-tracking disclosure | Implemented |
| 139 | No-offline-downloads disclosure | Implemented |
| 140 | Mobile-responsive Quest Utilities panel | Implemented |

**Current roadmap count: 140 tracked features.** The new utilities remain local-first and do not add offline downloads or background tracking.

## MangaYi test summary

A passive request to [MangaYi](https://mangayi.com/) returned HTTP 200 with the title “Mangayi - Read Manga & Manhwa Online for Free.” The static HTML exposed Genres and Authors navigation but no ordinary series or chapter anchors. The catalog appears to be hydrated by the site’s Nuxt client or runtime data. The public [robots.txt](https://mangayi.com/robots.txt) contains an empty `Disallow:` directive and a sitemap reference, but that does not grant permission to republish copyrighted chapter images.

The current safe implementation is a metadata-only MangaYi proxy with latest-release and title-search discovery, source attribution, rate limiting, and links back to the original reader. MangaDex remains the in-site reader. No MangaYi chapter images are mirrored by SideQuests.

## References

[1]: https://mangayi.com/ "MangaYi public homepage"
[2]: https://mangayi.com/robots.txt "MangaYi robots.txt"
