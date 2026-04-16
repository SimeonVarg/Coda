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
  tradition?: string | null
  region?: string | null
  tuning_system?: string | null
  cultural_context?: string | null
  language?: string | null
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


// ---- Practice Journal ----
export type PracticeJournalEntry = {
  id: string
  student_id: string
  entry_date: string
  duration_min: number
  mood: 1 | 2 | 3 | 4 | 5
  notes: string | null
  created_at: string
  metronome_logs?: MetronomeLog[]
}

export type MetronomeLog = {
  id: string
  journal_entry_id: string
  catalog_item_id: string
  catalog_item_title?: string
  bpm_start: number
  bpm_end: number | null
  note: string | null
}

export type MetronomeLogDraft = {
  key: string
  catalog_item_id: string
  catalog_item_title: string
  bpm_start: number
  bpm_end: number | null
  note: string
}

// ---- Technique Milestones ----
export type MilestoneStatus = 'not_started' | 'in_progress' | 'achieved'
export type MilestoneDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Virtuoso'

export type TechniqueMilestone = {
  id: string
  name: string
  category: string
  instrument: string | null
  difficulty: MilestoneDifficulty
  description: string | null
  is_seed: boolean
}

export type StudentMilestone = {
  id: string
  student_id: string
  milestone_id: string
  teacher_id: string
  status: MilestoneStatus
  achieved_at: string | null
  created_at: string
  milestone: TechniqueMilestone
}

// ---- Lesson Reflections ----
export type LessonReflection = {
  id: string
  lesson_entry_id: string
  student_id: string
  self_rating: 1 | 2 | 3 | 4 | 5
  went_well: string | null
  was_challenging: string | null
  next_goal: string | null
  created_at: string
  updated_at: string
}

// ---- Curriculum Planner ----
export type CurriculumPlan = {
  id: string
  teacher_id: string
  student_id: string
  title: string
  target_date: string
  is_active: boolean
  created_at: string
  items?: CurriculumPlanItem[]
}

export type PlanItemType = 'repertoire' | 'technique' | 'theory' | 'performance' | 'other'
export type PlanItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export type CurriculumPlanItem = {
  id: string
  plan_id: string
  title: string
  item_type: PlanItemType
  sort_order: number
  target_date: string | null
  catalog_item_id: string | null
  milestone_id: string | null
  notes: string | null
  status: PlanItemStatus
  completed_at: string | null
  created_at: string
}
