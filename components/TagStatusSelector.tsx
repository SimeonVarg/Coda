'use client'

import type { RepertoireStatus } from '@/lib/types'

const STATUS_LABELS: Record<RepertoireStatus, string> = {
  introduced: 'Introduced',
  in_progress: 'In Progress',
  mastered: 'Mastered',
}

interface TagStatusSelectorProps {
  value: RepertoireStatus
  onChange: (status: RepertoireStatus) => void
  disabled?: boolean
}

export default function TagStatusSelector({ value, onChange, disabled }: TagStatusSelectorProps) {
  return (
    <div className="relative inline-flex items-center gap-1 shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RepertoireStatus)}
        disabled={disabled}
        aria-label="Change status"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        style={{ colorScheme: 'dark' }}
      >
        <option value="introduced">Introduced</option>
        <option value="in_progress">In Progress</option>
        <option value="mastered">Mastered</option>
      </select>
      <span className="text-xs text-studio-muted pointer-events-none select-none">
        {STATUS_LABELS[value]}
      </span>
      <span className="flex items-center justify-center w-5 h-5 rounded border border-studio-primary/30 bg-studio-surface text-studio-gold text-xs select-none pointer-events-none">
        ›
      </span>
    </div>
  )
}
