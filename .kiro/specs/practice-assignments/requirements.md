# Requirements Document

## Introduction

Practice Assignments is a feature for Studio Architect that allows teachers to assign specific practice tasks to a student directly from within a lesson entry — for example, "Practice bars 1–16 of Für Elise, 20 minutes daily." Students see their active (incomplete) assignments on their Progress Tree page and can mark them as done. Teachers can view all assignments for a student, both active and completed.

The feature introduces a new `practice_assignments` table linked to both a `lesson_entry` and a `student`, with Row-Level Security ensuring teachers can create and read assignments for their own students, while students can only read their own assignments and update the `completed_at` field.

## Glossary

- **System**: The Studio Architect web application
- **Teacher**: An authenticated user with the "teacher" role who creates lesson entries and practice assignments
- **Student**: An authenticated user with the "student" role who views and completes practice assignments
- **Lesson_Entry**: A structured record created by a teacher containing rich-text notes and repertoire tags for a specific student session
- **Practice_Assignment**: A discrete practice task created by a teacher within a Lesson_Entry, containing a description, an optional due date, and a completion timestamp
- **Assignment_Form**: The UI section within the Lesson_Entry form where teachers compose and manage Practice_Assignments for the current entry
- **Progress_Page**: The student-facing view at `/progress/[studentId]` that displays the student's Progress Tree and active Practice_Assignments
- **Active_Assignment**: A Practice_Assignment whose `completed_at` value is NULL
- **Completed_Assignment**: A Practice_Assignment whose `completed_at` value is a non-NULL timestamp

---

## Requirements

### Requirement 1: Create Practice Assignments Within a Lesson Entry

**User Story:** As a teacher, I want to add one or more practice assignments to a lesson entry, so that students receive clear, structured practice tasks from each session.

#### Acceptance Criteria

1. WHEN a teacher is composing or editing a Lesson_Entry, THE Assignment_Form SHALL be present in the lesson entry form alongside the notes editor and repertoire tagging section
2. THE Assignment_Form SHALL allow the teacher to enter a plain-text description for each Practice_Assignment
3. THE Assignment_Form SHALL allow the teacher to optionally specify a due date for each Practice_Assignment
4. THE Assignment_Form SHALL allow the teacher to add multiple Practice_Assignments to a single Lesson_Entry
5. WHEN a teacher removes a Practice_Assignment from the Assignment_Form before saving, THE System SHALL exclude that assignment from the set persisted with the Lesson_Entry
6. WHEN a teacher saves a Lesson_Entry, THE System SHALL persist all Practice_Assignments in the Assignment_Form with the lesson_entry_id, student_id, description, optional due_date, and created_at timestamp
7. IF a teacher attempts to save a Practice_Assignment with an empty description, THEN THE System SHALL display a validation error and SHALL NOT persist that assignment

---

### Requirement 2: Display Active Assignments on the Student Progress Page

**User Story:** As a student, I want to see my current practice assignments on my progress page, so that I know what to work on between lessons.

#### Acceptance Criteria

1. WHEN a student navigates to their Progress_Page, THE System SHALL display all Active_Assignments for that student
2. THE Progress_Page SHALL display each Active_Assignment's description and, where a due date is present, the due date
3. THE Progress_Page SHALL visually distinguish the Active_Assignments section from the Progress_Tree repertoire section
4. WHILE the Active_Assignments are loading, THE Progress_Page SHALL display a loading indicator
5. IF a student has no Active_Assignments, THE Progress_Page SHALL display an empty-state message in the assignments section

---

### Requirement 3: Mark an Assignment as Completed

**User Story:** As a student, I want to mark a practice assignment as done, so that my teacher can see I have completed the task.

#### Acceptance Criteria

1. WHEN a student views an Active_Assignment on their Progress_Page, THE System SHALL provide a control to mark that assignment as done
2. WHEN a student marks an Active_Assignment as done, THE System SHALL set the `completed_at` timestamp on that Practice_Assignment to the current UTC time
3. WHEN a student marks an Active_Assignment as done, THE System SHALL remove that assignment from the Active_Assignments list on the Progress_Page without requiring a full page reload
4. IF the update to `completed_at` fails, THEN THE System SHALL display an error message and SHALL retain the assignment in the Active_Assignments list

---

### Requirement 4: Teacher View of All Assignments for a Student

**User Story:** As a teacher, I want to see all practice assignments — both active and completed — for a student, so that I can track their practice history.

#### Acceptance Criteria

1. WHEN a teacher navigates to a student's Progress_Page, THE System SHALL display both Active_Assignments and Completed_Assignments for that student
2. THE Progress_Page SHALL visually distinguish Active_Assignments from Completed_Assignments when viewed by a teacher
3. THE Progress_Page SHALL display each Completed_Assignment's description, due date (if set), and the date it was completed
4. THE Progress_Page SHALL display each assignment's source Lesson_Entry date so the teacher can trace which session it came from

---

### Requirement 5: Data Isolation via Row-Level Security

**User Story:** As a platform administrator, I want assignment data to be strictly scoped by role, so that students cannot read other students' assignments and cannot modify any field except their own completion status.

#### Acceptance Criteria

1. THE System SHALL enforce a Row-Level Security policy on the `practice_assignments` table so that a teacher can only SELECT, INSERT, and UPDATE assignments linked to lesson entries where `teacher_id = auth.uid()`
2. THE System SHALL enforce a Row-Level Security policy on the `practice_assignments` table so that a student can only SELECT assignments where `student_id = auth.uid()`
3. THE System SHALL enforce a Row-Level Security policy on the `practice_assignments` table so that a student can only UPDATE the `completed_at` column on assignments where `student_id = auth.uid()`
4. IF a student attempts to modify any column other than `completed_at` on a Practice_Assignment, THEN THE System SHALL reject the operation at the database layer

---

### Requirement 6: Assignment Persistence and Data Integrity

**User Story:** As a teacher, I want practice assignments to be reliably stored and retrievable, so that no assignment data is lost between sessions.

#### Acceptance Criteria

1. THE System SHALL store each Practice_Assignment with a unique `id` (UUID), `lesson_entry_id` (FK → `lesson_entries.id`), `student_id` (FK → `profiles.id`), `description` (non-empty text), `due_date` (nullable date), `completed_at` (nullable timestamptz), and `created_at` (timestamptz set by DB default)
2. WHEN a Lesson_Entry is deleted, THE System SHALL cascade-delete all Practice_Assignments linked to that Lesson_Entry
3. FOR ALL valid Practice_Assignment records, reading a record immediately after writing it SHALL return a record with identical field values (round-trip property)
4. WHEN a student's profile is deleted, THE System SHALL cascade-delete all Practice_Assignments where `student_id` matches that profile
