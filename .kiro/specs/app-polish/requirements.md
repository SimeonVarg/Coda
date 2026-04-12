# Requirements Document

## Introduction

Studio Architect is a music studio management app used by teachers to track student progress, manage repertoire, log lesson notes, and assign practice work. While the core features are functional, the app needs a polish pass to improve visual consistency, UX quality, loading/error/empty states, navigation clarity, and overall feel. This spec covers the cross-cutting improvements that make the app feel finished and professional.

## Glossary

- **App**: The Studio Architect Next.js web application.
- **Teacher**: An authenticated user with the `teacher` role.
- **Student**: An authenticated user with the `student` role.
- **Dashboard**: The `/dashboard` page listing a teacher's students.
- **Progress Page**: The `/progress/[studentId]` page showing a student's repertoire, theory, lesson notes, and assignments.
- **Lesson Form**: The `/lessons/new` and `/lessons/[id]/edit` pages containing `LessonEntryForm`.
- **Catalog Form**: The `/catalog/new` page containing `CatalogItemForm`.
- **Profile Form**: The `/students/[studentId]/profile` page containing `ProfileForm`.
- **NavBar**: The top navigation bar rendered on every page.
- **Toast**: A transient, non-blocking notification that appears briefly and then disappears.
- **Skeleton**: A placeholder UI element that mimics the shape of content while it loads.
- **Empty State**: A purposeful UI shown when a list or section has no data.
- **Focus Ring**: A visible keyboard-focus indicator on interactive elements.

---

## Requirements

### Requirement 1: Consistent Visual Design System

**User Story:** As a user, I want the app to look visually consistent across all pages, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE App SHALL use a single, consistent typographic scale: `text-2xl font-semibold` for page titles, `text-lg font-semibold` for section headings, and `text-sm` for body and label text.
2. THE App SHALL use a consistent spacing rhythm: page containers SHALL use `px-6 py-10` padding and `max-w-3xl mx-auto` centering on all pages.
3. THE App SHALL use a consistent primary button style: `rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`.
4. THE App SHALL use a consistent secondary/cancel button style: `rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`.
5. THE App SHALL use a consistent text input style: `block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`.
6. THE App SHALL apply consistent card styling for list items: `rounded-lg border border-gray-100 bg-white p-4` with `hover:shadow-sm transition-shadow` where the card is interactive.

### Requirement 2: Loading States

**User Story:** As a user, I want to see meaningful loading indicators while data is being fetched, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN a page-level data fetch is in progress, THE App SHALL display a skeleton loading UI that matches the shape of the expected content.
2. THE Dashboard SHALL display a skeleton list of 3–5 placeholder student rows while `StudentList` is loading.
3. THE Progress Page SHALL display a skeleton that includes a profile header placeholder, a repertoire section placeholder, and a lesson notes placeholder while `ProgressContent` is loading.
4. WHEN a form submission is in progress, THE App SHALL disable the submit button and display a loading label (e.g. "Saving…") within the button.
5. WHEN the catalog search is fetching results, THE RepertoireCatalogSearch SHALL display a spinner adjacent to the search input.
6. THE App SHALL ensure no page shows a blank white screen for more than 200ms during a data fetch by using Next.js `Suspense` boundaries with skeleton fallbacks.

### Requirement 3: Error States

**User Story:** As a user, I want clear, actionable error messages when something goes wrong, so that I understand what happened and what I can do next.

#### Acceptance Criteria

1. WHEN a page-level data fetch fails, THE App SHALL display an inline error message with a "Try again" action that retries the fetch.
2. WHEN a form submission fails, THE App SHALL display an error banner above the form actions and SHALL NOT clear the user's entered data.
3. WHEN the catalog search fails, THE RepertoireCatalogSearch SHALL display an inline error message with a "Retry" button.
4. IF a network error occurs during an optimistic update (e.g. status change in ProgressTree or marking an assignment done), THEN THE App SHALL revert the UI to its previous state and display an inline error message near the affected item.
5. THE App SHALL ensure all error messages are associated with `role="alert"` so screen readers announce them.
6. WHEN an error message is displayed, THE App SHALL provide specific, human-readable text describing the failure rather than raw error codes or generic "Something went wrong" messages where the failure type is known.

### Requirement 4: Empty States

**User Story:** As a user, I want informative empty states when there is no data, so that I understand the current state and know what action to take next.

#### Acceptance Criteria

1. WHEN a teacher has no students assigned, THE Dashboard SHALL display an empty state with a descriptive message explaining that no students are assigned yet.
2. WHEN a student has no repertoire or theory items, THE Progress Page SHALL display an empty state in the repertoire section with a message indicating no items have been tagged yet.
3. WHEN a student has no lesson notes, THE Progress Page SHALL display an empty state in the lesson notes section with a message indicating no lessons have been recorded.
4. WHEN a student has no active practice assignments, THE Progress Page SHALL display an empty state in the assignments section with a message appropriate to the viewer's role.
5. WHEN the catalog search returns no results for a non-empty query, THE RepertoireCatalogSearch SHALL display a "No results found for '[query]'" message that includes the search term.
6. THE App SHALL ensure all empty state messages use a consistent style: `text-sm text-gray-500` with a brief explanatory sentence and, where applicable, a call-to-action link or button.

### Requirement 5: Navigation and Wayfinding

**User Story:** As a user, I want clear navigation cues so that I always know where I am in the app and can move between sections easily.

#### Acceptance Criteria

1. THE NavBar SHALL display the current user's role (Teacher or Student) as a small badge or label alongside the app name.
2. WHEN a Teacher is on the Progress Page, THE App SHALL display a "← Back to students" breadcrumb link that navigates to the Dashboard.
3. WHEN a Teacher is on the Lesson Form, THE App SHALL display a "← Back to [student name]" breadcrumb link that navigates to the student's Progress Page.
4. WHEN a Teacher is on the Profile Form, THE App SHALL display a "← Back to [student name]" breadcrumb link that navigates to the student's Progress Page.
5. THE NavBar SHALL highlight the active navigation link using a distinct visual treatment (e.g. `font-semibold text-indigo-700` vs. the default `text-indigo-600`).
6. THE App SHALL set the HTML `<title>` of each page to a descriptive value that includes the page name and "Studio Architect" (e.g. "My Students — Studio Architect", "Progress Tree — Studio Architect").

### Requirement 6: Form UX Refinements

**User Story:** As a teacher, I want forms to be easy to use and forgiving, so that I can enter data quickly without frustration.

#### Acceptance Criteria

1. WHEN a user submits a form with validation errors, THE App SHALL move keyboard focus to the first invalid field.
2. WHEN a form is successfully submitted, THE App SHALL display a success confirmation that is visible for at least 3 seconds before auto-dismissing or navigating away.
3. THE ProfileForm SHALL display a character count below the Goals textarea showing the current length against a 500-character maximum.
4. THE CatalogItemForm SHALL auto-focus the Title input when the page loads.
5. WHEN a user navigates away from the Lesson Form with unsaved changes, THE App SHALL display a browser confirmation dialog warning that unsaved changes will be lost.
6. THE AssignmentForm SHALL display a placeholder hint in the due date input (e.g. "Optional due date") when no date is selected.

### Requirement 7: Responsive Design

**User Story:** As a user accessing the app on a mobile device, I want the layout to adapt to smaller screens, so that I can use the app comfortably on any device.

#### Acceptance Criteria

1. THE NavBar SHALL collapse its action links into a compact layout on viewports narrower than 640px, ensuring no horizontal overflow.
2. THE Dashboard student list SHALL display student name and last lesson date stacked vertically on viewports narrower than 480px.
3. THE TagList component SHALL wrap tags onto multiple lines on narrow viewports and SHALL NOT cause horizontal scroll.
4. THE Lesson Form SHALL stack the rich-text editor, catalog search, and assignment form sections vertically with adequate spacing on viewports narrower than 640px.
5. THE App SHALL ensure all interactive touch targets are at least 44×44 CSS pixels on mobile viewports.
6. WHILE the viewport width is less than 640px, THE App SHALL use full-width buttons for primary form actions.

### Requirement 8: Accessibility

**User Story:** As a user who relies on keyboard navigation or assistive technology, I want the app to be navigable and understandable, so that I can use all features without a mouse.

#### Acceptance Criteria

1. THE App SHALL ensure all interactive elements (buttons, links, inputs, selects) have a visible Focus Ring when focused via keyboard.
2. THE App SHALL ensure all form inputs have an associated `<label>` element linked via `htmlFor`/`id`.
3. THE App SHALL ensure all icon-only buttons have an `aria-label` describing their action.
4. THE App SHALL ensure the page landmark structure includes exactly one `<main>` element per page, a `<nav>` for the NavBar, and appropriate `<section>` elements for major content regions.
5. THE App SHALL ensure color is not the sole means of conveying information (e.g. status badges SHALL include a text label in addition to color).
6. THE App SHALL ensure the color contrast ratio between text and its background meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
7. WHEN dynamic content changes (e.g. search results, error messages, success banners), THE App SHALL use appropriate ARIA live regions (`role="status"` or `role="alert"`) so screen readers announce the change.

### Requirement 9: Micro-interactions and Visual Feedback

**User Story:** As a user, I want subtle visual feedback when I interact with the app, so that the interface feels responsive and alive.

#### Acceptance Criteria

1. THE App SHALL apply `transition-colors` to all interactive elements that change color on hover or focus.
2. WHEN a Teacher changes a repertoire status via the TagStatusSelector on the Progress Page, THE App SHALL display a brief visual confirmation (e.g. a checkmark icon or a subtle highlight) on the updated item after a successful save.
3. WHEN a Student marks an assignment as done, THE App SHALL animate the item's transition from the active list to the completed state (e.g. a fade-out or slide-out lasting 200–300ms).
4. THE App SHALL apply `hover:shadow-sm` to clickable card items in the Dashboard student list and Progress Page lesson history.
5. WHEN a form submit button is in the loading state, THE App SHALL display an animated spinner icon alongside the loading label text.
