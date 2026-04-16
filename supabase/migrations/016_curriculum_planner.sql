-- ============================================================
-- Migration 016: Lesson Pacing & Curriculum Planner
-- ============================================================

-- ----------------------------------------------------------------
-- 1. curriculum_plans
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curriculum_plans (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 150),
  target_date date        NOT NULL,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Only one active plan per student
CREATE UNIQUE INDEX IF NOT EXISTS curriculum_plans_one_active_per_student
  ON public.curriculum_plans (student_id)
  WHERE is_active = true;

-- ----------------------------------------------------------------
-- 2. curriculum_plan_items
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curriculum_plan_items (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          uuid        NOT NULL REFERENCES public.curriculum_plans(id) ON DELETE CASCADE,
  title            text        NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 150),
  item_type        text        NOT NULL CHECK (item_type IN ('repertoire','technique','theory','performance','other')),
  sort_order       integer     NOT NULL DEFAULT 0,
  target_date      date,
  catalog_item_id  uuid        REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  milestone_id     uuid        REFERENCES public.technique_milestones(id) ON DELETE SET NULL,
  notes            text        CHECK (length(trim(coalesce(notes, ''))) <= 300),
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','in_progress','completed','skipped')),
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. Trigger: auto-set completed_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_plan_item_completed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := now();
  ELSIF NEW.status <> 'completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_plan_item_status_change ON public.curriculum_plan_items;
CREATE TRIGGER on_plan_item_status_change
  BEFORE UPDATE ON public.curriculum_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_plan_item_completed();

-- ----------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.curriculum_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_plan_items ENABLE ROW LEVEL SECURITY;

-- Teachers: full access to their plans
CREATE POLICY "teachers_manage_curriculum_plans" ON public.curriculum_plans
  FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Students: read their own plans
CREATE POLICY "students_read_own_curriculum_plans" ON public.curriculum_plans
  FOR SELECT USING (student_id = auth.uid());

-- Teachers: full access to plan items via plan ownership
CREATE POLICY "teachers_manage_plan_items" ON public.curriculum_plan_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_plans cp
      WHERE cp.id = plan_id AND cp.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curriculum_plans cp
      WHERE cp.id = plan_id AND cp.teacher_id = auth.uid()
    )
  );

-- Students: read plan items for their plans
CREATE POLICY "students_read_own_plan_items" ON public.curriculum_plan_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_plans cp
      WHERE cp.id = plan_id AND cp.student_id = auth.uid()
    )
  );
