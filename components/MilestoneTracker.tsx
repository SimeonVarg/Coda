'use client'

import { useState, useCallback } from 'react'
import type { StudentMilestone, MilestoneStatus, TechniqueMilestone } from '@/lib/types'

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-900/30',
  Intermediate: 'text-studio-gold bg-amber-900/30',
  Advanced: 'text-orange-400 bg-orange-900/30',
  Virtuoso: 'text-studio-rose bg-rose-900/30',
}

const STATUS_STYLES: Record<MilestoneStatus, string> = {
  not_started: 'text-studio-muted bg-studio-rim',
  in_progress: 'text-studio-gold bg-amber-900/30',
  achieved: 'text-emerald-400 bg-emerald-900/30',
}

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  achieved: '✓ Achieved',
}

const STATUS_CYCLE: MilestoneStatus[] = ['not_started', 'in_progress', 'achieved']

interface Props {
  studentId: string
  initialMilestones: StudentMilestone[]
  libraryMilestones: TechniqueMilestone[]
}

export default function MilestoneTracker({ studentId, initialMilestones, libraryMilestones }: Props) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [showPicker, setShowPicker] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Group by category
  const grouped = milestones.reduce<Record<string, StudentMilestone[]>>((acc, m) => {
    const cat = m.milestone.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  const cycleStatus = useCallback(async (sm: StudentMilestone) => {
    const idx = STATUS_CYCLE.indexOf(sm.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setUpdating(sm.id)
    setError(null)
    try {
      const res = await fetch(`/api/milestones/${sm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error('Update failed')
      setMilestones(prev => prev.map(m => m.id === sm.id
        ? { ...m, status: next, achieved_at: next === 'achieved' ? new Date().toISOString() : null }
        : m
      ))
    } catch {
      setError('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }, [])

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this milestone?')) return
    const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
    if (res.ok) setMilestones(prev => prev.filter(m => m.id !== id))
  }

  const handleAdd = async (milestoneId: string) => {
    setError(null)
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, milestone_id: milestoneId }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error === 'Milestone already added' ? 'Already added' : (d.error ?? 'Failed to add'))
      return
    }
    const lib = libraryMilestones.find(m => m.id === milestoneId)
    if (lib) {
      const { id } = await res.json()
      setMilestones(prev => [...prev, {
        id, student_id: studentId, milestone_id: milestoneId,
        teacher_id: '', status: 'not_started', achieved_at: null,
        created_at: new Date().toISOString(), milestone: lib,
      }])
    }
    setShowPicker(false)
  }

  const alreadyAdded = new Set(milestones.map(m => m.milestone_id))

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-studio-cream">Technique Milestones</h3>
        <button type="button" onClick={() => setShowPicker(v => !v)}
          className="studio-btn-ghost text-xs px-3 py-1">
          {showPicker ? 'Close' : '+ Add Milestone'}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-studio-rose mb-2">{error}</p>}

      {showPicker && (
        <MilestonePicker
          library={libraryMilestones}
          alreadyAdded={alreadyAdded}
          onAdd={handleAdd}
          studentId={studentId}
          onCustomAdded={(sm) => { setMilestones(prev => [...prev, sm]); setShowPicker(false) }}
        />
      )}

      {Object.keys(grouped).length === 0 && !showPicker && (
        <p className="text-sm text-studio-muted">No milestones added yet. Click &quot;+ Add Milestone&quot; to start.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => {
        const achieved = items.filter(m => m.status === 'achieved').length
        return (
          <div key={category} className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-medium text-studio-muted uppercase tracking-wide">{category}</p>
              <div className="flex-1 h-1.5 bg-studio-rim rounded-full overflow-hidden">
                <div className="h-full bg-studio-gold rounded-full transition-all"
                  style={{ width: `${(achieved / items.length) * 100}%` }} />
              </div>
              <span className="text-xs text-studio-muted">{achieved}/{items.length}</span>
            </div>
            <div className="space-y-1">
              {items.map(sm => (
                <div key={sm.id} className="flex items-center gap-2 bg-studio-bg border border-studio-rim rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-studio-cream truncate">{sm.milestone.name}</p>
                    {sm.achieved_at && (
                      <p className="text-xs text-studio-muted">
                        Achieved {new Date(sm.achieved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[sm.milestone.difficulty] ?? ''}`}>
                    {sm.milestone.difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleStatus(sm)}
                    disabled={updating === sm.id}
                    className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-all hover:opacity-80 disabled:opacity-50 ${STATUS_STYLES[sm.status]}`}
                    title="Click to advance status"
                  >
                    {STATUS_LABELS[sm.status]}
                  </button>
                  <button type="button" onClick={() => handleRemove(sm.id)}
                    className="text-studio-muted hover:text-studio-rose text-xs ml-1" aria-label="Remove milestone">✕</button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function MilestonePicker({ library, alreadyAdded, onAdd, studentId, onCustomAdded }: {
  library: TechniqueMilestone[]
  alreadyAdded: Set<string>
  onAdd: (id: string) => void
  studentId: string
  onCustomAdded: (sm: StudentMilestone) => void
}) {
  const [tab, setTab] = useState<'library' | 'custom'>('library')
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Custom')
  const [customDifficulty, setCustomDifficulty] = useState('Intermediate')
  const [saving, setSaving] = useState(false)

  const filtered = library.filter(m =>
    !alreadyAdded.has(m.id) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
  )

  const grouped = filtered.reduce<Record<string, TechniqueMilestone[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {})

  const handleCustomSubmit = async () => {
    if (!customName.trim()) return
    setSaving(true)
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        custom: { name: customName.trim(), category: customCategory, difficulty: customDifficulty },
      }),
    })
    if (res.ok) {
      const { id } = await res.json()
      onCustomAdded({
        id, student_id: studentId, milestone_id: id, teacher_id: '',
        status: 'not_started', achieved_at: null, created_at: new Date().toISOString(),
        milestone: { id, name: customName.trim(), category: customCategory, instrument: null, difficulty: customDifficulty as 'Beginner' | 'Intermediate' | 'Advanced' | 'Virtuoso', description: null, is_seed: false },
      })
    }
    setSaving(false)
  }

  return (
    <div className="bg-studio-bg border border-studio-rim rounded-xl p-4 mb-4">
      <div className="flex gap-2 mb-3">
        {(['library', 'custom'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${tab === t ? 'bg-studio-primary text-studio-bg' : 'text-studio-muted hover:text-studio-cream'}`}>
            {t === 'library' ? 'From Library' : 'Custom'}
          </button>
        ))}
      </div>

      {tab === 'library' && (
        <>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search milestones…" className="studio-input w-full mb-3 text-sm" />
          <div className="max-h-64 overflow-y-auto space-y-3">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs text-studio-muted uppercase tracking-wide mb-1">{cat}</p>
                {items.map(m => (
                  <button key={m.id} type="button" onClick={() => onAdd(m.id)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-studio-rim/50 transition-colors">
                    <span className="text-sm text-studio-cream flex-1">{m.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${DIFFICULTY_STYLES[m.difficulty] ?? ''}`}>{m.difficulty}</span>
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(grouped).length === 0 && <p className="text-sm text-studio-muted">No results</p>}
          </div>
        </>
      )}

      {tab === 'custom' && (
        <div className="space-y-3">
          <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
            placeholder="Milestone name" maxLength={100} className="studio-input w-full" />
          <div className="grid grid-cols-2 gap-2">
            <select value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="studio-input">
              {['Scales','Arpeggios','Shifting','Articulation','Rhythm','Sight-Reading','Ear Training','Improvisation','World Technique','Custom'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={customDifficulty} onChange={e => setCustomDifficulty(e.target.value)} className="studio-input">
              {['Beginner','Intermediate','Advanced','Virtuoso'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={handleCustomSubmit} disabled={saving || !customName.trim()}
            className="studio-btn-primary text-sm disabled:opacity-50">
            {saving ? 'Adding…' : 'Add Custom Milestone'}
          </button>
        </div>
      )}
    </div>
  )
}
