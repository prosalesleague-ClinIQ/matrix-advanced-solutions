---
name: nextjs-architecture
description: Use this skill when creating routes, components, APIs, data structures, or large-scale refactors. Protect code organization and production readiness.
---

# Next.js Architecture Skill

## App Router structure
- `app/page.tsx` — homepage
- `app/[route]/page.tsx` — server component with metadata
- `app/[route]/content.tsx` — client component if interactivity needed
- `app/api/[endpoint]/route.ts` — API routes

## Server vs Client
- Default: Server Components
- Client only for: animation, forms, 3D, local UI state, browser APIs
- Never mark entire page trees as client unnecessarily

## Component organization
- `components/ui/` — primitive reusable (Button, Card, Input, Badge, etc.)
- `components/sections/` — page-level sections (Hero, WhyMatrix, FinalCTA)
- `components/forms/` — form components
- `components/three/` — 3D/R3F components
- `components/layout/` — Header, Footer

## Data layer
- `data/` for typed mock data, navigation config, trust content, FAQs
- Don't hardcode business copy in components

## Metadata
- Every route: title, description, OG basics
- Use template: `%s | Matrix Advanced Solutions`
- Clinic-facing B2B framing, no keyword stuffing

## Form architecture
- React Hook Form + Zod schemas in `lib/forms/validation.ts`
- Shared payload formatting via `lib/forms/submit.ts`
- UTM parsing via `lib/analytics/utm.ts`
- Event tracking via `lib/analytics/track.ts`

## API routes
- Return `{ success: boolean, message: string }`
- Validate with Zod, dispatch to webhooks, log structured data
- Never leak implementation details to UI

## TypeScript
- No `any` unless unavoidable
- Explicit types for payloads and data models
- Import order: framework → external → internal aliases → local

## Future provider portal
- Keep public routes separate from future auth surfaces
- Structure data so catalog gating can be added later
