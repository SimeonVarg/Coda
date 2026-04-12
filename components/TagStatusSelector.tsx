'use client'

import type { RepertoireStatus } from '@/lib/types'

interface TagStatusSelectorProps {
  value: RepertoireStatus
  onChange: (status: RepertoireStatus) => void
  disabled?: boolean
}

export default function TagStatusSelector({ value, onChange, disabled }: TagStatusSelectorProps) {
  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Invisible select — sized to just the chevron button */}
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
      {/* Visible chevron button */}
      <span className="flex items-center justify-center w-6 h-6 rounded border border-studio-primary/30 bg-studio-surface text-studio-gold text-xs select-none pointer-events-none">
        ›
      </span>
    </div>
  )
}
