"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { SearchResultCard } from "@/components/search-result-card"
import type { MovieWithMediaType, TvShowWithMediaType } from "@/tmdb/models"
import { getLocalWatchData } from "@/lib/local-watch-data"

interface HistorySeed {
  id: number
  media_type: "movie" | "tv"
  lastWatched?: number
  last_watched?: number
  watchedAt?: number
  watched_at?: number
}

type Recommendation = MovieWithMediaType | TvShowWithMediaType

function readSeeds(): HistorySeed[] {
  try {
    const raw = getLocalWatchData().watchHistory
    const history = JSON.parse(raw || "[]") as HistorySeed[]
    const unique = new Map<string, HistorySeed>()

    for (const item of history) {
      if (!item || !Number.isInteger(item.id) || (item.media_type !== "movie" && item.media_type !== "tv")) continue
      const key = `${item.media_type}:${item.id}`
      if (!unique.has(key)) unique.set(key, item)
    }

    return Array.from(unique.values())
      .sort((a, b) => (b.lastWatched || b.last_watched || b.watchedAt || b.watched_at || 0) - (a.lastWatched || a.last_watched || a.watchedAt || a.watched_at || 0))
      .slice(0, 4)
  } catch {
    return []
  }
}

export function PersonalRecommendations() {
  const [seeds, setSeeds] = useState<HistorySeed[]>([])
  const [results, setResults] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => setSeeds(readSeeds()), [])

  useEffect(() => {
    refresh()
    window.addEventListener("WATCH_DATA_UPDATED", refresh)
    return () => window.removeEventListener("WATCH_DATA_UPDATED", refresh)
  }, [refresh])

  const seedKey = useMemo(() => seeds.map((seed) => `${seed.media_type}:${seed.id}`).join(","), [seeds])

  useEffect(() => {
    if (!seedKey) {
      setResults([])
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`/api/recommendations?seeds=${encodeURIComponent(seedKey)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ results?: Recommendation[] }> : { results: [] })
      .then((payload) => {
        if (!cancelled) setResults(Array.isArray(payload.results) ? payload.results : [])
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [seedKey])

  const seedSet = useMemo(() => new Set(seeds.map((seed) => `${seed.media_type}:${seed.id}`)), [seeds])
  const filteredResults = results.filter((result) => !seedSet.has(`${result.media_type}:${result.id}`)).slice(0, 12)

  if ((!loading && !filteredResults.length) || !seedKey) return null

  return (
    <section className="streamhub-rail px-4 sm:px-6 lg:px-10" aria-labelledby="personal-recommendations-title">
      <div className="sidequests-section-heading px-1">
        <div>
          <p>Personalized from your local watch history</p>
          <h2 id="personal-recommendations-title">For your next quest</h2>
        </div>
      </div>
      {loading && !filteredResults.length ? (
        <div className="rounded-2xl border border-border/60 bg-background/30 p-6 text-sm text-muted-foreground">Finding your next watch…</div>
      ) : (
        <div className="grid-list">
          {filteredResults.map((result) => <SearchResultCard key={`${result.media_type}-${result.id}`} media={result} />)}
        </div>
      )}
    </section>
  )
}
