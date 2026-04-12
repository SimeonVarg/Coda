# Implementation Plan: Student Profile Goals

## Overview

Additive feature: one new migration, one new Server Action, one new page, two new components, and targeted modifications to the Progress Tree page, Dashboard, and Middleware.

## Tasks

- [x] 1. Add `StudentProfile` type and database migration
  - Add `StudentProfile` type to `lib/types.ts`
  - Create `supabase/migrations/003_student_profiles.sql` with the `student_profiles` table, `set_updated_at` trigger, and RLS policies as specified in the design
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 1.1 Write integration test: migration applies cleanly and schema is correct
  - Verify `student_profiles` table exists with correct columns and constraints
  - Verify unique constraint on `student_id` rejects duplicate inserts
  - Verify `updated_at` trigger fires on insert and update
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement `upsertStudentProfile` Server Action
  - Create `app/students/[studentId]/profile/actions.ts`
  - Implement `upsertStudentProfile(studentId, data)` returning `UpsertResult`
  - Validate at least one field is non-empty before issuing the upsert
  - Set `updated_by` to `auth.uid()`
  - Call `revalidatePath` for both the profile page and the progress page
  - _Requirements: 2.3, 2.4, 6.1, 6.2_

- [ ]* 2.1 Write property test for round-trip integrity (Property 1)
  - **Property 1: Profile data round-trip integrity**
  - **Validates: Requirements 6.1**
  - Use fast-check to generate arbitrary `(grade_level, instrument, goals)` string triples; assert retrieved record fields equal submitted values

- [ ]* 2.2 Write property test for student_id preservation (Property 2)
  - **Property 2: student_id is preserved across updates**
  - **Validates: Requirements 6.2**
  - Use fast-check to generate arbitrary profile updates; assert `student_id` in retrieved record equals original

- [ ]* 2.3 Write property test for upsert on non-empty submission (Property 5)
  - **Property 5: Upsert succeeds for any non-empty field combination**
  - **Validates: Requirements 2.3**
  - Use fast-check to generate arbitrary field combos with at least one non-empty field; assert upsert is called and success result is returned

- [x] 3. Implement `ProfileForm` client component
  - Create `components/ProfileForm.tsx`
  - Render text input for `grade_level`, text input for `instrument`, textarea for `goals`
  - Pre-populate fields from `initialProfile` prop (or empty strings when null)
  - On submit, call `upsertStudentProfile`; show success banner on success or inline error on failure
  - Show validation error when all fields are submitted empty (client-side, before any DB call)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.1 Write unit tests for `ProfileForm`
  - Test renders text input for `grade_level`, text input for `instrument`, textarea for `goals`
  - Test shows validation error when all fields are submitted empty
  - _Requirements: 2.2, 2.4_

- [ ]* 3.2 Write property test for form pre-population (Property 4)
  - **Property 4: Profile_Page form pre-populated with stored values**
  - **Validates: Requirements 2.1**
  - Use fast-check to generate arbitrary `StudentProfile` values (including null); assert form field values match stored values or are empty strings

- [x] 4. Implement Profile Page server component
  - Create `app/students/[studentId]/profile/page.tsx` as a Server Component
  - Fetch the student's `full_name` and existing `student_profiles` row (or null)
  - Verify the student is assigned to the requesting teacher — call `notFound()` otherwise
  - Render `ProfileForm` pre-populated with fetched values
  - _Requirements: 2.1, 2.7_

- [ ]* 4.1 Write unit test: Server Component returns 404 for unassigned student
  - _Requirements: 2.7_

- [x] 5. Update Middleware to protect `/students` routes
  - Add `/students` to `isProtectedRoute`
  - Add `/students/[studentId]/profile` pattern to `isTeacherOnlyRoute` — redirect student-role sessions to `/progress/[studentId]`
  - _Requirements: 2.5, 2.6, 4.3_

- [ ]* 5.1 Write unit test: Middleware redirects student-role session from `/students/[id]/profile`
  - _Requirements: 2.6, 4.3_

- [ ]* 5.2 Write property test for middleware role enforcement (Property 6)
  - **Property 6: Middleware blocks non-teachers from the profile page**
  - **Validates: Requirements 2.5, 4.3**
  - Use fast-check to generate arbitrary `studentId` values; assert teacher-role → allowed, student-role → redirected to `/progress/[studentId]`

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement `ProfileHeader` client component
  - Create `components/ProfileHeader.tsx`
  - Accept `profile: StudentProfile | null` prop
  - Render `grade_level`, `instrument`, and `goals` as read-only text
  - Render placeholder "No profile set yet." when `profile` is null or all fields are null/empty
  - No input, textarea, or edit button elements
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

- [ ]* 7.1 Write unit tests for `ProfileHeader`
  - Test renders placeholder when `profile` is null
  - Test renders all three field values when profile is present
  - Test contains no input, textarea, or edit button elements
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 7.2 Write property test for ProfileHeader field display (Property 7)
  - **Property 7: Profile_Header renders all three fields for any profile**
  - **Validates: Requirements 3.1, 4.1**
  - Use fast-check to generate arbitrary `StudentProfile` with non-null values; assert rendered output contains all three field values as visible text

- [x] 8. Update Progress Tree page to include `ProfileHeader`
  - In `app/progress/[studentId]/page.tsx`, add a parallel fetch for `student_profiles` alongside the existing progress data fetch
  - Render `<ProfileHeader profile={profile} />` above the `<Suspense>` block wrapping `ProgressContent`
  - _Requirements: 3.1, 3.2, 3.4, 4.1_

- [ ]* 8.1 Write integration test: Progress Tree page renders `ProfileHeader` above progress content
  - _Requirements: 3.1_

- [x] 9. Update Teacher Dashboard to add profile links
  - In `app/dashboard/page.tsx`, add an "Edit Profile" link per student row pointing to `/students/[studentId]/profile`
  - Preserve existing display of `full_name` and `last_lesson_date`
  - _Requirements: 5.1, 5.2_

- [ ]* 9.1 Write unit test: Dashboard row renders profile link alongside `full_name` and `last_lesson_date`
  - _Requirements: 5.2_

- [ ]* 9.2 Write property test for dashboard profile links (Property 8)
  - **Property 8: Dashboard profile link present for every student**
  - **Validates: Requirements 5.1**
  - Use fast-check to generate arbitrary non-empty student lists; assert every rendered row contains a link to `/students/[studentId]/profile`

- [ ]* 9.3 Write property test for RLS access rules (Property 3)
  - **Property 3: RLS enforces correct read/write access**
  - **Validates: Requirements 1.4**
  - Use fast-check to generate arbitrary (teacher, student, unrelated_teacher) triples; assert assigned teacher can SELECT and UPSERT, student can SELECT only, unrelated teacher is blocked from both

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Tag each property test with `// Feature: student-profile-goals, Property N: <property_text>`
