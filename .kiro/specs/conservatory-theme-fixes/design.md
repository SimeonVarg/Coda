# Conservatory Theme Fixes — Bugfix Design

## Overview

Six related visual bugs in the conservatory theme implementation need to be fixed. The issues range from SVG rendering problems (EighthNoteBeam stretching, TrebleClef unicode unreliability) to CSS conflicts (bold text invisible in Tiptap editor), layout problems (StaffLines acting as a full-width divider), and incomplete feature rollout (scattered symbol backgrounds only on the login page). The fix strategy is minimal and targeted: correct each component in isolation, then propagate the ScatteredSymbols pattern to all authenticated pages.

## Glossary

- **Bug_Condition (C)**: The set of render conditions or inputs that trigger each defect
- **Property (P)**: The desired correct output or behavior when the bug condition holds
- **Preservation**: Existing functional behavior (auth, navigation, form submission, data display) that must remain unchanged
- **EighthNoteBeam**: SVG motif component in `components/motifs/EighthNoteBeam.tsx` that renders two beamed eighth notes
- **TrebleClef**: SVG motif component in `components/motifs/TrebleClef.tsx` that currently uses a unicode `<text>` element
- **ScatteredSymbols**: New reusable component to be created at `components/motifs/ScatteredSymbols.tsx`
- **prose / prose-invert**: Tailwind Typography plugin classes that control text color inside rich-text content areas
- **intrinsic dimensions**: The `width` and `height` HTML attributes on an SVG that tell browsers the natural size before CSS scaling

## Bug Details

### Bug 1: EighthNoteBeam SVG Stretches to Fill Screen

The bug manifests when `EighthNoteBeam` is rendered with a height class (e.g., `h-16`) and `w-auto`. Because the SVG has no intrinsic `width`/`height` attributes, browsers treat its natural width as 100% of the container, so `w-auto` resolves to the full container width rather than the proportional width implied by the square viewBox.

**Formal Specification:**
```
FUNCTION isBugCondition_1(element)
  INPUT: element — a rendered EighthNoteBeam SVG DOM node
  OUTPUT: boolean

  RETURN element.getAttribute('width') IS NULL
         AND element.getAttribute('height') IS NULL
         AND element is rendered with a height CSS class
         AND element is rendered with w-auto (no explicit width class)
END FUNCTION
```

**Examples:**
- `<EighthNoteBeam className="h-16 w-auto" />` → SVG stretches to ~100% container width (bug)
- `<EighthNoteBeam className="w-16 h-16" />` → works correctly because explicit width class overrides (not buggy, but fragile)
- After fix: `<EighthNoteBeam className="h-16 w-auto" />` → SVG renders as 64×64px square (correct)

### Bug 2: TrebleClef Uses Unicode Text in SVG

The bug manifests whenever `TrebleClef` renders. The `<text>` element with `𝄞` (U+1D11E) depends on the browser having a font with that glyph. On systems without a suitable serif font, the glyph renders as a box or is invisible.

**Formal Specification:**
```
FUNCTION isBugCondition_2(element)
  INPUT: element — a rendered TrebleClef SVG DOM node
  OUTPUT: boolean

  RETURN element.querySelector('text') IS NOT NULL
         AND element.querySelector('path') IS NULL
END FUNCTION
```

**Examples:**
- Current render: SVG contains `<text fontFamily="serif">𝄞</text>` → font-dependent, may be invisible (bug)
- After fix: SVG contains only `<path d="...">` geometry → renders identically across all browsers (correct)

### Bug 3: Bold Text in Tiptap Editor Is Black/Invisible

The bug manifests when a user applies bold formatting inside the Tiptap editor. Tailwind's `prose` class sets `--tw-prose-bold` to a near-black color. The `EditorContent` div has `prose` but not `prose-invert`, so `strong` and `b` elements inherit the dark prose color scheme against the dark `bg-studio-surface` background.

**Formal Specification:**
```
FUNCTION isBugCondition_3(element)
  INPUT: element — the EditorContent DOM node
  OUTPUT: boolean

  RETURN element.classList.contains('prose') IS TRUE
         AND element.classList.contains('prose-invert') IS FALSE
         AND computedStyle(element.querySelector('strong')).color
             IS dark (near-black, low contrast against bg-studio-surface)
END FUNCTION
```

**Examples:**
- User types "**important**" → renders as invisible black text on dark surface (bug)
- After fix: bold text renders in `studio-cream` / light color, clearly visible (correct)

### Bug 4: Dashboard StaffLines Spans Full Width Like a Divider

The bug manifests in `app/dashboard/page.tsx`. The `<StaffLines className="w-full mt-4 ...">` combined with `preserveAspectRatio="none"` in the SVG causes it to stretch across the entire page width, visually separating the header from the student list like an `<hr>` element.

**Formal Specification:**
```
FUNCTION isBugCondition_4(element)
  INPUT: element — the dashboard header DOM subtree
  OUTPUT: boolean

  RETURN element.querySelector('svg[preserveAspectRatio="none"]')
             .classList.contains('w-full') IS TRUE
         AND element is positioned between the heading and the student list
END FUNCTION
```

**Examples:**
- Current: `<StaffLines className="w-full mt-4 text-studio-gold" opacity={0.2} />` below the heading → full-width divider (bug)
- After fix: StaffLines removed from below heading; decorative staff lines integrated as a background accent within the header block at constrained width (correct)

### Bug 5: Scattered Symbol Backgrounds Only on Login Page

The bug manifests on every authenticated page (dashboard, progress, lesson new, lesson edit). The `SCATTERED_SYMBOLS` array and rendering logic exists only in `app/login/page.tsx` as inline code, never extracted into a reusable component.

**Formal Specification:**
```
FUNCTION isBugCondition_5(pageComponent)
  INPUT: pageComponent — a rendered authenticated page DOM tree
  OUTPUT: boolean

  RETURN pageComponent.querySelectorAll(
           '[aria-hidden="true"][class*="pointer-events-none"]'
         ).length IS 0
         AND pageComponent is one of: dashboard, progress, lesson-new, lesson-edit
END FUNCTION
```

**Examples:**
- Dashboard renders → no scattered symbols visible in background (bug)
- Progress page renders → no scattered symbols visible in background (bug)
- After fix: all four pages render `<ScatteredSymbols>` with `aria-hidden` symbols at low opacity (correct)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Login form authentication flow (submit → signIn → redirect to dashboard) must continue to work exactly as before
- Login page scattered symbols must continue to render (the existing inline implementation is not being removed, only the pattern is being extracted for reuse)
- Regular (non-bold) text in the Tiptap editor must continue to render in `text-studio-text`
- All Tiptap toolbar buttons (bold, italic, headings, lists) must continue to apply formatting correctly
- Dashboard student list cards with `bg-studio-surface rounded-2xl shadow-studio-glow` styling and hover animations must remain unchanged
- Student card navigation to progress pages must remain unchanged
- Progress page repertoire tree, profile header, and practice assignments sections must render correctly
- Lesson form pages must continue to function for creating and editing lesson entries
- All motif components must continue to respect the `opacity` prop and have `aria-hidden="true"`

**Scope:**
All inputs that do NOT involve the six specific bug conditions above should be completely unaffected. This includes:
- All form submissions and data mutations
- All navigation and routing
- All non-bold text rendering in the editor
- All non-SVG UI elements (buttons, inputs, cards, tables)
- All server-side data fetching logic

## Hypothesized Root Cause

1. **Missing SVG Intrinsic Dimensions (Bug 1)**: `EighthNoteBeam` has `viewBox="0 0 80 80"` but no `width="80" height="80"` attributes. Without these, the browser's default SVG sizing rules apply: inline SVGs default to 300×150px, and with `w-auto` the width resolves to the container width. Adding `width="80" height="80"` gives the browser the natural aspect ratio so `w-auto` computes the correct proportional width.

2. **Font-Dependent Unicode Glyph (Bug 2)**: The `𝄞` character (Musical Symbol G Clef, U+1D11E) is in the Supplementary Multilingual Plane and requires a font with SMuFL or similar musical symbol support. Most system serif fonts do not include it. The fix is to replace the `<text>` element with a `<path>` that draws the treble clef shape geometrically.

3. **Missing `prose-invert` Class (Bug 3)**: Tailwind Typography's `prose` class sets `--tw-prose-bold: #111827` (near-black). The `EditorContent` element uses `prose prose-sm` without `prose-invert`, so bold text inherits this dark color. Adding `prose-invert` switches the palette to light-on-dark. Additionally, custom CSS overrides in `globals.css` can pin specific prose element colors to the studio palette.

4. **`preserveAspectRatio="none"` + `w-full` (Bug 4)**: `StaffLines` has `preserveAspectRatio="none"` hardcoded in the SVG, which makes it stretch to any container size. Combined with `w-full` in the dashboard, it fills the entire page width. The fix is to remove the `<StaffLines>` from below the heading and instead use it as a subtle background element within the header block at a constrained size, or replace it with a different decorative treatment.

5. **Inline-Only Implementation (Bug 5)**: The scattered symbols pattern was implemented directly in `app/login/page.tsx` as a local constant and inline JSX, never abstracted. The fix is to extract it into `components/motifs/ScatteredSymbols.tsx` with a `variant` prop, then use it on all authenticated pages.

6. **Incomplete Theme Rollout (Bug 6)**: The conservatory theme spec added color tokens and a few motif components but did not specify how to integrate them into each page's layout. The fix is to add intentional motif placement to each page header as part of the ScatteredSymbols rollout.

## Correctness Properties

Property 1: Bug Condition — EighthNoteBeam Has Intrinsic Dimensions

_For any_ render of the `EighthNoteBeam` component, the fixed SVG element SHALL have explicit `width` and `height` HTML attributes that match the viewBox dimensions (80×80), so that browsers can compute the correct intrinsic aspect ratio and `w-auto` resolves to a proportional width.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition — TrebleClef Uses SVG Path Geometry

_For any_ render of the `TrebleClef` component, the fixed SVG element SHALL contain at least one `<path>` element and SHALL NOT contain any `<text>` element, ensuring consistent cross-browser rendering independent of font availability.

**Validates: Requirements 2.3**

Property 3: Bug Condition — Tiptap Editor Bold Text Is Visible

_For any_ render of the `TiptapEditor` component, the `EditorContent` element SHALL have both `prose` and `prose-invert` in its className, ensuring bold/strong text renders in a light color visible against the dark `bg-studio-surface` background.

**Validates: Requirements 2.4**

Property 4: Preservation — Non-Bold Tiptap Text Unchanged

_For any_ render of the `TiptapEditor` component where the content contains only regular (non-bold) text, the fixed component SHALL produce the same visual output as the original component, preserving `text-studio-text` color for body text.

**Validates: Requirements 3.3, 3.4**

Property 5: Bug Condition — Dashboard Has No Full-Width StaffLines Divider

_For any_ render of the dashboard page, the fixed page SHALL NOT render a `StaffLines` component with the `w-full` class positioned between the page heading and the student list.

**Validates: Requirements 2.5**

Property 6: Bug Condition — Authenticated Pages Include Scattered Symbols

_For any_ render of the dashboard, progress, lesson-new, or lesson-edit pages, the fixed page SHALL include scattered musical symbol elements that are `aria-hidden="true"` and have `pointer-events-none`, providing background decoration consistent with the login page.

**Validates: Requirements 2.6, 2.7**

Property 7: Preservation — Authenticated Page Functional Content Unchanged

_For any_ render of the dashboard, progress, lesson-new, or lesson-edit pages, the fixed pages SHALL continue to render all functional content (student lists, progress trees, lesson forms, breadcrumbs) with the same structure and behavior as before the fix.

**Validates: Requirements 3.5, 3.6, 3.9, 3.10**

## Fix Implementation

### Bug 1 — EighthNoteBeam Intrinsic Dimensions

**File**: `components/motifs/EighthNoteBeam.tsx`

**Change**: Add `width="80"` and `height="80"` attributes to the `<svg>` element.

```tsx
<svg
  viewBox="0 0 80 80"
  width="80"
  height="80"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  focusable="false"
  className={className}
  style={{ opacity }}
  fill={color}
>
```

This gives the browser the natural 1:1 aspect ratio. CSS classes like `h-16 w-auto` will then correctly compute width as 64px (matching the height), and `w-16 h-16` continues to work as before.

---

### Bug 2 — TrebleClef SVG Path

**File**: `components/motifs/TrebleClef.tsx`

**Change**: Replace the `<text>` element with a `<path>` element that draws a simplified but recognizable treble clef. The viewBox stays `0 0 60 160`.

The path uses a simplified treble clef geometry: a vertical spine with a curl at the top, a loop around the middle staff lines, and a descending tail with a bottom curl.

```tsx
<svg
  viewBox="0 0 60 160"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  focusable="false"
  className={className}
  style={{ opacity }}
  fill={color}
>
  <path d="
    M30 148
    C18 148 10 140 10 130
    C10 118 20 112 30 112
    C40 112 50 118 50 130
    C50 142 40 152 30 152
    C14 152 4 138 4 120
    C4 96 18 78 30 60
    C42 42 48 28 48 16
    C48 8 42 4 36 4
    C28 4 22 10 22 18
    C22 26 28 30 34 28
    M30 60
    L30 148
    M30 148
    C26 154 22 158 20 156
    C18 154 20 150 24 150
  " />
</svg>
```

Note: The exact path data will be refined during implementation to produce a clean, recognizable shape. The key constraint is: no `<text>` element, at least one `<path>` element.

---

### Bug 3 — Tiptap Editor prose-invert

**File**: `components/TiptapEditor.tsx`

**Change 1**: Add `prose-invert` to the `EditorContent` className:

```tsx
<EditorContent
  editor={editor}
  aria-labelledby={labelId}
  className="prose prose-sm prose-invert max-w-none px-4 py-3 min-h-[160px] focus:outline-none text-studio-text"
/>
```

**Change 2**: Add custom prose color overrides in `app/globals.css` under `@layer base` to pin prose element colors to the studio palette, ensuring consistency even if `prose-invert` defaults differ:

```css
@layer base {
  .prose strong,
  .prose b {
    color: theme('colors.studio-cream');
  }
  .prose em {
    color: theme('colors.studio-text');
  }
  .prose h1,
  .prose h2,
  .prose h3 {
    color: theme('colors.studio-cream');
  }
}
```

---

### Bug 4 — Dashboard StaffLines

**File**: `app/dashboard/page.tsx`

**Change**: Remove `<StaffLines className="w-full mt-4 text-studio-gold" opacity={0.2} />` from the header block. Replace the header treatment with a contained decorative approach — the `EighthNoteBeam` accent remains, and the `StaffLines` import is removed if no longer used elsewhere on the page.

```tsx
<div className="relative mb-8">
  <div className="relative flex items-start gap-4">
    <EighthNoteBeam
      className="absolute right-0 top-0 w-16 h-16 text-studio-gold"
      opacity={0.5}
    />
    <div className="flex-1">
      <h1 className="font-display text-4xl text-studio-cream tracking-wide">My Students</h1>
      <p className="text-studio-muted text-sm mt-1">Click a student to view their progress.</p>
    </div>
  </div>
  {/* StaffLines removed — was rendering as full-width divider */}
</div>
```

Remove `StaffLines` from the import if it is no longer used on the page.

---

### Bug 5 & 6 — ScatteredSymbols Component + Page Rollout

**New File**: `components/motifs/ScatteredSymbols.tsx`

Extract the scattered symbols pattern from `app/login/page.tsx` into a reusable component. Accept a `variant` prop to select different symbol arrangements per page.

```tsx
'use client'

import { TrebleClef, QuarterNote, EighthNoteBeam, Waveform } from '.'

type Variant = 'login' | 'dashboard' | 'progress' | 'lesson'

interface SymbolDef {
  C: React.ComponentType<{ className?: string; opacity?: number; color?: string }>
  top: number
  left: number
  h: string
  rot: number
  op: number
  wide?: boolean
}

const SYMBOLS: Record<Variant, SymbolDef[]> = {
  login: [
    // (existing login symbols — kept for reference, login page continues using inline)
  ],
  dashboard: [
    { C: TrebleClef,     top:  5, left:  2, h: 'h-40', rot:  -8, op: 0.08 },
    { C: QuarterNote,    top: 10, left: 85, h: 'h-20', rot:  15, op: 0.10 },
    { C: EighthNoteBeam, top: 70, left: 75, h: 'h-14', rot: -12, op: 0.09 },
    { C: Waveform,       top: 85, left: 10, h: 'h-8',  rot:   0, op: 0.08, wide: true },
    { C: QuarterNote,    top: 50, left: 92, h: 'h-16', rot:  20, op: 0.07 },
    { C: TrebleClef,     top: 60, left: -2, h: 'h-32', rot:   5, op: 0.06 },
  ],
  progress: [
    { C: TrebleClef,     top:  3, left: 80, h: 'h-44', rot:  10, op: 0.08 },
    { C: EighthNoteBeam, top: 20, left:  0, h: 'h-14', rot:  -8, op: 0.09 },
    { C: QuarterNote,    top: 75, left: 88, h: 'h-20', rot: -15, op: 0.10 },
    { C: Waveform,       top: 90, left: 30, h: 'h-8',  rot:   2, op: 0.08, wide: true },
    { C: QuarterNote,    top: 40, left: -2, h: 'h-16', rot:  30, op: 0.07 },
    { C: TrebleClef,     top: 55, left: 85, h: 'h-28', rot:  -5, op: 0.06 },
  ],
  lesson: [
    { C: TrebleClef,     top:  2, left: 85, h: 'h-36', rot:   8, op: 0.08 },
    { C: QuarterNote,    top: 15, left:  0, h: 'h-18', rot: -10, op: 0.09 },
    { C: EighthNoteBeam, top: 80, left: 80, h: 'h-14', rot:  15, op: 0.08 },
    { C: Waveform,       top: 92, left: 15, h: 'h-8',  rot:  -1, op: 0.07, wide: true },
    { C: QuarterNote,    top: 55, left: 90, h: 'h-14', rot:  25, op: 0.07 },
  ],
}

export default function ScatteredSymbols({ variant }: { variant: Variant }) {
  const symbols = SYMBOLS[variant]
  return (
    <>
      {symbols.map((s, i) => (
        <s.C
          key={i}
          className={`absolute pointer-events-none select-none ${s.h} ${s.wide ? 'w-48' : 'w-auto'}`}
          style={{ top: `${s.top}%`, left: `${s.left}%`, transform: `rotate(${s.rot}deg)` }}
          opacity={s.op}
          color="#e8b84b"
        />
      ))}
    </>
  )
}
```

**Export**: Add `ScatteredSymbols` to `components/motifs/index.ts`.

**Page Updates** — add `relative overflow-hidden` to each page's `<main>` and include `<ScatteredSymbols>`:

- `app/dashboard/page.tsx`: `<main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto">` + `<ScatteredSymbols variant="dashboard" />`
- `app/progress/[studentId]/page.tsx`: `<main className="relative overflow-hidden min-h-screen bg-studio-bg px-6 py-10 max-w-3xl mx-auto">` + `<ScatteredSymbols variant="progress" />`
- `app/lessons/new/page.tsx`: `<main className="relative overflow-hidden mx-auto max-w-3xl px-6 py-10">` + `<ScatteredSymbols variant="lesson" />`
- `app/lessons/[id]/edit/page.tsx`: `<main className="relative overflow-hidden mx-auto max-w-3xl px-6 py-10">` + `<ScatteredSymbols variant="lesson" />`

Note: `ScatteredSymbols` is a client component (`'use client'`) because it renders JSX with dynamic component references. The page files themselves remain server components — they simply import and render `ScatteredSymbols` as a child.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write component render tests using React Testing Library that inspect the DOM output of each affected component. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **EighthNoteBeam Intrinsic Size Test**: Render `<EighthNoteBeam />` and assert `svg.getAttribute('width')` is not null — will fail on unfixed code
2. **TrebleClef Path Test**: Render `<TrebleClef />` and assert no `<text>` element exists and at least one `<path>` exists — will fail on unfixed code
3. **Tiptap prose-invert Test**: Render `<TiptapEditor onChange={() => {}} />` and assert the editor content div has `prose-invert` in its className — will fail on unfixed code
4. **Dashboard No Full-Width StaffLines Test**: Render the dashboard header and assert no SVG with `w-full` class exists below the heading — will fail on unfixed code
5. **ScatteredSymbols Presence Test**: Render each authenticated page and assert at least one `aria-hidden="true"` element with `pointer-events-none` exists — will fail on unfixed code

**Expected Counterexamples**:
- `EighthNoteBeam` SVG has no `width` attribute → confirms Bug 1 root cause
- `TrebleClef` SVG contains `<text>` element → confirms Bug 2 root cause
- `EditorContent` className does not include `prose-invert` → confirms Bug 3 root cause
- Dashboard renders `StaffLines` with `w-full` → confirms Bug 4 root cause
- Authenticated pages have zero scattered symbol elements → confirms Bug 5 root cause

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed components produce the expected behavior.

**Pseudocode:**
```
FOR ALL render WHERE isBugCondition_N(render) DO
  result := fixedComponent(render)
  ASSERT expectedBehavior_N(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed components produce the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_N(input) DO
  ASSERT originalComponent(input) = fixedComponent(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-affected inputs (regular text in editor, student card clicks, form submissions), then write property-based tests capturing that behavior.

**Test Cases**:
1. **Regular Text Preservation**: Verify non-bold text in Tiptap editor continues to render in `text-studio-text` after adding `prose-invert`
2. **Motif Opacity Preservation**: Verify all motif components continue to reflect the `opacity` prop in their SVG `style` attribute
3. **Motif aria-hidden Preservation**: Verify all motif components continue to have `aria-hidden="true"` on the SVG element
4. **Dashboard Student List Preservation**: Verify student list cards retain their `bg-studio-surface rounded-2xl shadow-studio-glow` classes after header changes
5. **Page Content Preservation**: Verify progress tree, lesson forms, and breadcrumbs render correctly after adding `ScatteredSymbols`

### Unit Tests

- Test `EighthNoteBeam` renders SVG with `width="80"` and `height="80"` attributes
- Test `TrebleClef` renders SVG with a `<path>` element and no `<text>` element
- Test `TiptapEditor` `EditorContent` has `prose-invert` in className
- Test `ScatteredSymbols` renders the correct number of symbols for each variant
- Test `ScatteredSymbols` symbols all have `aria-hidden="true"` and `pointer-events-none`
- Test dashboard page does not render `StaffLines` with `w-full` class

### Property-Based Tests

- For any `opacity` value in [0, 1], all motif components (including fixed ones) SHALL reflect that value in `style.opacity`
- For any `color` string, all motif components SHALL pass it to the SVG `fill` or `stroke` attribute
- For any `className` string, all motif components SHALL include it in the SVG element's className
- For any `variant` passed to `ScatteredSymbols`, all rendered symbols SHALL have `aria-hidden="true"` and `pointer-events-none`

### Integration Tests

- Full login page render: scattered symbols visible, login form functional
- Dashboard page render: `ScatteredSymbols` present, no full-width StaffLines, student list intact
- Progress page render: `ScatteredSymbols` present, progress tree and assignments render correctly
- Lesson new/edit page render: `ScatteredSymbols` present, lesson form functional
- Tiptap editor: bold text visible, regular text unchanged, toolbar buttons functional
