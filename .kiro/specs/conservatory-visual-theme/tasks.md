# Tasks: Conservatory Visual Theme

## Task List

- [x] 1. Extend Tailwind config with design tokens
  - [x] 1.1 Add Warm_Palette color tokens (studio-bg, studio-surface, studio-rim, studio-primary, studio-gold, studio-cream, studio-text, studio-muted, studio-rose) to tailwind.config.ts
  - [x] 1.2 Add studio-glow and studio-glow-lg boxShadow tokens
  - [x] 1.3 Add transitionDuration tokens (fast: 150ms, base: 250ms, slow: 450ms)
  - [x] 1.4 Add fade-up and shimmer keyframes and animation tokens
  - [x] 1.5 Add font-display and font-body fontFamily tokens referencing CSS variables

- [x] 2. Update globals.css with base styles and keyframes
  - [x] 2.1 Set body background to studio-bg and text to studio-text in @layer base
  - [x] 2.2 Define .studio-input, .studio-btn-primary, .studio-btn-ghost shared component classes in @layer components
  - [x] 2.3 Add @media (prefers-reduced-motion: reduce) block zeroing all animation and transition durations

- [x] 3. Update layout.tsx with font loading and body class
  - [x] 3.1 Import Cormorant_Garamond and Inter from next/font/google with CSS variable configuration
  - [x] 3.2 Apply font variable classes to <html> element and bg-studio-bg to <body>

- [x] 4. Create Music Motif SVG components
  - [x] 4.1 Create components/motifs/TrebleClef.tsx — inline SVG, aria-hidden, opacity/color props
  - [x] 4.2 Create components/motifs/StaffLines.tsx — 5 horizontal lines SVG, aria-hidden, opacity/color props
  - [x] 4.3 Create components/motifs/QuarterNote.tsx — filled note head + stem SVG, aria-hidden, opacity/color props
  - [x] 4.4 Create components/motifs/EighthNoteBeam.tsx — two eighth notes with beam SVG, aria-hidden, opacity/color props
  - [x] 4.5 Create components/motifs/Waveform.tsx — abstract sine-wave path SVG, aria-hidden, opacity/color props
  - [x] 4.6 Create components/motifs/index.ts barrel export

- [x] 5. Restyle NavBar component
  - [x] 5.1 Replace bg-white with bg-studio-bg and add border-b border-studio-primary/30
  - [x] 5.2 Update wordmark to font-display text-xl text-studio-cream
  - [x] 5.3 Update active link style to border-b-2 border-studio-gold text-studio-gold
  - [x] 5.4 Update hover link transition to text-studio-gold within 150ms
  - [x] 5.5 Add StaffLines motif at opacity-30 in the nav right area
  - [x] 5.6 Update role badge to use studio-gold text with dark background

- [x] 6. Restyle Login page
  - [x] 6.1 Replace bg-gray-50 with bg-studio-bg on main element
  - [x] 6.2 Add TrebleClef motif as absolute hero element at opacity-60
  - [x] 6.3 Update heading to font-display text-5xl text-studio-cream tracking-wide
  - [x] 6.4 Add atmospheric tagline in text-studio-muted
  - [x] 6.5 Update form card to bg-studio-surface shadow-studio-glow
  - [x] 6.6 Update submit button to bg-studio-primary with hover lift and studio-glow-lg shadow
  - [x] 6.7 Update error display from text-red-600 to text-studio-rose
  - [x] 6.8 Update input fields to use .studio-input class

- [x] 7. Restyle Dashboard page
  - [x] 7.1 Replace bg-white with bg-studio-bg on main element
  - [x] 7.2 Update heading to font-display text-4xl text-studio-cream
  - [x] 7.3 Add EighthNoteBeam and StaffLines motifs in the header area at opacity-50
  - [x] 7.4 Update student row cards to bg-studio-surface rounded-2xl shadow-studio-glow
  - [x] 7.5 Add hover lift effect (hover:-translate-y-1 hover:shadow-studio-glow-lg transition-all) to student cards
  - [x] 7.6 Update EmptyState usage to pass music-themed icon and warm-toned text

- [x] 8. Restyle Progress page
  - [x] 8.1 Replace bg-white with bg-studio-bg on main element
  - [x] 8.2 Update heading to font-display text-4xl text-studio-cream
  - [x] 8.3 Update "New Lesson" button to bg-studio-primary with hover lift effect
  - [x] 8.4 Update repertoire status badges to use warm-palette tokens per status (introduced/developing/performance-ready)
  - [x] 8.5 Apply animate-fade-up with 80ms stagger (inline animationDelay) to repertoire list items
  - [x] 8.6 Update ProfileHeader card to bg-studio-surface shadow-studio-glow

- [x] 9. Restyle form pages and shared form components
  - [x] 9.1 Update LessonEntryForm inputs and buttons to use .studio-input, .studio-btn-primary, .studio-btn-ghost
  - [x] 9.2 Update CatalogItemForm inputs and buttons to use shared form classes
  - [x] 9.3 Update ProfileForm inputs and buttons to use shared form classes
  - [x] 9.4 Update lesson new/edit page backgrounds to bg-studio-bg

- [x] 10. Update loading skeleton and Spinner components
  - [x] 10.1 Update Spinner to use text-studio-gold
  - [x] 10.2 Update dashboard/loading.tsx skeleton cards to use animate-shimmer with warm-toned bg-studio-rim placeholder
  - [x] 10.3 Update progress/loading.tsx skeleton rows to use animate-shimmer with warm-toned placeholder

- [x] 11. Update EmptyState component
  - [x] 11.1 Replace text-gray-500 with text-studio-muted
  - [x] 11.2 Add inline music note SVG icon above the message text
  - [x] 11.3 Update action link color from text-indigo-600 to text-studio-primary

- [x] 12. Write property-based and smoke tests
  - [x] 12.1 Write Property 1 test: active nav link has gold classes for any matching route
  - [x] 12.2 Write Property 2 test: error display uses text-studio-rose for any error string
  - [x] 12.3 Write Property 3 test: student cards have required styling classes for any non-empty student list
  - [x] 12.4 Write Property 4 test: status badge class is status-specific for any valid status value
  - [x] 12.5 Write Property 5 test: stagger animation delay equals index * 80ms for any list length
  - [x] 12.6 Write Property 6 test: motif SVGs have aria-hidden and reflect opacity prop for any motif type and opacity
  - [x] 12.7 Write smoke test: tailwind config exports all required token keys
