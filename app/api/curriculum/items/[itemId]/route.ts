import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

async function getTeacherPlanIds(supabase: ReturnType<typeof createSupabaseServerClient>, teacherId: string): Promise<string[]> {
  const { data } = await supabase.from('curriculum_plans').select('id').eq('teacher_id', teacherId)
  return (data ?? []).map(p => p.id)
}

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const planIds = await getTeacherPlanIds(supabase, session.user.id)
  if (planIds.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updates = await req.json()
  const allowed = ['title', 'item_type', 'sort_order', 'target_date', 'notes', 'status']
  const patch: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in updates) patch[k] = updates[k]
  }

  const { error } = await supabase
    .from('curriculum_plan_items')
    .update(patch)
    .eq('id', params.itemId)
    .in('plan_id', planIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

export async function DELETE(_req: NextRequest, { params }: { params: { itemId: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const planIds = await getTeacherPlanIds(supabase, session.user.id)
  if (planIds.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase
    .from('curriculum_plan_items')
    .delete()
    .eq('id', params.itemId)
    .in('plan_id', planIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
