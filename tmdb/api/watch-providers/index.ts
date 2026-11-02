import { api } from "@/tmdb/api/api"
import { ListResponse, WatchProvidersRequestParams } from "@/tmdb/api/types"
import { GetAvailableRegionsResponse, WatchProvider } from "@/tmdb/models"

const regions = () =>
  api.fetcher<GetAvailableRegionsResponse>({
    endpoint: `watch/providers/regions`,
  })

const movie = ({ region }: WatchProvidersRequestParams) =>
  api.fetcher<ListResponse<WatchProvider>>({
    endpoint: `watch/providers/movie`,
    params: {
      watch_region: region,
    },
  })

const tv = ({ region }: WatchProvidersRequestParams) =>
  api.fetcher<ListResponse<WatchProvider>>({
    endpoint: `watch/providers/tv`,
    params: {
      watch_region: region,
    },
  })

export const watchProviders = {
  regions,
  movie,
  tv,
}
