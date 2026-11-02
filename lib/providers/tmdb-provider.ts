import "server-only"

import { tmdb } from "@/tmdb/api"
import { tmdbImage } from "@/tmdb/utils"

import {
  ArtworkSet,
  AvailabilitySource,
  MediaDetails,
  MediaKind,
  MediaProvider,
  Season,
  SearchResultItem,
} from "./types"

/**
 * Adapter over the app's existing TMDB client (`@/tmdb/api`). This does
 * not re-implement fetching/caching — it normalizes the already-fetched
 * TMDB shapes into the provider contract in `./types`.
 *
 * Scope: movie + tv metadata, artwork, seasons/episodes, and legitimate
 * watch-provider availability (e.g. "streaming on Netflix"). No playback
 * URLs are produced here — the existing player/server-switcher UI
 * (`components/media-watch-dialog.tsx`) continues to own that flow.
 */

const REGION = "US"

const toSearchResult = (
  item: any,
  kind: MediaKind
): SearchResultItem | null => {
  const title = kind === "tv" ? item.name : item.title
  if (!title) return null

  const dateStr = kind === "tv" ? item.first_air_date : item.release_date

  return {
    id: String(item.id),
    kind,
    title,
    year: dateStr ? Number(String(dateStr).slice(0, 4)) || undefined : undefined,
    posterUrl: item.poster_path ? tmdbImage.poster(item.poster_path) : undefined,
    overview: item.overview || undefined,
  }
}

const search: MediaProvider["search"] = async (query, kind) => {
  if (kind !== "movie" && kind !== "tv") return []

  const response = await tmdb.search.multi({ query })

  return response.results
    .filter((item: any) => item.media_type === kind)
    .map((item: any) => toSearchResult(item, kind))
    .filter((item): item is SearchResultItem => item !== null)
}

const getDetails: MediaProvider["getDetails"] = async (id, kind) => {
  if (kind === "movie") {
    const details = await tmdb.movie.detail({ id })
    return {
      id: String(details.id),
      kind,
      title: details.title,
      year: details.release_date
        ? Number(details.release_date.slice(0, 4)) || undefined
        : undefined,
      posterUrl: details.poster_path
        ? tmdbImage.poster(details.poster_path)
        : undefined,
      backdropUrl: details.backdrop_path
        ? tmdbImage.backdrop(details.backdrop_path)
        : undefined,
      overview: details.overview || undefined,
      genres: details.genres?.map((genre) => genre.name),
      rating: details.vote_average,
      externalIds: {
        tmdb: String(details.id),
        ...(details.imdb_id ? { imdb: details.imdb_id } : {}),
      },
    } satisfies MediaDetails
  }

  if (kind === "tv") {
    const details = await tmdb.tv.detail({ id })
    return {
      id: String(details.id),
      kind,
      title: details.name,
      year: details.first_air_date
        ? Number(details.first_air_date.slice(0, 4)) || undefined
        : undefined,
      posterUrl: details.poster_path
        ? tmdbImage.poster(details.poster_path)
        : undefined,
      backdropUrl: details.backdrop_path
        ? tmdbImage.backdrop(details.backdrop_path)
        : undefined,
      overview: details.overview || undefined,
      genres: details.genres?.map((genre) => genre.name),
      rating: details.vote_average,
      externalIds: {
        tmdb: String(details.id),
      },
    } satisfies MediaDetails
  }

  return null
}

const getArtwork: MediaProvider["getArtwork"] = async (id, kind) => {
  if (kind !== "movie" && kind !== "tv") {
    return { posters: [], backdrops: [] } satisfies ArtworkSet
  }

  const images =
    kind === "movie"
      ? await tmdb.movie.images({ id })
      : await tmdb.tv.images({ id })

  return {
    posters: images.posters.map((image) => tmdbImage.poster(image.file_path)),
    backdrops: images.backdrops.map((image) =>
      tmdbImage.backdrop(image.file_path)
    ),
  } satisfies ArtworkSet
}

const getSeasons: MediaProvider["getSeasons"] = async (id) => {
  const details = await tmdb.tv.detail({ id })

  return (details.seasons ?? []).map(
    (season): Season => ({
      id: String(season.id),
      number: season.season_number,
      name: season.name,
      episodeCount: season.episode_count,
    })
  )
}

const getAvailability: MediaProvider["getAvailability"] = async (
  id,
  kind
) => {
  if (kind !== "movie" && kind !== "tv") return []

  const response =
    kind === "movie"
      ? await tmdb.movie.providers({ id })
      : await tmdb.tv.providers({ id })

  const locale = response.results?.[REGION]
  if (!locale) return []

  const sources: AvailabilitySource[] = []

  locale.flatrate?.forEach((provider) =>
    sources.push({
      name: provider.provider_name,
      type: "sub",
      region: REGION,
      url: locale.link,
      logoUrl: tmdbImage.logo(provider.logo_path),
    })
  )
  locale.rent?.forEach((provider) =>
    sources.push({
      name: provider.provider_name,
      type: "rent",
      region: REGION,
      url: locale.link,
      logoUrl: tmdbImage.logo(provider.logo_path),
    })
  )
  locale.buy?.forEach((provider) =>
    sources.push({
      name: provider.provider_name,
      type: "buy",
      region: REGION,
      url: locale.link,
      logoUrl: tmdbImage.logo(provider.logo_path),
    })
  )

  return sources
}

export const tmdbProvider: MediaProvider = {
  id: "tmdb",
  name: "TMDB",
  supports: ["movie", "tv"],
  search,
  getDetails,
  getArtwork,
  getSeasons,
  getAvailability,
}
