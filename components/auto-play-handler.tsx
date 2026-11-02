"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface AutoPlayHandlerProps {
  tmdbid: number
  triggerDialog: () => void
}

export const AutoPlayHandler: React.FC<AutoPlayHandlerProps> = ({
  tmdbid,
  triggerDialog,
}) => {
  const searchParams = useSearchParams()
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    
    const fromHistory = searchParams.get("from") === "history"
    const autoplay = searchParams.get("autoplay") === "true"

    if (fromHistory && autoplay && !hasTriggered) {
      
      const timer = setTimeout(() => {
        triggerDialog()
        setHasTriggered(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [searchParams, triggerDialog, hasTriggered])

  return null
}
