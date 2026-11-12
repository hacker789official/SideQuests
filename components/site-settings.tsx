"use client"

import { useEffect, useState } from "react"
import { SettingsIcon } from "lucide-react"

import {
  getDirectSearchPlayEnabled,
  setDirectSearchPlayEnabled,
} from "@/lib/watch-data"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { AccessibilitySettings } from "@/components/accessibility-settings"

export const SiteSettings = () => {
  const [directPlay, setDirectPlay] = useState<boolean>(false)

  useEffect(() => {
    setDirectPlay(getDirectSearchPlayEnabled())
  }, [])

  const handleDirectPlayToggle = (checked: boolean) => {
    setDirectPlay(checked)
    setDirectSearchPlayEnabled(checked)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-xl border border-cyan-200/20 bg-slate-950/65 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.08)] backdrop-blur-md transition-all hover:border-cyan-200/55 hover:bg-cyan-300/10 hover:text-white"
        >
          <SettingsIcon className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 space-y-4 rounded-2xl border-cyan-200/15 bg-slate-950/95 text-slate-100 shadow-2xl shadow-black/45"
        align="end"
      >
        <div>
          <h5>Settings</h5>

          <div className="mt-4">
            <AccessibilitySettings />
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-xs text-muted-foreground">Playback</Label>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200/10 bg-slate-900/65 p-3 transition-colors hover:border-cyan-200/25 hover:bg-slate-900/85">
              <span className="text-xs font-semibold text-zinc-100">
                Direct play from search
              </span>
              <Switch
                checked={directPlay}
                onCheckedChange={handleDirectPlayToggle}
                aria-label="Toggle direct play from search results"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
