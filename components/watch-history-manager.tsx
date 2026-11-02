"use client"

import { useEffect, useState } from "react"
import { History } from "lucide-react"

import SyncDialog from "@/components/sync-dialog"
import { getSyncCredentials } from "@/lib/sync-config"
import { getWatchHistoryEnabled, setWatchHistoryEnabled } from "@/lib/watch-data"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

interface WatchHistoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WatchHistoryManager({
  open,
  onOpenChange,
}: WatchHistoryManagerProps) {
  const [enabled, setEnabled] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (open) {
      const credentials = getSyncCredentials()
      const logged = !!credentials
      setIsLoggedIn(logged)
      
      if (logged) {
        setEnabled(getWatchHistoryEnabled())
      } else {
        setEnabled(false)
      }
    }
  }, [open])

  const handleToggle = (checked: boolean) => {
    if (!isLoggedIn) {
      
      setShowSyncDialog(true)
      return
    }

    setEnabled(checked)
    try {
      setWatchHistoryEnabled(checked)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-t-4 border-t-primary">
          <DialogHeader>
            <DialogTitle>Manage Watch History</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Watch History</Label>
                <p className="text-sm text-muted-foreground">
                  Track your watched movies and shows
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={handleToggle} />
            </div>

            {enabled && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSyncDialog(true)}
                  disabled={!isLoggedIn}
                >
                  <History className="mr-2 size-4" />
                  Sync History
                </Button>
                {!isLoggedIn && (
                  <p className="text-xs text-center text-destructive font-semibold mt-1">
                    ⚠️ Please link your device first using the Account button in the header to sync history.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </>
  )
}
