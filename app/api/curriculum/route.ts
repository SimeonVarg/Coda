import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const { student_id, title, target_date } = await req.json()
  if (!title?.trim() || !target_date || !student_id)
    return NextResponse.json({ error: 'student_id, title, target_date required' }, { status: 400 })

  const { data, error } = await supabase
    .from('curriculum_plans')
    .insert({ teacher_id: session.user.id, student_id, title: title.trim(), target_date })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '23505' ? 409 : 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
