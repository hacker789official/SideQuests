"use client"

import { useEffect, useState } from "react"
import { cva } from "class-variance-authority"
import { Loader2, LogOut, RefreshCw } from "lucide-react"

import { signInWithEmail, signUpWithEmail } from "@/lib/auth"
import { startAutoSync, stopAutoSync, syncCloudNow } from "@/lib/auto-sync"
import {
  WATCH_DATA_UPDATED,
  getLastSyncTime,
  unlinkDevice,
} from "@/lib/cloud-account"
import { getSyncCredentials, setSyncCredentials } from "@/lib/sync-config"
import { cn } from "@/lib/utils"
import {
  getWatchHistoryEnabled,
  linkAccount,
  setWatchHistoryEnabled,
} from "@/lib/watch-data"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

interface SyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const syncNotification = cva(
  "flex items-center gap-2 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "border-emerald-500/30 bg-emerald-950/50 text-emerald-300",
        error: "border-red-500/30 bg-red-950/50 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export default function SyncDialog({ open, onOpenChange }: SyncDialogProps) {
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [pin, setPin] = useState("")
  const [accountCode, setAccountCode] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountMode, setAccountMode] = useState<"login" | "signup">("login")
  const [userEmail, setUserEmail] = useState("")
  const [historyEnabled, setHistoryEnabled] = useState(true)
  const [syncLog, setSyncLog] = useState("")
  const [lastSyncTimeStr, setLastSyncTimeStr] = useState("Never")

  const updateState = async () => {
    setHistoryEnabled(getWatchHistoryEnabled())

    const credentials = getSyncCredentials()
    if (credentials) {
      setIsLoggedIn(true)
      setUserEmail(credentials.email)

      const lastSync = await getLastSyncTime(credentials.email, credentials.pin)
      if (lastSync) {
        setLastSyncTimeStr(new Date(lastSync).toLocaleTimeString())
      } else {
        setLastSyncTimeStr("Never")
      }
    } else {
      setIsLoggedIn(false)
      setUserEmail("")
      setLastSyncTimeStr("Never")
    }
  }

  useEffect(() => {
    updateState()

    const handleUpdate = (e: any) => {
      updateState()
      if (e.detail && e.detail.hasProgressUpdate) {
        setSyncLog("Cloud updates merged successfully.")
      }
    }

    window.addEventListener(WATCH_DATA_UPDATED, handleUpdate)
    return () => {
      window.removeEventListener(WATCH_DATA_UPDATED, handleUpdate)
    }
  }, [open])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      window.location.reload()
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

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
    try {
      setSyncing(true)
      setError(null)
      setSuccess(null)
      setSyncLog("Initializing full database sync...")
      const credentials = getSyncCredentials()
      if (!credentials)
        throw new Error("Sign in to sync your library to the cloud.")

      const synced = await syncCloudNow()
      if (!synced) {
        throw new Error(
          "Cloud sync could not be confirmed. Your local library is still available."
        )
      }

      const lastSync = await getLastSyncTime(credentials.email, credentials.pin)
      setLastSyncTimeStr(
        lastSync
          ? new Date(lastSync).toLocaleTimeString()
          : new Date().toLocaleTimeString()
      )
      setSyncLog("Your SideQuests library is synced.")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cloud sync failed. Your local library is still available."
      setError(message)
      setSyncLog("Cloud sync failed; your local data was kept on this device.")
    } finally {
      setSyncing(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSuccess(null)

      if (
        !pin ||
        (accountMode === "signup"
          ? !email || !displayName || !username
          : !username)
      ) {
        throw new Error(
          accountMode === "signup"
            ? "Please complete email, name, username, and PIN."
            : "Please enter your username and PIN."
        )
      }

      const accountResult =
        accountMode === "signup"
          ? await signUpWithEmail(email, displayName, username, pin)
          : await signInWithEmail(username, pin)
      if (accountResult.error) throw new Error(accountResult.error)
      if (accountMode === "signup" && accountResult.data?.account.accountCode)
        setAccountCode(accountResult.data.account.accountCode)

      setIsLoggedIn(true)
      setUserEmail(
        accountResult.data?.account.username || username.trim().toLowerCase()
      )
      // Persist the identifier locally. The authenticated httpOnly server cookie
      // is used for cloud requests; the PIN is never written to localStorage.
      setSyncCredentials({ email: username.trim(), pin })
      const synced = await linkAccount(username, pin)
      startAutoSync()

      setSuccess(
        synced
          ? accountMode === "signup"
            ? "Account created and local progress synced."
            : "Signed in and local progress synced."
          : accountMode === "signup"
          ? "Account created. Local progress is safe and cloud sync will retry."
          : "Signed in. Local progress is safe and cloud sync will retry."
      )
      setCountdown(null)
    } catch (error: any) {
      setError(error.message || "Failed to sync")
      setSyncCredentials(null)
    } finally {
      setSyncing(false)
    }
  }

  const handleUnlink = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSuccess(null)

      const credentials = getSyncCredentials()
      if (!credentials) {
        throw new Error("No sync credentials found")
      }

      await unlinkDevice(credentials.email, credentials.pin).catch(
        () => undefined
      )

      stopAutoSync()

      setSyncCredentials(null)

      if (typeof window !== "undefined") {
        localStorage.removeItem("watchHistory")
        localStorage.removeItem("watches")
        localStorage.removeItem("watchProgress")
        localStorage.removeItem("watchHistoryEnabled")
        localStorage.removeItem("syncUpdatedAt")
        localStorage.removeItem("deletedItems")

        document.cookie =
          "watchHistory=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie =
          "watches=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie =
          "watchProgress=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie =
          "watchHistoryEnabled=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      }

      setSuccess("Device unlinked successfully! Refreshing")
      setCountdown(0)
    } catch (error: any) {
      setError(error.message || "Failed to unlink device")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#050e19]/98 max-w-sm rounded-2xl border border-t-4 border-cyan-300/20 border-t-primary text-slate-100 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight text-white">
            Keep your SideQuests in sync
          </DialogTitle>
          <p className="text-sm leading-relaxed text-slate-400">
            Carry your watchlist and viewing progress between your devices.
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="space-y-0.5">
              <Label
                className="cursor-pointer text-sm font-semibold"
                htmlFor="dialog-track-history-switch"
              >
                Track History
              </Label>
              <p className="text-xs text-muted-foreground">
                Save recently watched movies & shows
              </p>
            </div>
            <Switch
              id="dialog-track-history-switch"
              checked={historyEnabled}
              onCheckedChange={handleToggleHistory}
            />
          </div>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Account status
                </span>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="size-2 rounded-full bg-cyan-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Linked
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border border-cyan-400/15 bg-[#0b2038] p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="max-w-[200px] truncate font-mono text-white/90">
                    {userEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>{lastSyncTimeStr}</span>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className={cn(syncNotification({ variant: "error" }))}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(syncNotification({ variant: "success" }))}
                >
                  {success}
                </div>
              )}

              {accountCode && accountMode === "signup" && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Save your account code
                  </p>
                  <code className="mt-2 block select-all rounded-lg bg-black/40 px-3 py-2 text-center text-lg font-black tracking-[0.2em] text-white">
                    {accountCode}
                  </code>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                    Use your username and PIN to sign in. Keep this code for
                    account recovery and support.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="min-h-11 flex-1 gap-2 text-sm font-semibold"
                >
                  {syncing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {syncing ? "Syncing…" : "Sync now"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnlink}
                  disabled={syncing}
                  className="min-h-11 gap-2 border border-red-500/30 bg-red-950/40 px-3 text-red-300 hover:bg-red-900 hover:text-white"
                  title="Unlink Device"
                >
                  <LogOut className="size-4" />
                  Unlink
                </Button>
              </div>

              {syncLog && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-lg border border-cyan-200/10 bg-black/50 p-3 font-mono text-xs text-cyan-100/90"
                >
                  &gt; {syncLog}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Account status
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-zinc-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Not linked
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Create a SideQuests account with your email, name, username, and
                private four-digit PIN to sync watchlist, anime episodes, manga
                reading, and history across devices.
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-cyan-400/10 bg-[#06101f] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMode("login")
                    setAccountCode("")
                    setError(null)
                  }}
                  className={cn(
                    "rounded-md px-3 py-2 text-xs font-bold transition",
                    accountMode === "login"
                      ? "bg-cyan-400/15 text-cyan-100"
                      : "text-slate-400 hover:text-slate-100"
                  )}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMode("signup")
                    setError(null)
                  }}
                  className={cn(
                    "rounded-md px-3 py-2 text-xs font-bold transition",
                    accountMode === "signup"
                      ? "bg-primary text-black"
                      : "text-slate-400 hover:text-slate-100"
                  )}
                >
                  Create account
                </button>
              </div>

              <div className="space-y-3">
                {accountMode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Name</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        autoComplete="name"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .replace(/[^a-zA-Z0-9_]/g, "")
                          .slice(0, 20)
                      )
                    }
                    placeholder="your_username"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">4-digit PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="••••"
                    inputMode="numeric"
                    autoComplete={
                      accountMode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                  />
                </div>
                {error && (
                  <div className={cn(syncNotification({ variant: "error" }))}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className={cn(syncNotification({ variant: "success" }))}>
                    {success}
                  </div>
                )}
                {accountCode && accountMode === "signup" && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Your account code
                    </p>
                    <code className="mt-2 block select-all rounded-lg bg-black/40 px-3 py-2 text-center text-lg font-black tracking-[0.2em] text-white">
                      {accountCode}
                    </code>
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                      Save this code somewhere safe. Your PIN is never shown
                      again or stored in this browser.
                    </p>
                  </div>
                )}
                <Button
                  className="h-10 w-full"
                  onClick={handleSync}
                  disabled={
                    syncing ||
                    !pin ||
                    (accountMode === "signup"
                      ? !email || !displayName || !username
                      : !username)
                  }
                >
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {accountMode === "signup"
                        ? "Creating account..."
                        : "Signing in..."}
                    </>
                  ) : accountMode === "signup" ? (
                    "Create account & sync"
                  ) : (
                    "Sign in & sync"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { SyncDialogProps }
