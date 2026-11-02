# SideQuests

A cinematic web app for discovering movies, TV shows, and anime, built with Next.js 15, Tailwind CSS, and Radix UI. Powered by the TMDB API and AniList.

SideQuests helps you find your next obsession, explore rich media details, select seasons and episodes, and return to titles you have already started.

Built by [Arnav Rana](https://arnavrana.netlify.app/).

## Features

- **Media Discovery**: Browse movies, TV series, anime, and cast details with genre, date, language, and rating filters.
- **Cinematic Home**: Explore trending releases through immersive hero sections and carousels.
- **VidLink HD Player**: Selected movies and TV episodes generate deterministic VidLink URLs with the configured embedded-player customization parameters.
- **Continue Watching**: Recently explored titles are stored in the browser and can be resumed from the home page.
- **Watch History**: A separate local-storage-backed history section is available on the home page and in My Library.
- **Local Privacy**: Watch history, progress, and the history preference remain available in local storage without requiring Supabase.
- **Optional Account Sync**: Existing account-sync features remain available elsewhere in the application when configured.
- **Responsive Layout**: Designed for mobile, tablet, and desktop screens with a dark cinematic visual system.

## Tech Stack

- **Framework**: Next.js 15 App Router, React 18
- **Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons
- **Data & API**: TMDB API v3, AniList GraphQL
- **Playback**: VidLink embedded player
- **Carousels**: Embla Carousel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- TMDB API key and read token

### Setup

1. Clone the repository and enter the SideQuests directory:
   ```bash
   git clone <your-sidequests-repository-url>
   cd sidequests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   TMDB_API_KEY=
   TMDB_READ_TOKEN=

   # Required by the existing optional account-sync/auth features
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` — Starts the development server.
- `npm run build` — Builds the application for production.
- `npm run start` — Runs the built production server.
- `npm run lint` — Runs Next.js lint checks.
- `npm run typecheck` — Runs TypeScript type checking.
- `npm run format:write` — Formats code with Prettier.

## License

Distributed under the MIT License. See `LICENSE` for details.
