import Link from "next/link"
import { tmdb } from "@/tmdb/api"

import { CartoonProviderRail } from "@/components/cartoon-provider-rail"
import { ListPagination } from "@/components/list-pagination"
import { MovieCard } from "@/components/movie-card"
import { TvCard } from "@/components/tv-card"

export const revalidate = 604800

const languageOptions = [
  { code: "", label: "All languages" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ko", label: "Korean" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
]

interface CartoonsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function CartoonsPage({
  searchParams,
}: CartoonsPageProps) {
  const params = await searchParams
  const page = first(params.page) || "1"
  const lang = first(params.lang) || ""
  const base = {
    page,
    sort_by: "popularity.desc" as const,
    with_genres: "16",
    with_original_language: lang || undefined,
  }
  const [
    { results: movies, total_pages: moviePages, page: moviePage },
    { results: shows, total_pages: tvPages },
  ] = await Promise.all([tmdb.discover.movie(base), tmdb.discover.tv(base)])

  return (
    <div className="container space-y-8 pb-20">
      <header className="space-y-2 pt-4 md:pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
          Family quest
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Cartoons in your language
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Browse animated movies and series by original language. Audio and
          subtitle availability depends on the selected official source.
        </p>
      </header>

      <nav
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        aria-label="Cartoon languages"
      >
        {languageOptions.map((option) => (
          <Link
            key={option.code || "all"}
            href={option.code ? `/cartoons?lang=${option.code}` : "/cartoons"}
            prefetch={false}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
              lang === option.code
                ? "border-primary bg-primary text-primary-foreground"
                : "border-cyan-300/15 bg-[#0b2038]/80 text-slate-200 hover:border-cyan-300/45 hover:bg-cyan-300/10"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <CartoonProviderRail />

      <section className="space-y-4">
        <div className="sidequests-section-heading">
          <div>
            <p>Animated films</p>
            <h2>
              {lang
                ? `${
                    languageOptions.find((option) => option.code === lang)
                      ?.label || lang
                  } movie picks`
                : "Popular cartoon movies"}
            </h2>
          </div>
        </div>
        <div className="grid-list">
          {movies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="sidequests-section-heading">
          <div>
            <p>Animated series</p>
            <h2>
              {lang
                ? `${
                    languageOptions.find((option) => option.code === lang)
                      ?.label || lang
                  } series picks`
                : "Popular cartoon series"}
            </h2>
          </div>
        </div>
        <div className="grid-list">
          {shows.map((show) => (
            <div key={show.id} className="flex flex-col gap-3">
              <TvCard {...show} />
              <Link
                href={`/tv/${show.id}/seasons`}
                prefetch={false}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
              >
                Browse seasons &amp; episodes
              </Link>
            </div>
          ))}
        </div>
      </section>

      {(moviePages > 1 || tvPages > 1) && (
        <ListPagination
          currentPage={moviePage}
          totalPages={Math.max(moviePages || 1, tvPages || 1)}
        />
      )}
    </div>
  )
}
