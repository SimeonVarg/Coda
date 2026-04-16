import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  // Only teachers can assign milestones
  if (session.user.app_metadata?.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 })
  }

  const body = await req.json()
  const { student_id, milestone_id, custom } = body

  if (!student_id) return NextResponse.json({ error: 'student_id required' }, { status: 400 })

  // Verify the student belongs to this teacher
  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', student_id)
    .eq('teacher_id', session.user.id)
    .single()

  if (!studentProfile) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  let finalMilestoneId = milestone_id

  if (custom) {
    const { name, category, difficulty, description } = custom
    if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const { data: m, error: mErr } = await supabase
      .from('technique_milestones')
      .insert({
        name: name.trim(),
        category: category || 'Custom',
        difficulty: difficulty || 'Intermediate',
        description: description?.trim() || null,
        is_seed: false,
      })
      .select('id')
      .single()
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })
    finalMilestoneId = m.id
  }

  if (!finalMilestoneId) return NextResponse.json({ error: 'milestone_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('student_milestones')
    .insert({ student_id, milestone_id: finalMilestoneId, teacher_id: session.user.id })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Milestone already added' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ id: data.id }, { status: 201 })
}
