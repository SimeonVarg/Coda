"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type UpsertResult =
  | { success: true }
  | { success: false; error: string }

export async function upsertStudentProfile(
  studentId: string,
  data: { grade_level: string; instrument: string; goals: string }
): Promise<UpsertResult> {
  const { grade_level, instrument, goals } = data

  // Validate at least one field is non-empty
  if (!grade_level.trim() && !instrument.trim() && !goals.trim()) {
    return { success: false, error: "Please fill in at least one field." }
  }

  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated." }
  }

  // Block demo users from writing
  if (user.user_metadata?.is_demo === true) {
    return { success: false, error: "Saving is disabled in demo mode." }
  }

  const { error } = await supabase
    .from("student_profiles")
    .upsert(
      {
        student_id: studentId,
        grade_level: grade_level.trim() || null,
        instrument: instrument.trim() || null,
        goals: goals.trim() || null,
        updated_by: user.id,
      },
      { onConflict: "student_id" }
    )

  if (error) {
    console.error("upsertStudentProfile error:", error.code, error.message)
    return { success: false, error: "Failed to save profile. Please try again." }
  }

  revalidatePath(`/students/${studentId}/profile`)
  revalidatePath(`/progress/${studentId}`)

  return { success: true }
}
