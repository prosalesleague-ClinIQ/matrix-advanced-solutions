import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ChallengeSignupData } from '@/lib/types/challenge'

export async function POST(request: Request) {
  try {
    const body: ChallengeSignupData = await request.json()
    const { email, password, full_name, age, gender, height_inches, starting_weight, goals, current_medications, current_protocols } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Create auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message?.includes('already been registered') || authError.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const authUserId = authData.user.id

    // Find the active challenge
    const { data: challenge, error: challengeError } = await admin
      .from('challenges')
      .select('id')
      .eq('status', 'active')
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'No active challenge found' },
        { status: 404 }
      )
    }

    // Create participant record
    const { data: participant, error: participantError } = await admin
      .from('challenge_participants')
      .insert({
        auth_user_id: authUserId,
        challenge_id: challenge.id,
        full_name,
        email,
        age: age ?? null,
        gender: gender ?? null,
        height_inches: height_inches ?? null,
        starting_weight: starting_weight ?? null,
        goals: goals ?? null,
        current_medications: current_medications ?? null,
        current_protocols: current_protocols ?? null,
        status: 'registered',
        current_phase: 'baseline',
      })
      .select('id')
      .single()

    if (participantError) {
      return NextResponse.json(
        { error: participantError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      participantId: participant.id,
    })
  } catch (error) {
    console.error('Challenge signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
