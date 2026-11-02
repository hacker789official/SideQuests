import "server-only"
import { unstable_cache } from "next/cache"

const ANILIST_ENDPOINT = "https://graphql.anilist.co"
const DEFAULT_REVALIDATE_SECONDS = Number(
  process.env.ANILIST_CACHE_TTL ?? 60 * 60 * 6
)

type GraphQLRequest = {
  query: string
  variables?: Record<string, unknown>
  revalidate?: number
}

export async function anilistQuery<T>({
  query,
  variables,
  revalidate = DEFAULT_REVALIDATE_SECONDS,
}: GraphQLRequest): Promise<T> {
  const cacheKey = [
    "anilist-query",
    query,
    JSON.stringify(variables ?? {}),
    String(revalidate),
  ]

  const cachedRequest = unstable_cache(
    async () => {
      const response = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate },
      })

      const rawBody = await response.text()
      let json: { data?: T; errors?: { message: string }[] }

      try {
        json = JSON.parse(rawBody)
      } catch {
        throw new Error(
          `AniList API returned a non-JSON response (status ${response.status}): ${rawBody.slice(0, 200)}`
        )
      }

      if (!response.ok || json.errors) {
        const message =
          json.errors?.[0]?.message ?? `AniList API error: ${response.status}`
        throw new Error(message)
      }

      return json.data as T
    },
    cacheKey,
    { revalidate }
  )

  return cachedRequest()
}
