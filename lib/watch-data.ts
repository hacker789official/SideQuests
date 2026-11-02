import {
  retrieveFromAccountCloud,
  syncToAccountCloud,
  type WatchData,
  WATCH_DATA_UPDATED,
  mergeWatchData,
} from "./cloud-account"
import { getSyncCredentials, setSyncCredentials } from "./sync-config"
import { getLocalWatchData as getMediaProgressWatchData } from "./local-watch-data"

export const getLocalWatchData = (): WatchData => {
  if (typeof window === "undefined") {
    return {
      watchHistory: "[]",
      watchHistoryEnabled: "true",
      watches: "[]",
      watchProgress: {},
      updated_at: new Date().toISOString(),
      deletedItems: {},
    }
  }

  const history = localStorage.getItem("watchHistory")
  const enabled = localStorage.getItem("watchHistoryEnabled")
  const watches = localStorage.getItem("watches")
  const progress = localStorage.getItem("watchProgress")
  const deleted = localStorage.getItem("deletedItems")
  const updatedAt = localStorage.getItem("syncUpdatedAt") || new Date().toISOString()
  const mediaProgress = getMediaProgressWatchData().watchProgress
  const baseProgress = progress ? JSON.parse(progress) : {}

  return {
    watchHistory: history || "[]",
    watchHistoryEnabled: enabled || "true",
    watches: watches || "[]",
    watchProgress: { ...baseProgress, ...mediaProgress },
    updated_at: updatedAt,
    deletedItems: deleted ? JSON.parse(deleted) : {},
  }
}

export const saveLocalWatchData = (data: WatchData): void => {
  if (typeof window === "undefined") return

  localStorage.setItem("watchHistory", data.watchHistory || "[]")
  localStorage.setItem("watchHistoryEnabled", data.watchHistoryEnabled || "true")
  localStorage.setItem("watches", data.watches || "[]")
  localStorage.setItem("watchProgress", JSON.stringify(data.watchProgress || {}))
  localStorage.setItem("deletedItems", JSON.stringify(data.deletedItems || {}))
  localStorage.setItem("syncUpdatedAt", data.updated_at || new Date().toISOString())
}

export const getWatchHistoryEnabled = (): boolean => {
  if (typeof window === "undefined") return true
  return localStorage.getItem("watchHistoryEnabled") !== "false"
}

export const setWatchHistoryEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("watchHistoryEnabled", enabled.toString())

  window.dispatchEvent(
    new CustomEvent(WATCH_DATA_UPDATED, {
      detail: { hasNewHistory: true, localChange: true },
    })
  )
}

export const getDirectSearchPlayEnabled = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("directSearchPlay") === "true"
}

export const setDirectSearchPlayEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("directSearchPlay", enabled.toString())
}

export const getWatchData = async (forceCloud = false): Promise<WatchData | null> => {
  try {
    
    if (typeof window !== "undefined" && !forceCloud) {
      const local = getLocalWatchData()
      if (
        local.watchHistory !== "[]" ||
        local.watches !== "[]" ||
        Object.keys(local.watchProgress).length > 0
      ) {
        return local
      }
    }

    const credentials = getSyncCredentials()
    if (!credentials) return null

    const { email, pin } = credentials
    const cloudData = await retrieveFromAccountCloud(email, pin)

    if (cloudData && typeof window !== "undefined") {
      saveLocalWatchData(cloudData)
    }

    return cloudData
  } catch (error) {
    console.error("Error getting watch data:", error)
    return null
  }
}

export const saveWatchData = async (data: WatchData): Promise<boolean> => {
  try {
    
    saveLocalWatchData(data)

    const credentials = getSyncCredentials()
    if (credentials) {
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(WATCH_DATA_UPDATED, {
            detail: { localChange: true },
          })
        )
      }
    }
    return true
  } catch (error) {
    console.error("Error saving watch data:", error)
    return false
  }
}

export const removeFromWatchHistory = async (
  itemId: number,
  mediaType: string
): Promise<boolean> => {
  try {
    const watchData = await getWatchData()
    if (!watchData) return false

    const currentHistory = watchData.watchHistory
      ? JSON.parse(watchData.watchHistory)
      : []

    const updatedHistory = currentHistory.filter(
      (item: any) => !(item.id === itemId && item.media_type === mediaType)
    )

    const storageKey = `${mediaType}_${itemId}`
    const updatedWatchProgress = { ...watchData.watchProgress }

    if (updatedWatchProgress[storageKey]) {
      delete updatedWatchProgress[storageKey]
    }

    const deletedItems = watchData.deletedItems || {}
    deletedItems[`history_${mediaType}_${itemId}`] = Date.now()

    const updatedWatchData: WatchData = {
      ...watchData,
      watchHistory: JSON.stringify(updatedHistory),
      watchProgress: updatedWatchProgress,
      deletedItems,
    }

    const success = await saveWatchData(updatedWatchData)

    if (success && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(WATCH_DATA_UPDATED, {
          detail: {
            hasNewHistory: true,
            hasNewWatches: true,
            localChange: true,
          },
        })
      )
    }

    return success
  } catch (error) {
    console.error("Error removing item from watch history:", error)
    return false
  }
}

export const removeFromWatchlist = async (
  itemId: number,
  mediaType: string
): Promise<boolean> => {
  try {
    const watchData = await getWatchData()
    if (!watchData) return false

    const currentWatches = watchData.watches
      ? JSON.parse(watchData.watches)
      : []

    const key = `${mediaType}_${itemId}`
    
    const updatedWatches = currentWatches.filter(
      (item: any) =>
        !(
          (item.id === itemId && (item.media_type === mediaType || item.mediaType === mediaType)) ||
          (`${item.media_type || item.mediaType}_${item.id}` === key)
        )
    )

    const deletedItems = watchData.deletedItems || {}
    const deleteKey = `watchlist_${key}`
    deletedItems[deleteKey] = Date.now()

    const updatedWatchData: WatchData = {
      ...watchData,
      watches: JSON.stringify(updatedWatches),
      deletedItems,
    }

    const success = await saveWatchData(updatedWatchData)

    if (success && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(WATCH_DATA_UPDATED, {
          detail: {
            hasNewWatches: true,
            localChange: true,
          },
        })
      )
    }

    return success
  } catch (error) {
    console.error("Error removing item from watchlist:", error)
    return false
  }
}

export const linkAccount = async (
  email: string,
  pin: string
): Promise<boolean> => {
  try {
    const trimmedEmail = email.toLowerCase().trim()

    const cloudData = await retrieveFromAccountCloud(trimmedEmail, pin)

    const localData = getLocalWatchData()

    let mergedData: WatchData

    if (cloudData) {
      
      mergedData = mergeWatchData(localData, cloudData)
    } else {
      
      mergedData = {
        ...localData,
        updated_at: new Date().toISOString(),
      }
    }

    const success = await syncToAccountCloud(trimmedEmail, pin, mergedData, true)
    if (!success) {
      throw new Error("Failed to upload merged data to cloud")
    }

    setSyncCredentials({ email: trimmedEmail, pin })

    saveLocalWatchData(mergedData)

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(WATCH_DATA_UPDATED, {
          detail: {
            hasNewHistory: true,
            hasNewWatches: true,
            hasProgressUpdate: true,
            profileChanged: false,
          },
        })
      )
    }

    return true
  } catch (error) {
    console.error("Error linking account:", error)
    return false
  }
}

