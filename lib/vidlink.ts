const VIDLINK_BASE_URL = "https://vidlink.pro"

export type VidLinkMediaType = "movie" | "tv" | "anime"
export type AnimeAudio = "sub" | "dub"

export interface VidLinkPlayerOptions {
  nextbutton?: boolean
  startAt?: number
  subFile?: string
  subLabel?: string
  fallbackUrl?: string
}

const DEFAULT_PLAYER_PARAMS = {
  primaryColor: "B20710",
  secondaryColor: "170000",
  icons: "vid",
  iconColor: "B20710",
  title: "false",
  poster: "true",
  autoplay: "false",
  player: "jw",
} as const

const encodePathSegment = (value: string | number) => encodeURIComponent(String(value))

const appendPlayerParams = (
  baseUrl: string,
  options: VidLinkPlayerOptions = {}
) => {
  const params = new URLSearchParams(DEFAULT_PLAYER_PARAMS)

  if (options.nextbutton !== undefined) {
    params.set("nextbutton", String(options.nextbutton))
  }
  if (options.startAt !== undefined) {
    params.set("startAt", String(options.startAt))
  }
  if (options.subFile) {
    params.set("sub_file", options.subFile)
  }
  if (options.subLabel) {
    params.set("sub_label", options.subLabel)
  }
  if (options.fallbackUrl) {
    params.set("fallback_url", options.fallbackUrl)
  }

  const separator = baseUrl.includes("?") ? "&" : "?"
  return `${baseUrl}${separator}${params.toString()}`
}

export const buildMovieVidLink = (
  tmdbId: string | number,
  options: VidLinkPlayerOptions = {}
) =>
  appendPlayerParams(
    `${VIDLINK_BASE_URL}/movie/${encodePathSegment(tmdbId)}`,
    options
  )

export const buildTvVidLink = (
  tmdbId: string | number,
  season = 1,
  episode = 1,
  options: VidLinkPlayerOptions = {}
) =>
  appendPlayerParams(
    `${VIDLINK_BASE_URL}/tv/${encodePathSegment(tmdbId)}/${encodePathSegment(
      season
    )}/${encodePathSegment(episode)}`,
    { ...options, nextbutton: options.nextbutton ?? true }
  )

export const buildAnimeVidLink = (
  malId: string | number,
  number: string | number,
  subOrDub: AnimeAudio = "sub",
  options: VidLinkPlayerOptions = {}
) =>
  appendPlayerParams(
    `${VIDLINK_BASE_URL}/anime/${encodePathSegment(malId)}/${encodePathSegment(
      number
    )}/${encodePathSegment(subOrDub)}?fallback=true`,
    options
  )

export const buildVidLink = ({
  mediaType,
  id,
  season = 1,
  episode = 1,
  animeEpisode = 1,
  animeAudio = "sub",
  options = {},
}: {
  mediaType: VidLinkMediaType
  id: string | number
  season?: number
  episode?: number
  animeEpisode?: number
  animeAudio?: AnimeAudio
  options?: VidLinkPlayerOptions
}) => {
  if (mediaType === "tv") return buildTvVidLink(id, season, episode, options)
  if (mediaType === "anime") {
    return buildAnimeVidLink(id, animeEpisode, animeAudio, options)
  }
  return buildMovieVidLink(id, options)
}

export const VIDLINK_TEMPLATES = {
  movie: `${VIDLINK_BASE_URL}/movie/{tmdbId}`,
  tv: `${VIDLINK_BASE_URL}/tv/{tmdbId}/{season}/{episode}`,
  anime: `${VIDLINK_BASE_URL}/anime/{MALid}/{number}/{subOrDub}?fallback=true`,
} as const

export const VIDLINK_PLAYER_DEFAULTS = DEFAULT_PLAYER_PARAMS

export const isVidLinkUrl = (url: string) => {
  try {
    return new URL(url).hostname === "vidlink.pro"
  } catch {
    return false
  }
}

export { VIDLINK_BASE_URL }
