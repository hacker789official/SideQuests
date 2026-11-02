

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const REGION_REGEX = /^[A-Z]{2}$/
const PIN_REGEX = /^\d{4,8}$/

export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== "string") return ""
  
  let clean = input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()

  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean
}

export function validateEmail(email: unknown): { valid: boolean; value: string; error?: string } {
  if (typeof email !== "string") {
    return { valid: false, value: "", error: "Email must be a string." }
  }

  const cleanEmail = email.toLowerCase().trim()

  if (cleanEmail.length === 0 || cleanEmail.length > 254) {
    return { valid: false, value: "", error: "Email length must be between 1 and 254 characters." }
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, value: "", error: "Invalid email format." }
  }

  return { valid: true, value: cleanEmail }
}

export function validatePin(pin: unknown): { valid: boolean; value: string; error?: string } {
  if (typeof pin !== "string" && typeof pin !== "number") {
    return { valid: false, value: "", error: "PIN must be a string or number." }
  }

  const strPin = String(pin).trim()

  if (!PIN_REGEX.test(strPin)) {
    return { valid: false, value: "", error: "PIN must consist of 4 to 8 numeric digits." }
  }

  return { valid: true, value: strPin }
}

export function validateTmdbId(id: unknown): { valid: boolean; value: number; error?: string } {
  const num = Number(id)
  if (!Number.isInteger(num) || num <= 0 || num > 10000000) {
    return { valid: false, value: 0, error: "Invalid TMDB ID. Must be a positive integer." }
  }
  return { valid: true, value: num }
}

export function validateMediaType(type: unknown): { valid: boolean; value: "movie" | "tv"; error?: string } {
  if (type === "movie" || type === "tv") {
    return { valid: true, value: type }
  }
  return { valid: false, value: "movie", error: "Invalid media type. Must be 'movie' or 'tv'." }
}

export function validateRegionCode(region: unknown): { valid: boolean; value: string; error?: string } {
  if (typeof region !== "string") {
    return { valid: false, value: "US", error: "Region must be a string." }
  }

  const cleanRegion = region.toUpperCase().trim()
  if (!REGION_REGEX.test(cleanRegion)) {
    return { valid: false, value: "US", error: "Region must be a 2-letter uppercase ISO code." }
  }

  return { valid: true, value: cleanRegion }
}

export function sanitizePayload<T extends Record<string, any>>(
  payload: unknown,
  allowedKeys: Array<keyof T>
): Partial<T> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {}
  }

  const cleanObject: Partial<T> = {}
  const keySet = new Set(allowedKeys.map(String))

  for (const [key, value] of Object.entries(payload)) {
    if (keySet.has(key)) {
      if (typeof value === "string") {
        cleanObject[key as keyof T] = sanitizeString(value) as any
      } else {
        cleanObject[key as keyof T] = value
      }
    }
  }

  return cleanObject
}
