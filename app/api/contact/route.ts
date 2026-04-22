import { NextRequest, NextResponse } from 'next/server'
import { contactSchema } from '@/lib/forms/validation'
import { formatWebhookPayload, type LeadPayload } from '@/lib/forms/submit'
import { buildWebhookConfigs, sendToWebhook } from '@/lib/automation/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      )
    }

    const lead: LeadPayload = {
      ...parsed.data,
      inquiryType: parsed.data.inquiryType || 'general',
      smsConsentService: Boolean(parsed.data.smsConsentService),
      smsConsentMarketing: Boolean(parsed.data.smsConsentMarketing),
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? undefined,
      smsConsentUserAgent: request.headers.get('user-agent') ?? undefined,
    }

    // Format webhook payload
    const payload = formatWebhookPayload(lead)

    // Send to configured webhooks
    const webhookConfigs = buildWebhookConfigs()
    const webhookResults = await Promise.allSettled(
      webhookConfigs.map((config) => sendToWebhook(config, payload))
    )

    // Log results (non-sensitive)
    console.log('[Matrix API] Contact submission processed', {
      inquiryType: lead.inquiryType,
      webhooksAttempted: webhookConfigs.length,
      webhooksSucceeded: webhookResults.filter((r) => r.status === 'fulfilled').length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted. Our team will be in touch within one business day.',
    })
  } catch (error) {
    console.error('[Matrix API] Contact submission error', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
