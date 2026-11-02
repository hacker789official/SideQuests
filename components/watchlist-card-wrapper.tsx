"use client"

import React, { useState } from "react"
import { X } from "lucide-react"

import { removeFromWatchlist } from "@/lib/watch-data"
import { MovieCard } from "@/components/movie-card"
import { TvCard } from "@/components/tv-card"

import { ConfirmationDialog } from "./confirmation-dialog"

interface WatchlistItem {
  id: number
  title?: string | null
  name?: string | null
  poster_path: string | null | undefined
  vote_average: number
  vote_count?: number
  media_type: "movie" | "tv"
  release_date?: string | null
  first_air_date?: string | null
}

interface WatchlistCardWrapperProps {
  item: WatchlistItem
  onRemoveSuccess?: () => void
}

export const WatchlistCardWrapper: React.FC<WatchlistCardWrapperProps> = ({
  item,
  onRemoveSuccess,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("skipWatchlistConfirmation") === "true"
    }
    return false
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (skipConfirmation) {
      removeItem()
    } else {
      setIsConfirmOpen(true)
    }
  }

  const removeItem = async () => {
    try {
      const success = await removeFromWatchlist(item.id, item.media_type)
      if (success && onRemoveSuccess) {
        onRemoveSuccess()
      }
    } catch (error) {
      console.error("Error removing item from watchlist:", error)
    }
  }

  const handleDontAskAgainChange = (dontAskAgain: boolean) => {
    setSkipConfirmation(dontAskAgain)
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "skipWatchlistConfirmation",
        dontAskAgain.toString()
      )
    }
  }

  const movieProps = {
    id: item.id,
    poster_path: item.poster_path,
    title: item.title || item.name || "",
    vote_average: item.vote_average,
    vote_count: item.vote_count || 0,
    release_date: item.release_date || undefined,
  }

  const tvProps = {
    id: item.id,
    poster_path: item.poster_path,
    name: item.name || item.title || "",
    vote_average: item.vote_average,
    vote_count: item.vote_count || 0,
    first_air_date: item.first_air_date || undefined,
  }

  return (
    <div className="relative">
      
      <button
        onClick={handleRemove}
        className="absolute left-2 top-2 z-20 rounded-full bg-background/80 p-1 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        aria-label="Remove from watchlist"
      >
        <X className="size-4" />
      </button>

      <div>
        {item.media_type === "tv" ? (
          <TvCard key={item.id} {...tvProps as any} />
        ) : (
          <MovieCard key={item.id} {...movieProps as any} />
        )}
      </div>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Remove from Watchlist"
        description={`Are you sure you want to remove "${
          item.media_type === "tv" ? item.name || item.title : item.title || item.name
        }" from your watchlist?`}
        onConfirm={removeItem}
        confirmText="Remove"
        cancelText="Cancel"
        showDontAskAgain={true}
        onDontAskAgainChange={handleDontAskAgainChange}
      />
    </div>
  )
}
