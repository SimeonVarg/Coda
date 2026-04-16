-- ============================================================
-- Migration 014: World Music & Ethnomusicology Catalog Extension
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Add new columns to catalog_items
-- ----------------------------------------------------------------
ALTER TABLE public.catalog_items
  ADD COLUMN IF NOT EXISTS tradition        text,
  ADD COLUMN IF NOT EXISTS region           text,
  ADD COLUMN IF NOT EXISTS tuning_system    text,
  ADD COLUMN IF NOT EXISTS cultural_context text CHECK (length(trim(coalesce(cultural_context, ''))) <= 500),
  ADD COLUMN IF NOT EXISTS language         text;

-- ----------------------------------------------------------------
-- 2. Regenerate search_vector to include new fields
--    (Drop the generated column and recreate it)
-- ----------------------------------------------------------------
ALTER TABLE public.catalog_items DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.catalog_items
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(composer, '') || ' ' ||
      coalesce(tradition, '') || ' ' ||
      coalesce(region, '') || ' ' ||
      coalesce(cultural_context, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS catalog_items_search_vector_idx
  ON public.catalog_items USING GIN (search_vector);
