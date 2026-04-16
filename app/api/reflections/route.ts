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
  const { lesson_entry_id, self_rating, went_well, was_challenging, next_goal } = body

  if (!lesson_entry_id) return NextResponse.json({ error: 'lesson_entry_id required' }, { status: 400 })

  const rating = Number(self_rating)
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'self_rating must be 1–5' }, { status: 400 })

  // Verify the lesson entry belongs to this student
  const { data: lessonEntry } = await supabase
    .from('lesson_entries')
    .select('id')
    .eq('id', lesson_entry_id)
    .eq('student_id', session.user.id)
    .single()

  if (!lessonEntry) return NextResponse.json({ error: 'Lesson entry not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('lesson_reflections')
    .upsert(
      {
        lesson_entry_id,
        student_id: session.user.id,
        self_rating: rating,
        went_well: went_well?.trim() || null,
        was_challenging: was_challenging?.trim() || null,
        next_goal: next_goal?.trim() || null,
      },
      { onConflict: 'lesson_entry_id,student_id' }
    )
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
