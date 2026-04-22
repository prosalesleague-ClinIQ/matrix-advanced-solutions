import { NextRequest, NextResponse } from 'next/server'
import { catalogRequestSchema, catalogFunnelSchema } from '@/lib/forms/validation'
import { formatWebhookPayload, type LeadPayload } from '@/lib/forms/submit'
import { buildWebhookConfigs, sendToWebhook } from '@/lib/automation/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Accept both the full catalog request schema and the simpler funnel schema
    const fullParsed = catalogRequestSchema.safeParse(body)
    const funnelParsed = catalogFunnelSchema.safeParse(body)

    if (!fullParsed.success && !funnelParsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      )
    }

    const data = fullParsed.success ? fullParsed.data : funnelParsed.data!

    const lead: LeadPayload = {
      ...data,
      inquiryType: 'catalog_request',
      smsConsentService: Boolean(data.smsConsentService),
      smsConsentMarketing: Boolean(data.smsConsentMarketing),
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? undefined,
      smsConsentUserAgent: request.headers.get('user-agent') ?? undefined,
    }

    const payload = formatWebhookPayload(lead)

    const webhookConfigs = buildWebhookConfigs()
    await Promise.allSettled(
      webhookConfigs.map((config) => sendToWebhook(config, payload))
    )

    console.log('[Matrix API] Catalog request processed', {
      inquiryType: 'catalog_request',
      smsConsentService: lead.smsConsentService,
      smsConsentMarketing: lead.smsConsentMarketing,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Your catalog request has been received. We will send your full catalog and pricing within one business day.',
    })
  } catch (error) {
    console.error('[Matrix API] Catalog request error', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
