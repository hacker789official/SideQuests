import { anilistQuery } from "./client"
import { MEDIA_CARD_FIELDS } from "./fragments"
import { AniListMedia, AniListMediaType, AniListPage } from "@/anilist/models/media"

type BrowseParams = {
  type: AniListMediaType
  page?: number
  perPage?: number
}

export type BrowseFilterParams = BrowseParams & {
  genre?: string
  season?: "WINTER" | "SPRING" | "SUMMER" | "FALL"
  seasonYear?: number
  sort?: "TRENDING_DESC" | "POPULARITY_DESC" | "SCORE_DESC" | "START_DATE_DESC"
}

const trending = ({ type, page = 1, perPage = 20 }: BrowseParams) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($type: MediaType, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: $type, sort: TRENDING_DESC) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { type, page, perPage },
  })

const popular = ({ type, page = 1, perPage = 20 }: BrowseParams) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($type: MediaType, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: $type, sort: POPULARITY_DESC) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { type, page, perPage },
  })

const topRated = ({ type, page = 1, perPage = 20 }: BrowseParams) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($type: MediaType, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: $type, sort: SCORE_DESC) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { type, page, perPage },
  })

const seasonal = ({
  season,
  seasonYear,
  page = 1,
  perPage = 20,
}: {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL"
  seasonYear: number
  page?: number
  perPage?: number
}) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { season, seasonYear, page, perPage },
  })

const search = ({
  type,
  query: searchTerm,
  page = 1,
  perPage = 20,
}: BrowseParams & { query: string }) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($type: MediaType, $search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: $type, search: $search, sort: SEARCH_MATCH) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { type, search: searchTerm, page, perPage },
  })

const filtered = ({
  type,
  page = 1,
  perPage = 24,
  genre,
  season,
  seasonYear,
  sort = "POPULARITY_DESC",
}: BrowseFilterParams) =>
  anilistQuery<AniListPage<AniListMedia>>({
    query: `
      query ($type: MediaType, $page: Int, $perPage: Int, $genre: String, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage lastPage }
          media(type: $type, genre: $genre, season: $season, seasonYear: $seasonYear, sort: $sort) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `,
    variables: { type, page, perPage, genre: genre || undefined, season, seasonYear, sort: [sort] },
  })

export const browse = {
  trending,
  popular,
  topRated,
  seasonal,
  search,
  filtered,
}
