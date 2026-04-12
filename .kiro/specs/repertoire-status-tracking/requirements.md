# Requirements Document

## Introduction

This feature extends the Studio Architect platform to support a richer repertoire status lifecycle. Currently, the `repertoire_tags` table supports three statuses — `introduced`, `mastered`, and `completed` — but the Progress Tree only surfaces `mastered` repertoire items and `completed` theory items. The `in progress` status does not yet exist in the database.

This feature adds `in_progress` as a valid repertoire status, enables teachers to assign and update any of the three repertoire statuses (`introduced`, `in_progress`, `mastered`) from the lesson entry form or directly from the Progress Tree, and updates the Progress Tree to display all repertoire statuses with distinct visual treatment. The `completed` status for theory assignments remains unchanged.

## Glossary

- **System**: The Studio Architect web application
- **Teacher**: An authenticated user with the "teacher" role who manages students and creates lesson entries
- **Student**: An authenticated user with the "student" role who can view their own progress data
- **Repertoire_Tag**: A record in the `repertoire_tags` table linking a `catalog_item` of type `repertoire` to a `lesson_entry`, carrying a `status` value
- **Repertoire_Status**: One of three ordered values applicable to repertoire pieces: `introduced`, `in_progress`, or `mastered`
- **Progress_Tree**: The visual component (`ProgressTree.tsx`) that displays a student's tagged repertoire and theory items
- **Status_Badge**: A visual indicator (color, icon, or label) rendered on a Progress_Tree item to communicate its Repertoire_Status
- **Lesson_Entry_Form**: The teacher-facing form used to create or edit a lesson entry, including repertoire tagging
- **Tag_Status_Selector**: The UI control within the Lesson_Entry_Form or Progress_Tree that allows a teacher to choose a Repertoire_Status for a tag
- **DB_Migration**: A Supabase SQL migration file that alters the `repertoire_tags.status` CHECK constraint to include `in_progress`

---

## Requirements

### Requirement 1: Database Schema — Add `in_progress` Status

**User Story:** As a platform engineer, I want the database to accept `in_progress` as a valid repertoire tag status, so that the application can persist the new status without violating the existing CHECK constraint.

#### Acceptance Criteria

1. THE DB_Migration SHALL drop the existing CHECK constraint on `repertoire_tags.status` and replace it with a new constraint that accepts exactly the values `introduced`, `in_progress`, `mastered`, and `completed`
2. WHEN a `repertoire_tags` row is inserted or updated with `status = 'in_progress'`, THE System SHALL persist the row without a constraint violation
3. WHEN a `repertoire_tags` row is inserted or updated with a status value outside `('introduced', 'in_progress', 'mastered', 'completed')`, THE System SHALL reject the operation with a constraint violation error
4. THE DB_Migration SHALL preserve all existing rows and their current status values without modification

---

### Requirement 2: Type System — Reflect Updated Status Values

**User Story:** As a developer, I want the TypeScript type definitions to reflect the full set of valid repertoire statuses, so that the compiler catches any misuse of status values across the codebase.

#### Acceptance Criteria

1. THE System SHALL define a `RepertoireStatus` type as the union `'introduced' | 'in_progress' | 'mastered'`
2. THE System SHALL update the `RepertoireItem` type so that its `status` field uses `RepertoireStatus` instead of the literal `'mastered'`
3. THE System SHALL update the `ProgressTreeData` type so that `mastered_repertoire` is renamed to `repertoire_items` and typed as `RepertoireItem[]`
4. WHEN a component or function references a repertoire status value not in `RepertoireStatus`, THE System SHALL produce a TypeScript compile error

---

### Requirement 3: Lesson Entry Form — Status Selection When Tagging

**User Story:** As a teacher, I want to choose a status for each repertoire piece I tag in a lesson entry, so that the student's progress tree accurately reflects where they are with each piece.

#### Acceptance Criteria

1. WHEN a teacher selects a repertoire catalog item in the Lesson_Entry_Form, THE Tag_Status_Selector SHALL be displayed alongside the selected tag with `introduced` as the default value
2. THE Tag_Status_Selector SHALL present exactly three options: `Introduced`, `In Progress`, and `Mastered`
3. WHEN a teacher changes the status in the Tag_Status_Selector, THE Lesson_Entry_Form SHALL update the in-memory tag's status to the selected value before the entry is saved
4. WHEN a teacher saves a Lesson_Entry containing repertoire tags, THE System SHALL persist each tag with the status value selected in the Tag_Status_Selector
5. WHEN a teacher tags a theory catalog item, THE System SHALL assign the status `completed` automatically and SHALL NOT display the Tag_Status_Selector for that item

---

### Requirement 4: Progress Tree — Display All Repertoire Statuses

**User Story:** As a teacher or student, I want the Progress Tree to show all tagged repertoire pieces regardless of status, so that I can see the full picture of a student's repertoire journey.

#### Acceptance Criteria

1. WHEN the Progress_Tree is rendered for a student, THE System SHALL display all `repertoire_tags` records for that student with status `introduced`, `in_progress`, or `mastered`
2. THE Progress_Tree SHALL render each Repertoire_Status with a distinct Status_Badge that is visually differentiated from the other two statuses by color, icon, or label
3. THE Progress_Tree SHALL render `introduced` items with a visual treatment that communicates a starting or new state (e.g., a neutral or grey badge)
4. THE Progress_Tree SHALL render `in_progress` items with a visual treatment that communicates active work (e.g., a yellow or amber badge)
5. THE Progress_Tree SHALL render `mastered` items with a visual treatment that communicates completion (e.g., the existing indigo badge)
6. THE Progress_Tree SHALL continue to display `completed` theory items with their existing visual treatment, unchanged
7. WHEN a student has repertoire tags across multiple statuses, THE Progress_Tree SHALL group or label items so that each status group is visually distinguishable from the others

---

### Requirement 5: Progress Tree — Inline Status Update by Teacher

**User Story:** As a teacher, I want to update the status of a repertoire piece directly from the Progress Tree, so that I can advance a student's status without creating a new lesson entry.

#### Acceptance Criteria

1. WHILE a teacher is viewing a student's Progress_Tree, THE System SHALL display a Tag_Status_Selector on each repertoire item
2. WHEN a teacher selects a new status in the Tag_Status_Selector on a Progress_Tree item, THE System SHALL update the `status` field of the corresponding `repertoire_tags` row in the database
3. WHEN the database update succeeds, THE Progress_Tree SHALL re-render the affected item with the new Status_Badge without a full page reload
4. IF the database update fails, THE System SHALL display an error message and SHALL revert the Tag_Status_Selector to the status value that was in place before the update attempt
5. WHILE a teacher is viewing a student's Progress_Tree, THE System SHALL NOT display the Tag_Status_Selector to users with the "student" role

---

### Requirement 6: Data Query — Progress Tree Fetches All Repertoire Statuses

**User Story:** As a developer, I want the Progress Tree data query to return all repertoire statuses, so that the UI has the data it needs to render the full status picture.

#### Acceptance Criteria

1. WHEN the Progress_Tree data is fetched for a student, THE System SHALL return all `repertoire_tags` rows for that student where the associated `catalog_item.type = 'repertoire'`, regardless of status value
2. WHEN the Progress_Tree data is fetched for a student, THE System SHALL return each repertoire tag's `id`, `status`, and the associated `catalog_item`'s `title` and `composer`
3. WHEN the Progress_Tree data is fetched for a student, THE System SHALL continue to return `completed` theory items separately, unchanged from the current behavior
4. THE System SHALL NOT return `repertoire_tags` rows belonging to other students in the Progress_Tree data query

---

### Requirement 7: RLS — Teachers May Update Tag Status

**User Story:** As a platform engineer, I want the Row-Level Security policy on `repertoire_tags` to permit teachers to update the status of tags on their own lesson entries, so that inline status updates from the Progress Tree are authorized at the database layer.

#### Acceptance Criteria

1. WHEN a teacher issues an UPDATE on a `repertoire_tags` row where the associated `lesson_entry.teacher_id = auth.uid()`, THE System SHALL permit the operation
2. WHEN a user with the "student" role issues an UPDATE on any `repertoire_tags` row, THE System SHALL reject the operation
3. THE existing INSERT and SELECT RLS policies on `repertoire_tags` SHALL remain unchanged

