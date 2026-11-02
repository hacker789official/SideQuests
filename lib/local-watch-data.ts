export interface LocalWatchData {
  watchHistory: string
  watchHistoryEnabled: string
  watches: string
  watchProgress: Record<string, string>
  updated_at: string
  deletedItems?: Record<string, number>
}

const readJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const getLocalWatchData = (): LocalWatchData => {
  if (typeof window === "undefined") {
    return {
      watchHistory: "[]",
      watchHistoryEnabled: "true",
      watches: "[]",
      watchProgress: {},
      updated_at: new Date().toISOString(),
      deletedItems: {},
    }
  }

  const watchProgress = readJson<Record<string, string>>(localStorage.getItem("watchProgress"), {})
  const animeProgress = readJson<Record<string, unknown>>(localStorage.getItem("sidequestsAnimeEpisodeProgress"), {})
  const mangaProgress = readJson<Record<string, unknown>>(localStorage.getItem("sidequestsMangaReadingProgress"), {})
  for (const [key, value] of Object.entries(animeProgress)) watchProgress[`anime_episode_${key}`] = JSON.stringify(value)
  for (const [key, value] of Object.entries(mangaProgress)) watchProgress[`manga_reading_${key}`] = JSON.stringify(value)
  return {
    watchHistory: localStorage.getItem("watchHistory") || "[]",
    watchHistoryEnabled: localStorage.getItem("watchHistoryEnabled") || "true",
    watches: localStorage.getItem("watches") || "[]",
    watchProgress,
    updated_at: localStorage.getItem("syncUpdatedAt") || new Date().toISOString(),
    deletedItems: readJson(localStorage.getItem("deletedItems"), {}),
  }
}

export const saveLocalWatchData = (data: LocalWatchData): void => {
  if (typeof window === "undefined") return

  localStorage.setItem("watchHistory", data.watchHistory || "[]")
  localStorage.setItem("watchHistoryEnabled", data.watchHistoryEnabled || "true")
  localStorage.setItem("watches", data.watches || "[]")
  localStorage.setItem("watchProgress", JSON.stringify(data.watchProgress || {}))
  localStorage.setItem("deletedItems", JSON.stringify(data.deletedItems || {}))
  localStorage.setItem("syncUpdatedAt", data.updated_at || new Date().toISOString())
}

export const removeLocalWatchHistory = (
  itemId: number,
  mediaType: "movie" | "tv"
): void => {
  const watchData = getLocalWatchData()
  const history = readJson<any[]>(watchData.watchHistory, [])
  const updatedHistory = history.filter(
    (item) => !(item.id === itemId && item.media_type === mediaType)
  )
  const updatedProgress = { ...watchData.watchProgress }
  delete updatedProgress[`${mediaType}_${itemId}`]

  saveLocalWatchData({
    ...watchData,
    watchHistory: JSON.stringify(updatedHistory),
    watchProgress: updatedProgress,
  })

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("WATCH_DATA_UPDATED", {
        detail: { hasNewHistory: true, hasProgressUpdate: true, localChange: true },
      })
    )
  }
}

export const getLocalWatchHistoryEnabled = (): boolean => {
  if (typeof window === "undefined") return true
  return localStorage.getItem("watchHistoryEnabled") !== "false"
}

export const setLocalWatchHistoryEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("watchHistoryEnabled", String(enabled))
  window.dispatchEvent(
    new CustomEvent("WATCH_DATA_UPDATED", {
      detail: { historySettingChanged: true, localChange: true },
    })
  )
}


export interface LocalAnimeEpisodeProgress {
  animeId: number
  malId: number | null
  title: string
  episode: number
  activeSeconds: number
  progress: number
  completed: boolean
  updatedAt: string
}

export interface LocalMangaReadingProgress {
  mangaId: number | string
  title: string
  mangaDexId: string | null
  chapterId: string
  chapterNumber: string
  page: number
  totalPages: number
  updatedAt: string
}

const ANIME_EPISODE_PROGRESS_KEY = "sidequestsAnimeEpisodeProgress"
const MANGA_READING_PROGRESS_KEY = "sidequestsMangaReadingProgress"
const TV_EPISODE_PROGRESS_KEY = "sidequestsTvEpisodeProgress"

const animeProgressKey = (animeId: number, episode?: number) =>
  episode ? `${animeId}_${episode}` : String(animeId)

export const getLocalAnimeEpisodeProgress = (
  animeId: number,
  episode?: number
): LocalAnimeEpisodeProgress | null => {
  if (typeof window === "undefined") return null
  const progress = readJson<Record<string, LocalAnimeEpisodeProgress>>(
    localStorage.getItem(ANIME_EPISODE_PROGRESS_KEY),
    {}
  )
  return progress[animeProgressKey(animeId, episode)] || null
}

export const getLocalTvEpisodeProgressMap = (tvId: number, season: number): Record<string, { tvId: number; season: number; episode: number; updatedAt: string }> => {
  if (typeof window === "undefined") return {}
  const progress = readJson<Record<string, { tvId: number; season: number; episode: number; updatedAt: string }>>(localStorage.getItem(TV_EPISODE_PROGRESS_KEY), {})
  return Object.fromEntries(Object.entries(progress).filter(([, value]) => value.tvId === tvId && value.season === season))
}

export const saveLocalTvEpisodeProgress = (value: { tvId: number; season: number; episode: number; updatedAt: string }): void => {
  if (typeof window === "undefined") return
  const progress = readJson<Record<string, { tvId: number; season: number; episode: number; updatedAt: string }>>(localStorage.getItem(TV_EPISODE_PROGRESS_KEY), {})
  progress[`${value.tvId}_${value.season}_${value.episode}`] = value
  localStorage.setItem(TV_EPISODE_PROGRESS_KEY, JSON.stringify(progress))
  window.dispatchEvent(new CustomEvent("WATCH_DATA_UPDATED", { detail: { hasProgressUpdate: true, localChange: true } }))
}

export const getLocalAnimeEpisodeProgressMap = (
  animeId: number
): Record<string, LocalAnimeEpisodeProgress> => {
  if (typeof window === "undefined") return {}
  const progress = readJson<Record<string, LocalAnimeEpisodeProgress>>(
    localStorage.getItem(ANIME_EPISODE_PROGRESS_KEY),
    {}
  )
  return Object.fromEntries(
    Object.entries(progress).filter(([key, value]) =>
      key.startsWith(`${animeId}_`) && value.animeId === animeId
    )
  )
}

export const saveLocalAnimeEpisodeProgress = (
  value: LocalAnimeEpisodeProgress
): void => {
  if (typeof window === "undefined") return
  const progress = readJson<Record<string, LocalAnimeEpisodeProgress>>(
    localStorage.getItem(ANIME_EPISODE_PROGRESS_KEY),
    {}
  )
  progress[animeProgressKey(value.animeId, value.episode)] = value
  localStorage.setItem(ANIME_EPISODE_PROGRESS_KEY, JSON.stringify(progress))
  window.dispatchEvent(
    new CustomEvent("WATCH_DATA_UPDATED", {
      detail: { hasProgressUpdate: true, localChange: true },
    })
  )
}

export const getLocalMangaReadingProgress = (
  mangaId: number | string
): LocalMangaReadingProgress | null => {
  if (typeof window === "undefined") return null
  const progress = readJson<Record<string, LocalMangaReadingProgress>>(
    localStorage.getItem(MANGA_READING_PROGRESS_KEY),
    {}
  )
  return progress[String(mangaId)] || null
}

export const saveLocalMangaReadingProgress = (
  value: LocalMangaReadingProgress
): void => {
  if (typeof window === "undefined") return
  const progress = readJson<Record<string, LocalMangaReadingProgress>>(
    localStorage.getItem(MANGA_READING_PROGRESS_KEY),
    {}
  )
  progress[String(value.mangaId)] = value
  localStorage.setItem(MANGA_READING_PROGRESS_KEY, JSON.stringify(progress))
  window.dispatchEvent(
    new CustomEvent("WATCH_DATA_UPDATED", {
      detail: { hasProgressUpdate: true, localChange: true },
    })
  )
}

export const clearLocalMediaProgress = (mediaId: number): void => {
  if (typeof window === "undefined") return
  const animeProgress = readJson<Record<string, LocalAnimeEpisodeProgress>>(
    localStorage.getItem(ANIME_EPISODE_PROGRESS_KEY),
    {}
  )
  const mangaProgress = readJson<Record<string, LocalMangaReadingProgress>>(
    localStorage.getItem(MANGA_READING_PROGRESS_KEY),
    {}
  )
  for (const key of Object.keys(animeProgress)) {
    if (key === String(mediaId) || key.startsWith(`${mediaId}_`)) delete animeProgress[key]
  }
  delete mangaProgress[String(mediaId)]
  localStorage.setItem(ANIME_EPISODE_PROGRESS_KEY, JSON.stringify(animeProgress))
  localStorage.setItem(MANGA_READING_PROGRESS_KEY, JSON.stringify(mangaProgress))
}


export const getLocalAnimeProgressForSync = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  return readJson(localStorage.getItem("sidequestsAnimeEpisodeProgress"), {})
}

export const getLocalMangaProgressForSync = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  return readJson(localStorage.getItem("sidequestsMangaReadingProgress"), {})
}

export const hydrateMediaProgressFromSync = (watchProgress: Record<string, string>): void => {
  if (typeof window === "undefined") return
  const anime: Record<string, unknown> = {}
  const manga: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(watchProgress || {})) {
    try {
      if (key.startsWith("anime_episode_")) anime[key.replace("anime_episode_", "")] = JSON.parse(value)
      if (key.startsWith("manga_reading_")) manga[key.replace("manga_reading_", "")] = JSON.parse(value)
    } catch {
      // Ignore malformed legacy progress records.
    }
  }
  if (Object.keys(anime).length) localStorage.setItem("sidequestsAnimeEpisodeProgress", JSON.stringify(anime))
  if (Object.keys(manga).length) localStorage.setItem("sidequestsMangaReadingProgress", JSON.stringify(manga))
  window.dispatchEvent(new CustomEvent("WATCH_DATA_UPDATED", { detail: { hasProgressUpdate: true, cloudChange: true } }))
}
