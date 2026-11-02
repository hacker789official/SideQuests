"use client"

import React, { useEffect, useState } from "react"
import { Loader2, LogOut, RefreshCw, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getSyncCredentials, setSyncCredentials } from "@/lib/sync-config"
import { WATCH_DATA_UPDATED, unlinkDevice, getLastSyncTime } from "@/lib/cloud-account"
import { stopAutoSync, triggerCloudSync } from "@/lib/auto-sync"
import { getWatchHistoryEnabled, setWatchHistoryEnabled } from "@/lib/watch-data"
import { useAuthSession } from "@/hooks/use-auth-session"
import { signOut } from "@/lib/auth"
import SyncDialog from "./sync-dialog"
import { cn } from "@/lib/utils"

export const SyncStatus = () => {
  const { user, loading: authLoading } = useAuthSession()
  const [signingOut, setSigningOut] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [syncEmail, setSyncEmail] = useState("")
  const [syncPin, setSyncPin] = useState("")
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncLog, setSyncLog] = useState<string>("")
  const [lastSyncTimeStr, setLastSyncTimeStr] = useState<string>("Never")
  const [historyEnabled, setHistoryEnabled] = useState(true)

  const updateState = async () => {
    
    setHistoryEnabled(getWatchHistoryEnabled())

    const credentials = getSyncCredentials()
    if (credentials) {
      setIsLinked(true)
      setSyncEmail(credentials.email)
      setSyncPin(credentials.pin)
      
      const lastSync = await getLastSyncTime(credentials.email, credentials.pin)
      if (lastSync) {
        setLastSyncTimeStr(new Date(lastSync).toLocaleTimeString())
      } else {
        setLastSyncTimeStr("Never")
      }
    } else {
      setIsLinked(false)
      setSyncEmail("")
      setSyncPin("")
      setLastSyncTimeStr("Never")
    }
  }

  useEffect(() => {
    updateState()

    const handleUpdate = (e: CustomEvent) => {
      updateState()
      if (e.detail && e.detail.hasProgressUpdate) {
        setSyncLog("Cloud updates merged successfully.")
      }
    }

    window.addEventListener(WATCH_DATA_UPDATED, handleUpdate as EventListener)
    return () => {
      window.removeEventListener(WATCH_DATA_UPDATED, handleUpdate as EventListener)
    }
  }, [])

  const handleToggleHistory = (checked: boolean) => {
    setHistoryEnabled(checked)
    try {
      setWatchHistoryEnabled(checked)
      setSyncLog(checked ? "Watch history tracking enabled." : "Watch history tracking disabled.")
    } catch (e) {
      console.error(e)
    }
  }

  const handleManualSync = async () => {
    if (!isLinked) return
    try {
      setSyncing(true)
      setSyncLog("Initializing full database sync...")

      triggerCloudSync()

      setTimeout(async () => {
        const credentials = getSyncCredentials()
        if (credentials) {
          const lastSync = await getLastSyncTime(credentials.email, credentials.pin)
          if (lastSync) {
            setLastSyncTimeStr(new Date(lastSync).toLocaleTimeString())
          }
        }
        setSyncing(false)
        setSyncLog("Sync completed successfully.")
      }, 2500)
    } catch (e) {
      console.error(e)
      setSyncing(false)
      setSyncLog("Sync failed. Check connection.")
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  const handleUnlinkClick = async () => {
    try {
      setSyncing(true)
      setSyncLog("Unlinking device...")

      if (syncEmail) {
        await unlinkDevice(syncEmail, syncPin)
      }

      stopAutoSync()
      setSyncCredentials(null)

      if (typeof window !== "undefined") {
        localStorage.removeItem("watchHistory")
        localStorage.removeItem("watches")
        localStorage.removeItem("watchProgress")
        localStorage.removeItem("watchHistoryEnabled")
        localStorage.removeItem("syncUpdatedAt")
        localStorage.removeItem("deletedItems")
      }

      setSyncLog("Device unlinked. Local data cleared.")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (e) {
      console.error(e)
      setSyncLog("Unlink failed.")
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg bg-black/40 border border-white/10 p-3 backdrop-blur-md">

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="size-4 text-primary" />
          <div className="space-y-0.5">
            <Label className="text-xs text-white font-semibold">Account</Label>
            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">
              {authLoading
                ? "Checking session..."
                : user
                  ? user.displayName ? `${user.displayName} · @${user.username}` : `@${user.username}`
                  : "Not signed in"}
            </p>
          </div>
        </div>
        {!authLoading &&
          (user ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <LogOut className="size-3" />
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 px-3 text-[11px] font-semibold"
              onClick={() => setShowSyncDialog(true)}
            >
              Sign In
            </Button>
          ))}
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <Label className="text-xs text-white font-semibold cursor-pointer" htmlFor="track-history-switch">
            Track History
          </Label>
          <p className="text-[10px] text-muted-foreground">Save recently watched movies & shows</p>
        </div>
        <Switch
          id="track-history-switch"
          checked={historyEnabled}
          onCheckedChange={handleToggleHistory}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold font-sans">Sync Connection</span>
          <div className="flex items-center gap-1.5 font-sans">
            <span
              className={cn(
                "size-2 rounded-full",
                isLinked ? "bg-green-500 animate-pulse" : "bg-zinc-500"
              )}
            />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {isLinked ? "Linked" : "Offline"}
            </span>
          </div>
        </div>

        {isLinked ? (
          <div className="space-y-2">
            <div className="rounded bg-white/5 p-2 text-[11px] space-y-1 border border-white/5 font-sans font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-mono text-white/90 truncate max-w-[150px]">{syncEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span>{lastSyncTimeStr}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleManualSync}
                disabled={syncing}
                className="h-8 flex-1 text-xs gap-1.5"
              >
                {syncing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleUnlinkClick}
                disabled={syncing}
                className="h-8 px-3 text-xs bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900 hover:text-white"
                title="Unlink Device"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground text-center">
              Sign in to sync watchlist and history with the mobile app.
            </p>
            <Button
              size="sm"
              onClick={() => setShowSyncDialog(true)}
              className="w-full h-8 text-xs font-semibold"
            >
              Link Device
            </Button>
          </div>
        )}

        {syncLog && (
          <div className="rounded bg-black/60 border border-white/5 p-1.5 text-[9px] text-primary/90 font-mono">
            &gt; {syncLog}
          </div>
        )}
      </div>

      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </div>
  )
}
