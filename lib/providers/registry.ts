import { MediaKind, MediaProvider } from "./types"

/**
 * Simple in-memory registry. Deliberately not a plugin framework —
 * just register/lookup by id or by media kind.
 */
const providers = new Map<string, MediaProvider>()

export const registerProvider = (provider: MediaProvider): void => {
  if (providers.has(provider.id)) {
    console.warn(
      `[providers] "${provider.id}" is already registered; overwriting.`
    )
  }
  providers.set(provider.id, provider)
}

export const getProvider = (id: string): MediaProvider | undefined =>
  providers.get(id)

export const getAllProviders = (): MediaProvider[] =>
  Array.from(providers.values())

/** All registered providers that declare support for a given media kind. */
export const getProvidersFor = (kind: MediaKind): MediaProvider[] =>
  getAllProviders().filter((provider) => provider.supports.includes(kind))
