import { getPageContext, parseUTMParams } from '@/lib/analytics/utm'
import { trackFormSubmit } from '@/lib/analytics/track'

export type LeadPayload = {
  clinicName: string
  contactName: string
  role?: string
  email: string
  phone: string
  state?: string
  specialty?: string
  clinicType?: string
  providerCount?: string
  categoriesOfInterest?: string[]
  urgency?: string
  notes?: string
  referralSource?: string
  inquiryType: string
  smsConsentService?: boolean
  smsConsentMarketing?: boolean
  smsConsentTimestamp?: string
}

export type WebhookPayload = LeadPayload & {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
  landingPage: string
  referrer: string
  timestamp: string
}

export function formatWebhookPayload(lead: LeadPayload): WebhookPayload {
  const utm = parseUTMParams()
  const context = getPageContext()

  return {
    ...lead,
    ...utm,
    ...context,
  }
}

export type SubmitResult = {
  success: boolean
  message: string
}

export async function submitLead(
  endpoint: string,
  lead: LeadPayload,
  formName: string
): Promise<SubmitResult> {
  const payload = formatWebhookPayload(lead)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    trackFormSubmit(formName, payload.landingPage)

    return {
      success: true,
      message: 'Your inquiry has been submitted. Our team will be in touch within one business day.',
    }
  } catch (error) {
    console.error('[Matrix Form Error]', { endpoint, formName, error })

    return {
      success: false,
      message: 'Something went wrong. Please try again or contact us directly.',
    }
  }
}
