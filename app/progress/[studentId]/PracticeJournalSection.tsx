'use client'

import { useState } from 'react'
import type { PracticeJournalEntry } from '@/lib/types'
import PracticeJournalForm from '@/components/PracticeJournalForm'
import PracticeJournalList from '@/components/PracticeJournalList'

interface Props {
  role: 'teacher' | 'student'
  initialEntries: PracticeJournalEntry[]
}

export default function PracticeJournalSection({ role, initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [showForm, setShowForm] = useState(false)

  const totalMinutesThisWeek = entries
    .filter(e => {
      const d = new Date(e.entry_date + 'T12:00:00')
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      return d >= weekAgo
    })
    .reduce((sum, e) => sum + e.duration_min, 0)

  const handleSaved = async () => {
    setShowForm(false)
    // Refetch the latest entries from the server
    try {
      const res = await fetch('/api/practice-journal/list')
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch {
      // If refetch fails, the list will update on next page load
    }
  }

  return (
    <div>
      {entries.length > 0 && (
        <div className="flex gap-4 mb-4">
          <div className="bg-studio-surface border border-studio-rim rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-display text-studio-gold">{totalMinutesThisWeek}</p>
            <p className="text-xs text-studio-muted">min this week</p>
          </div>
          <div className="bg-studio-surface border border-studio-rim rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-display text-studio-gold">{entries.length}</p>
            <p className="text-xs text-studio-muted">sessions total</p>
          </div>
        </div>
      )}

      {role === 'student' && !showForm && (
        <button type="button" onClick={() => setShowForm(true)} className="studio-btn-primary text-sm mb-4">
          + Log Practice Session
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <PracticeJournalForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <PracticeJournalList
        entries={entries}
        onDeleted={id => setEntries(prev => prev.filter(e => e.id !== id))}
      />
    </div>
  )
}
