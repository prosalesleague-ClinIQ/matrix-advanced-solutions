import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncInactiveClinic } from '@/lib/ghl/sync'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const cutoff = ninetyDaysAgo.toISOString()

    // Find clinics with onboarding approved that are currently active
    // but have no orders in the last 90 days
    const { data: clinics, error: clinicsError } = await admin
      .from('clinics')
      .select('id, name, primary_email, notes')
      .eq('onboarding_status', 'approved')

    if (clinicsError || !clinics) {
      console.error('[CRON_INACTIVE] Failed to fetch clinics:', clinicsError)
      return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 })
    }

    const inactiveClinics: string[] = []

    for (const clinic of clinics) {
      // Check if clinic already marked inactive
      if (clinic.notes?.includes('[INACTIVE]')) {
        continue
      }

      // Check for recent orders
      const { data: recentOrders } = await admin
        .from('orders')
        .select('id')
        .eq('clinic_id', clinic.id)
        .gte('created_at', cutoff)
        .limit(1)

      if (!recentOrders || recentOrders.length === 0) {
        // Check if they have ANY orders (skip clinics that never ordered)
        const { data: anyOrders } = await admin
          .from('orders')
          .select('id')
          .eq('clinic_id', clinic.id)
          .limit(1)

        if (anyOrders && anyOrders.length > 0) {
          // Mark as inactive
          const note = clinic.notes
            ? `${clinic.notes}\n[INACTIVE] Marked inactive on ${new Date().toISOString().split('T')[0]} — no orders in 90 days`
            : `[INACTIVE] Marked inactive on ${new Date().toISOString().split('T')[0]} — no orders in 90 days`

          await admin
            .from('clinics')
            .update({ notes: note })
            .eq('id', clinic.id)

          // GHL sync (fire-and-forget)
          syncInactiveClinic(clinic.primary_email).catch(() => {})

          inactiveClinics.push(clinic.id)
        }
      }
    }

    return NextResponse.json({
      processed: clinics.length,
      markedInactive: inactiveClinics.length,
      clinicIds: inactiveClinics,
    })
  } catch (err) {
    console.error('[CRON_INACTIVE] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
