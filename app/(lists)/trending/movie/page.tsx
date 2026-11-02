import { pages } from "@/config"

import { TrendList } from "@/components/trend-list"

interface TrendingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Trending Movies",
    description: pages.trending.movie.description,
  }
}

export const revalidate = 604800 

export default async function TrendingPage({
  searchParams,
}: TrendingPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <TrendList
      type="movie"
      time="day"
      title="Trending Movies"
      description={pages.trending.movie.description}
      page={(resolvedSearchParams?.page as string) ?? "1"}
    />
  )
}
