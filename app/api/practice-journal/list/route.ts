import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('practice_journal_entries')
    .select(`id, student_id, entry_date, duration_min, mood, notes, created_at,
      practice_metronome_logs ( id, journal_entry_id, catalog_item_id, bpm_start, bpm_end, note,
        catalog_items ( title ) )`)
    .eq('student_id', session.user.id)
    .order('entry_date', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = (data ?? []).map(e => ({
    ...e,
    metronome_logs: ((e as unknown as { practice_metronome_logs: unknown[] }).practice_metronome_logs ?? []).map((l: unknown) => {
      const log = l as { id: string; journal_entry_id: string; catalog_item_id: string; bpm_start: number; bpm_end: number | null; note: string | null; catalog_items: { title: string } | null }
      return { ...log, catalog_item_title: log.catalog_items?.title ?? undefined }
    }),
  }))

  return NextResponse.json(entries)
}
