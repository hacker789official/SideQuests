"use client"

import { useState } from "react"
import { History } from "lucide-react"

import { Button } from "./ui/button"
import { WatchHistoryManager } from "./watch-history-manager"

export function WatchHistoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <History className="mr-2 size-4" />
        Watch History
      </Button>

      <WatchHistoryManager open={open} onOpenChange={setOpen} />
    </>
  )
}
