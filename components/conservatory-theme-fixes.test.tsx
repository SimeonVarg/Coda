/**
 * Bug Condition Exploration Tests — conservatory-theme-fixes
 *
 * These tests MUST FAIL on unfixed code. Failure confirms the bugs exist.
 * DO NOT fix the code or the tests when they fail — that is the expected outcome.
 *
 * After fixes are applied (tasks 3–8), these same tests will pass.
 */

import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks required for components that depend on external modules
// ---------------------------------------------------------------------------

// TiptapEditor uses useEditor from @tiptap/react — mock it so the editor
// renders its container div without needing a real ProseMirror DOM environment.
const mockRun = vi.fn()
const mockToggle = vi.fn(() => ({ run: mockRun }))
const mockFocus = vi.fn(() => ({
  toggleBold: mockToggle,
  toggleItalic: mockToggle,
  toggleHeading: mockToggle,
  toggleBulletList: mockToggle,
  toggleOrderedList: mockToggle,
}))
const mockChain = vi.fn(() => ({ focus: mockFocus }))

vi.mock('@tiptap/react', () => {
  return {
    useEditor: vi.fn(() => ({
      isActive: vi.fn(() => false),
      chain: mockChain,
      getJSON: vi.fn(() => ({})),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EditorContent: ({ className, editor: _editor, ...rest }: any) => (
      <div className={className} {...rest} />
    ),
  }
})

import EighthNoteBeam from './motifs/EighthNoteBeam'
import TrebleClef from './motifs/TrebleClef'
import TiptapEditor from './TiptapEditor'
import StaffLines from './motifs/StaffLines'

// ---------------------------------------------------------------------------
// isBugCondition_1: EighthNoteBeam SVG has no intrinsic width/height attributes
// ---------------------------------------------------------------------------

describe('isBugCondition_1: EighthNoteBeam SVG intrinsic dimensions', () => {
  it('svg.getAttribute("width") is not null — FAILS on unfixed code (no width attr)', () => {
    const { container } = render(<EighthNoteBeam />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // BUG: EighthNoteBeam has no width attribute — this assertion FAILS on unfixed code
    expect(svg!.getAttribute('width')).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isBugCondition_2: TrebleClef SVG uses <text> instead of <path>
// ---------------------------------------------------------------------------

describe('isBugCondition_2: TrebleClef uses SVG path geometry', () => {
  it('svg has at least one <path> and no <text> element — FAILS on unfixed code (has text, no path)', () => {
    const { container } = render(<TrebleClef />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()

    // Count path and text elements by tag name in the SVG's innerHTML
    const innerHTML = svg!.innerHTML
    const hasPath = innerHTML.includes('<path')
    const hasText = innerHTML.includes('<text')

    // BUG: TrebleClef uses <text>𝄞</text> — these assertions FAIL on unfixed code
    // hasText should be false (no <text>) and hasPath should be true (has <path>)
    expect(hasText).toBe(false)
    expect(hasPath).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isBugCondition_3: TiptapEditor EditorContent missing prose-invert
// ---------------------------------------------------------------------------

describe('isBugCondition_3: TiptapEditor EditorContent has prose-invert', () => {
  it('editor content div has prose-invert in className — FAILS on unfixed code (missing prose-invert)', () => {
    const { container } = render(<TiptapEditor onChange={() => {}} />)

    // The EditorContent renders a div with the prose classes
    const proseDiv = container.querySelector('.prose')
    expect(proseDiv).not.toBeNull()

    // BUG: EditorContent has "prose prose-sm" but NOT "prose-invert" — FAILS on unfixed code
    expect(proseDiv!.className).toContain('prose-invert')
  })
})

// ---------------------------------------------------------------------------
// isBugCondition_4: StaffLines has preserveAspectRatio="none" (causes stretching bug)
// ---------------------------------------------------------------------------

describe('isBugCondition_4: StaffLines preserveAspectRatio causes stretching', () => {
  it('svg does NOT have preserveAspectRatio="none" — FAILS on unfixed code (has preserveAspectRatio="none")', () => {
    const { container } = render(<StaffLines className="w-full" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()

    // BUG: StaffLines has preserveAspectRatio="none" hardcoded — combined with w-full
    // this causes the full-width divider appearance on the dashboard.
    // This assertion FAILS on unfixed code.
    expect(svg!.getAttribute('preserveAspectRatio')).not.toBe('none')
  })
})

// ---------------------------------------------------------------------------
// isBugCondition_5: MusicBackground renders aria-hidden decorative symbols
// ---------------------------------------------------------------------------

import MusicBackground from './motifs/MusicBackground'

describe('isBugCondition_5: MusicBackground renders accessible decorative symbols', () => {
  it('renders the background container with aria-hidden="true"', () => {
    const { container } = render(
      <div>
        <MusicBackground />
      </div>
    )
    const bg = container.querySelector('[aria-hidden="true"]')
    expect(bg).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Preservation Property Tests (Task 2)
//
// These tests MUST PASS on unfixed code — they capture baseline behavior
// that must not regress after fixes are applied.
// ---------------------------------------------------------------------------

import * as fc from 'fast-check'
import QuarterNote from './motifs/QuarterNote'

describe('Preservation: Motif opacity', () => {
  /**
   * For any opacity in [0, 1], EighthNoteBeam and QuarterNote SHALL reflect
   * that value in style.opacity and have aria-hidden="true" on the SVG.
   *
   * Validates: Requirements 3.7, 3.8
   */
  it('EighthNoteBeam reflects opacity in style.opacity and has aria-hidden="true"', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1, noNaN: true }), (opacity) => {
        const { container } = render(<EighthNoteBeam opacity={opacity} />)
        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg!.getAttribute('aria-hidden')).toBe('true')
        expect(svg!.style.opacity).toBe(String(opacity))
      })
    )
  })

  it('QuarterNote reflects opacity in style.opacity and has aria-hidden="true"', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1, noNaN: true }), (opacity) => {
        const { container } = render(<QuarterNote opacity={opacity} />)
        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg!.getAttribute('aria-hidden')).toBe('true')
        expect(svg!.style.opacity).toBe(String(opacity))
      })
    )
  })
})

describe('Preservation: Motif color', () => {
  /**
   * For any color string, motif components SHALL pass it to the SVG fill attribute.
   *
   * Validates: Requirements 3.7, 3.8
   */
  it('EighthNoteBeam passes color to SVG fill attribute', () => {
    fc.assert(
      fc.property(fc.constantFrom('#fff', '#e8b84b', 'currentColor'), (color) => {
        const { container } = render(<EighthNoteBeam color={color} />)
        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg!.getAttribute('fill')).toBe(color)
      })
    )
  })

  it('QuarterNote passes color to SVG fill attribute', () => {
    fc.assert(
      fc.property(fc.constantFrom('#fff', '#e8b84b', 'currentColor'), (color) => {
        const { container } = render(<QuarterNote color={color} />)
        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg!.getAttribute('fill')).toBe(color)
      })
    )
  })
})

describe('Preservation: Motif className', () => {
  /**
   * For any className string, motif components SHALL include it in the SVG element's className.
   *
   * Validates: Requirements 3.7, 3.8
   */
  afterEach(() => cleanup())

  it('EighthNoteBeam includes className on the SVG element', () => {
    const classNames = ['h-16 w-auto', 'h-8', 'absolute pointer-events-none']
    for (const className of classNames) {
      const { container } = render(<EighthNoteBeam className={className} />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg!.getAttribute('class')).toBe(className)
      cleanup()
    }
  })

  it('QuarterNote includes className on the SVG element', () => {
    const classNames = ['h-16 w-auto', 'h-8', 'absolute pointer-events-none']
    for (const className of classNames) {
      const { container } = render(<QuarterNote className={className} />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg!.getAttribute('class')).toBe(className)
      cleanup()
    }
  })
})

describe('Preservation: TiptapEditor container class', () => {
  /**
   * TiptapEditor SHALL have text-studio-text class on the editor content area.
   * This should pass before and after the prose-invert fix.
   *
   * Validates: Requirements 3.3, 3.4
   */
  it('editor content area has text-studio-text class', () => {
    const { container } = render(<TiptapEditor onChange={() => {}} />)
    const proseDiv = container.querySelector('.prose')
    expect(proseDiv).not.toBeNull()
    expect(proseDiv!.className).toContain('text-studio-text')
  })
})
