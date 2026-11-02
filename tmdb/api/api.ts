import "server-only"
import { unstable_cache } from "next/cache"

import apiConfig from "./config"

const DEFAULT_REVALIDATE_SECONDS = Number(
  process.env.TMDB_CACHE_TTL ?? 60 * 60 * 24 * 7 
)

type FetcherOptions = {
  endpoint: string
  params?: Record<string, string | undefined>
}

type Fetcher = <T>(options: FetcherOptions, init?: RequestInit) => Promise<T>

const sanitizeParams = (params?: Record<string, string | undefined>) => {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined)
  )
}

const createSearchParams = (params: Record<string, string | undefined>) => {
  const sanitizedParams = sanitizeParams(params)
  const mergedParams: Record<string, string> = {
    ...apiConfig.defaultParams,
    ...sanitizedParams,
  } as Record<string, string>

  return new URLSearchParams(mergedParams).toString()
}

const createHeaders = (init?: RequestInit): Headers => {
  const headers = init?.headers ?? {}
  const mergedHeaders = { ...apiConfig.defaultHeaders, ...headers }
  return new Headers(mergedHeaders)
}

const fetcher: Fetcher = async ({ endpoint, params }, init) => {
  const sanitizedParams = sanitizeParams(params)
  const paramsString = createSearchParams(sanitizedParams)
  const headers = createHeaders(init)
  const revalidate = init?.next?.revalidate ?? DEFAULT_REVALIDATE_SECONDS

  const cacheKey = ["tmdb-fetcher", endpoint, paramsString, String(revalidate)]

  const cachedRequest = unstable_cache(
    async () => {
      const urlParams = paramsString ? `?${paramsString}` : ""
      const url = `${apiConfig.baseUrl}/${endpoint}${urlParams}`

      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          const response = await fetch(url, {
            ...init,
            next: { revalidate },
            headers,
          })

          if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
          }

          return await response.json()
        } catch (error) {
          attempts++
          if (attempts >= maxAttempts) {
            console.error(`TMDB fetch failed after ${maxAttempts} attempts: ${url}`, error)
            throw error
          }
          
          const delay = Math.pow(2, attempts) * 500 + Math.random() * 500
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    cacheKey,
    { revalidate }
  )

  return cachedRequest()
}

export const api = {
  fetcher,
}
