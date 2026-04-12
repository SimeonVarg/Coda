-- Migration: 002_catalog_insert_policy.sql
-- Adds a teacher-only INSERT policy on catalog_items

CREATE POLICY "teachers_insert_catalog" ON public.catalog_items
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'teacher'
  );
