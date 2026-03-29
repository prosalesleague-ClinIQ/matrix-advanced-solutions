---
name: apple-product-unveil
description: Build an Apple-style cinematic product unveil sequence with dark stage, product emergence, orbiting label, zoom, and glow — vanilla JS, no frameworks.
---

# Apple Product Unveil Skill

## Concept
A cinematic product reveal inspired by Apple keynote aesthetics: dark stage, dramatic lighting, the product emerging from darkness, an orbiting detail element, and a final hero zoom with halo glow.

## Animation Architecture
- Self-contained vanilla JS module using requestAnimationFrame
- Single linear progress value (0-1) drives all phases
- No external animation libraries — pure math and DOM transforms
- Overlay covers full viewport, removed after sequence completes

## Phase Breakdown

### Phase 1 — Dark Stage (0-15%)
- Full black overlay, opacity 1
- Sets cinematic tone before anything appears

### Phase 2 — Product Emergence (0-25%)
- Product fades in (opacity 0 → 1) and scales up (0.85 → 1.0)
- Smooth ease-out curve
- Centered in viewport

### Phase 3 — Label Orbit (15-65%)
- Label element appears and traces an elliptical path around the product
- 2.5 full rotations (Math.PI * 5)
- Elliptical Y compression (0.3) for perspective depth
- Label scales and fades in during first quarter, holds, then fades out

### Phase 4 — Label Dock (65-80%)
- Label shrinks toward product center
- Opacity fades to 0
- Simulates the label "wrapping onto" the bottle

### Phase 5 — Hero Zoom (70-85%)
- Product scales from 1.0 → 1.25
- Slow, confident zoom for dramatic close-up
- Overlaps slightly with label dock for seamless transition

### Phase 6 — Settle Back (85-95%)
- Product eases from 1.25 → 1.15
- Gentle pullback prevents the zoom from feeling abrupt

### Phase 7 — Glow Halo (50-85%)
- Radial gradient glow builds behind the product
- Purple center → indigo mid → cyan edge
- Max opacity 0.65
- Fades out after peak

### Phase 8 — Hold and Exit (95-100%)
- Hold final frame briefly
- Overlay fades out, revealing the page beneath

## Responsive Rules
- Desktop: 4200ms animation + 900ms hold
- Mobile: 3200ms animation + 900ms hold
- Orbit radius: 240px desktop, 160px mobile
- Detect via `window.innerWidth < 768`

## Session Control
- Store completion in `sessionStorage` (clears on tab close)
- Skip unveil if already played this session
- Always provide a skip button (bottom-right corner)

## Performance
- Use `will-change: transform, opacity` on animated elements
- Remove will-change after animation completes
- Use CSS containment on overlay
- No layout thrashing — batch reads before writes in rAF loop

## Accessibility
- `aria-hidden="true"` on overlay during animation
- Skip button is keyboard-focusable
- Respect `prefers-reduced-motion`: show a brief fade-in instead
- Hard timeout (7s) ensures overlay never traps the user

## File Structure
```
product-unveil.js    — Animation logic (rAF loop, phase math, DOM updates)
product-unveil.css   — Overlay, product, label, glow element styling
```

## Integration
- CSS `<link>` in document `<head>`
- JS `<script>` before closing `</body>`
- Overlay div injected by JS on DOMContentLoaded
- Overlay removed from DOM after fade-out completes
