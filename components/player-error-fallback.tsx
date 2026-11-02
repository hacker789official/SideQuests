"use client"

import React from "react"
import { AlertTriangle, WifiOff, RefreshCw, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface PlayerErrorFallbackProps {
  isOffline: boolean
  isRetrying?: boolean
  sourceName?: string
  onRetry: () => void
}

export const PlayerErrorFallback: React.FC<PlayerErrorFallbackProps> = ({
  isOffline,
  isRetrying = false,
  sourceName = "player",
  onRetry,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 sm:p-8 bg-zinc-950/95 backdrop-blur-md text-zinc-100 animate-in fade-in duration-200 select-none overflow-y-auto">
      <div className="max-w-xl w-full flex flex-col items-center text-center space-y-5">

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-600/15 blur-2xl animate-pulse" />
          <div
            className={cn(
              "relative size-14 sm:size-16 rounded-2xl border flex items-center justify-center shadow-xl transition-all",
              isOffline
                ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
                : "bg-red-950/40 border-red-500/30 text-red-500"
            )}
          >
            {isOffline ? (
              <WifiOff className="size-7 sm:size-8 animate-pulse" />
            ) : (
              <AlertTriangle className="size-7 sm:size-8" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {isOffline ? "Connection Disconnected" : `${sourceName} could not be loaded`}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md leading-relaxed px-2">
            {isOffline
              ? "You appear to be offline. Check your internet connection to resume playback."
              : `The player did not respond in time. Retry the ${sourceName} connection or open it in a new tab.`}
          </p>
        </div>

        <div className="w-full max-w-md border-t border-zinc-850/90 my-1" />

        <div>
          <button
            disabled={isRetrying}
            onClick={onRetry}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-sm",
              isRetrying
                ? "bg-zinc-900 border-zinc-800 text-zinc-400 cursor-not-allowed opacity-80"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 hover:text-white active:scale-98"
            )}
          >
            {isRetrying ? (
              <Loader2 className="size-3.5 animate-spin text-red-500" />
            ) : (
              <RefreshCw className="size-3.5 text-zinc-400" />
            )}
            <span>{isRetrying ? "Testing Connection..." : "Retry Connection"}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
