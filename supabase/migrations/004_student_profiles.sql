-- Migration: 004_student_profiles.sql
-- Adds the student_profiles table with trigger and RLS policies.

CREATE TABLE IF NOT EXISTS public.student_profiles (
  student_id   uuid        PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  grade_level  text,
  instrument   text,
  goals        text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid        REFERENCES public.profiles (id) ON DELETE SET NULL
);

-- Trigger to keep updated_at current on every insert/update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER student_profiles_updated_at
  BEFORE INSERT OR UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Assigned teacher can read and write
CREATE POLICY "teacher_read_write_profile" ON public.student_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_id
        AND p.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_id
        AND p.teacher_id = auth.uid()
    )
  );

-- Student can read their own profile
CREATE POLICY "student_read_own_profile" ON public.student_profiles
  FOR SELECT
  USING (student_id = auth.uid());
