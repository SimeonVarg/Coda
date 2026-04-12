# Implementation Plan: App Polish

## Overview

Incremental UI polish pass on Studio Architect. Each task builds on the previous, starting with shared primitives, then applying them page-by-page, and finishing with accessibility and micro-interaction wiring.

## Tasks

- [x] 1. Create shared primitive components
  - [x] 1.1 Create `components/Spinner.tsx` — small animated SVG spinner for use in buttons and search
    - Export a default `Spinner` component with `className` prop for sizing
    - _Requirements: 2.5, 9.5_

  - [x] 1.2 Create `components/EmptyState.tsx` — reusable empty state with optional action
    - Accept `message: string` and optional `action: { label: string; href?: string; onClick?: () => void }`
    - Use `text-sm text-gray-500` and centered `py-8 text-center` layout
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [x] 1.3 Create `components/Breadcrumb.tsx` — back-navigation link
    - Accept `href: string` and `label: string`
    - Render as `← {label}` with `text-sm text-gray-400 hover:text-gray-600 transition-colors`
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 1.4 Create `components/CharacterCount.tsx` — character count display
    - Accept `current: number` and `max: number`
    - Render `{current} / {max}` in `text-xs text-gray-400`
    - _Requirements: 6.3_

- [x] 2. Update NavBar with role badge and active link
  - Modify `components/NavBar.tsx` to use `usePathname()` for active link detection
  - Add role badge: `<span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">{role}</span>`
  - Apply `font-semibold text-indigo-700` to the active link vs default `text-indigo-600`
  - Wrap action links in `<div className="hidden sm:flex items-center gap-4">` for mobile collapse
  - _Requirements: 5.1, 5.5, 7.1_

  - [ ]* 2.1 Write unit tests for NavBar
    - Test role badge renders with correct text for teacher and student roles
    - Test active link receives distinct visual class when pathname matches
    - Test action links are hidden on narrow viewports (sm:hidden)
    - _Requirements: 5.1, 5.5_

- [x] 3. Apply consistent design system to page containers
  - [x] 3.1 Update `app/lessons/new/page.tsx` — change `max-w-2xl px-4` to `max-w-3xl px-6 py-10`; add `Breadcrumb` with student name from `searchParams`; add `metadata` export
    - Fetch student name server-side to populate breadcrumb label
    - Export `metadata = { title: 'New Lesson — Studio Architect' }`
    - _Requirements: 1.2, 5.3, 5.6_

  - [x] 3.2 Update `app/lessons/[id]/edit/page.tsx` — same container fix; add `Breadcrumb`; add `generateMetadata`
    - Export `generateMetadata` returning `{ title: 'Edit Lesson — Studio Architect' }`
    - _Requirements: 1.2, 5.3, 5.6_

  - [x] 3.3 Update `app/catalog/new/page.tsx` — change `max-w-lg px-4` to `max-w-3xl px-6 py-10`; add `metadata`
    - Export `metadata = { title: 'Add to Catalog — Studio Architect' }`
    - _Requirements: 1.2, 5.6_

  - [x] 3.4 Update `app/students/[studentId]/profile/page.tsx` — change `max-w-lg px-4` to `max-w-3xl px-6 py-10`; add `Breadcrumb`; add `generateMetadata`
    - Breadcrumb label: `← Back to {student.full_name}` linking to `/progress/{studentId}`
    - Export `generateMetadata` returning `{ title: 'Student Profile — Studio Architect' }`
    - _Requirements: 1.2, 5.4, 5.6_

  - [x] 3.5 Update `app/dashboard/page.tsx` — add `metadata` export; replace bare `<p>` empty state in `StudentList` with `<EmptyState>`
    - Export `metadata = { title: 'My Students — Studio Architect' }`
    - _Requirements: 4.1, 5.6_

  - [x] 3.6 Update `app/progress/[studentId]/page.tsx` — add `generateMetadata`; replace inline breadcrumb `<Link>` with `<Breadcrumb>` component
    - Export `generateMetadata` returning `{ title: 'Progress Tree — Studio Architect' }`
    - _Requirements: 5.2, 5.6_

  - [ ]* 3.7 Write property test for page title metadata
    - **Property 6: Page titles contain "Studio Architect"**
    - For each page's exported `metadata.title` or `generateMetadata` result, assert the string contains "Studio Architect"
    - **Validates: Requirements 5.6**

- [x] 4. Update skeleton loading components
  - [x] 4.1 Update `app/dashboard/loading.tsx` — ensure container uses `max-w-3xl px-6 py-10`; render 4 placeholder rows
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Update `app/progress/[studentId]/loading.tsx` — add three distinct skeleton sections: profile header placeholder, repertoire section placeholder, lesson notes placeholder
    - _Requirements: 2.1, 2.3_

- [x] 5. Add error boundary pages
  - [x] 5.1 Create `app/dashboard/error.tsx` — Next.js error boundary with "Try again" button calling `reset()`
    - Use `'use client'` directive; accept `{ error, reset }` props
    - Render an error card with descriptive message and retry button
    - _Requirements: 3.1_

  - [x] 5.2 Create `app/progress/[studentId]/error.tsx` — same pattern as dashboard error boundary
    - _Requirements: 3.1_

- [x] 6. Polish `RepertoireCatalogSearch`
  - Modify `components/RepertoireCatalogSearch.tsx`:
    - Replace inline spinner SVG with `<Spinner>` component
    - Update no-results message to `No results found for "${query}"`
    - Add `role="alert"` to the error message container
    - _Requirements: 2.5, 3.3, 3.5, 4.5_

  - [ ]* 6.1 Write property test for no-results message
    - **Property 4: No-results message includes the search query**
    - Use `fc.string({ minLength: 1 })` to generate query strings; render component in no-results state; assert displayed text contains the query
    - **Validates: Requirements 4.5**

  - [ ]* 6.2 Write unit tests for RepertoireCatalogSearch error state
    - Test error message has `role="alert"`
    - Test Retry button triggers re-fetch
    - _Requirements: 3.3, 3.5_

- [x] 7. Polish `ProfileForm`
  - Modify `components/ProfileForm.tsx`:
    - Add `maxLength={500}` to goals textarea and render `<CharacterCount current={goals.length} max={500} />` below it
    - Add `useEffect` to auto-dismiss success banner after 3 seconds
    - Add `useRef` to goals textarea; on validation failure, call `.focus()` on the first invalid field
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 7.1 Write property test for character count accuracy
    - **Property 7: Goals character count matches input length**
    - Use `fc.string()` to generate goal strings; render `ProfileForm`; simulate typing; assert displayed count equals string length
    - **Validates: Requirements 6.3**

  - [ ]* 7.2 Write unit tests for ProfileForm
    - Test form data is preserved when submission fails (mock server action to return error)
    - Test success banner disappears after 3 seconds
    - Test focus moves to goals field on validation error
    - _Requirements: 3.2, 6.1, 6.2_

- [x] 8. Polish `CatalogItemForm`
  - Modify `components/CatalogItemForm.tsx`:
    - Add `autoFocus` to the title input
    - Add `useRef` for title and type inputs; on validation failure, focus the first invalid field
    - Replace submit button loading label with `<Spinner>` + "Adding…" text
    - Add `useEffect` to auto-dismiss success banner after 3 seconds
    - _Requirements: 6.1, 6.2, 6.4, 9.5_

  - [ ]* 8.1 Write unit tests for CatalogItemForm
    - Test title input receives focus on mount
    - Test form data is preserved when submission fails
    - Test spinner appears in submit button during submission
    - _Requirements: 3.2, 6.4, 9.5_

- [x] 9. Polish `LessonEntryForm`
  - Modify `components/LessonEntryForm.tsx`:
    - Add `useBeforeUnload` effect: attach `beforeunload` event listener when content or tags differ from initial values; remove on cleanup
    - Replace save button loading label with `<Spinner>` + "Saving…" text
    - Wrap validation error `<p>` in a `<div role="alert">` (already has `role="alert"` on the `<p>` — verify and keep)
    - Add `transition-colors` to the Cancel button
    - _Requirements: 3.5, 6.5, 9.1, 9.5_

  - [ ]* 9.1 Write unit tests for LessonEntryForm
    - Test `beforeunload` listener is added when content changes from initial
    - Test spinner appears in Save button when saving
    - _Requirements: 6.5, 9.5_

- [x] 10. Polish `AssignmentForm` and `AssignmentList`
  - [x] 10.1 Modify `components/AssignmentForm.tsx`:
    - Add visible hint label "Optional due date" above the date input (since `<input type="date">` ignores `placeholder`)
    - Ensure remove button has min touch target via `p-2` padding (≥ 44px)
    - _Requirements: 6.6, 7.5_

  - [x] 10.2 Modify `components/AssignmentList.tsx`:
    - Replace bare `<p>` empty states with `<EmptyState>` using role-specific messages: students see "No active assignments — great work!", teachers see "No practice assignments assigned yet."
    - Add `transition-opacity duration-200` to active assignment `<li>` items for mark-done animation
    - Ensure error messages have `role="alert"`
    - _Requirements: 3.5, 4.4, 9.3_

  - [ ]* 10.3 Write unit tests for AssignmentList
    - Test student empty state shows "No active assignments — great work!"
    - Test teacher empty state shows "No practice assignments assigned yet."
    - Test error message has `role="alert"` after failed mark-done
    - _Requirements: 3.4, 3.5, 4.4_

- [x] 11. Polish `ProgressTree`
  - Modify `components/ProgressTree.tsx`:
    - Replace bare `<p>` empty states with `<EmptyState>` component in repertoire, theory, and lesson notes sections
    - Add local state `flashId: string | null`; after a successful status update, set `flashId` to the updated item's id and clear it after 1500ms; render a `✓` checkmark on the matching item
    - Verify `updateError` `<p>` has `role="alert"` (already present — confirm)
    - _Requirements: 3.5, 4.2, 4.3, 9.2_

  - [ ]* 11.1 Write property test for optimistic update revert
    - **Property 2: Optimistic update reverts on network failure**
    - Mock Supabase client to return an error; simulate status change; assert item reverts to original status and error message is visible
    - **Validates: Requirements 3.4**

  - [ ]* 11.2 Write unit tests for ProgressTree
    - Test empty states render in each section when data is absent
    - Test checkmark flash appears after successful status update
    - Test `role="alert"` on error message
    - _Requirements: 3.5, 4.2, 4.3, 9.2_

- [x] 12. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Accessibility audit and wiring
  - [x] 13.1 Audit all form components (`ProfileForm`, `CatalogItemForm`, `LessonEntryForm`, `AssignmentForm`) — verify every `<input>`, `<select>`, `<textarea>` has a matching `<label htmlFor>` / `id` pair
    - Fix any missing associations
    - _Requirements: 8.2_

  - [x] 13.2 Audit all icon-only buttons across `TagList`, `AssignmentForm`, `AssignmentList` — verify each has a non-empty `aria-label`
    - Fix any missing labels
    - _Requirements: 8.3_

  - [x] 13.3 Verify page landmark structure: each page has exactly one `<main>`, NavBar uses `<nav>`, major content regions use `<section>`
    - Fix any structural issues found
    - _Requirements: 8.4_

  - [ ]* 13.4 Write property test for form input label association
    - **Property 8: Form inputs have associated labels**
    - Render each form component; query all `<input>`, `<select>`, `<textarea>` elements; for each, assert a `<label>` with matching `htmlFor` exists in the document
    - **Validates: Requirements 8.2**

  - [ ]* 13.5 Write property test for icon-only button aria-labels
    - **Property 9: Icon-only buttons have aria-labels**
    - Render `TagList` and `AssignmentForm` with generated items; query buttons containing only SVG children; assert each has a non-empty `aria-label`
    - **Validates: Requirements 8.3**

- [x] 14. Apply `transition-colors` and `hover:shadow-sm` micro-interactions
  - Audit all interactive elements (buttons, links) across all components and pages for missing `transition-colors`
  - Add `hover:shadow-sm transition-shadow` to clickable cards in `DashboardPage` student list and `ProgressTree` lesson history items
  - _Requirements: 9.1, 9.4_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (already in devDependencies) with a minimum of 100 iterations
- Unit tests use Vitest + Testing Library (already configured)
- Run tests with `npm test` (single run) or `npm run test:watch` for watch mode
