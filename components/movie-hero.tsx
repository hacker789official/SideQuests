import Link from "next/link"
import { Movie } from "@/tmdb/models"
import { Play, Zap } from "lucide-react"

import { MediaBackdrop } from "@/components/media-backdrop"

interface MovieHeroProps {
  movies: Movie[]
  label: string
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movies, label }) => {
  const item = movies[0]

  if (!item) {
    return (
      <section
        className="sq-stage sq-stage--empty"
        aria-label="Featured titles"
      >
        <div className="sq-stage__empty-copy">
          <span className="sq-stage__eyebrow">
            <Zap className="size-4" /> {label}
          </span>
          <h1>
            Find your <em>next story.</em>
          </h1>
          <p>
            Movies, series, anime and cartoons—your next detour starts here.
          </p>
          <Link className="sq-stage__play" href="/movie/popular">
            EXPLORE
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="sq-stage" aria-label="Featured title">
      <div className="sq-stage__art" aria-hidden="true">
        <MediaBackdrop
          image={item.backdrop_path}
          alt=""
          priority
          className="sq-stage__image"
        />
      </div>
      <div className="sq-stage__shade" aria-hidden="true" />
      <div className="sq-stage__grid">
        <div className="sq-stage__copy">
          <div className="sq-stage__eyebrow">
            <span>
              <Zap className="size-3.5" />
            </span>
            {label}
          </div>
          <h1 className="sq-stage__title">{item.title}</h1>
          <div className="sq-stage__meta">
            <span>{item.release_date?.slice(0, 4) || "NEW"}</span>
            {item.vote_average > 0 && (
              <>
                <span className="sq-stage__dot" />
                <span>{item.vote_average.toFixed(1)} / 10</span>
              </>
            )}
          </div>
          <p className="sq-stage__overview">
            {item.overview || "A new world is one good choice away."}
          </p>
          <div className="sq-stage__actions">
            <Link
              href={`/movie/${item.id}?play=true`}
              className="sq-stage__play"
              prefetch={false}
            >
              <Play className="size-4 fill-current" /> PLAY TITLE
            </Link>
          </div>
        </div>
      </div>
      <span className="sq-stage__index" aria-hidden="true">
        SIDEQUESTS / FEATURED
      </span>
    </section>
  )
}
