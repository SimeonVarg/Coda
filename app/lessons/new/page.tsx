import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import LessonEntryForm from '@/components/LessonEntryForm'
import Breadcrumb from '@/components/Breadcrumb'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MusicBackground } from '@/components/motifs'

export const metadata: Metadata = {
  title: 'New Lesson \u2014 Coda',
}

interface NewLessonPageProps {
  searchParams: { studentId?: string }
}

export default async function NewLessonPage({ searchParams }: NewLessonPageProps) {
  const studentId = searchParams.studentId

  if (!studentId) {
    redirect('/dashboard')
  }

  const supabase = createSupabaseServerClient()
  const { data: student } = await supabase
    .from('student_profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  return (
    <main className="relative overflow-hidden bg-studio-bg min-h-screen mx-auto max-w-3xl px-6 py-10" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      {student && (
        <div className="mb-4">
          <Breadcrumb
            href={`/progress/${studentId}`}
            label={`Back to ${student.full_name}`}
          />
        </div>
      )}
      <h1 className="mb-8 text-2xl font-semibold font-display text-studio-cream">New Lesson Entry</h1>
      <LessonEntryForm studentId={studentId} />
    </main>
  )
}
