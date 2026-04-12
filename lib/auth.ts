import { createSupabaseClient } from "./supabase/client"
import type { AuthResult } from "./types"

/**
 * Signs in with email and password using the browser-side Supabase client.
 * Safe to call from Client Components.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    return {
      success: false,
      error: error?.message ?? "Sign in failed. Please try again.",
    }
  }

  return { success: true, session: data.session }
}

/**
 * Signs out the current user using the browser-side Supabase client.
 * Safe to call from Client Components.
 */
export async function signOut(): Promise<void> {
  const supabase = createSupabaseClient()
  await supabase.auth.signOut()
}
