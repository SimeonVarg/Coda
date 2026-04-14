-- ============================================================
-- 010: Add pending_assignments count to student_dashboard view
-- ============================================================

CREATE OR REPLACE VIEW public.student_dashboard AS
SELECT
  p.id,
  p.full_name,
  p.teacher_id,
  MAX(le.created_at)                                          AS last_lesson_date,
  COUNT(DISTINCT le.id)::int                                  AS lesson_count,
  (MAX(le.created_at) >= now() - interval '7 days')::boolean AS has_recent_lesson,
  COUNT(pa.id) FILTER (WHERE pa.completed_at IS NULL)::int    AS pending_assignments
FROM public.profiles p
LEFT JOIN public.lesson_entries le ON le.student_id = p.id
LEFT JOIN public.practice_assignments pa ON pa.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.teacher_id;

GRANT SELECT ON public.student_dashboard TO authenticated;

-- NOTE: CREATE OR REPLACE VIEW drops existing grants; the GRANT above must
-- always follow any view replacement to restore SELECT for authenticated users.
