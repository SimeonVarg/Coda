import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function POST(req: NextRequest, { params }: { params: { planId: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  // Verify teacher owns this plan
  const { data: plan } = await supabase
    .from('curriculum_plans')
    .select('id')
    .eq('id', params.planId)
    .eq('teacher_id', session.user.id)
    .single()
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const body = await req.json()
  const { title, item_type, target_date, catalog_item_id, milestone_id, notes, sort_order } = body
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const { data, error } = await supabase
    .from('curriculum_plan_items')
    .insert({
      plan_id: params.planId,
      title: title.trim(),
      item_type: item_type || 'other',
      sort_order: sort_order ?? 0,
      target_date: target_date || null,
      catalog_item_id: catalog_item_id || null,
      milestone_id: milestone_id || null,
      notes: notes?.trim() || null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
