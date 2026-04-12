# Requirements Document

## Introduction

The Student Profile Goals feature extends Studio Architect with a dedicated student profile page where teachers can record each student's current grade level, instrument, and long-term goals. This structured profile data is then surfaced as a summary header at the top of the student's Progress Tree, giving both teachers and students immediate context when reviewing progress. The feature requires a new `student_profiles` table in Supabase and a new teacher-editable page at `/students/[studentId]/profile`.

## Glossary

- **System**: The Studio Architect web application
- **Teacher**: An authenticated user with the "teacher" role who manages students and creates lesson entries
- **Student**: An authenticated user with the "student" role who can view their own progress data
- **Student_Profile**: A record storing a student's grade level, instrument, and long-term goals, linked one-to-one with a student's entry in the `profiles` table
- **Profile_Page**: The teacher-facing page at `/students/[studentId]/profile` used to view and edit a Student_Profile
- **Progress_Tree**: The existing visual representation of a student's mastered repertoire and completed theory assignments, located at `/progress/[studentId]`
- **Profile_Header**: The summary section rendered at the top of the Progress_Tree page displaying the student's grade level, instrument, and goals
- **Grade_Level**: A free-text field describing the student's current examination grade (e.g., "RCM Grade 3", "ABRSM Grade 5")
- **Instrument**: A free-text field naming the student's primary instrument (e.g., "Piano", "Violin")
- **Goals**: A free-text area describing the student's long-term musical goals as set by the teacher
- **Middleware**: The Next.js route protection layer that enforces role-based access control

---

## Requirements

### Requirement 1: Student Profile Data Storage

**User Story:** As a platform architect, I want student profile data (grade level, instrument, and goals) stored in a dedicated table, so that the schema remains clean and the data can be queried independently of authentication profiles.

#### Acceptance Criteria

1. THE System SHALL maintain a `student_profiles` table with columns for `student_id` (uuid, FK → `profiles.id`), `grade_level` (text), `instrument` (text), `goals` (text), `updated_at` (timestamptz), and `updated_by` (uuid, FK → `profiles.id`)
2. THE `student_profiles` table SHALL enforce a one-to-one relationship between a student and their profile record via a unique constraint on `student_id`
3. WHEN a `student_profiles` row is inserted or updated, THE System SHALL automatically set `updated_at` to the current timestamp
4. THE System SHALL enable Row-Level Security on the `student_profiles` table so that only the student's assigned teacher can write profile data, and only the teacher or the student themselves can read it

---

### Requirement 2: Teacher Can Edit a Student's Profile

**User Story:** As a teacher, I want to open a dedicated profile page for any of my students and set their grade level, instrument, and goals, so that I can keep their learning context up to date.

#### Acceptance Criteria

1. WHEN a teacher navigates to `/students/[studentId]/profile`, THE System SHALL display a form pre-populated with the student's existing `grade_level`, `instrument`, and `goals` values (or empty fields if no profile record exists yet)
2. THE Profile_Page SHALL provide a text input for `grade_level`, a text input for `instrument`, and a multi-line text area for `goals`
3. WHEN a teacher submits the profile form with at least one non-empty field, THE System SHALL upsert the `student_profiles` record and display a success confirmation
4. WHEN a teacher submits the profile form with all fields empty, THE System SHALL display a validation error and SHALL NOT persist the record
5. THE Middleware SHALL restrict `/students/[studentId]/profile` to users with the "teacher" role
6. WHEN a user with the "student" role attempts to access `/students/[studentId]/profile`, THE Middleware SHALL return a 403 response and redirect the user to their own Progress_Tree view
7. WHEN a teacher attempts to access the Profile_Page for a student not assigned to them, THE System SHALL return a 404 response

---

### Requirement 3: Profile Header on the Progress Tree

**User Story:** As a teacher or student, I want to see the student's grade level, instrument, and goals at the top of the Progress Tree page, so that I have immediate context when reviewing progress.

#### Acceptance Criteria

1. WHEN a teacher or student navigates to the Progress_Tree page, THE System SHALL render a Profile_Header above the progress content displaying the student's `grade_level`, `instrument`, and `goals`
2. IF a student has no `student_profiles` record, THE Profile_Header SHALL render a placeholder indicating that no profile has been set yet
3. THE Profile_Header SHALL display the `grade_level`, `instrument`, and `goals` fields as read-only text — neither teachers nor students can edit profile data directly from the Progress_Tree page
4. WHEN the Progress_Tree page is loading, THE System SHALL display a loading indicator that covers both the Profile_Header and the progress content

---

### Requirement 4: Student Can View Their Own Profile

**User Story:** As a student, I want to view my own grade level, instrument, and goals, so that I understand what my teacher has set for me.

#### Acceptance Criteria

1. WHEN a student navigates to their own Progress_Tree, THE System SHALL display their Profile_Header with the current `grade_level`, `instrument`, and `goals` values
2. THE System SHALL NOT provide students with any UI control to edit `grade_level`, `instrument`, or `goals`
3. WHEN a student attempts to directly access `/students/[studentId]/profile` via URL, THE Middleware SHALL redirect the student to their own Progress_Tree view

---

### Requirement 5: Teacher Dashboard Link to Profile Page

**User Story:** As a teacher, I want a quick link from the student list on my dashboard to each student's profile page, so that I can update profile details without navigating manually.

#### Acceptance Criteria

1. WHEN a teacher views the Dashboard, THE System SHALL display a link or button for each student that navigates to that student's Profile_Page at `/students/[studentId]/profile`
2. THE Dashboard SHALL continue to display each student's full name and most recent lesson date alongside the profile link

---

### Requirement 6: Profile Data Round-Trip Integrity

**User Story:** As a teacher, I want the profile data I save to be retrieved exactly as I entered it, so that the student's context is always accurate.

#### Acceptance Criteria

1. FOR ALL valid Student_Profile records, saving then retrieving the record SHALL return `grade_level`, `instrument`, and `goals` values identical to those that were submitted (round-trip property)
2. WHEN a teacher updates an existing Student_Profile, THE System SHALL overwrite only the fields included in the submission and SHALL preserve the `student_id` foreign key
3. WHEN a `student_profiles` record is retrieved for display in the Profile_Header, THE System SHALL return the most recently saved values for all three fields
