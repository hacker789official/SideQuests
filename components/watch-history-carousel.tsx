"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { MovieWithMediaType, TvShowWithMediaType } from "@/tmdb/models"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { getLocalWatchData } from "@/lib/local-watch-data"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { HistoryCardWrapper } from "@/components/history-card-wrapper"

interface WatchHistoryCarouselProps {
  title?: string
  link?: string
  mode?: "continue" | "history"
}

type HistoryItem = MovieWithMediaType | TvShowWithMediaType

const deduplicateHistoryItems = (items: HistoryItem[]): HistoryItem[] => {
  const seen = new Map<string, HistoryItem>()

  items.forEach((item) => {
    const mediaType = item.media_type || ("movie" as const)
    const key = `${mediaType}_${item.id}`
    if (!seen.has(key)) {
      seen.set(key, item)
    }
  })

  return Array.from(seen.values())
}


export const WatchHistoryCarousel: React.FC<WatchHistoryCarouselProps> = ({
  title = "Continue Watching",
  link,
  mode = "continue",
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [isHistoryEnabled, setIsHistoryEnabled] = useState<boolean>(true)
  const [api, setApi] = useState<CarouselApi>()
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(0)

  const loadWatchHistory = useCallback(() => {
    try {
      const watchData = getLocalWatchData()
      setIsHistoryEnabled(watchData.watchHistoryEnabled !== "false")

      const history = watchData.watchHistory
        ? JSON.parse(watchData.watchHistory)
        : []
      const uniqueItems = deduplicateHistoryItems(Array.isArray(history) ? history : [])
      const sortedItems = [...uniqueItems].sort((a: any, b: any) => {
        const aTime = a.lastWatched || a.last_watched || a.watchedAt || a.watched_at || 0
        const bTime = b.lastWatched || b.last_watched || b.watchedAt || b.watched_at || 0
        return bTime - aTime
      })

      setHistoryItems(mode === "continue" ? sortedItems.slice(0, 10) : sortedItems)
    } catch (error) {
      console.error("Error loading local watch history:", error)
      setHistoryItems([])
    }
  }, [mode])

  useEffect(() => {
    loadWatchHistory()

    const handleWatchDataUpdated = () => loadWatchHistory()
    window.addEventListener("WATCH_DATA_UPDATED", handleWatchDataUpdated)

    return () => {
      window.removeEventListener("WATCH_DATA_UPDATED", handleWatchDataUpdated)
    }
  }, [loadWatchHistory])

  useEffect(() => {
    if (!api) return

    setTotal(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  function nextSlide() {
    api?.scrollNext()
  }

  function previousSlide() {
    api?.scrollPrev()
  }

  if (!isHistoryEnabled || historyItems.length === 0) {
    return null
  }

  return (
    <section className="relative my-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-[#0b0b0e] to-red-950/10 py-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-red-500/10 blur-3xl" />

      <Carousel className="px-4 sm:px-5" opts={{ dragFree: true }} setApi={setApi}>
        <div className="relative mb-5 flex items-end gap-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400/80">
              {mode === "continue" ? "Your queue" : "Your footprint"}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {mode === "continue" ? "Pick up where your next obsession left off." : "Every title you have explored, kept close."}
            </p>
          </div>

          {link && (
            <Link
              href={link}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "ml-auto rounded-full border-white/10 bg-white/[0.04] text-xs text-zinc-300 hover:bg-white/[0.09] hover:text-white")}
              prefetch={false}
            >
              View all
            </Link>
          )}

          <div className="hidden items-center gap-2 md:flex">
            <p className="mr-1 text-[11px] tabular-nums text-zinc-500">
              <span className="font-bold text-zinc-200">{current}</span>
              <span> / </span>
              <span>{total}</span>
            </p>

            <Button onClick={previousSlide} size="icon" variant="outline" className="size-8 rounded-full border-white/10 bg-white/[0.04] hover:bg-white/[0.1]">
              <ArrowLeft className="size-3.5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button onClick={nextSlide} size="icon" variant="outline" className="size-8 rounded-full border-white/10 bg-white/[0.04] hover:bg-white/[0.1]">
              <ArrowRight className="size-3.5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>

        <CarouselContent>
          {historyItems.map((item) => (
            <CarouselItem
              key={`${item.media_type}_${item.id}`}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <HistoryCardWrapper item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
