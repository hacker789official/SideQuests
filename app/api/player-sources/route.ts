import { NextRequest, NextResponse } from "next/server"

import { getPlayerSources, type SupportedPlayerMediaType } from "@/lib/player-sources"

export async function GET(request: NextRequest) {
  const requestedType = request.nextUrl.searchParams.get("mediaType")
  const mediaType: SupportedPlayerMediaType = requestedType === "tv" ? "tv" : "movie"
  const providers = getPlayerSources(mediaType)

  return NextResponse.json(
    {
      mediaType,
      providers,
      discovery: "configured-provider-registry",
      note: "Only sources that declare support for this media type are returned. Cartoon pages use movie or TV sources according to the underlying TMDB record.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      },
    }
  )
}
