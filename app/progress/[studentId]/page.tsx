import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { getSession, getUserRole } from "@/lib/auth.server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProgressTreeData, RepertoireItem, RepertoireStatus, TheoryItem, StudentProfile, AssignmentRow } from "@/lib/types"
import ProgressTree from "@/components/ProgressTree"
import ProfileHeader from "@/components/ProfileHeader"
import AssignmentList from "@/components/AssignmentList"
import Breadcrumb from "@/components/Breadcrumb"
import { MusicBackground } from "@/components/motifs"
import ProgressLoading from "./loading"

export function generateMetadata() {
  return { title: 'Progress Tree \u2014 Coda' }
}

async function getProgressData(studentId: string): Promise<ProgressTreeData> {
  const supabase = createSupabaseServerClient()

  const { data: entries, error: entriesError } = await supabase
    .from("lesson_entries")
    .select(`
      id,
      created_at,
      content,
      repertoire_tags (
        id,
        status,
        catalog_items (
          id,
          title,
          type,
          composer
        )
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
  // Track by catalog_item.id — most-recent tag wins (entries ordered desc)
  const seenCatalogIds = new Set<string>()

  for (const entry of entries ?? []) {
    for (const tag of (entry.repertoire_tags as any[]) ?? []) {
      const item = tag.catalog_items as {
        id: string; title: string; type: string; composer: string | null
      } | null
      if (!item || seenCatalogIds.has(item.id)) continue
      seenCatalogIds.add(item.id)

      if (item.type === "repertoire") {
        repertoire_items.push({
          id: tag.id,           // repertoire_tags.id for inline updates
          title: item.title,
          composer: item.composer,
          status: (tag.status ?? "introduced") as RepertoireStatus,
        })
      } else if (item.type === "theory") {
        completed_theory.push({
          id: item.id,
          title: item.title,
          status: "completed",
        })
      }
    }
  }

  return {
    repertoire_items,
    completed_theory,
    lesson_entries: (entries ?? []).map((e) => ({
      id: e.id,
      created_at: e.created_at,
      content: e.content,
    })),
  }
}

async function getAssignmentsData(
  studentId: string,
  role: "teacher" | "student"
): Promise<AssignmentRow[]> {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from("practice_assignments")
    .select(`
      id,
      description,
      due_date,
      completed_at,
      lesson_entries ( created_at )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })

  if (role === "student") {
    query = query.is("completed_at", null)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to fetch assignments:", error.message)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    description: row.description,
    due_date: row.due_date ?? null,
    completed_at: row.completed_at ?? null,
    lesson_entry_date: row.lesson_entries?.created_at ?? "",
  }))
}

async function ProgressContent({ studentId, role }: { studentId: string; role: "teacher" | "student" }) {
  const supabase = createSupabaseServerClient()

  const [progressData, profileRow, assignmentsData] = await Promise.all([
    getProgressData(studentId),
    supabase
      .from("student_profiles")
      .select("grade_level, instrument, goals")
      .eq("student_id", studentId)
      .single()
      .then(({ data }) => data),
    getAssignmentsData(studentId, role),
  ])

  const profile: StudentProfile | null = profileRow
    ? { grade_level: profileRow.grade_level ?? null, instrument: profileRow.instrument ?? null, goals: profileRow.goals ?? null }
    : null

  return (
    <>
      <ProfileHeader profile={profile} />
      <ProgressTree data={progressData} role={role} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-studio-text mb-3">Practice Assignments</h2>
        <AssignmentList assignments={assignmentsData} role={role} />
      </section>
    </>
  )
}

export default async function ProgressPage({
  params,
}: {
  params: { studentId: string }
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { studentId } = params
  const role = await getUserRole()

  // Students can only view their own progress
  if (role === "student" && session.user.id !== studentId) {
    redirect(`/progress/${session.user.id}`)
  }

  const resolvedRole = (role ?? "student") as "teacher" | "student"

  return (
    <main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      {role === "teacher" && (
        <div className="mb-6">
          <Breadcrumb href="/dashboard" label="Back to students" />
        </div>
      )}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-4xl text-studio-cream tracking-wide">Progress Tree</h1>
        {role === "teacher" && (
          <Link
            href={`/lessons/new?studentId=${studentId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-studio-primary text-studio-bg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-studio-glow-lg transition-all duration-[150ms]"
          >
            + New Lesson
          </Link>
        )}
      </div>
      <p className="text-studio-muted text-sm">
        Repertoire and theory assignments.
      </p>

      <Suspense fallback={<ProgressLoading />}>
        <ProgressContent studentId={studentId} role={resolvedRole} />
      </Suspense>
    </main>
  )
}
