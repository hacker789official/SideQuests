import { api } from "@/tmdb/api/api"
import { GenreResponse } from "@/tmdb/api/types"

const movie = () =>
  api.fetcher<GenreResponse>({
    endpoint: "genre/movie/list",
  })

const tv = () =>
  api.fetcher<GenreResponse>({
    endpoint: "genre/tv/list",
  })

export const genres = {
  movie,
  tv,
}
