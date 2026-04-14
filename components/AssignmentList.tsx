"use client"

import { useState } from "react"
import type { AssignmentRow } from "@/lib/types"
import { createSupabaseClient } from "@/lib/supabase/client"
import { isDemoUser } from "@/lib/demo"
import EmptyState from "@/components/EmptyState"

interface AssignmentListProps {
  assignments: AssignmentRow[]
  role: "teacher" | "student"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function isOverdue(due_date: string | null): boolean {
  if (!due_date) return false
  return due_date < new Date().toISOString().slice(0, 10)
}

export default function AssignmentList({ assignments, role }: AssignmentListProps) {
  const [items, setItems] = useState<AssignmentRow[]>(assignments)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeItems = items.filter((a) => a.completed_at === null)
  const completedItems = items.filter((a) => a.completed_at !== null)

  const markDone = async (id: string) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (isDemoUser(user)) {
      setErrors((prev) => ({ ...prev, [id]: "Saving is disabled in demo mode." }))
      return
    }

    const now = new Date().toISOString()
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, completed_at: now } : a)))
    setErrors((prev) => { const next = { ...prev }; delete next[id]; return next })

    const { error } = await supabase
      .from("practice_assignments")
      .update({ completed_at: now })
      .eq("id", id)

    if (error) {
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, completed_at: null } : a)))
      setErrors((prev) => ({ ...prev, [id]: "Failed to mark done. Please try again." }))
    }
  }

  if (items.length === 0) {
    return role === "student"
      ? <EmptyState message="No active assignments — great work!" />
      : <EmptyState message="No practice assignments assigned yet." />
  }

  return (
    <div className="space-y-6">
      {activeItems.length > 0 && (
        <section>
          {role === "teacher" && (
            <h3 className="text-sm font-semibold text-studio-text uppercase tracking-wide mb-2">Active</h3>
          )}
          <ul className="space-y-2">
            {activeItems.map((a) => {
              const overdue = isOverdue(a.due_date)
              return (
                <li
                  key={a.id}
                  className={`flex items-start gap-3 rounded-lg border bg-studio-surface px-4 py-3 transition-colors duration-200 ${
                    overdue ? "border-studio-rose/50" : "border-studio-primary/30"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-studio-cream">{a.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-studio-muted">
                      {a.due_date && (
                        <span className={overdue ? "text-studio-rose font-medium" : ""}>
                          Due: {formatDate(a.due_date)}
                          {overdue && (
                            <span className="ml-1.5 rounded px-1.5 py-0.5 bg-studio-rose/15 text-studio-rose font-semibold">
                              Overdue
                            </span>
                          )}
                        </span>
                      )}
                      {role === "teacher" && (
                        <span>From lesson: {formatDate(a.lesson_entry_date)}</span>
                      )}
                    </div>
                    {errors[a.id] && (
                      <p role="alert" className="mt-1 text-xs text-studio-rose">{errors[a.id]}</p>
                    )}
                  </div>
                  {role === "student" && (
                    <button
                      type="button"
                      onClick={() => markDone(a.id)}
                      className="shrink-0 rounded-md bg-studio-primary text-studio-bg px-3 py-1.5 text-xs font-medium hover:bg-studio-gold focus:outline-none focus:ring-2 focus:ring-studio-gold/50"
                    >
                      Mark done
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {activeItems.length === 0 && role === "student" && (
        <EmptyState message="No active assignments — great work!" />
      )}

      {role === "teacher" && completedItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-studio-muted uppercase tracking-wide mb-2">Completed</h3>
          <ul className="space-y-2">
            {completedItems.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-studio-rim bg-studio-surface/50 px-4 py-3 opacity-75"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-studio-muted line-through">{a.description}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-studio-muted">
                    {a.due_date && <span>Due: {formatDate(a.due_date)}</span>}
                    {a.completed_at && <span>Completed: {formatDate(a.completed_at)}</span>}
                    <span>From lesson: {formatDate(a.lesson_entry_date)}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-studio-gold/20 px-2 py-0.5 text-xs text-studio-gold">
                  ✓ Done
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
