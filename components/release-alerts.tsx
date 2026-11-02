"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell, BellRing, Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SavedAlert {
  id: string
  query: string
  createdAt: number
}

interface ReleaseSignal {
  key: string
  source: "MangaDex" | "MangaYi" | "TMDB"
  kind: "Chapter" | "Episode"
  title: string
  detail: string
  href: string
  observedAt: string | null
}

const ALERTS_KEY = "sidequests-release-alerts"
const SNAPSHOTS_KEY = "sidequests-release-alert-snapshots"

function readAlerts(): SavedAlert[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ReleaseAlerts() {
  const [alerts, setAlerts] = useState<SavedAlert[]>([])
  const [query, setQuery] = useState("")
  const [signals, setSignals] = useState<ReleaseSignal[]>([])
  const [checking, setChecking] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [status, setStatus] = useState("")

  useEffect(() => {
    setAlerts(readAlerts())
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission)
  }, [])

  const checkAlerts = useCallback(async (currentAlerts: SavedAlert[]) => {
    if (!currentAlerts.length) {
      setSignals([])
      return
    }

    setChecking(true)
    setStatus("")
    const responses = await Promise.allSettled(
      currentAlerts.map(async (alert) => {
        const response = await fetch(`/api/release-alerts?query=${encodeURIComponent(alert.query)}`, { cache: "no-store" })
        if (!response.ok) throw new Error("Release check failed")
        const payload = await response.json() as { signals?: ReleaseSignal[] }
        return { alert, signals: Array.isArray(payload.signals) ? payload.signals : [] }
      })
    )

    const nextSignals = responses.flatMap((response) => response.status === "fulfilled" ? response.value.signals : [])
    setSignals(nextSignals)

    let snapshots: Record<string, string[]> = {}
    try {
      snapshots = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || "{}") as Record<string, string[]>
    } catch {
      snapshots = {}
    }

    let newSignalCount = 0
    for (const response of responses) {
      if (response.status !== "fulfilled") continue
      const { alert, signals: alertSignals } = response.value
      const previous = new Set(snapshots[alert.query] || [])
      const fresh = alertSignals.filter((signal) => !previous.has(signal.key))
      if (previous.size > 0 && fresh.length > 0 && permission === "granted" && typeof Notification !== "undefined") {
        new Notification("SideQuests release update", {
          body: `${fresh[0].title}: ${fresh[0].detail}`,
          tag: `sidequests-release-${alert.id}`,
        })
      }
      newSignalCount += previous.size > 0 ? fresh.length : 0
      snapshots[alert.query] = alertSignals.map((signal) => signal.key)
    }

    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
    setStatus(newSignalCount ? `${newSignalCount} new release${newSignalCount === 1 ? "" : "s"} found.` : "Release radar checked online.")
    setChecking(false)
  }, [permission])

  useEffect(() => {
    if (alerts.length) void checkAlerts(alerts)
  }, [alerts, checkAlerts])

  const saveAlerts = (next: SavedAlert[]) => {
    setAlerts(next)
    localStorage.setItem(ALERTS_KEY, JSON.stringify(next))
  }

  const addAlert = (event: React.FormEvent) => {
    event.preventDefault()
    const normalized = query.trim().replace(/\s+/g, " ").slice(0, 80)
    if (!normalized || alerts.some((alert) => alert.query.toLowerCase() === normalized.toLowerCase())) return
    saveAlerts([...alerts, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, query: normalized, createdAt: Date.now() }])
    setQuery("")
  }

  const removeAlert = (id: string) => saveAlerts(alerts.filter((alert) => alert.id !== id))

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return
    const next = await Notification.requestPermission()
    setPermission(next)
    setStatus(next === "granted" ? "Browser notifications enabled." : "Browser notifications remain disabled.")
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/20 p-5 shadow-sm sm:p-6" aria-labelledby="release-alerts-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Online-only notifications</p>
          <h2 id="release-alerts-title" className="mt-1 text-xl font-black">Release radar</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Save a title or franchise search. SideQuests checks MangaDex, MangaYi, and TMDB when this page is open; no media is downloaded.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {permission === "granted" ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><BellRing className="size-3.5" /> Notifications on</span>
          ) : permission === "unsupported" ? (
            <span className="rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground">Browser alerts unavailable</span>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={requestPermission} className="rounded-full"><Bell className="mr-2 size-3.5" /> Allow notifications</Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => void checkAlerts(alerts)} disabled={checking || !alerts.length} className="rounded-full"><Loader2 className={`mr-2 size-3.5 ${checking ? "animate-spin" : "hidden"}`} /> Check now</Button>
        </div>
      </div>

      <form onSubmit={addAlert} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Add a title, series, or manga search" className="min-w-0 flex-1 rounded-xl border border-border/70 bg-background/40 px-4 py-2.5 text-sm outline-none ring-primary/30 transition focus:ring-2" aria-label="Search title to follow" />
        <Button type="submit" className="rounded-xl"><Plus className="mr-2 size-4" /> Save search</Button>
      </form>

      {alerts.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {alerts.map((alert) => <span key={alert.id} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs font-semibold">{alert.query}<button type="button" onClick={() => removeAlert(alert.id)} aria-label={`Remove ${alert.query} alert`} className="text-muted-foreground transition hover:text-destructive"><Trash2 className="size-3.5" /></button></span>)}
        </div>
      ) : null}

      {signals.length ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {signals.slice(0, 8).map((signal) => <Link key={signal.key} href={signal.href} target={signal.source === "MangaYi" ? "_blank" : undefined} rel={signal.source === "MangaYi" ? "noopener noreferrer" : undefined} className="rounded-xl border border-border/60 bg-background/30 p-3 transition hover:border-primary/50 hover:bg-primary/5"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{signal.source} · {signal.kind}</span><span className="text-[10px] text-muted-foreground">{signal.observedAt || "Live"}</span></div><p className="mt-1 truncate text-sm font-semibold">{signal.title}</p><p className="text-xs text-muted-foreground">{signal.detail}</p></Link>)}
        </div>
      ) : null}

      {status ? <p className="mt-4 text-xs text-muted-foreground" role="status">{status}</p> : null}
    </section>
  )
}
