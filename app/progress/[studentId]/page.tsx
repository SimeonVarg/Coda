import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { getSession, getUserRole } from "@/lib/auth.server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ProgressTreeData, RepertoireItem, RepertoireStatus, TheoryItem,
  StudentProfile, AssignmentRow, LessonEntryTag,
  PracticeJournalEntry, StudentMilestone, TechniqueMilestone,
  LessonReflection, CurriculumPlan, CurriculumPlanItem,
} from "@/lib/types"
import ProgressTree from "@/components/ProgressTree"
import ProfileHeader from "@/components/ProfileHeader"
import AssignmentList from "@/components/AssignmentList"
import Breadcrumb from "@/components/Breadcrumb"
import { MusicBackground } from "@/components/motifs"
import ProgressLoading from "./loading"
import MilestoneTracker from "@/components/MilestoneTracker"
import CurriculumPlanner from "@/components/CurriculumPlanner"
import CurriculumTimeline from "@/components/CurriculumTimeline"
import PracticeJournalSection from "./PracticeJournalSection"
import ReflectionSection from "./ReflectionSection"

export function generateMetadata() {
  return { title: 'Progress Tree \u2014 Coda' }
}

type RawTag = {
  id: string
  status: string
  catalog_items: { id: string; title: string; type: string; composer: string | null; tradition: string | null; region: string | null } | { id: string; title: string; type: string; composer: string | null; tradition: string | null; region: string | null }[] | null
}

async function getProgressData(studentId: string): Promise<ProgressTreeData> {
  const supabase = createSupabaseServerClient()

  const { data: entries, error: entriesError } = await supabase
    .from("lesson_entries")
    .select(`
      id, created_at, content,
      repertoire_tags (
        id, status,
        catalog_items ( id, title, type, composer, tradition, region )
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })

  if (entriesError) {
    console.error("Failed to fetch progress data:", entriesError.message)
    return { repertoire_items: [], completed_theory: [], lesson_entries: [] }
  }

  const repertoire_items: RepertoireItem[] = []
  const completed_theory: TheoryItem[] = []
  const seenCatalogIds = new Set<string>()

  for (const entry of entries ?? []) {
    const tags = ((entry as typeof entry & { repertoire_tags: RawTag[] }).repertoire_tags) ?? []
    for (const tag of tags) {
      const rawItem = tag.catalog_items
      const item = Array.isArray(rawItem) ? rawItem[0] : rawItem
      if (!item || seenCatalogIds.has(item.id)) continue
      seenCatalogIds.add(item.id)

      if (item.type === "repertoire") {
        repertoire_items.push({
          id: tag.id,
          title: item.title,
          composer: item.composer,
          status: (tag.status ?? "introduced") as RepertoireStatus,
        })
      } else if (item.type === "theory") {
        completed_theory.push({ id: item.id, title: item.title, status: "completed" })
      }
    }
  }

  return {
    repertoire_items,
    completed_theory,
    lesson_entries: (entries ?? []).map((e) => {
      const tags = ((e as typeof e & { repertoire_tags: RawTag[] }).repertoire_tags) ?? []
      const entryTags: LessonEntryTag[] = tags
        .filter(t => t.catalog_items)
        .map(t => {
          const rawItem = t.catalog_items
          const item = Array.isArray(rawItem) ? rawItem[0] : rawItem
          if (!item) return null
          return {
            id: t.id,
            title: item.title,
            type: item.type as "repertoire" | "theory",
            status: (t.status ?? "introduced") as RepertoireStatus | "completed",
          }
        })
        .filter((t): t is LessonEntryTag => t !== null)
      return {
        id: e.id as string,
        created_at: e.created_at as string,
        content: e.content as import("@/lib/types").JSONContent,
        tags: entryTags,
      }
    }),
  }
}

type RawAssignmentRow = {
  id: string; description: string; due_date: string | null
  completed_at: string | null; lesson_entries: { created_at: string } | null
}

async function getAssignmentsData(studentId: string, role: "teacher" | "student"): Promise<AssignmentRow[]> {
  const supabase = createSupabaseServerClient()
  let query = supabase
    .from("practice_assignments")
    .select(`id, description, due_date, completed_at, lesson_entries ( created_at )`)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
  if (role === "student") query = query.is("completed_at", null)
  const { data, error } = await query
  if (error) { console.error("Failed to fetch assignments:", error.message); return [] }
  return (data as unknown as RawAssignmentRow[]).map(row => ({
    id: row.id, description: row.description, due_date: row.due_date ?? null,
    completed_at: row.completed_at ?? null, lesson_entry_date: row.lesson_entries?.created_at ?? "",
  }))
}

async function getPracticeJournalData(studentId: string): Promise<PracticeJournalEntry[]> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('practice_journal_entries')
    .select(`id, student_id, entry_date, duration_min, mood, notes, created_at,
      practice_metronome_logs ( id, journal_entry_id, catalog_item_id, bpm_start, bpm_end, note,
        catalog_items ( title ) )`)
    .eq('student_id', studentId)
    .order('entry_date', { ascending: false })
    .limit(20)

  return (data ?? []).map(e => ({
    ...e,
    mood: e.mood as 1 | 2 | 3 | 4 | 5,
    metronome_logs: ((e as unknown as { practice_metronome_logs: unknown[] }).practice_metronome_logs ?? []).map((l: unknown) => {
      const log = l as { id: string; journal_entry_id: string; catalog_item_id: string; bpm_start: number; bpm_end: number | null; note: string | null; catalog_items: { title: string } | null }
      return { ...log, catalog_item_title: log.catalog_items?.title ?? undefined }
    }),
  }))
}

async function getMilestonesData(studentId: string): Promise<{ milestones: StudentMilestone[]; library: TechniqueMilestone[] }> {
  const supabase = createSupabaseServerClient()
  const [{ data: milestones }, { data: library }] = await Promise.all([
    supabase.from('student_milestones')
      .select(`id, student_id, milestone_id, teacher_id, status, achieved_at, created_at,
        technique_milestones ( id, name, category, instrument, difficulty, description, is_seed )`)
      .eq('student_id', studentId),
    supabase.from('technique_milestones').select('*').order('category').order('name'),
  ])
  return {
    milestones: (milestones ?? []).map(m => ({
      ...m,
      status: m.status as import('@/lib/types').MilestoneStatus,
      milestone: (() => { const raw = (m as unknown as { technique_milestones: TechniqueMilestone | TechniqueMilestone[] }).technique_milestones; return Array.isArray(raw) ? raw[0] : raw; })(),
    })),
    library: (library ?? []) as TechniqueMilestone[],
  }
}

async function getReflectionsData(studentId: string): Promise<LessonReflection[]> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('lesson_reflections')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  return (data ?? []) as LessonReflection[]
}

async function getCurriculumData(studentId: string): Promise<{ plan: CurriculumPlan | null; items: CurriculumPlanItem[] }> {
  const supabase = createSupabaseServerClient()
  const { data: plan } = await supabase
    .from('curriculum_plans')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_active', true)
    .maybeSingle()
  if (!plan) return { plan: null, items: [] }
  const { data: items } = await supabase
    .from('curriculum_plan_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order')
  return { plan: plan as CurriculumPlan, items: (items ?? []) as CurriculumPlanItem[] }
}

async function ProgressContent({ studentId, role }: { studentId: string; role: "teacher" | "student" }) {
  const supabase = createSupabaseServerClient()

  const [progressData, profileRow, assignmentsData, studentRow, journalEntries, milestonesData, reflections, curriculumData] = await Promise.all([
    getProgressData(studentId),
    supabase.from("student_profiles").select("grade_level, instrument, goals").eq("student_id", studentId).single().then(({ data }) => data),
    getAssignmentsData(studentId, role),
    supabase.from("profiles").select("full_name").eq("id", studentId).single().then(({ data }) => data),
    getPracticeJournalData(studentId),
    getMilestonesData(studentId),
    getReflectionsData(studentId),
    getCurriculumData(studentId),
  ])

  const profile: StudentProfile | null = profileRow
    ? { grade_level: profileRow.grade_level ?? null, instrument: profileRow.instrument ?? null, goals: profileRow.goals ?? null }
    : null

  const lessonCount = progressData.lesson_entries?.length ?? 0
  const lessonEntries = progressData.lesson_entries ?? []

  // Build reflection map: lesson_entry_id → reflection
  const reflectionMap = new Map(reflections.map(r => [r.lesson_entry_id, r]))

  return (
    <>
      <ProfileHeader profile={profile} studentName={studentRow?.full_name ?? undefined} />
      <ProgressTree data={progressData} role={role} lessonCount={lessonCount} />

      {/* Technique Milestones */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-studio-text mb-1">Technique Milestones</h2>
        {role === 'teacher' ? (
          <MilestoneTracker
            studentId={studentId}
            initialMilestones={milestonesData.milestones}
            libraryMilestones={milestonesData.library}
          />
        ) : (
          <MilestoneReadOnly milestones={milestonesData.milestones} />
        )}
      </section>

      {/* Curriculum Plan */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-studio-text mb-1">Curriculum Plan</h2>
        {role === 'teacher' ? (
          <CurriculumPlanner studentId={studentId} initialPlan={curriculumData.plan ? { ...curriculumData.plan, items: curriculumData.items } : null} />
        ) : curriculumData.plan ? (
          <CurriculumTimeline plan={curriculumData.plan} items={curriculumData.items} />
        ) : (
          <p className="text-sm text-studio-muted">No curriculum plan yet.</p>
        )}
      </section>

      {/* Practice Assignments */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-studio-text mb-3">Practice Assignments</h2>
        <AssignmentList assignments={assignmentsData} role={role} />
      </section>

      {/* Practice Journal */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-studio-text mb-3">Practice Journal</h2>
        <PracticeJournalSection
          role={role}
          initialEntries={journalEntries}
        />
      </section>

      {/* Self-Assessment Reflections (student view) */}
      {role === 'student' && lessonEntries.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-studio-text mb-3">Lesson Reflections</h2>
          <ReflectionSection
            lessonEntries={lessonEntries.map(e => ({ id: e.id, created_at: e.created_at }))}
            reflectionMap={Object.fromEntries(reflectionMap)}
          />
        </section>
      )}
    </>
  )
}

// Simple read-only milestone view for students
function MilestoneReadOnly({ milestones }: { milestones: StudentMilestone[] }) {
  if (milestones.length === 0) return <p className="text-sm text-studio-muted">No milestones assigned yet.</p>
  const grouped = milestones.reduce<Record<string, StudentMilestone[]>>((acc, m) => {
    const cat = m.milestone.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})
  const STATUS_STYLES: Record<string, string> = {
    not_started: 'text-studio-muted bg-studio-rim',
    in_progress: 'text-studio-gold bg-amber-900/30',
    achieved: 'text-emerald-400 bg-emerald-900/30',
  }
  const STATUS_LABELS: Record<string, string> = { not_started: 'Not started', in_progress: 'In progress', achieved: '✓ Achieved' }
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, items]) => {
        const achieved = items.filter(m => m.status === 'achieved').length
        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-medium text-studio-muted uppercase tracking-wide">{cat}</p>
              <div className="flex-1 h-1.5 bg-studio-rim rounded-full overflow-hidden">
                <div className="h-full bg-studio-gold rounded-full" style={{ width: `${(achieved / items.length) * 100}%` }} />
              </div>
              <span className="text-xs text-studio-muted">{achieved}/{items.length}</span>
            </div>
            <div className="space-y-1">
              {items.map(sm => (
                <div key={sm.id} className="flex items-center gap-2 bg-studio-surface border border-studio-rim rounded-lg px-3 py-2">
                  <p className="text-sm text-studio-cream flex-1">{sm.milestone.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[sm.status]}`}>{STATUS_LABELS[sm.status]}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function ProgressPage({ params }: { params: { studentId: string } }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { studentId } = params
  const role = await getUserRole()

  if (role === "student" && session.user.id !== studentId) redirect(`/progress/${session.user.id}`)

  const resolvedRole = (role ?? "student") as "teacher" | "student"

  return (
    <main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      {role === "teacher" && (
        <div className="mb-6"><Breadcrumb href="/dashboard" label="Back to students" /></div>
      )}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-4xl text-studio-cream tracking-wide">Progress Tree</h1>
        {role === "teacher" && (
          <Link href={`/lessons/new?studentId=${studentId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-studio-primary text-studio-bg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-studio-glow-lg transition-all duration-[150ms]">
            + New Lesson
          </Link>
        )}
      </div>
      <p className="text-studio-text text-sm mb-6">Repertoire, technique, and curriculum progress.</p>

      <Suspense fallback={<ProgressLoading />}>
        <ProgressContent studentId={studentId} role={resolvedRole} />
      </Suspense>
    </main>
  )
}
