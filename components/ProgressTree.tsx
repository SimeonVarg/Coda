"use client"

import { useState } from "react"
import type { ProgressTreeData, RepertoireItem, RepertoireStatus } from "@/lib/types"
import TagStatusSelector from "@/components/TagStatusSelector"
import EmptyState from "@/components/EmptyState"
import { createSupabaseClient } from "@/lib/supabase/client"
import { isDemoUser } from "@/lib/demo"

interface ProgressTreeProps {
  data: ProgressTreeData
  role: "teacher" | "student"
}

const STATUS_ORDER: RepertoireStatus[] = ["introduced", "in_progress", "mastered"]

const STATUS_LABELS: Record<RepertoireStatus, string> = {
  introduced: "Introduced",
  in_progress: "In Progress",
  mastered: "Mastered",
}

const STATUS_BADGE_CLASSES: Record<RepertoireStatus, string> = {
  introduced: "bg-studio-primary/20 text-studio-primary border border-studio-primary/40",
  in_progress: "bg-studio-gold/20 text-studio-gold border border-studio-gold/40",
  mastered: "bg-studio-cream/20 text-studio-cream border border-studio-cream/40",
}

const STATUS_SECTION_CLASSES: Record<RepertoireStatus, { border: string; heading: string }> = {
  introduced: { border: "border-studio-primary/30", heading: "text-studio-primary" },
  in_progress: { border: "border-studio-gold/30", heading: "text-studio-gold" },
  mastered: { border: "border-studio-cream/30", heading: "text-studio-cream" },
}

function StatusBadge({ status }: { status: RepertoireStatus }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function RepertoireSection({
  status,
  items,
  role,
  onStatusChange,
  flashId,
}: {
  status: RepertoireStatus
  items: RepertoireItem[]
  role: "teacher" | "student"
  onStatusChange: (tagId: string, newStatus: RepertoireStatus) => void
  flashId: string | null
}) {
  const { border, heading } = STATUS_SECTION_CLASSES[status]
  return (
    <section>
      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${heading}`}>
        {STATUS_LABELS[status]}
      </h3>
      <ul className={`space-y-2 pl-4 border-l-2 ${border}`}>
        {items.map((item, i) => (
          <li
            key={item.id}
            className="progress-tree-repertoire animate-fade-up flex items-center gap-2 py-2 px-3 rounded-lg bg-studio-surface border border-studio-rim hover:-translate-y-0.5 hover:shadow-studio-glow transition-all duration-[250ms] will-change-transform"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-studio-gold text-xs">♪</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-studio-cream">{item.title}</span>
              {item.composer && (
                <span className="text-studio-muted text-sm ml-2">— {item.composer}</span>
              )}
            </div>
            {flashId === item.id && (
              <span className="text-studio-gold text-sm font-medium">✓</span>
            )}
            <StatusBadge status={item.status} />
            {role === "teacher" && (
              <TagStatusSelector
                value={item.status}
                onChange={(newStatus) => onStatusChange(item.id, newStatus)}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ProgressTree({ data, role }: ProgressTreeProps) {
  const [repertoireItems, setRepertoireItems] = useState<RepertoireItem[]>(
    data.repertoire_items
  )
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

  const { completed_theory, lesson_entries } = data
  const hasTaggedItems = repertoireItems.length > 0 || completed_theory.length > 0
  const hasEntries = (lesson_entries ?? []).length > 0

  const handleStatusChange = async (tagId: string, newStatus: RepertoireStatus) => {
    const prev = repertoireItems.find((i) => i.id === tagId)
    if (!prev) return

    // Block demo users
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (isDemoUser(user)) {
      setUpdateError("Editing is disabled in demo mode.")
      return
    }

    // Optimistic update
    setRepertoireItems((items) =>
      items.map((i) => (i.id === tagId ? { ...i, status: newStatus } : i))
    )
    setUpdateError(null)

    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from("repertoire_tags")
      .update({ status: newStatus })
      .eq("id", tagId)

    if (error) {
      // Revert on failure
      setRepertoireItems((items) =>
        items.map((i) => (i.id === tagId ? { ...i, status: prev.status } : i))
      )
      setUpdateError("Failed to update status. Please try again.")
    } else {
      setFlashId(tagId)
      setTimeout(() => setFlashId(null), 1500)
    }
  }

  // Group repertoire items by status, preserving STATUS_ORDER
  const grouped = STATUS_ORDER.reduce<Record<RepertoireStatus, RepertoireItem[]>>(
    (acc, s) => {
      acc[s] = repertoireItems.filter((i) => i.status === s)
      return acc
    },
    { introduced: [], in_progress: [], mastered: [] }
  )

  return (
    <div className="mt-6 space-y-10">
      {updateError && (
        <p role="alert" className="text-sm text-studio-rose">{updateError}</p>
      )}

      {/* Repertoire grouped by status */}
      {repertoireItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-studio-gold mb-4 flex items-center gap-2">
            Repertoire
          </h2>
          <div className="space-y-6">
            {STATUS_ORDER.map((status) =>
              grouped[status].length > 0 ? (
                <RepertoireSection
                  key={status}
                  status={status}
                  items={grouped[status]}
                  role={role}
                  onStatusChange={handleStatusChange}
                  flashId={flashId}
                />
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Theory */}
      {completed_theory.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-studio-gold mb-3 flex items-center gap-2">
            Theory
          </h2>
          <ul className="space-y-2 pl-4 border-l-2 border-studio-gold/30">
            {completed_theory.map((item) => (
              <li
                key={item.id}
                className="progress-tree-theory flex items-center gap-2 py-2 px-3 rounded-lg bg-studio-surface text-studio-cream"
              >
                <span className="text-studio-gold text-xs">♩</span>
                <span className="font-medium">{item.title}</span>
                <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-studio-gold/20 text-studio-gold">
                  Completed
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasTaggedItems && (
        <EmptyState message="No repertoire or theory tagged yet." />
      )}

      {/* Lesson history */}
      <section>
        <h2 className="text-lg font-semibold text-studio-text mb-3 flex items-center gap-2">
          Lesson Notes
        </h2>
        {hasEntries ? (
          <ul className="space-y-3">
            {(lesson_entries ?? []).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-studio-rim bg-studio-surface p-4 hover:-translate-y-0.5 hover:shadow-studio-glow transition-all duration-[250ms] will-change-transform">
                <p className="text-xs text-studio-muted mb-2">
                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
                <LessonContent content={entry.content} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No lesson notes recorded yet." />
        )}
      </section>
    </div>
  )
}

function LessonContent({ content }: { content: unknown }) {
  if (!content || typeof content !== "object") {
    return <p className="text-studio-muted text-sm italic">No notes.</p>
  }

  function extractText(node: any): string {
    if (node.text) return node.text
    if (node.content) return node.content.map(extractText).join(" ")
    return ""
  }

  const text = extractText(content).trim()
  return text
    ? <p className="text-studio-text text-sm whitespace-pre-wrap">{text}</p>
    : <p className="text-studio-muted text-sm italic">No notes.</p>
}
