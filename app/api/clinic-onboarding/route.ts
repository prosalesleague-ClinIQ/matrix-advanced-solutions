import { NextRequest, NextResponse } from 'next/server'
import { onboardingSchema } from '@/lib/forms/validation'
import { formatWebhookPayload, type LeadPayload } from '@/lib/forms/submit'
import { buildWebhookConfigs, sendToWebhook } from '@/lib/automation/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required fields to begin onboarding.' },
        { status: 400 }
      )
    }

    const lead: LeadPayload = {
      ...parsed.data,
      inquiryType: 'clinic_onboarding',
      smsConsentService: Boolean(parsed.data.smsConsentService),
      smsConsentMarketing: Boolean(parsed.data.smsConsentMarketing),
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? undefined,
      smsConsentUserAgent: request.headers.get('user-agent') ?? undefined,
    }

    const payload = formatWebhookPayload(lead)

    const webhookConfigs = buildWebhookConfigs()
    await Promise.allSettled(
      webhookConfigs.map((config) => sendToWebhook(config, payload))
    )

    console.log('[Matrix API] Onboarding request processed', {
      inquiryType: 'clinic_onboarding',
      clinicType: lead.clinicType,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Your onboarding application has been received. Our team will review your information and reach out within 1–2 business days with next steps.',
    })
  } catch (error) {
    console.error('[Matrix API] Onboarding request error', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
