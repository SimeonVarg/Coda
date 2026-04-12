'use client'

import { useState, useRef, useEffect } from 'react'
import Spinner from './Spinner'

type FormState = {
  title: string
  type: 'repertoire' | 'theory' | ''
  composer: string
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; itemTitle: string }
  | { status: 'error'; message: string }

const emptyForm: FormState = { title: '', type: '', composer: '' }

export default function CatalogItemForm() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  const titleRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (submitState.status !== 'success') return
    const timer = setTimeout(() => setSubmitState({ status: 'idle' }), 3000)
    return () => clearTimeout(timer)
  }, [submitState.status])

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) {
      errors.title = 'Title is required.'
    }
    if (!form.type) {
      errors.type = 'Please select a type.'
    }
    setFieldErrors(errors)
    if (errors.title) {
      titleRef.current?.focus()
    } else if (errors.type) {
      typeRef.current?.focus()
    }
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitState({ status: 'submitting' })

    try {
      const body: Record<string, string> = {
        title: form.title.trim(),
        type: form.type,
      }
      if (form.composer.trim()) {
        body.composer = form.composer.trim()
      }

      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 201) {
        const savedTitle = form.title.trim()
        setForm(emptyForm)
        setFieldErrors({})
        setSubmitState({ status: 'success', itemTitle: savedTitle })
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitState({ status: 'error', message: data.error ?? 'Something went wrong. Please try again.' })
      }
    } catch {
      setSubmitState({ status: 'error', message: 'Network error. Please try again.' })
    }
  }

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear submit-level error when user edits
    if (submitState.status === 'error') {
      setSubmitState({ status: 'idle' })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Success banner */}
      {submitState.status === 'success' && (
        <div role="status" className="rounded-md bg-studio-surface border border-studio-primary/30 px-4 py-3 text-sm text-studio-cream">
          <span className="font-medium">&ldquo;{submitState.itemTitle}&rdquo;</span> was added to the catalog.
        </div>
      )}

      {/* Error banner */}
      {submitState.status === 'error' && (
        <div role="alert" className="rounded-md bg-studio-surface border border-studio-rose/40 px-4 py-3 text-sm text-studio-rose">
          {submitState.message}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="catalog-title" className="block text-sm font-medium text-studio-cream mb-1">
          Title <span aria-hidden="true" className="text-studio-rose">*</span>
        </label>
        <input
          id="catalog-title"
          type="text"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          ref={titleRef}
          autoFocus
          aria-required="true"
          aria-describedby={fieldErrors.title ? 'catalog-title-error' : undefined}
          className={`studio-input ${fieldErrors.title ? 'border-studio-rose' : ''}`}
        />
        {fieldErrors.title && (
          <p id="catalog-title-error" role="alert" className="mt-1 text-xs text-studio-rose">
            {fieldErrors.title}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="catalog-type" className="block text-sm font-medium text-studio-cream mb-1">
          Type <span aria-hidden="true" className="text-studio-rose">*</span>
        </label>
        <select
          id="catalog-type"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value as FormState['type'])}
          ref={typeRef}
          aria-required="true"
          aria-describedby={fieldErrors.type ? 'catalog-type-error' : undefined}
          className={`studio-input ${fieldErrors.type ? 'border-studio-rose' : ''}`}
        >
          <option value="">Select a type…</option>
          <option value="repertoire">Repertoire</option>
          <option value="theory">Theory</option>
        </select>
        {fieldErrors.type && (
          <p id="catalog-type-error" role="alert" className="mt-1 text-xs text-studio-rose">
            {fieldErrors.type}
          </p>
        )}
      </div>

      {/* Composer (optional) */}
      <div>
        <label htmlFor="catalog-composer" className="block text-sm font-medium text-studio-cream mb-1">
          Composer <span className="text-studio-muted font-normal">(optional)</span>
        </label>
        <input
          id="catalog-composer"
          type="text"
          value={form.composer}
          onChange={(e) => handleChange('composer', e.target.value)}
          className="studio-input"
        />
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={submitState.status === 'submitting'}
          className="studio-btn-primary disabled:opacity-50"
        >
          {submitState.status === 'submitting' ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Adding…
            </span>
          ) : 'Add to Catalog'}
        </button>
      </div>
    </form>
  )
}
