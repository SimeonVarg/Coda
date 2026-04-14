'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import TiptapEditor from '@/components/TiptapEditor'
import RepertoireCatalogSearch from '@/components/RepertoireCatalogSearch'
import TagList from '@/components/TagList'
import Spinner from '@/components/Spinner'
import { createSupabaseClient } from '@/lib/supabase/client'
import { isDemoUser } from '@/lib/demo'
import type { CatalogItem, JSONContent, RepertoireStatus, TagWithStatus, AssignmentDraft } from '@/lib/types'
import AssignmentForm from '@/components/AssignmentForm'

interface LessonEntryFormProps {
  studentId: string
  /** When editing an existing entry */
  lessonEntryId?: string
  initialContent?: JSONContent
  initialTags?: TagWithStatus[]
}

function isEmptyDoc(content: JSONContent): boolean {
  if (content.type !== 'doc') return false
  if (!content.content || content.content.length === 0) return true
  if (
    content.content.length === 1 &&
    content.content[0].type === 'paragraph' &&
    (!content.content[0].content || content.content[0].content.length === 0)
  ) {
    return true
  }
  return false
}

// Detect Mac for shortcut hint display (navigator.platform is deprecated; userAgent is the safe fallback)
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

function extractText(node: JSONContent): string {
  if (node.text) return node.text
  if (node.content) return node.content.map(extractText).join(' ')
  return ''
}

export default function LessonEntryForm({
  studentId,
  lessonEntryId,
  initialContent,
  initialTags = [],
}: LessonEntryFormProps) {
  const router = useRouter()
  const [content, setContent] = useState<JSONContent>(
    initialContent ?? { type: 'doc', content: [] }
  )
  const [tags, setTags] = useState<TagWithStatus[]>(initialTags)
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const wordCount = useMemo(() => {
    const text = extractText(content).trim()
    return text ? text.split(/\s+/).length : 0
  }, [content])

  const initialContentRef = useRef<JSONContent>(
    initialContent ?? { type: 'doc', content: [] }
  )
  const initialTagsRef = useRef<TagWithStatus[]>(initialTags)

  // Keep a stable ref to handleSave for the keyboard shortcut
  const handleSaveRef = useRef<() => void>(() => {})

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Warn before leaving when there are unsaved changes
  useEffect(() => {
    const isDirty =
      JSON.stringify(content) !== JSON.stringify(initialContentRef.current) ||
      tags.length !== initialTagsRef.current.length ||
      tags.some((t, i) => t.item.id !== initialTagsRef.current[i]?.item.id)

    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [content, tags])

  const handleSelect = useCallback((item: CatalogItem) => {
    setTags((prev) =>
      prev.some((t) => t.item.id === item.id)
        ? prev
        : [...prev, { item, status: item.type === 'repertoire' ? 'introduced' : 'completed' }]
    )
  }, [])

  const handleRemove = useCallback((item: CatalogItem) => {
    setTags((prev) => prev.filter((t) => t.item.id !== item.id))
  }, [])

  const handleStatusChange = useCallback((item: CatalogItem, status: RepertoireStatus) => {
    setTags((prev) =>
      prev.map((t) => t.item.id === item.id ? { ...t, status } : t)
    )
  }, [])

  const handleContentChange = useCallback((next: JSONContent) => {
    setContent(next)
    setValidationError(null)
  }, [])

  const handleSave = async () => {
    if (isEmptyDoc(content) && tags.length === 0) {
      setValidationError('Add lesson notes or tag at least one piece before saving.')
      return
    }
    if (assignments.some((a) => !a.description.trim())) {
      setValidationError('All practice assignments must have a description.')
      return
    }
    setValidationError(null)
    setSaving(true)

    const supabase = createSupabaseClient()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      if (isDemoUser(session.user)) {
        setValidationError('Saving is disabled in demo mode.')
        setSaving(false)
        return
      }

      const teacherId = session.user.id
      let entryId = lessonEntryId

      if (entryId) {
        const { error } = await supabase
          .from('lesson_entries')
          .update({ content })
          .eq('id', entryId)
        if (error) throw error

        const { error: delError } = await supabase
          .from('repertoire_tags')
          .delete()
          .eq('lesson_entry_id', entryId)
        if (delError) throw delError

        const { error: delAssignError } = await supabase
          .from('practice_assignments')
          .delete()
          .eq('lesson_entry_id', entryId)
        if (delAssignError) throw delAssignError
      } else {
        const { data, error } = await supabase
          .from('lesson_entries')
          .insert({ teacher_id: teacherId, student_id: studentId, content })
          .select('id')
          .single()
        if (error) throw error
        entryId = data.id
      }

      if (tags.length > 0) {
        const tagRows = tags.map(({ item, status }) => ({
          lesson_entry_id: entryId,
          catalog_item_id: item.id,
          status,
        }))
        const { error: tagError } = await supabase
          .from('repertoire_tags')
          .insert(tagRows)
        if (tagError) throw tagError
      }

      const validAssignments = assignments.filter((a) => a.description.trim())
      if (validAssignments.length > 0) {
        const assignmentRows = validAssignments.map((a) => ({
          lesson_entry_id: entryId,
          student_id: studentId,
          description: a.description.trim(),
          due_date: a.due_date ?? null,
        }))
        const { error: assignError } = await supabase
          .from('practice_assignments')
          .insert(assignmentRows)
        if (assignError) throw assignError
      }

      router.push(`/progress/${studentId}`)
    } catch {
      setValidationError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Keep ref in sync with latest handleSave closure
  handleSaveRef.current = handleSave

  return (
    <div className="space-y-6">
      {/* Rich-text editor */}
      <section>
        <label id="lesson-notes-label" htmlFor="lesson-notes-editor" className="mb-2 block text-sm font-medium text-studio-cream">
          Lesson Notes
        </label>
        <TiptapEditor initialContent={initialContent} onChange={handleContentChange} labelId="lesson-notes-label" />
        <p className="mt-1 text-xs text-studio-muted text-right">{wordCount} {wordCount === 1 ? 'word' : 'words'}</p>
      </section>

      {/* Catalog search */}
      <section>
        <label htmlFor="catalog-search" className="mb-2 block text-sm font-medium text-studio-cream">
          Tag Repertoire / Theory
        </label>
        <RepertoireCatalogSearch onSelect={handleSelect} inputId="catalog-search" />
      </section>

      {/* Selected tags */}
      {tags.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium text-studio-cream">Selected pieces</p>
          <TagList tags={tags} onRemove={handleRemove} onStatusChange={handleStatusChange} />
        </section>
      )}

      {/* Practice assignments */}
      <section>
        <p className="mb-2 text-sm font-medium text-studio-cream">Practice Assignments</p>
        <AssignmentForm assignments={assignments} onChange={setAssignments} />
      </section>

      {/* Validation / save error */}
      {validationError && (
        <p role="alert" className="text-sm text-studio-rose">
          {validationError}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          title={isMac ? 'Save (⌘S)' : 'Save (Ctrl+S)'}
          className="studio-btn-primary disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Saving…
            </span>
          ) : 'Save Lesson'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/progress/${studentId}`)}
          className="studio-btn-ghost"
        >
          Cancel
        </button>
        <span className="text-xs text-studio-muted ml-auto" aria-label="Keyboard shortcut to save">
          {isMac ? '⌘S' : 'Ctrl+S'} to save
        </span>
      </div>
    </div>
  )
}
