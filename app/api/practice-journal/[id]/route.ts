import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (isDemoUser(session.user)) return NextResponse.json({ error: 'Disabled in demo mode' }, { status: 403 })

  const { error } = await supabase
    .from('practice_journal_entries')
    .delete()
    .eq('id', params.id)
    .eq('student_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
