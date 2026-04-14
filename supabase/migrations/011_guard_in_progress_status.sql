-- ============================================================
-- 011: Guard — ensure 'in_progress' is in repertoire_tags CHECK
-- ============================================================
-- Migration 003 already added 'in_progress' to the CHECK constraint.
-- This migration is a no-op guard that re-applies the constraint
-- idempotently, ensuring new deployments that skip 003 are still valid.

ALTER TABLE public.repertoire_tags
  DROP CONSTRAINT IF EXISTS repertoire_tags_status_check;

ALTER TABLE public.repertoire_tags
  ADD CONSTRAINT repertoire_tags_status_check
    CHECK (status IN ('introduced', 'in_progress', 'mastered', 'completed'));
