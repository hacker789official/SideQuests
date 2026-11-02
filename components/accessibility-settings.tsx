"use client"

import { useEffect, useState } from "react"
import { Accessibility, Eye, Gauge, MoveHorizontal, Sparkles, Type } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const STORAGE_KEY = "sidequests-accessibility"

type AccessibilityState = {
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  wideReading: boolean
  dataSaver: boolean
}

const DEFAULT_STATE: AccessibilityState = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  wideReading: false,
  dataSaver: false,
}

function applyState(state: AccessibilityState) {
  const root = document.documentElement
  root.classList.toggle("sq-high-contrast", state.highContrast)
  root.classList.toggle("sq-reduced-motion", state.reducedMotion)
  root.classList.toggle("sq-large-text", state.largeText)
  root.classList.toggle("sq-wide-reading", state.wideReading)
  root.classList.toggle("sq-data-saver", state.dataSaver)
}

export function AccessibilitySettings() {
  const [state, setState] = useState(DEFAULT_STATE)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<AccessibilityState> | null
      const next = { ...DEFAULT_STATE, ...saved }
      setState(next)
      applyState(next)
    } catch {
      applyState(DEFAULT_STATE)
    }
  }, [])

  const update = (key: keyof AccessibilityState, value: boolean) => {
    const next = { ...state, [key]: value }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    applyState(next)
  }

  const options = [
    { key: "highContrast" as const, label: "High contrast", icon: Eye },
    { key: "reducedMotion" as const, label: "Reduce motion", icon: Accessibility },
    { key: "largeText" as const, label: "Larger text", icon: Type },
    { key: "wideReading" as const, label: "Wider reading layout", icon: MoveHorizontal },
    { key: "dataSaver" as const, label: "Data saver (load players on tap)", icon: Gauge },
  ]

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="size-3.5" /> Accessibility</Label>
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-background/30 p-2">
        {options.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5">
            <span className="flex items-center gap-2 text-xs font-medium"><Icon className="size-3.5 text-primary" />{label}</span>
            <Switch checked={state[key]} onCheckedChange={(value) => update(key, value)} aria-label={label} />
          </div>
        ))}
      </div>
    </div>
  )
}
