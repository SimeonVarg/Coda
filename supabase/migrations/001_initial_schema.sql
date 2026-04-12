-- ============================================================
-- Studio Architect — Initial Schema
-- ============================================================

-- ----------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('teacher', 'student')),
  teacher_id  uuid        REFERENCES public.profiles (id) ON DELETE SET NULL,
  PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- 2. lesson_entries
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_entries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  student_id  uuid        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content     jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. catalog_items  (with generated search_vector)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id             uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text  NOT NULL,
  type           text  NOT NULL CHECK (type IN ('repertoire', 'theory')),
  composer       text,
  search_vector  tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(composer, ''))
  ) STORED
);

CREATE INDEX IF NOT EXISTS catalog_items_search_vector_idx
  ON public.catalog_items USING GIN (search_vector);

-- ----------------------------------------------------------------
-- 4. repertoire_tags
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.repertoire_tags (
  id               uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_entry_id  uuid  NOT NULL REFERENCES public.lesson_entries (id) ON DELETE CASCADE,
  catalog_item_id  uuid  NOT NULL REFERENCES public.catalog_items (id) ON DELETE CASCADE,
  status           text  NOT NULL CHECK (status IN ('introduced', 'mastered', 'completed'))
);

-- ----------------------------------------------------------------
-- 5. DB trigger: sync app_metadata.role on profile creation
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
        coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- ----------------------------------------------------------------
-- 6. Row-Level Security
-- ----------------------------------------------------------------

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertoire_tags ENABLE ROW LEVEL SECURITY;

-- ---- profiles policies ----

-- Teachers can read their own row and all students assigned to them
CREATE POLICY "teachers_read_own_and_students" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR (
      -- caller is a teacher and this row is one of their students
      EXISTS (
        SELECT 1 FROM public.profiles AS caller
        WHERE caller.id = auth.uid()
          AND caller.role = 'teacher'
      )
      AND teacher_id = auth.uid()
    )
  );

-- Teachers can insert/update their own profile row
CREATE POLICY "teachers_write_own_profile" ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Students can read their own profile row (covered by the SELECT policy above)
-- Students can update their own profile row
CREATE POLICY "students_write_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- lesson_entries policies ----

-- Teachers can read and write their own lesson entries
CREATE POLICY "teachers_read_own_entries" ON public.lesson_entries
  FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "teachers_write_own_entries" ON public.lesson_entries
  FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Students can read entries where they are the student
CREATE POLICY "students_read_own_entries" ON public.lesson_entries
  FOR SELECT
  USING (student_id = auth.uid());

-- ---- catalog_items policies ----

-- All authenticated users can read catalog items (shared catalog)
CREATE POLICY "authenticated_read_catalog" ON public.catalog_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service-role / admin inserts catalog items (no user-facing insert policy)

-- ---- repertoire_tags policies ----

-- Teachers can read and write tags on their own lesson entries
CREATE POLICY "teachers_read_own_tags" ON public.repertoire_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_entries le
      WHERE le.id = lesson_entry_id
        AND le.teacher_id = auth.uid()
    )
  );

CREATE POLICY "teachers_write_own_tags" ON public.repertoire_tags
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

-- Students can read tags on their own lesson entries
CREATE POLICY "students_read_own_tags" ON public.repertoire_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_entries le
      WHERE le.id = lesson_entry_id
        AND le.student_id = auth.uid()
    )
  );
