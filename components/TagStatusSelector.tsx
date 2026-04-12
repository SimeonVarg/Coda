'use client'

import type { RepertoireStatus } from '@/lib/types'

interface TagStatusSelectorProps {
  value: RepertoireStatus
  onChange: (status: RepertoireStatus) => void
  disabled?: boolean
}

export default function TagStatusSelector({ value, onChange, disabled }: TagStatusSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RepertoireStatus)}
        disabled={disabled}
        aria-label="Change status"
        className="appearance-none rounded border border-studio-primary/30 bg-studio-surface pl-2 pr-6 py-1 text-sm text-transparent focus:border-studio-gold focus:outline-none focus:ring-2 focus:ring-studio-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
      >
        <option value="introduced">Introduced</option>
        <option value="in_progress">In Progress</option>
        <option value="mastered">Mastered</option>
      </select>
      {/* Chevron icon overlay — always visible */}
      <span className="pointer-events-none absolute right-1.5 text-studio-gold text-xs select-none">
        ›
      </span>
    </div>
  )
}
