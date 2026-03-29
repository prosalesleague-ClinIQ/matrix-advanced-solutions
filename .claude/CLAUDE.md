# Claude Code — Matrix Project

## Skills
Use `.claude/skills/` for domain guidance:
- `design-system/` — visual identity, spacing, cards, CTAs, motion
- `nextjs-architecture/` — routing, components, data, API patterns
- `3d-motion/` — animation, 3D scenes, performance, fallbacks
- `forms-automation/` — forms, webhooks, tracking, payloads
- `seo-analytics/` — metadata, events, schema, internal links
- `accessibility-performance/` — a11y, perf, reduced motion, Lighthouse
- `brand-copy/` — voice, tone, compliance, CTA writing

## Commands
Use `.claude/commands/` for page-level build guidance:
- `build-homepage.md` — homepage section order and requirements
- `build-solutions-page.md` — solutions page structure
- `build-catalog-page.md` — B2B catalog rules
- `build-growth-page.md` — growth infrastructure page
- `build-onboarding-page.md` — onboarding funnel
- `build-contact-page.md` — contact routing and forms
- `run-preflight.md` — pre-deploy checks
- `run-conversion-audit.md` — conversion review

## Key patterns
- `lib/utils.ts` — cn() helper
- `lib/forms/submit.ts` — submitLead(), formatWebhookPayload()
- `lib/analytics/track.ts` — trackEvent(), trackCTA(), trackFormSubmit()
- `lib/analytics/utm.ts` — parseUTMParams(), getPageContext()
- `lib/automation/webhook.ts` — sendToWebhook(), buildWebhookConfigs()

## Quality bar
- No `any` types
- Semantic HTML
- Keyboard accessible
- Reduced motion support
- Mobile-first responsive
- Compliance language on every conversion surface
