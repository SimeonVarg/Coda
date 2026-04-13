import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { getSession, getUserRole } from "@/lib/auth.server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentSummary } from "@/lib/types"
import DashboardLoading from "./loading"
import EmptyState from "@/components/EmptyState"
import { EighthNoteBeam, MusicBackground } from "@/components/motifs"

export const metadata = { title: 'My Students \u2014 Coda' }

async function getStudents(teacherId: string): Promise<StudentSummary[]> {
  const supabase = createSupabaseServerClient()

  // Simple query first — just get students assigned to this teacher
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("teacher_id", teacherId)
    .eq("role", "student")

  if (error) {
    console.error("Failed to fetch students:", error.message, error.code, error.details)
    return []
  }

  // Get last lesson date separately for each student
  const students: StudentSummary[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: lessons } = await supabase
        .from("lesson_entries")
        .select("created_at")
        .eq("student_id", row.id)
        .order("created_at", { ascending: false })
        .limit(1)

      return {
        id: row.id as string,
        full_name: row.full_name as string,
        last_lesson_date: lessons?.[0]?.created_at ?? null,
      }
    })
  )

  return students
}

async function StudentList({ teacherId }: { teacherId: string }) {
  const students = await getStudents(teacherId)

  if (students.length === 0) {
    return (
      <div className="mt-6 text-studio-muted">
        <EmptyState message="No students assigned yet." />
      </div>
    )
  }

  return (
    <ul className="mt-6 space-y-3">
      {students.map((student) => (
        <li
          key={student.id}
          className="relative bg-studio-surface rounded-2xl shadow-studio-glow hover:-translate-y-1 hover:shadow-studio-glow-lg transition-all duration-[250ms] will-change-transform"
        >
          {/* Full-card link to progress page */}
          <Link
            href={`/progress/${student.id}`}
            className="absolute inset-0 rounded-2xl"
            aria-label={`View ${student.full_name}'s progress`}
          />
          <div className="relative p-4 pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-studio-cream font-medium">
                {student.full_name}
              </span>
              <span className="text-studio-muted text-sm">
                {student.last_lesson_date
                  ? new Date(student.last_lesson_date).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : "No lessons yet"}
              </span>
            </div>
            <div className="mt-2 pointer-events-auto relative z-10">
              <Link
                href={`/students/${student.id}/profile`}
                className="text-xs font-medium text-studio-gold hover:text-studio-cream transition-colors duration-[150ms]"
              >
                Edit Profile →
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const role = await getUserRole()

  // Students don't have a dashboard — send them to their own progress tree
  if (role === "student") {
    redirect(`/progress/${session.user.id}`)
  }

  const teacherId = session.user.id

  return (
    <main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      {/* Header area — concert program style */}
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
