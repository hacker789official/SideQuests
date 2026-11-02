"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MovieWithMediaType, TvShowWithMediaType } from "@/tmdb/models"
import { X } from "lucide-react"

import {
  getLocalWatchData,
  removeLocalWatchHistory,
} from "@/lib/local-watch-data"
import { MovieCard } from "@/components/movie-card"
import { TvCard } from "@/components/tv-card"

import { ConfirmationDialog } from "./confirmation-dialog"

type HistoryItem = MovieWithMediaType | TvShowWithMediaType

interface HistoryCardWrapperProps {
  item: HistoryItem
}

interface WatchProgress {
  season: number
  episode: number
  lastWatched: number
}

export const HistoryCardWrapper: React.FC<HistoryCardWrapperProps> = ({
  item,
}) => {
  const router = useRouter()
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("skipWatchHistoryConfirmation") === "true"
    }
    return false
  })

  useEffect(() => {
    try {
      const watchData = getLocalWatchData()
      const storageKey =
        item.media_type === "tv" ? `tv_${item.id}` : `movie_${item.id}`
      const savedProgress = watchData.watchProgress?.[storageKey]
      if (savedProgress) {
        setWatchProgress(JSON.parse(savedProgress) as WatchProgress)
      }
    } catch (error) {
      console.error("Error getting local watch progress:", error)
    }
  }, [item.id, item.media_type])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const path =
      item.media_type === "tv"
        ? `/tv/${item.id}?from=history&autoplay=true`
        : `/movie/${item.id}?from=history&autoplay=true`

    router.push(path)
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (skipConfirmation) {
      await removeItem()
    } else {
      setIsConfirmOpen(true)
    }
  }

  const removeItem = async () => {
    try {
      removeLocalWatchHistory(item.id, item.media_type)
    } catch (error) {
      console.error("Error removing item from watch history:", error)
    }
  }

  const handleDontAskAgainChange = (dontAskAgain: boolean) => {
    setSkipConfirmation(dontAskAgain)
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "skipWatchHistoryConfirmation",
        dontAskAgain.toString()
      )
    }
  }

  return (
    <div className="relative cursor-pointer">
      
      <button
        onClick={handleRemove}
        className="absolute left-2 top-2 z-20 rounded-full bg-background/80 p-1 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        aria-label="Remove from watch history"
      >
        <X className="size-4" />
      </button>

      {item.media_type === "tv" && watchProgress && (
        <div className="absolute right-2 top-2 z-20 rounded-md bg-primary/80 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
          S{watchProgress.season} E{watchProgress.episode}
        </div>
      )}

      <div onClick={handleClick}>
        {item.media_type === "tv" ? (
          <TvCard key={item.id} {...item} />
        ) : (
          <MovieCard key={item.id} {...item} />
        )}
      </div>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Remove from Watch History"
        description={`Are you sure you want to remove "${
          item.media_type === "tv" ? item.name : item.title
        }" from your watch history? This will also remove your watch progress.`}
        onConfirm={removeItem}
        confirmText="Remove"
        cancelText="Cancel"
        showDontAskAgain={true}
        onDontAskAgainChange={handleDontAskAgainChange}
      />
    </div>
  )
}
