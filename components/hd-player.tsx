"use client"

import { useEffect, useRef, useState } from "react"
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
  PictureInPicture,
} from "lucide-react"

import { cn } from "@/lib/utils"

export interface HdPlayerSource {
  src: string
  /** "hls" for adaptive .m3u8 streams, "mp4" for direct progressive files */
  type: "hls" | "mp4"
  /** Optional label shown in the quality menu, e.g. "1080p", "Auto" */
  label?: string
}

interface HdPlayerProps {
  sources: HdPlayerSource[]
  poster?: string
  title?: string
  autoPlay?: boolean
  startTime?: number
  onTimeUpdate?: (seconds: number) => void
  onEnded?: () => void
  className?: string
}

function readDataSaverPreference(): boolean {
  try {
    const settings = JSON.parse(localStorage.getItem("sidequests-accessibility") || "{}") as { dataSaver?: boolean }
    return settings.dataSaver === true
  } catch {
    return false
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m)
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function HdPlayer({
  sources,
  poster,
  title,
  autoPlay = false,
  startTime = 0,
  onTimeUpdate,
  onEnded,
  className,
}: HdPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<import("hls.js").default | null>(null)
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [dataSaver, setDataSaver] = useState(false)

  const activeSource = sources[activeSourceIndex]

  useEffect(() => {
    setDataSaver(readDataSaverPreference())
  }, [])

  // Load / attach the source (HLS via hls.js, or native for mp4 / Safari HLS)
  useEffect(() => {
    const savedSource = localStorage.getItem("sidequests_hd_quality")
    if (savedSource) {
      const savedIndex = sources.findIndex((source) => source.src === savedSource || source.label === savedSource)
      if (savedIndex >= 0) setActiveSourceIndex(savedIndex)
    }
    // Apply the remembered quality only when this source list is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeSource) return

    setLoading(true)
    setErrored(false)

    let cancelled = false

    const attach = async () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      if (activeSource.type === "hls") {
        const canPlayNativeHls = video.canPlayType("application/vnd.apple.mpegurl")

        if (canPlayNativeHls) {
          video.src = activeSource.src
        } else {
          const { default: Hls } = await import("hls.js")
          if (cancelled) return

          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true })
            hlsRef.current = hls
            hls.loadSource(activeSource.src)
            hls.attachMedia(video)
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal) setErrored(true)
            })
          } else {
            setErrored(true)
          }
        }
      } else {
        video.src = activeSource.src
      }

      if (startTime > 0) {
        video.currentTime = startTime
      }
      if (autoPlay && !dataSaver) {
        video.play().catch(() => {
          /* autoplay blocked, user will press play */
        })
      }
    }

    attach()

    return () => {
      cancelled = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSource?.src, dataSaver])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setLoading(false)
    }
    const onTimeUpdateHandler = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onVolumeChange = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    const onEndedHandler = () => onEnded?.()
    const onErrorHandler = () => setErrored(true)

    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("timeupdate", onTimeUpdateHandler)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("playing", onPlaying)
    video.addEventListener("volumechange", onVolumeChange)
    video.addEventListener("ended", onEndedHandler)
    video.addEventListener("error", onErrorHandler)

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("timeupdate", onTimeUpdateHandler)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("volumechange", onVolumeChange)
      video.removeEventListener("ended", onEndedHandler)
      video.removeEventListener("error", onErrorHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches("input, select, textarea, button")) return
      const video = videoRef.current
      if (!video) return
      if (event.key === " ") {
        event.preventDefault()
        if (video.paused) video.play().catch(() => {})
        else video.pause()
      } else if (event.key === "ArrowLeft") {
        video.currentTime = Math.max(0, video.currentTime - 10)
      } else if (event.key === "ArrowRight") {
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10)
      } else if (event.key.toLowerCase() === "m") {
        video.muted = !video.muted
      } else if (event.key.toLowerCase() === "f") {
        const container = containerRef.current
        if (container) {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
          else container.requestFullscreen().catch(() => {})
        }
      } else if (event.key.toLowerCase() === "p" && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {})
        else video.requestPictureInPicture().catch(() => {})
      }
      setShowControls(true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = value
    video.muted = value === 0
  }

  const handleSeek = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      container.requestFullscreen().catch(() => {})
    }
  }

  const togglePictureInPicture = () => {
    const video = videoRef.current
    if (!video || !document.pictureInPictureEnabled) return
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {})
    else video.requestPictureInPicture().catch(() => {})
  }

  const wakeControls = () => {
    setShowControls(true)
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    hideControlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }

  const switchQuality = (index: number) => {
    const video = videoRef.current
    const resumeAt = video?.currentTime ?? 0
    const wasPlaying = playing
    setActiveSourceIndex(index)
    localStorage.setItem("sidequests_hd_quality", sources[index]?.src || sources[index]?.label || "")
    setShowQualityMenu(false)

    // Resume where the user left off after the source swap settles.
    const resume = () => {
      const v = videoRef.current
      if (!v) return
      v.currentTime = resumeAt
      if (wasPlaying) v.play().catch(() => {})
      v.removeEventListener("loadedmetadata", resume)
    }
    video?.addEventListener("loadedmetadata", resume)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={wakeControls}
      onMouseLeave={() => playing && setShowControls(false)}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg bg-black aspect-video select-none theme-cyberpunk",
        className
      )}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="size-full object-contain"
        playsInline
        preload={dataSaver ? "metadata" : "auto"}
        onClick={togglePlay}
      />

      {loading && !errored && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="size-10 animate-spin text-primary cp-glow-cyan" />
        </div>
      )}

      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            This video couldn&apos;t be played.
          </p>
          <p className="text-xs text-muted-foreground">
            Try a different quality, or check back later.
          </p>
        </div>
      )}

      {!loading && !playing && !errored && (
        <button
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
        >
          <span className="grid size-16 place-items-center rounded-full border border-primary/60 bg-black/60 backdrop-blur-sm cp-border-glow">
            <Play className="ml-1 size-7 text-primary" fill="currentColor" />
          </span>
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300",
          showControls || !playing ? "opacity-100" : "opacity-0"
        )}
      >
        {title && (
          <p className="mb-1 line-clamp-1 text-xs font-semibold text-white/90 md:text-sm">
            {title}
          </p>
        )}

        {/* Seek bar */}
        <div className="group/seek relative flex h-3 items-center">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="absolute inset-y-0 left-0 bg-white/30"
              style={{ width: duration ? `${(buffered / duration) * 100}%` : "0%" }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-primary cp-glow-cyan"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? (
                <Pause className="size-5 text-white" fill="currentColor" />
              ) : (
                <Play className="size-5 text-white" fill="currentColor" />
              )}
            </button>

            <div className="group/volume flex items-center gap-1.5">
              <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                {muted || volume === 0 ? (
                  <VolumeX className="size-5 text-white" />
                ) : (
                  <Volume2 className="size-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-0 accent-primary opacity-0 transition-all duration-200 group-hover/volume:w-16 group-hover/volume:opacity-100"
                aria-label="Volume"
              />
            </div>

            <span className="text-[11px] font-medium text-white/80 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {sources.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu((v) => !v)}
                  aria-label="Quality settings"
                  className="flex items-center gap-1 text-[11px] font-medium text-white/80 hover:text-primary"
                >
                  <Settings className="size-4" />
                  {activeSource?.label ?? "Auto"}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-7 right-0 min-w-28 overflow-hidden rounded-md border border-primary/30 bg-black/95 py-1 cp-border-glow">
                    {sources.map((source, index) => (
                      <button
                        key={source.src}
                        onClick={() => switchQuality(index)}
                        className={cn(
                          "block w-full px-3 py-1.5 text-left text-xs hover:bg-primary/10",
                          index === activeSourceIndex
                            ? "text-primary cp-glow-cyan"
                            : "text-white/80"
                        )}
                      >
                        {source.label ?? source.type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {typeof document !== "undefined" && document.pictureInPictureEnabled && (
              <button onClick={togglePictureInPicture} aria-label="Picture in picture">
                <PictureInPicture className="size-5 text-white" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              data-tour="fullscreen-control"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="size-5 text-white" />
              ) : (
                <Maximize className="size-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
