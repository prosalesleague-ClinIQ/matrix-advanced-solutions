---
name: product-stage-lighting
description: Create dramatic stage lighting effects for product reveals using radial gradients, glow halos, and timed opacity builds — CSS and JS, no WebGL required.
---

# Product Stage Lighting Skill

## Concept
Cinematic product photography lighting recreated in the browser. A dark stage with carefully timed gradient glows that build atmosphere, direct attention, and elevate perceived product value — all without WebGL or canvas.

## Dark Stage Foundation
- Background: `#000` or near-black (`#0a0a0a`)
- Full viewport overlay with `position: fixed; inset: 0`
- All lighting effects are layered elements or pseudo-elements
- Stage persists throughout the animation, fades out at the end

## Glow Halo System

### Structure
- Single absolutely-positioned element behind the product
- `border-radius: 50%` for circular shape
- Sized at 1.5-2x the product dimensions

### Gradient
```css
background: radial-gradient(
  circle,
  rgba(147, 51, 234, 0.65) 0%,     /* purple center */
  rgba(79, 70, 229, 0.4) 35%,       /* indigo mid */
  rgba(6, 182, 212, 0.15) 65%,      /* cyan edge */
  transparent 100%
);
```

### Timing
- Begins building at 50% of animation progress
- Reaches max opacity at 75-80%
- Holds briefly, then fades with the overlay exit
- Use `opacity` animation only — gradient is static

## Ambient Light Layers

### Rim Light (optional)
- Thin bright edge on one side of the product
- Achieved via `box-shadow` or a positioned gradient strip
- Suggests a directional key light

### Under-glow (optional)
- Subtle reflection pool beneath the product
- Elliptical gradient, low opacity (0.1-0.2)
- Compressed Y scale for floor-reflection perspective

## Color Palette
| Role | Color | Opacity Range |
|------|-------|--------------|
| Primary glow | Purple (#9333ea) | 0.3 - 0.65 |
| Mid transition | Indigo (#4f46e5) | 0.2 - 0.4 |
| Edge accent | Cyan (#06b6d4) | 0.1 - 0.25 |
| Rim highlight | White (#ffffff) | 0.05 - 0.15 |

## Timing Integration
- Glow should complement, not compete with, product motion
- Start glow build after the product is visible (not during dark stage)
- Peak glow should coincide with hero zoom moment
- Glow fade should track overlay exit

## Responsive Adjustments
- Desktop: full glow radius, all layers active
- Mobile: reduce glow size, skip rim light, lower opacity ceiling by 20%
- Tablet: intermediate values

## Performance
- Use `opacity` transitions only — no animating gradient stops
- `will-change: opacity` on glow element during animation
- Remove glow element from DOM after overlay exits
- No blur filters (expensive) — achieve softness via gradient spread

## Accessibility
- Glow is decorative — no semantic content
- `aria-hidden="true"` on all lighting elements
- Reduced motion: skip glow animation, show static dim ambient light or nothing
- Ensure text over lit areas maintains WCAG contrast (4.5:1 minimum)

## Anti-patterns
- No full-screen blur or backdrop-filter during animation
- No strobing, pulsing, or flickering effects
- No competing light sources that fight for attention
- Glow should feel like a single coherent light, not multiple overlapping blobs
