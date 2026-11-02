"use client"

import { Play, Radio } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface SportsWatchDialogProps {
  lang: string
}

export const SportsWatchDialog: React.FC<SportsWatchDialogProps> = ({
  lang,
}) => {
  return (
    <Dialog modal>
      <DialogTrigger className={cn("mr-2 font-semibold", buttonVariants())}>
        <Play className="mr-2 size-4 fill-current" /> Stream Live
      </DialogTrigger>

      <DialogContent className="max-w-screen-lg p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl">
        <DialogTitle className="sr-only">Live Stream Player</DialogTitle>
        <DialogDescription className="sr-only">
          Demo sports live stream player template.
        </DialogDescription>

        <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4 py-3">
          <div className="flex items-center space-x-2">
            <Radio className="size-4 text-red-500 animate-pulse" />
            <span className="text-sm font-bold text-zinc-200">
              Live Sports Broadcast ({lang === "hin" ? "Hindi Commentary" : "English Commentary"})
            </span>
          </div>
          <span className="text-xs bg-red-600/20 border border-red-600/40 text-red-400 font-bold px-2 py-0.5 rounded">
            TEMPLATE DEMO
          </span>
        </div>

        <div className="relative aspect-video w-full bg-zinc-900 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="size-16 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <Play className="size-8 ml-1" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base font-bold text-zinc-200">Sports Stream Player Template</h4>
            <p className="text-xs text-zinc-400">
              Connect your official live streaming provider or video player API endpoint here.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

