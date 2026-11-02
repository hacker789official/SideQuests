"use client"

import React, { useEffect, useState } from "react"
import { Bookmark, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLocalWatchData, saveWatchData } from "@/lib/watch-data"
import { WATCH_DATA_UPDATED } from "@/lib/cloud-account"
import { cn } from "@/lib/utils"

interface WatchlistButtonProps {
  tmdbid: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null | undefined
  voteAverage?: number
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  tmdbid,
  mediaType,
  title,
  posterPath,
  voteAverage = 0,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const checkWatchlist = () => {
    try {
      const localData = getLocalWatchData()
      const watches = localData.watches ? JSON.parse(localData.watches) : []
      const key = `${mediaType}_${tmdbid}`
      
      const exists = watches.some(
        (item: any) =>
          (item.id === tmdbid && (item.media_type === mediaType || item.mediaType === mediaType)) ||
          (`${item.media_type || item.mediaType}_${item.id}` === key)
      )
      setIsInWatchlist(exists)
    } catch (e) {
      console.error("Error checking watchlist:", e)
    }
  }

  useEffect(() => {
    checkWatchlist()

    const handleUpdate = () => {
      checkWatchlist()
    }

    window.addEventListener(WATCH_DATA_UPDATED, handleUpdate)
    return () => {
      window.removeEventListener(WATCH_DATA_UPDATED, handleUpdate)
    }
  }, [tmdbid, mediaType])

  const handleToggle = async () => {
    try {
      setLoading(true)
      const localData = getLocalWatchData()
      let watches = localData.watches ? JSON.parse(localData.watches) : []
      
      const key = `${mediaType}_${tmdbid}`
      const exists = watches.some(
        (item: any) =>
          (item.id === tmdbid && (item.media_type === mediaType || item.mediaType === mediaType)) ||
          (`${item.media_type || item.mediaType}_${item.id}` === key)
      )

      const deletedItems = localData.deletedItems || {}
      const deleteKey = `watchlist_${key}`

      if (exists) {
        
        watches = watches.filter(
          (item: any) =>
            !(
              (item.id === tmdbid && (item.media_type === mediaType || item.mediaType === mediaType)) ||
              (`${item.media_type || item.mediaType}_${item.id}` === key)
            )
        )
        
        deletedItems[deleteKey] = Date.now()
      } else {
        
        const newItem = {
          id: tmdbid,
          title: mediaType === "movie" ? title : null,
          name: mediaType === "tv" ? title : null,
          poster_path: posterPath,
          vote_average: voteAverage,
          media_type: mediaType,
          addedAt: Date.now(),
        }
        watches.push(newItem)

        if (deletedItems[deleteKey]) {
          delete deletedItems[deleteKey]
        }
      }

      await saveWatchData({
        ...localData,
        watches: JSON.stringify(watches),
        deletedItems,
      })

      window.dispatchEvent(
        new CustomEvent(WATCH_DATA_UPDATED, {
          detail: {
            hasNewWatches: true,
            localChange: true,
          },
        })
      )

      setIsInWatchlist(!exists)
    } catch (error) {
      console.error("Error updating watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isInWatchlist ? "secondary" : "outline"}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "group relative flex items-center gap-2 transition-all duration-300 min-w-[150px] font-medium rounded-full",
        isInWatchlist
          ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-destructive/20 hover:text-destructive hover:border-destructive"
          : "hover:border-primary hover:bg-primary/10 hover:text-primary"
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isInWatchlist ? (
        <>
          <Check className="size-4 transition-transform group-hover:scale-0 duration-200 group-hover:hidden" />
          <Bookmark className="size-4 hidden group-hover:block text-destructive" />
          <span className="group-hover:hidden">In Watchlist</span>
          <span className="hidden group-hover:inline">Remove</span>
        </>
      ) : (
        <>
          <Bookmark className="size-4 transition-transform group-hover:scale-110 duration-200" />
          <span>Add to Watchlist</span>
        </>
      )}
    </Button>
  )
}
