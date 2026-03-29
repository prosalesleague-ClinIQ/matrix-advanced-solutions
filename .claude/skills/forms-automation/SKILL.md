---
name: forms-automation
description: Use this skill when building any conversion form, webhook, lead payload, tracking event, or inquiry flow.
---

# Forms and Automation Skill

## Stack
- React Hook Form for state, Zod for validation
- `lib/forms/submit.ts` — submitLead(), formatWebhookPayload()
- `lib/analytics/track.ts` — trackCTA(), trackFormSubmit()
- `lib/analytics/utm.ts` — parseUTMParams(), getPageContext()

## Required forms
- Request Catalog (`/api/request-catalog`)
- Clinic Onboarding (`/api/clinic-onboarding`)
- Contact (`/api/contact`)
- Strategy Call (`/api/strategy-call`)

## Payload shape
clinicName, contactName, role, email, phone, state, specialty, clinicType, providerCount, categoriesOfInterest, urgency, notes, referralSource, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, landingPage, timestamp

## Validation
- Concise, polite, actionable messages
- Required: clinicName, contactName, role, email, phone, state
- Form-specific: categories for catalog, clinicType for onboarding, notes for strategy

## Success state
- Clear confirmation with checkmark icon
- Restate next step: "Our team will review and follow up within 1 business day"
- No vague "submitted" language

## Error state
- Calm, clear messaging. No raw stack traces.
- Preserve form state. Offer retry path.

## Hidden UTM capture
- Capture all 5 UTM params + landingPage silently
- Send empty strings for absent values

## Event tracking
- `cta_request_catalog_click`, `form_request_catalog_submit`, etc.
- Consistent naming across all forms and CTAs

## Spam mitigation
- Honeypot field (hidden from real users)
- Client-side submission lock to prevent double-submit
- Server-side Zod validation

## Webhook formatting
- Include: source system, form type, inquiry type, normalized fields
- Centralized in `lib/automation/webhook.ts`
- Configs from environment variables (GOHIGHLEVEL_WEBHOOK_URL, etc.)
