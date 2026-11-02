"use client"

import { useEffect, useState } from "react"
import { Download, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

export function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (installed) return <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300"><Download className="size-3.5" /> App installed</span>

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === "accepted") setPromptEvent(null)
      return
    }
    window.open("/pwa-install", "_self")
  }

  return (
    <Button type="button" onClick={install} variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10">
      {promptEvent ? <Download className="mr-2 size-3.5" /> : <ExternalLink className="mr-2 size-3.5" />}
      Install app
    </Button>
  )
}
