const ACCOUNT_USERNAME_KEY = "sidequestsAccountUsername"

export interface SyncCredentials {
  email: string
  pin: string
}

export const getSyncCredentials = (): SyncCredentials | null => {
  if (typeof window === "undefined") return null
  const username = localStorage.getItem(ACCOUNT_USERNAME_KEY) || localStorage.getItem("syncEmail")
  return username ? { email: username, pin: "" } : null
}

export const setSyncCredentials = (credentials: SyncCredentials | null): void => {
  if (typeof window === "undefined") return
  if (credentials) localStorage.setItem(ACCOUNT_USERNAME_KEY, credentials.email.toLowerCase().trim())
  else {
    localStorage.removeItem(ACCOUNT_USERNAME_KEY)
    localStorage.removeItem("syncEmail")
    localStorage.removeItem("syncPin")
  }
}

export const getAutoSyncEnabled = (): boolean => Boolean(getSyncCredentials())
