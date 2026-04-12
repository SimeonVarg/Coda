# Requirements Document

## Introduction

This feature adds a catalog management UI to Studio Architect, allowing teachers to add new repertoire pieces and theory assignments to the shared catalog directly from the app. Currently, catalog items can only be inserted via SQL. The feature introduces a teacher-only admin page with a form, a new Supabase RLS insert policy scoped to the teacher role, and a server-side API route to handle the insert securely.

## Glossary

- **System**: The Studio Architect web application
- **Teacher**: An authenticated user with the "teacher" role
- **Student**: An authenticated user with the "student" role
- **Catalog_Item**: A record in the `catalog_items` table representing a musical piece (type: `repertoire`) or a theory assignment (type: `theory`)
- **Catalog_Admin_Page**: The teacher-only page at `/catalog/new` that provides a form for adding Catalog_Items
- **Catalog_Form**: The UI form on the Catalog_Admin_Page used to submit new Catalog_Item data
- **Catalog_API**: The Next.js Route Handler at `POST /api/catalog` that validates and persists new Catalog_Items
- **Middleware**: The Next.js route protection layer that enforces role-based access control
- **RLS_Policy**: A Supabase Row-Level Security policy that controls which database operations a user may perform

---

## Requirements

### Requirement 1: Teacher-Only Access to Catalog Management

**User Story:** As a platform administrator, I want only teachers to be able to add catalog items, so that the shared catalog remains curated and students cannot modify it.

#### Acceptance Criteria

1. THE Middleware SHALL restrict the `/catalog/new` route to users with the "teacher" role
2. WHEN a user with the "student" role attempts to access `/catalog/new`, THE Middleware SHALL return a 403 response and redirect the user to their own progress view
3. WHEN an unauthenticated user attempts to access `/catalog/new`, THE Middleware SHALL redirect the user to the login page
4. THE Catalog_API SHALL reject any insert request that does not originate from an authenticated session with the "teacher" role

---

### Requirement 2: Add Catalog Item Form

**User Story:** As a teacher, I want a form to add new pieces and theory assignments to the catalog, so that I can keep the repertoire list up to date without needing database access.

#### Acceptance Criteria

1. WHEN a teacher navigates to `/catalog/new`, THE System SHALL render the Catalog_Admin_Page containing the Catalog_Form
2. THE Catalog_Form SHALL include a required text field for `title`, a required selector for `type` (values: `repertoire`, `theory`), and an optional text field for `composer`
3. WHEN a teacher selects `theory` as the type, THE Catalog_Form SHALL allow the `composer` field to remain empty without treating it as a validation error
4. WHEN a teacher selects `repertoire` as the type, THE Catalog_Form SHALL display the `composer` field as recommended but not required
5. WHEN a teacher submits the Catalog_Form with a missing or empty `title`, THE System SHALL display a validation error and SHALL NOT submit the form to the Catalog_API
6. WHEN a teacher submits the Catalog_Form with a missing or empty `type`, THE System SHALL display a validation error and SHALL NOT submit the form to the Catalog_API

---

### Requirement 3: Catalog Item Persistence

**User Story:** As a teacher, I want submitted catalog items to be saved to the database, so that they are immediately available for tagging in lesson entries.

#### Acceptance Criteria

1. WHEN a teacher submits a valid Catalog_Form, THE Catalog_API SHALL insert a new row into the `catalog_items` table containing the provided `title`, `type`, and `composer` values
2. WHEN a Catalog_Item is successfully inserted, THE System SHALL generate a unique UUID for the new item's `id` field
3. WHEN a Catalog_Item is successfully inserted, THE System SHALL return a success response and THE Catalog_Admin_Page SHALL display a confirmation message to the teacher
4. WHEN a Catalog_Item is successfully inserted, THE Catalog_Form SHALL reset to its empty default state so the teacher can add another item without reloading the page
5. IF the database insert fails, THE Catalog_API SHALL return an error response and THE Catalog_Admin_Page SHALL display a descriptive error message without clearing the form data

---

### Requirement 4: RLS Policy for Teacher Inserts

**User Story:** As a platform administrator, I want the database to enforce that only teachers can insert catalog items, so that security is maintained at the data layer independent of the application layer.

#### Acceptance Criteria

1. THE RLS_Policy SHALL permit authenticated users with the "teacher" role to insert rows into the `catalog_items` table
2. THE RLS_Policy SHALL deny insert operations on `catalog_items` to authenticated users with the "student" role
3. THE RLS_Policy SHALL deny insert operations on `catalog_items` to unauthenticated requests
4. WHILE the existing `authenticated_read_catalog` RLS_Policy is in effect, THE System SHALL continue to allow all authenticated users to read `catalog_items` after the new insert policy is added

---

### Requirement 5: Newly Added Items Available in Catalog Search

**User Story:** As a teacher, I want items I add to the catalog to be immediately searchable in the lesson entry form, so that I can tag them in the same session.

#### Acceptance Criteria

1. WHEN a Catalog_Item is successfully inserted, THE System SHALL make it available in the `GET /api/catalog/search` endpoint without requiring a cache flush or application restart
2. WHEN a teacher searches the Repertoire_Catalog after adding a new item, THE System SHALL return the new item in results matching its `title` or `composer` within 300ms for catalogs of up to 10,000 entries
3. THE System SHALL generate the `search_vector` column for newly inserted Catalog_Items automatically via the existing generated column definition

---

### Requirement 6: Navigation to Catalog Admin Page

**User Story:** As a teacher, I want a way to reach the catalog management page from within the app, so that I do not need to remember or manually type the URL.

#### Acceptance Criteria

1. WHEN a teacher is authenticated, THE System SHALL display a navigation link to `/catalog/new` in the application navigation
2. WHEN a user with the "student" role is authenticated, THE System SHALL NOT display the navigation link to `/catalog/new`
