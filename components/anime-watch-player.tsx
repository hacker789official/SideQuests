"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Play, Radio, Subtitles } from "lucide-react"

import {
  ANIME_SOURCES,
  buildAnimeEmbedUrl,
  type AnimeSourceId,
} from "@/lib/player-sources"
import {
  getLocalAnimeEpisodeProgress,
  getLocalAnimeEpisodeProgressMap,
  saveLocalAnimeEpisodeProgress,
  type LocalAnimeEpisodeProgress,
} from "@/lib/local-watch-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimeWatchPlayerProps {
  animeId: number
  title: string
  malId: number | null
  totalEpisodes: number | null
}

type AudioMode = "sub" | "dub"

const ESTIMATED_EPISODE_SECONDS = 24 * 60
const MAX_FALLBACK_EPISODES = 2000

export const AnimeWatchPlayer: React.FC<AnimeWatchPlayerProps> = ({
  animeId,
  title,
  malId,
  totalEpisodes,
}) => {
  const [episode, setEpisode] = useState(1)
  const [audioMode, setAudioMode] = useState<AudioMode>("sub")
  const [source, setSource] = useState<AnimeSourceId>("gogoanime")
  const [episodeProgress, setEpisodeProgress] = useState<Record<string, LocalAnimeEpisodeProgress>>({})
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [dataSaver, setDataSaver] = useState(false)
  const [playerLoaded, setPlayerLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  const safeEpisode = Math.max(1, Math.min(episode, totalEpisodes || 9999))
  const progressKey = `${animeId}_${safeEpisode}`
  const selectedProgress = episodeProgress[progressKey]
  const embedUrl = useMemo(
    () => (malId ? buildAnimeEmbedUrl(source, malId, safeEpisode, audioMode) : ""),
    [audioMode, malId, safeEpisode, source]
  )
  const sourceDefinition = ANIME_SOURCES.find((item) => item.id === source) ?? ANIME_SOURCES[0]
  const episodeCount = totalEpisodes || MAX_FALLBACK_EPISODES
  const availableEpisodes = Array.from({ length: episodeCount }, (_, index) => index + 1)
  const shouldLoadPlayer = mounted && (!dataSaver || playerLoaded)

  useEffect(() => {
    setMounted(true)
    try {
      const settings = JSON.parse(localStorage.getItem("sidequests-accessibility") || "{}") as { dataSaver?: boolean }
      const enabled = settings.dataSaver === true
      setDataSaver(enabled)
      setPlayerLoaded(!enabled)
    } catch {
      setPlayerLoaded(true)
    }
  }, [])

  useEffect(() => {
    const savedAudioMode = localStorage.getItem("sidequests_anime_audio_mode")
    if (savedAudioMode === "sub" || savedAudioMode === "dub") setAudioMode(savedAudioMode)
    const savedSource = localStorage.getItem("sidequests_anime_source") as AnimeSourceId | null
    if (savedSource && ANIME_SOURCES.some((item) => item.id === savedSource)) setSource(savedSource)
  }, [])

  useEffect(() => {
    localStorage.setItem("sidequests_anime_audio_mode", audioMode)
    localStorage.setItem("sidequests_anime_source", source)
  }, [audioMode, source])

  useEffect(() => {
    const progressMap = getLocalAnimeEpisodeProgressMap(animeId)
    setEpisodeProgress(progressMap)
    const latest = Object.values(progressMap)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    if (latest) setEpisode(Math.max(1, Math.min(latest.episode, totalEpisodes || 9999)))
  }, [animeId, totalEpisodes])

  useEffect(() => {
    setSessionSeconds(getLocalAnimeEpisodeProgress(animeId, safeEpisode)?.activeSeconds || 0)
  }, [animeId, safeEpisode])

  const persistProgress = (next: LocalAnimeEpisodeProgress) => {
    saveLocalAnimeEpisodeProgress(next)
    setEpisodeProgress((current) => ({ ...current, [`${animeId}_${next.episode}`]: next }))
  }

  useEffect(() => {
    if (!malId) return

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      setSessionSeconds((currentSeconds) => {
        const activeSeconds = currentSeconds + 5
        const progress = Math.min(90, Math.round((activeSeconds / ESTIMATED_EPISODE_SECONDS) * 100))
        persistProgress({
          animeId,
          malId,
          title,
          episode: safeEpisode,
          activeSeconds,
          progress,
          completed: progress >= 90,
          updatedAt: new Date().toISOString(),
        })
        return activeSeconds
      })
    }, 5000)

    return () => window.clearInterval(interval)
  }, [animeId, malId, safeEpisode, title])

  useEffect(() => {
    const handleProviderMessage = (event: MessageEvent) => {
      const allowedOrigins = ["https://megavid.buzz", "https://vidlink.pro"]
      if (!allowedOrigins.includes(event.origin)) return
      const payload = typeof event.data === "string"
        ? (() => {
            try { return JSON.parse(event.data) } catch { return { event: event.data } }
          })()
        : event.data
      if (!payload || typeof payload !== "object") return

      const currentTime = Number(payload.currentTime ?? payload.current_time ?? payload.position)
      const duration = Number(payload.duration ?? payload.totalDuration ?? payload.length)
      const isEnded = payload.event === "ended" || payload.type === "ended"
      if (!Number.isFinite(currentTime) && !isEnded) return

      const progress = isEnded
        ? 100
        : duration > 0
          ? Math.min(100, Math.round((currentTime / duration) * 100))
          : selectedProgress?.progress || 1
      persistProgress({
        animeId,
        malId,
        title,
        episode: safeEpisode,
        activeSeconds: Number.isFinite(currentTime) ? Math.max(0, Math.round(currentTime)) : sessionSeconds,
        progress,
        completed: isEnded || progress >= 90,
        updatedAt: new Date().toISOString(),
      })
      if (Number.isFinite(currentTime)) setSessionSeconds(Math.max(0, Math.round(currentTime)))
    }

    window.addEventListener("message", handleProviderMessage)
    return () => window.removeEventListener("message", handleProviderMessage)
  }, [animeId, malId, safeEpisode, selectedProgress?.progress, sessionSeconds, source, title])


  const changeEpisode = (nextEpisode: number) => {
    const next = Math.max(1, Math.min(nextEpisode, totalEpisodes || 9999))
    setEpisode(next)
    setSessionSeconds(getLocalAnimeEpisodeProgress(animeId, next)?.activeSeconds || 0)
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl shadow-black/25">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.035] p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            <Radio className="size-3.5" />
            Anime player
          </div>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Watch {title}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {sourceDefinition.description} · episode {safeEpisode} · {selectedProgress?.completed ? "watched locally" : "progress saves automatically"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary">
            <Radio className="size-3.5" />
            Embedded player
          </div>

          {malId && (
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 text-xs font-semibold text-zinc-300">
              <span className="sr-only">Anime server</span>
              <select
                aria-label="Anime server"
                value={source}
                onChange={(event) => setSource(event.target.value as AnimeSourceId)}
                className="bg-transparent text-xs font-bold text-primary outline-none"
              >
                {ANIME_SOURCES.map((item) => (
                  <option key={item.id} value={item.id} className="bg-zinc-950 text-white">
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

        </div>
      </div>

      <div className="relative aspect-video bg-black">
        {malId && shouldLoadPlayer ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={`${title} episode ${safeEpisode}`}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : malId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="grid size-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Play className="size-5 fill-current" />
            </div>
            <div>
              <p className="font-semibold text-white">Player paused to save data</p>
              <p className="mt-1 max-w-md text-sm text-zinc-500">Load the third-party player only when you are ready to watch.</p>
            </div>
            <Button type="button" onClick={() => setPlayerLoaded(true)} className="rounded-full"><Play className="mr-2 size-4 fill-current" /> Load player</Button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="grid size-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Play className="size-5 fill-current" />
            </div>
            <div>
              <p className="font-semibold text-white">Embedded playback unavailable</p>
              <p className="mt-1 max-w-md text-sm text-zinc-500">This title has no MAL identifier, so SideQuests cannot build its embedded anime route yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/[0.025] p-4 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <label htmlFor="anime-episode" className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Jump to episode
          </label>
          <select
            id="anime-episode"
            value={safeEpisode}
            onChange={(event) => changeEpisode(Number(event.target.value))}
            className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-primary/60"
          >
            {availableEpisodes.map((episodeNumber) => {
              const progress = episodeProgress[`${animeId}_${episodeNumber}`]
              return (
                <option key={episodeNumber} value={episodeNumber}>
                  {progress?.completed ? "✓ " : ""}Episode {episodeNumber}{progress?.completed ? " · Watched" : progress?.progress ? ` · ${progress.progress}%` : ""}
                </option>
              )
            })}
          </select>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            {totalEpisodes ? `${totalEpisodes} total` : `Episode count unavailable · jump up to ${MAX_FALLBACK_EPISODES}`}
            {selectedProgress?.completed && <Check className="size-4 text-emerald-400" />}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-zinc-500">
            {selectedProgress?.completed
              ? `Episode ${safeEpisode} marked watched locally.`
              : selectedProgress?.progress
                ? `Saved locally at ${selectedProgress.progress}% · ${Math.floor(selectedProgress.activeSeconds / 60)}m watched`
                : "Start playback and SideQuests will save this episode automatically on this device."}
          </p>

          <div className="flex items-center gap-2">
            <Subtitles className="size-4 text-zinc-500" />
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Audio</span>
            {(["sub", "dub"] as AudioMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAudioMode(mode)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition active:scale-95",
                  audioMode === mode
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                )}
              >
                {mode === "sub" ? "Subtitles" : "Dub"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="px-4 pb-4 text-[11px] leading-relaxed text-zinc-600 md:px-5 md:pb-5">
        Episode completion is saved to local storage when the provider reports 90% or ended playback. A lightweight local session estimate keeps progress useful even when the provider does not send playback events. Captions and audio tracks remain controlled by the online provider.
      </p>
    </section>
  )
}
