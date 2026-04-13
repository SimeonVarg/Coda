# Coda

**Lessons organized, progress in crescendo.**

Coda is a full-stack B2B SaaS platform for music conservatories. It gives private music teachers a structured digital workspace to manage students, log detailed lesson notes, track repertoire progress, assign practice tasks, and maintain student profiles — all behind a role-based access system that enforces data isolation from the browser down to the database row.

The app is built on Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (Auth + Postgres), and is wrapped in a dramatic conservatory-themed visual identity with custom music motifs, warm amber-gold design tokens, and expressive micro-animations.

---

## Authentication and Role-Based Access

Coda supports two user roles: **teacher** and **student**. Roles are stored in a `profiles` table and synced to the Supabase JWT via a PostgreSQL `AFTER INSERT` trigger that writes the role into `auth.users.raw_app_meta_data`. This means every authenticated request carries the user's role in the JWT payload without an extra database lookup.

Authentication is handled entirely by Supabase Auth. The login flow uses email/password credentials, and sessions are managed via HTTP-only cookies using the `@supabase/ssr` package. Both the Next.js middleware and the server-side Supabase client read cookies from the request, and the middleware refreshes sessions transparently on every request.

Route protection happens at two layers:

- **Next.js Middleware (Edge Runtime):** Intercepts every request before it reaches a page component. All routes under `/dashboard`, `/lessons`, `/progress`, `/catalog`, and `/students` require authentication — unauthenticated users are redirected to `/login`. Teacher-only routes (`/lessons/new`, `/lessons/[id]/edit`, `/catalog/new`, `/students/[studentId]/profile`) check the JWT role claim and redirect students to their own progress page with a 303 status.
- **Supabase Row-Level Security (RLS):** Every table has RLS enabled with policies scoped by `auth.uid()` and role. Even if the middleware were bypassed, the database itself enforces that teachers can only read/write their own students' data, and students can only read their own records.

When a logged-in user hits `/login`, the middleware detects the existing session and redirects them to the appropriate home page — `/dashboard` for teachers, `/progress/[userId]` for students.

---

## Teacher Dashboard

The dashboard at `/dashboard` is a server component that fetches all students assigned to the authenticated teacher, including each student's most recent lesson entry date. Students are rendered as interactive cards with hover lift animations and warm glow shadows. Each card links to the student's Progress Tree and includes a secondary link to the student's profile page.

The dashboard displays the teacher's role as a gold badge in the navigation bar. When no students are assigned, a music-themed empty state is shown. While data loads, a skeleton UI with warm-toned shimmer animations fills the page.

---

## Lesson Entry System

Teachers create and edit lesson entries at `/lessons/new` and `/lessons/[id]/edit`. The lesson entry form is a client component containing three sections:

### Rich-Text Editor (Tiptap)
Lesson notes are composed in a Notion-style rich-text editor powered by Tiptap (ProseMirror-based). The editor supports bold, italic, headings (levels 1–3), bullet lists, ordered lists, and list items. Content is serialized as Tiptap `JSONContent` — a recursive node tree stored as JSONB in PostgreSQL. This format is fully round-trippable: serializing then deserializing produces a structurally equivalent document with no data loss.

The editor's prose styles are overridden in `globals.css` to render correctly against the dark theme — bold text appears in cream, headings in cream, and body text in the warm studio-text color.

### Repertoire Catalog Search
A debounced search input queries the `GET /api/catalog/search` endpoint, which performs PostgreSQL full-text search using a generated `tsvector` column indexed with GIN. The search falls back to `ILIKE` for short queries. The system is designed to return results within 300ms for catalogs of up to 10,000 entries.

When a teacher selects a catalog item, it's added to the tag list. Repertoire items get a `TagStatusSelector` with three options — Introduced, In Progress, Mastered — defaulting to Introduced. Theory items are automatically assigned the "Completed" status with no selector shown.

### Practice Assignments
An `AssignmentForm` section lets teachers attach one or more practice tasks to the lesson entry. Each assignment has a plain-text description (required, validated against whitespace-only input) and an optional due date. Assignments are batch-inserted when the lesson is saved, linked to both the lesson entry and the student via foreign keys.

The form includes unsaved-changes detection — navigating away triggers a browser confirmation dialog. Validation errors focus the first invalid field. The save button shows an animated spinner during submission.

---

## Repertoire Catalog Management

Teachers can add new pieces and theory assignments to the shared catalog at `/catalog/new`. The form collects a title (required), type (repertoire or theory), and optional composer. Submissions POST to the `POST /api/catalog` route handler, which validates the session, checks the teacher role, validates the payload, and inserts via the Supabase client with RLS enforcement.

A dedicated RLS insert policy (`teachers_insert_catalog`) permits only teacher-role JWTs to insert rows. The `search_vector` generated column is populated automatically at insert time, so new items are immediately searchable without cache invalidation.

The navigation bar conditionally shows the "Add to Catalog" link only for teacher-role users.

---

## Progress Tree

The Progress Tree at `/progress/[studentId]` is the central view for tracking a student's musical journey. It's a server component that fetches data in parallel: the student's profile, all repertoire tags (across all statuses), completed theory items, lesson entry history, and practice assignments.

### Repertoire Status Lifecycle
Repertoire pieces move through three statuses: `introduced` → `in_progress` → `mastered`. Each status has a distinct visual badge with warm-palette colors. Items are grouped by status section in the Progress Tree. The database enforces valid statuses via a CHECK constraint on `repertoire_tags.status`.

Teachers can update a piece's status inline directly from the Progress Tree without creating a new lesson entry. The update is optimistic — the UI changes immediately, and if the Supabase UPDATE fails, the selector reverts and an error message appears. An RLS UPDATE policy ensures only the teacher who owns the lesson entry can modify its tags.

Students see the same Progress Tree but without the status selector controls — enforced both in the UI (role prop) and at the database layer (RLS rejects student UPDATE operations).

### Theory Items
Theory assignments carry a fixed "Completed" status and are displayed in their own section with emerald-toned badges.

### Staggered Entrance Animation
When the Progress Tree renders, repertoire items animate in with a `fade-up` keyframe (opacity 0→1, translateY 20px→0) staggered at 80ms per item via inline `animationDelay` styles. This respects `prefers-reduced-motion` via a global CSS media query that zeroes all animation and transition durations.

---

## Student Profiles

Each student has a profile storing grade level, instrument, and long-term goals in a dedicated `student_profiles` table with a one-to-one relationship to `profiles` (enforced by making `student_id` both the primary key and a foreign key with `ON DELETE CASCADE`).

Teachers edit profiles at `/students/[studentId]/profile` using a form that upserts via a Next.js Server Action (`INSERT ... ON CONFLICT DO UPDATE`). The `updated_at` column is maintained by a PostgreSQL trigger. The goals textarea has a 500-character limit with a live character counter.

The profile data surfaces as a read-only `ProfileHeader` at the top of the Progress Tree page. When no profile exists, a placeholder message is shown. RLS policies ensure only the assigned teacher can write, and only the teacher or the student themselves can read.

The server component verifies the student is assigned to the requesting teacher — accessing an unassigned student's profile returns a 404 via Next.js `notFound()`.

---

## Practice Assignments

Practice assignments live in a `practice_assignments` table linked to both `lesson_entries` (via cascade delete) and `profiles` (via cascade delete). Each assignment has a non-empty description (enforced by a CHECK constraint), an optional due date, and a nullable `completed_at` timestamp.

### Student View
Students see their active (incomplete) assignments on the Progress Page. Each assignment shows its description and due date (if set), with a "Mark done" button. Marking an assignment done triggers an optimistic UI update — the item fades out immediately, and a Supabase UPDATE sets `completed_at` to the current UTC time. If the update fails, the item reappears with an error message.

### Teacher View
Teachers see all assignments — active and completed — in separate visual sections. Completed assignments show the completion date and the source lesson entry date for traceability.

### Column-Level Security
A column-level `GRANT` restricts the `authenticated` role to updating only the `completed_at` column on `practice_assignments`. Combined with RLS policies that scope by `student_id = auth.uid()`, this ensures students can only mark their own assignments done and cannot modify descriptions, due dates, or any other field.

---

## Conservatory Visual Theme

The entire app is wrapped in a dramatic dark-luxurious visual identity. The theme is implemented purely in the presentation layer — no data model or routing changes.

### Design Token System
All colors, shadows, fonts, and animation timings are defined as semantic Tailwind tokens in `tailwind.config.ts`:

| Token | Value | Purpose |
|-------|-------|---------|
| `studio-bg` | `#0d0a07` | Near-black warm background |
| `studio-surface` | `#1c1610` | Card/panel surfaces |
| `studio-rim` | `#2a1f12` | Borders and dividers |
| `studio-primary` | `#c8922a` | Rich amber gold for primary actions |
| `studio-gold` | `#e8b84b` | Bright gold accent highlights |
| `studio-cream` | `#f5ead6` | Luminous cream for headings |
| `studio-text` | `#c9b99a` | Warm body text |
| `studio-muted` | `#7a6a52` | Muted warm gray |
| `studio-rose` | `#c0614a` | Warm error tone |
| `studio-glow` | amber box-shadow | Cards appear lit from within |
| `studio-glow-lg` | deeper amber shadow | Hover/focus emphasis |

### Typography
Two fonts loaded via `next/font/google` with `display: swap`:
- **Cormorant Garamond** (serif) — page headings, rendered at `text-4xl` or larger with `tracking-wide` for dramatic presence
- **Inter** (humanist sans-serif) — body text, labels, and UI controls

### Music Motif Component Library
Five inline SVG React components in `components/motifs/`:
- **TrebleClef** — treble clef glyph rendered as SVG path geometry (not unicode text) for cross-browser consistency
- **StaffLines** — five horizontal staff lines
- **QuarterNote** — filled note head with stem
- **EighthNoteBeam** — two eighth notes connected by a beam
- **Waveform** — abstract sine-wave path

Each component accepts `className`, `opacity` (0–1), and `color` props. All include `aria-hidden="true"` and `focusable="false"` for accessibility. Motifs are used at high opacity (0.4–0.8) as hero design elements on the login page and dashboard header, and at low opacity (0.05–0.12) as subtle background accents scattered across all pages via a shared `MusicBackground` component.

### Motion System
- `fade-up`: opacity 0→1 + translateY 20px→0 over 450ms
- `shimmer`: background-position sweep for skeleton loading states
- Card hover: translateY -4px to -6px + deepened glow shadow over 250ms
- Button hover: translateY -2px + shadow increase over 150ms
- `@media (prefers-reduced-motion: reduce)` zeroes all animation and transition durations globally

### Component-Level Styling
- Shared `.studio-input` class for all form inputs (dark surface, gold border, cream text, gold focus ring)
- Shared `.studio-btn-primary` class for submit buttons (gold background, dark text, hover lift)
- Shared `.studio-btn-ghost` class for secondary actions (gold outline, hover fill)
- Skeleton loading states use warm-toned shimmer gradients (`studio-rim` → `studio-surface` → `studio-rim`)
- Spinner component uses `studio-gold` color

### Login Page
Full-viewport dark background with a large semi-transparent TrebleClef as a hero element. The heading renders in `text-5xl font-display text-studio-cream tracking-wide` with an atmospheric tagline beneath. The form card floats with `studio-glow` shadow against the dark background. The sign-in button lifts on hover with an amplified glow. Errors display in `studio-rose` instead of generic red.

---

## App Polish and UX

### Loading States
Every data-fetching page has a skeleton fallback via Next.js `Suspense` boundaries. The dashboard shows 3–5 shimmer card placeholders. The progress page shows skeleton sections for the profile header, repertoire tree, and lesson notes.

### Error Handling
- Page-level errors use Next.js `error.tsx` boundaries with "Try again" buttons
- Form submission errors display inline banners above the submit button without clearing user input
- Optimistic update failures revert the UI and show inline error messages near the affected item
- All error messages use `role="alert"` for screen reader announcement
- Error text is specific and human-readable rather than generic

### Empty States
A reusable `EmptyState` component with music-themed icons and warm-toned text is used across the dashboard (no students), progress tree (no repertoire, no theory, no lessons), assignment list (no active assignments), and catalog search (no results — includes the search query in the message).

### Navigation
- NavBar displays the user's role as a styled badge
- Active navigation link indicated by gold underline and gold text color
- Breadcrumb links on sub-pages ("← Back to students", "← Back to [student name]")
- Each page sets a descriptive HTML `<title>` including "Coda"

### Form UX
- Validation errors focus the first invalid field
- Success confirmations auto-dismiss after 3 seconds
- Character count on the goals textarea (500 max)
- Auto-focus on the catalog form title input
- Unsaved changes warning on the lesson entry form
- Due date inputs have placeholder hints

### Responsive Design
- NavBar collapses action links on viewports under 640px
- Dashboard cards stack vertically on narrow screens
- Tag lists wrap without horizontal scroll
- All touch targets are at least 44×44 CSS pixels on mobile
- Primary form buttons go full-width on small viewports

### Accessibility
- All interactive elements have visible keyboard focus rings
- All form inputs have associated `<label>` elements via `htmlFor`/`id`
- Icon-only buttons have `aria-label` attributes
- Page landmark structure uses `<main>`, `<nav>`, and `<section>` elements
- Status badges include text labels alongside color
- Dynamic content changes use ARIA live regions (`role="status"`, `role="alert"`)
- Music motif SVGs are marked `aria-hidden="true"`
- `prefers-reduced-motion` is respected globally

---

## Database Schema

Five tables across five incremental SQL migrations, all with Row-Level Security enabled:

| Table | Purpose | Key Constraints |
|-------|---------|----------------|
| `profiles` | User identity and role | `CHECK (role IN ('teacher', 'student'))`, self-referencing `teacher_id` FK |
| `lesson_entries` | Lesson session records | JSONB `content` column for Tiptap rich text, cascade delete on teacher/student |
| `catalog_items` | Shared repertoire and theory catalog | Generated `tsvector` column with GIN index for full-text search |
| `repertoire_tags` | Links catalog items to lesson entries with status | `CHECK (status IN ('introduced', 'in_progress', 'mastered', 'completed'))` |
| `student_profiles` | Per-student grade, instrument, goals | One-to-one via PK = FK, `updated_at` trigger, cascade delete |
| `practice_assignments` | Practice tasks linked to lessons | `CHECK (length(trim(description)) > 0)`, column-level UPDATE grant, cascade delete from both lesson entries and profiles |

RLS policies enforce:
- Teachers read/write only their own students' data (verified via `teacher_id = auth.uid()` or JOIN to `lesson_entries`)
- Students read only their own data (`student_id = auth.uid()`)
- Catalog items are readable by all authenticated users, insertable only by teachers
- Practice assignment updates by students are restricted to the `completed_at` column via column-level `GRANT`

A database trigger (`handle_new_profile`) syncs the role from `profiles` into `auth.users.raw_app_meta_data` on profile creation, so the JWT carries the role claim without an extra query.

---

## Testing

The project uses Vitest with `@testing-library/react` for component tests and `fast-check` for property-based testing. Property-based tests run a minimum of 100 iterations each and cover:

- Rich-text content round-trip integrity (serialize → deserialize produces equivalent document)
- Middleware role enforcement across arbitrary route paths and role combinations
- Form data preservation on failed submissions
- Tag add/remove round-trip identity
- Status badge visual distinctness across all status values
- Assignment add/remove round-trip identity
- Whitespace-only input rejection
- Character count accuracy
- Stagger animation delay proportionality
- Music motif accessibility attributes and opacity prop reflection
- RLS access rules across teacher/student/unrelated-teacher triples
- Progress tree data isolation between students

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS with `@tailwindcss/typography` plugin |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth with JWT role claims |
| SSR Auth | `@supabase/ssr` for cookie-based session handling |
| Rich Text | Tiptap (ProseMirror-based) with extensions for bold, italic, headings, bullet lists, ordered lists |
| Font Loading | `next/font/google` (Cormorant Garamond, Inter) |
| Testing | Vitest, @testing-library/react, fast-check |
| Deployment | Vercel |
