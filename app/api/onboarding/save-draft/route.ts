import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Whitelisted fields a clinic user may update while drafting their
// onboarding application. Anything not in this schema is ignored —
// no way to set tier, onboarding_status, wire_verified, or other
// admin-only columns via this route.
const draftSchema = z.object({
  name: z.string().trim().max(200).optional(),
  primary_contact_name: z.string().trim().max(100).optional(),
  primary_phone: z.string().trim().max(30).optional(),
  business_address: z.string().trim().max(500).optional(),
  tax_id: z.string().trim().max(50).nullable().optional(),
  shipping_address: z.string().trim().max(500).optional(),
  practice_type: z.string().trim().max(50).nullable().optional(),
  medical_license: z.string().trim().max(50).nullable().optional(),
  npi_number: z.string().trim().max(10).nullable().optional(),
  assigned_rep_id: z.string().uuid().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = draftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid draft data' },
        { status: 400 }
      )
    }

    // parsed.data is already limited to the allowlisted fields.
    const update = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('clinics')
      .update(update)
      .eq('id', profile.clinic_id)

    if (error) {
      console.error('[ONBOARDING_SAVE_DRAFT] DB error:', error)
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ONBOARDING_SAVE_DRAFT] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
