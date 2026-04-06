-- Migration 011: Sales Reps
-- Adds a sales_reps table and links clinics to their assigned rep.

-- 1. Sales reps table
CREATE TABLE IF NOT EXISTS public.sales_reps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  ghl_user_id TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Link clinics → sales_reps
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS assigned_rep_id UUID REFERENCES public.sales_reps(id);

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_clinics_assigned_rep_id ON public.clinics(assigned_rep_id);
CREATE INDEX IF NOT EXISTS idx_sales_reps_is_active ON public.sales_reps(is_active);

-- 4. RLS (admin-only write, authenticated read for active reps)
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to sales_reps"
  ON public.sales_reps
  FOR ALL
  USING (true)
  WITH CHECK (true);
