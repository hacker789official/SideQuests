"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  MovieWithMediaType,
  PersonWithMediaType,
  TvShowWithMediaType,
} from "@/tmdb/models"
import { ArrowLeft, ArrowRight, MoveUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { MovieCard } from "@/components/movie-card"
import { PersonCard } from "@/components/person-card"
import { TvCard } from "@/components/tv-card"

interface TrendCarouselProps {
  title?: string
  link?: string
  items: MovieWithMediaType[] | TvShowWithMediaType[] | PersonWithMediaType[]
  type: "movie" | "tv" | "person"
}

const railDescriptions = {
  movie: "The films everyone is circling right now",
  tv: "Series worth making room for",
  person: "The faces behind your next obsession",
}

export const TrendCarousel: React.FC<TrendCarouselProps> = ({
  title,
  link,
  items,
  type,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    const updatePosition = () => setCurrent(api.selectedScrollSnap() + 1)
    setTotal(api.scrollSnapList().length)
    updatePosition()
    api.on("select", updatePosition)
    return () => {
      api.off("select", updatePosition)
    }
  }, [api])

  return (
    <Carousel
      opts={{ dragFree: true, align: "start" }}
      setApi={setApi}
      className="streamhub-rail group/rail relative -mx-1 px-4 sm:px-6 lg:px-10"
    >
      <div className="sidequests-section-heading px-1">
        <div>
          <p>{railDescriptions[type]}</p>
          <h2>{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {link && (
            <Link
              href={link}
              prefetch={false}
              className="group/explore inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-cyan-100"
            >
              Explore
              <MoveUpRight className="size-3.5 transition-transform duration-200 group-hover/explore:-translate-y-0.5 group-hover/explore:translate-x-0.5" />
            </Link>
          )}
          <span className="hidden text-[10px] font-semibold tabular-nums text-zinc-600 sm:inline">
            {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="relative">
        <Button
          onClick={() => api?.scrollPrev()}
          size="icon"
          variant="ghost"
          className="absolute left-0 top-0 z-30 hidden h-full w-10 rounded-none bg-zinc-950/65 text-white opacity-0 backdrop-blur-sm transition-all group-hover/rail:opacity-100 hover:bg-zinc-950/85 hover:text-cyan-100 md:flex sm:w-12"
          aria-label="Previous titles"
        >
          <ArrowLeft className="size-6" />
        </Button>
        <Button
          onClick={() => api?.scrollNext()}
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 z-30 hidden h-full w-10 rounded-none bg-zinc-950/65 text-white opacity-0 backdrop-blur-sm transition-all group-hover/rail:opacity-100 hover:bg-zinc-950/85 hover:text-cyan-100 md:flex sm:w-12"
          aria-label="Next titles"
        >
          <ArrowRight className="size-6" />
        </Button>

        <CarouselContent className="-ml-2.5 py-5 md:-ml-3.5">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className={cn(
                "basis-[39%] pl-2.5 sm:basis-1/3 md:basis-1/4 md:pl-3.5 lg:basis-[19%] xl:basis-[16.5%]",
                "transition-transform duration-300"
              )}
            >
              {item.media_type === "tv" ? (
                <TvCard {...item} />
              ) : item.media_type === "person" ? (
                <PersonCard {...item} />
              ) : (
                <MovieCard {...item} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  )
}
