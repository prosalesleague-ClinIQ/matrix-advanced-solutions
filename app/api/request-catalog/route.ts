import { NextRequest, NextResponse } from 'next/server'
import { catalogRequestSchema } from '@/lib/forms/validation'
import { formatWebhookPayload, type LeadPayload } from '@/lib/forms/submit'
import { buildWebhookConfigs, sendToWebhook } from '@/lib/automation/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = catalogRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      )
    }

    const lead: LeadPayload = {
      ...parsed.data,
      inquiryType: 'catalog_request',
    }

    const payload = formatWebhookPayload(lead)

    const webhookConfigs = buildWebhookConfigs()
    await Promise.allSettled(
      webhookConfigs.map((config) => sendToWebhook(config, payload))
    )

    console.log('[Matrix API] Catalog request processed', {
      inquiryType: 'catalog_request',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Your catalog request has been received. Our team will send catalog access details within one business day.',
    })
  } catch (error) {
    console.error('[Matrix API] Catalog request error', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
