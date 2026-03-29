---
name: bottle-label-wrap
description: Animate a product label orbiting and wrapping onto a bottle using elliptical motion paths, scale transitions, and perspective compression.
---

# Bottle Label Wrap Skill

## Concept
A floating product label traces an elliptical orbit around a bottle, simulating the label wrapping onto the product. The motion conveys premium craftsmanship — the label "finds" its product and locks into place.

## Orbit Mechanics

### Elliptical Path
- X position: `centerX + radius * cos(angle)`
- Y position: `centerY + radius * yCompression * sin(angle)`
- Y compression factor: 0.3 (creates perspective-correct ellipse)
- Total rotation: 2.5 turns (Math.PI * 5)

### Radius
- Desktop: 240px
- Mobile: 160px
- Breakpoint: 768px

### Speed Curve
- Starts slow, accelerates through middle orbits, decelerates on final approach
- Use eased progress mapped to angle: `easeInOutCubic(t) * totalAngle`

## Label Element

### Sizing
- Optimized WebP source: 1200px wide (full wrap artwork)
- Display size: ~180px wide desktop, ~120px mobile
- Aspect ratio preserved, no distortion

### Opacity Lifecycle
1. Fade in (0 → 1) during first quarter-orbit
2. Hold at full opacity through middle orbits
3. Fade out (1 → 0) as label docks to bottle center

### Scale Lifecycle
1. Start at 0.6, scale up to 1.0 during first orbit
2. Hold at 1.0 through middle
3. Shrink to 0.3 as it docks, simulating perspective collapse

## Docking Phase
- Label moves toward bottle center point
- Both position offset and size reduce simultaneously
- Opacity reaches 0 as scale reaches minimum
- Creates the illusion of the label conforming to the bottle surface

## Z-Ordering
- Label renders above bottle during front-of-orbit (sin > 0)
- Label renders behind bottle during back-of-orbit (sin < 0)
- Use `z-index` toggling at the crossing points for depth realism

## Image Assets
```
bottle-hero.png    — Transparent bottle, 600px tall, centered
label-wrap.webp    — Optimized label artwork, 1200px
label-wrap.png     — Original source (fallback / editing)
```

## Performance Notes
- Use `transform: translate3d()` for GPU compositing
- Avoid animating `left`/`top` — use transforms only
- Pre-calculate orbit positions if possible
- `will-change: transform, opacity` during animation, remove after

## Fallback
- Reduced motion: skip orbit, show label already on bottle
- WebGL not required — this is pure CSS transform animation
