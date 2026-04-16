import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type PacingStatus = 'On Track' | 'At Risk' | 'Behind'

function getPacingStatus(createdAt: string, targetDate: string, completed: number, total: number): PacingStatus {
  const now = Date.now()
  const start = new Date(createdAt).getTime()
  const end = new Date(targetDate + 'T23:59:59').getTime()
  const completedRatio = total > 0 ? completed / total : 0
  if (now > end && completedRatio < 1) return 'Behind'
  const timeRatio = end > start ? (now - start) / (end - start) : 0
  if (timeRatio > 0.7 && completedRatio < 0.5) return 'At Risk'
  return 'On Track'
}

const STATUS_STYLES: Record<PacingStatus, string> = {
  'On Track': 'text-emerald-400 bg-emerald-900/30',
  'At Risk': 'text-studio-gold bg-amber-900/30',
  'Behind': 'text-studio-rose bg-rose-900/30',
}

export default async function PacingWidget({ teacherId }: { teacherId: string }) {
  const supabase = createSupabaseServerClient()

  const { data: plans } = await supabase
    .from('curriculum_plans')
    .select('id, title, target_date, created_at, student_id')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)

  if (!plans || plans.length === 0) return null

  // Fetch items and student names in parallel
  const studentIds = [...new Set(plans.map(p => p.student_id))]
  const [{ data: allItems }, { data: students }] = await Promise.all([
    supabase
      .from('curriculum_plan_items')
      .select('plan_id, status')
      .in('plan_id', plans.map(p => p.id)),
    supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds),
  ])

  const itemsByPlan = (allItems ?? []).reduce<Record<string, { status: string }[]>>((acc, item) => {
    if (!acc[item.plan_id]) acc[item.plan_id] = []
    acc[item.plan_id].push(item)
    return acc
  }, {})

  const studentMap = Object.fromEntries((students ?? []).map(s => [s.id, s.full_name]))

  const rows = plans.map(p => {
    const items = itemsByPlan[p.id] ?? []
    const total = items.length
    const completed = items.filter(i => i.status === 'completed').length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const daysLeft = Math.ceil((new Date(p.target_date + 'T23:59:59').getTime() - Date.now()) / 86400000)
    const status = getPacingStatus(p.created_at, p.target_date, completed, total)
    return { id: p.id, studentId: p.student_id, studentName: studentMap[p.student_id] ?? 'Student', title: p.title, pct, daysLeft, status }
  })

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-studio-cream mb-3">Curriculum Pacing</h2>
      <div className="space-y-2">
        {rows.map(row => (
          <Link
            key={row.id}
            href={`/progress/${row.studentId}`}
            className="flex items-center gap-3 bg-studio-surface border border-studio-rim rounded-xl px-4 py-3 hover:border-studio-primary/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-studio-cream font-medium group-hover:text-studio-gold transition-colors truncate">
                {row.studentName}
              </p>
              <p className="text-xs text-studio-muted truncate">{row.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 bg-studio-rim rounded-full overflow-hidden">
                <div className="h-full bg-studio-gold rounded-full" style={{ width: `${row.pct}%` }} />
              </div>
              <span className="text-xs text-studio-muted w-8 text-right">{row.pct}%</span>
              <span className="text-xs text-studio-muted w-16 text-right">
                {row.daysLeft > 0 ? `${row.daysLeft}d left` : `${Math.abs(row.daysLeft)}d over`}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}>
                {row.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
