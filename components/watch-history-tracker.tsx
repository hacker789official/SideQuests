"use client"

import { useEffect } from "react"

import { getLocalWatchData, saveLocalWatchData } from "@/lib/local-watch-data"

interface WatchHistoryTrackerProps {
  id: string
  mediaType: "movie" | "tv"
  data: any
}

const parseHistory = (value: string): any[] => {
  try {
    const parsed = JSON.parse(value || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const WatchHistoryTracker: React.FC<WatchHistoryTrackerProps> = ({
  id,
  mediaType,
  data,
}) => {
  useEffect(() => {
    const updateHistory = () => {
      try {
        const watchData = getLocalWatchData()
        if (watchData.watchHistoryEnabled === "false") return

        const mediaId = Number.parseInt(id, 10)
        if (!Number.isFinite(mediaId)) return

        const historyItem = {
          ...data,
          id: mediaId,
          media_type: mediaType,
          lastWatched: Date.now(),
        }
        const historyKey = `${mediaType}_${mediaId}`
        const history = parseHistory(watchData.watchHistory)
        const updatedHistory = [
          historyItem,
          ...history.filter((item) => {
            const itemType = item.media_type || item.mediaType || "movie"
            return `${itemType}_${item.id}` !== historyKey
          }),
        ].slice(0, 20)

        const deletedItems = { ...(watchData.deletedItems || {}) }
        delete deletedItems[`history_${mediaType}_${mediaId}`]

        saveLocalWatchData({
          ...watchData,
          watchHistory: JSON.stringify(updatedHistory),
          deletedItems,
          updated_at: new Date().toISOString(),
        })

        window.dispatchEvent(
          new CustomEvent("WATCH_DATA_UPDATED", {
            detail: { hasNewHistory: true, localChange: true },
          })
        )
      } catch (error) {
        console.error("Error updating local watch history:", error)
      }
    }

    updateHistory()
  }, [id, mediaType, data])

  return null
}

