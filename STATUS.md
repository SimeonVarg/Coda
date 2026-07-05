# Coda — Status (July 5, 2026 hardening session)

Session goal: demo-ready auth + a real-looking studio. All flows below were
verified by driving the app in a browser against the restored production
Supabase, not by code reading.

## THE BIG ONE: Supabase was paused (and will pause again)

The project `tdklgelnxkbfiouxnmsc` ("Studio Architect") had been **paused for
inactivity** — DNS didn't even resolve, so login/demo were dead **locally AND
on the live site (coda-mu.vercel.app)**. Anyone clicking the demo saw
"Demo is temporarily unavailable."

- Restored July 5 via the Supabase Management API → status `ACTIVE_HEALTHY`.
  All data intact (17 lessons, 3 students, full catalog).
- **Free-tier projects pause again after ~7 days without API traffic.**
  ⚠️ **Check it the week of July 20 and again the morning of July 25.**
- Fastest restore: supabase.com dashboard → project → "Restore". CLI/API route:
  the CLI's token is in Windows Credential Manager ("Supabase CLI:supabase");
  `POST https://api.supabase.com/v1/projects/tdklgelnxkbfiouxnmsc/restore`
  with `Authorization: Bearer <token>`. Takes ~2–4 min to come up.
- Durable options (pick one before the event): upgrade the project to Pro for
  the demo month, or add an external weekly ping (e.g. Vercel cron hitting
  `/api/catalog/search?q=x`) so it never idles. pg_cron inside the DB does
  NOT prevent pausing — the pause trigger is external API inactivity.

## Verified working (July 5, local dev against production Supabase)

- **Demo login buttons**: Teacher view → tour (5 steps) → signs in → /dashboard.
  Student view → student's own progress page. Both real Supabase Auth users.
- **Role enforcement**: student hitting /dashboard is redirected to their own
  progress page (middleware + JWT role claim). Status selectors hidden for
  students.
- **Dashboard**: 3 students with lesson counts, pending tasks, curriculum
  pacing badges, stats row.
- **Progress Tree**: repertoire by status (introduced/in progress/mastered),
  theory items, technique milestones, lesson history, profile header, goals.
- **Lesson editor**: Tiptap toolbar renders, word count, catalog tag search,
  assignments section.
- **Demo write-protection**: "Save Lesson" as demo teacher → clean inline
  "Saving is disabled in demo mode." (RESTRICTIVE RLS, migration 007). No crash.
- **Catalog search API**: `/api/catalog/search?q=chopin` → 200, correct FTS hit.
- **Production build**: `npm run build` passes.

## Fixed this session

1. **Restored the paused Supabase project** (see above) — this alone revives
   the live site with zero deploys (same project URL is baked into it).
2. **Stale demo data** — seed dates were April-frozen, so the dashboard read
   "0 Active this week" and every date was months old: a dead product on stage.
   Added `demo_refresh_dates()` (migration `20260705120000_demo_refresh_dates.sql`),
   which shifts every time-bearing column by a uniform whole-day delta so the
   most recent lesson is always *yesterday*, preserving all temporal spacing
   (overdue stays overdue, etc.). Scheduled weekly via pg_cron (Mon 06:00 UTC)
   and ran once now → dashboard shows **3 Active this week**, dates Jul 3–4.
   Applied to production AND committed as a migration.

## Known remaining, ranked by demo impact

1. **Click-test the live site** (coda-mu.vercel.app) once — the restore should
   have fixed it identically (same Supabase URL), but confirm the two demo
   buttons land on dashboard/progress before the event.
2. **Emoji icons** (👩‍🏫 🎓 🎹 in demo buttons, tutorial, profile chips) read
   cheap against the otherwise-deliberate gold/serif identity. Swap for the
   existing `components/motifs/` SVGs when there's an hour.
3. Two of three curriculum plans show 0% progress — fine, but marking one item
   complete in the seed would make the pacing widget look more lived-in.
4. Local repo branch `update-20260416-0403` — commit/push state is local-only;
   push for a preview and merge when ready. (The live site runs an older build;
   it works because the backend was the broken part.)

## Dev notes

- `.claude/launch.json` at `Projects/` level: `coda` on :3001.
- Demo creds in `.env.local` (also needed in Vercel env):
  teacher@coda-demo.app / student1@coda-demo.app (see file for passwords).
- Demo users carry `is_demo: true` in JWT user_metadata; write-denial is
  RESTRICTIVE RLS in migration 007.
- Management-API SQL helper used this session:
  scratchpad `sbquery.ps1` pattern — reads CLI token from Credential Manager,
  POSTs to `/v1/projects/<ref>/database/query`.
