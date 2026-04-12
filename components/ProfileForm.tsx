"use client"

import { useState, useEffect, useRef } from "react"
import type { StudentProfile } from "@/lib/types"
import { upsertStudentProfile } from "@/app/students/[studentId]/profile/actions"
import CharacterCount from "@/components/CharacterCount"
import Spinner from "@/components/Spinner"

interface ProfileFormProps {
  studentId: string
  initialProfile: StudentProfile | null
}

export default function ProfileForm({ studentId, initialProfile }: ProfileFormProps) {
  const [gradeLevel, setGradeLevel] = useState(initialProfile?.grade_level ?? "")
  const [instrument, setInstrument] = useState(initialProfile?.instrument ?? "")
  const [goals, setGoals] = useState(initialProfile?.goals ?? "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const goalsRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!gradeLevel.trim() && !instrument.trim() && !goals.trim()) {
      setError("Please fill in at least one field.")
      goalsRef.current?.focus()
      return
    }

    setSaving(true)
    const result = await upsertStudentProfile(studentId, {
      grade_level: gradeLevel,
      instrument,
      goals,
    })
    setSaving(false)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div role="status" className="rounded-md bg-studio-surface border border-studio-primary/30 px-4 py-3 text-sm text-studio-cream">
          Profile saved.
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-md bg-studio-surface border border-studio-rose/40 px-4 py-3 text-sm text-studio-rose">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="grade-level" className="block text-sm font-medium text-studio-cream mb-1">
          Grade Level
        </label>
        <input
          id="grade-level"
          type="text"
          value={gradeLevel}
          onChange={(e) => { setGradeLevel(e.target.value); setSuccess(false) }}
          placeholder="e.g. RCM Grade 3, ABRSM Grade 5"
          className="studio-input"
        />
      </div>

      <div>
        <label htmlFor="instrument" className="block text-sm font-medium text-studio-cream mb-1">
          Instrument
        </label>
        <input
          id="instrument"
          type="text"
          value={instrument}
          onChange={(e) => { setInstrument(e.target.value); setSuccess(false) }}
          placeholder="e.g. Piano, Violin"
          className="studio-input"
        />
      </div>

      <div>
        <label htmlFor="goals" className="block text-sm font-medium text-studio-cream mb-1">
          Long-term Goals
        </label>
        <textarea
          id="goals"
          ref={goalsRef}
          value={goals}
          onChange={(e) => { setGoals(e.target.value); setSuccess(false) }}
          rows={4}
          maxLength={500}
          placeholder="Describe the student's long-term musical goals…"
          className="studio-input"
        />
        <CharacterCount current={goals.length} max={500} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="studio-btn-primary disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Saving…
          </span>
        ) : "Save Profile"}
      </button>
    </form>
  )
}
