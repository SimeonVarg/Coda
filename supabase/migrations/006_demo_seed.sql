-- ============================================================
-- Migration: 006_demo_seed.sql
-- Seeds demo auth users and realistic conservatory mock data.
-- Idempotent: safe to re-run via ON CONFLICT clauses.
-- ============================================================

-- Fixed UUIDs for demo users
-- Teacher:  aaaaaaaa-bbbb-cccc-dddd-000000000001
-- Student1: aaaaaaaa-bbbb-cccc-dddd-000000000002
-- Student2: aaaaaaaa-bbbb-cccc-dddd-000000000003
-- Student3: aaaaaaaa-bbbb-cccc-dddd-000000000004

-- Fixed UUIDs for catalog items (c1..c18)
-- c01: aaaaaaaa-bbbb-cccc-eeee-000000000001  ...through c18

-- Fixed UUIDs for lesson entries (le01..le12)
-- le01: aaaaaaaa-bbbb-cccc-ffff-000000000001  ...through le12

-- ----------------------------------------------------------------
-- 1. Demo Auth Users
-- ----------------------------------------------------------------
-- Password hash for 'demo-teacher-2024' and 'demo-student-2024'
-- using bcrypt (Supabase default). Generated with cost factor 10.
-- $2a$10$ prefix = bcrypt.

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  -- Demo Teacher
  (
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'teacher@coda-demo.app',
    crypt('demo-teacher-2024', gen_salt('bf')),
    now(), now(), now(),
    '{"is_demo": true}'::jsonb,
    '{"provider": "email", "providers": ["email"], "role": "teacher"}'::jsonb,
    '', '', '', ''
  ),
  -- Demo Student 1 (Liam Chen — Piano)
  (
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'student1@coda-demo.app',
    crypt('demo-student-2024', gen_salt('bf')),
    now(), now(), now(),
    '{"is_demo": true}'::jsonb,
    '{"provider": "email", "providers": ["email"], "role": "student"}'::jsonb,
    '', '', '', ''
  ),
  -- Demo Student 2 (Sofia Petrov — Violin)
  (
    'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'student2@coda-demo.app',
    crypt('demo-student-2024', gen_salt('bf')),
    now(), now(), now(),
    '{"is_demo": true}'::jsonb,
    '{"provider": "email", "providers": ["email"], "role": "student"}'::jsonb,
    '', '', '', ''
  ),
  -- Demo Student 3 (Marcus Williams — Cello)
  (
    'aaaaaaaa-bbbb-cccc-dddd-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'student3@coda-demo.app',
    crypt('demo-student-2024', gen_salt('bf')),
    now(), now(), now(),
    '{"is_demo": true}'::jsonb,
    '{"provider": "email", "providers": ["email"], "role": "student"}'::jsonb,
    '', '', '', ''
  )
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  raw_app_meta_data  = EXCLUDED.raw_app_meta_data,
  updated_at         = now();

-- Also add identities for each user (required by Supabase Auth)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'aaaaaaaa-bbbb-cccc-dddd-000000000001', 'aaaaaaaa-bbbb-cccc-dddd-000000000001', '{"sub": "aaaaaaaa-bbbb-cccc-dddd-000000000001", "email": "teacher@coda-demo.app"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000002', 'aaaaaaaa-bbbb-cccc-dddd-000000000002', 'aaaaaaaa-bbbb-cccc-dddd-000000000002', '{"sub": "aaaaaaaa-bbbb-cccc-dddd-000000000002", "email": "student1@coda-demo.app"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000003', '{"sub": "aaaaaaaa-bbbb-cccc-dddd-000000000003", "email": "student2@coda-demo.app"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000004', 'aaaaaaaa-bbbb-cccc-dddd-000000000004', 'aaaaaaaa-bbbb-cccc-dddd-000000000004', '{"sub": "aaaaaaaa-bbbb-cccc-dddd-000000000004", "email": "student3@coda-demo.app"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ----------------------------------------------------------------
-- 2. Profiles
-- ----------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, role, teacher_id) VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'Ms. Elena Vasquez',  'teacher', NULL),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000002', 'Liam Chen',          'student', 'aaaaaaaa-bbbb-cccc-dddd-000000000001'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000003', 'Sofia Petrov',       'student', 'aaaaaaaa-bbbb-cccc-dddd-000000000001'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000004', 'Marcus Williams',    'student', 'aaaaaaaa-bbbb-cccc-dddd-000000000001')
ON CONFLICT (id) DO UPDATE SET
  full_name  = EXCLUDED.full_name,
  role       = EXCLUDED.role,
  teacher_id = EXCLUDED.teacher_id;

-- ----------------------------------------------------------------
-- 3. Catalog Items (18 items: 12 repertoire + 6 theory)
-- ----------------------------------------------------------------
INSERT INTO public.catalog_items (id, title, type, composer) VALUES
  -- Repertoire — Baroque
  ('aaaaaaaa-bbbb-cccc-eeee-000000000001', 'Minuet in G Major, BWV Anh. 114',     'repertoire', 'J.S. Bach'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000002', 'Prelude in C Major, BWV 846',          'repertoire', 'J.S. Bach'),
  -- Repertoire — Classical
  ('aaaaaaaa-bbbb-cccc-eeee-000000000003', 'Für Elise, WoO 59',                    'repertoire', 'Ludwig van Beethoven'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000004', 'Sonata in C Major, K. 545',            'repertoire', 'W.A. Mozart'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000005', 'Sonatina in G Major, Op. 36 No. 5',    'repertoire', 'Muzio Clementi'),
  -- Repertoire — Romantic
  ('aaaaaaaa-bbbb-cccc-eeee-000000000006', 'Nocturne in E-flat Major, Op. 9 No. 2','repertoire', 'Frédéric Chopin'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000007', 'Träumerei, Op. 15 No. 7',              'repertoire', 'Robert Schumann'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000008', 'Clair de Lune',                         'repertoire', 'Claude Debussy'),
  -- Repertoire — 20th Century / Modern
  ('aaaaaaaa-bbbb-cccc-eeee-000000000009', 'Mikrokosmos, Vol. 3 No. 78',           'repertoire', 'Béla Bartók'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000010', 'Doctor Gradus ad Parnassum',           'repertoire', 'Claude Debussy'),
  -- Repertoire — Strings
  ('aaaaaaaa-bbbb-cccc-eeee-000000000011', 'Concerto in A Minor, BWV 1041',        'repertoire', 'J.S. Bach'),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000012', 'Suite No. 1 in G Major, BWV 1007',     'repertoire', 'J.S. Bach'),
  -- Theory
  ('aaaaaaaa-bbbb-cccc-eeee-000000000013', 'Major Scales — All Keys',              'theory', NULL),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000014', 'Minor Scales — Harmonic & Melodic',    'theory', NULL),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000015', 'Circle of Fifths',                      'theory', NULL),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000016', 'Chord Inversions — Triads & Sevenths', 'theory', NULL),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000017', 'Sight Reading — Level 1',              'theory', NULL),
  ('aaaaaaaa-bbbb-cccc-eeee-000000000018', 'Ear Training — Interval Recognition',  'theory', NULL)
ON CONFLICT (id) DO UPDATE SET
  title    = EXCLUDED.title,
  type     = EXCLUDED.type,
  composer = EXCLUDED.composer;

-- ----------------------------------------------------------------
-- 4. Lesson Entries (12 entries across 3 students)
-- ----------------------------------------------------------------
INSERT INTO public.lesson_entries (id, teacher_id, student_id, content, created_at) VALUES
  -- Liam Chen (Piano) — 5 lessons
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Minuet in G & Scales Review"}]},{"type":"paragraph","content":[{"type":"text","text":"Liam played through the "},{"type":"text","marks":[{"type":"bold"}],"text":"Minuet in G"},{"type":"text","text":" with improved hand independence. Left hand still rushing in measures 9–12."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Focus on LH alone in mm. 9–12 at half tempo"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"C Major scale — hands together, steady quarter notes"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Introduced "},{"type":"text","marks":[{"type":"italic"}],"text":"Für Elise"},{"type":"text","text":" opening section"}]}]}]}]}'::jsonb,
    now() - interval '42 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000002',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Für Elise Progress & Sight Reading"}]},{"type":"paragraph","content":[{"type":"text","text":"Good progress on the A section of "},{"type":"text","marks":[{"type":"bold"}],"text":"Für Elise"},{"type":"text","text":". Pedaling needs attention — too much sustain blurring the arpeggios."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Practice pedal changes on beat 1 of each measure"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Sight reading exercise: Clementi Sonatina, first page"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Theory: review Circle of Fifths for next week"}]}]}]}]}'::jsonb,
    now() - interval '35 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000003',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Nocturne Introduction & Theory Check-in"}]},{"type":"paragraph","content":[{"type":"text","text":"Introduced the "},{"type":"text","marks":[{"type":"bold"}],"text":"Nocturne Op. 9 No. 2"},{"type":"text","text":" — Liam was excited about the melody. We worked on the opening 8 bars with rubato phrasing."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Learn RH melody mm. 1–8, focus on legato touch"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Circle of Fifths quiz — scored 10/12, review flats side"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Continue Für Elise B section hands separate"}]}]}]}]}'::jsonb,
    now() - interval '28 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000004',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Für Elise Complete & Chord Inversions"}]},{"type":"paragraph","content":[{"type":"text","text":"Liam performed "},{"type":"text","marks":[{"type":"bold"}],"text":"Für Elise"},{"type":"text","text":" from memory with only minor hesitations in the C section. Ready to mark as mastered next week if clean run-through."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Polish C section transitions"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Chord inversions worksheet — triads in all major keys"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Nocturne: add LH accompaniment mm. 1–8"}]}]}]}]}'::jsonb,
    now() - interval '14 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000005',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Mastered Für Elise & New Repertoire"}]},{"type":"paragraph","content":[{"type":"text","text":"Clean performance of "},{"type":"text","marks":[{"type":"bold"}],"text":"Für Elise"},{"type":"text","text":" — marking as "},{"type":"text","marks":[{"type":"italic"}],"text":"mastered"},{"type":"text","text":". Introduced "},{"type":"text","marks":[{"type":"bold"}],"text":"Clair de Lune"},{"type":"text","text":" as the next major piece."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Begin Clair de Lune mm. 1–12, focus on triplet feel"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Nocturne hands together mm. 1–16"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Ear training: identify major vs minor intervals"}]}]}]}]}'::jsonb,
    now() - interval '7 days'
  ),
  -- Sofia Petrov (Violin) — 4 lessons
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000006',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Shifting Positions & Bach Concerto"}]},{"type":"paragraph","content":[{"type":"text","text":"Sofia is making steady progress with "},{"type":"text","marks":[{"type":"bold"}],"text":"3rd position shifting"},{"type":"text","text":". Intonation is improving but needs more work on the descending shifts."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Shifting exercises: Sevcik Op. 8, exercises 1–4"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Bach Concerto in A Minor — 1st movement exposition"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Scales: G Major and D Major, two octaves with shifts"}]}]}]}]}'::jsonb,
    now() - interval '38 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000007',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Vibrato Introduction & Scale Mastery"}]},{"type":"paragraph","content":[{"type":"text","text":"Introduced "},{"type":"text","marks":[{"type":"bold"}],"text":"wrist vibrato"},{"type":"text","text":" technique today. Sofia has a natural feel for it — started with slow oscillations on open strings."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Vibrato: practice on D and A strings, quarter note = 60"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Major scales all keys — marking as mastered"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Continue Bach Concerto development section"}]}]}]}]}'::jsonb,
    now() - interval '24 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000008',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Bach Concerto Progress & Ear Training"}]},{"type":"paragraph","content":[{"type":"text","text":"Excellent work on the "},{"type":"text","marks":[{"type":"bold"}],"text":"Bach Concerto"},{"type":"text","text":" development section. Bow distribution is much more even. Started working on the cadenza."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Cadenza: learn notes, add dynamics next week"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Ear training: interval recognition — 8/10 correct"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Vibrato: apply to slow passages in Bach"}]}]}]}]}'::jsonb,
    now() - interval '10 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000009',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Chamber Music Exploration"}]},{"type":"paragraph","content":[{"type":"text","text":"Introduced the idea of "},{"type":"text","marks":[{"type":"bold"}],"text":"chamber music"},{"type":"text","text":" — Sofia will join the studio ensemble next month. Discussed listening assignments and ensemble etiquette."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Listen to Haydn String Quartet Op. 76 No. 3"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Bach Concerto: full run-through with dynamics"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Minor scales harmonic & melodic — begin preparation"}]}]}]}]}'::jsonb,
    now() - interval '3 days'
  ),
  -- Marcus Williams (Cello) — 3 lessons
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000010',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000004',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Suite No. 1 Prelude & Practice Routine"}]},{"type":"paragraph","content":[{"type":"text","text":"Marcus began learning the "},{"type":"text","marks":[{"type":"bold"}],"text":"Suite No. 1 Prelude"},{"type":"text","text":" by Bach. We focused on bow arm weight and string crossings in the opening arpeggios."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Practice mm. 1–8 slowly with full bow strokes"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Set up daily practice log: 30 min minimum"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"G Major scale two octaves, focus on intonation"}]}]}]}]}'::jsonb,
    now() - interval '30 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000011',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000004',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Vibrato Basics & Sight Reading"}]},{"type":"paragraph","content":[{"type":"text","text":"Introduced "},{"type":"text","marks":[{"type":"bold"}],"text":"vibrato fundamentals"},{"type":"text","text":" — arm vibrato approach for cello. Marcus found the rocking motion challenging but showed good patience."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Vibrato: arm rocking exercise on A string, no bow"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Sight reading: simple melodies in first position"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Suite Prelude: continue through mm. 16"}]}]}]}]}'::jsonb,
    now() - interval '16 days'
  ),
  (
    'aaaaaaaa-bbbb-cccc-ffff-000000000012',
    'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-000000000004',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Lesson: Practice Consistency & Theory Foundations"}]},{"type":"paragraph","content":[{"type":"text","text":"Marcus has been practicing more consistently — practice log shows 5/7 days this week. "},{"type":"text","marks":[{"type":"bold"}],"text":"Suite Prelude"},{"type":"text","text":" is coming along well through measure 20."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Continue Suite Prelude to the end of the first section"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Major scales: add D Major and C Major"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Begin chord inversions theory worksheet"}]}]}]}]}'::jsonb,
    now() - interval '2 days'
  )
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  created_at = EXCLUDED.created_at;

-- ----------------------------------------------------------------
-- 5. Repertoire Tags (covering all 4 statuses)
-- ----------------------------------------------------------------
INSERT INTO public.repertoire_tags (id, lesson_entry_id, catalog_item_id, status) VALUES
  -- Liam Chen (Piano)
  ('aaaaaaaa-bbbb-cccc-1111-000000000001', 'aaaaaaaa-bbbb-cccc-ffff-000000000001', 'aaaaaaaa-bbbb-cccc-eeee-000000000001', 'mastered'),      -- Minuet in G — mastered
  ('aaaaaaaa-bbbb-cccc-1111-000000000002', 'aaaaaaaa-bbbb-cccc-ffff-000000000001', 'aaaaaaaa-bbbb-cccc-eeee-000000000013', 'completed'),     -- Major Scales — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000003', 'aaaaaaaa-bbbb-cccc-ffff-000000000002', 'aaaaaaaa-bbbb-cccc-eeee-000000000003', 'mastered'),      -- Für Elise — mastered
  ('aaaaaaaa-bbbb-cccc-1111-000000000004', 'aaaaaaaa-bbbb-cccc-ffff-000000000002', 'aaaaaaaa-bbbb-cccc-eeee-000000000015', 'completed'),     -- Circle of Fifths — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000005', 'aaaaaaaa-bbbb-cccc-ffff-000000000003', 'aaaaaaaa-bbbb-cccc-eeee-000000000006', 'in_progress'),   -- Nocturne — in progress
  ('aaaaaaaa-bbbb-cccc-1111-000000000006', 'aaaaaaaa-bbbb-cccc-ffff-000000000004', 'aaaaaaaa-bbbb-cccc-eeee-000000000016', 'completed'),     -- Chord Inversions — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000007', 'aaaaaaaa-bbbb-cccc-ffff-000000000005', 'aaaaaaaa-bbbb-cccc-eeee-000000000008', 'introduced'),    -- Clair de Lune — introduced
  ('aaaaaaaa-bbbb-cccc-1111-000000000008', 'aaaaaaaa-bbbb-cccc-ffff-000000000005', 'aaaaaaaa-bbbb-cccc-eeee-000000000018', 'completed'),     -- Ear Training — theory completed

  -- Sofia Petrov (Violin)
  ('aaaaaaaa-bbbb-cccc-1111-000000000009', 'aaaaaaaa-bbbb-cccc-ffff-000000000006', 'aaaaaaaa-bbbb-cccc-eeee-000000000011', 'in_progress'),   -- Bach Concerto A Minor — in progress
  ('aaaaaaaa-bbbb-cccc-1111-000000000010', 'aaaaaaaa-bbbb-cccc-ffff-000000000007', 'aaaaaaaa-bbbb-cccc-eeee-000000000013', 'completed'),     -- Major Scales — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000011', 'aaaaaaaa-bbbb-cccc-ffff-000000000008', 'aaaaaaaa-bbbb-cccc-eeee-000000000018', 'completed'),     -- Ear Training — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000012', 'aaaaaaaa-bbbb-cccc-ffff-000000000009', 'aaaaaaaa-bbbb-cccc-eeee-000000000014', 'introduced'),    -- Minor Scales — introduced

  -- Marcus Williams (Cello)
  ('aaaaaaaa-bbbb-cccc-1111-000000000013', 'aaaaaaaa-bbbb-cccc-ffff-000000000010', 'aaaaaaaa-bbbb-cccc-eeee-000000000012', 'in_progress'),   -- Suite No. 1 — in progress
  ('aaaaaaaa-bbbb-cccc-1111-000000000014', 'aaaaaaaa-bbbb-cccc-ffff-000000000011', 'aaaaaaaa-bbbb-cccc-eeee-000000000017', 'completed'),     -- Sight Reading L1 — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000015', 'aaaaaaaa-bbbb-cccc-ffff-000000000012', 'aaaaaaaa-bbbb-cccc-eeee-000000000013', 'completed'),     -- Major Scales — theory completed
  ('aaaaaaaa-bbbb-cccc-1111-000000000016', 'aaaaaaaa-bbbb-cccc-ffff-000000000012', 'aaaaaaaa-bbbb-cccc-eeee-000000000016', 'introduced')     -- Chord Inversions — introduced
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- ----------------------------------------------------------------
-- 6. Student Profiles
-- ----------------------------------------------------------------
INSERT INTO public.student_profiles (student_id, grade_level, instrument, goals, updated_by) VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-000000000002', 'Grade 8',  'Piano',  'Prepare for Grade 9 RCM exam. Improve sight-reading fluency and develop expressive phrasing in Romantic repertoire.', 'aaaaaaaa-bbbb-cccc-dddd-000000000001'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000003', 'Grade 5',  'Violin', 'Build confidence in shifting positions and vibrato. Explore chamber music opportunities and prepare for spring recital.', 'aaaaaaaa-bbbb-cccc-dddd-000000000001'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000004', 'Grade 3',  'Cello',  'Develop a consistent daily practice routine. Learn vibrato basics and work toward performing the Bach Suite No. 1 Prelude.', 'aaaaaaaa-bbbb-cccc-dddd-000000000001')
ON CONFLICT (student_id) DO UPDATE SET
  grade_level = EXCLUDED.grade_level,
  instrument  = EXCLUDED.instrument,
  goals       = EXCLUDED.goals,
  updated_by  = EXCLUDED.updated_by;

-- ----------------------------------------------------------------
-- 7. Practice Assignments (10 assignments, mixed states)
-- ----------------------------------------------------------------
INSERT INTO public.practice_assignments (id, lesson_entry_id, student_id, description, due_date, completed_at, created_at) VALUES
  -- Liam Chen — active assignments
  ('aaaaaaaa-bbbb-cccc-2222-000000000001', 'aaaaaaaa-bbbb-cccc-ffff-000000000005', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   'Learn Clair de Lune mm. 1–12 with correct triplet rhythm', (now() + interval '5 days')::date, NULL, now() - interval '7 days'),
  ('aaaaaaaa-bbbb-cccc-2222-000000000002', 'aaaaaaaa-bbbb-cccc-ffff-000000000005', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   'Nocturne Op. 9 No. 2 hands together mm. 1–16', (now() + interval '7 days')::date, NULL, now() - interval '7 days'),
  -- Liam Chen — completed assignments
  ('aaaaaaaa-bbbb-cccc-2222-000000000003', 'aaaaaaaa-bbbb-cccc-ffff-000000000004', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   'Chord inversions worksheet — all major key triads', (now() - interval '7 days')::date, now() - interval '8 days', now() - interval '14 days'),
  ('aaaaaaaa-bbbb-cccc-2222-000000000004', 'aaaaaaaa-bbbb-cccc-ffff-000000000003', 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
   'Circle of Fifths — memorize all sharp and flat keys', NULL, now() - interval '21 days', now() - interval '28 days'),

  -- Sofia Petrov — active assignments
  ('aaaaaaaa-bbbb-cccc-2222-000000000005', 'aaaaaaaa-bbbb-cccc-ffff-000000000009', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   'Bach Concerto full run-through with dynamics and phrasing', (now() + interval '4 days')::date, NULL, now() - interval '3 days'),
  ('aaaaaaaa-bbbb-cccc-2222-000000000006', 'aaaaaaaa-bbbb-cccc-ffff-000000000009', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   'Listen to Haydn String Quartet Op. 76 No. 3 and write 3 observations', NULL, NULL, now() - interval '3 days'),
  -- Sofia Petrov — completed assignment
  ('aaaaaaaa-bbbb-cccc-2222-000000000007', 'aaaaaaaa-bbbb-cccc-ffff-000000000007', 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
   'Vibrato exercise on D and A strings at quarter = 60', (now() - interval '10 days')::date, now() - interval '11 days', now() - interval '24 days'),

  -- Marcus Williams — active assignments
  ('aaaaaaaa-bbbb-cccc-2222-000000000008', 'aaaaaaaa-bbbb-cccc-ffff-000000000012', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   'Suite Prelude — continue to end of first section with steady tempo', (now() + interval '6 days')::date, NULL, now() - interval '2 days'),
  ('aaaaaaaa-bbbb-cccc-2222-000000000009', 'aaaaaaaa-bbbb-cccc-ffff-000000000012', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   'D Major and C Major scales two octaves daily', NULL, NULL, now() - interval '2 days'),
  -- Marcus Williams — completed assignment
  ('aaaaaaaa-bbbb-cccc-2222-000000000010', 'aaaaaaaa-bbbb-cccc-ffff-000000000010', 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
   'Set up daily practice log and track 30 minutes minimum for one week', (now() - interval '16 days')::date, now() - interval '18 days', now() - interval '30 days')
ON CONFLICT (id) DO UPDATE SET
  description  = EXCLUDED.description,
  due_date     = EXCLUDED.due_date,
  completed_at = EXCLUDED.completed_at;
