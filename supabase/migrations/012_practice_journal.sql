-- ============================================================
-- Migration 012: Practice Journal & Metronome Log
-- ============================================================

-- ----------------------------------------------------------------
-- 1. practice_journal_entries
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_journal_entries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date   date        NOT NULL DEFAULT CURRENT_DATE,
  duration_min integer     NOT NULL CHECK (duration_min BETWEEN 1 AND 300),
  mood         smallint    NOT NULL CHECK (mood BETWEEN 1 AND 5),
  notes        text        CHECK (length(trim(coalesce(notes, ''))) <= 1000),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. practice_metronome_logs
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_metronome_logs (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid    NOT NULL REFERENCES public.practice_journal_entries(id) ON DELETE CASCADE,
  catalog_item_id  uuid    NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  bpm_start        integer NOT NULL CHECK (bpm_start BETWEEN 20 AND 300),
  bpm_end          integer CHECK (bpm_end BETWEEN 20 AND 300),
  note             text    CHECK (length(trim(coalesce(note, ''))) <= 200)
);

-- ----------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.practice_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_metronome_logs  ENABLE ROW LEVEL SECURITY;

-- Students: full access to their own entries
CREATE POLICY "students_own_journal_entries" ON public.practice_journal_entries
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Teachers: read entries for their students
CREATE POLICY "teachers_read_student_journal" ON public.practice_journal_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_id AND p.teacher_id = auth.uid()
    )
  );

-- Students: access metronome logs via their journal entries
CREATE POLICY "students_own_metronome_logs" ON public.practice_metronome_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_journal_entries pje
      WHERE pje.id = journal_entry_id AND pje.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.practice_journal_entries pje
      WHERE pje.id = journal_entry_id AND pje.student_id = auth.uid()
    )
  );

-- Teachers: read metronome logs for their students
CREATE POLICY "teachers_read_student_metronome_logs" ON public.practice_metronome_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_journal_entries pje
      JOIN public.profiles p ON p.id = pje.student_id
      WHERE pje.id = journal_entry_id AND p.teacher_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 4. Practice summary view
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.practice_summary_by_student AS
SELECT
  pje.student_id,
  COUNT(*)                                                                              AS total_sessions,
  SUM(pje.duration_min)                                                                 AS total_minutes,
  ROUND(AVG(pje.duration_min))                                                          AS avg_duration,
  SUM(CASE WHEN pje.entry_date >= CURRENT_DATE - 6 THEN pje.duration_min ELSE 0 END)   AS minutes_this_week
FROM public.practice_journal_entries pje
GROUP BY pje.student_id;
