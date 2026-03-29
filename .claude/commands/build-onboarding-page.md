# Build Onboarding Page

## Funnel logic
1. Hero — "Start Your Partnership with Matrix"
2. What's Included — 4 cards (credentialing, category, account team, orientation)
3. Timeline — 4 steps (submit → review → setup → first order)
4. Form — full onboarding form with Zod validation
5. FAQ — 7 questions from data/faqs.ts

## Reassurance content
- "5–10 business days" timeline
- "Our team will review and follow up"
- "Subject to credentialing and approval"
- Clear next-step communication

## Form behavior
- OnboardingForm component from components/forms/
- Validates: clinicName, contactName, role, clinicType, email, phone, state, providerCount
- Honeypot spam protection
- Success state with green checkmark and next-step message
- Error state with retry path

## FAQ guidance
- Who qualifies, timeline, what's included, minimums, category expansion, marketing, compliance

## Next-step communication
- Success: "Onboarding team will review within 1–2 business days"
- Clear, specific, trust-building
