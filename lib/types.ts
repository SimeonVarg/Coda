import type { Session as SupabaseSession } from "@supabase/supabase-js"

// Re-export Supabase Session for use across the app
export type Session = SupabaseSession

export type UserRole = "teacher" | "student"

export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string }

export type StudentSummary = {
  id: string
  full_name: string
  last_lesson_date: string | null
  lesson_count: number
  has_recent_lesson: boolean
  pending_assignments: number
}

export type RepertoireStatus = "introduced" | "in_progress" | "mastered"

export type RepertoireItem = {
  id: string // repertoire_tags.id
  title: string
  composer: string | null
  status: RepertoireStatus
}

export type TheoryItem = {
  id: string
  title: string
  status: "completed"
}

export type LessonEntryTag = {
  id: string
  title: string
  type: "repertoire" | "theory"
  status: RepertoireStatus | "completed"
}

export type ProgressTreeData = {
  repertoire_items: RepertoireItem[]
  completed_theory: TheoryItem[]
  lesson_entries?: Array<{ id: string; created_at: string; content: JSONContent; tags: LessonEntryTag[] }>
}

export type CatalogItem = {
  id: string
  title: string
  type: "repertoire" | "theory"
  composer: string | null
}

export type TagWithStatus = {
  item: CatalogItem
  status: RepertoireStatus | "completed"
}

export type StudentProfile = {
  grade_level: string | null
  instrument: string | null
  goals: string | null
}

export type AssignmentDraft = {
  key: string
  description: string
  due_date: string | null  // ISO date "YYYY-MM-DD" or null
}

export type AssignmentRow = {
  id: string
  description: string
  due_date: string | null
  completed_at: string | null
  lesson_entry_date: string
}

// Tiptap JSONContent type
export type JSONContent = {
  type: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  text?: string
}
