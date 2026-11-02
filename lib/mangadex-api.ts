const MANGADEX_API = "https://api.mangadex.org"

export interface MangaDexManga {
  id: string
  type: "manga"
  attributes: {
    title: Record<string, string>
    altTitles?: Array<Record<string, string>>
    description?: Record<string, string>
    year?: number | null
    status?: string
    contentRating?: string
    lastChapter?: string | null
    latestUploadedChapter?: string | null
  }
  relationships?: Array<{ id: string; type: string; attributes?: Record<string, unknown> }>
}

export interface MangaDexListResponse<T> {
  result: "ok"
  response: "collection"
  data: T[]
  limit: number
  offset: number
  total: number
}

export interface MangaDexChapter {
  id: string
  type: "chapter"
  attributes: {
    chapter: string | null
    volume: string | null
    title: string | null
    translatedLanguage: string
    pages: number
    externalUrl: string | null
    publishAt: string
    readableAt: string
    isUnavailable: boolean
  }
}

export interface MangaDexChapterPages {
  baseUrl: string
  chapter: {
    hash: string
    data: string[]
    dataSaver: string[]
  }
}

const mangaTitle = (manga: MangaDexManga) =>
  manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Untitled manga"

export const getMangaTitle = mangaTitle

export const getMangaCoverFile = (manga: MangaDexManga) => {
  const cover = manga.relationships?.find((relationship) => relationship.type === "cover_art")
  return typeof cover?.attributes?.fileName === "string" ? cover.attributes.fileName : null
}

export const mangaCoverUrl = (manga: MangaDexManga) => {
  const fileName = getMangaCoverFile(manga)
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : null
}

const mangaDexJson = async <T>(path: string, revalidate = 900): Promise<T> => {
  const response = await fetch(`${MANGADEX_API}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  })
  if (!response.ok) throw new Error(`MangaDex request failed (${response.status})`)
  return response.json() as Promise<T>
}

export const getMangaById = async (mangaId: string) => {
  const params = new URLSearchParams({
    "includes[]": "cover_art",
  })
  const response = await mangaDexJson<{ result: "ok"; response: "entity"; data: MangaDexManga }>(`/manga/${encodeURIComponent(mangaId)}?${params.toString()}`, 1800)
  return response.data
}

export const searchManga = async (query: string, page = 1, limit = 24) => {
  const params = new URLSearchParams({
    title: query,
    limit: String(limit),
    offset: String(Math.max(0, page - 1) * limit),
    "order[relevance]": "desc",
    "includes[]": "cover_art",
  })
  params.append("contentRating[]", "safe")
  params.append("contentRating[]", "suggestive")
  return mangaDexJson<MangaDexListResponse<MangaDexManga>>(`/manga?${params.toString()}`, 1800)
}

export const getMangaChapters = async (mangaId: string, limit = 500) => {
  const params = new URLSearchParams({
    limit: String(limit),
    "order[chapter]": "asc",
    "order[volume]": "asc",
    "translatedLanguage[]": "en",
    "includes[]": "scanlation_group",
  })
  return mangaDexJson<MangaDexListResponse<MangaDexChapter>>(`/manga/${encodeURIComponent(mangaId)}/feed?${params.toString()}`, 900)
}

export const getChapterPages = (chapterId: string) =>
  mangaDexJson<MangaDexChapterPages>(`/at-home/server/${encodeURIComponent(chapterId)}`, 600)
