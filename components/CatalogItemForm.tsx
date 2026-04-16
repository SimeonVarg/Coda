'use client'

import { useState, useRef, useEffect } from 'react'
import Spinner from './Spinner'

const TRADITIONS = [
  'Hindustani','Carnatic','Persian/Iranian','Arabic Maqam','Turkish Makam',
  'West African (Griot)','East African','Central African Polyrhythm',
  'Gamelan (Javanese)','Gamelan (Balinese)','Chinese Traditional',
  'Japanese Traditional','Korean Traditional','Flamenco','Fado',
  'Brazilian Choro','Cuban Son','Andean','Afro-Cuban','Celtic/Irish',
  'Klezmer','Bluegrass/Old-Time','Blues','Jazz','Gospel','Other',
]

const REGIONS = [
  'South Asia','Southeast Asia','East Asia','Central Asia',
  'Middle East / North Africa','Sub-Saharan Africa','West Africa',
  'East Africa','Southern Africa','Western Europe','Eastern Europe',
  'Iberian Peninsula','British Isles','North America',
  'Latin America / Caribbean','Oceania','Other',
]

const TUNING_SYSTEMS = [
  '12-TET (Equal Temperament)','Just Intonation','Pythagorean',
  'Maqam (Arabic)','Makam (Turkish)','Raga (Hindustani)','Raga (Carnatic)',
  'Gamelan Slendro','Gamelan Pelog','Pentatonic','Microtonal','Other',
]

type FormState = {
  title: string
  type: 'repertoire' | 'theory' | ''
  composer: string
  tradition: string
  region: string
  tuning_system: string
  cultural_context: string
  language: string
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; itemTitle: string }
  | { status: 'error'; message: string }

const emptyForm: FormState = {
  title: '', type: '', composer: '',
  tradition: '', region: '', tuning_system: '', cultural_context: '', language: '',
}

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
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.type) errors.type = 'Please select a type.'
    setFieldErrors(errors)
    if (errors.title) titleRef.current?.focus()
    else if (errors.type) typeRef.current?.focus()
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitState({ status: 'submitting' })
    try {
      const body: Record<string, string> = { title: form.title.trim(), type: form.type }
      if (form.composer.trim()) body.composer = form.composer.trim()
      if (form.tradition) body.tradition = form.tradition
      if (form.region) body.region = form.region
      if (form.tuning_system.trim()) body.tuning_system = form.tuning_system.trim()
      if (form.cultural_context.trim()) body.cultural_context = form.cultural_context.trim()
      if (form.language.trim()) body.language = form.language.trim()

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
    setForm(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    if (submitState.status === 'error') setSubmitState({ status: 'idle' })
  }

  const hasWorldMusic = form.tradition || form.region || form.tuning_system || form.cultural_context || form.language

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitState.status === 'success' && (
        <div role="status" className="rounded-md bg-studio-surface border border-studio-primary/30 px-4 py-3 text-sm text-studio-cream">
          <span className="font-medium">&ldquo;{submitState.itemTitle}&rdquo;</span> was added to the catalog.
        </div>
      )}
      {submitState.status === 'error' && (
        <div role="alert" className="rounded-md bg-studio-surface border border-studio-rose/40 px-4 py-3 text-sm text-studio-rose">
          {submitState.message}
        </div>
      )}

      <div>
        <label htmlFor="catalog-title" className="block text-sm font-medium text-studio-cream mb-1">
          Title <span aria-hidden="true" className="text-studio-rose">*</span>
        </label>
        <input id="catalog-title" type="text" value={form.title}
          onChange={e => handleChange('title', e.target.value)} ref={titleRef} autoFocus
          aria-required="true" aria-describedby={fieldErrors.title ? 'catalog-title-error' : undefined}
          className={`studio-input ${fieldErrors.title ? 'border-studio-rose' : ''}`} />
        {fieldErrors.title && <p id="catalog-title-error" role="alert" className="mt-1 text-xs text-studio-rose">{fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="catalog-type" className="block text-sm font-medium text-studio-cream mb-1">
          Type <span aria-hidden="true" className="text-studio-rose">*</span>
        </label>
        <select id="catalog-type" value={form.type}
          onChange={e => handleChange('type', e.target.value as FormState['type'])} ref={typeRef}
          aria-required="true" aria-describedby={fieldErrors.type ? 'catalog-type-error' : undefined}
          className={`studio-input ${fieldErrors.type ? 'border-studio-rose' : ''}`}>
          <option value="">Select a type…</option>
          <option value="repertoire">Repertoire</option>
          <option value="theory">Theory</option>
        </select>
        {fieldErrors.type && <p id="catalog-type-error" role="alert" className="mt-1 text-xs text-studio-rose">{fieldErrors.type}</p>}
      </div>

      <div>
        <label htmlFor="catalog-composer" className="block text-sm font-medium text-studio-cream mb-1">
          Composer <span className="text-studio-muted font-normal">(optional)</span>
        </label>
        <input id="catalog-composer" type="text" value={form.composer}
          onChange={e => handleChange('composer', e.target.value)} className="studio-input" />
      </div>

      {/* World Music Section */}
      <details open={!!hasWorldMusic} className="group">
        <summary className="cursor-pointer text-sm font-medium text-studio-muted hover:text-studio-cream transition-colors list-none flex items-center gap-2 select-none">
          <span className="text-purple-400">🌍</span>
          World Music / Ethnomusicology
          <span className="text-xs opacity-60 group-open:hidden">(optional)</span>
          <span className="ml-auto text-xs text-studio-muted group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-3 pl-1 border-l-2 border-purple-900/40">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalog-tradition" className="block text-xs text-studio-muted mb-1">Musical Tradition</label>
              <select id="catalog-tradition" value={form.tradition}
                onChange={e => handleChange('tradition', e.target.value)} className="studio-input text-sm">
                <option value="">Select…</option>
                {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="catalog-region" className="block text-xs text-studio-muted mb-1">Geographic Region</label>
              <select id="catalog-region" value={form.region}
                onChange={e => handleChange('region', e.target.value)} className="studio-input text-sm">
                <option value="">Select…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalog-tuning" className="block text-xs text-studio-muted mb-1">Tuning System</label>
              <input id="catalog-tuning" type="text" list="tuning-suggestions" value={form.tuning_system}
                onChange={e => handleChange('tuning_system', e.target.value)}
                placeholder="e.g. Maqam, Just Intonation…" className="studio-input text-sm" />
              <datalist id="tuning-suggestions">
                {TUNING_SYSTEMS.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="catalog-language" className="block text-xs text-studio-muted mb-1">Language</label>
              <input id="catalog-language" type="text" value={form.language}
                onChange={e => handleChange('language', e.target.value)}
                placeholder="e.g. Arabic, Yoruba…" className="studio-input text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="catalog-context" className="block text-xs text-studio-muted mb-1">
              Cultural Context <span className="opacity-60">(max 500 chars)</span>
            </label>
            <textarea id="catalog-context" value={form.cultural_context}
              onChange={e => handleChange('cultural_context', e.target.value)}
              maxLength={500} rows={3} className="studio-input w-full resize-none text-sm"
              placeholder="Brief cultural or historical context for this piece…" />
            <p className="text-right text-xs text-studio-muted mt-0.5">{form.cultural_context.length}/500</p>
          </div>
        </div>
      </details>

      <div className="pt-1">
        <button type="submit" disabled={submitState.status === 'submitting'} className="studio-btn-primary disabled:opacity-50">
          {submitState.status === 'submitting' ? (
            <span className="inline-flex items-center gap-2"><Spinner />Adding…</span>
          ) : 'Add to Catalog'}
        </button>
      </div>
    </form>
  )
}
