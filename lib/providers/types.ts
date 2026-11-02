/**
 * SideQuests Provider Architecture — shared types
 * ------------------------------------------------------------------
 * This module defines a small, normalized contract that any content
 * provider (TMDB today; anime/manga/music sources later) can implement.
 *
 * Design goals:
 *  - Stay lightweight — a handful of interfaces, no DI container / plugin
 *    runtime / event bus. Just plain objects registered in a Map.
 *  - Every capability is optional on the provider. A movie/TV metadata
 *    provider doesn't need to implement `getChapters`, a manga provider
 *    doesn't need `getSeasons`, etc. Callers check `typeof fn === "function"`
 *    (or use the helper guards in registry.ts) before calling a capability.
 *  - Nothing here performs or wraps unauthorized stream extraction.
 *    `getAvailability` is explicitly scoped to *legitimate* "where can I
 *    legally watch/listen to this" info (e.g. TMDB's watch-provider data),
 *    never a raw playable video/audio URL scraped from a third-party site.
 *  - This layer does not replace the existing TMDB data flow or the
 *    existing player/server-switcher UI. It's an additive layer that
 *    future features can read from.
 */

export type MediaKind = "movie" | "tv" | "anime" | "manga" | "music"

/** A lightweight search hit. */
export interface SearchResultItem {
  /** Provider-scoped id (NOT necessarily a TMDB id — see externalIds on details). */
  id: string
  kind: MediaKind
  title: string
  year?: number
  posterUrl?: string
  overview?: string
}

/** Full metadata for a single title/artist/series. */
export interface MediaDetails extends SearchResultItem {
  backdropUrl?: string
  genres?: string[]
  rating?: number
  /**
   * Cross-references to the same title in other systems, e.g.
   * { tmdb: "603", imdb: "tt0133093" }. Used for ID mapping between
   * providers that key media differently (see mapping.ts).
   */
  externalIds?: Record<string, string>
}

export interface Episode {
  id: string
  number: number
  title?: string
  overview?: string
  stillUrl?: string
}

export interface Season {
  id: string
  number: number
  name?: string
  episodeCount?: number
  episodes?: Episode[]
}

export interface Chapter {
  id: string
  number: number
  title?: string
  releasedAt?: string
}

export interface Track {
  id: string
  title: string
  durationMs?: number
  trackNumber?: number
}

export interface Album {
  id: string
  title: string
  year?: number
  coverUrl?: string
  tracks?: Track[]
}

export interface Artist {
  id: string
  name: string
  imageUrl?: string
  albums?: Album[]
}

/**
 * A single legitimate place a title can be watched/listened to —
 * e.g. "Netflix (subscription)" with a link to the title on that
 * service. This is availability information, never a direct/embedded
 * media stream.
 */
export interface AvailabilitySource {
  name: string
  url?: string
  type: "sub" | "rent" | "buy" | "free"
  region?: string
  logoUrl?: string
}

export interface ArtworkSet {
  posters: string[]
  backdrops: string[]
}

/**
 * Contract a content provider can implement. Every method is optional —
 * implement only what the provider can legitimately support for the
 * media kinds it declares in `supports`.
 */
export interface MediaProvider {
  /** Stable machine id, e.g. "tmdb". */
  id: string
  /** Human-readable name for logs/UI, e.g. "TMDB". */
  name: string
  /** Which media kinds this provider can serve. */
  supports: MediaKind[]

  search?(query: string, kind: MediaKind): Promise<SearchResultItem[]>
  getDetails?(id: string, kind: MediaKind): Promise<MediaDetails | null>
  getArtwork?(id: string, kind: MediaKind): Promise<ArtworkSet>

  /** Episodic media: TV shows, anime. */
  getSeasons?(id: string): Promise<Season[]>

  /** Manga (or comics). */
  getChapters?(id: string): Promise<Chapter[]>

  /** Music: an artist's discography. */
  getDiscography?(id: string): Promise<Album[]>

  /**
   * Legitimate legal availability info only (streaming/rental/purchase
   * services, region, link to the title on that service). Never a
   * scraped or unauthorized playable source.
   */
  getAvailability?(id: string, kind: MediaKind): Promise<AvailabilitySource[]>
}
