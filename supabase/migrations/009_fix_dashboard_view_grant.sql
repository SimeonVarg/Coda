-- ============================================================
-- 009: Fix student_dashboard view — grant SELECT to authenticated
--      and add last_lesson_date within 7 days (streak) column.
-- ============================================================

-- Re-create view with an extra `has_recent_lesson` boolean
-- (true when the student had a lesson in the last 7 days).
CREATE OR REPLACE VIEW public.student_dashboard AS
SELECT
  p.id,
  p.full_name,
  p.teacher_id,
  MAX(le.created_at)                                          AS last_lesson_date,
  COUNT(le.id)::int                                           AS lesson_count,
  (MAX(le.created_at) >= now() - interval '7 days')::boolean AS has_recent_lesson
FROM public.profiles p
LEFT JOIN public.lesson_entries le ON le.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.teacher_id;

-- Grant SELECT to authenticated role (was missing in 008 — root cause of demo bug)
GRANT SELECT ON public.student_dashboard TO authenticated;
