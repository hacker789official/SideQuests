"use client"

import React, { useState } from "react"
import { Server, Tv, Check, Sparkles, X, Info } from "lucide-react"

import { Button } from "@/components/ui/button"

const COOKIE_NAME = "sidequests_hide_player_tutorial"

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`
}

export function shouldShowTutorial(): boolean {
  if (typeof window === "undefined") return false
  const cookieVal = getCookie(COOKIE_NAME)
  const localVal = localStorage.getItem(COOKIE_NAME)
  return cookieVal !== "true" && localVal !== "true"
}

export function saveTutorialPreference(neverShowAgain: boolean) {
  if (neverShowAgain) {
    setCookie(COOKIE_NAME, "true", 365)
    if (typeof window !== "undefined") {
      localStorage.setItem(COOKIE_NAME, "true")
    }
  }
}

interface PlayerTutorialModalProps {
  open: boolean
  onClose: () => void
  isTv?: boolean
}

export const PlayerTutorialModal: React.FC<PlayerTutorialModalProps> = ({
  open,
  onClose,
  isTv = false,
}) => {
  const [neverShowAgain, setNeverShowAgain] = useState<boolean>(false)

  if (!open) return null

  const handleDismiss = () => {
    saveTutorialPreference(neverShowAgain)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden flex flex-col">
        
        <div className="relative p-5 pb-4 border-b border-zinc-800/80 bg-gradient-to-r from-red-950/40 via-zinc-900/60 to-zinc-950 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Player Guide & Tips
              </h3>
              <p className="text-xs text-zinc-400">
                Quick tips for the best streaming experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close tutorial"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
            <div className="size-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <Server className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-200">
                1. Player Sources & Quality Presets
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select between trailer previews, demo video streams, or custom video API endpoints below the player.
              </p>
            </div>
          </div>

          {isTv && (
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
              <div className="size-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Tv className="size-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-200">
                  2. Select Seasons & Episodes Easily
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Use the right sidebar (or bottom menu on mobile) to pick any season or episode. Use the <strong className="text-zinc-200">&quot;Next Episode&quot;</strong> button for seamless episode switching.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
            <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Info className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-200">
                {isTv ? "3." : "2."} Fully Customizable Video API Template
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your custom HLS, DASH, MP4, or DRM video player endpoint to plug directly into this UI component.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-850 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={(e) => setNeverShowAgain(e.target.checked)}
              className="size-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 focus:ring-offset-zinc-950"
            />
            <span>Never show again (Save in cookie)</span>
          </label>

          <Button
            onClick={handleDismiss}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40"
          >
            <Check className="size-4" />
            Start Watching
          </Button>
        </div>
      </div>
    </div>
  )
}
