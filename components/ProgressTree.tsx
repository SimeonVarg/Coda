"use client"

import { useState } from "react"
import Link from "next/link"
import type { ProgressTreeData, RepertoireItem, RepertoireStatus, JSONContent, LessonEntryTag } from "@/lib/types"
import TagStatusSelector from "@/components/TagStatusSelector"
import EmptyState from "@/components/EmptyState"
import { createSupabaseClient } from "@/lib/supabase/client"
import { isDemoUser } from "@/lib/demo"
import { formatDate } from "@/lib/utils"

interface ProgressTreeProps {
  data: ProgressTreeData
  role: "teacher" | "student"
  lessonCount?: number
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
    <section aria-label={`${STATUS_LABELS[status]} repertoire`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${heading}`}>
        {STATUS_LABELS[status]}
        <span className="font-normal normal-case tracking-normal opacity-70">· {items.length}</span>
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
                <span className="text-studio-muted text-sm ml-2 truncate">— {item.composer}</span>
              )}
            </div>
            {flashId === item.id && (
              <span className="text-studio-gold text-sm font-medium" aria-hidden="true">✓</span>
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

function extractText(node: JSONContent): string {
  if (node.text) return node.text
  if (node.content) return node.content.map(extractText).join(" ")
  return ""
}

function LessonContent({ content }: { content: JSONContent }) {
  const text = extractText(content).trim()
  return text
    ? <p className="text-studio-text text-sm whitespace-pre-wrap line-clamp-3">{text}</p>
    : <p className="text-studio-muted text-sm italic">No notes.</p>
}

const TAG_STATUS_BADGE: Record<string, string> = {
  introduced: "bg-studio-primary/20 text-studio-primary",
  in_progress: "bg-studio-gold/20 text-studio-gold",
  mastered: "bg-studio-cream/20 text-studio-cream",
  completed: "bg-studio-gold/20 text-studio-gold",
}

function LessonTags({ tags }: { tags: LessonEntryTag[] }) {
  if (tags.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${TAG_STATUS_BADGE[tag.status] ?? "bg-studio-surface text-studio-muted"}`}
        >
          {tag.type === "repertoire" ? "♪" : "♩"} {tag.title}
        </span>
      ))}
    </div>
  )
}

function ProgressSummary({ items }: { items: RepertoireItem[] }) {
  if (items.length === 0) return null
  const mastered = items.filter((i) => i.status === "mastered").length
  const pct = Math.round((mastered / items.length) * 100)
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { value: items.length, label: "Total pieces" },
        { value: mastered, label: "Mastered" },
        { value: `${pct}%`, label: "Completion" },
      ].map(({ value, label }) => (
        <div key={label} className="bg-studio-surface rounded-xl p-3 border border-studio-rim text-center">
          <p className="text-xl font-display font-semibold text-studio-gold">{value}</p>
          <p className="text-xs text-studio-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function ProgressTree({ data, role, lessonCount }: ProgressTreeProps) {
  const [repertoireItems, setRepertoireItems] = useState<RepertoireItem[]>(
    data.repertoire_items
  )
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { completed_theory, lesson_entries } = data
  const hasRepertoire = repertoireItems.length > 0
  const hasTheory = completed_theory.length > 0
  const hasEntries = (lesson_entries ?? []).length > 0
  const count = lessonCount ?? lesson_entries?.length ?? 0

  const handleStatusChange = async (tagId: string, newStatus: RepertoireStatus) => {
    const prev = repertoireItems.find((i) => i.id === tagId)
    if (!prev) return

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (isDemoUser(user)) {
      setUpdateError("Editing is disabled in demo mode.")
      return
    }

    setRepertoireItems((items) =>
      items.map((i) => (i.id === tagId ? { ...i, status: newStatus } : i))
    )
    setUpdateError(null)

    const { error } = await supabase
      .from("repertoire_tags")
      .update({ status: newStatus })
      .eq("id", tagId)

    if (error) {
      setRepertoireItems((items) =>
        items.map((i) => (i.id === tagId ? { ...i, status: prev.status } : i))
      )
      setUpdateError("Failed to update status. Please try again.")
    } else {
      setFlashId(tagId)
      setTimeout(() => setFlashId(null), 1500)
    }
  }

  const grouped = STATUS_ORDER.reduce<Record<RepertoireStatus, RepertoireItem[]>>(
    (acc, s) => {
      acc[s] = repertoireItems.filter((i) => i.status === s)
      return acc
    },
    { introduced: [], in_progress: [], mastered: [] }
  )

  return (
    <div className="mt-6 space-y-10">
      {/* Lesson count badge */}
      {count > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-studio-primary/15 border border-studio-primary/30 px-3 py-1 text-xs font-medium text-studio-primary">
            ♪ {count} {count === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      )}

      {updateError && (
        <p role="alert" className="text-sm text-studio-rose">{updateError}</p>
      )}

      {/* Repertoire grouped by status */}
      {hasRepertoire ? (
        <section aria-label="Repertoire">
          <h2 className="text-lg font-semibold text-studio-gold mb-4 flex items-center gap-2">
            Repertoire
            <span className="text-sm font-normal text-studio-muted">· {repertoireItems.length}</span>
          </h2>
          <ProgressSummary items={repertoireItems} />
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
      ) : (
        <EmptyState message="No repertoire tagged yet. Add pieces during a lesson." />
      )}

      {/* Theory */}
      {hasTheory ? (
        <section aria-label="Theory">
          <h2 className="text-lg font-semibold text-studio-gold mb-3 flex items-center gap-2">
            Theory
            <span className="text-sm font-normal text-studio-muted">· {completed_theory.length}</span>
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
      ) : (
        <EmptyState message="No theory completed yet." />
      )}

      {/* Collapsible lesson history */}
      <section aria-label="Lesson history">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex items-center gap-2 text-lg font-semibold text-studio-text hover:text-studio-cream transition-colors duration-[150ms] w-full text-left"
          aria-expanded={historyOpen}
        >
          <span className="text-studio-muted text-sm transition-transform duration-150" style={{ transform: historyOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
          Lesson History
          {hasEntries && (
            <span className="text-xs font-normal text-studio-muted ml-1">
              ({lesson_entries?.length})
            </span>
          )}
        </button>

        {historyOpen && (
          <div className="mt-3">
            {hasEntries ? (
              <ul className="space-y-3">
                {(lesson_entries ?? []).map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-studio-rim bg-studio-surface p-4 hover:-translate-y-0.5 hover:shadow-studio-glow transition-all duration-[250ms] will-change-transform">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-studio-muted">
                        {formatDate(entry.created_at)}
                      </p>
                      {role === "teacher" && (
                        <Link
                          href={`/lessons/${entry.id}/edit`}
                          className="text-xs font-medium text-studio-gold hover:text-studio-cream transition-colors duration-[150ms]"
                        >
                          Edit →
                        </Link>
                      )}
                    </div>
                    <LessonContent content={entry.content} />
                    <LessonTags tags={entry.tags} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No lessons recorded yet. Start by adding a new lesson." />
            )}
          </div>
        )}
      </section>
    </div>
  )
}
