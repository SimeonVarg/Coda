import type { CurriculumPlan, CurriculumPlanItem, PlanItemType, PlanItemStatus } from '@/lib/types'

const TYPE_ICONS: Record<PlanItemType, string> = {
  repertoire: '🎵',
  technique: '🎯',
  theory: '📖',
  performance: '🎭',
  other: '✦',
}

const STATUS_STYLES: Record<PlanItemStatus, string> = {
  pending: 'text-studio-muted border-studio-rim',
  in_progress: 'text-studio-gold border-amber-700',
  completed: 'text-emerald-400 border-emerald-700',
  skipped: 'text-studio-muted border-studio-rim opacity-50',
}

interface Props {
  plan: CurriculumPlan
  items: CurriculumPlanItem[]
}

export default function CurriculumTimeline({ plan, items }: Props) {
  const completed = items.filter(i => i.status === 'completed').length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section className="mt-6">
      <div className="mb-4">
        <h3 className="font-display text-lg text-studio-cream">{plan.title}</h3>
        <p className="text-xs text-studio-muted">
          Target: {new Date(plan.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        {total > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-studio-rim rounded-full overflow-hidden">
              <div className="h-full bg-studio-gold rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-studio-muted">{pct}%</span>
          </div>
        )}
      </div>

      <div className="relative pl-6 space-y-3">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-studio-rim" aria-hidden="true" />

        {sorted.map(item => (
          <div key={item.id} className="relative flex items-start gap-3">
            {/* Dot */}
            <div className={`absolute -left-4 mt-1 w-3 h-3 rounded-full border-2 bg-studio-bg ${STATUS_STYLES[item.status]}`} aria-hidden="true" />

            <div className={`flex-1 ${item.status === 'skipped' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{TYPE_ICONS[item.item_type]}</span>
                <p className={`text-sm text-studio-cream ${item.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                  {item.title}
                </p>
                {item.status === 'completed' && <span className="text-emerald-400 text-xs">✓</span>}
              </div>
              {(item.target_date || item.completed_at) && (
                <p className="text-xs text-studio-muted ml-6">
                  {item.completed_at
                    ? `Completed ${new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : item.target_date
                      ? `Target: ${new Date(item.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : null
                  }
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
