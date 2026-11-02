"use client"

import { useEffect, useState } from "react"
import { History } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import {
  getLocalWatchHistoryEnabled,
  setLocalWatchHistoryEnabled,
} from "@/lib/local-watch-data"

export const WatchHistoryToggle = () => {
  const [enabled, setEnabled] = useState<boolean>(true)

  useEffect(() => {
    try {
      setEnabled(getLocalWatchHistoryEnabled())
    } catch (error) {
      console.error("Error loading watch history setting:", error)
    }
  }, [])

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    try {
      setLocalWatchHistoryEnabled(checked)
    } catch (error) {
      console.error("Error saving watch history setting:", error)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <History className="size-4" />
        <span className="text-sm">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        aria-label="Toggle watch history"
      />
    </div>
  )
}
