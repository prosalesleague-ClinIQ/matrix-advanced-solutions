import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CheckInFormData } from '@/lib/types/challenge'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Fetch entries
    const { data: entries, error: entriesError } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('participant_id', participant.id)
      .order('week_number', { ascending: true })

    if (entriesError) {
      console.error('[CHALLENGE_ENTRIES] GET db error:', entriesError)
      return NextResponse.json(
        { error: 'Failed to load entries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Challenge entries GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CheckInFormData = await request.json()
    const {
      week_number,
      phase,
      weight,
      body_fat_pct,
      waist,
      hips,
      chest,
      arms,
      thighs,
      resting_hr,
      blood_pressure_sys,
      blood_pressure_dia,
      energy_level,
      sleep_quality,
      notes,
      diet_notes,
      exercise_notes,
    } = body

    if (week_number === undefined || !phase) {
      return NextResponse.json(
        { error: 'week_number and phase are required' },
        { status: 400 }
      )
    }

    // Get participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id, challenge_id')
      .eq('auth_user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    // Insert entry
    const { data: entry, error: entryError } = await admin
      .from('challenge_entries')
      .insert({
        participant_id: participant.id,
        challenge_id: participant.challenge_id,
        week_number,
        phase,
        weight: weight ?? null,
        body_fat_pct: body_fat_pct ?? null,
        waist: waist ?? null,
        hips: hips ?? null,
        chest: chest ?? null,
        arms: arms ?? null,
        thighs: thighs ?? null,
        resting_hr: resting_hr ?? null,
        blood_pressure_sys: blood_pressure_sys ?? null,
        blood_pressure_dia: blood_pressure_dia ?? null,
        energy_level: energy_level ?? null,
        sleep_quality: sleep_quality ?? null,
        notes: notes ?? null,
        diet_notes: diet_notes ?? null,
        exercise_notes: exercise_notes ?? null,
      })
      .select()
      .single()

    if (entryError) {
      console.error('[CHALLENGE_ENTRIES] POST db error:', entryError)
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      )
    }

    // If first entry (baseline), update participant status and baseline fields
    if (week_number === 0 && phase === 'baseline') {
      const baselineUpdates: Record<string, unknown> = {
        status: 'active' as const,
      }

      if (weight !== undefined) baselineUpdates.baseline_weight = weight
      if (body_fat_pct !== undefined) baselineUpdates.baseline_body_fat = body_fat_pct
      if (waist !== undefined) baselineUpdates.baseline_waist = waist
      if (hips !== undefined) baselineUpdates.baseline_hips = hips
      if (chest !== undefined) baselineUpdates.baseline_chest = chest
      if (arms !== undefined) baselineUpdates.baseline_arms = arms
      if (thighs !== undefined) baselineUpdates.baseline_thighs = thighs

      await admin
        .from('challenge_participants')
        .update(baselineUpdates)
        .eq('id', participant.id)
    } else if (phase === 'baseline') {
      // Non-zero week baseline entries still update baseline fields
      const baselineUpdates: Record<string, unknown> = {}

      if (weight !== undefined) baselineUpdates.baseline_weight = weight
      if (body_fat_pct !== undefined) baselineUpdates.baseline_body_fat = body_fat_pct
      if (waist !== undefined) baselineUpdates.baseline_waist = waist
      if (hips !== undefined) baselineUpdates.baseline_hips = hips
      if (chest !== undefined) baselineUpdates.baseline_chest = chest
      if (arms !== undefined) baselineUpdates.baseline_arms = arms
      if (thighs !== undefined) baselineUpdates.baseline_thighs = thighs

      if (Object.keys(baselineUpdates).length > 0) {
        await admin
          .from('challenge_participants')
          .update(baselineUpdates)
          .eq('id', participant.id)
      }
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Challenge entries POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
