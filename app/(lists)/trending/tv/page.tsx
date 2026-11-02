import { pages } from "@/config"

import { TrendList } from "@/components/trend-list"

interface TrendingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Trending TV Shows",
    description: pages.trending.tv.description,
  }
}

export const revalidate = 604800 

export default async function TrendingPage({
  searchParams,
}: TrendingPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <TrendList
      type="tv"
      time="day"
      title="Trending TV Shows"
      description={pages.trending.tv.description}
      page={(resolvedSearchParams?.page as string) ?? "1"}
    />
  )
}
