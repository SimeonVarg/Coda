# Requirements Document

## Introduction

Studio Architect is a B2B SaaS platform for music conservatories built on Next.js, Tailwind CSS, and Supabase. The platform enables teachers to manage their students, track musical progress through a visual "Progress Tree," and create structured lesson entries with rich-text notes and repertoire tags. Students can view their own progress. Access is role-based: teachers have full write access while students have read-only access to their own data.

## Glossary

- **System**: The Studio Architect web application
- **Teacher**: An authenticated user with the "teacher" role who manages students and creates lesson entries
- **Student**: An authenticated user with the "student" role who can view their own progress data
- **Dashboard**: The teacher's home view listing all of their active students
- **Progress_Tree**: A visual representation of a student's mastered repertoire and completed theory assignments
- **Lesson_Entry**: A structured record created by a teacher containing rich-text notes and repertoire tags for a specific student session
- **Repertoire_Catalog**: The system-managed collection of musical pieces and theory assignments available for tagging in lesson entries
- **Repertoire_Tag**: A reference to a specific item in the Repertoire_Catalog attached to a Lesson_Entry
- **Rich_Text_Editor**: The Notion-style in-app editor component used to compose Lesson_Entry notes
- **Middleware**: The Next.js route protection layer that enforces role-based access control
- **Supabase_Auth**: The authentication and session management service provided by Supabase

---

## Requirements

### Requirement 1: Authentication and Role Management

**User Story:** As a conservatory staff member, I want to log in with a defined role, so that the system grants me access appropriate to my responsibilities.

#### Acceptance Criteria

1. THE Supabase_Auth SHALL support two distinct roles: "teacher" and "student"
2. WHEN a user submits valid credentials, THE Supabase_Auth SHALL create an authenticated session containing the user's role
3. WHEN a user submits invalid credentials, THE System SHALL display an error message and SHALL NOT create a session
4. WHEN an authenticated session expires, THE System SHALL redirect the user to the login page
5. THE Middleware SHALL protect all routes under `/dashboard` and `/lessons` so that only authenticated users can access them
6. WHEN an unauthenticated user attempts to access a protected route, THE Middleware SHALL redirect the user to the login page

---

### Requirement 2: Route-Level Authorization for Teachers

**User Story:** As a platform administrator, I want only teachers to create or modify lesson entries and assignments, so that student data integrity is maintained.

#### Acceptance Criteria

1. THE Middleware SHALL restrict all routes under `/lessons/new` and `/lessons/[id]/edit` to users with the "teacher" role
2. WHEN a user with the "student" role attempts to access a teacher-only route, THE Middleware SHALL return a 403 response and redirect the user to their own progress view
3. WHEN a user with the "teacher" role accesses a protected teacher route, THE Middleware SHALL allow the request to proceed

---

### Requirement 3: Teacher Dashboard

**User Story:** As a teacher, I want to see a dashboard of my active students, so that I can quickly navigate to any student's progress.

#### Acceptance Criteria

1. WHEN a teacher authenticates and navigates to `/dashboard`, THE System SHALL display a list of all students assigned to that teacher
2. THE Dashboard SHALL display each student's full name and the date of their most recent Lesson_Entry
3. WHEN a teacher clicks a student entry on the Dashboard, THE System SHALL navigate to that student's Progress_Tree view
4. WHILE the student list is loading, THE Dashboard SHALL display a loading indicator
5. IF the teacher has no assigned students, THE Dashboard SHALL display an empty-state message

---

### Requirement 4: Student Progress Tree

**User Story:** As a teacher, I want to view a student's Progress Tree, so that I can see their mastered repertoire and completed theory assignments at a glance.

#### Acceptance Criteria

1. WHEN a teacher navigates to a student's Progress_Tree, THE System SHALL display all Repertoire_Tags marked as "mastered" for that student
2. WHEN a teacher navigates to a student's Progress_Tree, THE System SHALL display all theory assignments marked as "completed" for that student
3. THE Progress_Tree SHALL visually distinguish between "mastered" repertoire items and "completed" theory assignments
4. WHEN a student authenticates and navigates to their own Progress_Tree, THE System SHALL display the same mastered and completed items
5. WHILE the Progress_Tree data is loading, THE System SHALL display a loading indicator
6. IF a student has no mastered repertoire or completed assignments, THE Progress_Tree SHALL display an empty-state message

---

### Requirement 5: Lesson Entry Creation

**User Story:** As a teacher, I want to create a Lesson Entry for a student, so that I can record session notes and tag the repertoire covered.

#### Acceptance Criteria

1. WHEN a teacher initiates a new Lesson_Entry, THE System SHALL present the Rich_Text_Editor for composing notes
2. THE Rich_Text_Editor SHALL support at minimum: bold, italic, bullet lists, numbered lists, and headings
3. WHEN a teacher saves a Lesson_Entry, THE System SHALL persist the entry with the teacher's ID, the student's ID, the rich-text note content, the creation timestamp, and all selected Repertoire_Tags
4. WHEN a teacher saves a Lesson_Entry with no note content and no Repertoire_Tags, THE System SHALL display a validation error and SHALL NOT persist the entry
5. WHEN a Lesson_Entry is successfully saved, THE System SHALL navigate the teacher back to the student's Progress_Tree view

---

### Requirement 6: Repertoire Tagging

**User Story:** As a teacher, I want to tag specific pieces from the repertoire catalog in a lesson entry, so that the student's progress tree reflects what was covered.

#### Acceptance Criteria

1. WHEN a teacher is composing a Lesson_Entry, THE System SHALL provide a searchable interface to browse the Repertoire_Catalog
2. WHEN a teacher searches the Repertoire_Catalog, THE System SHALL return matching items within 300ms for catalogs of up to 10,000 entries
3. WHEN a teacher selects a Repertoire_Catalog item, THE System SHALL attach it as a Repertoire_Tag to the current Lesson_Entry
4. WHEN a teacher removes a Repertoire_Tag before saving, THE System SHALL detach the tag from the current Lesson_Entry
5. WHEN a Lesson_Entry containing a Repertoire_Tag is saved, THE System SHALL update the student's Progress_Tree to reflect the newly tagged item

---

### Requirement 7: Lesson Entry Persistence and Round-Trip Integrity

**User Story:** As a teacher, I want saved lesson entries to be retrievable exactly as I wrote them, so that historical records are accurate.

#### Acceptance Criteria

1. WHEN a saved Lesson_Entry is retrieved, THE System SHALL return the rich-text note content in the same structured format in which it was stored
2. FOR ALL valid Lesson_Entry objects, serializing then deserializing the rich-text content SHALL produce an equivalent document (round-trip property)
3. WHEN a teacher views a previously saved Lesson_Entry, THE Rich_Text_Editor SHALL render the stored content without data loss or corruption
