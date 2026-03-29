---
name: seo-analytics
description: Use this skill when creating or editing route metadata, analytics events, internal links, schema, or page-level discoverability.
---

# SEO and Analytics Skill

## Metadata per route
- title (concise, mentions Matrix or page value)
- description (communicates value, avoids hype)
- OG basics where useful
- Template: `%s | Matrix Advanced Solutions`

## Heading hierarchy
- One H1 per page
- Clean H1 → H2 → H3 descent
- Don't skip levels for visual styling

## Schema (where valuable)
- Organization, WebSite on homepage
- BreadcrumbList on inner pages
- FAQPage on FAQ sections
- No fake medical schema

## Internal linking
- Strategic links between: home, solutions, catalog, growth, onboarding, contact
- Link flagship pages (Peptide Map, MuscleLock) where relevant

## CTA event naming
- `cta_request_catalog_click`
- `cta_book_strategy_call_click`
- `cta_start_clinic_onboarding_click`

## Form event naming
- `form_[name]_start`, `form_[name]_submit`, `form_[name]_success`, `form_[name]_failure`

## Source attribution
- Page source, CTA source, UTM params, landing page, inquiry type
- All captured via `lib/analytics/utm.ts` and `lib/analytics/track.ts`

## SEO themes
clinic growth infrastructure, provider solutions, premium clinic support, peptide/exosome clinic partner, clinic onboarding, strategic category expansion
