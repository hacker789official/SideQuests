import { AnimeList } from "@/components/anime-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Popular Anime",
    description: "Popular Anime, sourced from AniList.",
  }
}

export const revalidate = 21600

export default async function PopularAnime({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <AnimeList
      type="ANIME"
      sort="popular"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title="Popular Anime"
      description="Popular Anime, sourced from AniList."
          searchParams={resolvedSearchParams}
    />
  )
}
