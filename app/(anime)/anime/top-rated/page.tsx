import { AnimeList } from "@/components/anime-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Top Rated Anime",
    description: "Top rated Anime, sourced from AniList.",
  }
}

export const revalidate = 21600

export default async function TopRatedAnime({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <AnimeList
      type="ANIME"
      sort="topRated"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title="Top Rated Anime"
      description="Top rated Anime, sourced from AniList."
          searchParams={resolvedSearchParams}
    />
  )
}
