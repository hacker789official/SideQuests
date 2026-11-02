import { AnimeList } from "@/components/anime-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Trending Manga",
    description: "Trending Manga, sourced from AniList.",
  }
}

export const revalidate = 21600

export default async function TrendingManga({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <AnimeList
      type="MANGA"
      sort="trending"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title="Trending Manga"
      description="Trending Manga, sourced from AniList."
          searchParams={resolvedSearchParams}
    />
  )
}
