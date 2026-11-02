"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Clipboard, RotateCcw, Share2, Sparkles, Target, Timer, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LibraryFilter, LibrarySort } from "@/components/library-toolkit"

const PREFS_KEY = "sidequests-quest-utilities"

type Preferences = {
  goal: number
  hideSpoilers: boolean
  reduceMotion: boolean
  rememberTab: boolean
  showStats: boolean
}

const defaults: Preferences = { goal: 5, hideSpoilers: true, reduceMotion: false, rememberTab: true, showStats: true }

function readPreferences(): Preferences {
  if (typeof window === "undefined") return defaults
  try {
    return { ...defaults, ...JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}") }
  } catch {
    return defaults
  }
}

function writePreferences(value: Preferences) {
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent("SIDEQUESTS_PREFERENCES_UPDATED"))
}

interface QuestUtilitiesProps {
  totalItems: number
  filter: LibraryFilter
  sort: LibrarySort
  query: string
  onResetControls: () => void
  onClearSearch: () => void
}

export function QuestUtilities({ totalItems, filter, sort, query, onResetControls, onClearSearch }: QuestUtilitiesProps) {
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [notice, setNotice] = useState("")
  const [timerRunning, setTimerRunning] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)

  useEffect(() => setPreferences(readPreferences()), [])
  useEffect(() => {
    if (!timerRunning) return
    const timer = window.setInterval(() => setSessionSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [timerRunning])
  const progress = useMemo(() => Math.min(100, Math.round((totalItems / Math.max(1, preferences.goal)) * 100)), [preferences.goal, totalItems])
  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2800)
  }
  const update = (patch: Partial<Preferences>) => {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    writePreferences(next)
    announce("Preference saved on this device.")
  }
  const copyStats = async () => {
    const text = `SideQuests library: ${totalItems} saved titles · ${filter} filter · ${sort} sort${query ? ` · search: ${query}` : ""}`
    await navigator.clipboard?.writeText(text)
    announce("Library summary copied.")
  }
  const shareStats = async () => {
    const text = `My SideQuests library has ${totalItems} saved titles.`
    const shareApi = (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share
    if (typeof shareApi === "function") {
      await shareApi({ title: "My SideQuests library", text })
      announce("Share sheet opened.")
    } else {
      await navigator.clipboard?.writeText(text)
      announce("Share text copied.")
    }
  }
  const resetPreferences = () => {
    setPreferences(defaults)
    writePreferences(defaults)
    announce("Quest utility preferences reset.")
  }
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/15 p-4 backdrop-blur-md" aria-labelledby="quest-utilities-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary"><WandSparkles className="size-4" /><p className="text-[10px] font-black uppercase tracking-[0.22em]">New · Quest utilities</p></div>
          <h2 id="quest-utilities-title" className="mt-1 text-lg font-bold">Make your library work your way</h2>
          <p className="text-xs text-muted-foreground">Small, local-first controls for faster discovery and calmer playback.</p>
        </div>
        {notice ? <p role="status" className="flex items-center gap-1 text-xs font-semibold text-primary"><Check className="size-3.5" />{notice}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-background/25 p-3 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-bold"><Target className="size-4 text-primary" />Weekly quest goal</p><span className="text-xs font-black text-primary">{totalItems}/{preferences.goal}</span></div>
          <input aria-label="Weekly quest goal" type="range" min="1" max="25" value={preferences.goal} onChange={(event) => update({ goal: Number(event.target.value) })} className="mt-3 w-full accent-cyan-400" />
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        <Button type="button" variant="outline" className="h-auto min-h-16 justify-start rounded-xl text-left text-xs" onClick={copyStats}><Clipboard className="mr-2 size-4 text-primary" />Copy library summary</Button>
        <Button type="button" variant="outline" className="h-auto min-h-16 justify-start rounded-xl text-left text-xs" onClick={() => void shareStats()}><Share2 className="mr-2 size-4 text-primary" />Share library summary</Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Button type="button" variant="ghost" className="justify-start rounded-xl text-xs" onClick={onClearSearch}><Sparkles className="mr-2 size-3.5" />Clear search instantly</Button>
        <Button type="button" variant="ghost" className="justify-start rounded-xl text-xs" onClick={onResetControls}><RotateCcw className="mr-2 size-3.5" />Reset filters and sort</Button>
        <Button type="button" variant="ghost" className="justify-start rounded-xl text-xs" onClick={() => setTimerRunning((value) => !value)}><Timer className="mr-2 size-3.5" />{timerRunning ? "Pause focus timer" : "Start focus timer"} {sessionSeconds > 0 ? `· ${Math.floor(sessionSeconds / 60)}m` : ""}</Button>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"><Input type="checkbox" checked={preferences.hideSpoilers} onChange={(event) => update({ hideSpoilers: event.target.checked })} className="size-3.5 accent-cyan-400" />Hide spoiler labels</label>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"><Input type="checkbox" checked={preferences.reduceMotion} onChange={(event) => update({ reduceMotion: event.target.checked })} className="size-3.5 accent-cyan-400" />Reduce utility motion</label>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"><Input type="checkbox" checked={preferences.rememberTab} onChange={(event) => update({ rememberTab: event.target.checked })} className="size-3.5 accent-cyan-400" />Remember library tab</label>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"><Input type="checkbox" checked={preferences.showStats} onChange={(event) => update({ showStats: event.target.checked })} className="size-3.5 accent-cyan-400" />Show library stats</label>
        <Button type="button" variant="ghost" className="justify-start rounded-xl text-xs text-muted-foreground" onClick={resetPreferences}>Reset utility preferences</Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Preferences stay in this browser only. No offline downloads or background tracking are used.</p>
    </section>
  )
}
