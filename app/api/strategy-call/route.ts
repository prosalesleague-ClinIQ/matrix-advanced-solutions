import { NextRequest, NextResponse } from 'next/server'
import { strategyCallSchema } from '@/lib/forms/validation'
import { formatWebhookPayload, type LeadPayload } from '@/lib/forms/submit'
import { buildWebhookConfigs, sendToWebhook } from '@/lib/automation/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = strategyCallSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please describe your goals briefly so we can prepare for the call.' },
        { status: 400 }
      )
    }

    const lead: LeadPayload = {
      ...parsed.data,
      inquiryType: 'strategy_call',
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

    console.log('[Matrix API] Strategy call request processed', {
      inquiryType: 'strategy_call',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Your strategy call request has been received. A member of our team will reach out to schedule a time that works for you.',
    })
  } catch (error) {
    console.error('[Matrix API] Strategy call request error', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
