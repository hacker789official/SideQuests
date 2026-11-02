export type AniListMediaType = "ANIME" | "MANGA"

export interface AniListTitle {
  romaji: string | null
  english: string | null
  native: string | null
}

export interface AniListCoverImage {
  extraLarge: string | null
  large: string | null
  color: string | null
}

export interface AniListMedia {
  id: number
  idMal: number | null
  type: AniListMediaType
  format: string | null
  status: string | null
  description: string | null
  title: AniListTitle
  coverImage: AniListCoverImage
  bannerImage: string | null
  genres: string[]
  averageScore: number | null
  episodes: number | null
  chapters: number | null
  volumes: number | null
  duration: number | null
  season: string | null
  seasonYear: number | null
  startDate: { year: number | null; month: number | null; day: number | null }
  studios?: { nodes: { name: string }[] }
}

export interface AniListPageInfo {
  currentPage: number
  hasNextPage: boolean
  lastPage: number
}

export interface AniListPage<T> {
  Page: {
    pageInfo: AniListPageInfo
    media: T[]
  }
}
