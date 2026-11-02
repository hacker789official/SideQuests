

import { getTmdbApiKey, getTmdbReadToken } from "@/lib/security/config"

const baseUrl: string = "https://api.themoviedb.org/3"

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${getTmdbReadToken()}`,
}

const defaultParams: Record<string, string> = {
  language: "en-US",
  api_key: getTmdbApiKey(),
}

const apiConfig: {
  baseUrl: string
  defaultHeaders: Record<string, string>
  defaultParams: Record<string, string>
} = {
  baseUrl,
  defaultHeaders,
  defaultParams,
}

export default apiConfig
