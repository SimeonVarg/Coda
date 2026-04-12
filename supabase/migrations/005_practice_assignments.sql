-- Migration: 005_practice_assignments.sql
-- Adds the practice_assignments table with indexes and RLS policies.

CREATE TABLE IF NOT EXISTS public.practice_assignments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_entry_id  uuid        NOT NULL REFERENCES public.lesson_entries (id) ON DELETE CASCADE,
  student_id       uuid        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  description      text        NOT NULL CHECK (length(trim(description)) > 0),
  due_date         date,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS practice_assignments_student_completed_idx
  ON public.practice_assignments (student_id, completed_at);

CREATE INDEX IF NOT EXISTS practice_assignments_lesson_entry_idx
  ON public.practice_assignments (lesson_entry_id);

ALTER TABLE public.practice_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can SELECT, INSERT, UPDATE, DELETE assignments on their own lesson entries
CREATE POLICY "teachers_all_own_assignments" ON public.practice_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_entries le
      WHERE le.id = lesson_entry_id
        AND le.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lesson_entries le
      WHERE le.id = lesson_entry_id
        AND le.teacher_id = auth.uid()
    )
  );

-- Students can SELECT their own assignments
CREATE POLICY "students_select_own_assignments" ON public.practice_assignments
  FOR SELECT
  USING (student_id = auth.uid());

-- Students can UPDATE only completed_at on their own assignments
CREATE POLICY "students_update_completed_at" ON public.practice_assignments
  FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Column-level grant: restrict UPDATE to completed_at for the authenticated role
REVOKE UPDATE ON public.practice_assignments FROM authenticated;
GRANT UPDATE (completed_at) ON public.practice_assignments TO authenticated;
