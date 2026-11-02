"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { Server, Tv, HelpCircle, Maximize, ChevronRight, ChevronLeft, Check, X, Sparkles } from "lucide-react"

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

interface TourStep {
  target: string 
  title: string
  description: string
  icon: React.ElementType
  preferredPosition: "top" | "bottom" | "left" | "right"
}

interface PlayerGuidedTourProps {
  open: boolean
  onClose: () => void
  isTv?: boolean
}

export const PlayerGuidedTour: React.FC<PlayerGuidedTourProps> = ({
  open,
  onClose,
  isTv = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [neverShowAgain, setNeverShowAgain] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const steps: TourStep[] = [
    {
      target: '[data-tour="server-switcher"]',
      title: "1. Switch Player Sources",
      description:
        "Tap any provider card to swap the embedded player instantly. Your selected server is remembered for your next session.",
      icon: Server,
      preferredPosition: "top",
    },
    ...(isTv
      ? [
          {
            target: '[data-tour="episodes-selector"]',
            title: "2. Select Seasons & Episodes",
            description:
              "Easily switch seasons, pick episodes, or click 'Next Episode' for continuous binge watching.",
            icon: Tv,
            preferredPosition: "left" as const,
          },
        ]
      : []),
    {
      target: '[data-tour="fullscreen-control"]',
      title: `${isTv ? "3" : "2"}. Use Fullscreen on Quest`,
      description:
        "Use the fullscreen control for an immersive headset view. On Quest, landscape orientation gives the player more room and keeps controls reachable.",
      icon: Maximize,
      preferredPosition: "bottom",
    },
    {
      target: '[data-tour="guide-button"]',
      title: `${isTv ? "4" : "3"}. Re-Open Guide Anytime`,
      description:
        "Click this Guide button anytime if you want to replay these tips or need help with streaming.",
      icon: HelpCircle,
      preferredPosition: "bottom",
    },
  ]

  const tourCardRef = useRef<HTMLDivElement>(null)

  const measureTarget = useCallback(() => {
    if (!open) return
    const step = steps[currentStepIndex]
    if (!step) return

    const elements = Array.from(document.querySelectorAll(step.target))
    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect)
        return
      }
    }
    setTargetRect(null)
  }, [open, currentStepIndex, steps])

  useEffect(() => {
    if (!open) return

    let attempts = 0
    const pollTimer = setInterval(() => {
      measureTarget()
      attempts++
      if (attempts > 15) {
        clearInterval(pollTimer)
      }
    }, 60)

    window.addEventListener("resize", measureTarget)
    window.addEventListener("scroll", measureTarget, true)

    return () => {
      clearInterval(pollTimer)
      window.removeEventListener("resize", measureTarget)
      window.removeEventListener("scroll", measureTarget, true)
    }
  }, [open, currentStepIndex, measureTarget])

  if (!open || !mounted) return null

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      handleComplete(e)
    }
  }

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleComplete = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    saveTutorialPreference(neverShowAgain)
    setCurrentStepIndex(0)
    onClose()
  }

  const currentStep = steps[currentStepIndex]
  const IconComponent = currentStep?.icon || Sparkles
  const isLastStep = currentStepIndex === steps.length - 1

  const getPlacement = () => {
    if (!targetRect) {
      return {
        cardStyle: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        } as React.CSSProperties,
        arrowDir: null,
      }
    }

    const cardWidth = 360
    const cardHeight = Math.max(285, tourCardRef.current?.offsetHeight || 285)
    const gap = 20
    const vw = typeof window !== "undefined" ? window.innerWidth : 1000
    const vh = typeof window !== "undefined" ? window.innerHeight : 800

    let side: "top" | "bottom" | "left" | "right" = currentStep.preferredPosition

    if (side === "top" && targetRect.top - cardHeight - gap < 12) {
      side = "bottom"
    } else if (side === "bottom" && targetRect.bottom + cardHeight + gap > vh - 12) {
      side = "top"
    } else if (side === "left" && targetRect.left - cardWidth - gap < 12) {
      side = "top"
    }

    let top = 0
    let left = 0

    if (side === "top") {
      top = targetRect.top - cardHeight - gap
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2
    } else if (side === "bottom") {
      top = targetRect.bottom + gap
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2
    } else if (side === "left") {
      top = targetRect.top + targetRect.height / 2 - cardHeight / 2
      left = targetRect.left - cardWidth - gap
    } else {
      top = targetRect.top + targetRect.height / 2 - cardHeight / 2
      left = targetRect.right + gap
    }

    left = Math.min(Math.max(16, left), vw - cardWidth - 16)
    top = Math.min(Math.max(16, top), vh - cardHeight - 16)

    return {
      cardStyle: {
        top: `${top}px`,
        left: `${left}px`,
      } as React.CSSProperties,
      arrowDir: side,
    }
  }

  const { cardStyle, arrowDir } = getPlacement()

  const tourContent = (
    <div
      className="fixed inset-0 z-[9999] pointer-events-auto select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleComplete}
        onPointerDown={(e) => e.stopPropagation()}
      />

      {targetRect && (
        <div
          className="absolute rounded-2xl border-2 border-red-500 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.82),0_0_30px_rgba(239,68,68,0.7)] pointer-events-none transition-all duration-300 ease-out z-[10000]"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          
          <span className="absolute -top-1.5 -right-1.5 size-3.5 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1.5 -right-1.5 size-3.5 rounded-full bg-red-500 border border-white" />
        </div>
      )}

      <div
        ref={tourCardRef}
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed z-[10001] w-[350px] sm:w-[360px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 text-zinc-100 flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
      >
        
        {targetRect && arrowDir === "top" && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-zinc-950 drop-shadow-lg" />
        )}
        {targetRect && arrowDir === "bottom" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-[12px] border-b-zinc-950 drop-shadow-lg" />
        )}
        {targetRect && arrowDir === "left" && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-[12px] border-l-zinc-950 drop-shadow-lg" />
        )}
        {targetRect && arrowDir === "right" && (
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-zinc-950 drop-shadow-lg" />
        )}

        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <IconComponent className="size-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
            aria-label="Close Tour"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            {currentStep.title}
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-200 pt-1 select-none">
          <input
            type="checkbox"
            checked={neverShowAgain}
            onChange={(e) => setNeverShowAgain(e.target.checked)}
            className="size-3.5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 focus:ring-offset-zinc-950"
          />
          <span>Never show again</span>
        </label>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 h-8 px-2.5"
          >
            <ChevronLeft className="size-3.5 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-2">
            {!isLastStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleComplete}
                className="text-xs font-medium text-zinc-400 border-zinc-800 hover:bg-zinc-900 h-8 px-3"
              >
                Skip
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-8 px-4 rounded-xl shadow-md shadow-red-950/50 flex items-center gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="size-3.5" /> Got it!
                </>
              ) : (
                <>
                  Next <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(tourContent, document.body)
}
