import { AniListMedia } from "@/anilist/models/media"

export function preferredTitle(media: Pick<AniListMedia, "title">): string {
  return media.title.english || media.title.romaji || media.title.native || "Untitled"
}

export function mediaYear(media: Pick<AniListMedia, "seasonYear" | "startDate">): string | null {
  const year = media.seasonYear ?? media.startDate?.year
  return year ? String(year) : null
}

export function formatLabel(format: string | null): string {
  if (!format) return ""
  return format
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function stripDescriptionHtml(description: string | null): string {
  if (!description) return ""
  return description.replace(/<[^>]+>/g, "").trim()
}

export function scoreToTenPoint(averageScore: number | null): number | null {
  if (averageScore === null) return null
  return Math.round((averageScore / 10) * 10) / 10
}
