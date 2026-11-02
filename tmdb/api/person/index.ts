import { ListResponse } from "@/tmdb/api/types"
import { CombinedCreditsResponse, Person, PersonDetails } from "@/tmdb/models"

import { api } from "../api"
import { PersonDetailsRequestParams, PersonListRequestParams } from "./types"

const list = async ({ list, page }: PersonListRequestParams) =>
  api.fetcher<ListResponse<Person>>({
    endpoint: `person/${list}`,
    params: {
      page,
    },
  })

const detail = async <T>({ id, append }: PersonDetailsRequestParams) =>
  api.fetcher<PersonDetails & T>({
    endpoint: `person/${id}`,
    params: {
      append_to_response: append,
    },
  })

const combinedCredits = async ({ id }: PersonDetailsRequestParams) =>
  api.fetcher<CombinedCreditsResponse>({
    endpoint: `person/${id}/combined_credits`,
  })

export const person = {
  detail,
  list,
  combinedCredits,
}
