import {
  WatchData,
  applyWatchData,
  retrieveFromAccountCloud,
  subscribeToChanges,
  syncToAccountCloud,
  mergeWatchData,
  WATCH_DATA_UPDATED,
} from "./cloud-account"
import { getAutoSyncEnabled, getSyncCredentials } from "./sync-config"
import { getLocalWatchData, saveLocalWatchData } from "./watch-data"

let syncInterval: NodeJS.Timeout | null = null
let unsubscribeRealtime: (() => void) | null = null
let syncTimeout: NodeJS.Timeout | null = null

export const triggerCloudSync = () => {
  const credentials = getSyncCredentials()
  if (!credentials) return

  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  syncTimeout = setTimeout(async () => {
    try {
      const { email, pin } = credentials
      
      const cloudData = await retrieveFromAccountCloud(email, pin)

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

      const success = await syncToAccountCloud(email, pin, mergedData, true)
      if (success) {
        
        saveLocalWatchData(mergedData)

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(WATCH_DATA_UPDATED, {
              detail: {
                hasNewHistory: true,
                hasNewWatches: true,
                hasProgressUpdate: true,
              },
            })
          )
        }
      }
    } catch (error) {
      console.error("Background sync error:", error)
    }
  }, 2000) 
}

if (typeof window !== "undefined") {
  window.addEventListener(WATCH_DATA_UPDATED, (event: any) => {
    if (event.detail && event.detail.localChange) {
      triggerCloudSync()
    }
  })
}

export const startAutoSync = () => {
  if (syncInterval) return 

  const checkForUpdates = async () => {
    try {
      const autoSyncEnabled = getAutoSyncEnabled()
      const credentials = getSyncCredentials()

      if (!autoSyncEnabled || !credentials) return

      const cloudData = await retrieveFromAccountCloud(
        credentials.email,
        credentials.pin
      )
      if (!cloudData) return

      const localData = getLocalWatchData()
      const mergedData = mergeWatchData(localData, cloudData)

      saveLocalWatchData(mergedData)
      applyWatchData(mergedData)

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(WATCH_DATA_UPDATED, {
            detail: {
              hasNewHistory: true,
              hasNewWatches: true,
              hasProgressUpdate: true,
            },
          })
        )
      }
    } catch (error: any) {
      console.error("Auto-sync error:", error)
    }
  }

  syncInterval = setInterval(checkForUpdates, 300000)

  checkForUpdates()

  setupRealtimeSync()
}

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }

  if (unsubscribeRealtime) {
    unsubscribeRealtime()
    unsubscribeRealtime = null
  }
}

const setupRealtimeSync = () => {
  if (unsubscribeRealtime) {
    unsubscribeRealtime()
    unsubscribeRealtime = null
  }

  const credentials = getSyncCredentials()
  if (!credentials) return

  const handleRealtimeUpdate = (data: WatchData) => {
    console.log("Received real-time update:", data)

    const localData = getLocalWatchData()
    const mergedData = mergeWatchData(localData, data)

    saveLocalWatchData(mergedData)
    applyWatchData(mergedData)

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(WATCH_DATA_UPDATED, {
          detail: {
            hasNewHistory: true,
            hasNewWatches: true,
            hasProgressUpdate: true,
          },
        })
      )
    }
  }

  unsubscribeRealtime = subscribeToChanges(
    credentials.email,
    credentials.pin,
    handleRealtimeUpdate
  )
}

export const syncWatchProgressToCloud = async (
  watchData: WatchData
): Promise<boolean> => {
  try {
    
    saveLocalWatchData(watchData)

    const credentials = getSyncCredentials()
    if (credentials) {
      
      triggerCloudSync()
    }
    return true
  } catch (error) {
    console.error("Error syncing watch progress to cloud:", error)
    return false
  }
}
