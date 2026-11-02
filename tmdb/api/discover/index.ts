import { api } from "@/tmdb/api/api"
import {
  DiscoverMovieRequestParams,
  DiscoverTvRequestParams,
  ListResponse,
} from "@/tmdb/api/types"
import { Movie, TvShow } from "@/tmdb/models"

const movie = (args: DiscoverMovieRequestParams) =>
  api.fetcher<ListResponse<Movie>>({
    endpoint: "discover/movie",
    params: args as Record<string, string>,
  })

const tv = (args: DiscoverTvRequestParams) =>
  api.fetcher<ListResponse<TvShow>>({
    endpoint: "discover/tv",
    params: args as Record<string, string>,
  })

export const discover = {
  movie,
  tv,
}
