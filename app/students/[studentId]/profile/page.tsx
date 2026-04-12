import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth.server"
import ProfileForm from "@/components/ProfileForm"
import Breadcrumb from "@/components/Breadcrumb"
import MusicBackground from "@/components/motifs/MusicBackground"
import type { StudentProfile } from "@/lib/types"

interface ProfilePageProps {
  params: { studentId: string }
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Student Profile \u2014 Coda" }
}

export default async function StudentProfilePage({ params }: ProfilePageProps) {
  const { studentId } = params
  const session = await getSession()
  if (!session) notFound()

  const supabase = createSupabaseServerClient()

  // Verify the student is assigned to the requesting teacher
  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, teacher_id")
    .eq("id", studentId)
    .eq("teacher_id", session.user.id)
    .single()

  if (!student) notFound()

  // Fetch existing profile (may be null)
  const { data: profileRow } = await supabase
    .from("student_profiles")
    .select("grade_level, instrument, goals")
    .eq("student_id", studentId)
    .single()

  const profile: StudentProfile | null = profileRow
    ? {
        grade_level: profileRow.grade_level ?? null,
        instrument: profileRow.instrument ?? null,
        goals: profileRow.goals ?? null,
      }
    : null

  return (
    <main className="relative overflow-hidden bg-studio-bg min-h-screen mx-auto max-w-3xl px-6 py-10" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      <Breadcrumb href={`/progress/${studentId}`} label={`Back to ${student.full_name}`} />
      <h1 className="text-2xl font-semibold text-studio-cream font-display mb-1 mt-4">
        {student.full_name}
      </h1>
      <p className="text-sm text-studio-muted mb-8">Student profile</p>
      <ProfileForm studentId={studentId} initialProfile={profile} />
    </main>
  )
}
