import { Credits, SeasonDetails } from "@/tmdb/models"

import { api } from "../api"
import { TvSeasonsDetailsRequestParams } from "./types"

const details = <T>({ id, season, append }: TvSeasonsDetailsRequestParams) =>
  api.fetcher<SeasonDetails & T>({
    endpoint: `tv/${id}/season/${season}`,
    params: {
      append_to_response: append,
    },
  })

const credits = ({ id, season }: TvSeasonsDetailsRequestParams) =>
  api.fetcher<Credits>({
    endpoint: `tv/${id}/season/${season}/credits`,
  })

const aggregateCredits = ({ id, season }: TvSeasonsDetailsRequestParams) =>
  api.fetcher<Credits>({
    endpoint: `tv/${id}/season/${season}/aggregate_credits`,
  })

export const tvSeasons = {
  details,
  credits,
  aggregateCredits,
}
