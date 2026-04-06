import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('*, challenge:challenges(*)')
      .eq('auth_user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ participant })
  } catch (error) {
    console.error('Challenge profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const ALLOWED_UPDATE_FIELDS = [
  'full_name',
  'age',
  'gender',
  'height_inches',
  'starting_weight',
  'goals',
  'current_medications',
  'current_protocols',
  'baseline_weight',
  'baseline_body_fat',
  'baseline_waist',
  'baseline_hips',
  'baseline_chest',
  'baseline_arms',
  'baseline_thighs',
  'current_phase',
  'status',
] as const

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Filter to allowed fields only
    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_UPDATE_FIELDS) {
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

    const { data: participant, error: updateError } = await admin
      .from('challenge_participants')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ participant })
  } catch (error) {
    console.error('Challenge profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
