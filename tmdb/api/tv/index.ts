import {
  Credits,
  GetImagesResponse,
  GetVideosResponse,
  Review,
  TvShow,
  TvShowDetails,
  WatchProviders,
} from "@/tmdb/models"

import { api } from "../api"
import { ListResponse } from "../types"
import {
  TvCreditsRequestParams,
  TvDetailsRequestParams,
  TvImagesRequestParams,
  TvListRequestParams,
  TvProvidersRequestParams,
  TvRecommendationsRequestParams,
  TvReviewsRequestParams,
  TvSimilarRequestParams,
  TvVideosRequestParams,
} from "./types"

const list = ({ list, page = "1", region, timezone }: TvListRequestParams) =>
  api.fetcher<ListResponse<TvShow>>({
    endpoint: `tv/${list}`,
    params: {
      page,
      region,
      timezone,
    },
  })

const detail = <T>({ id, append }: TvDetailsRequestParams) =>
  api.fetcher<TvShowDetails & T>({
    endpoint: `tv/${id}`,
    params: {
      append_to_response: append,
    },
  })

const credits = ({ id }: TvCreditsRequestParams) =>
  api.fetcher<Credits>({
    endpoint: `tv/${id}/credits`,
  })

const recommendations = ({ id, page }: TvRecommendationsRequestParams) =>
  api.fetcher<ListResponse<TvShow>>({
    endpoint: `tv/${id}/recommendations`,
    params: {
      page,
    },
  })

const similar = ({ id, page }: TvSimilarRequestParams) =>
  api.fetcher<ListResponse<TvShow>>({
    endpoint: `tv/${id}/similar`,
    params: {
      page,
    },
  })

const images = ({ id, langs }: TvImagesRequestParams) =>
  api.fetcher<GetImagesResponse>({
    endpoint: `tv/${id}/images`,
    params: {
      include_image_language: langs,
    },
  })

const videos = ({ id }: TvVideosRequestParams) =>
  api.fetcher<GetVideosResponse>({
    endpoint: `tv/${id}/videos`,
  })

const reviews = ({ id, page }: TvReviewsRequestParams) =>
  api.fetcher<ListResponse<Review>>({
    endpoint: `tv/${id}/reviews`,
    params: {
      page,
    },
  })

const providers = ({ id, region }: TvProvidersRequestParams) =>
  api.fetcher<WatchProviders>({
    endpoint: `tv/${id}/watch/providers`,
    params: {
      watch_region: region,
    },
  })

export const tv = {
  list,
  detail,
  credits,
  recommendations,
  similar,
  images,
  videos,
  reviews,
  providers,
}

export * from "./types"
