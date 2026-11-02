import { NextRequest, NextResponse } from "next/server"

const MANGADEX_API = "https://api.mangadex.org"

const proxyJson = async (url: string, revalidate = 900) => {
  const response = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: "Manga provider request failed", status: response.status },
      { status: response.status }
    )
  }

  return NextResponse.json(await response.json())
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get("title")?.trim()
  const mangaId = searchParams.get("mangaId")?.trim()
  const chapterId = searchParams.get("chapterId")?.trim()
  const imageUrl = searchParams.get("image")?.trim()

  if (imageUrl) {
    try {
      const remoteUrl = new URL(imageUrl)
      if (remoteUrl.protocol !== "https:" || /^(localhost|127\\.|0\\.0\\.0\\.0|10\\.|192\\.168\\.)/i.test(remoteUrl.hostname)) {
        return NextResponse.json({ error: "Invalid image host" }, { status: 400 })
      }

      const response = await fetch(remoteUrl, {
        next: { revalidate: 3600 },
        headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
      })
      if (!response.ok) return NextResponse.json({ error: "Image unavailable" }, { status: response.status })

      return new NextResponse(await response.arrayBuffer(), {
        headers: {
          "Content-Type": response.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      })
    } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }
  }

  if (chapterId) {
    return proxyJson(`${MANGADEX_API}/at-home/server/${encodeURIComponent(chapterId)}`, 600)
  }

  if (mangaId) {
    const feedParams = new URLSearchParams({
      limit: "500",
      "order[chapter]": "asc",
      "order[volume]": "asc",
    })
    feedParams.append("translatedLanguage[]", "en")
    return proxyJson(
      `${MANGADEX_API}/manga/${encodeURIComponent(mangaId)}/feed?${feedParams.toString()}`,
      900
    )
  }

  if (title) {
    const searchParams = new URLSearchParams({
      title,
      limit: "10",
      "order[relevance]": "desc",
    })
    return proxyJson(`${MANGADEX_API}/manga?${searchParams.toString()}`, 3600)
  }

  return NextResponse.json(
    { error: "Provide title, mangaId, or chapterId" },
    { status: 400 }
  )
}
