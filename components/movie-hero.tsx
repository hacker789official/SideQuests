"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Movie } from "@/tmdb/models"
import { ChevronLeft, ChevronRight, Info, Play, Zap } from "lucide-react"

import { cn, getRandomItems } from "@/lib/utils"
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
    const selectedItems = getRandomItems(
      movies,
      Math.min(finalCount, movies.length)
    )
    setItems(selectedItems)
    setMounted(true)
  }, [movies, count, still])

  useEffect(() => {
    if (
      items.length <= 1 ||
      still ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
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
          fullBleed ? "-mt-4 h-[72vh] min-h-[520px]" : "h-hero rounded-md"
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden bg-[#040404]",
        fullBleed
          ? "-mt-4 h-[72vh] min-h-[520px] border-b border-zinc-900/50"
          : "h-hero rounded-md border border-zinc-800"
      )}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex
        return (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              isActive
                ? "pointer-events-auto z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            )}
            key={item.id}
          >
            <MediaBackdrop
              image={item.backdrop_path}
              alt={item.title}
              className="absolute inset-0"
            />

            <div
              className="sidequests-neon-wash pointer-events-none absolute inset-0"
              aria-hidden="true"
            />

            {fullBleed && (
              <div className="bg-vignette-bottom pointer-events-none absolute inset-0" />
            )}

            <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-background via-background/40 to-transparent md:bg-gradient-to-r md:from-background/95 md:via-background/30 md:to-transparent">
              <div className={cn("w-full", fullBleed && "container")}>
                <div
                  className={cn(
                    "w-full space-y-4 text-left",
                    fullBleed
                      ? "max-w-2xl px-6 pb-16 pt-24 md:max-w-4xl md:px-0 md:pb-24 md:pt-36 lg:max-w-5xl"
                      : "max-w-xl p-6 pb-12 md:max-w-3xl md:p-16"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 font-bold uppercase tracking-[0.28em] text-primary",
                      fullBleed ? "text-sm md:text-base" : "text-sm"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-lg border border-primary/70 bg-cyan-300/10 font-black leading-none shadow-[0_0_20px_hsl(var(--primary)/0.32)]",
                        fullBleed
                          ? "px-1.5 py-0.5 text-xs md:px-2 md:py-1 md:text-sm"
                          : "px-1.5 py-0.5 text-xs"
                      )}
                    >
                      <Zap className="size-3.5 fill-current md:size-4" />
                    </span>
                    <span>{label}</span>
                  </div>

                  <h1
                    className={cn(
                      "line-clamp-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text font-black leading-none tracking-tight text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
                      fullBleed
                        ? "text-5xl md:text-7xl lg:text-8xl"
                        : "text-4xl md:text-6xl"
                    )}
                  >
                    {item.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300/90">
                    <span>
                      {item.release_date?.slice(0, 4) || "Year unavailable"}
                    </span>
                    <span className="size-1 rounded-full bg-primary" />
                    <span>
                      {item.vote_average
                        ? `${item.vote_average.toFixed(1)} TMDB rating`
                        : "Featured pick"}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "line-clamp-3 leading-relaxed text-zinc-200/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]",
                      fullBleed
                        ? "max-w-2xl text-base md:max-w-3xl md:text-lg lg:max-w-4xl lg:text-xl"
                        : "max-w-xl text-sm md:max-w-2xl md:text-base"
                    )}
                  >
                    {item.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/movie/${item.id}?play=true`}
                      className={cn(
                        "flex items-center gap-2 rounded-xl bg-primary font-extrabold text-primary-foreground shadow-[0_12px_35px_rgba(0,0,0,0.3),0_0_28px_hsl(var(--primary)/0.3)] transition hover:-translate-y-0.5 hover:bg-cyan-200 active:translate-y-0 active:scale-[0.98]",
                        fullBleed
                          ? "px-8 py-3 text-base md:px-10 md:py-4 md:text-lg"
                          : "px-6 py-2.5 text-sm md:px-8 md:py-3 md:text-base"
                      )}
                      prefetch={false}
                    >
                      <Play
                        className={cn(
                          "fill-current text-current",
                          fullBleed ? "size-5 md:size-6" : "size-4 md:size-5"
                        )}
                      />{" "}
                      Play
                    </Link>
                    <Link
                      href={`/movie/${item.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border border-cyan-100/25 bg-slate-950/45 font-bold text-white backdrop-blur-md transition hover:border-cyan-200/50 hover:bg-cyan-300/10 active:scale-[0.98]",
                        fullBleed
                          ? "px-7 py-3 text-base md:px-9 md:py-4 md:text-lg"
                          : "px-5 py-2.5 text-sm md:px-7 md:py-3 md:text-base"
                      )}
                      prefetch={false}
                    >
                      <Info
                        className={cn(
                          fullBleed ? "size-5 md:size-6" : "size-4 md:size-5"
                        )}
                      />{" "}
                      More Info
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
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
            }
            className="md:group-hover:opacity-100 absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-cyan-100/20 bg-slate-950/50 text-white opacity-100 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-cyan-100/55 hover:bg-slate-950/80 active:scale-95 md:opacity-0 md:focus-visible:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6 text-white/80" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
            className="md:group-hover:opacity-100 absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-cyan-100/20 bg-slate-950/50 text-white opacity-100 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-cyan-100/55 hover:bg-slate-950/80 active:scale-95 md:opacity-0 md:focus-visible:opacity-100"
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
                index === activeIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
