import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import LessonEntryForm from '@/components/LessonEntryForm'
import Breadcrumb from '@/components/Breadcrumb'
import type { CatalogItem, JSONContent, TagWithStatus } from '@/lib/types'
import { MusicBackground } from '@/components/motifs'

interface EditLessonPageProps {
  params: { id: string }
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Edit Lesson \u2014 Coda' }
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const supabase = createSupabaseServerClient()

  const { data: entry, error } = await supabase
    .from('lesson_entries')
    .select('id, student_id, content')
    .eq('id', params.id)
    .single()

  if (error || !entry) notFound()

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', entry.student_id)
    .single()

  const { data: tagRows } = await supabase
    .from('repertoire_tags')
    .select('catalog_item_id, status, catalog_items(id, title, type, composer, tradition, region, tuning_system, cultural_context, language)')
    .eq('lesson_entry_id', params.id)

  const initialTags: TagWithStatus[] = (tagRows ?? [])
    .map((row: { catalog_item_id: string; status: string; catalog_items: unknown }) => {
      const item = row.catalog_items as CatalogItem | null
      if (!item) return null
      return {
        item,
        status: (row.status ?? (item.type === 'repertoire' ? 'introduced' : 'completed')) as TagWithStatus['status'],
      } satisfies TagWithStatus
    })
    .filter((t): t is TagWithStatus => t !== null)

  return (
    <main className="relative overflow-hidden bg-studio-bg min-h-screen mx-auto max-w-3xl px-6 py-10" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      {student && (
        <div className="mb-6">
          <Breadcrumb href={`/progress/${entry.student_id}`} label={`Back to ${student.full_name}`} />
        </div>
      )}
      <h1 className="mb-8 text-2xl font-semibold font-display text-studio-cream">Edit Lesson Entry</h1>
      <LessonEntryForm
        studentId={entry.student_id}
        lessonEntryId={entry.id}
        initialContent={entry.content as JSONContent}
        initialTags={initialTags}
      />
    </main>
  )
}
