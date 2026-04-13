-- ============================================================
-- Migration: 007_demo_deny_writes.sql
-- RESTRICTIVE RLS policies that block all write operations
-- for demo users (is_demo = true in user_metadata JWT claim).
-- These policies are ANDed with existing PERMISSIVE policies,
-- so demo users can still read but never write.
-- ============================================================

-- profiles (INSERT/UPDATE/DELETE only — SELECT must remain allowed for reading student lists)
CREATE POLICY demo_deny_write_profiles ON public.profiles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_update_profiles ON public.profiles
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_delete_profiles ON public.profiles
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

-- lesson_entries (separate INSERT/UPDATE/DELETE for clarity)
CREATE POLICY demo_deny_write_lesson_entries ON public.lesson_entries
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_update_lesson_entries ON public.lesson_entries
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_delete_lesson_entries ON public.lesson_entries
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

-- catalog_items
CREATE POLICY demo_deny_write_catalog_items ON public.catalog_items
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

-- repertoire_tags (INSERT/UPDATE/DELETE only — SELECT must remain allowed)
CREATE POLICY demo_deny_insert_repertoire_tags ON public.repertoire_tags
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_update_repertoire_tags ON public.repertoire_tags
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_delete_repertoire_tags ON public.repertoire_tags
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

-- student_profiles (INSERT/UPDATE/DELETE only — SELECT must remain allowed)
CREATE POLICY demo_deny_write_student_profiles ON public.student_profiles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_update_student_profiles ON public.student_profiles
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_delete_student_profiles ON public.student_profiles
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

-- practice_assignments
CREATE POLICY demo_deny_write_practice_assignments ON public.practice_assignments
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);

CREATE POLICY demo_deny_update_practice_assignments ON public.practice_assignments
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false)
  WITH CHECK (coalesce((auth.jwt()->'user_metadata'->>'is_demo')::boolean, false) = false);
