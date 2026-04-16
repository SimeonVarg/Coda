'use client'

import { useState } from 'react'
import StarRating from '@/components/StarRating'
import Spinner from '@/components/Spinner'

interface Props {
  lessonEntryId: string
  lessonDate: string
  existingReflection?: {
    id: string
    self_rating: number
    went_well: string | null
    was_challenging: string | null
    next_goal: string | null
  } | null
  onSaved: () => void
  onCancel: () => void
}

export default function ReflectionForm({ lessonEntryId, lessonDate, existingReflection, onSaved, onCancel }: Props) {
  const [rating, setRating] = useState<number>(existingReflection?.self_rating ?? 3)
  const [wentWell, setWentWell] = useState(existingReflection?.went_well ?? '')
  const [wasChallenging, setWasChallenging] = useState(existingReflection?.was_challenging ?? '')
  const [nextGoal, setNextGoal] = useState(existingReflection?.next_goal ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_entry_id: lessonEntryId,
          self_rating: rating,
          went_well: wentWell.trim() || null,
          was_challenging: wasChallenging.trim() || null,
          next_goal: nextGoal.trim() || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-studio-surface border border-studio-rim rounded-xl p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg text-studio-cream">Reflect on Lesson</h3>
        <p className="text-xs text-studio-muted">{new Date(lessonDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div>
        <p className="text-sm text-studio-cream mb-2">How did this lesson go overall?</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-xs text-studio-muted mb-1" htmlFor="rf-well">What went well?</label>
        <textarea id="rf-well" value={wentWell} onChange={e => setWentWell(e.target.value)}
          maxLength={500} rows={3} className="studio-input w-full resize-none"
          placeholder="Describe a moment of success or progress…" />
        <p className="text-right text-xs text-studio-muted mt-0.5">{wentWell.length}/500</p>
      </div>

      <div>
        <label className="block text-xs text-studio-muted mb-1" htmlFor="rf-challenge">What was challenging?</label>
        <textarea id="rf-challenge" value={wasChallenging} onChange={e => setWasChallenging(e.target.value)}
          maxLength={500} rows={3} className="studio-input w-full resize-none"
          placeholder="What felt difficult or unclear?" />
        <p className="text-right text-xs text-studio-muted mt-0.5">{wasChallenging.length}/500</p>
      </div>

      <div>
        <label className="block text-xs text-studio-muted mb-1" htmlFor="rf-goal">My goal for next lesson</label>
        <textarea id="rf-goal" value={nextGoal} onChange={e => setNextGoal(e.target.value)}
          maxLength={300} rows={2} className="studio-input w-full resize-none"
          placeholder="What do you want to focus on next time?" />
        <p className="text-right text-xs text-studio-muted mt-0.5">{nextGoal.length}/300</p>
      </div>

      {error && <p role="alert" className="text-sm text-studio-rose">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={saving} className="studio-btn-primary disabled:opacity-50">
          {saving ? <span className="inline-flex items-center gap-2"><Spinner />Saving…</span> : 'Save Reflection'}
        </button>
        <button type="button" onClick={onCancel} className="studio-btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
