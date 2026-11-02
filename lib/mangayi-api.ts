export type MangaYiRelease = {
  id: string
  title: string
  chapter: string
  sourceUrl: string
  readerUrl: string
  source: "mangayi"
}

export type MangaYiResponse = {
  results: MangaYiRelease[]
  total: number
  page: number
  source: "mangayi"
}

export const MANGAYI_ORIGIN = "https://mangayi.com"

export async function searchMangaYi(query: string, page = 1): Promise<MangaYiResponse> {
  const response = await fetch(`${MANGAYI_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "SideQuests-public-catalog/1.0",
    },
    body: JSON.stringify({ s: query.trim().toLowerCase().slice(0, 80), p: page }),
    next: { revalidate: 3600 },
  })

  if (!response.ok) throw new Error(`MangaYi request failed (${response.status})`)
  return normalizeMangaYiResponse(await response.json(), page)
}

export function normalizeMangaYiResponse(payload: any, page = 1): MangaYiResponse {
  const results = Array.isArray(payload?.results)
    ? payload.results
        .filter((item: any) => item?.i && item?.t)
        .map((item: any) => {
          const id = String(item.i)
          const chapter = String(item.c ?? "")
          return {
            id,
            title: String(item.t),
            chapter,
            sourceUrl: `${MANGAYI_ORIGIN}/read/${encodeURIComponent(id)}/chapter/${encodeURIComponent(chapter)}/`,
            readerUrl: `${MANGAYI_ORIGIN}/read/${encodeURIComponent(id)}/chapter/${encodeURIComponent(chapter)}/`,
            source: "mangayi" as const,
          }
        })
    : []

  return {
    results,
    total: Number(payload?.total || 0),
    page,
    source: "mangayi",
  }
}
