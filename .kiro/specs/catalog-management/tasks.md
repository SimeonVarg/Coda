# Implementation Plan: Catalog Management

## Overview

Add a teacher-only UI for inserting `catalog_items` into the shared catalog. This involves a new RLS migration, a POST API route, a form component, a new page, and NavBar updates.

## Tasks

- [x] 1. Add database migration for teacher insert RLS policy
  - Create `supabase/migrations/002_catalog_insert_policy.sql`
  - Add `teachers_insert_catalog` policy using `auth.jwt() -> 'app_metadata' ->> 'role' = 'teacher'`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Implement the Catalog API route
  - [x] 2.1 Create `app/api/catalog/route.ts` with a `POST` handler
    - Validate session via `supabase.auth.getUser()`; return `401` if missing
    - Check `user.app_metadata.role === 'teacher'`; return `403` if not
    - Parse and validate body: `title` (non-empty), `type` (`'repertoire'|'theory'`), optional `composer`
    - Insert into `catalog_items` using the server Supabase client; return `201` with inserted row
    - Return `400` for validation failures, `500` for DB errors
    - _Requirements: 1.4, 3.1, 3.2_

  - [ ]* 2.2 Write property test for Catalog API auth enforcement (Property 2)
    - **Property 2: API rejects non-teacher insert requests**
    - **Validates: Requirements 1.4**

  - [ ]* 2.3 Write property test for catalog item insert round-trip (Property 4)
    - **Property 4: Catalog item insert round-trip preserves all fields**
    - **Validates: Requirements 3.1, 3.2**

- [x] 3. Implement the CatalogItemForm component
  - [x] 3.1 Create `components/CatalogItemForm.tsx` as a Client Component
    - Controlled inputs for `title` (text), `type` (select: `repertoire`/`theory`), `composer` (text, optional)
    - Client-side validation: non-empty/non-whitespace `title`, `type` must be selected
    - POST to `/api/catalog` on valid submit; show inline validation errors without making a network request on invalid input
    - On `201`: reset all fields to empty defaults, show confirmation banner with item title
    - On error: display error message, preserve form field values
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test for whitespace title rejection (Property 3)
    - **Property 3: Empty or whitespace-only title is always rejected by the form**
    - **Validates: Requirements 2.5**

  - [ ]* 3.3 Write property test for form reset after success (Property 5)
    - **Property 5: Form resets to empty defaults after every successful insert**
    - **Validates: Requirements 3.4**

  - [ ]* 3.4 Write unit tests for CatalogItemForm
    - Renders all three fields with correct attributes (Req 2.2)
    - Selecting `theory` allows empty composer without error (Req 2.3)
    - Selecting `repertoire` shows composer as optional (Req 2.4)
    - Empty title shows validation error, no fetch called (Req 2.5)
    - No type selected shows validation error (Req 2.6)
    - Successful submit shows confirmation banner (Req 3.3)
    - DB failure shows error and preserves form data (Req 3.5)
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.5_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Add `/catalog/new` page and update Middleware
  - [x] 5.1 Update `middleware.ts` to add `/catalog/new` to `isTeacherOnlyRoute`
    - Add `if (pathname === "/catalog/new") return true` to the guard function
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 5.2 Create `app/catalog/new/page.tsx` as a Server Component
    - Render the page shell with a heading and `CatalogItemForm`
    - _Requirements: 2.1_

  - [ ]* 5.3 Write property test for middleware role enforcement (Property 1)
    - **Property 1: Middleware enforces teacher-only access to `/catalog/new`**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 6. Update NavBar to show catalog link for teachers
  - [x] 6.1 Update `NavBar` in `components/NavBar.tsx` to accept a `role` prop (`"teacher" | "student" | null`)
    - Render a `/catalog/new` nav link only when `role === "teacher"`
    - _Requirements: 6.1, 6.2_

  - [x] 6.2 Update `app/layout.tsx` to fetch the user role server-side and pass it to `NavBar`
    - Use the server Supabase client to call `getUser()` and read `app_metadata.role`
    - _Requirements: 6.1, 6.2_

  - [ ]* 6.3 Write unit tests for NavBar role-conditional link
    - Renders `/catalog/new` link when `role="teacher"` (Req 6.1)
    - Does not render `/catalog/new` link when `role="student"` (Req 6.2)
    - _Requirements: 6.1, 6.2_

- [ ] 7. Verify search availability of newly inserted items
  - [ ]* 7.1 Write property test for search findability after insert (Property 6)
    - **Property 6: Newly inserted item is immediately findable via catalog search**
    - **Validates: Requirements 5.1**

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The existing `GET /api/catalog/search` route requires no changes — the generated `search_vector` column handles new items automatically
- Property tests use **fast-check** with tag format `// Feature: catalog-management, Property N: <property_text>`
