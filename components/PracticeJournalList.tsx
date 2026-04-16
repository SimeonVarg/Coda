'use client'

import { useState } from 'react'
import type { PracticeJournalEntry } from '@/lib/types'

const MOOD_EMOJI: Record<number, string> = { 1: '😩', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

interface Props {
  entries: PracticeJournalEntry[]
  onDeleted: (id: string) => void
}

export default function PracticeJournalList({ entries, onDeleted }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this practice session?')) return
    setDeleting(id)
    try {
      await fetch(`/api/practice-journal/${id}`, { method: 'DELETE' })
      onDeleted(id)
    } finally {
      setDeleting(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-studio-muted text-sm">
        <p className="text-2xl mb-2">🎵</p>
        <p>No practice sessions logged yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => {
        const isOpen = expanded.has(entry.id)
        const logs = entry.metronome_logs ?? []
        return (
          <div key={entry.id} className="bg-studio-surface border border-studio-rim rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(entry.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-studio-rim/30 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-xl" aria-hidden="true">{MOOD_EMOJI[entry.mood]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-studio-cream font-medium">
                  {new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-studio-muted">
                  {entry.duration_min} min{logs.length > 0 ? ` · ${logs.length} piece${logs.length !== 1 ? 's' : ''}` : ''}
                </p>
              </div>
              <span className="text-studio-muted text-xs">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-studio-rim">
                {entry.notes && (
                  <p className="text-sm text-studio-text mt-3 whitespace-pre-wrap">{entry.notes}</p>
                )}
                {logs.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-studio-muted mb-2 font-medium uppercase tracking-wide">Metronome Log</p>
                    <div className="space-y-1">
                      {logs.map(log => (
                        <div key={log.id} className="flex items-center gap-3 text-sm">
                          <span className="text-studio-cream flex-1 truncate">{log.catalog_item_title ?? 'Piece'}</span>
                          <span className="text-studio-gold font-mono text-xs">
                            ♩={log.bpm_start}{log.bpm_end ? ` → ${log.bpm_end}` : ''}
                          </span>
                          {log.note && <span className="text-studio-muted text-xs truncate max-w-[120px]">{log.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleting === entry.id}
                    className="text-xs text-studio-muted hover:text-studio-rose transition-colors disabled:opacity-50"
                  >
                    {deleting === entry.id ? 'Deleting…' : 'Delete session'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
