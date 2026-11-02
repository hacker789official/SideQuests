

export const getTmdbApiKey = (): string => {
  const key = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY
  return key || ""
}

export const getTmdbReadToken = (): string => {
  const token =
    process.env.TMDB_READ_TOKEN || process.env.NEXT_PUBLIC_TMDB_READ_TOKEN
  return token || ""
}

export const validateSecurityConfig = (): boolean => {
  const tmdbKey = getTmdbApiKey()
  const tmdbToken = getTmdbReadToken()

  if (!tmdbKey || !tmdbToken) {
    console.warn("[Security] TMDB credentials are not configured for this request.")
    return false
  }

  if (tmdbKey.length < 10 || tmdbToken.length < 20) {
    console.warn("[Security] API keys appear too short or invalid.")
    return false
  }

  return true
}
