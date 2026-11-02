import {
  CalendarIcon,
  ClapperboardIcon,
  HeartIcon,
  HomeIcon,
  Library,
  LucideIcon,
  PlayIcon,
  RadioTowerIcon,
  ShieldAlert,
  SmileIcon,
  StarIcon,
  TelescopeIcon,
  TrendingUpIcon,
  Trophy,
  TvIcon,
  User,
} from "lucide-react"

import { pages } from "@/config/pages"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "SideQuests",
  description:
    "SideQuests is your cinematic companion for discovering movies, TV shows, and anime. Find your next obsession, keep your place, and return to every story when you are ready.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {
    tmdb: "https://www.themoviedb.org",
    disclaimer: "{current.site.url}/disclaimer",
  },
  author: {
    name: "Arnav Rana",
    web: "https://arnavrana.netlify.app/",
  },
}

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  items?: NavItem[]
}

const home = {
  title: "Home",
  href: "/",
  icon: HomeIcon,
}

const disclaimer = {
  title: "Terms Of Service",
  href: "/disclaimer",
  icon: ShieldAlert,
  description: pages.disclaimer.description,
}

const movies = {
  title: "Movies",
  href: "/movie",
  icon: ClapperboardIcon,
  description: pages.movie.root.description,
  items: [
    {
      title: "Discover",
      href: "/movie/discover",
      icon: TelescopeIcon,
      description: pages.movie.discover.description,
    },
    {
      title: "Popular",
      href: "/movie/popular",
      icon: HeartIcon,
      description: pages.movie.popular.description,
    },
    {
      title: "Now Playing",
      href: "/movie/now-playing",
      icon: PlayIcon,
      description: pages.movie.nowPlaying.description,
    },
    {
      title: "Top Rated",
      href: "/movie/top-rated",
      icon: StarIcon,
      description: pages.movie.topRated.description,
    },
  ],
}

const tvShows = {
  title: "TV Shows",
  href: "/tv",
  icon: TvIcon,
  description: pages.tv.root.description,
  items: [
    {
      title: "Discover",
      href: "/tv/discover",
      icon: TelescopeIcon,
      description: pages.tv.discover.description,
    },
    {
      title: "Popular",
      href: "/tv/popular",
      icon: HeartIcon,
      description: pages.tv.popular.description,
    },
    {
      title: "Top Rated",
      href: "/tv/top-rated",
      icon: StarIcon,
      description: pages.tv.topRated.description,
    },
  ],
}

const trending = {
  title: "Trending",
  icon: TrendingUpIcon,
  href: "/trending",
  description: pages.trending.root.description,
  items: [
    {
      title: "Movies",
      href: "/trending/movie",
      icon: ClapperboardIcon,
      description: pages.trending.movie.description,
    },
    {
      title: "TV Shows",
      href: "/trending/tv",
      icon: TvIcon,
      description: pages.trending.tv.description,
    },
  ],
}

const animeManga = {
  title: "Anime & Manga",
  href: "/anime",
  icon: TvIcon,
  description: "Discover anime and manga, powered by AniList.",
  items: [
    {
      title: "Anime",
      href: "/anime",
      icon: ClapperboardIcon,
      description: "Browse trending, popular, and top rated anime.",
    },
    {
      title: "Manga",
      href: "/manga",
      icon: Library,
      description: "Browse trending, popular, and top rated manga.",
    },
  ],
}

const myLibrary = {
  title: "My Library",
  href: "/library",
  icon: Library,
}

const cartoons = {
  title: "Cartoons",
  href: "/cartoons",
  icon: SmileIcon,
  description: "Browse animated movies and series by language.",
}

export const navigation = {
  items: [home, movies, tvShows, cartoons, trending, animeManga, myLibrary] as NavItem[],
}

{
  
}

export const availableParams = [
  "with_genres",
  "with_original_language",
  "with_watch_providers",
  "with_companies",
  "with_networks",
  "primary_release_date.gte",
  "primary_release_date.lte",
  "first_air_date.gte",
  "first_air_date.lte",
  "vote_average.gte",
  "vote_average.lte",
  "vote_count.gte",
  "vote_count.lte",
]
