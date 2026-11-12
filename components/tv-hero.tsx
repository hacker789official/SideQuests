"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TvShow } from "@/tmdb/models"
import { Info, Play, Zap } from "lucide-react"

import { cn, getRandomItems } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaBackdrop } from "@/components/media-backdrop"

interface TvHeroProps {
  tvShows: TvShow[]
  label: string
  count?: number
  still?: boolean
}

export const TvHero: React.FC<TvHeroProps> = ({
  tvShows,
  label,
  count = 5,
  still = false,
}) => {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [items, setItems] = useState<TvShow[]>([])

  useEffect(() => {
    const finalCount = still ? 1 : count
    const selectedItems = getRandomItems(
      tvShows,
      Math.min(finalCount, tvShows.length)
    )
    setItems(selectedItems)
    setActiveIndex(0)
    setMounted(true)
  }, [tvShows, count, still])

  useEffect(() => {
    if (
      items.length <= 1 ||
      still ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [items.length, still])

  if (!mounted || items.length === 0) {
    return <Skeleton className="h-hero relative w-full rounded-2xl" />
  }

  return (
    <div className="h-hero group relative w-full overflow-hidden rounded-2xl border border-cyan-100/20 bg-slate-950 shadow-2xl shadow-cyan-950/30">
      {items.map((item, index) => {
        const isActive = index === activeIndex

        return (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              isActive
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            )}
            key={item.id}
            aria-hidden={!isActive}
          >
            <MediaBackdrop
              image={item.backdrop_path}
              alt={item.name}
              className="absolute inset-0"
            />
            <div
              className="sidequests-neon-wash pointer-events-none absolute inset-0"
              aria-hidden="true"
            />

            <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent md:items-center md:bg-gradient-to-r md:from-slate-950/95 md:via-slate-950/35 md:to-transparent">
              <div className="w-full max-w-4xl space-y-4 p-6 pb-12 text-left md:p-16">
                <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-cyan-200">
                  <span className="flex items-center justify-center rounded-lg border border-cyan-200/70 bg-cyan-300/10 px-1.5 py-1 text-cyan-100 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                    <Zap className="size-4 fill-current" />
                  </span>
                  <span>{label}</span>
                </div>

                <h1 className="line-clamp-2 bg-gradient-to-r from-white via-zinc-100 to-cyan-100 bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] md:text-6xl">
                  {item.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-200/90">
                  <span>
                    {item.first_air_date?.slice(0, 4) || "Year unavailable"}
                  </span>
                  <span className="size-1 rounded-full bg-cyan-300" />
                  <span>
                    {item.vote_average
                      ? `${item.vote_average.toFixed(1)} TMDB rating`
                      : "Featured pick"}
                  </span>
                </div>

                <p className="line-clamp-3 max-w-2xl text-sm leading-relaxed text-zinc-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] md:text-base">
                  {item.overview}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/tv/${item.id}?play=true`}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[0_12px_35px_rgba(0,0,0,0.3),0_0_28px_hsl(var(--primary)/0.3)] transition hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] md:px-8 md:py-3 md:text-base"
                    prefetch={false}
                  >
                    <Play className="size-4 fill-current md:size-5" /> Play
                  </Link>
                  <Link
                    href={`/tv/${item.id}`}
                    className="flex items-center gap-2 rounded-xl border border-cyan-100/25 bg-slate-950/45 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:border-cyan-200/50 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] md:px-7 md:py-3 md:text-base"
                    prefetch={false}
                  >
                    <Info className="size-4 md:size-5" /> More Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {items.length > 1 && !still && (
        <div
          className="absolute bottom-6 right-6 z-20 flex gap-2"
          aria-label="Featured TV selections"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                index === activeIndex
                  ? "w-7 bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.65)]"
                  : "w-2 bg-white/45 hover:bg-white/80"
              )}
              aria-label={`Show ${item.name}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {items[activeIndex]?.name}
      </span>
    </div>
  )
}
