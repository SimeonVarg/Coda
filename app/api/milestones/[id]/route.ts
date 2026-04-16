import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const { status } = await req.json()
  const valid = ['not_started', 'in_progress', 'achieved']
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const { error } = await supabase
    .from('student_milestones')
    .update({ status })
    .eq('id', params.id)
    .eq('teacher_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const { error } = await supabase
    .from('student_milestones')
    .delete()
    .eq('id', params.id)
    .eq('teacher_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
