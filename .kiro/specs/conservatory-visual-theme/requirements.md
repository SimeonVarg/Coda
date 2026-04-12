# Requirements Document

## Introduction

Studio Architect is a music conservatory studio management app built with Next.js and Tailwind CSS. The app is currently functional but visually bare — a plain white/gray/indigo prototype with no personality. This feature transforms the app into a dramatic, music-themed experience that feels like stepping into a world-class conservatory. The goal is "skin and shine": the data model and routing stay intact, but every surface gets a bold, cohesive visual identity, expressive motion, and music-inspired character. The result should feel like a grand concert hall — deeply atmospheric, genuinely luxurious, and unmistakably handcrafted.

## Glossary

- **Theme_System**: The global design token layer (colors, typography, spacing, shadows) defined in Tailwind config and globals.css
- **NavBar**: The top navigation component rendered on every authenticated page
- **Dashboard**: The teacher's student list page at `/dashboard`
- **Progress_Page**: The per-student progress tree page at `/progress/[studentId]`
- **Login_Page**: The unauthenticated sign-in page at `/login`
- **Motion_Layer**: CSS transitions and keyframe animations applied to interactive and decorative elements
- **Music_Motif**: A decorative visual element drawn from music iconography (staff lines, note shapes, clef curves, waveforms)
- **Warm_Palette**: The app's primary color system — deep true-black warm brown, rich amber gold, burnished mahogany, and luminous cream tones
- **Card**: Any rounded surface used to group related content (student rows, profile blocks, lesson entries)
- **Catalog_Page**: The repertoire catalog entry form at `/catalog/new`
- **Lesson_Form**: The lesson entry form at `/lessons/new` and `/lessons/[id]/edit`

---

## Requirements

### Requirement 1: Global Design Token System

**User Story:** As a developer, I want a single source of truth for colors, typography, and spacing, so that the visual theme is consistent across every page without per-component overrides.

#### Acceptance Criteria

1. THE Theme_System SHALL define a Warm_Palette with at minimum: a true-black warm background tone (no lighter than `#0d0a07`), a rich amber/gold primary tone (saturated, not muted — e.g. `#c8922a` or richer), a luminous cream/ivory surface tone, a warm-toned body text color, and a bright gold accent highlight.
2. THE Theme_System SHALL extend the Tailwind config with named semantic tokens (`studio-bg`, `studio-surface`, `studio-primary`, `studio-accent`, `studio-text`, `studio-gold`) so components reference tokens rather than raw color values.
3. THE Theme_System SHALL define a primary serif typeface for headings and a clean humanist sans-serif for body text, loaded via Next.js font optimization.
4. THE Theme_System SHALL apply the near-black background color to the root `<body>` element so no white flash appears on any page.
5. THE Theme_System SHALL define a `studio-glow` shadow token — a warm amber/gold box-shadow — used to make Cards appear lit from within rather than merely elevated.
6. WHEN a new page or component is added, THE Theme_System SHALL provide sufficient tokens that the new surface can be styled consistently without introducing new raw hex values.

---

### Requirement 2: NavBar Visual Identity

**User Story:** As a user, I want the navigation bar to feel like the entrance hall of a premium concert venue, so that I immediately understand the character of the product on every page.

#### Acceptance Criteria

1. THE NavBar SHALL use the near-black Warm_Palette background with a visible bottom border in a warm gold tone, creating a clear separation from page content.
2. THE NavBar SHALL display the "Studio Architect" wordmark in the primary serif heading font at no smaller than `text-xl`, rendered in a luminous gold or cream color.
3. THE NavBar SHALL include at least one prominent Music_Motif (e.g. a treble clef glyph or a staff-line rule) rendered at sufficient opacity to be clearly visible as a design element, not merely a faint hint.
4. WHEN a navigation link matches the current route, THE NavBar SHALL indicate the active state using a warm gold underline of at least 2px and a gold text color, not just a font-weight change.
5. WHEN the user hovers over a navigation link, THE Motion_Layer SHALL apply a smooth color transition to gold within 150ms.
6. THE NavBar SHALL remain legible and functional at viewport widths from 320px to 1440px.

---

### Requirement 3: Login Page Atmosphere

**User Story:** As a new or returning user, I want the login page to feel like entering a grand concert hall lobby, so that the product makes an unforgettable first impression before I even sign in.

#### Acceptance Criteria

1. THE Login_Page SHALL use the near-black Warm_Palette background — deep, rich, and luxurious — rather than any light or neutral tone.
2. THE Login_Page SHALL display at least one large, prominent Music_Motif as a hero design element (e.g. a large semi-transparent treble clef spanning the full viewport height, or dramatic staff lines crossing the background) that is clearly visible and intentional, not a faint watermark.
3. THE Login_Page SHALL render the "Studio Architect" heading in the primary serif font at no smaller than `text-5xl` on desktop, creating a dramatic hero moment above the form.
4. THE Login_Page form card SHALL use the cream/ivory surface token with the `studio-glow` warm shadow, making the card appear to float and glow against the dark background.
5. THE Login_Page SHALL include a brief atmospheric tagline or subtitle beneath the heading, rendered in a warm muted gold tone, to reinforce the conservatory identity.
6. WHEN the sign-in button is in its default state, THE Login_Page SHALL render it using the studio-primary gold token with sufficient contrast against the card surface.
7. WHEN the sign-in button is hovered, THE Motion_Layer SHALL apply a pronounced lift effect (translateY of -3px, shadow increase to `studio-glow`) within 150ms.
8. IF the sign-in form returns an error, THEN THE Login_Page SHALL display the error in a warm rose/amber tone rather than plain `text-red-600`.

---

### Requirement 4: Dashboard Warmth and Student Cards

**User Story:** As a teacher, I want my student list to feel like a curated roster in a distinguished conservatory, so that the dashboard feels like a professional and inspiring workspace.

#### Acceptance Criteria

1. THE Dashboard SHALL use the near-black Warm_Palette background and warm surface tokens throughout, with no white or light-gray surfaces.
2. THE Dashboard SHALL render each student as a Card with a warm dark-surface color, rounded corners of at least `rounded-2xl`, and the `studio-glow` shadow so each card appears lit from within.
3. WHEN a student Card is hovered, THE Motion_Layer SHALL apply a pronounced lift (translateY of -4px to -6px), a deepened `studio-glow` shadow, and a subtle gold border highlight, all within 200ms.
4. THE Dashboard SHALL display a prominent Music_Motif in the page header area — large enough to read as a deliberate design element (e.g. a staff-line rule with note glyphs at full decorative opacity, or a large waveform behind the heading).
5. THE Dashboard heading "My Students" SHALL be rendered in the primary serif font at no smaller than `text-4xl` with a luminous cream or gold color.
6. WHEN the student list is empty, THE Dashboard SHALL render the EmptyState component with a music-themed illustration or icon and warm-toned text rather than plain gray.
7. THE Dashboard SHALL display the teacher role badge using the studio-gold accent token with a dark background, making it feel like a premium label rather than a plain chip.

---

### Requirement 5: Progress Page Visual Hierarchy

**User Story:** As a teacher or student, I want the progress tree page to feel like a beautifully illuminated musical score, so that reviewing repertoire and theory feels engaging and inspiring rather than clinical.

#### Acceptance Criteria

1. THE Progress_Page SHALL use the near-black Warm_Palette background and warm surface tokens throughout, with no white or light-gray surfaces.
2. THE Progress_Page SHALL render the "Progress Tree" heading in the primary serif font at no smaller than `text-4xl` with a luminous cream or gold color.
3. THE Progress_Page SHALL visually distinguish repertoire items from theory items using richly color-coded Cards with warm, saturated badge tones drawn from the Warm_Palette.
4. WHEN a repertoire status badge (introduced / developing / performance-ready) is displayed, THE Progress_Page SHALL use deeply distinct warm color tokens for each status — not generic gray/green/blue — so the progression feels meaningful and expressive.
5. THE Progress_Page ProfileHeader block SHALL use a warm dark-surface Card style with the `studio-glow` shadow, consistent with the rest of the Warm_Palette.
6. THE Progress_Page "New Lesson" button SHALL use the studio-primary gold token and the Motion_Layer pronounced lift effect on hover.
7. WHEN the Progress_Page loads its data, THE Motion_Layer SHALL apply a staggered entrance animation to the list of repertoire items — each item sliding up from 20px below and fading in — with a stagger delay of 80ms per item, so the list assembles with presence.

---

### Requirement 6: Form Pages Consistency

**User Story:** As a teacher, I want lesson entry, catalog, and profile forms to share the same dramatic warm visual language as the rest of the app, so that data entry feels like part of the same cohesive experience.

#### Acceptance Criteria

1. THE Lesson_Form SHALL use the near-black Warm_Palette background and warm surface tokens rather than plain white.
2. THE Catalog_Page SHALL use the near-black Warm_Palette background and warm surface tokens rather than plain white.
3. THE Theme_System SHALL define a shared form input style using the studio-surface token for backgrounds, a warm gold border color at reduced opacity, and cream text — applied consistently to all `<input>`, `<select>`, and `<textarea>` elements.
4. WHEN a form input receives focus, THE Motion_Layer SHALL apply a warm gold focus ring (using studio-gold) with a subtle glow effect, replacing the default `ring-indigo-500`.
5. THE Theme_System SHALL define a shared primary button style using studio-primary gold with the Motion_Layer pronounced lift effect, applied consistently to all primary submit buttons.
6. THE Theme_System SHALL define a shared secondary/ghost button style using a warm gold outline variant with a hover fill, applied consistently to cancel and secondary actions.

---

### Requirement 7: Motion Layer — Micro-interactions

**User Story:** As a user, I want animations throughout the app that feel deliberate and expressive, so that interactions feel alive and the app has genuine presence.

#### Acceptance Criteria

1. THE Motion_Layer SHALL define a standard set of transition durations: `fast` (150ms), `base` (250ms), and `slow` (400–500ms) as Tailwind config extensions.
2. THE Motion_Layer SHALL define a `fade-up` keyframe animation that transitions opacity from 0 to 1 and translateY from 20px to 0, giving entrance animations noticeable travel distance and presence.
3. THE Motion_Layer SHALL define a `shimmer` keyframe animation suitable for skeleton loading states.
4. WHEN a Card element is hovered, THE Motion_Layer SHALL apply a pronounced lift effect (translateY -4px to -6px, deepened `studio-glow` shadow) using the `base` duration.
5. WHEN a primary button is hovered, THE Motion_Layer SHALL apply a lift effect (translateY -3px, shadow increase) using the `fast` duration.
6. WHEN a page's main content list renders for the first time, THE Motion_Layer SHALL apply the `fade-up` animation to list items with a stagger delay of 80ms per item, so the list assembles with clear visual presence.
7. WHERE a user has enabled the operating system "reduce motion" preference, THE Motion_Layer SHALL disable all keyframe animations and reduce transition durations to 0ms.

---

### Requirement 8: Music Motif Decorative System

**User Story:** As a user, I want music-themed decorative elements woven intentionally into the UI, so that the app feels authentically connected to the world of music — with some motifs as prominent design statements, not just faint hints.

#### Acceptance Criteria

1. THE Theme_System SHALL provide a library of reusable Music_Motif SVG components including at minimum: a treble clef, a set of staff lines, a quarter note, a beam of eighth notes, and an abstract waveform.
2. THE Music_Motif components SHALL accept opacity and color props so they can serve as both prominent hero accents (opacity 0.4–0.8) and subtle background elements (opacity 0.05–0.12).
3. THE Music_Motif components SHALL be purely decorative and SHALL include `aria-hidden="true"` so screen readers ignore them.
4. WHEN a Music_Motif is used as a background watermark, THE Theme_System SHALL render it at an opacity of 0.05 to 0.12 so it does not reduce text contrast below WCAG AA thresholds for the overlaid text.
5. WHEN a Music_Motif is used as a prominent design element (e.g. on the Login_Page hero or Dashboard header), THE Theme_System SHALL render it at an opacity of 0.4 or higher so it reads as a deliberate visual statement.
6. THE NavBar, Login_Page, and Dashboard SHALL each incorporate at least one Music_Motif element as specified in their respective requirements.
7. THE Music_Motif components SHALL be implemented as inline SVG React components rather than external image files, so they inherit CSS color values and scale without pixelation.

---

### Requirement 9: Typography Scale

**User Story:** As a user, I want a bold and beautiful typographic hierarchy, so that headings feel like performance titles and the overall reading experience feels distinguished.

#### Acceptance Criteria

1. THE Theme_System SHALL configure a high-contrast serif font (e.g. Playfair Display, Cormorant Garamond, or similar) as `font-display` for all page headings (h1, h2), chosen for its dramatic letterforms.
2. THE Theme_System SHALL configure a humanist sans-serif font (e.g. Inter, DM Sans, or similar) as `font-body` for all body text, labels, and UI controls.
3. THE Theme_System SHALL define a type scale where page-level h1 headings use at minimum `text-4xl` (desktop), section h2 headings use at minimum `text-2xl`, and body text uses `text-sm` or `text-base`.
4. THE Theme_System SHALL set a default line-height of at least 1.6 for body text to ensure comfortable reading of lesson notes and goals.
5. WHEN headings are rendered on dark backgrounds, THE Theme_System SHALL apply a luminous cream or gold text color — not generic `text-white` or `text-gray-100` — to reinforce the warm palette.
6. THE Theme_System SHALL apply generous letter-spacing (`tracking-wide` or wider) to h1 headings to enhance their dramatic presence.

---

### Requirement 10: Skeleton Loading States

**User Story:** As a user, I want loading states to feel polished and on-brand, so that waiting for data doesn't break the visual experience.

#### Acceptance Criteria

1. THE Dashboard loading state SHALL render skeleton Cards using the `shimmer` animation defined in the Motion_Layer, with warm-toned placeholder surfaces that match the dark background — not generic `bg-gray-200`.
2. THE Progress_Page loading state SHALL render skeleton rows for repertoire items using the `shimmer` animation with warm-toned placeholder colors.
3. WHEN skeleton elements are rendered, THE Theme_System SHALL use a warm dark-surface placeholder color (e.g. a muted warm-brown) so the loading state feels like part of the same dark, luxurious environment.
4. THE Spinner component SHALL be updated to use the studio-gold token color so it glows warmly against the dark background rather than appearing as a generic gray or indigo spinner.
