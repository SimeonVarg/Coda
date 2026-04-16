'use client'

import { useState } from 'react'
import type { LessonReflection } from '@/lib/types'
import ReflectionForm from '@/components/ReflectionForm'
import StarRating from '@/components/StarRating'
import ReflectionSparkline from '@/components/ReflectionSparkline'

interface Props {
  lessonEntries: { id: string; created_at: string }[]
  reflectionMap: Record<string, LessonReflection>
}

export default function ReflectionSection({ lessonEntries, reflectionMap }: Props) {
  const [reflections, setReflections] = useState(reflectionMap)
  const [activeForm, setActiveForm] = useState<string | null>(null)

  const ratings = lessonEntries
    .map(e => reflections[e.id]?.self_rating as number | undefined)
    .filter((r): r is number => r != null)
    .slice(0, 10)
    .reverse()

  return (
    <div>
      {ratings.length >= 2 && (
        <div className="mb-4 bg-studio-surface border border-studio-rim rounded-lg px-4 py-3">
          <p className="text-xs text-studio-muted mb-2">Self-rating trend (last {ratings.length} lessons)</p>
          <ReflectionSparkline ratings={ratings} />
        </div>
      )}

      <div className="space-y-3">
        {lessonEntries.slice(0, 10).map(entry => {
          const reflection = reflections[entry.id]
          const lessonDate = entry.created_at.slice(0, 10)
          const isActive = activeForm === entry.id

          return (
            <div key={entry.id} className="bg-studio-surface border border-studio-rim rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm text-studio-cream">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {reflection && (
                    <StarRating value={reflection.self_rating} readOnly size="sm" />
                  )}
                </div>
                {!isActive && (
                  <button type="button"
                    onClick={() => setActiveForm(entry.id)}
                    className="text-xs text-studio-muted hover:text-studio-gold transition-colors">
                    {reflection ? 'Edit reflection' : 'Add reflection'}
                  </button>
                )}
              </div>

              {reflection && !isActive && (
                <div className="px-4 pb-3 space-y-1 border-t border-studio-rim">
                  {reflection.went_well && (
                    <p className="text-xs text-studio-text"><span className="text-studio-muted">Went well: </span>{reflection.went_well}</p>
                  )}
                  {reflection.was_challenging && (
                    <p className="text-xs text-studio-text"><span className="text-studio-muted">Challenging: </span>{reflection.was_challenging}</p>
                  )}
                  {reflection.next_goal && (
                    <p className="text-xs text-studio-text"><span className="text-studio-muted">Next goal: </span>{reflection.next_goal}</p>
                  )}
                </div>
              )}

              {isActive && (
                <div className="px-4 pb-4 border-t border-studio-rim">
                  <ReflectionForm
                    lessonEntryId={entry.id}
                    lessonDate={lessonDate}
                    existingReflection={reflection ?? null}
                    onSaved={() => {
                      setActiveForm(null)
                      window.location.reload()
                    }}
                    onCancel={() => setActiveForm(null)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
