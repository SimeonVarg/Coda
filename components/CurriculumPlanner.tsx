'use client'

import { useState } from 'react'
import type { CurriculumPlan, CurriculumPlanItem, PlanItemType, PlanItemStatus } from '@/lib/types'
import Spinner from '@/components/Spinner'

const TYPE_ICONS: Record<PlanItemType, string> = {
  repertoire: '🎵',
  technique: '🎯',
  theory: '📖',
  performance: '🎭',
  other: '✦',
}

const STATUS_STYLES: Record<PlanItemStatus, string> = {
  pending: 'text-studio-muted bg-studio-rim',
  in_progress: 'text-studio-gold bg-amber-900/30',
  completed: 'text-emerald-400 bg-emerald-900/30',
  skipped: 'text-studio-muted bg-studio-rim line-through',
}

const STATUS_LABELS: Record<PlanItemStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: '✓ Done',
  skipped: 'Skipped',
}

const STATUS_CYCLE: PlanItemStatus[] = ['pending', 'in_progress', 'completed', 'skipped']

interface Props {
  studentId: string
  initialPlan: CurriculumPlan | null
}

export default function CurriculumPlanner({ studentId, initialPlan }: Props) {
  const [plan, setPlan] = useState<CurriculumPlan | null>(initialPlan)
  const [items, setItems] = useState<CurriculumPlanItem[]>(initialPlan?.items ?? [])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // Create plan form state
  const [newTitle, setNewTitle] = useState('')
  const [newTargetDate, setNewTargetDate] = useState('')
  const [creating, setCreating] = useState(false)

  // Add item form state
  const [itemTitle, setItemTitle] = useState('')
  const [itemType, setItemType] = useState<PlanItemType>('repertoire')
  const [itemTargetDate, setItemTargetDate] = useState('')
  const [itemNotes, setItemNotes] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  const handleCreatePlan = async () => {
    if (!newTitle.trim() || !newTargetDate) return
    setCreating(true)
    const res = await fetch('/api/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, title: newTitle.trim(), target_date: newTargetDate }),
    })
    if (res.ok) {
      const { id } = await res.json()
      const newPlan: CurriculumPlan = {
        id, teacher_id: '', student_id: studentId,
        title: newTitle.trim(), target_date: newTargetDate,
        is_active: true, created_at: new Date().toISOString(),
      }
      setPlan(newPlan)
      setItems([])
      setShowCreateForm(false)
      setNewTitle('')
      setNewTargetDate('')
    }
    setCreating(false)
  }

  const handleAddItem = async () => {
    if (!plan || !itemTitle.trim()) return
    setAddingItem(true)
    const res = await fetch(`/api/curriculum/${plan.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: itemTitle.trim(),
        item_type: itemType,
        target_date: itemTargetDate || null,
        notes: itemNotes.trim() || null,
        sort_order: items.length,
      }),
    })
    if (res.ok) {
      const { id } = await res.json()
      setItems(prev => [...prev, {
        id, plan_id: plan.id, title: itemTitle.trim(), item_type: itemType,
        sort_order: items.length, target_date: itemTargetDate || null,
        catalog_item_id: null, milestone_id: null,
        notes: itemNotes.trim() || null, status: 'pending',
        completed_at: null, created_at: new Date().toISOString(),
      }])
      setItemTitle('')
      setItemType('repertoire')
      setItemTargetDate('')
      setItemNotes('')
      setShowAddItem(false)
    }
    setAddingItem(false)
  }

  const cycleItemStatus = async (item: CurriculumPlanItem) => {
    const idx = STATUS_CYCLE.indexOf(item.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setUpdating(item.id)
    const res = await fetch(`/api/curriculum/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === item.id
        ? { ...i, status: next, completed_at: next === 'completed' ? new Date().toISOString() : null }
        : i
      ))
    }
    setUpdating(null)
  }

  const handleRemoveItem = async (id: string) => {
    const res = await fetch(`/api/curriculum/items/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  // Pacing calculation
  const completed = items.filter(i => i.status === 'completed').length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (!plan && !showCreateForm) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-studio-muted text-sm mb-3">No curriculum plan yet for this student.</p>
        <button type="button" onClick={() => setShowCreateForm(true)} className="studio-btn-primary text-sm">
          Create Curriculum Plan
        </button>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="mt-6 bg-studio-surface border border-studio-rim rounded-xl p-5 space-y-4">
        <h3 className="font-display text-lg text-studio-cream">New Curriculum Plan</h3>
        <div>
          <label className="block text-xs text-studio-muted mb-1">Plan Title</label>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            maxLength={150} placeholder="e.g. RCM Grade 8 — Spring 2026" className="studio-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-studio-muted mb-1">Target Completion Date</label>
          <input type="date" value={newTargetDate} onChange={e => setNewTargetDate(e.target.value)} className="studio-input w-full" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleCreatePlan} disabled={creating || !newTitle.trim() || !newTargetDate}
            className="studio-btn-primary disabled:opacity-50">
            {creating ? <span className="inline-flex items-center gap-2"><Spinner />Creating…</span> : 'Create Plan'}
          </button>
          <button type="button" onClick={() => setShowCreateForm(false)} className="studio-btn-ghost">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <section className="mt-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg text-studio-cream">{plan!.title}</h3>
          <p className="text-xs text-studio-muted">
            Target: {new Date(plan!.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button type="button" onClick={() => setShowAddItem(v => !v)} className="studio-btn-ghost text-xs px-3 py-1">
          {showAddItem ? 'Close' : '+ Add Item'}
        </button>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-studio-rim rounded-full overflow-hidden">
            <div className="h-full bg-studio-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-studio-muted">{pct}% complete ({completed}/{total})</span>
        </div>
      )}

      {showAddItem && (
        <div className="bg-studio-bg border border-studio-rim rounded-xl p-4 mb-4 space-y-3">
          <input type="text" value={itemTitle} onChange={e => setItemTitle(e.target.value)}
            maxLength={150} placeholder="Item title" className="studio-input w-full" />
          <div className="grid grid-cols-2 gap-2">
            <select value={itemType} onChange={e => setItemType(e.target.value as PlanItemType)} className="studio-input">
              {(['repertoire','technique','theory','performance','other'] as PlanItemType[]).map(t => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input type="date" value={itemTargetDate} onChange={e => setItemTargetDate(e.target.value)}
              className="studio-input" placeholder="Target date" />
          </div>
          <input type="text" value={itemNotes} onChange={e => setItemNotes(e.target.value)}
            maxLength={300} placeholder="Notes (optional)" className="studio-input w-full text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={handleAddItem} disabled={addingItem || !itemTitle.trim()}
              className="studio-btn-primary text-sm disabled:opacity-50">
              {addingItem ? 'Adding…' : 'Add Item'}
            </button>
            <button type="button" onClick={() => setShowAddItem(false)} className="studio-btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-studio-muted text-center py-4">No items yet. Add goals to build the curriculum.</p>
      )}

      <div className="space-y-2">
        {[...items].sort((a, b) => a.sort_order - b.sort_order).map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-studio-surface border border-studio-rim rounded-lg px-3 py-2">
            <span className="text-lg" aria-hidden="true">{TYPE_ICONS[item.item_type]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm text-studio-cream ${item.status === 'skipped' ? 'line-through opacity-50' : ''}`}>{item.title}</p>
              {item.target_date && (
                <p className="text-xs text-studio-muted">
                  Target: {new Date(item.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {item.completed_at && ` · Done ${new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => cycleItemStatus(item)}
              disabled={updating === item.id}
              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 disabled:opacity-50 transition-all ${STATUS_STYLES[item.status]}`}
              title="Click to advance status"
            >
              {STATUS_LABELS[item.status]}
            </button>
            <button type="button" onClick={() => handleRemoveItem(item.id)}
              className="text-studio-muted hover:text-studio-rose text-xs" aria-label="Remove item">✕</button>
          </div>
        ))}
      </div>
    </section>
  )
}
