-- ============================================================
-- Migration 013: Technique Milestone Tracker
-- ============================================================

-- ----------------------------------------------------------------
-- 1. technique_milestones (library)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technique_milestones (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text    NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 100),
  category    text    NOT NULL,
  instrument  text,
  difficulty  text    NOT NULL CHECK (difficulty IN ('Beginner','Intermediate','Advanced','Virtuoso')),
  description text    CHECK (length(trim(coalesce(description, ''))) <= 300),
  is_seed     boolean NOT NULL DEFAULT false
);

-- ----------------------------------------------------------------
-- 2. student_milestones
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_milestones (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id uuid        NOT NULL REFERENCES public.technique_milestones(id) ON DELETE CASCADE,
  teacher_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'not_started'
                           CHECK (status IN ('not_started','in_progress','achieved')),
  achieved_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, milestone_id)
);

-- ----------------------------------------------------------------
-- 3. Trigger: auto-set achieved_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_milestone_achieved()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'achieved' AND (OLD.status IS DISTINCT FROM 'achieved') THEN
    NEW.achieved_at := now();
  ELSIF NEW.status <> 'achieved' THEN
    NEW.achieved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_milestone_status_change ON public.student_milestones;
CREATE TRIGGER on_milestone_status_change
  BEFORE UPDATE ON public.student_milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_milestone_achieved();

-- ----------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.technique_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones   ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the milestone library
CREATE POLICY "authenticated_read_milestones" ON public.technique_milestones
  FOR SELECT USING (auth.role() = 'authenticated');

-- Teachers can insert custom milestones
CREATE POLICY "teachers_insert_milestones" ON public.technique_milestones
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
    AND is_seed = false
  );

-- Teachers: full access to student_milestones for their students
CREATE POLICY "teachers_manage_student_milestones" ON public.student_milestones
  FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Students: read their own milestones
CREATE POLICY "students_read_own_milestones" ON public.student_milestones
  FOR SELECT USING (student_id = auth.uid());

-- ----------------------------------------------------------------
-- 5. Seed data: 30+ common technique milestones
-- ----------------------------------------------------------------
INSERT INTO public.technique_milestones (name, category, instrument, difficulty, description, is_seed) VALUES
  -- Scales
  ('Major scales — all 12 keys, 1 octave', 'Scales', NULL, 'Beginner', 'Play all 12 major scales in one octave at ♩=60+', true),
  ('Major scales — all 12 keys, 2 octaves', 'Scales', NULL, 'Intermediate', 'Two octaves, hands together (keyboard) or full range', true),
  ('Natural minor scales — all 12 keys', 'Scales', NULL, 'Intermediate', 'Natural/Aeolian minor in all keys', true),
  ('Harmonic & melodic minor scales', 'Scales', NULL, 'Intermediate', 'Both forms in all 12 keys', true),
  ('Chromatic scale — full range', 'Scales', NULL, 'Intermediate', 'Smooth, even chromatic scale across full instrument range', true),
  ('Pentatonic scales — major & minor', 'Scales', NULL, 'Beginner', 'Major and minor pentatonic in all keys', true),
  -- Arpeggios
  ('Major arpeggios — all 12 keys', 'Arpeggios', NULL, 'Intermediate', 'Root position and inversions', true),
  ('Minor arpeggios — all 12 keys', 'Arpeggios', NULL, 'Intermediate', 'Root position and inversions', true),
  ('Dominant 7th arpeggios', 'Arpeggios', NULL, 'Advanced', 'All 12 keys, root position', true),
  -- Shifting / Positions (strings)
  ('First position — secure intonation', 'Shifting', 'Strings', 'Beginner', 'Consistent intonation in first position', true),
  ('Third position — clean shifts', 'Shifting', 'Strings', 'Intermediate', 'Smooth shifts to and from third position', true),
  ('Fifth position and above', 'Shifting', 'Strings', 'Advanced', 'Comfortable in high positions', true),
  ('Thumb position (cello/bass)', 'Shifting', 'Cello/Bass', 'Advanced', 'Secure thumb position technique', true),
  -- Articulation
  ('Legato — smooth bow/breath connection', 'Articulation', NULL, 'Beginner', 'Seamless phrase connection', true),
  ('Staccato — clean separation', 'Articulation', NULL, 'Intermediate', 'Even staccato at various tempos', true),
  ('Double-tonguing (winds/brass)', 'Articulation', 'Winds/Brass', 'Intermediate', 'Clean tu-ku or ti-ki articulation', true),
  ('Triple-tonguing (winds/brass)', 'Articulation', 'Winds/Brass', 'Advanced', 'Clean tu-tu-ku or ti-ti-ki', true),
  ('Spiccato bowing', 'Articulation', 'Strings', 'Advanced', 'Off-string bouncing bow stroke', true),
  ('Ricochet/jeté bowing', 'Articulation', 'Strings', 'Virtuoso', 'Multiple bounces per bow stroke', true),
  -- Rhythm
  ('Steady pulse — no rushing/dragging', 'Rhythm', NULL, 'Beginner', 'Maintain even pulse with metronome', true),
  ('Syncopation — accurate placement', 'Rhythm', NULL, 'Intermediate', 'Off-beat accents placed correctly', true),
  ('Polyrhythm — 2 against 3', 'Rhythm', NULL, 'Advanced', 'Simultaneous 2 and 3 subdivisions', true),
  ('Polyrhythm — 3 against 4', 'Rhythm', NULL, 'Virtuoso', 'Simultaneous 3 and 4 subdivisions', true),
  -- Sight-Reading
  ('Sight-read Grade 3 level', 'Sight-Reading', NULL, 'Beginner', 'Fluent first-read of Grade 3 material', true),
  ('Sight-read Grade 6 level', 'Sight-Reading', NULL, 'Intermediate', 'Fluent first-read of Grade 6 material', true),
  ('Sight-read Grade 8 level', 'Sight-Reading', NULL, 'Advanced', 'Fluent first-read of Grade 8 material', true),
  -- Ear Training
  ('Identify intervals by ear — unison to octave', 'Ear Training', NULL, 'Beginner', 'All diatonic intervals ascending', true),
  ('Identify chord qualities — M/m/dim/aug', 'Ear Training', NULL, 'Intermediate', 'Four basic chord qualities', true),
  ('Transcribe a simple melody by ear', 'Ear Training', NULL, 'Intermediate', 'Write out a 4-bar melody from hearing', true),
  -- World Technique
  ('Maqam Rast — correct intonation', 'World Technique', NULL, 'Intermediate', 'Quarter-tone inflections in Maqam Rast', true),
  ('West African bell pattern (12/8)', 'World Technique', 'Percussion', 'Intermediate', 'Standard 12/8 bell timeline pattern', true),
  ('Gamelan interlocking patterns (kotekan)', 'World Technique', NULL, 'Advanced', 'Polos and sangsih interlocking technique', true),
  -- Improvisation
  ('Blues scale improvisation', 'Improvisation', NULL, 'Beginner', 'Improvise over a 12-bar blues', true),
  ('Modal improvisation — Dorian', 'Improvisation', NULL, 'Intermediate', 'Improvise in Dorian mode', true),
  ('Free improvisation — extended techniques', 'Improvisation', NULL, 'Advanced', 'Expressive free improvisation with extended techniques', true)
ON CONFLICT DO NOTHING;
