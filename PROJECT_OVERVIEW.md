# Coda — Conservatory Management Platform — Project Overview

> Repo is named `studio-architect`; the product is **Coda**. Live:
> coda-mu.vercel.app. Running change log in `STATUS.md`; demo path in
> `DEMO_SCRIPT.md`; operational runbook for the Supabase pause risk below.

## What it is
A **multi-role B2B SaaS platform for music conservatories** to track student
lesson progress: teachers manage a repertoire/theory/technique progress tree per
student, write rich-text lesson notes, assign work, and search a large music
catalog; students see their own progress. Built to feel *fast* and *real*, with a
serif/gold identity that reads like a premium product, not a CRUD app.

**Stack:** Next.js 14 (App Router) + TypeScript, **Supabase** (PostgreSQL +
Supabase Auth + Row-Level Security), **Tiptap** rich-text editor, Tailwind, Edge
middleware for role routing.

## Why the big decisions
- **Row-Level Security as the isolation boundary.** Teacher↔student data
  separation is enforced in the *database* (RLS policies) and again at Edge
  middleware via a JWT role claim — not just in app code. Rationale: for a B2B
  product handling multiple studios' student data, "the query physically cannot
  return another studio's rows" is a far stronger guarantee than an app-layer
  `if`. This was also the headline architecture bullet on the résumé.
- **PostgreSQL full-text search with GIN indexing** for the catalog (up to ~10k
  entries in <300ms) instead of a third-party search service — keeps everything in
  one Postgres, no extra infra, still fast.
- **JSONB for rich-text storage.** Tiptap documents serialize to JSONB for
  round-trippable structured storage (not brittle HTML strings) — you can query
  and re-render without lossy parsing.
- **Demo mode via RESTRICTIVE RLS** (migration 007). Demo users carry
  `is_demo: true` in their JWT and are *database-denied* writes, so the public
  demo can't be vandalized and never needs a code-path guard that might be missed.
  Failed writes surface a clean "Saving is disabled in demo mode," not a crash.
- **Self-freshening demo data.** `demo_refresh_dates()` (migration
  `20260705120000`) shifts every timestamp by a uniform day-delta so the newest
  lesson is always "yesterday," preserving relative spacing. pg_cron runs it
  weekly. Without this the dashboard read "0 active this week" — a dead product on
  stage.

## ⚠️ Operational risk (read before any demo)
Runs on **free-tier Supabase project `tdklgelnxkbfiouxnmsc`**, which **pauses
after ~7 days of API inactivity** — when paused, the project URL stops resolving
and login/demo die **everywhere, including the live site** (same URL is baked in).
It was found paused once (85 days idle) and killed the live demo. Restore via the
Management API (`POST /v1/projects/<ref>/restore`; CLI token in Windows Credential
Manager under `Supabase CLI:supabase`), ~2–4 min, data survives. pg_cron does NOT
prevent pausing — the trigger is *external* API inactivity. **Before any live
demo: check status and restore/keep-alive first.** Durable fix: upgrade to Pro for
the demo window, or an external weekly ping to a read endpoint.

## State
All flows browser-verified against production Supabase; clean production build.
Gold line-art motif identity (emojis removed), lived-in curriculum pacing seeded.
Local branch work not yet merged — live site runs an older build (works because
the backend was the part that had broken). Demo creds in `.env.local`
(teacher@coda-demo.app / student1@coda-demo.app).

## Where to look
- `STATUS.md` — full change log + the Supabase runbook in detail.
- `supabase/migrations/` — RLS policies, demo write-denial (007), date-refresh.
- `middleware.ts` — role-based routing.
