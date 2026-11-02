"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TvShow } from "@/tmdb/models"
import { Info, Play } from "lucide-react"

import { getRandomItems } from "@/lib/utils"
import { cn } from "@/lib/utils"
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
    const selectedItems = getRandomItems(tvShows, Math.min(finalCount, tvShows.length))
    setItems(selectedItems)
    setMounted(true)
  }, [tvShows, count, still])

  useEffect(() => {
    if (items.length <= 1 || still) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [items.length, still])

  if (!mounted || items.length === 0) {
    return <Skeleton className="h-hero relative w-full rounded-md" />
  }

  return (
    <div className="h-hero relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#040404] shadow-2xl shadow-black/30">
      {items.map((item, index) => {
        const isActive = index === activeIndex
        return (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            )}
            key={item.id}
          >
            
            <MediaBackdrop image={item.backdrop_path} alt={item.name} className="absolute inset-0" />

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent md:bg-gradient-to-r md:from-zinc-950/95 md:via-zinc-950/30 md:to-transparent flex items-end md:items-center">
              <div className="max-w-xl md:max-w-3xl space-y-4 p-6 pb-12 md:p-16 text-left w-full">

                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.28em] text-primary">
                  <span className="text-xs font-black border-2 border-primary px-1.5 py-0.5 rounded-sm leading-none flex items-center justify-center">W</span>
                  <span>{label}</span>
                </div>

                <h1 className="line-clamp-2 text-4xl font-black leading-none tracking-tight md:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  {item.name}
                </h1>

                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.28)]">Top 10</span>
                  <span className="text-sm font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] md:text-base">
                    #{(index + 1) % 10 + 1} in TV Shows Today
                  </span>
                </div>

                <p className="line-clamp-3 text-sm text-zinc-200 md:text-base max-w-xl md:max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {item.overview}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/tv/${item.id}`}
                    className="flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-extrabold text-black shadow-[0_12px_35px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 active:scale-[0.98] md:px-8 md:py-3 md:text-base"
                    prefetch={false}
                  >
                    <Play className="size-4 md:size-5 fill-black text-black" /> Play
                  </Link>
                  <Link
                    href={`/tv/${item.id}`}
                    className="flex items-center gap-2 rounded-md border border-white/20 bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-[0.98] md:px-7 md:py-3 md:text-base"
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
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex ? "bg-white w-6" : "bg-white/40 w-1.5 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
