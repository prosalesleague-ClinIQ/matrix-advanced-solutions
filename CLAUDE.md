# Matrix Advanced Solutions

## Project
Premium, cinematic, enterprise-grade website for Matrix Advanced Solutions — the infrastructure behind modern clinic growth.

## Tech stack
- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Framer Motion, React Three Fiber, Drei
- React Hook Form, Zod, Lucide React
- clsx, tailwind-merge

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm run typecheck # TypeScript check
```

## Architecture rules
- Default to Server Components. Use `'use client'` only for interactivity, animation, forms, 3D.
- Pages are thin shells — compose from `components/sections/` and `components/ui/`.
- Data lives in `data/`. Do not hardcode business copy in components.
- Forms use React Hook Form + Zod. Payloads formatted via `lib/forms/submit.ts`.
- API routes in `app/api/`. Webhook dispatch via `lib/automation/webhook.ts`.
- Analytics via `lib/analytics/track.ts`. UTM via `lib/analytics/utm.ts`.

## Design system rules
- Dark-first: navy-950, steel grays, restrained blue/cyan accents.
- Typography: Inter. Strong headline hierarchy (4xl–7xl hero, 2xl–5xl section, base–lg body).
- Spacing: py-24 to py-32 desktop sections. max-w-7xl content, max-w-4xl narrative.
- Cards: rounded-2xl, subtle border, hover lift. No flat lifeless cards.
- CTAs: Primary=filled blue, Secondary=ghost/outline, Tertiary=text link.
- Motion: Framer Motion for reveals. Restrained, directional, cinematic. Always support reduced-motion.

## Protected routes
- `/peptide-map` — flagship education destination. Do not flatten.
- `/musclelock` — flagship product storytelling. Do not flatten.

## Compliance language
Always use: "Professional use only", "For qualified clinics and providers", "Subject to credentialing and approval".

## Brand voice
Premium, direct, credible, clinic-facing, enterprise. No hype, no consumer supplement tone.
