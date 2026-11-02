"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldAlert, X } from "lucide-react"
import { usePathname } from "next/navigation"

const DISMISSED_KEY = "sidequests-adblock-notice-dismissed"

const isMediaRoute = (pathname: string | null) =>
  Boolean(pathname && /^\/(movie|tv|anime|manga)(\/|$)/.test(pathname))

export function AdBlockNotice() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isMediaRoute(pathname)) {
      setVisible(false)
      return
    }

    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === "true") return
    } catch {
      // Continue showing the notice when storage is unavailable.
    }

    const timer = window.setTimeout(() => setVisible(true), 700)
    return () => window.clearTimeout(timer)
  }, [pathname])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISSED_KEY, "true")
    } catch {
      // The notice can still be dismissed for the current render.
    }
  }

  if (!visible) return null

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-cyan-300/25 bg-zinc-950/95 p-4 text-zinc-200 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-cyan-300/10 p-2 text-cyan-300">
          <ShieldAlert className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Use an ad blocker before playback</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Some third-party providers may open unwanted tabs, pop-ups, or redirects that are not created or intended by SideQuests. Turn on a reputable ad blocker before continuing, and close unexpected tabs.
          </p>
          <Link href="/disclaimer" className="mt-2 inline-block text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline">
            Read the full disclaimer
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss third-party player notice"
          className="rounded-lg p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  )
}
