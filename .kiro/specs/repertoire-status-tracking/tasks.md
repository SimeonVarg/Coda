# Implementation Plan: Repertoire Status Tracking

## Overview

Extend the existing repertoire tagging system with a full status lifecycle (`introduced`, `in_progress`, `mastered`). Changes touch the database migration, TypeScript types, `LessonEntryForm`, `TagList`, a new `TagStatusSelector` component, and `ProgressTree`.

## Tasks

- [x] 1. Database migration — add `in_progress` status and UPDATE RLS policy
  - Create `supabase/migrations/002_repertoire_status_in_progress.sql`
  - Drop the existing `repertoire_tags_status_check` constraint and replace it with one that accepts `('introduced', 'in_progress', 'mastered', 'completed')`
  - Add the `teachers_update_own_tags` RLS UPDATE policy as specified in the design
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3_

  - [ ]* 1.1 Write property test — valid status values accepted (Property 1)
    - **Property 1: Valid status values are accepted by the database**
    - **Validates: Requirements 1.2**

  - [ ]* 1.2 Write property test — invalid status values rejected (Property 2)
    - **Property 2: Invalid status values are rejected by the database**
    - **Validates: Requirements 1.3**

  - [ ]* 1.3 Write property test — RLS permits teacher, rejects student (Property 12)
    - **Property 12: Teachers may UPDATE their own tags; students may not**
    - **Validates: Requirements 7.1, 7.2**

- [x] 2. Update TypeScript types in `lib/types.ts`
  - Add `export type RepertoireStatus = 'introduced' | 'in_progress' | 'mastered'`
  - Update `RepertoireItem.status` from the literal `'mastered'` to `RepertoireStatus`
  - Rename `ProgressTreeData.mastered_repertoire` to `repertoire_items` and type it as `RepertoireItem[]`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create `TagStatusSelector` component (`components/TagStatusSelector.tsx`)
  - Implement a `<select>` with three `<option>` elements: `Introduced`, `In Progress`, `Mastered`
  - Accept `value: RepertoireStatus`, `onChange: (status: RepertoireStatus) => void`, and optional `disabled?: boolean` props
  - _Requirements: 3.1, 3.2_

  - [ ]* 3.1 Write unit test — renders exactly three options with correct labels
    - Test that the selector renders `Introduced`, `In Progress`, `Mastered` options
    - _Requirements: 3.2_

  - [ ]* 3.2 Write property test — status selection updates in-memory tag state (Property 3)
    - **Property 3: Status selection updates in-memory tag state**
    - **Validates: Requirements 3.3**

- [x] 4. Update `TagList` to support per-tag status
  - Introduce the `TagWithStatus` type (`{ item: CatalogItem; status: RepertoireStatus | 'completed' }`)
  - Update `TagListProps` to accept `tags: TagWithStatus[]`, `onRemove`, and `onStatusChange`
  - Render `TagStatusSelector` for `repertoire` items; render a static "Completed" label for `theory` items
  - _Requirements: 3.1, 3.3, 3.5_

  - [ ]* 4.1 Write unit test — shows `TagStatusSelector` for repertoire, hides for theory
    - _Requirements: 3.5_

- [x] 5. Update `LessonEntryForm` to track per-tag status
  - Change internal state from `CatalogItem[]` to `TagWithStatus[]`
  - In `handleSelect`, initialize repertoire tags with `status: 'introduced'` and theory tags with `status: 'completed'`
  - Add an `onStatusChange` handler that updates the matching tag's status in state
  - Pass `onStatusChange` down to `TagList`
  - Update the save handler to use each tag's current `status` in the insert payload
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [ ]* 5.1 Write property test — lesson entry save persists the selected status (Property 4)
    - **Property 4: Lesson entry save persists the selected status**
    - **Validates: Requirements 3.4**

- [ ] 6. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update progress data query in `app/progress/[studentId]/page.tsx`
  - Broaden the query to return all `repertoire_tags` rows regardless of status (remove any `status = 'mastered'` filter)
  - Pass each tag's actual `status` value through to `RepertoireItem` instead of hard-coding `'mastered'`
  - Rename the `mastered_repertoire` variable to `repertoire_items` to match the updated `ProgressTreeData` type
  - Pass `role` down to `<ProgressTree>` as a prop
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.1 Write property test — progress tree query returns only the queried student's tags (Property 11)
    - **Property 11: Progress tree query returns only the queried student's tags**
    - **Validates: Requirements 6.4**

- [x] 8. Update `ProgressTree` component
  - Add `role: 'teacher' | 'student'` to `ProgressTreeProps`
  - Rename the `mastered_repertoire` reference to `repertoire_items`
  - Group repertoire items by status in the order `introduced → in_progress → mastered`, each in its own `<section>`
  - Render a `StatusBadge` on each item using the Tailwind classes from the design (`gray` / `amber` / `indigo`)
  - In teacher mode, render a `TagStatusSelector` on each repertoire item with optimistic update logic: update local state immediately, call Supabase `update`, revert and show an error message on failure
  - In student mode, do not render `TagStatusSelector`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.1 Write property test — all repertoire items displayed regardless of status (Property 5)
    - **Property 5: Progress tree displays all repertoire items regardless of status**
    - **Validates: Requirements 4.1, 6.1**

  - [ ]* 8.2 Write property test — status badges are visually distinct (Property 6)
    - **Property 6: Status badges are visually distinct across statuses**
    - **Validates: Requirements 4.2**

  - [ ]* 8.3 Write property test — items grouped by status (Property 7)
    - **Property 7: Progress tree groups items by status**
    - **Validates: Requirements 4.7**

  - [ ]* 8.4 Write property test — teacher view shows selector on every item (Property 8)
    - **Property 8: Teacher view shows a selector on every repertoire item**
    - **Validates: Requirements 5.1**

  - [ ]* 8.5 Write property test — student view never shows the selector (Property 9)
    - **Property 9: Student view never shows the status selector**
    - **Validates: Requirements 5.5**

  - [ ]* 8.6 Write property test — inline status update reaches the database (Property 10)
    - **Property 10: Inline status update reaches the database**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 8.7 Write unit test — DB update failure shows error and reverts selector
    - _Requirements: 5.4_

- [ ] 9. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use **fast-check** (already in the project) with a minimum of 100 iterations each
- Tag each property test with `// Feature: repertoire-status-tracking, Property N: <property_text>`
- The `TagStatusSelector` is shared between `TagList` (lesson form) and `ProgressTree` (inline update)
- The inline status update in `ProgressTree` calls the Supabase JS client directly — no new API route needed
