"use client"

import { useEffect, useState } from "react"
import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { getDirectSearchPlayEnabled, setDirectSearchPlayEnabled } from "@/lib/watch-data"
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
        <Button variant="outline" size="icon" className="shrink-0 rounded-full size-9 bg-zinc-950/40 backdrop-blur-md border border-zinc-800/80 text-zinc-300 hover:bg-white/5 hover:border-zinc-700 hover:text-white transition-all shadow-sm">
          <SettingsIcon className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-4" align="end">
        <div>
          <h5>Settings</h5>


          <div className="mt-4">
            <AccessibilitySettings />
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-xs text-muted-foreground">Playback</Label>
            <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
              <span className="text-xs font-medium text-zinc-200">Direct Play from Search</span>
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
