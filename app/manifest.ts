import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SideQuests",
    short_name: "SideQuests",
    description: "Discover, stream, and keep your place across movies, shows, anime, and manga.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#060b12",
    theme_color: "#060b12",
    categories: ["entertainment", "video", "books"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
