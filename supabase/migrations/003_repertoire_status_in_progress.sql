-- Migration: 003_repertoire_status_in_progress.sql
-- Adds 'in_progress' to the repertoire_tags status CHECK constraint
-- and adds an UPDATE RLS policy for teachers.

-- Drop the existing status check constraint
ALTER TABLE public.repertoire_tags
  DROP CONSTRAINT IF EXISTS repertoire_tags_status_check;

-- Re-add the constraint with 'in_progress' included
ALTER TABLE public.repertoire_tags
  ADD CONSTRAINT repertoire_tags_status_check
    CHECK (status IN ('introduced', 'in_progress', 'mastered', 'completed'));

-- Add UPDATE RLS policy so teachers can update tags on their own lesson entries
CREATE POLICY "teachers_update_own_tags" ON public.repertoire_tags
  FOR UPDATE
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
