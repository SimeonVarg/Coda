# Bugfix Requirements Document

## Introduction

The conservatory visual theme spec introduced several visual regressions and incomplete implementations. This document covers five related issues: (1) the login page background symbols rendering as a single large connected eighth note instead of scattered individual symbols; (2) bold/strong text in the Tiptap editor becoming black and invisible against the dark background due to Tailwind `prose` class overrides; (3) the dashboard staff lines spanning the full page width like a divider instead of being a contained decorative element; (4) the scattered musical symbol background treatment existing only on the login page instead of all pages; and (5) the overall theme lacking cohesive, intentional musical design elements beyond color changes.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the login page renders the scattered background symbols THEN the system displays what appears to be a single large connected eighth note covering the whole screen instead of multiple distinct scattered symbols at varied positions and sizes

1.2 WHEN the EighthNoteBeam SVG component is rendered with `w-auto` and a height class THEN the system stretches the SVG to fill available width due to the `viewBox="0 0 80 80"` square aspect ratio combined with unconstrained width

1.3 WHEN the TrebleClef SVG component renders its unicode character `𝄞` via an SVG `<text>` element THEN the system may fail to display the glyph correctly because SVG text rendering of unicode musical symbols is font-dependent and unreliable across browsers

1.4 WHEN bold or strong text is typed in the Tiptap editor THEN the system renders it in black (inherited from Tailwind `prose` default typography styles) making it invisible against the dark `bg-studio-surface` background

1.5 WHEN the dashboard page renders THEN the system displays staff lines spanning the full page width between the heading and the student list, creating an unintended full-width divider appearance

1.6 WHEN any page other than the login page renders THEN the system shows no scattered musical symbol background decoration, leaving those pages visually bare compared to the login page

1.7 WHEN viewing the dashboard, progress, or lesson form pages THEN the system shows only color-changed elements without cohesive musical motifs or intentional decorative design elements, making the theme feel incomplete

### Expected Behavior (Correct)

2.1 WHEN the login page renders the scattered background symbols THEN the system SHALL display multiple distinct musical symbols (treble clefs, quarter notes, eighth note beams, waveforms) visibly scattered at their specified positions across the background

2.2 WHEN the EighthNoteBeam SVG component is rendered with a height class THEN the system SHALL constrain the width proportionally to the viewBox aspect ratio so the symbol appears as a compact, correctly-proportioned icon

2.3 WHEN the TrebleClef SVG component renders THEN the system SHALL display a recognizable treble clef shape using SVG path geometry rather than a unicode text glyph, ensuring consistent cross-browser rendering

2.4 WHEN bold or strong text is typed in the Tiptap editor THEN the system SHALL render it in a visible warm color (cream or gold from the studio palette) that is legible against the dark surface background

2.5 WHEN the dashboard page renders THEN the system SHALL display the staff lines as a contained decorative element with a fixed width, not stretching to fill the full page width

2.6 WHEN any page (dashboard, progress, lesson new, lesson edit) renders THEN the system SHALL display subtle scattered musical symbols in the background consistent with the login page treatment

2.7 WHEN viewing the dashboard, progress, and lesson form pages THEN the system SHALL include intentional musical motifs and decorative elements that create a cohesive conservatory-themed experience throughout the app

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the login form is submitted with valid credentials THEN the system SHALL CONTINUE TO authenticate the user and redirect to the dashboard

3.2 WHEN the login form is submitted with invalid credentials THEN the system SHALL CONTINUE TO display an error message in `text-studio-rose`

3.3 WHEN regular (non-bold) text is typed in the Tiptap editor THEN the system SHALL CONTINUE TO render it in `text-studio-text` warm body color

3.4 WHEN the Tiptap editor toolbar buttons are clicked THEN the system SHALL CONTINUE TO apply formatting (bold, italic, headings, lists) correctly

3.5 WHEN the dashboard page loads THEN the system SHALL CONTINUE TO display the student list with `bg-studio-surface rounded-2xl shadow-studio-glow` card styling and hover animations

3.6 WHEN a student card is clicked on the dashboard THEN the system SHALL CONTINUE TO navigate to the correct progress page

3.7 WHEN musical motif components receive an `opacity` prop THEN the system SHALL CONTINUE TO reflect that opacity value in the rendered SVG output

3.8 WHEN musical motif components are rendered THEN the system SHALL CONTINUE TO have `aria-hidden="true"` on the SVG element

3.9 WHEN the progress page renders THEN the system SHALL CONTINUE TO display the repertoire tree, profile header, and practice assignments sections correctly

3.10 WHEN lesson form pages render THEN the system SHALL CONTINUE TO function correctly for creating and editing lesson entries
