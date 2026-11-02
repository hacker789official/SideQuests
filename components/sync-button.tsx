"use client"

import { useState } from "react"
import { Cloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import SyncDialog from "@/components/sync-dialog"

export function SyncButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex w-full justify-start gap-2"
        onClick={() => setDialogOpen(true)}
      >
        <Cloud className="mr-2 size-4" />
        Sync Data
      </Button>
      <SyncDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
