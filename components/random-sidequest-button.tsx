"use client"

import { useRouter } from "next/navigation"
import { Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"

const SIDEQUEST_DESTINATIONS = [
  "/movie/550",
  "/movie/238",
  "/tv/1399",
  "/tv/94954",
  "/anime/21",
  "/anime/20",
  "/manga/21",
  "/manga/113415",
]

export function RandomSideQuestButton() {
  const router = useRouter()

  function chooseSideQuest() {
    const currentPath = window.location.pathname
    const options = SIDEQUEST_DESTINATIONS.filter((path) => path !== currentPath)
    const nextPath = options[Math.floor(Math.random() * options.length)] || SIDEQUEST_DESTINATIONS[0]
    router.push(nextPath)
  }

  return (
    <Button type="button" onClick={chooseSideQuest} variant="outline" className="rounded-full border-primary/50 text-primary hover:bg-primary/10">
      <Shuffle className="mr-2 size-4" />
      Random SideQuest
    </Button>
  )
}
