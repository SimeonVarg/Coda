import type { User } from "@supabase/supabase-js"

/**
 * Returns true if the user is a pre-seeded demo account.
 * Detection relies solely on the `is_demo` flag in user_metadata.
 */
export function isDemoUser(user: User | null): boolean {
  return user?.user_metadata?.is_demo === true
}

/**
 * Returns demo credentials for the given role, or null if any
 * NEXT_PUBLIC_DEMO_* env var is missing.
 */
export function getDemoCredentials(
  role: "teacher" | "student"
): { email: string; password: string } | null {
  const teacherEmail = process.env.NEXT_PUBLIC_DEMO_TEACHER_EMAIL
  const teacherPassword = process.env.NEXT_PUBLIC_DEMO_TEACHER_PASSWORD
  const studentEmail = process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL
  const studentPassword = process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD

  if (!teacherEmail || !teacherPassword || !studentEmail || !studentPassword) {
    return null
  }

  return role === "teacher"
    ? { email: teacherEmail, password: teacherPassword }
    : { email: studentEmail, password: studentPassword }
}

/** Fixed UUID of the primary demo student (for redirect after student demo login). */
export const DEMO_STUDENT_ID =
  process.env.NEXT_PUBLIC_DEMO_STUDENT_ID ?? "aaaaaaaa-bbbb-cccc-dddd-000000000002"

/** Returns true when all four demo credential env vars are present. */
export const demoEnabled = !!(
  process.env.NEXT_PUBLIC_DEMO_TEACHER_EMAIL &&
  process.env.NEXT_PUBLIC_DEMO_TEACHER_PASSWORD &&
  process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL &&
  process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD
)
