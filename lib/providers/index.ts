import "server-only"

import { registerProvider } from "./registry"
import { tmdbProvider } from "./tmdb-provider"

export * from "./types"
export {
  registerProvider,
  getProvider,
  getAllProviders,
  getProvidersFor,
} from "./registry"
export { tmdbProvider } from "./tmdb-provider"

// Register built-in providers. Future providers (anime, manga, music)
// register themselves the same way once they exist — see README.md in
// this folder for the pattern. Do not add placeholder/fake providers
// here; only real, working ones belong in this list.
registerProvider(tmdbProvider)
