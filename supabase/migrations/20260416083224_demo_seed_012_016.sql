-- ============================================================
-- Demo seed data for migrations 012-016
-- Covers: practice_journal_entries, practice_metronome_logs,
--         student_milestones, lesson_reflections,
--         curriculum_plans, curriculum_plan_items
-- Idempotent via ON CONFLICT DO NOTHING / DO UPDATE
-- ============================================================

-- Demo user UUIDs (from migration 006)
-- Teacher:  aaaaaaaa-bbbb-cccc-dddd-000000000001
-- Student1 (Liam Chen, Piano):    aaaaaaaa-bbbb-cccc-dddd-000000000002
-- Student2 (Sofia Petrov, Violin): aaaaaaaa-bbbb-cccc-dddd-000000000003
-- Student3 (Marcus Williams, Cello): aaaaaaaa-bbbb-cccc-dddd-000000000004

-- ----------------------------------------------------------------
-- 1. Practice Journal Entries
-- ----------------------------------------------------------------
INSERT INTO public.practice_journal_entries
  (id, student_id, entry_date, duration_min, mood, notes, created_at)
VALUES
  -- Liam Chen
  ('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   CURRENT_DATE - 1, 45, 4, 'Worked on Clair de Lune triplets. Getting smoother!', now() - interval '1 day'),
  ('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   CURRENT_DATE - 3, 30, 3, 'Nocturne hands together — still shaky in mm. 9-12.', now() - interval '3 days'),
  ('bbbbbbbb-0001-0001-0001-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   CURRENT_DATE - 5, 60, 5, 'Best session this week. Ran through everything twice.', now() - interval '5 days'),
  ('bbbbbbbb-0001-0001-0001-000000000004', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   CURRENT_DATE - 8, 40, 3, 'Scales and sight reading. Tired but got through it.', now() - interval '8 days'),

  -- Sofia Petrov
  ('bbbbbbbb-0001-0001-0002-000000000001', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   CURRENT_DATE - 1, 50, 5, 'Bach Concerto cadenza — nailed the dynamics today!', now() - interval '1 day'),
  ('bbbbbbbb-0001-0001-0002-000000000002', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   CURRENT_DATE - 4, 35, 4, 'Vibrato exercises on D and A strings. Feeling more natural.', now() - interval '4 days'),
  ('bbbbbbbb-0001-0001-0002-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   CURRENT_DATE - 6, 45, 3, 'Shifting practice — descending shifts still need work.', now() - interval '6 days'),

  -- Marcus Williams
  ('bbbbbbbb-0001-0001-0003-000000000001', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   CURRENT_DATE - 2, 30, 4, 'Suite Prelude through measure 20. Bow arm feeling better.', now() - interval '2 days'),
  ('bbbbbbbb-0001-0001-0003-000000000002', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   CURRENT_DATE - 4, 25, 3, 'Vibrato rocking exercise. Hard to keep it even.', now() - interval '4 days'),
  ('bbbbbbbb-0001-0001-0003-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   CURRENT_DATE - 7, 35, 4, 'G Major scale two octaves + Suite Prelude mm. 1-8.', now() - interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 2. Practice Metronome Logs
-- ----------------------------------------------------------------
INSERT INTO public.practice_metronome_logs
  (id, journal_entry_id, catalog_item_id, bpm_start, bpm_end, note)
VALUES
  -- Liam: Clair de Lune
  ('cccccccc-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001',
   'aaaaaaaa-bbbb-cccc-eeee-000000000008', 52, 60, 'Triplet feel improving'),
  -- Liam: Nocturne
  ('cccccccc-0001-0001-0001-000000000002', 'bbbbbbbb-0001-0001-0001-000000000002',
   'aaaaaaaa-bbbb-cccc-eeee-000000000006', 48, 56, 'Hands together mm. 1-16'),
  -- Sofia: Bach Concerto
  ('cccccccc-0001-0001-0002-000000000001', 'bbbbbbbb-0001-0001-0002-000000000001',
   'aaaaaaaa-bbbb-cccc-eeee-000000000011', 80, 96, 'Cadenza section'),
  -- Marcus: Suite Prelude
  ('cccccccc-0001-0001-0003-000000000001', 'bbbbbbbb-0001-0001-0003-000000000001',
   'aaaaaaaa-bbbb-cccc-eeee-000000000012', 60, 72, 'String crossings in arpeggios')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 3. Student Milestones
-- Grab seed milestone IDs by name since they use gen_random_uuid()
-- ----------------------------------------------------------------
INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0001-000000000001',
  'aaaaaaaa-bbbb-cccc-dddd-000000000002',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'achieved',
  now() - interval '20 days',
  now() - interval '30 days'
FROM public.technique_milestones tm WHERE tm.name = 'Major scales — all 12 keys, 1 octave' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0001-000000000002',
  'aaaaaaaa-bbbb-cccc-dddd-000000000002',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'in_progress',
  NULL,
  now() - interval '14 days'
FROM public.technique_milestones tm WHERE tm.name = 'Major scales — all 12 keys, 2 octaves' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0001-000000000003',
  'aaaaaaaa-bbbb-cccc-dddd-000000000002',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'achieved',
  now() - interval '10 days',
  now() - interval '21 days'
FROM public.technique_milestones tm WHERE tm.name = 'Identify intervals by ear — unison to octave' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0001-000000000004',
  'aaaaaaaa-bbbb-cccc-dddd-000000000002',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'not_started',
  NULL,
  now() - interval '7 days'
FROM public.technique_milestones tm WHERE tm.name = 'Sight-read Grade 6 level' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

-- Sofia milestones
INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0002-000000000001',
  'aaaaaaaa-bbbb-cccc-dddd-000000000003',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'achieved',
  now() - interval '15 days',
  now() - interval '25 days'
FROM public.technique_milestones tm WHERE tm.name = 'First position — secure intonation' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0002-000000000002',
  'aaaaaaaa-bbbb-cccc-dddd-000000000003',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'in_progress',
  NULL,
  now() - interval '10 days'
FROM public.technique_milestones tm WHERE tm.name = 'Third position — clean shifts' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0002-000000000003',
  'aaaaaaaa-bbbb-cccc-dddd-000000000003',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'achieved',
  now() - interval '5 days',
  now() - interval '20 days'
FROM public.technique_milestones tm WHERE tm.name = 'Major scales — all 12 keys, 1 octave' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

-- Marcus milestones
INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0003-000000000001',
  'aaaaaaaa-bbbb-cccc-dddd-000000000004',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'in_progress',
  NULL,
  now() - interval '20 days'
FROM public.technique_milestones tm WHERE tm.name = 'First position — secure intonation' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

INSERT INTO public.student_milestones
  (id, student_id, milestone_id, teacher_id, status, achieved_at, created_at)
SELECT
  'dddddddd-0001-0001-0003-000000000002',
  'aaaaaaaa-bbbb-cccc-dddd-000000000004',
  tm.id,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  'not_started',
  NULL,
  now() - interval '10 days'
FROM public.technique_milestones tm WHERE tm.name = 'Legato — smooth bow/breath connection' AND tm.is_seed = true
ON CONFLICT (student_id, milestone_id) DO NOTHING;

-- ----------------------------------------------------------------
-- 4. Lesson Reflections (student self-assessments)
-- Linked to existing lesson entries from migration 006
-- ----------------------------------------------------------------
INSERT INTO public.lesson_reflections
  (id, lesson_entry_id, student_id, self_rating, went_well, was_challenging, next_goal, created_at, updated_at)
VALUES
  -- Liam: reflection on lesson 5 (most recent)
  ('eeeeeeee-0001-0001-0001-000000000001',
   'aaaaaaaa-bbbb-cccc-ffff-000000000005',
   'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   5,
   'Finally played Für Elise all the way through without stopping!',
   'The C section transitions still feel a bit rushed.',
   'Work on Clair de Lune triplets at a slower tempo.',
   now() - interval '7 days', now() - interval '7 days'),
  -- Liam: reflection on lesson 4
  ('eeeeeeee-0001-0001-0001-000000000002',
   'aaaaaaaa-bbbb-cccc-ffff-000000000004',
   'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   4,
   'Chord inversions worksheet went well — I understand the patterns now.',
   'Keeping the Nocturne LH steady while playing RH melody.',
   'Practice Nocturne hands together slowly.',
   now() - interval '14 days', now() - interval '14 days'),

  -- Sofia: reflection on lesson 9 (most recent)
  ('eeeeeeee-0001-0001-0002-000000000001',
   'aaaaaaaa-bbbb-cccc-ffff-000000000009',
   'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   4,
   'Bach Concerto full run-through felt really musical today.',
   'Ensemble listening — hard to stay in tune while listening to others.',
   'Listen to the Haydn quartet and take notes on balance.',
   now() - interval '3 days', now() - interval '3 days'),

  -- Marcus: reflection on lesson 12 (most recent)
  ('eeeeeeee-0001-0001-0003-000000000001',
   'aaaaaaaa-bbbb-cccc-ffff-000000000012',
   'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   3,
   'Practice log is helping — I practiced 5 out of 7 days!',
   'Vibrato still feels unnatural. Hard to relax the arm.',
   'Keep the practice log going and focus on arm weight for vibrato.',
   now() - interval '2 days', now() - interval '2 days')
ON CONFLICT (lesson_entry_id, student_id) DO NOTHING;

-- ----------------------------------------------------------------
-- 5. Curriculum Plans + Items
-- ----------------------------------------------------------------
INSERT INTO public.curriculum_plans
  (id, teacher_id, student_id, title, target_date, is_active, created_at)
VALUES
  ('ffffffff-0001-0001-0001-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   'Grade 9 RCM Exam Preparation',
   CURRENT_DATE + interval '6 months',
   true,
   now() - interval '30 days'),
  ('ffffffff-0001-0001-0002-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   'Spring Recital & Chamber Music',
   CURRENT_DATE + interval '3 months',
   true,
   now() - interval '20 days'),
  ('ffffffff-0001-0001-0003-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000001',
   'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   'Bach Suite No. 1 Performance Ready',
   CURRENT_DATE + interval '4 months',
   true,
   now() - interval '15 days')
ON CONFLICT (id) DO NOTHING;

-- Liam's curriculum items
INSERT INTO public.curriculum_plan_items
  (id, plan_id, title, item_type, sort_order, target_date, catalog_item_id, milestone_id, notes, status, completed_at, created_at)
VALUES
  ('11111111-0001-0001-0001-000000000001',
   'ffffffff-0001-0001-0001-000000000001',
   'Master Für Elise', 'repertoire', 1,
   CURRENT_DATE - interval '7 days',
   'aaaaaaaa-bbbb-cccc-eeee-000000000003', NULL,
   'Performance-ready with dynamics and pedaling', 'completed',
   now() - interval '7 days', now() - interval '30 days'),
  ('11111111-0001-0001-0001-000000000002',
   'ffffffff-0001-0001-0001-000000000001',
   'Nocturne Op. 9 No. 2 — hands together', 'repertoire', 2,
   CURRENT_DATE + interval '3 weeks',
   'aaaaaaaa-bbbb-cccc-eeee-000000000006', NULL,
   'Focus on rubato and pedaling', 'in_progress',
   NULL, now() - interval '28 days'),
  ('11111111-0001-0001-0001-000000000003',
   'ffffffff-0001-0001-0001-000000000001',
   'Clair de Lune — learn full piece', 'repertoire', 3,
   CURRENT_DATE + interval '8 weeks',
   'aaaaaaaa-bbbb-cccc-eeee-000000000008', NULL,
   'Major new piece for exam', 'in_progress',
   NULL, now() - interval '7 days'),
  ('11111111-0001-0001-0001-000000000004',
   'ffffffff-0001-0001-0001-000000000001',
   'Chord inversions — all major keys', 'theory', 4,
   CURRENT_DATE - interval '14 days',
   'aaaaaaaa-bbbb-cccc-eeee-000000000016', NULL,
   'Theory component for exam', 'completed',
   now() - interval '14 days', now() - interval '30 days'),
  ('11111111-0001-0001-0001-000000000005',
   'ffffffff-0001-0001-0001-000000000001',
   'Scales — 2 octaves hands together', 'technique', 5,
   CURRENT_DATE + interval '6 weeks',
   NULL, NULL,
   'All 12 major and minor scales', 'in_progress',
   NULL, now() - interval '14 days');

-- Sofia's curriculum items
INSERT INTO public.curriculum_plan_items
  (id, plan_id, title, item_type, sort_order, target_date, catalog_item_id, milestone_id, notes, status, completed_at, created_at)
VALUES
  ('11111111-0001-0001-0002-000000000001',
   'ffffffff-0001-0001-0002-000000000001',
   'Bach Concerto in A Minor — performance ready', 'repertoire', 1,
   CURRENT_DATE + interval '5 weeks',
   'aaaaaaaa-bbbb-cccc-eeee-000000000011', NULL,
   'Full concerto with cadenza', 'in_progress',
   NULL, now() - interval '20 days'),
  ('11111111-0001-0001-0002-000000000002',
   'ffffffff-0001-0001-0002-000000000001',
   'Vibrato — consistent on all strings', 'technique', 2,
   CURRENT_DATE + interval '4 weeks',
   NULL, NULL,
   'Wrist vibrato, apply to slow passages', 'in_progress',
   NULL, now() - interval '15 days'),
  ('11111111-0001-0001-0002-000000000003',
   'ffffffff-0001-0001-0002-000000000001',
   'Chamber music ensemble preparation', 'performance', 3,
   CURRENT_DATE + interval '10 weeks',
   NULL, NULL,
   'Join studio ensemble for spring recital', 'pending',
   NULL, now() - interval '10 days');

-- Marcus's curriculum items
INSERT INTO public.curriculum_plan_items
  (id, plan_id, title, item_type, sort_order, target_date, catalog_item_id, milestone_id, notes, status, completed_at, created_at)
VALUES
  ('11111111-0001-0001-0003-000000000001',
   'ffffffff-0001-0001-0003-000000000001',
   'Bach Suite No. 1 Prelude — full piece', 'repertoire', 1,
   CURRENT_DATE + interval '10 weeks',
   'aaaaaaaa-bbbb-cccc-eeee-000000000012', NULL,
   'Performance-ready for studio recital', 'in_progress',
   NULL, now() - interval '15 days'),
  ('11111111-0001-0001-0003-000000000002',
   'ffffffff-0001-0001-0003-000000000001',
   'Establish daily practice routine', 'other', 2,
   CURRENT_DATE + interval '2 weeks',
   NULL, NULL,
   '30 min minimum, 5 days per week', 'in_progress',
   NULL, now() - interval '15 days'),
  ('11111111-0001-0001-0003-000000000003',
   'ffffffff-0001-0001-0003-000000000001',
   'Vibrato fundamentals', 'technique', 3,
   CURRENT_DATE + interval '8 weeks',
   NULL, NULL,
   'Arm vibrato approach for cello', 'pending',
   NULL, now() - interval '10 days');

-- ----------------------------------------------------------------
-- 6. Demo deny-write policies for new tables (idempotent via DO blocks)
-- ----------------------------------------------------------------
DO $$
BEGIN
  -- practice_journal_entries
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_journal_entries' AND policyname = 'demo_deny_write_practice_journal') THEN
    CREATE POLICY demo_deny_write_practice_journal ON public.practice_journal_entries
      AS RESTRICTIVE FOR INSERT TO authenticated
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_journal_entries' AND policyname = 'demo_deny_update_practice_journal') THEN
    CREATE POLICY demo_deny_update_practice_journal ON public.practice_journal_entries
      AS RESTRICTIVE FOR UPDATE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_journal_entries' AND policyname = 'demo_deny_delete_practice_journal') THEN
    CREATE POLICY demo_deny_delete_practice_journal ON public.practice_journal_entries
      AS RESTRICTIVE FOR DELETE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;

  -- student_milestones
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_milestones' AND policyname = 'demo_deny_write_student_milestones') THEN
    CREATE POLICY demo_deny_write_student_milestones ON public.student_milestones
      AS RESTRICTIVE FOR INSERT TO authenticated
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_milestones' AND policyname = 'demo_deny_update_student_milestones') THEN
    CREATE POLICY demo_deny_update_student_milestones ON public.student_milestones
      AS RESTRICTIVE FOR UPDATE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_milestones' AND policyname = 'demo_deny_delete_student_milestones') THEN
    CREATE POLICY demo_deny_delete_student_milestones ON public.student_milestones
      AS RESTRICTIVE FOR DELETE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;

  -- lesson_reflections
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_reflections' AND policyname = 'demo_deny_write_lesson_reflections') THEN
    CREATE POLICY demo_deny_write_lesson_reflections ON public.lesson_reflections
      AS RESTRICTIVE FOR INSERT TO authenticated
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_reflections' AND policyname = 'demo_deny_update_lesson_reflections') THEN
    CREATE POLICY demo_deny_update_lesson_reflections ON public.lesson_reflections
      AS RESTRICTIVE FOR UPDATE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_reflections' AND policyname = 'demo_deny_delete_lesson_reflections') THEN
    CREATE POLICY demo_deny_delete_lesson_reflections ON public.lesson_reflections
      AS RESTRICTIVE FOR DELETE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;

  -- curriculum_plans
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plans' AND policyname = 'demo_deny_write_curriculum_plans') THEN
    CREATE POLICY demo_deny_write_curriculum_plans ON public.curriculum_plans
      AS RESTRICTIVE FOR INSERT TO authenticated
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plans' AND policyname = 'demo_deny_update_curriculum_plans') THEN
    CREATE POLICY demo_deny_update_curriculum_plans ON public.curriculum_plans
      AS RESTRICTIVE FOR UPDATE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plans' AND policyname = 'demo_deny_delete_curriculum_plans') THEN
    CREATE POLICY demo_deny_delete_curriculum_plans ON public.curriculum_plans
      AS RESTRICTIVE FOR DELETE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;

  -- curriculum_plan_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plan_items' AND policyname = 'demo_deny_write_curriculum_plan_items') THEN
    CREATE POLICY demo_deny_write_curriculum_plan_items ON public.curriculum_plan_items
      AS RESTRICTIVE FOR INSERT TO authenticated
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plan_items' AND policyname = 'demo_deny_update_curriculum_plan_items') THEN
    CREATE POLICY demo_deny_update_curriculum_plan_items ON public.curriculum_plan_items
      AS RESTRICTIVE FOR UPDATE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
      WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_plan_items' AND policyname = 'demo_deny_delete_curriculum_plan_items') THEN
    CREATE POLICY demo_deny_delete_curriculum_plan_items ON public.curriculum_plan_items
      AS RESTRICTIVE FOR DELETE TO authenticated
      USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
  END IF;
END $$;
