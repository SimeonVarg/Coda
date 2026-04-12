# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - SVG Intrinsic Dimensions, TrebleClef Path, prose-invert, StaffLines Divider, Scattered Symbols Absence
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: Scope each property to the concrete failing case to ensure reproducibility
  - In `components/conservatory-theme.test.tsx` (or a new test file), write the following assertions against the UNFIXED code:
    1. Render `<EighthNoteBeam />` and assert `svg.getAttribute('width')` is not null — isBugCondition_1: SVG has no `width`/`height` attributes
    2. Render `<TrebleClef />` and assert no `<text>` element exists and at least one `<path>` exists — isBugCondition_2: SVG contains `<text>` and no `<path>`
    3. Render `<TiptapEditor onChange={() => {}} />` and assert the `.ProseMirror` parent div has `prose-invert` in its className — isBugCondition_3: `EditorContent` missing `prose-invert`
    4. Render the dashboard header block and assert no SVG with class containing `w-full` exists — isBugCondition_4: StaffLines rendered with `w-full`
    5. Render `<ScatteredSymbols variant="dashboard" />` and assert it renders symbols with `aria-hidden="true"` and `pointer-events-none` — isBugCondition_5: no scattered symbols on authenticated pages
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "EighthNoteBeam SVG has no width attribute", "TrebleClef contains <text> element")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Motif Props, Editor Text, Dashboard Cards, Page Content
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Observe: `<EighthNoteBeam opacity={0.3} />` reflects `style.opacity = 0.3` and has `aria-hidden="true"`
    - Observe: `<QuarterNote opacity={0.5} color="#fff" />` reflects opacity and color in SVG attributes
    - Observe: Regular (non-bold) text in TiptapEditor renders with `text-studio-text` class on the editor container
    - Observe: Dashboard student list cards have `bg-studio-surface rounded-2xl shadow-studio-glow` classes
  - Write property-based tests capturing observed behavior:
    - For any `opacity` in [0, 1], all motif components SHALL reflect that value in `style.opacity` and have `aria-hidden="true"` — covers ¬C for Bug 1 & 2 (non-buggy prop behavior)
    - For any `color` string, motif components SHALL pass it to the SVG `fill` attribute
    - For any `className` string, motif components SHALL include it in the SVG element's className
    - TiptapEditor container SHALL have `text-studio-text` class regardless of bold fix
    - Dashboard `<main>` SHALL contain elements with `bg-studio-surface rounded-2xl shadow-studio-glow` classes
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4, 3.5, 3.7, 3.8_

- [x] 3. Fix EighthNoteBeam SVG intrinsic dimensions

  - [x] 3.1 Add `width="80" height="80"` to the `<svg>` element in `components/motifs/EighthNoteBeam.tsx`
    - The SVG already has `viewBox="0 0 80 80"` — add matching `width="80"` and `height="80"` attributes
    - This gives browsers the natural 1:1 aspect ratio so `w-auto` resolves proportionally
    - _Bug_Condition: isBugCondition_1 — SVG element has no `width`/`height` attributes_
    - _Expected_Behavior: `svg.getAttribute('width') === '80'` and `svg.getAttribute('height') === '80'`_
    - _Preservation: opacity prop, aria-hidden, className forwarding remain unchanged_
    - _Requirements: 2.2, 3.7, 3.8_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - EighthNoteBeam Has Intrinsic Dimensions
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the EighthNoteBeam intrinsic size assertion from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 1 is fixed)
    - _Requirements: 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - EighthNoteBeam Motif Props
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in opacity/aria-hidden/className behavior)

- [x] 4. Fix TrebleClef to use SVG path geometry

  - [x] 4.1 Replace the `<text>` unicode element with a `<path>` in `components/motifs/TrebleClef.tsx`
    - Update `viewBox` to `"0 0 100 250"`
    - Remove the `<text>` element entirely
    - Add a `<path>` element with the treble clef geometry:
      `d="M50,230 C35,230 22,220 22,205 C22,188 36,178 50,178 C64,178 78,188 78,205 C78,222 64,232 50,232 C30,232 14,216 14,195 C14,165 28,140 50,110 C72,80 82,58 82,35 C82,18 70,8 58,8 C44,8 34,18 34,32 C34,46 44,54 56,50 M50,110 L50,230 M50,230 C44,238 40,244 42,248"`
    - Remove the `fontFamily` prop usage — no longer needed
    - _Bug_Condition: isBugCondition_2 — SVG contains `<text>` and no `<path>`_
    - _Expected_Behavior: SVG contains at least one `<path>` and zero `<text>` elements_
    - _Preservation: opacity prop, aria-hidden, className forwarding, color prop remain unchanged_
    - _Requirements: 2.3, 3.7, 3.8_

  - [x] 4.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - TrebleClef Uses SVG Path Geometry
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the TrebleClef path assertion from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 2 is fixed)
    - _Requirements: 2.3_

  - [x] 4.3 Verify preservation tests still pass
    - **Property 2: Preservation** - TrebleClef Motif Props
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 5. Fix Tiptap editor bold text visibility

  - [x] 5.1 Add `prose-invert` to the `EditorContent` className in `components/TiptapEditor.tsx`
    - Change `className="prose prose-sm max-w-none px-4 py-3 min-h-[160px] focus:outline-none text-studio-text"`
    - To `className="prose prose-sm prose-invert max-w-none px-4 py-3 min-h-[160px] focus:outline-none text-studio-text"`
    - _Bug_Condition: isBugCondition_3 — EditorContent has `prose` but not `prose-invert`_
    - _Expected_Behavior: EditorContent className includes `prose-invert`_
    - _Preservation: `text-studio-text` class remains; toolbar buttons continue to apply formatting_
    - _Requirements: 2.4, 3.3, 3.4_

  - [x] 5.2 Add prose color overrides in `app/globals.css`
    - Add the following under `@layer base` to pin prose element colors to the studio palette:
      ```css
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
      ```
    - _Requirements: 2.4, 3.3_

  - [x] 5.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Tiptap EditorContent Has prose-invert
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the prose-invert className assertion from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 3 is fixed)
    - _Requirements: 2.4_

  - [x] 5.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Bold Tiptap Text Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms `text-studio-text` and toolbar behavior unchanged)

- [x] 6. Fix dashboard StaffLines

  - [x] 6.1 Remove the full-width `<StaffLines>` from below the heading in `app/dashboard/page.tsx`
    - Delete the `<StaffLines className="w-full mt-4 text-studio-gold" opacity={0.2} />` line from the header block
    - Remove the `StaffLines` import from `@/components/motifs` if it is no longer used on the page
    - The `EighthNoteBeam` accent in the header remains unchanged
    - _Bug_Condition: isBugCondition_4 — StaffLines with `w-full` rendered between heading and student list_
    - _Expected_Behavior: No SVG with `w-full` class exists in the dashboard header area_
    - _Preservation: Student list cards, hover animations, navigation links remain unchanged_
    - _Requirements: 2.5, 3.5, 3.6_

  - [x] 6.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Dashboard Has No Full-Width StaffLines Divider
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the no-full-width-StaffLines assertion from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 4 is fixed)
    - _Requirements: 2.5_

  - [x] 6.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Dashboard Student List Cards
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms student list cards and navigation unchanged)

- [x] 7. Create ScatteredSymbols component

  - [x] 7.1 Create `components/motifs/ScatteredSymbols.tsx` as a client component
    - Add `'use client'` directive at the top
    - Import `TrebleClef`, `QuarterNote`, `EighthNoteBeam`, `Waveform` from `'.'`
    - Define `Variant` type as `'dashboard' | 'progress' | 'lesson'`
    - Define `SymbolDef` interface with fields: `C` (component), `top`, `left` (percentages), `h` (height class), `rot` (rotation degrees), `op` (opacity), optional `wide` (boolean)
    - Define `SYMBOLS` record with arrangements for each variant as specified in the design:
      - `dashboard`: 6 symbols (TrebleClef, QuarterNote, EighthNoteBeam, Waveform, QuarterNote, TrebleClef)
      - `progress`: 6 symbols (TrebleClef, EighthNoteBeam, QuarterNote, Waveform, QuarterNote, TrebleClef)
      - `lesson`: 5 symbols (TrebleClef, QuarterNote, EighthNoteBeam, Waveform, QuarterNote)
    - Render each symbol with `absolute pointer-events-none select-none` classes, `style` for top/left/rotate, `opacity` prop, and `color="#e8b84b"`
    - _Requirements: 2.6, 2.7, 3.7, 3.8_

  - [x] 7.2 Export `ScatteredSymbols` from `components/motifs/index.ts`
    - Add `export { default as ScatteredSymbols } from './ScatteredSymbols'`
    - _Requirements: 2.6_

- [x] 8. Add ScatteredSymbols to dashboard page

  - [x] 8.1 Update `app/dashboard/page.tsx` to include scattered symbols
    - Add `ScatteredSymbols` to the import from `@/components/motifs`
    - Add `relative overflow-hidden` to the `<main>` element's className
    - Render `<ScatteredSymbols variant="dashboard" />` as the first child of `<main>`
    - _Bug_Condition: isBugCondition_5 — dashboard renders no scattered symbol elements_
    - _Expected_Behavior: Page includes aria-hidden pointer-events-none symbol elements_
    - _Preservation: Student list, heading, EighthNoteBeam accent, navigation all unchanged_
    - _Requirements: 2.6, 2.7, 3.5, 3.6_

  - [x] 8.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Dashboard Includes Scattered Symbols
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the ScatteredSymbols presence assertion for dashboard from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 5 is fixed for dashboard)
    - _Requirements: 2.6_

  - [x] 8.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Dashboard Page Content Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms student list cards and navigation unchanged)

- [x] 9. Add ScatteredSymbols to progress page

  - [x] 9.1 Update `app/progress/[studentId]/page.tsx` to include scattered symbols
    - Add `ScatteredSymbols` to the import from `@/components/motifs`
    - Add `relative overflow-hidden` to the `<main>` element's className (alongside existing classes)
    - Render `<ScatteredSymbols variant="progress" />` as the first child of `<main>`
    - _Requirements: 2.6, 2.7, 3.9_

  - [x] 9.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Progress Page Content Unchanged
    - Re-run preservation tests from task 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms progress tree, profile header, assignments render correctly)

- [x] 10. Add ScatteredSymbols to lesson new page

  - [x] 10.1 Update `app/lessons/new/page.tsx` to include scattered symbols
    - Add `ScatteredSymbols` to the import from `@/components/motifs`
    - Add `relative overflow-hidden bg-studio-bg min-h-screen` to the `<main>` element's className
    - Render `<ScatteredSymbols variant="lesson" />` as the first child of `<main>`
    - _Requirements: 2.6, 2.7, 3.10_

  - [x] 10.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Lesson New Page Content Unchanged
    - Re-run preservation tests from task 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms lesson form and breadcrumb render correctly)

- [x] 11. Add ScatteredSymbols to lesson edit page

  - [x] 11.1 Update `app/lessons/[id]/edit/page.tsx` to include scattered symbols
    - Add `ScatteredSymbols` to the import from `@/components/motifs`
    - Add `relative overflow-hidden bg-studio-bg min-h-screen` to the `<main>` element's className
    - Render `<ScatteredSymbols variant="lesson" />` as the first child of `<main>`
    - _Requirements: 2.6, 2.7, 3.10_

  - [x] 11.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Lesson Edit Page Content Unchanged
    - Re-run preservation tests from task 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms lesson form, tags, and breadcrumb render correctly)

- [x] 12. Checkpoint — Ensure all tests pass
  - Run the full test suite
  - Verify all bug condition exploration tests now PASS (bugs are fixed)
  - Verify all preservation property tests still PASS (no regressions)
  - Confirm: EighthNoteBeam has `width="80" height="80"`, TrebleClef has `<path>` and no `<text>`, TiptapEditor has `prose-invert`, dashboard has no full-width StaffLines, all four authenticated pages render ScatteredSymbols
  - Ask the user if any questions arise
