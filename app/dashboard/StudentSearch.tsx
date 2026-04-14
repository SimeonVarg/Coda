"use client"

import { useState } from "react"
import Link from "next/link"
import type { StudentSummary } from "@/lib/types"
import { formatDate } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

// Deterministic color from name for avatar background
const AVATAR_COLORS = [
  "bg-studio-primary/30 text-studio-primary",
  "bg-studio-gold/30 text-studio-gold",
  "bg-studio-cream/20 text-studio-cream",
  "bg-studio-rose/30 text-studio-rose",
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function StudentCard({ student }: { student: StudentSummary }) {
  const initials = getInitials(student.full_name)
  const colorClass = avatarColor(student.full_name)

  return (
    <li>
      <div className="bg-studio-surface rounded-2xl shadow-studio-glow hover:-translate-y-1 hover:shadow-studio-glow-lg transition-all duration-[250ms] will-change-transform">
        <Link href={`/progress/${student.id}`} className="block px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 border border-studio-rim ${colorClass}`}
              aria-hidden="true"
            >
              {initials}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-studio-cream font-medium hover:text-studio-gold transition-colors duration-[250ms] truncate">
                  {student.full_name}
                </span>
                {student.has_recent_lesson && (
                  <span
                    title="Had a lesson this week"
                    className="text-base leading-none select-none"
                    aria-label="Active this week"
                  >
                    🔥
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-studio-muted">
                  {formatDate(student.last_lesson_date)}
                </span>
                {/* Lesson count pill */}
                <span className="inline-flex items-center gap-1 bg-studio-primary/15 text-studio-primary border border-studio-primary/30 rounded-full px-2 py-0.5 text-xs font-medium">
                  ♪ {student.lesson_count}
                </span>
                {/* Pending assignments pill */}
                {student.pending_assignments > 0 && (
                  <span className="inline-flex items-center gap-1 bg-studio-gold/15 text-studio-gold border border-studio-gold/30 rounded-full px-2 py-0.5 text-xs font-medium">
                    {student.pending_assignments} pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Action row */}
        <div className="px-4 pb-3 flex items-center justify-between border-t border-studio-rim/50 pt-2">
          <Link
            href={`/students/${student.id}/profile`}
            className="text-xs font-medium text-studio-muted hover:text-studio-gold transition-colors duration-[150ms]"
          >
            Edit Profile
          </Link>
          <Link
            href={`/lessons/new?studentId=${student.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-studio-bg bg-studio-primary hover:bg-studio-gold rounded-lg px-3 py-1.5 transition-colors duration-[150ms]"
          >
            + Lesson
          </Link>
        </div>
      </div>
    </li>
  )
}

type SortMode = "name" | "recent"

export default function StudentSearch({ students }: { students: StudentSummary[] }) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortMode>("name")

  const filtered = (query.trim()
    ? students.filter((s) => s.full_name.toLowerCase().includes(query.toLowerCase()))
    : [...students]
  ).sort((a, b) => {
    if (sort === "recent") {
      if (!a.last_lesson_date && !b.last_lesson_date) return 0
      if (!a.last_lesson_date) return 1
      if (!b.last_lesson_date) return -1
      return b.last_lesson_date.localeCompare(a.last_lesson_date)
    }
    return a.full_name.localeCompare(b.full_name)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          aria-label="Search students by name"
          className="studio-input flex-1"
        />
        <div className="flex rounded-lg border border-studio-rim overflow-hidden shrink-0" role="group" aria-label="Sort order">
          {(["name", "recent"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors duration-[150ms] ${
                sort === mode
                  ? "bg-studio-primary text-studio-bg"
                  : "bg-studio-surface text-studio-muted hover:text-studio-cream"
              }`}
            >
              {mode === "name" ? "Name" : "Recent"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-studio-muted text-center py-4">
          No students match &quot;{query}&quot;
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </ul>
      )}
    </div>
  )
}
