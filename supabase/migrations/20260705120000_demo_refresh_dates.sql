-- ============================================================
-- Migration: demo_refresh_dates
-- Demo data is seeded with relative dates that go stale as time
-- passes ("0 active this week" on the dashboard kills the demo).
-- This function shifts every time-bearing column forward by a
-- uniform whole-day delta so the most recent lesson is always
-- "yesterday", preserving all inter-record temporal spacing.
-- A weekly pg_cron job keeps the demo perpetually fresh.
-- ============================================================

create or replace function public.demo_refresh_dates()
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  shift_days integer;
begin
  select (current_date - 1) - max(created_at)::date
    into shift_days
    from lesson_entries;

  if shift_days is null or shift_days <= 0 then
    return;
  end if;

  update lesson_entries
     set created_at = created_at + make_interval(days => shift_days);

  update practice_assignments
     set created_at   = created_at + make_interval(days => shift_days),
         completed_at = completed_at + make_interval(days => shift_days),
         due_date     = due_date + shift_days;

  update curriculum_plans
     set created_at  = created_at + make_interval(days => shift_days),
         target_date = target_date + shift_days;

  update curriculum_plan_items
     set created_at   = created_at + make_interval(days => shift_days),
         completed_at = completed_at + make_interval(days => shift_days),
         target_date  = target_date + shift_days;

  update lesson_reflections
     set created_at = created_at + make_interval(days => shift_days),
         updated_at = updated_at + make_interval(days => shift_days);

  update practice_journal_entries
     set created_at = created_at + make_interval(days => shift_days),
         entry_date = entry_date + shift_days;

  update student_milestones
     set created_at  = created_at + make_interval(days => shift_days),
         achieved_at = achieved_at + make_interval(days => shift_days);

  update student_profiles
     set updated_at = updated_at + make_interval(days => shift_days);
end
$fn$;

-- Keep the demo fresh automatically: every Monday 06:00 UTC.
create extension if not exists pg_cron;
select cron.schedule('demo-refresh-dates', '0 6 * * 1', 'select public.demo_refresh_dates()');
