"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { getLocalTvEpisodeProgressMap } from "@/lib/local-watch-data"
import { TvEpisodeCard } from "@/components/tv-episode-card"

type Episode = React.ComponentProps<typeof TvEpisodeCard>

type Filter = "all" | "unwatched" | "started"

export function TvEpisodeFilter({
  tvId,
  season,
  episodes,
}: {
  tvId: number
  season: number
  episodes: Episode[]
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [started, setStarted] = useState<Record<string, unknown>>({})

  const refresh = useCallback(() => {
    setStarted(getLocalTvEpisodeProgressMap(tvId, season))
  }, [season, tvId])

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener("WATCH_DATA_UPDATED", onUpdate)
    return () => window.removeEventListener("WATCH_DATA_UPDATED", onUpdate)
  }, [refresh])

  const visibleEpisodes = useMemo(() => {
    if (filter === "all") return episodes
    return episodes.filter((episode) => {
      const isStarted = Boolean(started[String(episode.episode_number)])
      return filter === "started" ? isStarted : !isStarted
    })
  }, [episodes, filter, started])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {visibleEpisodes.length} of {episodes.length} episodes
        </p>
        <div
          className="flex rounded-full border border-border/60 bg-background/30 p-1"
          role="group"
          aria-label="Episode filter"
        >
          {(["all", "unwatched", "started"] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`min-h-10 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                filter === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option === "all"
                ? "All"
                : option === "started"
                ? "In progress"
                : "Not started"}
            </button>
          ))}
        </div>
      </div>
      {visibleEpisodes.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleEpisodes.map((episode) => (
            <article key={episode.id} className="flex flex-col gap-3">
              <TvEpisodeCard {...episode} />
              <Link
                href={`/tv/${tvId}?play=true&season=${season}&episode=${episode.episode_number}`}
                aria-label={`Watch season ${season}, episode ${episode.episode_number}: ${episode.name}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Watch{" "}
                {season === 0
                  ? "Specials"
                  : `S${String(season).padStart(2, "0")}`}{" "}
                E{String(episode.episode_number).padStart(2, "0")}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-box">No {filter} episodes in this season.</div>
      )}
    </div>
  )
}
