# Implementation Plan: Practice Assignments

## Overview

This plan implements the practice assignments feature for Studio Architect. Teachers will be able to add practice tasks directly within lesson entries, and students will see their active assignments on the Progress Tree page with the ability to mark them complete. The implementation adds a new database table with RLS policies, two new client components, and targeted modifications to existing components.

## Tasks

- [x] 1. Create database migration for practice_assignments table
  - Create migration file `supabase/migrations/004_practice_assignments.sql`
  - Define `practice_assignments` table with all columns (id, lesson_entry_id, student_id, description, due_date, completed_at, created_at)
  - Add CHECK constraint for non-empty description
  - Create indexes on (student_id, completed_at) and (lesson_entry_id)
  - Enable RLS on the table
  - Create RLS policy `teachers_all_own_assignments` for teacher SELECT/INSERT/UPDATE via lesson_entries JOIN
  - Create RLS policy `students_select_own_assignments` for student SELECT
  - Create RLS policy `students_update_completed_at` for student UPDATE
  - Add column-level grants: REVOKE UPDATE from authenticated, GRANT UPDATE (completed_at) to authenticated
  - _Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.4_

- [ ]* 1.1 Write property test for assignment persistence round-trip
  - **Property 4: Assignment persistence round-trip**
  - **Validates: Requirements 1.6, 6.1, 6.3**

- [x] 2. Add TypeScript types for assignments
  - Add `AssignmentDraft` type to `lib/types.ts` with fields: key, description, due_date
  - Add `AssignmentRow` type to `lib/types.ts` with fields: id, description, due_date, completed_at, lesson_entry_date
  - _Requirements: 1.2, 1.3, 2.2, 4.3, 4.4_

- [x] 3. Implement AssignmentForm component
  - [x] 3.1 Create `components/AssignmentForm.tsx` as a client component
    - Accept `assignments: AssignmentDraft[]` and `onChange: (assignments: AssignmentDraft[]) => void` props
    - Render a list of draft rows, each with description input, date input, and remove button
    - Render "Add assignment" button that appends a new draft with `crypto.randomUUID()` key
    - Use controlled inputs for description and due_date fields
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write property test for multiple assignments held in state
    - **Property 1: Multiple assignments are all held in form state**
    - **Validates: Requirements 1.4**

  - [ ]* 3.3 Write property test for add-then-remove round-trip
    - **Property 2: Add then remove is a round-trip identity**
    - **Validates: Requirements 1.5**

  - [ ]* 3.4 Write unit tests for AssignmentForm
    - Test that description input and date input render for each draft
    - Test that "Add assignment" button appends a new draft
    - Test that remove button removes the correct draft row
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 4. Update LessonEntryForm to include assignments
  - [x] 4.1 Add assignments state and integrate AssignmentForm
    - Add `assignments` state initialized to empty array in `LessonEntryForm`
    - Import and render `AssignmentForm` component below the repertoire tagging section
    - Pass assignments state and setter to `AssignmentForm`
    - _Requirements: 1.1_

  - [x] 4.2 Add validation for empty assignment descriptions
    - Before save, check if any draft has `description.trim() === ''`
    - If found, set validation error and abort save
    - Display validation error message in the form
    - _Requirements: 1.7_

  - [ ]* 4.3 Write property test for whitespace-only descriptions rejected
    - **Property 3: Whitespace-only descriptions are rejected**
    - **Validates: Requirements 1.7**

  - [x] 4.4 Implement assignment persistence on lesson save
    - After upserting lesson entry, if editing: DELETE existing assignments for that lesson_entry_id
    - Filter drafts to only those with non-empty trimmed descriptions
    - Batch INSERT filtered assignments with lesson_entry_id, student_id, description, due_date
    - Handle errors and display existing "Failed to save" message
    - _Requirements: 1.5, 1.6_

  - [ ]* 4.5 Write unit tests for LessonEntryForm assignment logic
    - Test validation error shown when draft has empty description
    - Test that assignments are batch-inserted on save
    - Test that existing assignments are deleted on edit before re-insert
    - _Requirements: 1.7, 1.6_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement AssignmentList component
  - [x] 6.1 Create `components/AssignmentList.tsx` as a client component
    - Accept `assignments: AssignmentRow[]` and `role: 'teacher' | 'student'` props
    - In student mode: filter to active assignments (completed_at === null) and render with "Mark done" button
    - In teacher mode: render active and completed sections separately with visual distinction
    - Display description, due_date (if present), and lesson_entry_date for each row
    - Display completed_at date for completed assignments in teacher mode
    - Render empty-state message when assignments array is empty
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 4.1, 4.2, 4.3, 4.4_

  - [x] 6.2 Implement mark-done functionality
    - On "Mark done" button click, optimistically remove assignment from active list
    - Call Supabase UPDATE to set `completed_at = now()` for that assignment id
    - On error, revert optimistic removal and display inline error message
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 6.3 Write property test for all active assignments displayed
    - **Property 5: Active assignments all appear on the student progress page**
    - **Validates: Requirements 2.1**

  - [ ]* 6.4 Write property test for assignment display includes required fields
    - **Property 6: Assignment display includes required fields**
    - **Validates: Requirements 2.2**

  - [ ]* 6.5 Write property test for mark-done control present
    - **Property 7: Mark-done control present on every active assignment**
    - **Validates: Requirements 3.1**

  - [ ]* 6.6 Write property test for mark-done removes from active list
    - **Property 8: Marking done removes assignment from active list**
    - **Validates: Requirements 3.3**

  - [ ]* 6.7 Write property test for mark-done sets non-null timestamp
    - **Property 9: Mark-done sets a non-null completed_at timestamp**
    - **Validates: Requirements 3.2**

  - [ ]* 6.8 Write property test for teacher sees all assignments
    - **Property 10: Teacher view contains all assignments (active + completed)**
    - **Validates: Requirements 4.1**

  - [ ]* 6.9 Write property test for completed rows display all fields
    - **Property 11: Completed assignment rows display all required fields**
    - **Validates: Requirements 4.3, 4.4**

  - [ ]* 6.10 Write property test for visual distinction in teacher view
    - **Property 12: Active and completed assignments are visually distinct in teacher view**
    - **Validates: Requirements 4.2**

  - [ ]* 6.11 Write unit tests for AssignmentList
    - Test empty-state message renders when assignments array is empty
    - Test loading indicator displays during fetch (if applicable)
    - Test mark-done failure shows error and retains assignment in list
    - _Requirements: 2.5, 2.4, 3.4_

- [x] 7. Update Progress Tree page to display assignments
  - [x] 7.1 Create getAssignmentsData server function
    - Add `getAssignmentsData(studentId: string, role: 'teacher' | 'student')` function
    - For students: SELECT assignments WHERE student_id = studentId AND completed_at IS NULL
    - For teachers: SELECT all assignments WHERE student_id = studentId
    - JOIN to lesson_entries to get created_at as lesson_entry_date
    - Return array of `AssignmentRow` objects
    - _Requirements: 2.1, 4.1_

  - [x] 7.2 Integrate AssignmentList into Progress Tree page
    - Call `getAssignmentsData` in the page component with studentId and role
    - Import and render `AssignmentList` component below `ProgressTree`
    - Add visual section separator between Progress Tree and assignments
    - Pass assignments data and role to `AssignmentList`
    - _Requirements: 2.3_

  - [ ]* 7.3 Write integration tests for Progress Tree page
    - Test teacher-role session can SELECT assignments for their students
    - Test student-role session can SELECT only their own assignments
    - Test student-role session cannot SELECT another student's assignments
    - _Requirements: 5.1, 5.2_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Write integration tests for RLS policies
  - Test teacher can INSERT practice_assignments via lesson save flow
  - Test student can UPDATE completed_at on their own assignments
  - Test student UPDATE of description is rejected at database layer
  - Test teacher cannot SELECT assignments for unassigned students
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 10. Write smoke tests for database schema
  - Test practice_assignments table has CHECK constraint on description
  - Test RLS is enabled on practice_assignments table
  - Test foreign key cascade from lesson_entries is configured
  - Test foreign key cascade from profiles is configured
  - _Requirements: 6.1, 6.2, 6.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout, consistent with the existing Next.js codebase
