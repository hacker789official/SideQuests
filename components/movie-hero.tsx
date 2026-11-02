"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Movie } from "@/tmdb/models"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"

import { getRandomItems } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaBackdrop } from "@/components/media-backdrop"

interface MovieHeroProps {
  movies: Movie[]
  label: string
  count?: number
  still?: boolean
  fullBleed?: boolean
}

export const MovieHero: React.FC<MovieHeroProps> = ({
  movies,
  label,
  count = 5, 
  still = false,
  fullBleed = false,
}) => {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [items, setItems] = useState<Movie[]>([])

  useEffect(() => {
    
    const finalCount = still ? 1 : count
    const selectedItems = getRandomItems(movies, Math.min(finalCount, movies.length))
    setItems(selectedItems)
    setMounted(true)
  }, [movies, count, still])

  useEffect(() => {
    if (items.length <= 1 || still) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [items.length, still])

  if (!mounted || items.length === 0) {
    return (
      <Skeleton
        className={cn(
          "relative w-full",
          fullBleed ? "h-[72vh] min-h-[520px] -mt-4" : "h-hero rounded-md"
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#040404] group",
        fullBleed ? "h-[72vh] min-h-[520px] -mt-4 border-b border-zinc-900/50" : "h-hero rounded-md border border-zinc-800"
      )}
    >
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
            
            <MediaBackdrop image={item.backdrop_path} alt={item.title} className="absolute inset-0" />

            {fullBleed && (
              <div className="absolute inset-0 bg-vignette-bottom pointer-events-none" />
            )}


            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-transparent md:bg-gradient-to-r md:from-background/95 md:via-background/30 md:to-transparent flex items-end">
              <div className={cn("w-full", fullBleed && "container")}>
                <div
                  className={cn(
                    "space-y-4 text-left w-full",
                    fullBleed ? "max-w-2xl md:max-w-4xl lg:max-w-5xl pt-24 pb-16 md:pt-36 md:pb-24 px-6 md:px-0" : "max-w-xl md:max-w-3xl p-6 pb-12 md:p-16"
                  )}
                >

                  <div className={cn(
                    "flex items-center gap-2 font-bold uppercase tracking-[0.28em] text-primary",
                    fullBleed ? "text-sm md:text-base" : "text-sm"
                  )}>
                    <span className={cn(
                      "font-black border-2 border-primary rounded-sm leading-none flex items-center justify-center",
                      fullBleed ? "text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1" : "text-xs px-1.5 py-0.5"
                    )}>W</span>
                    <span>{label}</span>
                  </div>

                  <h1 className={cn(
                    "line-clamp-2 font-black leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent",
                    fullBleed ? "text-5xl md:text-7xl lg:text-8xl" : "text-4xl md:text-6xl"
                  )}>
                    {item.title}
                  </h1>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "bg-primary text-primary-foreground font-extrabold rounded-sm uppercase tracking-[0.16em] shadow-[0_0_24px_hsl(var(--primary)/0.28)]",
                      fullBleed ? "text-xs px-2 py-0.5 md:text-sm md:px-2.5 md:py-1" : "text-[10px] px-1.5 py-0.5"
                    )}>Top 10</span>
                    <span className={cn(
                      "font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]",
                      fullBleed ? "text-base md:text-lg lg:text-xl" : "text-sm md:text-base"
                    )}>
                      #{(index + 1) % 10 + 1} in Movies Today
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300/90">
                    <span>{item.release_date?.slice(0, 4) || "Now showing"}</span>
                    <span className="size-1 rounded-full bg-primary" />
                    <span>{item.vote_average ? `${item.vote_average.toFixed(1)} rating` : "Highly rated"}</span>
                    <span className="size-1 rounded-full bg-white/40" />
                    <span>HD</span>
                  </div>

                  <p className={cn(
                    "line-clamp-3 text-zinc-200/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] leading-relaxed",
                    fullBleed ? "text-base md:text-lg lg:text-xl max-w-2xl md:max-w-3xl lg:max-w-4xl" : "text-sm md:text-base max-w-xl md:max-w-2xl"
                  )}>
                    {item.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/movie/${item.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md bg-white font-extrabold text-black shadow-[0_12px_35px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 active:scale-[0.98]",
                        fullBleed ? "px-8 py-3 text-base md:px-10 md:py-4 md:text-lg" : "px-6 py-2.5 text-sm md:px-8 md:py-3 md:text-base"
                      )}
                      prefetch={false}
                    >
                      <Play className={cn("fill-black text-black", fullBleed ? "size-5 md:size-6" : "size-4 md:size-5")} /> Play
                    </Link>
                    <Link
                      href={`/movie/${item.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md border border-white/20 bg-white/15 font-bold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-[0.98]",
                        fullBleed ? "px-7 py-3 text-base md:px-9 md:py-4 md:text-lg" : "px-5 py-2.5 text-sm md:px-7 md:py-3 md:text-base"
                      )}
                      prefetch={false}
                    >
                      <Info className={cn(fullBleed ? "size-5 md:size-6" : "size-4 md:size-5")} /> More Info
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      })}

      {items.length > 1 && !still && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6 text-white/80" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="size-6 text-white/80" />
          </button>
        </>
      )}

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
