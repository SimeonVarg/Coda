-- ============================================================
-- 008: Dashboard view + missing performance indexes
-- ============================================================

-- Performance indexes missing from initial schema
CREATE INDEX IF NOT EXISTS profiles_teacher_id_idx
  ON public.profiles (teacher_id);

CREATE INDEX IF NOT EXISTS lesson_entries_student_id_idx
  ON public.lesson_entries (student_id);

CREATE INDEX IF NOT EXISTS lesson_entries_teacher_id_idx
  ON public.lesson_entries (teacher_id);

CREATE INDEX IF NOT EXISTS repertoire_tags_lesson_entry_id_idx
  ON public.repertoire_tags (lesson_entry_id);

-- Dashboard view: collapses N+1 into a single query
CREATE OR REPLACE VIEW public.student_dashboard AS
SELECT
  p.id,
  p.full_name,
  p.teacher_id,
  MAX(le.created_at)       AS last_lesson_date,
  COUNT(le.id)::int        AS lesson_count
FROM public.profiles p
LEFT JOIN public.lesson_entries le ON le.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.teacher_id;
