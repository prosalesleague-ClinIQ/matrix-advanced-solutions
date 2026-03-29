# Build Homepage

## Section order (exact)
1. Cinematic hero with 3D scene
2. Enterprise capability strip (10 items)
3. Why Matrix (6 cards)
4. Fly-through ecosystem experience (6 stages)
5. Solutions preview (6 categories)
6. Growth infrastructure preview (6 pillars)
7. Catalog preview (8 category cards)
8. Trust and standards (6 items)
9. Final CTA (3 buttons)

## Hero requirements
- Headline: "The Infrastructure Behind Modern Clinic Growth"
- Animated 3D network background via `components/three/hero-scene.tsx`
- Suspense fallback via `components/three/scene-fallback.tsx`
- CTA hierarchy: Request Catalog (primary) → Book Strategy Call (secondary)
- Reduced-motion fallback: static gradient
- Mobile: legible headline, CTAs above fold, simplified motion

## 3D requirements
- React Three Fiber canvas with network nodes + central orb
- 40 nodes max, connections under distance threshold 4
- Slow rotation, breathing scale on orb
- dpr [1, 1.5], low geometry, no performance issues

## Trust checkpoints
- Hero: "Professional use only" note
- Capability strip: communicates breadth
- Why Matrix: communicates strategic value
- Trust section: compliance, standards, partnership
- Final CTA: credentialing note

## Mobile behavior
- Hero text stacks naturally, CTAs full-width on small screens
- Capability strip becomes 2-column grid
- Cards stack to single column below sm breakpoint
- 3D scene simplified or replaced on reduced-motion
