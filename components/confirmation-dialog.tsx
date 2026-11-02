"use client"

import { useState } from "react"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Label } from "./ui/label"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  showDontAskAgain?: boolean
  onDontAskAgainChange?: (dontAskAgain: boolean) => void
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showDontAskAgain = false,
  onDontAskAgainChange,
}: ConfirmationDialogProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    if (dontAskAgain && onDontAskAgainChange) {
      onDontAskAgainChange(true)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-cyan-500/20 bg-[#071426] text-slate-100 shadow-2xl shadow-black/50">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {showDontAskAgain && (
          <div className="flex items-center space-x-2 py-4">
            <input
              type="checkbox"
              id="dontAskAgain"
              className="size-4 rounded border-cyan-400/40 bg-[#0b2038] text-primary focus:ring-primary"
              checked={dontAskAgain}
              onChange={(e) => {
                setDontAskAgain(e.target.checked)
                if (onDontAskAgainChange) {
                  onDontAskAgainChange(e.target.checked)
                }
              }}
            />
            <Label htmlFor="dontAskAgain">Don&apos;t ask again</Label>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
