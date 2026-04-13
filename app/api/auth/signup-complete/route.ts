/**
 * POST /api/auth/signup-complete
 *
 * Called by the signup form after supabase.auth.signUp() succeeds, on the
 * freshly-authenticated session. All identity data (email, full_name,
 * clinic_id, clinic_name) is read from the server-side session + DB —
 * never from the request body — so a caller cannot impersonate another
 * clinic or pollute GHL with fake data.
 *
 * Triggers:
 *   1. GHL contact upsert + NEEDS_ADMIN_REVIEW tag + admin task
 *      (via syncNewSignup → lib/ghl/sync)
 *
 * This route replaces the old /api/auth/sync-signup which accepted
 * unauthenticated input and was an abuse vector.
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncNewSignup } from '@/lib/ghl/sync'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Caller must be authenticated — if they're not, just exit quietly.
    // We return 200 either way so the signup UX never blocks.
    if (authError || !user) {
      return NextResponse.json({ ok: true })
    }

    // Read the user's own profile + clinic via the admin client.
    // (We use admin here because the signup trigger creates the rows
    // with service-role privileges and RLS may lag.)
    const admin = createAdminClient()

    const { data: profile } = await admin
      .from('users')
      .select('id, full_name, email, clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return NextResponse.json({ ok: true })
    }

    const { data: clinic } = await admin
      .from('clinics')
      .select('id, name, assigned_rep_id')
      .eq('id', profile.clinic_id)
      .single()

    if (!clinic) {
      return NextResponse.json({ ok: true })
    }

    // Look up the assigned rep's GHL user ID if one was assigned at signup
    let assignedRepGhlId: string | undefined
    if (clinic.assigned_rep_id) {
      const { data: rep } = await admin
        .from('sales_reps')
        .select('ghl_user_id')
        .eq('id', clinic.assigned_rep_id)
        .single()
      assignedRepGhlId = rep?.ghl_user_id ?? undefined
    }

    // Fire-and-forget GHL sync — never block the signup UX on CRM failures.
    syncNewSignup({
      email: profile.email,
      fullName: profile.full_name,
      clinicName: clinic.name,
      clinicId: clinic.id,
      assignedRepGhlId,
    }).catch((err) => {
      console.error('[SIGNUP_COMPLETE] GHL sync failed:', err)
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SIGNUP_COMPLETE] Unexpected error:', err)
    // Always return 200 so the signup flow is never blocked by a sync failure.
    return NextResponse.json({ ok: true })
  }
}
