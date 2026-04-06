import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { syncOnboardingApproved, syncOnboardingRejected } from '@/lib/ghl/sync'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) {
    return null
  }

  return user
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clinicId, action, reason, assignedRepId } = body

    if (!clinicId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'clinicId and action (approve|reject) are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Fetch clinic
    const { data: clinic, error: clinicError } = await admin
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    // Look up sales rep GHL user ID if assignedRepId provided
    let repGhlUserId: string | undefined
    if (assignedRepId) {
      const { data: rep } = await admin
        .from('sales_reps')
        .select('ghl_user_id')
        .eq('id', assignedRepId)
        .single()

      repGhlUserId = rep?.ghl_user_id ?? undefined
    }

    const now = new Date().toISOString()

    if (action === 'approve') {
      const updateData: Record<string, unknown> = {
        onboarding_status: 'approved',
        onboarding_reviewed_at: now,
        onboarding_reviewed_by: user.id,
      }

      if (assignedRepId) {
        updateData.assigned_rep_id = assignedRepId
      }

      const { error: updateError } = await admin
        .from('clinics')
        .update(updateData)
        .eq('id', clinicId)

      if (updateError) {
        console.error('[ONBOARDING_REVIEW] Approve error:', updateError)
        return NextResponse.json({ error: 'Failed to approve clinic' }, { status: 500 })
      }

      await writeAuditLog(admin, {
        userId: user.id,
        action: AUDIT_ACTIONS.ONBOARDING_APPROVED,
        entityType: 'clinic',
        entityId: clinicId,
        beforeState: { onboarding_status: clinic.onboarding_status },
        afterState: { onboarding_status: 'approved', assigned_rep_id: assignedRepId },
      })

      // GHL sync (fire-and-forget)
      syncOnboardingApproved({
        clinicEmail: clinic.primary_email,
        assignedRepGhlId: repGhlUserId,
      }).catch(() => {})

      return NextResponse.json({ status: 'approved', clinicId })
    } else {
      // Reject
      if (!reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const { error: updateError } = await admin
        .from('clinics')
        .update({
          onboarding_status: 'rejected',
          onboarding_rejection_reason: reason,
          onboarding_reviewed_at: now,
          onboarding_reviewed_by: user.id,
        })
        .eq('id', clinicId)

      if (updateError) {
        console.error('[ONBOARDING_REVIEW] Reject error:', updateError)
        return NextResponse.json({ error: 'Failed to reject clinic' }, { status: 500 })
      }

      await writeAuditLog(admin, {
        userId: user.id,
        action: AUDIT_ACTIONS.ONBOARDING_REJECTED,
        entityType: 'clinic',
        entityId: clinicId,
        beforeState: { onboarding_status: clinic.onboarding_status },
        afterState: { onboarding_status: 'rejected', reason },
        reason,
      })

      // GHL sync (fire-and-forget)
      syncOnboardingRejected(clinic.primary_email).catch(() => {})

      return NextResponse.json({ status: 'rejected', clinicId })
    }
  } catch (err) {
    console.error('[ONBOARDING_REVIEW] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
