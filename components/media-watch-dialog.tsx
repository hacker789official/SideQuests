"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronRight,
  ExternalLink,
  Film,
  HelpCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Tv,
} from "lucide-react"

import {
  getLocalWatchData,
  saveLocalTvEpisodeProgress,
  saveLocalWatchData,
} from "@/lib/local-watch-data"
import {
  PLAYER_SOURCES,
  buildPlayerSourceUrl,
  getPlayerSource,
  getPlayerSources,
  type PlayerSourceId,
} from "@/lib/player-sources"
import { getTmdbApiKey } from "@/lib/security/config"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AutoPlayHandler } from "@/components/auto-play-handler"
import { PlayerErrorFallback } from "@/components/player-error-fallback"
import {
  PlayerGuidedTour,
  shouldShowTutorial,
} from "@/components/player-guided-tour"

const WATCH_DATA_UPDATED = "WATCH_DATA_UPDATED"

interface MediaWatchDialogProps {
  tmdbid: number
  mediaType?: "movie" | "tv"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

interface WatchProgress {
  season: number
  episode: number
  lastWatched: number
}

interface SeasonDetails {
  id: number
  season_number: number
  episode_count: number
}

const API_KEY = getTmdbApiKey()

export const MediaWatchDialog: React.FC<MediaWatchDialogProps> = ({
  tmdbid,
  mediaType,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}) => {
  const [src, setSrc] = useState<string>("")
  const [activeSource, setActiveSource] = useState<PlayerSourceId>("vidcore")
  const [availableSources, setAvailableSources] = useState(PLAYER_SOURCES)
  const [season, setSeason] = useState<number>(1)
  const [episode, setEpisode] = useState<number>(1)
  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen
  const [iframeLoading, setIframeLoading] = useState<boolean>(true)
  const [showTutorial, setShowTutorial] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  )
  const [iframeError, setIframeError] = useState<boolean>(false)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [seasonDetails, setSeasonDetails] = useState<Record<number, number>>({})
  const [mediaInfo, setMediaInfo] = useState<{
    title: string
    overview: string
    releaseDate: string
    backdropPath: string
  } | null>(null)
  const dialogTriggerRef = useRef<HTMLButtonElement>(null)
  const isTv = mediaType
    ? mediaType === "tv"
    : typeof window !== "undefined"
    ? window.location.pathname.includes("/tv/")
    : false
  const lastSyncedProgress = useRef({ season: 1, episode: 1 })
  const playerUrl = buildPlayerSourceUrl({
    sourceId: activeSource,
    mediaType: isTv ? "tv" : "movie",
    tmdbId: tmdbid,
    season,
    episode,
    vidLinkOptions: {
      nextbutton: isTv,
    },
  })
  const selectedSource =
    availableSources.find((source) => source.id === activeSource) ||
    getPlayerSource(activeSource)

  useEffect(() => {
    const mediaKind = isTv ? "tv" : "movie"
    const compatibleSources = getPlayerSources(mediaKind)
    setAvailableSources(compatibleSources)
    const storedSource = window.localStorage.getItem(
      `sidequests_player_source_${mediaKind}`
    )
    const storedIsCompatible =
      storedSource &&
      compatibleSources.some((source) => source.id === storedSource)
    setActiveSource(
      storedIsCompatible
        ? (storedSource as PlayerSourceId)
        : compatibleSources[0]?.id || "vidlink"
    )
  }, [isTv])

  const loadWatchProgress = useCallback(async () => {
    try {
      const watchData = getLocalWatchData()

      const storageKey = isTv ? `tv_${tmdbid}` : `movie_${tmdbid}`

      if (watchData.watchProgress && watchData.watchProgress[storageKey]) {
        const savedProgress: WatchProgress = JSON.parse(
          watchData.watchProgress[storageKey]
        )

        if (isTv) {
          setSeason(savedProgress.season)
          setEpisode(savedProgress.episode)
        }

        lastSyncedProgress.current = {
          season: savedProgress.season,
          episode: savedProgress.episode,
        }
      }
    } catch (error) {
      console.error("Error loading watch progress:", error)
    }
  }, [tmdbid, isTv])

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const url = isTv
          ? `/api/tv/${encodeURIComponent(String(tmdbid))}`
          : `https://api.themoviedb.org/3/movie/${tmdbid}?api_key=${API_KEY}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch media details")
        }

        const data = await response.json()
        setMediaInfo({
          title: data.name || data.title || "",
          overview: data.overview || "",
          releaseDate: data.first_air_date || data.release_date || "",
          backdropPath: data.backdrop_path || "",
        })

        if (isTv) {
          const seasons = data.seasons || []
          const seasonMap: Record<number, number> = {}
          seasons.forEach((season: SeasonDetails) => {
            seasonMap[season.season_number] = season.episode_count
          })
          setSeasonDetails(seasonMap)
        }
      } catch (error) {
        console.error("Failed to fetch media details", error)
      }
    }

    if (tmdbid) {
      fetchMediaDetails()
    }
  }, [tmdbid, isTv])

  useEffect(() => {
    loadWatchProgress()

    const handleWatchDataUpdate = (event: CustomEvent) => {
      if (event.detail.hasNewWatches || event.detail.hasProgressUpdate) {
        loadWatchProgress()
      }
    }

    window.addEventListener(
      WATCH_DATA_UPDATED,
      handleWatchDataUpdate as EventListener
    )

    return () => {
      window.removeEventListener(
        WATCH_DATA_UPDATED,
        handleWatchDataUpdate as EventListener
      )
    }
  }, [loadWatchProgress])

  const openDialog = () => {
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false

    fetch(`/api/player-sources?mediaType=${isTv ? "tv" : "movie"}`)
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Source list unavailable"))
      )
      .then((payload) => {
        if (
          !cancelled &&
          Array.isArray(payload.providers) &&
          payload.providers.length > 0
        ) {
          setAvailableSources(payload.providers)
        }
      })
      .catch(() => {
        if (!cancelled)
          setAvailableSources(getPlayerSources(isTv ? "tv" : "movie"))
      })

    return () => {
      cancelled = true
    }
  }, [open, isTv])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaKind = isTv ? "tv" : "movie"
    const storedSource = window.localStorage.getItem(
      `sidequests_player_source_${mediaKind}`
    )
    const validSourceIds: PlayerSourceId[] = [
      "vidcore",
      "vidlink",
      "vidsrc",
      "vidsrc-classic",
      "superembed",
      "vidfast",
      "vidrock",
      "primesrc",
    ]
    if (
      storedSource &&
      validSourceIds.includes(storedSource as PlayerSourceId) &&
      getPlayerSources(mediaKind).some((source) => source.id === storedSource)
    ) {
      setActiveSource(storedSource as PlayerSourceId)
    }
  }, [isTv])

  const handleSourceChange = (sourceId: PlayerSourceId) => {
    setActiveSource(sourceId)
    setIframeError(false)
    setIframeLoading(true)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `sidequests_player_source_${isTv ? "tv" : "movie"}`,
        sourceId
      )
    }
  }

  useEffect(() => {
    if (
      season === lastSyncedProgress.current.season &&
      episode === lastSyncedProgress.current.episode
    ) {
      return
    }

    const saveProgress = async () => {
      try {
        const watchData = getLocalWatchData()

        const storageKey = isTv ? `tv_${tmdbid}` : `movie_${tmdbid}`

        const progress: WatchProgress = {
          season,
          episode,
          lastWatched: Date.now(),
        }

        const updatedWatchData = {
          ...watchData,
          watchProgress: {
            ...watchData.watchProgress,
            [storageKey]: JSON.stringify(progress),
          },
        }

        saveLocalWatchData(updatedWatchData)
        if (isTv) {
          saveLocalTvEpisodeProgress({
            tvId: tmdbid,
            season,
            episode,
            updatedAt: new Date().toISOString(),
          })
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(WATCH_DATA_UPDATED, {
              detail: { hasProgressUpdate: true, localChange: true },
            })
          )
        }

        lastSyncedProgress.current = {
          season,
          episode,
        }
      } catch (error) {
        console.error("Error saving watch progress:", error)
      }
    }

    if (tmdbid) {
      saveProgress()
    }
  }, [season, episode, tmdbid, isTv])

  useEffect(() => {
    if (open) {
      if (shouldShowTutorial()) {
        setShowTutorial(true)
      }
    }
  }, [open])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => {
      setIsOffline(true)
      setIframeError(true)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (isTv) {
        const requestedSeason = Number(params.get("season"))
        const requestedEpisode = Number(params.get("episode"))
        if (
          params.has("season") &&
          Number.isInteger(requestedSeason) &&
          requestedSeason >= 0
        ) {
          setSeason(requestedSeason)
        }
        if (Number.isInteger(requestedEpisode) && requestedEpisode >= 1) {
          setEpisode(requestedEpisode)
        }
      }
      if (params.get("play") === "true") {
        setOpen(true)

        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }, [isTv, setOpen])

  useEffect(() => {
    if (!open) {
      setSrc("")
      setIframeLoading(true)
      setIframeError(false)
      setIsRetrying(false)
      return
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true)
      setIframeError(true)
      setIframeLoading(false)
      return
    }

    setIframeError(false)
    setIframeLoading(true)
    setSrc(playerUrl)
  }, [open, playerUrl])

  const handleRetry = useCallback(async () => {
    if (isRetrying) return
    setIsRetrying(true)

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true)
      setIframeError(true)
      setIsRetrying(false)
      return
    }

    try {
      if (src) {
        const parsed = new URL(src)
        const probeOrigin = `${parsed.protocol}//${parsed.host}`
        const controller = new AbortController()
        const probeTimer = setTimeout(() => controller.abort(), 4000)

        await fetch(probeOrigin, { mode: "no-cors", signal: controller.signal })
        clearTimeout(probeTimer)
      }

      setIframeError(false)
      setIframeLoading(true)
      const currentSrc = src
      setSrc("")
      setTimeout(() => setSrc(currentSrc), 50)
    } catch (err) {
      setIframeError(true)
      setIframeLoading(false)
    } finally {
      setIsRetrying(false)
    }
  }, [src, isRetrying])

  useEffect(() => {
    if (!open) {
      setIframeLoading(true)
      setIframeError(false)
      setIsRetrying(false)
    }
  }, [open])

  const handleEpisodeChange = (newEpisode: number) => {
    setEpisode(newEpisode)
  }

  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason)

    setEpisode(1)
  }

  const handleNextEpisode = () => {
    if (!isTv) return

    const currentSeasonEpisodes = seasonDetails[season] || 0

    if (episode >= currentSeasonEpisodes) {
      if (seasonDetails[season + 1]) {
        handleSeasonChange(season + 1)
      }
    } else {
      handleEpisodeChange(episode + 1)
    }
  }

  const openPlayer = () => {
    window.open(playerUrl, "_blank", "noopener,noreferrer")
  }

  const copyPlayerLink = async () => {
    try {
      await navigator.clipboard.writeText(playerUrl)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      setCopiedLink(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} modal>
        {showTrigger && (
          <DialogTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "group relative flex items-center gap-2 transition-all duration-300 min-w-[120px] font-medium rounded-full hover:border-primary hover:bg-primary/10 hover:text-primary mr-2"
            )}
            ref={dialogTriggerRef}
            onClick={() => setOpen(true)}
          >
            <Play className="size-4 transition-transform group-hover:scale-110 duration-200" />
            <span>Stream</span>
          </DialogTrigger>
        )}

        {tmdbid && src && (
          <DialogContent
            onInteractOutside={(e) => {
              if (showTutorial) {
                e.preventDefault()
              }
            }}
            onPointerDownOutside={(e) => {
              if (showTutorial) {
                e.preventDefault()
              }
            }}
            className={cn(
              "w-full max-w-[1380px] p-0 bg-[#08080a] border-white/10 text-zinc-100 overflow-hidden flex flex-col shrink-0 rounded-2xl max-h-[96vh] md:max-h-[94vh] shadow-2xl shadow-black/70",
              isTv ? "md:max-w-[1380px]" : "md:max-w-[1180px]"
            )}
          >
            <DialogTitle className="sr-only">Watch Video Stream</DialogTitle>
            <DialogDescription className="sr-only">
              Stream player for selected movie or TV show.
            </DialogDescription>

            <div className="relative flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-[#121216] via-[#0b0b0e] to-[#160b0d] px-4 py-3.5 pr-12 sm:px-6">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="hidden size-10 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.12)] sm:grid">
                  {isTv ? (
                    <Tv className="size-5" />
                  ) : (
                    <Film className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400/80">
                    <span>Now streaming</span>
                    <span className="size-1 rounded-full bg-red-400" />
                    <span className="text-zinc-500">
                      {selectedSource.label}
                    </span>
                  </div>
                  <h3 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                    {mediaInfo?.title || "Loading title..."}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                    {mediaInfo?.releaseDate && (
                      <span>{mediaInfo.releaseDate.substring(0, 4)}</span>
                    )}
                    {isTv && (
                      <>
                        <span className="text-zinc-700">/</span>
                        <span className="text-zinc-300">
                          S{season} · E{episode}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                data-tour="guide-button"
                onClick={() => setShowTutorial(true)}
                className="group flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-red-400/30 hover:bg-red-500/10 hover:text-white active:scale-[0.98]"
                title="Open Player Guide & Tips"
              >
                <HelpCircle className="size-4 text-red-400 transition-transform group-hover:rotate-12" />
                <span className="hidden sm:inline">Player guide</span>
              </button>
            </div>

            <div
              className={cn(
                "grid grid-cols-1 w-full flex-1 min-h-0",
                isTv && "md:grid-cols-[1fr,280px] lg:grid-cols-[1fr,320px]"
              )}
            >
              <div className="flex flex-col flex-1 min-h-0">
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/[0.08] bg-black">
                  <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.14),transparent_36%)]" />

                  {!iframeError && !isOffline && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 pb-8 pt-4 sm:px-5">
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 backdrop-blur-md">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        Live connection
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 backdrop-blur-md">
                        HD playback
                      </div>
                    </div>
                  )}

                  {(iframeError || isOffline) && (
                    <PlayerErrorFallback
                      isOffline={isOffline}
                      isRetrying={isRetrying}
                      sourceName={selectedSource.name}
                      onRetry={handleRetry}
                    />
                  )}

                  {iframeLoading && !iframeError && !isOffline && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#050507]">
                      <div className="relative grid size-16 place-items-center rounded-2xl border border-red-400/20 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.14)]">
                        <div className="absolute inset-0 animate-ping rounded-2xl border border-red-400/20" />
                        <Sparkles className="size-6 text-red-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white">
                          Preparing your stream
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Connecting to {selectedSource.label}
                        </p>
                      </div>
                    </div>
                  )}

                  <iframe
                    className={cn(
                      "absolute inset-0 z-10 size-full bg-black transition-opacity duration-300 ease-out",
                      iframeLoading || iframeError || isOffline
                        ? "opacity-0 pointer-events-none hidden"
                        : "opacity-100 pointer-events-auto"
                    )}
                    src={iframeError || isOffline ? "" : src}
                    onLoad={() => {
                      if (loadTimeoutRef.current) {
                        clearTimeout(loadTimeoutRef.current)
                      }
                      setIframeLoading(false)
                    }}
                    title={`${mediaInfo?.title || "Selected title"} — ${
                      selectedSource.label
                    }`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen={true}
                    referrerPolicy="no-referrer"
                    style={{ background: "black", border: "none" }}
                  />
                </div>

                <div
                  data-tour="server-switcher"
                  className="border-b border-white/[0.06] bg-[#0c0c0f]/90 p-4 backdrop-blur-xl sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Playback source
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {selectedSource.label}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-400" />{" "}
                            Ready
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                          {selectedSource.description} ·{" "}
                          {isTv ? `TV · S${season} E${episode}` : "Movie"}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:max-w-3xl">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                          Choose a {isTv ? "TV" : "movie"} server
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          Switch playback source
                        </span>
                      </div>
                      <Select
                        value={activeSource}
                        onValueChange={(value) =>
                          handleSourceChange(value as PlayerSourceId)
                        }
                      >
                        <SelectTrigger className="h-12 w-full rounded-xl border-white/[0.12] bg-[#121216] px-3 text-left text-sm font-semibold text-white focus:border-cyan-300 focus:ring-cyan-300">
                          <SelectValue placeholder="Select a server" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#101014] text-zinc-100">
                          {availableSources.map((source) => (
                            <SelectItem
                              key={source.id}
                              value={source.id}
                              className="py-3 focus:bg-cyan-400/10 focus:text-white"
                            >
                              <span className="mr-2" aria-hidden="true">
                                {source.flag}
                              </span>
                              {source.name} · {source.quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyPlayerLink}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] sm:flex-none"
                      >
                        <span className="size-1.5 rounded-full bg-zinc-500" />
                        {copiedLink ? "Link copied" : "Copy link"}
                      </button>
                      <button
                        onClick={openPlayer}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/30 transition-all hover:bg-red-400 active:scale-[0.98] sm:flex-none"
                      >
                        <ExternalLink className="size-3.5" />
                        Open player
                      </button>
                    </div>
                  </div>

                  {isTv && (
                    <div
                      data-tour="episodes-selector"
                      className="mt-5 flex flex-col gap-4 border-t border-white/[0.06] pt-4 md:hidden"
                    >
                      {(() => {
                        const seasonsList = Object.keys(seasonDetails)
                          .map(Number)
                          .sort((a, b) => a - b)
                        if (seasonsList.length === 0) return null
                        return (
                          <div className="flex w-full flex-col space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                              Season
                            </span>
                            <Select
                              value={String(season)}
                              onValueChange={(val) =>
                                handleSeasonChange(parseInt(val, 10))
                              }
                            >
                              <SelectTrigger className="h-10 border-white/10 bg-white/[0.04] text-zinc-200 focus:border-red-500 focus:ring-red-500">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                              <SelectContent className="border-white/10 bg-zinc-950 text-zinc-200">
                                {seasonsList.map((s) => (
                                  <SelectItem key={s} value={String(s)}>
                                    {s === 0 ? "Specials" : `Season ${s}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      })()}

                      {(() => {
                        const episodeCount = seasonDetails[season] || 1
                        const episodesList = Array.from(
                          { length: episodeCount },
                          (_, i) => i + 1
                        )
                        return (
                          <div className="flex w-full flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                Episodes
                              </span>
                              {episode < episodeCount && (
                                <button
                                  onClick={handleNextEpisode}
                                  className="flex items-center gap-0.5 text-xs font-semibold text-red-400 transition hover:text-red-300"
                                >
                                  Next episode{" "}
                                  <ChevronRight className="size-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              {episodesList.map((ep) => (
                                <button
                                  key={ep}
                                  onClick={() => handleEpisodeChange(ep)}
                                  className={cn(
                                    "min-w-[52px] shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all active:scale-[0.97]",
                                    episode === ep
                                      ? "border-red-400 bg-red-500 text-white shadow-lg shadow-red-950/30"
                                      : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                  )}
                                >
                                  Ep {ep}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {isTv && (
                <div
                  data-tour="episodes-selector"
                  className="hidden min-h-0 h-full w-full flex-col gap-5 border-l border-white/[0.06] bg-[#0b0b0e] p-5 md:flex"
                >
                  {(() => {
                    const seasonsList = Object.keys(seasonDetails)
                      .map(Number)
                      .sort((a, b) => a - b)
                    if (seasonsList.length === 0) return null
                    return (
                      <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Season
                        </span>
                        <Select
                          value={String(season)}
                          onValueChange={(val) =>
                            handleSeasonChange(parseInt(val, 10))
                          }
                        >
                          <SelectTrigger className="h-10 border-white/10 bg-white/[0.04] text-zinc-200 focus:border-red-500 focus:ring-red-500">
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-zinc-950 text-zinc-200">
                            {seasonsList.map((s) => (
                              <SelectItem key={s} value={String(s)}>
                                {s === 0 ? "Specials" : `Season ${s}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })()}

                  {(() => {
                    const episodeCount = seasonDetails[season] || 1
                    const episodesList = Array.from(
                      { length: episodeCount },
                      (_, i) => i + 1
                    )
                    return (
                      <div className="flex-1 flex flex-col space-y-2 overflow-hidden min-h-0">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Episodes
                          </span>
                          {episode < episodeCount && (
                            <button
                              onClick={handleNextEpisode}
                              className="flex items-center gap-0.5 text-xs font-semibold text-red-400 transition hover:text-red-300"
                            >
                              Next Episode <ChevronRight className="size-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                          <div className="grid grid-cols-3 gap-2">
                            {episodesList.map((ep) => (
                              <button
                                key={ep}
                                onClick={() => handleEpisodeChange(ep)}
                                className={cn(
                                  "rounded-lg border py-2.5 text-xs font-semibold text-center transition-all active:scale-[0.97]",
                                  episode === ep
                                    ? "border-red-400 bg-red-500 text-white shadow-lg shadow-red-950/30"
                                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                )}
                              >
                                Ep {ep}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <AutoPlayHandler tmdbid={tmdbid} triggerDialog={openDialog} />

      <PlayerGuidedTour
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        isTv={isTv}
      />
    </>
  )
}
