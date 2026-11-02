import {
  buildMovieVidLink,
  buildTvVidLink,
  type VidLinkPlayerOptions,
} from "@/lib/vidlink"

export type PlayerSourceId = "vidlink" | "vidsrc" | "vidsrc-classic" | "superembed" | "vidcore" | "vidfast" | "vidrock" | "primesrc"
export type SupportedPlayerMediaType = "movie" | "tv"
export type AnimeSourceId = "gogoanime" | "vidlink-anime"

export interface AnimeSourceDefinition {
  id: AnimeSourceId
  name: string
  description: string
  canEmbed: boolean
}

export const ANIME_SOURCES: AnimeSourceDefinition[] = [
  {
    id: "gogoanime",
    name: "Anime Server 1",
    description: "Gogoanime / MegaVid embed · provider subtitles/audio",
    canEmbed: true,
  },
  {
    id: "vidlink-anime",
    name: "Anime Server 2",
    description: "VidLink Anime embed · fallback server",
    canEmbed: true,
  },
]

export interface PlayerSourceDefinition {
  id: PlayerSourceId
  name: string
  label: string
  description: string
  flag: string
  quality: string
  supportedMediaTypes: SupportedPlayerMediaType[]
}

export const PLAYER_SOURCES: PlayerSourceDefinition[] = [
  {
    id: "vidlink",
    name: "Server 1",
    label: "Server 1",
    description: "VidLink HD · Customized HD player",
    flag: "🇺🇸",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "vidsrc",
    name: "Server 2",
    label: "Server 2",
    description: "VidSrc · Alternate embed player",
    flag: "🇬🇧",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "vidsrc-classic",
    name: "Server 3",
    label: "Server 3",
    description: "VidSrc Classic · Classic TMDB embed fallback",
    flag: "🇬🇧",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "superembed",
    name: "Server 4",
    label: "Server 4",
    description: "SuperEmbed · MultiEmbed TMDB player",
    flag: "🇺🇸",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "vidcore",
    name: "Server 5 · VidCore",
    label: "Server 5",
    description: "VidCore · StreamHub provider",
    flag: "🇬🇧",
    quality: "4K",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "vidfast",
    name: "Server 6 · VidFast",
    label: "Server 6",
    description: "VidFast · StreamHub provider",
    flag: "🇬🇧",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "vidrock",
    name: "Server 7 · VidRock",
    label: "Server 7",
    description: "VidRock · StreamHub provider",
    flag: "🇬🇧",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
  {
    id: "primesrc",
    name: "PrimeSrc",
    label: "PrimeSrc",
    description: "PrimeSrc · multi-host player",
    flag: "🇦🇺",
    quality: "HD",
    supportedMediaTypes: ["movie", "tv"],
  },
]

export const getPlayerSource = (sourceId: PlayerSourceId) =>
  PLAYER_SOURCES.find((source) => source.id === sourceId) || PLAYER_SOURCES[0]

export const getPlayerSources = (mediaType: SupportedPlayerMediaType) =>
  PLAYER_SOURCES.filter((source) => source.supportedMediaTypes.includes(mediaType))

export const buildGogoanimeSearchUrl = (animeTitle: string) =>
  `https://gogoanime.by/?s=${encodeURIComponent(animeTitle.trim())}`

export const buildGogoanimeEmbedUrl = (
  malId: string | number,
  episode = 1,
  audioMode: "sub" | "dub" = "sub"
) =>
  `https://megavid.buzz/mal/${encodeURIComponent(String(malId))}/${encodeURIComponent(
    String(episode)
  )}/${audioMode}`

export const buildVidLinkAnimeEmbedUrl = (
  malId: string | number,
  episode = 1,
  audioMode: "sub" | "dub" = "sub"
) =>
  `https://vidlink.pro/anime/${encodeURIComponent(String(malId))}/${encodeURIComponent(
    String(episode)
  )}/${audioMode}?fallback=true`

export const buildAnimeEmbedUrl = (
  sourceId: AnimeSourceId,
  malId: string | number,
  episode = 1,
  audioMode: "sub" | "dub" = "sub"
) => sourceId === "vidlink-anime"
  ? buildVidLinkAnimeEmbedUrl(malId, episode, audioMode)
  : buildGogoanimeEmbedUrl(malId, episode, audioMode)

export const buildVidSrcUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => {
  const encodedId = encodeURIComponent(String(tmdbId))

  if (mediaType === "tv") {
    return `https://vidsrc.sbs/embed/tv/${encodedId}/${encodeURIComponent(
      String(season)
    )}/${encodeURIComponent(String(episode))}`
  }

  return `https://vidsrc.sbs/embed/movie/${encodedId}`
}

export const buildVidSrcClassicUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => {
  const encodedId = encodeURIComponent(String(tmdbId))

  if (mediaType === "tv") {
    return `https://vidsrc.xyz/embed/tv?tmdb=${encodedId}&season=${encodeURIComponent(
      String(season)
    )}&episode=${encodeURIComponent(String(episode))}`
  }

  return `https://vidsrc.xyz/embed/movie?tmdb=${encodedId}`
}

export const buildVidCoreUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => mediaType === "tv"
  ? `https://vidcore.io/tv/${encodeURIComponent(String(tmdbId))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}?autoPlay=true`
  : `https://vidcore.io/movie/${encodeURIComponent(String(tmdbId))}?autoPlay=true`

export const buildVidFastUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => mediaType === "tv"
  ? `https://vidfast.vc/tv/${encodeURIComponent(String(tmdbId))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}?autoPlay=true`
  : `https://vidfast.vc/movie/${encodeURIComponent(String(tmdbId))}?autoPlay=true`

export const buildPrimeSrcUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => {
  const params = new URLSearchParams({ tmdb: String(tmdbId), fallback: "true" })
  if (mediaType === "tv") {
    params.set("season", String(season))
    params.set("episode", String(episode))
    return `https://primesrc.me/embed/tv?${params.toString()}`
  }
  return `https://primesrc.me/embed/movie?${params.toString()}`
}

export const buildVidRockUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => mediaType === "tv"
  ? `https://vidrock.net/tv/${encodeURIComponent(String(tmdbId))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}?autoplay=true`
  : `https://vidrock.net/movie/${encodeURIComponent(String(tmdbId))}?autoplay=true`

export const buildSuperEmbedUrl = (
  mediaType: SupportedPlayerMediaType,
  tmdbId: string | number,
  season = 1,
  episode = 1
) => {
  const params = new URLSearchParams({
    video_id: String(tmdbId),
    tmdb: "1",
  })

  if (mediaType === "tv") {
    params.set("s", String(season))
    params.set("e", String(episode))
  }

  return `https://multiembed.mov/?${params.toString()}`
}

export const buildPlayerSourceUrl = ({
  sourceId,
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  vidLinkOptions = {},
}: {
  sourceId: PlayerSourceId
  mediaType: SupportedPlayerMediaType
  tmdbId: string | number
  season?: number
  episode?: number
  vidLinkOptions?: VidLinkPlayerOptions
}) => {
  if (sourceId === "vidsrc") {
    return buildVidSrcUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "vidsrc-classic") {
    return buildVidSrcClassicUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "superembed") {
    return buildSuperEmbedUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "vidcore") {
    return buildVidCoreUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "vidfast") {
    return buildVidFastUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "vidrock") {
    return buildVidRockUrl(mediaType, tmdbId, season, episode)
  }
  if (sourceId === "primesrc") {
    return buildPrimeSrcUrl(mediaType, tmdbId, season, episode)
  }

  return mediaType === "tv"
    ? buildTvVidLink(tmdbId, season, episode, vidLinkOptions)
    : buildMovieVidLink(tmdbId, vidLinkOptions)
}
