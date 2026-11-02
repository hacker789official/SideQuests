"use client"

import { useEffect } from "react"

import { startAutoSync, stopAutoSync } from "@/lib/auto-sync"
import { getAutoSyncEnabled, getSyncCredentials } from "@/lib/sync-config"
import { NotificationManager } from "@/components/sync-notification"

export function SyncProvider() {
  useEffect(() => {
    
    const autoSyncEnabled = getAutoSyncEnabled()
    const credentials = getSyncCredentials()

    if (autoSyncEnabled && credentials) {
      startAutoSync()
    }

    return () => {
      stopAutoSync()
    }
  }, [])

  return <NotificationManager />
}
