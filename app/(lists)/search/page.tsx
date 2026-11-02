import { redirect } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { MangaDexSearchCard } from "@/components/mangadex-search-card"
import { ListPagination } from "@/components/list-pagination"
import { SearchResultCard } from "@/components/search-result-card"
import { searchManga } from "@/lib/mangadex-api"
import { searchMangaYi } from "@/lib/mangayi-api"
import { tmdb } from "@/tmdb/api"

export const revalidate = 86400

interface SearchProps {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q?.trim() || ""
  return {
    title: query ? `Search results for: ${query}` : "Search SideQuests",
  }
}

export default async function Search({ searchParams }: SearchProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q?.trim() || ""
  if (!query) return redirect("/")

  const page = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)
  const [tmdbResponse, mangaDexResponse, mangaYiResponse] = await Promise.allSettled([
    tmdb.search.multi({ query, page: String(page) }),
    searchManga(query, page, 12),
    searchMangaYi(query, 1),
  ])

  const tmdbResults = tmdbResponse.status === "fulfilled" ? tmdbResponse.value : null
  const mangaDexResults = mangaDexResponse.status === "fulfilled" ? mangaDexResponse.value : null
  const mangaYiResults = mangaYiResponse.status === "fulfilled" ? mangaYiResponse.value.results.slice(0, 12) : []
  const hasResults = Boolean(tmdbResults?.results.length || mangaDexResults?.data.length || mangaYiResults.length)

  return (
    <div className="container h-full">
      <div className="space-y-10 pb-12">
        <div className="md:mb-12 md:mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Cross-media discovery</p>
          <h1 className="mb-2 text-2xl font-medium">Search results for</h1>
          <p className="text-xl text-muted-foreground">&quot;{query}&quot;</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1">TMDB {tmdbResults?.results.length || 0}</span>
            <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1">MangaDex {mangaDexResults?.data.length || 0}</span>
            <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1">MangaYi {mangaYiResults.length}</span>
          </div>
        </div>

        {!hasResults && (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-8 text-center">
            <h2 className="text-2xl font-semibold">No matches found</h2>
            <p className="mt-2 text-muted-foreground">Try a broader title, character, or franchise name.</p>
          </div>
        )}

        {tmdbResults?.results.length ? (
          <section className="space-y-4" aria-labelledby="tmdb-results-title">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Movies and series</p>
              <h2 id="tmdb-results-title" className="mt-1 text-xl font-black">TMDB results</h2>
            </div>
            <div className="grid-list">
              {tmdbResults.results.map((result) => <SearchResultCard key={`${result.media_type}-${result.id}`} media={result} />)}
            </div>
            <ListPagination currentPage={tmdbResults.page} totalPages={tmdbResults.total_pages} />
          </section>
        ) : null}

        {mangaDexResults?.data.length ? (
          <section className="space-y-4" aria-labelledby="mangadex-results-title">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">In-site reader</p>
              <h2 id="mangadex-results-title" className="mt-1 text-xl font-black">MangaDex results</h2>
            </div>
            <div className="grid-list">
              {mangaDexResults.data.map((manga) => <MangaDexSearchCard key={manga.id} manga={manga} />)}
            </div>
          </section>
        ) : null}

        {mangaYiResults.length ? (
          <section className="space-y-4" aria-labelledby="mangayi-results-title">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">External metadata discovery</p>
              <h2 id="mangayi-results-title" className="mt-1 text-xl font-black">MangaYi matches</h2>
              <p className="mt-1 text-sm text-muted-foreground">SideQuests links to MangaYi’s reader and does not mirror chapter images.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mangaYiResults.map((result) => (
                <a key={`${result.id}-${result.chapter}`} href={result.readerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-3 transition hover:border-primary/60 hover:bg-primary/5">
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold">{result.title}</span><span className="text-xs text-muted-foreground">Chapter {result.chapter || "latest"} · MangaYi</span></span>
                  <ExternalLink className="size-4 shrink-0 text-primary" />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
