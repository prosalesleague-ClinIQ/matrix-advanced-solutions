-- Migration 007: Clinic Onboarding
-- Adds onboarding status, compliance fields, and review tracking to clinics table.

-- New enum for onboarding status
CREATE TYPE onboarding_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');

-- New columns on clinics table
ALTER TABLE clinics
  ADD COLUMN onboarding_status       onboarding_status NOT NULL DEFAULT 'pending',
  ADD COLUMN practice_type           TEXT,
  ADD COLUMN medical_license         TEXT,
  ADD COLUMN npi_number              TEXT,
  ADD COLUMN onboarding_submitted_at TIMESTAMPTZ,
  ADD COLUMN onboarding_reviewed_at  TIMESTAMPTZ,
  ADD COLUMN onboarding_reviewed_by  UUID REFERENCES auth.users(id),
  ADD COLUMN onboarding_rejection_reason TEXT;

-- Backfill: existing clinics that have completed orders are auto-approved
UPDATE clinics SET onboarding_status = 'approved' WHERE completed_order_count > 0;

-- Index for admin queries filtering by onboarding status
CREATE INDEX idx_clinics_onboarding_status ON clinics(onboarding_status);
