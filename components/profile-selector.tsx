"use client"

import React, { useEffect, useState } from "react"
import { Loader2, LogOut, RefreshCw, UserCircle2 } from "lucide-react"

import { signOut } from "@/lib/auth"
import { stopAutoSync, syncCloudNow } from "@/lib/auto-sync"
import {
  WATCH_DATA_UPDATED,
  getLastSyncTime,
  unlinkDevice,
} from "@/lib/cloud-account"
import { getSyncCredentials, setSyncCredentials } from "@/lib/sync-config"
import { cn } from "@/lib/utils"
import {
  getWatchHistoryEnabled,
  setWatchHistoryEnabled,
} from "@/lib/watch-data"
import { useAuthSession } from "@/hooks/use-auth-session"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import SyncDialog from "./sync-dialog"

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
      window.removeEventListener(
        WATCH_DATA_UPDATED,
        handleUpdate as EventListener
      )
    }
  }, [])

  const handleToggleHistory = (checked: boolean) => {
    setHistoryEnabled(checked)
    try {
      setWatchHistoryEnabled(checked)
      setSyncLog(
        checked
          ? "Watch history tracking enabled."
          : "Watch history tracking disabled."
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleManualSync = async () => {
    if (!isLinked) return
    try {
      setSyncing(true)
      setSyncLog("Syncing your SideQuests library…")
      const credentials = getSyncCredentials()
      if (!credentials) throw new Error("Link an account before syncing.")

      const synced = await syncCloudNow()
      if (!synced)
        throw new Error(
          "Cloud sync could not be confirmed. Your local library is still available."
        )

      const lastSync = await getLastSyncTime(credentials.email, credentials.pin)
      setLastSyncTimeStr(
        lastSync
          ? new Date(lastSync).toLocaleTimeString()
          : new Date().toLocaleTimeString()
      )
      setSyncLog("Your SideQuests library is synced.")
    } catch (error) {
      console.error(error)
      setSyncLog(
        error instanceof Error
          ? error.message
          : "Cloud sync failed. Your local library is still available."
      )
    } finally {
      setSyncing(false)
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
    <div className="space-y-4 rounded-2xl border border-cyan-200/15 bg-slate-950/65 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="size-4 text-primary" />
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-white">Account</Label>
            <p className="max-w-[160px] truncate text-[10px] text-muted-foreground">
              {authLoading
                ? "Checking session..."
                : user
                ? user.displayName
                  ? `${user.displayName} · @${user.username}`
                  : `@${user.username}`
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
          <Label
            className="cursor-pointer text-xs font-semibold text-white"
            htmlFor="track-history-switch"
          >
            Track History
          </Label>
          <p className="text-[10px] text-muted-foreground">
            Save recently watched movies & shows
          </p>
        </div>
        <Switch
          id="track-history-switch"
          checked={historyEnabled}
          onCheckedChange={handleToggleHistory}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-semibold text-muted-foreground">
            Sync Connection
          </span>
          <div className="flex items-center gap-1.5 font-sans">
            <span
              className={cn(
                "size-2 rounded-full",
                isLinked ? "bg-cyan-300" : "bg-zinc-500"
              )}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isLinked ? "Linked" : "Not linked"}
            </span>
          </div>
        </div>

        {isLinked ? (
          <div className="space-y-2">
            <div className="space-y-1 rounded border border-white/5 bg-white/5 p-2 font-sans text-[11px] font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="max-w-[150px] truncate font-mono text-white/90">
                  {syncEmail}
                </span>
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
                className="min-h-10 flex-1 gap-1.5 text-xs"
              >
                {syncing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                {syncing ? "Syncing…" : "Sync now"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleUnlinkClick}
                disabled={syncing}
                className="min-h-10 border border-red-500/30 bg-red-950/40 px-3 text-xs text-red-300 hover:bg-red-900 hover:text-white"
                title="Unlink Device"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-[11px] text-muted-foreground">
              Sign in to sync watchlist and history with the mobile app.
            </p>
            <Button
              size="sm"
              onClick={() => setShowSyncDialog(true)}
              className="h-8 w-full text-xs font-semibold"
            >
              Link Device
            </Button>
          </div>
        )}

        {syncLog && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-cyan-200/10 bg-black/50 p-2 font-mono text-[10px] text-cyan-100/90"
          >
            &gt; {syncLog}
          </div>
        )}
      </div>

      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </div>
  )
}
