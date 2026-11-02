import { AnimeList } from "@/components/anime-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Trending Anime",
    description: "Trending Anime, sourced from AniList.",
  }
}

export const revalidate = 21600

export default async function TrendingAnime({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <AnimeList
      type="ANIME"
      sort="trending"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title="Trending Anime"
      description="Trending Anime, sourced from AniList."
          searchParams={resolvedSearchParams}
    />
  )
}
