'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhotoUpload } from '@/components/challenge/photo-upload'
import type { ChallengePhase, CheckInFormData } from '@/lib/types/challenge'
import type { ChallengeEntry } from '@/lib/types/database'

interface CheckInFormProps {
  weekNumber: number
  phase: ChallengePhase
  existingEntry?: ChallengeEntry
  participantId: string
  challengeId: string
  onSuccess?: () => void
}

const PHASE_LABELS: Record<ChallengePhase, string> = {
  baseline: 'Baseline',
  protocol: 'Protocol',
  results: 'Results',
}

export function CheckInForm({
  weekNumber,
  phase,
  existingEntry,
  participantId,
  challengeId,
  onSuccess,
}: CheckInFormProps) {
  const isEdit = !!existingEntry

  const [formData, setFormData] = useState<CheckInFormData>({
    week_number: weekNumber,
    phase,
    weight: existingEntry?.weight ?? undefined,
    body_fat_pct: existingEntry?.body_fat_pct ?? undefined,
    waist: existingEntry?.waist ?? undefined,
    hips: existingEntry?.hips ?? undefined,
    chest: existingEntry?.chest ?? undefined,
    arms: existingEntry?.arms ?? undefined,
    thighs: existingEntry?.thighs ?? undefined,
    resting_hr: existingEntry?.resting_hr ?? undefined,
    blood_pressure_sys: existingEntry?.blood_pressure_sys ?? undefined,
    blood_pressure_dia: existingEntry?.blood_pressure_dia ?? undefined,
    energy_level: existingEntry?.energy_level ?? undefined,
    sleep_quality: existingEntry?.sleep_quality ?? undefined,
    notes: existingEntry?.notes ?? undefined,
    diet_notes: existingEntry?.diet_notes ?? undefined,
    exercise_notes: existingEntry?.exercise_notes ?? undefined,
  })

  const [photoFrontUrl, setPhotoFrontUrl] = useState(
    existingEntry?.photo_front_url ?? ''
  )
  const [photoSideUrl, setPhotoSideUrl] = useState(
    existingEntry?.photo_side_url ?? ''
  )
  const [photoBackUrl, setPhotoBackUrl] = useState(
    existingEntry?.photo_back_url ?? ''
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (
    field: keyof CheckInFormData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const numericChange = (field: keyof CheckInFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      updateField(field, raw === '' ? undefined : parseFloat(raw))
    }
  }

  const numericValue = (val: number | undefined) =>
    val != null ? String(val) : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const payload = {
      ...formData,
      participant_id: participantId,
      challenge_id: challengeId,
      photo_front_url: photoFrontUrl || null,
      photo_side_url: photoSideUrl || null,
      photo_back_url: photoBackUrl || null,
    }

    try {
      const url = isEdit
        ? `/api/challenge/entries/${existingEntry.id}`
        : '/api/challenge/entries'

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to save entry')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-r from-accent-purple to-accent-cyan px-3 py-1 text-sm font-semibold text-white">
          Week {weekNumber}
        </div>
        <span className="text-sm text-steel-400">
          {PHASE_LABELS[phase]} Phase
        </span>
      </div>

      {/* Body Measurements */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-semibold text-white">
            Body Measurements
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Input
              id="weight"
              label="Weight (lbs)"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={numericValue(formData.weight)}
              onChange={numericChange('weight')}
            />
            <Input
              id="body_fat_pct"
              label="Body Fat (%)"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={numericValue(formData.body_fat_pct)}
              onChange={numericChange('body_fat_pct')}
            />
            <Input
              id="waist"
              label="Waist (in)"
              type="number"
              step="0.25"
              placeholder="0.0"
              value={numericValue(formData.waist)}
              onChange={numericChange('waist')}
            />
            <Input
              id="hips"
              label="Hips (in)"
              type="number"
              step="0.25"
              placeholder="0.0"
              value={numericValue(formData.hips)}
              onChange={numericChange('hips')}
            />
            <Input
              id="chest"
              label="Chest (in)"
              type="number"
              step="0.25"
              placeholder="0.0"
              value={numericValue(formData.chest)}
              onChange={numericChange('chest')}
            />
            <Input
              id="arms"
              label="Arms (in)"
              type="number"
              step="0.25"
              placeholder="0.0"
              value={numericValue(formData.arms)}
              onChange={numericChange('arms')}
            />
            <Input
              id="thighs"
              label="Thighs (in)"
              type="number"
              step="0.25"
              placeholder="0.0"
              value={numericValue(formData.thighs)}
              onChange={numericChange('thighs')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metabolic Markers */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-semibold text-white">
            Metabolic Markers
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Input
              id="resting_hr"
              label="Resting HR (bpm)"
              type="number"
              step="1"
              placeholder="60"
              value={numericValue(formData.resting_hr)}
              onChange={numericChange('resting_hr')}
            />
            <Input
              id="blood_pressure_sys"
              label="BP Systolic"
              type="number"
              step="1"
              placeholder="120"
              value={numericValue(formData.blood_pressure_sys)}
              onChange={numericChange('blood_pressure_sys')}
            />
            <Input
              id="blood_pressure_dia"
              label="BP Diastolic"
              type="number"
              step="1"
              placeholder="80"
              value={numericValue(formData.blood_pressure_dia)}
              onChange={numericChange('blood_pressure_dia')}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="energy_level"
                className="block text-sm font-medium text-steel-300"
              >
                Energy Level (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="energy_level"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.energy_level ?? 5}
                  onChange={(e) =>
                    updateField('energy_level', parseInt(e.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-cyan"
                />
                <span className="w-6 text-center text-sm font-semibold text-accent-cyan">
                  {formData.energy_level ?? 5}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="sleep_quality"
                className="block text-sm font-medium text-steel-300"
              >
                Sleep Quality (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="sleep_quality"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.sleep_quality ?? 5}
                  onChange={(e) =>
                    updateField('sleep_quality', parseInt(e.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-cyan"
                />
                <span className="w-6 text-center text-sm font-semibold text-accent-cyan">
                  {formData.sleep_quality ?? 5}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Photos */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-semibold text-white">
            Progress Photos
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PhotoUpload
              label="Front"
              participantId={participantId}
              weekNumber={weekNumber}
              position="front"
              currentUrl={existingEntry?.photo_front_url ?? undefined}
              onUpload={setPhotoFrontUrl}
            />
            <PhotoUpload
              label="Side"
              participantId={participantId}
              weekNumber={weekNumber}
              position="side"
              currentUrl={existingEntry?.photo_side_url ?? undefined}
              onUpload={setPhotoSideUrl}
            />
            <PhotoUpload
              label="Back"
              participantId={participantId}
              weekNumber={weekNumber}
              position="back"
              currentUrl={existingEntry?.photo_back_url ?? undefined}
              onUpload={setPhotoBackUrl}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-semibold text-white">Notes</h3>
          <div className="space-y-4">
            <Textarea
              id="notes"
              label="General Notes"
              placeholder="How are you feeling this week?"
              value={formData.notes ?? ''}
              onChange={(e) => updateField('notes', e.target.value || undefined)}
            />
            <Textarea
              id="diet_notes"
              label="Diet Notes"
              placeholder="Any dietary changes, observations, or challenges?"
              value={formData.diet_notes ?? ''}
              onChange={(e) =>
                updateField('diet_notes', e.target.value || undefined)
              }
            />
            <Textarea
              id="exercise_notes"
              label="Exercise Notes"
              placeholder="Training volume, intensity, recovery?"
              value={formData.exercise_notes ?? ''}
              onChange={(e) =>
                updateField('exercise_notes', e.target.value || undefined)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Check-In' : 'Submit Check-In'}
        </Button>
      </div>
    </form>
  )
}
