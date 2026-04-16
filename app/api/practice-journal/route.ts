import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })
  if (session.user.app_metadata?.role !== 'student') {
    return NextResponse.json({ error: 'Students only' }, { status: 403 })
  }

  const body = await req.json()
  const { entry_date, duration_min, mood, notes, metronome_logs = [] } = body

  const dur = Number(duration_min)
  const moodVal = Number(mood)
  if (!dur || dur < 1 || dur > 300)
    return NextResponse.json({ error: 'duration_min must be 1–300' }, { status: 400 })
  if (!moodVal || moodVal < 1 || moodVal > 5)
    return NextResponse.json({ error: 'mood must be 1–5' }, { status: 400 })

  const { data: entry, error } = await supabase
    .from('practice_journal_entries')
    .insert({
      student_id: session.user.id,
      entry_date: entry_date ?? new Date().toISOString().slice(0, 10),
      duration_min: dur,
      mood: moodVal,
      notes: notes?.trim() || null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (Array.isArray(metronome_logs) && metronome_logs.length > 0) {
    const rows = metronome_logs
      .filter((l: { catalog_item_id?: string; bpm_start?: number }) => l.catalog_item_id && l.bpm_start)
      .map((l: { catalog_item_id: string; bpm_start: number; bpm_end?: number; note?: string }) => ({
        journal_entry_id: entry.id,
        catalog_item_id: l.catalog_item_id,
        bpm_start: Number(l.bpm_start),
        bpm_end: l.bpm_end ? Number(l.bpm_end) : null,
        note: l.note?.trim() || null,
      }))
    if (rows.length > 0) {
      const { error: logError } = await supabase.from('practice_metronome_logs').insert(rows)
      if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ id: entry.id }, { status: 201 })
}
