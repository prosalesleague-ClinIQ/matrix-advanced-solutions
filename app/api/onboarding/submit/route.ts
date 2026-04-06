import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { onboardingSubmitSchema } from '@/lib/validation'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { syncOnboardingSubmitted } from '@/lib/ghl/sync'

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
    const parsed = onboardingSubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const admin = createAdminClient()

    const { error } = await admin
      .from('clinics')
      .update({
        name: data.name,
        primary_contact_name: data.primaryContactName,
        primary_phone: data.primaryPhone,
        business_address: data.businessAddress,
        tax_id: data.taxId,
        shipping_address: data.shippingAddress,
        practice_type: data.practiceType,
        medical_license: data.medicalLicense || null,
        npi_number: data.npiNumber || null,
        assigned_rep_id: data.assignedRepId || null,
        onboarding_status: 'submitted',
        onboarding_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.clinic_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    }

    // Audit log (fire-and-forget)
    writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.ONBOARDING_SUBMITTED,
      entityType: 'clinic',
      entityId: profile.clinic_id,
      afterState: JSON.parse(JSON.stringify(data)),
    })

    // Get assigned rep's GHL user ID for CRM sync
    let assignedRepGhlId: string | undefined
    if (data.assignedRepId) {
      const { data: rep } = await admin
        .from('sales_reps')
        .select('ghl_user_id')
        .eq('id', data.assignedRepId)
        .single()
      assignedRepGhlId = rep?.ghl_user_id ?? undefined
    }

    // GHL sync (fire-and-forget)
    syncOnboardingSubmitted({
      email: user.email!,
      clinicName: data.name,
      practiceType: data.practiceType,
      medicalLicense: data.medicalLicense || '',
      npiNumber: data.npiNumber || '',
      assignedRepGhlId,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
