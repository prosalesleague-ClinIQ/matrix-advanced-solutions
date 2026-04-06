/**
 * MuscleLock Transformation Study — Convenience Types
 */

import type {
  Challenge,
  ChallengeParticipant,
  ChallengeEntry,
  ChallengePhase,
  Json,
} from './database'

export type { Challenge, ChallengeParticipant, ChallengeEntry, ChallengePhase }

export interface ChallengePhaseDefinition {
  phase: number
  name: string
  weeks: string
  description: string
}

export interface ChallengeSignupData {
  email: string
  password: string
  full_name: string
  age?: number
  gender?: string
  height_inches?: number
  starting_weight?: number
  goals?: string
  current_medications?: string
  current_protocols?: string
}

export interface CheckInFormData {
  week_number: number
  phase: ChallengePhase
  weight?: number
  body_fat_pct?: number
  waist?: number
  hips?: number
  chest?: number
  arms?: number
  thighs?: number
  resting_hr?: number
  blood_pressure_sys?: number
  blood_pressure_dia?: number
  energy_level?: number
  sleep_quality?: number
  notes?: string
  diet_notes?: string
  exercise_notes?: string
}

export interface ParticipantWithChallenge extends ChallengeParticipant {
  challenge: Challenge
}

export function parsePhases(phases: Json): ChallengePhaseDefinition[] {
  if (Array.isArray(phases)) {
    return phases as unknown as ChallengePhaseDefinition[]
  }
  return []
}

export const MEASUREMENT_FIELDS = [
  { key: 'weight', label: 'Weight', unit: 'lbs' },
  { key: 'body_fat_pct', label: 'Body Fat', unit: '%' },
  { key: 'waist', label: 'Waist', unit: 'in' },
  { key: 'hips', label: 'Hips', unit: 'in' },
  { key: 'chest', label: 'Chest', unit: 'in' },
  { key: 'arms', label: 'Arms', unit: 'in' },
  { key: 'thighs', label: 'Thighs', unit: 'in' },
] as const

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]['key']
