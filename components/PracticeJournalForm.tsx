'use client'

import { useState, useCallback } from 'react'
import type { MetronomeLogDraft } from '@/lib/types'
import Spinner from '@/components/Spinner'
import RepertoireCatalogSearch from '@/components/RepertoireCatalogSearch'
import type { CatalogItem } from '@/lib/types'

const MOODS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😩', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Tough' },
  { value: 3, emoji: '😐', label: 'OK' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

interface Props {
  onSaved: () => void
  onCancel: () => void
}

export default function PracticeJournalForm({ onSaved, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [entryDate, setEntryDate] = useState(today)
  const [duration, setDuration] = useState(30)
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState('')
  const [logs, setLogs] = useState<MetronomeLogDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addLog = useCallback((item: CatalogItem) => {
    setLogs(prev => prev.some(l => l.catalog_item_id === item.id) ? prev : [
      ...prev,
      { key: item.id, catalog_item_id: item.id, catalog_item_title: item.title, bpm_start: 60, bpm_end: null, note: '' }
    ])
  }, [])

  const updateLog = (key: string, field: keyof MetronomeLogDraft, value: unknown) => {
    setLogs(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l))
  }

  const removeLog = (key: string) => setLogs(prev => prev.filter(l => l.key !== key))

  const handleSubmit = async () => {
    if (duration < 1 || duration > 300) { setError('Duration must be 1–300 minutes'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/practice-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_date: entryDate,
          duration_min: duration,
          mood,
          notes: notes.trim() || null,
          metronome_logs: logs.map(l => ({
            catalog_item_id: l.catalog_item_id,
            bpm_start: l.bpm_start,
            bpm_end: l.bpm_end || null,
            note: l.note.trim() || null,
          })),
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
    <div className="space-y-5 bg-studio-surface border border-studio-rim rounded-xl p-5">
      <h3 className="font-display text-xl text-studio-cream">Log Practice Session</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-studio-muted mb-1" htmlFor="pj-date">Date</label>
          <input id="pj-date" type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)}
            className="studio-input w-full" max={today} />
        </div>
        <div>
          <label className="block text-xs text-studio-muted mb-1" htmlFor="pj-duration">Duration (min)</label>
          <input id="pj-duration" type="number" min={1} max={300} value={duration}
            onChange={e => setDuration(Number(e.target.value))} className="studio-input w-full" />
        </div>
      </div>

      <div>
        <p className="text-xs text-studio-muted mb-2">How did it go?</p>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button key={m.value} type="button" onClick={() => setMood(m.value)}
              aria-label={m.label} title={m.label}
              className={`text-2xl rounded-lg p-2 transition-all ${mood === m.value ? 'bg-studio-primary/30 ring-2 ring-studio-gold' : 'hover:bg-studio-rim'}`}>
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-studio-muted mb-1" htmlFor="pj-notes">Notes (optional)</label>
        <textarea id="pj-notes" value={notes} onChange={e => setNotes(e.target.value)}
          maxLength={1000} rows={3} placeholder="What did you work on? Any breakthroughs or struggles?"
          className="studio-input w-full resize-none" />
        <p className="text-right text-xs text-studio-muted mt-1">{notes.length}/1000</p>
      </div>

      <div>
        <p className="text-xs text-studio-muted mb-2">Metronome Log — tag pieces you worked on</p>
        <RepertoireCatalogSearch onSelect={addLog} inputId="pj-catalog-search" />
        {logs.length > 0 && (
          <div className="mt-3 space-y-3">
            {logs.map(log => (
              <div key={log.key} className="bg-studio-bg border border-studio-rim rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-studio-cream font-medium">{log.catalog_item_title}</span>
                  <button type="button" onClick={() => removeLog(log.key)}
                    className="text-studio-muted hover:text-studio-rose text-xs" aria-label="Remove">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-studio-muted mb-1">Start BPM</label>
                    <input type="number" min={20} max={300} value={log.bpm_start}
                      onChange={e => updateLog(log.key, 'bpm_start', Number(e.target.value))}
                      className="studio-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-studio-muted mb-1">End BPM (optional)</label>
                    <input type="number" min={20} max={300} value={log.bpm_end ?? ''}
                      onChange={e => updateLog(log.key, 'bpm_end', e.target.value ? Number(e.target.value) : null)}
                      className="studio-input w-full" placeholder="—" />
                  </div>
                </div>
                <input type="text" maxLength={200} value={log.note}
                  onChange={e => updateLog(log.key, 'note', e.target.value)}
                  placeholder="Quick note (optional)" className="studio-input w-full text-sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-studio-rose">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={saving} className="studio-btn-primary disabled:opacity-50">
          {saving ? <span className="inline-flex items-center gap-2"><Spinner />Saving…</span> : 'Save Session'}
        </button>
        <button type="button" onClick={onCancel} className="studio-btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
