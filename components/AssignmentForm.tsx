"use client"

import type { AssignmentDraft } from "@/lib/types"

const DESC_MAX = 200

interface AssignmentFormProps {
  assignments: AssignmentDraft[]
  onChange: (assignments: AssignmentDraft[]) => void
}

export default function AssignmentForm({ assignments, onChange }: AssignmentFormProps) {
  const addAssignment = () => {
    onChange([...assignments, { key: crypto.randomUUID(), description: "", due_date: null }])
  }

  const removeAssignment = (key: string) => {
    onChange(assignments.filter((a) => a.key !== key))
  }

  const updateDescription = (key: string, description: string) => {
    onChange(assignments.map((a) => (a.key === key ? { ...a, description } : a)))
  }

  const updateDueDate = (key: string, due_date: string) => {
    onChange(assignments.map((a) => (a.key === key ? { ...a, due_date: due_date || null } : a)))
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <div key={assignment.key} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <label htmlFor={`assignment-desc-${assignment.key}`} className="sr-only">
              Assignment description
            </label>
            <input
              id={`assignment-desc-${assignment.key}`}
              type="text"
              value={assignment.description}
              onChange={(e) => updateDescription(assignment.key, e.target.value)}
              placeholder="e.g. Practice bars 1–16 of Für Elise, 20 minutes daily"
              maxLength={DESC_MAX}
              className="block w-full rounded-md bg-studio-surface border border-studio-primary/30 text-studio-cream px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-studio-gold focus:border-studio-gold transition-all duration-[150ms] placeholder:text-studio-muted"
            />
            {assignment.description.length > 0 && (
              <p className={`text-right text-xs ${assignment.description.length >= 180 ? "text-studio-rose" : "text-studio-muted"}`}>
                {assignment.description.length} / {DESC_MAX}
              </p>
            )}
            <label htmlFor={`due-date-${assignment.key}`} className="block text-xs text-studio-muted">
              Optional due date
            </label>
            <input
              id={`due-date-${assignment.key}`}
              type="date"
              value={assignment.due_date ?? ""}
              onChange={(e) => updateDueDate(assignment.key, e.target.value)}
              aria-label="Due date (optional)"
              className="block rounded-md bg-studio-surface border border-studio-primary/30 text-studio-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-studio-gold focus:border-studio-gold transition-all duration-[150ms] [color-scheme:dark]"
            />
          </div>
          <button
            type="button"
            onClick={() => removeAssignment(assignment.key)}
            aria-label="Remove assignment"
            className="mt-2 rounded-full p-2 text-studio-muted hover:bg-studio-rim hover:text-studio-rose focus:outline-none focus:ring-2 focus:ring-studio-rose/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addAssignment}
        className="text-sm text-studio-primary hover:text-studio-gold font-medium"
      >
        + Add assignment
      </button>
    </div>
  )
}
