-- ============================================================
-- Migration 015: Student Self-Assessment & Reflection Portal
-- ============================================================

-- ----------------------------------------------------------------
-- 1. lesson_reflections
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_reflections (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_entry_id  uuid        NOT NULL REFERENCES public.lesson_entries(id) ON DELETE CASCADE,
  student_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  self_rating      smallint    NOT NULL CHECK (self_rating BETWEEN 1 AND 5),
  went_well        text        CHECK (length(trim(coalesce(went_well, ''))) <= 500),
  was_challenging  text        CHECK (length(trim(coalesce(was_challenging, ''))) <= 500),
  next_goal        text        CHECK (length(trim(coalesce(next_goal, ''))) <= 300),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_entry_id, student_id)
);

-- ----------------------------------------------------------------
-- 2. updated_at trigger (reuse pattern from student_profiles)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_reflection_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_reflection_updated ON public.lesson_reflections;
CREATE TRIGGER on_reflection_updated
  BEFORE UPDATE ON public.lesson_reflections
  FOR EACH ROW EXECUTE FUNCTION public.handle_reflection_updated_at();

-- ----------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.lesson_reflections ENABLE ROW LEVEL SECURITY;

-- Students: full access to their own reflections
CREATE POLICY "students_own_reflections" ON public.lesson_reflections
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Teachers: read reflections for their students
CREATE POLICY "teachers_read_student_reflections" ON public.lesson_reflections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_entries le
      WHERE le.id = lesson_entry_id AND le.teacher_id = auth.uid()
    )
  );
