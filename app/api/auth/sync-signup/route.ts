import { NextResponse } from 'next/server'
import { syncNewSignup } from '@/lib/ghl/sync'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, fullName, clinicName, clinicId, assignedRepGhlId } = body

    if (!email || !fullName || !clinicName || !clinicId) {
      return NextResponse.json(
        { error: 'email, fullName, clinicName, and clinicId are required' },
        { status: 400 }
      )
    }

    // Fire-and-forget — never block signup
    syncNewSignup({
      email,
      fullName,
      clinicName,
      clinicId,
      assignedRepGhlId,
    }).catch((err) => {
      console.error('[AUTH_SYNC_SIGNUP] GHL sync failed:', err)
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[AUTH_SYNC_SIGNUP] Unexpected error:', err)
    // Always return 200 — never block signup
    return NextResponse.json({ ok: true })
  }
}
