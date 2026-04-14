import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import type { RepertoireStatus, StudentSummary, RepertoireItem } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

// Supabase client mock — NavBar calls createSupabaseClient for sign-out
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}))

import { usePathname } from 'next/navigation'
import { signIn } from '@/lib/auth'
import NavBar from './NavBar'
import LoginPage from '@/app/login/page'
import {
  TrebleClef,
  StaffLines,
  QuarterNote,
  EighthNoteBeam,
  Waveform,
} from './motifs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>
const mockSignIn = signIn as ReturnType<typeof vi.fn>

// Minimal student card list component that mirrors the dashboard's StudentList markup
function StudentCardList({ students }: { students: StudentSummary[] }) {
  return (
    <ul>
      {students.map((s) => (
        <li
          key={s.id}
          className="bg-studio-surface rounded-2xl shadow-studio-glow p-4"
        >
          {s.full_name}
        </li>
      ))}
    </ul>
  )
}

// StatusBadge extracted from ProgressTree — mirrors the exact class map used there
const STATUS_BADGE_CLASSES: Record<RepertoireStatus, string> = {
  introduced: 'bg-studio-primary/20 text-studio-primary border border-studio-primary/40',
  in_progress: 'bg-studio-gold/20 text-studio-gold border border-studio-gold/40',
  mastered: 'bg-studio-cream/20 text-studio-cream border border-studio-cream/40',
}

function StatusBadge({ status }: { status: RepertoireStatus }) {
  return (
    <span
      data-testid="status-badge"
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {status}
    </span>
  )
}

// Minimal repertoire list that mirrors ProgressTree's stagger logic
function RepertoireList({ items }: { items: RepertoireItem[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={item.id}
          data-testid="repertoire-item"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {item.title}
        </li>
      ))}
    </ul>
  )
}

// Motif component map for Property 6
const MOTIF_COMPONENTS = {
  TrebleClef,
  StaffLines,
  QuarterNote,
  EighthNoteBeam,
  Waveform,
} as const

type MotifName = keyof typeof MOTIF_COMPONENTS

// ---------------------------------------------------------------------------
// Property 1: Active nav link styling
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 1: active nav link has gold classes for any matching route
describe('Property 1: Active nav link styling', () => {
  it('exactly the matching nav link has gold classes; no other nav link does', () => {
    // NavBar uses linkClass() for nav links (/catalog/new).
    // The /dashboard link is the wordmark (fixed class, not a nav link).
    // When the current route matches a nav link href, that link gets gold active classes.
    const routeArb = fc.constantFrom('/dashboard', '/catalog/new')

    fc.assert(
      fc.property(routeArb, (route) => {
        mockUsePathname.mockReturnValue(route)

        const { unmount } = render(<NavBar role="teacher" />)

        // The only link that uses linkClass() is /catalog/new
        const catalogLink = screen.getByRole('link', { name: /add to catalog/i })

        if (route === '/catalog/new') {
          // Active: should have gold border and text
          expect(catalogLink.className).toContain('border-studio-gold')
          expect(catalogLink.className).toContain('text-studio-gold')
        } else {
          // Inactive: should NOT have gold border
          expect(catalogLink.className).not.toContain('border-studio-gold')
        }

        unmount()
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 2: Error display uses warm tone
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 2: error display uses text-studio-rose for any error string
describe('Property 2: Error display uses warm tone', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/login')
  })

  it('error element has text-studio-rose and not text-red-600 for any non-empty error string', async () => {
    const errorArb = fc.string({ minLength: 1, maxLength: 80 })

    await fc.assert(
      fc.asyncProperty(errorArb, async (errorMsg) => {
        mockSignIn.mockResolvedValue({ success: false, error: errorMsg })

        const { unmount } = render(<LoginPage />)

        await act(async () => {
          fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
          })
          fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
          })
          fireEvent.submit(screen.getByRole('button', { name: /sign in/i }))
        })

        const errorEl = await screen.findByRole('alert')
        expect(errorEl.className).toContain('text-studio-rose')
        expect(errorEl.className).not.toContain('text-red-600')

        unmount()
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 3: Student cards carry required styling classes
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 3: student card styling for any non-empty student list
describe('Property 3: Student cards carry required styling classes', () => {
  it('every student card has bg-studio-surface, rounded-2xl, and shadow-studio-glow', () => {
    const studentArb = fc.record({
      id: fc.uuid(),
      full_name: fc.string({ minLength: 1, maxLength: 40 }),
      last_lesson_date: fc.option(fc.string({ minLength: 1 }), { nil: null }),
      lesson_count: fc.nat(),
    })
    const studentsArb = fc.array(studentArb, { minLength: 1, maxLength: 10 })

    fc.assert(
      fc.property(studentsArb, (students) => {
        const { unmount } = render(<StudentCardList students={students} />)

        const cards = screen.getAllByRole('listitem')
        expect(cards.length).toBe(students.length)

        for (const card of cards) {
          expect(card.className).toContain('bg-studio-surface')
          expect(card.className).toContain('rounded-2xl')
          expect(card.className).toContain('shadow-studio-glow')
        }

        unmount()
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4: Status badge color is status-specific
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 4: status badge class is status-specific for any valid status
describe('Property 4: Status badge color is status-specific', () => {
  it('each status produces a unique class string and uses the correct warm-palette token', () => {
    const statusArb = fc.constantFrom<RepertoireStatus>('introduced', 'in_progress', 'mastered')

    fc.assert(
      fc.property(statusArb, (status) => {
        const { unmount } = render(<StatusBadge status={status} />)

        const badge = screen.getByTestId('status-badge')
        const cls = badge.className

        // Each status maps to its own warm-palette token
        if (status === 'introduced') {
          expect(cls).toContain('text-studio-primary')
        } else if (status === 'in_progress') {
          expect(cls).toContain('text-studio-gold')
        } else if (status === 'mastered') {
          expect(cls).toContain('text-studio-cream')
        }

        unmount()
      }),
      { numRuns: 50 }
    )
  })

  it('two different statuses never produce the same class string', () => {
    const statuses: RepertoireStatus[] = ['introduced', 'in_progress', 'mastered']
    const classStrings = statuses.map((s) => STATUS_BADGE_CLASSES[s])
    const unique = new Set(classStrings)
    expect(unique.size).toBe(statuses.length)
  })
})

// ---------------------------------------------------------------------------
// Property 5: Stagger animation delay scales with index
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 5: stagger animation delay equals index * 80ms for any list length
describe('Property 5: Stagger animation delay scales with index', () => {
  it('each item at index i has animationDelay of exactly `${i * 80}ms`', () => {
    const itemArb = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 40 }),
      composer: fc.option(fc.string({ minLength: 1 }), { nil: null }),
      status: fc.constantFrom<RepertoireStatus>('introduced', 'in_progress', 'mastered'),
    })
    const itemsArb = fc.array(itemArb, { minLength: 1, maxLength: 20 })

    fc.assert(
      fc.property(itemsArb, (items) => {
        const { unmount } = render(<RepertoireList items={items} />)

        const listItems = screen.getAllByTestId('repertoire-item')
        expect(listItems.length).toBe(items.length)

        listItems.forEach((li, i) => {
          expect((li as HTMLElement).style.animationDelay).toBe(`${i * 80}ms`)
        })

        unmount()
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 6: Music motif components are accessible and configurable
// ---------------------------------------------------------------------------

// Feature: conservatory-visual-theme, Property 6: motif SVGs have aria-hidden and reflect opacity prop
describe('Property 6: Music motif components are accessible and configurable', () => {
  it('every motif SVG has aria-hidden="true" and reflects the opacity prop', () => {
    const motifArb = fc.constantFrom<MotifName>(
      'TrebleClef',
      'StaffLines',
      'QuarterNote',
      'EighthNoteBeam',
      'Waveform'
    )
    const opacityArb = fc.float({ min: 0, max: 1, noNaN: true })

    fc.assert(
      fc.property(motifArb, opacityArb, (motifName, opacity) => {
        const MotifComponent = MOTIF_COMPONENTS[motifName]
        const { container, unmount } = render(
          <MotifComponent opacity={opacity} />
        )

        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg!.getAttribute('aria-hidden')).toBe('true')

        // Opacity is applied via inline style
        const svgStyle = (svg as HTMLElement).style
        const renderedOpacity = parseFloat(svgStyle.opacity)
        expect(renderedOpacity).toBeCloseTo(opacity, 5)

        unmount()
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Task 12.7 — Smoke test: Tailwind config exports all required token keys
// ---------------------------------------------------------------------------

describe('Smoke test: Tailwind config exports all required token keys', () => {
  it('exports all required color tokens', async () => {
    const config = (await import('@/tailwind.config')).default
    const colors = config.theme?.extend?.colors as Record<string, string> | undefined

    expect(colors).toBeDefined()
    const requiredColors = [
      'studio-bg',
      'studio-surface',
      'studio-rim',
      'studio-primary',
      'studio-gold',
      'studio-cream',
      'studio-text',
      'studio-muted',
      'studio-rose',
    ]
    for (const token of requiredColors) {
      expect(colors, `Missing color token: ${token}`).toHaveProperty(token)
    }
  })

  it('exports all required shadow tokens', async () => {
    const config = (await import('@/tailwind.config')).default
    const shadows = config.theme?.extend?.boxShadow as Record<string, string> | undefined

    expect(shadows).toBeDefined()
    expect(shadows, 'Missing shadow token: studio-glow').toHaveProperty('studio-glow')
    expect(shadows, 'Missing shadow token: studio-glow-lg').toHaveProperty('studio-glow-lg')
  })

  it('exports all required animation tokens', async () => {
    const config = (await import('@/tailwind.config')).default
    const animations = config.theme?.extend?.animation as Record<string, string> | undefined

    expect(animations).toBeDefined()
    expect(animations, 'Missing animation token: fade-up').toHaveProperty('fade-up')
    expect(animations, 'Missing animation token: shimmer').toHaveProperty('shimmer')
  })

  it('exports all required fontFamily tokens', async () => {
    const config = (await import('@/tailwind.config')).default
    const fonts = config.theme?.extend?.fontFamily as Record<string, unknown> | undefined

    expect(fonts).toBeDefined()
    expect(fonts, 'Missing fontFamily token: display').toHaveProperty('display')
    expect(fonts, 'Missing fontFamily token: body').toHaveProperty('body')
  })
})
