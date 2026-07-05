# Coda — 60-second demo script

**Prep:** confirm Supabase project is ACTIVE (see STATUS.md — it pauses when
idle!). Open coda-mu.vercel.app/login in a fresh profile. If you've seen the
tour on this browser, the demo buttons sign in instantly — do a dry run so you
know which behavior you'll get.

| Time | Do | Say |
|------|----|-----|
| 0–8s | Login page is up. Gesture at it. | "Coda is studio management for private music teachers — think Notion meets a conservatory gradebook. Real product, live right now." |
| 8–18s | Click **Teacher view**. If the tour appears, click through two cards, then **Start exploring**. | "One click gets you a sandboxed teacher account — real Supabase auth, and row-level security keeps demo users read-only at the database layer, not just the UI." |
| 18–30s | On the dashboard, point at the stats row, then a student card. | "Ms. Vasquez runs three students. Lesson counts, pending practice tasks, curriculum pacing — 'at risk' surfaces before a recital sneaks up on you." |
| 30–45s | Click **Liam Chen** → scroll the Progress Tree slowly. | "Every piece moves introduced → in progress → mastered. Theory, technique milestones, five months of lesson history — this is the longitudinal record teachers keep in their heads today." |
| 45–55s | Click **+ New Lesson**. Type a sentence in the editor, click a catalog tag. | "Rich lesson notes, repertoire tagged from a searchable catalog, practice assignments with due dates the student sees on their side." |
| 55–60s | Click **Switch to Student** in the demo banner. | "And the student sees exactly their own data and nothing else — same database, RLS does the isolation. Two-sided from day one." |

**If asked "why B2B music?"** — "70k+ independent music teachers in the US
alone, nearly all on paper or generic spreadsheets. I'm a percussionist —
I built the tool my own teachers didn't have."

**Recovery moves**
- Demo button errors out → the Supabase project idled; nothing to do live —
  pivot to screenshots/video and say "cold-start on the free tier" honestly.
  (Prevent this: check STATUS.md the morning of.)
- Save blocked message appears → that's the feature: "the demo account is
  database-level read-only — RLS, not an if-statement."
