import { validateEmail } from "@/lib/security/validation"
import { signInAccount, signUpAccount, signOutAccount, getAccountSession } from "@/lib/cloud-account"

export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin)) return { valid: false, error: "PIN must contain exactly 4 digits." }
  return { valid: true }
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!/^[a-z0-9_]{3,20}$/i.test(username)) return { valid: false, error: "Username must be 3–20 characters using letters, numbers, or underscores." }
  return { valid: true }
}

export async function signUpWithEmail(email: string, displayName: string, username: string, pin: string) {
  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) return { error: emailCheck.error ?? "Invalid email." }
  const usernameCheck = validateUsername(username)
  if (!usernameCheck.valid) return { error: usernameCheck.error }
  const pinCheck = validatePin(pin)
  if (!pinCheck.valid) return { error: pinCheck.error }
  try { return { data: await signUpAccount(emailCheck.value, displayName.trim(), username.trim(), pin) } } catch (error) { return { error: error instanceof Error ? error.message : "Unable to create account." } }
}

export async function signInWithEmail(username: string, pin: string) {
  const usernameCheck = validateUsername(username)
  if (!usernameCheck.valid) return { error: usernameCheck.error }
  const pinCheck = validatePin(pin)
  if (!pinCheck.valid) return { error: pinCheck.error }
  try { return { data: await signInAccount(username.trim(), pin) } } catch (error) { return { error: error instanceof Error ? error.message : "Unable to sign in." } }
}

export async function signOut() { try { return { data: await signOutAccount() } } catch (error) { return { error: error instanceof Error ? error.message : "Unable to sign out." } } }
export async function getCurrentSession() { try { return (await getAccountSession()).account } catch { return null } }
export const verifySignUpCode = async (_email?: string, _code?: string) => ({ error: "Email verification is not used. Your email and PIN account is ready immediately." })
export const resendSignUpCode = async (_email?: string) => ({ error: "Email verification is not used for SideQuests accounts." })
