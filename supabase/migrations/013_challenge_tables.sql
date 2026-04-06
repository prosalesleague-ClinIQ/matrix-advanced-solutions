-- ============================================================
-- Migration 013: MuscleLock Transformation Study tables
-- ============================================================

-- Enums
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'paused', 'archived');
CREATE TYPE participant_status AS ENUM ('registered', 'active', 'completed', 'withdrawn');
CREATE TYPE challenge_phase AS ENUM ('baseline', 'protocol', 'results');

-- ============================================================
-- TABLE: challenges (study definitions)
-- ============================================================
CREATE TABLE challenges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  description     text,
  duration_weeks  integer NOT NULL DEFAULT 12,
  phases          jsonb NOT NULL DEFAULT '[
    {"phase": 1, "name": "Baseline Documentation", "weeks": "0", "description": "Body measurements, photography, and metabolic baseline."},
    {"phase": 2, "name": "12-Week Protocol", "weeks": "1-12", "description": "Daily tracking, weekly check-ins, and progress analytics."},
    {"phase": 3, "name": "Results Analysis", "weeks": "12+", "description": "Lean mass retention, body composition, metabolic outcomes."}
  ]'::jsonb,
  status          challenge_status NOT NULL DEFAULT 'active',
  starts_at       timestamptz,
  ends_at         timestamptz,
  max_participants integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed the initial MuscleLock study
INSERT INTO challenges (name, slug, description, duration_weeks)
VALUES (
  'MuscleLock Transformation Study',
  'musclelock-12-week',
  'A structured 12-week protocol tracking body composition, lean mass retention, and metabolic markers. Document your transformation with before/after photography, detailed measurements, and progress analytics.',
  12
);

-- ============================================================
-- TABLE: challenge_participants (user profiles)
-- ============================================================
CREATE TABLE challenge_participants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id        uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status              participant_status NOT NULL DEFAULT 'registered',
  current_phase       challenge_phase NOT NULL DEFAULT 'baseline',

  -- Profile
  full_name           text NOT NULL,
  email               text NOT NULL,
  age                 integer,
  gender              text,
  height_inches       numeric(5,1),
  starting_weight     numeric(6,1),
  goals               text,
  profile_photo_url   text,
  current_medications text,
  current_protocols   text,

  -- Baseline measurements
  baseline_weight     numeric(6,1),
  baseline_body_fat   numeric(4,1),
  baseline_waist      numeric(5,1),
  baseline_hips       numeric(5,1),
  baseline_chest      numeric(5,1),
  baseline_arms       numeric(5,1),
  baseline_thighs     numeric(5,1),

  enrolled_at         timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE(auth_user_id, challenge_id)
);

-- ============================================================
-- TABLE: challenge_entries (weekly check-ins)
-- ============================================================
CREATE TABLE challenge_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id      uuid NOT NULL REFERENCES challenge_participants(id) ON DELETE CASCADE,
  challenge_id        uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  week_number         integer NOT NULL,
  phase               challenge_phase NOT NULL,
  entry_date          date NOT NULL DEFAULT CURRENT_DATE,

  -- Measurements
  weight              numeric(6,1),
  body_fat_pct        numeric(4,1),
  waist               numeric(5,1),
  hips                numeric(5,1),
  chest               numeric(5,1),
  arms                numeric(5,1),
  thighs              numeric(5,1),

  -- Metabolic markers
  resting_hr          integer,
  blood_pressure_sys  integer,
  blood_pressure_dia  integer,
  energy_level        integer CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality       integer CHECK (sleep_quality BETWEEN 1 AND 10),

  -- Photos (Supabase Storage URLs)
  photo_front_url     text,
  photo_side_url      text,
  photo_back_url      text,

  -- Notes
  notes               text,
  diet_notes          text,
  exercise_notes      text,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE(participant_id, week_number)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;

-- challenges: readable by everyone
CREATE POLICY "challenges_select_all"
  ON challenges FOR SELECT USING (true);

CREATE POLICY "challenges_admin_insert"
  ON challenges FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'matrix_admin'));

CREATE POLICY "challenges_admin_update"
  ON challenges FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'matrix_admin'));

-- challenge_participants: own data + admin read
CREATE POLICY "participants_select_own"
  ON challenge_participants FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "participants_select_admin"
  ON challenge_participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('matrix_admin', 'matrix_staff')));

CREATE POLICY "participants_insert_own"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "participants_update_own"
  ON challenge_participants FOR UPDATE
  USING (auth_user_id = auth.uid());

-- challenge_entries: own data + admin read
CREATE POLICY "entries_select_own"
  ON challenge_entries FOR SELECT
  USING (participant_id IN (SELECT id FROM challenge_participants WHERE auth_user_id = auth.uid()));

CREATE POLICY "entries_select_admin"
  ON challenge_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('matrix_admin', 'matrix_staff')));

CREATE POLICY "entries_insert_own"
  ON challenge_entries FOR INSERT
  WITH CHECK (participant_id IN (SELECT id FROM challenge_participants WHERE auth_user_id = auth.uid()));

CREATE POLICY "entries_update_own"
  ON challenge_entries FOR UPDATE
  USING (participant_id IN (SELECT id FROM challenge_participants WHERE auth_user_id = auth.uid()));

-- ============================================================
-- Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_challenge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_challenge_updated_at();

CREATE TRIGGER challenge_participants_updated_at
  BEFORE UPDATE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_challenge_updated_at();

CREATE TRIGGER challenge_entries_updated_at
  BEFORE UPDATE ON challenge_entries
  FOR EACH ROW EXECUTE FUNCTION update_challenge_updated_at();
