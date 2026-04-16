import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { getSession, getUserRole } from "@/lib/auth.server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentSummary } from "@/lib/types"
import DashboardLoading from "./loading"
import { EighthNoteBeam, MusicBackground } from "@/components/motifs"
import StudentSearch from "./StudentSearch"
import PacingWidget from "@/components/PacingWidget"

export const metadata = { title: 'My Students \u2014 Coda' }

async function getStudents(teacherId: string): Promise<StudentSummary[]> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("student_dashboard")
    .select("id, full_name, last_lesson_date, lesson_count, has_recent_lesson, pending_assignments")
    .eq("teacher_id", teacherId)
    .order("full_name")

  if (error) {
    console.error("Failed to fetch students:", error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    full_name: row.full_name as string,
    last_lesson_date: (row.last_lesson_date as string) ?? null,
    lesson_count: Number((row.lesson_count as number | string) ?? 0),
    has_recent_lesson: Boolean(row.has_recent_lesson),
    pending_assignments: Number((row.pending_assignments as number | string) ?? 0),
  }))
}

function QuickStats({ students }: { students: StudentSummary[] }) {
  const total = students.length
  const lessonsThisWeek = students.filter((s) => s.has_recent_lesson).length
  const avgLessons =
    total > 0
      ? (students.reduce((sum, s) => sum + s.lesson_count, 0) / total).toFixed(1)
      : "0"
  const totalPending = students.reduce((sum, s) => sum + s.pending_assignments, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div className="bg-studio-surface rounded-xl p-4 border border-studio-rim text-center">
        <p className="text-2xl font-display font-semibold text-studio-gold">{total}</p>
        <p className="text-xs text-studio-muted mt-1">Students</p>
      </div>
      <div className="bg-studio-surface rounded-xl p-4 border border-studio-rim text-center">
        <p className="text-2xl font-display font-semibold text-studio-gold">{lessonsThisWeek}</p>
        <p className="text-xs text-studio-muted mt-1">Active this week</p>
      </div>
      <div className="bg-studio-surface rounded-xl p-4 border border-studio-rim text-center">
        <p className="text-2xl font-display font-semibold text-studio-gold">{avgLessons}</p>
        <p className="text-xs text-studio-muted mt-1">Avg lessons</p>
      </div>
      <div className="bg-studio-surface rounded-xl p-4 border border-studio-rim text-center">
        <p className={`text-2xl font-display font-semibold ${totalPending > 0 ? "text-studio-rose" : "text-studio-gold"}`}>
          {totalPending}
        </p>
        <p className="text-xs text-studio-muted mt-1">Pending tasks</p>
      </div>
    </div>
  )
}

function DashboardEmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center text-center gap-4">
      <div className="text-6xl select-none" aria-hidden="true">𝄞</div>
      <h2 className="text-studio-cream font-display text-2xl">No students yet</h2>
      <p className="text-studio-muted text-sm max-w-xs">
        Students will appear here once they&apos;re assigned to you. Ask your admin to add students to your account.
      </p>
    </div>
  )
}

async function StudentList({ teacherId }: { teacherId: string }) {
  const students = await getStudents(teacherId)

  if (students.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <>
      <QuickStats students={students} />
      <StudentSearch students={students} />
      <PacingWidget teacherId={teacherId} />
    </>
  )
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const role = await getUserRole()

  if (role === "student") {
    redirect(`/progress/${session.user.id}`)
  }

  const teacherId = session.user.id

  return (
    <main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      <div className="relative mb-8">
        <div className="relative flex items-start gap-4">
          <EighthNoteBeam
            className="absolute right-0 top-0 w-16 h-16 text-studio-gold"
            opacity={0.5}
          />
          <div className="flex-1">
            <h1 className="font-display text-4xl text-studio-cream tracking-wide">My Students</h1>
            <p className="text-studio-muted text-sm mt-1">Click a student to view their progress.</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<DashboardLoading />}>
        <StudentList teacherId={teacherId} />
      </Suspense>
    </main>
  )
}
