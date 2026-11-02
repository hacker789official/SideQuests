"use server"

import { cookies } from "next/headers"
import { validateRegionCode } from "@/lib/security/validation"

export async function setRegion(region: string) {
  const validation = validateRegionCode(region)
  if (!validation.valid) {
    console.error("[Security] Invalid region code provided to setRegion:", region)
    return
  }

  (await cookies()).set("region", validation.value, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}
