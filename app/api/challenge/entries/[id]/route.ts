import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get participant to verify ownership
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

    // Fetch the entry and verify it belongs to this participant
    const { data: entry, error: entryError } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('id', id)
      .eq('participant_id', participant.id)
      .single()

    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Challenge entry GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const ALLOWED_ENTRY_FIELDS = [
  'weight',
  'body_fat_pct',
  'waist',
  'hips',
  'chest',
  'arms',
  'thighs',
  'resting_hr',
  'blood_pressure_sys',
  'blood_pressure_dia',
  'energy_level',
  'sleep_quality',
  'notes',
  'diet_notes',
  'exercise_notes',
] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get participant to verify ownership
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

    // Verify entry belongs to participant
    const { data: existingEntry, error: existingError } = await supabase
      .from('challenge_entries')
      .select('id')
      .eq('id', id)
      .eq('participant_id', participant.id)
      .single()

    if (existingError || !existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Filter to allowed fields only
    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_ENTRY_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: entry, error: updateError } = await admin
      .from('challenge_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Challenge entry PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
