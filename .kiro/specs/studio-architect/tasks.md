# Implementation Plan: Studio Architect

## Overview

Incremental implementation of the Studio Architect platform: Supabase schema + RLS → auth module + middleware → teacher dashboard → progress tree → lesson entry form with Tiptap editor → repertoire catalog search + tagging → persistence and round-trip integrity.

## Tasks

- [x] 1. Initialize project and database schema
  - Scaffold a Next.js 14 App Router project with Tailwind CSS and install Supabase JS, Tiptap, and fast-check dependencies
  - Create Supabase migration files for `profiles`, `lesson_entries`, `catalog_items`, and `repertoire_tags` tables with all columns, FK constraints, and the `CHECK (role IN ('teacher', 'student'))` constraint on `profiles`
  - Add a generated `search_vector` tsvector column to `catalog_items`
  - Write the database trigger that sets `app_metadata.role` from `profiles.role` on user creation
  - Enable RLS on all four tables and write policies: teachers read/write own entries; students read own entries; teacher reads assigned students
  - _Requirements: 1.1, 5.3, 6.2_

- [x] 2. Auth module and session helpers
  - [x] 2.1 Implement `lib/auth.ts` with `getSession`, `getUserRole`, `signIn`, and `signOut`
    - Use Supabase SSR helpers for server-side session access
    - Extract role from `app_metadata.role` in the JWT
    - _Requirements: 1.2, 1.3_

  - [ ]* 2.2 Write unit tests for auth module
    - Test `getUserRole` returns `"teacher"` / `"student"` / `null` for valid, valid, and missing role claims
    - Test `signIn` returns an error result on invalid credentials (Req 1.3)
    - _Requirements: 1.2, 1.3_

- [x] 3. Next.js Middleware for authentication and authorization
  - [x] 3.1 Implement `middleware.ts` at the project root
    - Refresh Supabase session from cookies on every request
    - Redirect unauthenticated users hitting `/dashboard/**` or `/lessons/**` to `/login`
    - Return 403 + redirect to `/progress` for student-role sessions hitting `/lessons/new` or `/lessons/[id]/edit`
    - Allow teacher-role sessions through on all routes
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.2, 2.3_

  - [ ]* 3.2 Write property test for unauthenticated redirect (Property 1)
    - **Property 1: Unauthenticated requests to protected routes are always redirected**
    - Generate arbitrary sub-paths under `/dashboard` and `/lessons`; assert middleware always returns redirect to `/login`
    - **Validates: Requirements 1.5, 1.6**

  - [ ]* 3.3 Write property test for role-based middleware enforcement (Property 2)
    - **Property 2: Middleware enforces role-based access on teacher-only routes**
    - Generate arbitrary lesson IDs × role (`"teacher"` / `"student"`); assert student → 403 redirect, teacher → allowed
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 3.4 Write unit tests for middleware
    - Test redirect for unauthenticated request to `/dashboard` (Req 1.4, 1.6)
    - Test 403 redirect for student accessing `/lessons/new` (Req 2.2)
    - Test pass-through for teacher accessing `/lessons/new` (Req 2.3)
    - _Requirements: 1.4, 1.6, 2.1, 2.2, 2.3_

- [x] 4. Login page and auth UI
  - Implement `app/login/page.tsx` with email/password form
  - Call `signIn` on submit; display inline error message on failure; redirect to `/dashboard` on success
  - _Requirements: 1.2, 1.3_

- [x] 5. Teacher Dashboard
  - [x] 5.1 Implement `app/dashboard/page.tsx` as a React Server Component
    - Query `profiles` joined with `lesson_entries` to build `StudentSummary[]` (id, full_name, last_lesson_date) for the authenticated teacher
    - Render student list with full name and last lesson date; link each row to `/progress/[studentId]`
    - Show loading indicator via Suspense boundary; show empty-state message when list is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.2 Write property test for dashboard student completeness (Property 3)
    - **Property 3: Dashboard returns exactly the teacher's assigned students**
    - Generate arbitrary teacher + student assignment sets; assert query returns all and only assigned students
    - **Validates: Requirements 3.1**

  - [ ]* 5.3 Write property test for dashboard row fields (Property 4)
    - **Property 4: Dashboard student rows contain all required display fields**
    - Generate arbitrary student records; assert rendered row contains `full_name` and `last_lesson_date`
    - **Validates: Requirements 3.2**

  - [ ]* 5.4 Write unit tests for dashboard
    - Test empty-state renders when teacher has no students (Req 3.5)
    - Test each student row contains name and date (Req 3.2)
    - _Requirements: 3.2, 3.5_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Progress Tree
  - [x] 7.1 Implement `app/progress/[studentId]/page.tsx` (Server Component + Client tree)
    - Query `repertoire_tags` joined with `catalog_items` for the given student; filter `status = 'mastered'` for repertoire and `status = 'completed'` for theory
    - Render a visual tree using React + CSS; apply distinct CSS classes / icons to repertoire vs. theory items
    - Show loading indicator via Suspense; show empty-state when no items exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 7.2 Write property test for progress tree completeness (Property 5)
    - **Property 5: Progress tree returns all and only the correct items for a student**
    - Generate arbitrary student + tag sets with mixed statuses; assert query returns all and only mastered/completed items for that student
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [ ]* 7.3 Write property test for progress tree visual distinction (Property 6)
    - **Property 6: Progress tree visually distinguishes item types**
    - Generate arbitrary mixed progress tree data; assert rendered output applies distinct markers per type
    - **Validates: Requirements 4.3**

  - [ ]* 7.4 Write unit tests for progress tree
    - Test empty-state renders when student has no items (Req 4.6)
    - Test mastered repertoire and completed theory items render with different CSS classes (Req 4.3)
    - _Requirements: 4.3, 4.6_

- [x] 8. Tiptap rich-text editor component
  - [x] 8.1 Implement `components/TiptapEditor.tsx` as a Client Component
    - Configure Tiptap with StarterKit extensions covering bold, italic, bullet list, ordered list, and headings (levels 1–3)
    - Accept `initialContent?: JSONContent` and call `onChange(content: JSONContent)` on every update
    - _Requirements: 5.1, 5.2_

  - [ ]* 8.2 Write property test for editor format support (Property 7)
    - **Property 7: Rich-text editor accepts all required format types**
    - Generate arbitrary text content × format type (bold, italic, bulletList, orderedList, heading); assert applying each format produces a valid JSONContent with the correct node/mark type
    - **Validates: Requirements 5.2**

  - [ ]* 8.3 Write property test for rich-text round-trip integrity (Property 11)
    - **Property 11: Rich-text content round-trip integrity**
    - Generate arbitrary valid JSONContent trees; assert `deserialize(serialize(doc)) ≡ doc`
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 8.4 Write unit tests for TiptapEditor
    - Test editor renders stored content without data loss (Req 7.3)
    - Test malformed JSONB input renders empty editor with error banner rather than crashing
    - _Requirements: 5.2, 7.3_

- [x] 9. Repertoire catalog search
  - [x] 9.1 Implement `app/api/catalog/search/route.ts` Route Handler
    - Accept `?q={query}`; use `to_tsvector` / `plainto_tsquery` for FTS; fall back to `ILIKE` for short queries
    - Return `CatalogItem[]`
    - _Requirements: 6.1, 6.2_

  - [x] 9.2 Implement `components/RepertoireCatalogSearch.tsx` as a Client Component
    - Debounced fetch to `/api/catalog/search`; render results list; call `onSelect(item)` on selection
    - Show inline error when search fails; allow manual retry
    - _Requirements: 6.1, 6.2_

  - [ ]* 9.3 Write unit tests for catalog search
    - Test search input is present on lesson form (Req 6.1)
    - Test inline error renders on search failure
    - _Requirements: 6.1_

- [x] 10. Lesson entry form and persistence
  - [x] 10.1 Implement `components/TagList.tsx`
    - Render currently selected `CatalogItem[]` tags; emit `onRemove(item)` per tag
    - _Requirements: 6.3, 6.4_

  - [ ]* 10.2 Write property test for tag add/remove round-trip (Property 9)
    - **Property 9: Repertoire tag add/remove round-trip**
    - Generate arbitrary tag list + catalog item; assert add(item) then remove(item) leaves the list unchanged
    - **Validates: Requirements 6.3, 6.4**

  - [x] 10.3 Implement `app/lessons/new/page.tsx` and `app/lessons/[id]/edit/page.tsx`
    - Compose `TiptapEditor`, `RepertoireCatalogSearch`, and `TagList`
    - Client-side validation: block submission when content is empty and no tags are selected; show validation error
    - On save: write `lesson_entries` row and associated `repertoire_tags` rows in a single Supabase transaction; navigate to `/progress/[studentId]` on success; show toast error on DB failure without losing form state
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 6.3, 6.4, 6.5_

  - [ ]* 10.4 Write property test for lesson entry field preservation (Property 8)
    - **Property 8: Saved lesson entry preserves all required fields**
    - Generate arbitrary lesson entries (content + tags + IDs); assert retrieved record equals saved record on all required fields
    - **Validates: Requirements 5.3**

  - [ ]* 10.5 Write property test for tag propagation to progress tree (Property 10)
    - **Property 10: Saving a lesson entry propagates tags to the progress tree**
    - Generate arbitrary lesson entries with tags; assert after save the progress tree query includes all entry tags with correct statuses
    - **Validates: Requirements 6.5**

  - [ ]* 10.6 Write unit tests for lesson entry form
    - Test validation error renders on empty submit (Req 5.4)
    - Test successful save navigates to progress tree (Req 5.5)
    - _Requirements: 5.4, 5.5_

- [x] 11. Wire everything together
  - [x] 11.1 Connect dashboard student rows to progress tree and lesson entry routes
    - Verify `/dashboard` → `/progress/[studentId]` navigation works end-to-end
    - Add "New Lesson" button on progress tree linking to `/lessons/new?studentId=[id]`
    - Pre-populate `student_id` in the lesson form from the query param
    - _Requirements: 3.3, 5.1_

  - [ ]* 11.2 Write integration tests
    - Sign in with seeded teacher/student accounts; verify role claim in session (Req 1.2)
    - End-to-end: create lesson entry → verify progress tree updated (Req 6.5)
    - Catalog search against 10k-row seeded DB; verify response ≤ 300ms (Req 6.2)
    - _Requirements: 1.2, 6.2, 6.5_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations per property
- Tag format for property tests: `// Feature: studio-architect, Property N: <property_text>`
- Checkpoints ensure incremental validation before moving to the next phase
