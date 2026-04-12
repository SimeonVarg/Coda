import { createSupabaseServerClient } from "./supabase/server"
import type { Session, UserRole } from "./types"

/**
 * Returns the current session, verified with a live Supabase getUser() call.
 * Must be called from a Server Component or Route Handler only.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  // Verify the token is still valid with a live check
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return session
}

/**
 * Extracts the user's role directly from a live getUser() call — always accurate.
 * Must be called from a Server Component or Route Handler only.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const role = user.app_metadata?.role
  if (role === "teacher" || role === "student") return role
  return null
}
